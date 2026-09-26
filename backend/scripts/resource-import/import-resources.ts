import { PrismaClient, ResourceStatus, SourceOriginType, ContributorRole } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { validateRawRow, RawResourceRow } from './resource-validator';
import {
  calculateUrlHash,
  extractDomain,
  mapCEFRLevels,
  mapResourceType,
  generateCategorySlug,
  generateSlug,
} from './resource-mapper';

const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delayMs = 1000): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const isNetworkErr =
        err.message?.includes("Can't reach database server") ||
        err.message?.includes('P1001') ||
        err.message?.includes('ETIMEDOUT') ||
        err.message?.includes('ECONNRESET') ||
        err.message?.includes('Connection terminated');

      if (isNetworkErr && attempt <= maxRetries) {
        console.warn(`⚠️ Transient database connection issue (attempt ${attempt}/${maxRetries}). Retrying in ${delayMs * attempt}ms...`);
        await new Promise((res) => setTimeout(res, delayMs * attempt));
      } else {
        throw err;
      }
    }
  }
}

interface RowReconciliation {
  rowIdx: number;
  language: string;
  tutor: string;
  title: string;
  url: string;
  resourceId: string;
  resourceAction: 'CREATED' | 'REUSED';
  contributorId: string;
  contributionAction: 'CREATED' | 'REUSED';
  status: string;
}

interface ImportMetrics {
  germanInputRows: number;
  frenchInputRows: number;
  japaneseInputRows: number;
  totalInputRows: number;

  validRows: number;
  invalidRows: number;

  createdResources: number;
  existingResources: number;
  updatedResources: number;

  createdContributors: number;
  existingContributors: number;

  createdContributions: number;
  existingContributions: number;

  createdSources: number;
  existingSources: number;

  resourceLevelsCreated: number;
  resourceCategoriesCreated: number;

  unmappedLevels: number;
  unmappedCategories: number;
  unmappedResourceTypes: number;

  duplicateRows: number;
  failedRows: number;
  dbWrites: number;

  reconciliation: RowReconciliation[];
}

async function runImporter() {
  const prisma = new PrismaClient();
  console.log(`\n==================================================`);
  console.log(`🚀 ISML RESOURCE PLATFORM — BULK RESOURCE IMPORTER`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (Zero DB Writes)' : 'PRODUCTION DB WRITE'}`);
  console.log(`==================================================\n`);

  const metrics: ImportMetrics = {
    germanInputRows: 0,
    frenchInputRows: 0,
    japaneseInputRows: 0,
    totalInputRows: 0,
    validRows: 0,
    invalidRows: 0,
    createdResources: 0,
    existingResources: 0,
    updatedResources: 0,
    createdContributors: 0,
    existingContributors: 0,
    createdContributions: 0,
    existingContributions: 0,
    createdSources: 0,
    existingSources: 0,
    resourceLevelsCreated: 0,
    resourceCategoriesCreated: 0,
    unmappedLevels: 0,
    unmappedCategories: 0,
    unmappedResourceTypes: 0,
    duplicateRows: 0,
    failedRows: 0,
    dbWrites: 0,
    reconciliation: [],
  };

  try {
    // 1. Load JSON datasets
    const dataDir = path.join(__dirname, 'data');
    const germanFile = path.join(dataDir, 'german.json');
    const frenchFile = path.join(dataDir, 'french.json');
    const japaneseFile = path.join(dataDir, 'japanese.json');

    const germanRows: RawResourceRow[] = fs.existsSync(germanFile) ? JSON.parse(fs.readFileSync(germanFile, 'utf-8')) : [];
    const frenchRows: RawResourceRow[] = fs.existsSync(frenchFile) ? JSON.parse(fs.readFileSync(frenchFile, 'utf-8')) : [];
    const japaneseRows: RawResourceRow[] = fs.existsSync(japaneseFile) ? JSON.parse(fs.readFileSync(japaneseFile, 'utf-8')) : [];

    metrics.germanInputRows = germanRows.length;
    metrics.frenchInputRows = frenchRows.length;
    metrics.japaneseInputRows = japaneseRows.length;
    metrics.totalInputRows = metrics.germanInputRows + metrics.frenchInputRows + metrics.japaneseInputRows;

    console.log(`📊 Datasets Loaded: German (${metrics.germanInputRows}), French (${metrics.frenchInputRows}), Japanese (${metrics.japaneseInputRows}) -> Total: ${metrics.totalInputRows} rows\n`);

    // 2. Fetch or Ensure Canonical Language Master Records (German, French, Japanese)
    const canonicalLanguages = [
      { code: 'de', name: 'German', nativeName: 'Deutsch', flagEmoji: '🇩🇪' },
      { code: 'fr', name: 'French', nativeName: 'Français', flagEmoji: '🇫🇷' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flagEmoji: '🇯🇵' },
    ];

    if (!isDryRun) {
      for (const lang of canonicalLanguages) {
        await withRetry(() =>
          prisma.language.upsert({
            where: { code: lang.code },
            create: lang,
            update: {},
          }),
        );
      }
    }

    const languages = await withRetry(() => prisma.language.findMany());
    const levels = await withRetry(() => prisma.level.findMany());
    const categories = await withRetry(() => prisma.category.findMany());

    const langMap = new Map<string, string>(); // 'german' -> id
    languages.forEach((l) => {
      langMap.set(l.name.toLowerCase(), l.id);
      langMap.set(l.code.toLowerCase(), l.id);
    });

    const levelMap = new Map<string, string>(); // 'A1' -> id
    levels.forEach((lvl) => {
      levelMap.set(lvl.code, lvl.id);
    });

    const categoryMap = new Map<string, string>(); // slug -> id
    categories.forEach((cat) => {
      categoryMap.set(cat.slug, cat.id);
      categoryMap.set(cat.code, cat.id);
      categoryMap.set(cat.name.toLowerCase(), cat.id);
    });

    const datasets = [
      { lang: 'German', rows: germanRows },
      { lang: 'French', rows: frenchRows },
      { lang: 'Japanese', rows: japaneseRows },
    ];

    let overallRowIdx = 0;

    for (const dataset of datasets) {
      for (const row of dataset.rows) {
        overallRowIdx++;

        try {
          // Step A: Validate row
          const validation = validateRawRow(row);
          if (!validation.isValid) {
            metrics.invalidRows++;
            metrics.failedRows++;
            console.error(`❌ Row ${overallRowIdx} [${dataset.lang}] Validation Failed: ${validation.errors.join(', ')}`);
            continue;
          }

          metrics.validRows++;

          // Step B: Resolve Language
          const langKey = row.language.toLowerCase();
          const languageId = langMap.get(langKey) || langMap.get(dataset.lang.toLowerCase());
          if (!languageId) {
            metrics.failedRows++;
            console.error(`❌ Row ${overallRowIdx} [${dataset.lang}] Language '${row.language}' not found in database master table`);
            continue;
          }

          // Step C: URL & Hash Resolution
          const originalUrl = row.link.trim();
          const urlHash = calculateUrlHash(originalUrl);

          // Step D: Resolve or Create Contributor (Robust Upsert with retry)
          const tutorName = row.tutorName.trim();
          let contributorId = '';
          let contributorAction: 'CREATED' | 'REUSED' = 'REUSED';

          const existingContributor = await withRetry(() =>
            prisma.contributor.findFirst({
              where: { name: { equals: tutorName, mode: 'insensitive' } },
            }),
          );

          if (existingContributor) {
            contributorId = existingContributor.id;
            metrics.existingContributors++;
          } else {
            contributorAction = 'CREATED';
            metrics.createdContributors++;
            if (!isDryRun) {
              const newContributor = await withRetry(() =>
                prisma.contributor.create({
                  data: {
                    name: tutorName,
                    role: ContributorRole.TUTOR,
                  },
                }),
              );
              contributorId = newContributor.id;
              metrics.dbWrites++;
            } else {
              contributorId = `dry-run-contrib-${overallRowIdx}`;
            }
          }

          // Step E: Check existing Resource by urlHash or originalUrl
          const existingResource = await withRetry(() =>
            prisma.resource.findFirst({
              where: {
                OR: [
                  { urlHash },
                  { originalUrl },
                ],
              },
              include: {
                contributions: true,
              },
            }),
          );

          // Branch 1: Resource Already Exists in Database
          if (existingResource) {
            metrics.existingResources++;

            // Check if contribution link exists
            const hasContribution = existingResource.contributions.some(
              (c) => c.contributorId === contributorId && c.role === ContributorRole.TUTOR,
            );

            if (hasContribution) {
              metrics.existingContributions++;
              metrics.duplicateRows++;
            } else {
              metrics.createdContributions++;
              if (!isDryRun && contributorId && !contributorId.startsWith('dry-run')) {
                await withRetry(() =>
                  prisma.resourceContribution.upsert({
                    where: {
                      resourceId_contributorId_role: {
                        resourceId: existingResource.id,
                        contributorId,
                        role: ContributorRole.TUTOR,
                      },
                    },
                    create: {
                      resourceId: existingResource.id,
                      contributorId,
                      role: ContributorRole.TUTOR,
                    },
                    update: {},
                  }),
                );
                metrics.dbWrites++;
              }
            }

            metrics.reconciliation.push({
              rowIdx: overallRowIdx,
              language: dataset.lang,
              tutor: tutorName,
              title: row.title,
              url: originalUrl,
              resourceId: existingResource.id,
              resourceAction: 'REUSED',
              contributorId,
              contributionAction: hasContribution ? 'REUSED' : 'CREATED',
              status: existingResource.status,
            });

            continue;
          }

          // Branch 2: Create New Resource
          // Resolve or Create Source by Domain
          const { domain, name: sourceName } = extractDomain(originalUrl);
          let sourceId: string | undefined = undefined;

          const existingSource = await withRetry(() =>
            prisma.source.findFirst({
              where: {
                OR: [
                  { domain: { equals: domain, mode: 'insensitive' } },
                  { name: { equals: sourceName, mode: 'insensitive' } },
                ],
              },
            }),
          );

          if (existingSource) {
            sourceId = existingSource.id;
            metrics.existingSources++;
          } else {
            metrics.createdSources++;
            if (!isDryRun) {
              const newSource = await withRetry(() =>
                prisma.source.create({
                  data: {
                    name: sourceName,
                    domain,
                    baseUrl: `https://${domain}`,
                  },
                }),
              );
              sourceId = newSource.id;
              metrics.dbWrites++;
            }
          }

          // Resolve Category safely
          const catSlug = generateCategorySlug(row.category);
          let categoryId = categoryMap.get(catSlug) || categoryMap.get(row.category.toLowerCase());

          if (!categoryId) {
            const existingDbCat = await withRetry(() =>
              prisma.category.findFirst({
                where: {
                  OR: [
                    { code: { equals: catSlug, mode: 'insensitive' } },
                    { slug: { equals: catSlug, mode: 'insensitive' } },
                    { name: { equals: row.category, mode: 'insensitive' } },
                  ],
                },
              }),
            );

            if (existingDbCat) {
              categoryId = existingDbCat.id;
              categoryMap.set(catSlug, categoryId);
              categoryMap.set(row.category.toLowerCase(), categoryId);
            } else {
              metrics.unmappedCategories++;
              if (!isDryRun) {
                const newCat = await withRetry(() =>
                  prisma.category.create({
                    data: {
                      code: catSlug,
                      name: row.category,
                      slug: catSlug,
                    },
                  }),
                );
                categoryId = newCat.id;
                categoryMap.set(catSlug, categoryId);
                categoryMap.set(row.category.toLowerCase(), categoryId);
                metrics.dbWrites++;
              }
            }
          }

          // Resolve CEFR Levels
          const targetCEFRs = mapCEFRLevels(row.level);
          if (targetCEFRs.length === 0 && row.level && row.level !== 'Not Specified') {
            metrics.unmappedLevels++;
          }

          const levelIdsToLink: string[] = [];
          targetCEFRs.forEach((code) => {
            const lId = levelMap.get(code);
            if (lId) levelIdsToLink.push(lId);
          });

          const resourceType = mapResourceType(row.category, row.title);
          const slug = generateSlug(row.title);

          metrics.createdResources++;
          metrics.createdContributions++;

          let createdResId = `dry-run-res-${overallRowIdx}`;

          if (!isDryRun) {
            const createdRes = await withRetry(() =>
              prisma.resource.create({
                data: {
                  slug,
                  title: row.title,
                  description: row.purpose, // Preserved exact verbatim purpose text
                  languageId,
                  sourceId,
                  sourceType: SourceOriginType.EXTERNAL,
                  resourceType,
                  status: ResourceStatus.PENDING_REVIEW, // Mandatory PENDING_REVIEW governance
                  originalUrl,
                  canonicalUrl: originalUrl,
                  normalizedUrl: originalUrl,
                  urlHash,
                  authorName: tutorName,
                  levels: levelIdsToLink.length
                    ? { create: levelIdsToLink.map((levelId) => ({ levelId })) }
                    : undefined,
                  categories: categoryId
                    ? { create: [{ categoryId }] }
                    : undefined,
                  contributions: contributorId && !contributorId.startsWith('dry-run')
                    ? { create: [{ contributorId, role: ContributorRole.TUTOR }] }
                    : undefined,
                },
              }),
            );

            createdResId = createdRes.id;
            metrics.dbWrites++;
            if (levelIdsToLink.length) metrics.resourceLevelsCreated += levelIdsToLink.length;
            if (categoryId) metrics.resourceCategoriesCreated++;
          }

          metrics.reconciliation.push({
            rowIdx: overallRowIdx,
            language: dataset.lang,
            tutor: tutorName,
            title: row.title,
            url: originalUrl,
            resourceId: createdResId,
            resourceAction: 'CREATED',
            contributorId: contributorId || 'N/A',
            contributionAction: 'CREATED',
            status: 'PENDING_REVIEW',
          });

        } catch (rowErr: any) {
          metrics.failedRows++;
          console.error(`❌ Unexpected Failure on Row ${overallRowIdx} (${row.title}): ${rowErr.message}`);
        }
      }
    }

    // Output Final Execution & Reconciliation Summary
    printExecutionReport(metrics);

    if (metrics.failedRows > 0) {
      throw new Error(`Import failed with ${metrics.failedRows} unhandled failed rows. Zero Data Loss condition violated.`);
    }

    await prisma.$disconnect();
  } catch (err: any) {
    console.error(`\n❌ Fatal Importer Error: ${err.message}`, err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

function printExecutionReport(metrics: ImportMetrics) {
  console.log(`==================================================`);
  console.log(`RESOURCE IMPORT REPORT`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (Simulated)' : 'LIVE DATABASE EXECUTION'}`);
  console.log(`==================================================`);

  console.log(`\nInput Datasets Processed:`);
  console.log(`  German input rows:   ${metrics.germanInputRows}`);
  console.log(`  French input rows:   ${metrics.frenchInputRows}`);
  console.log(`  Japanese input rows: ${metrics.japaneseInputRows}`);
  console.log(`  Total input rows:    ${metrics.totalInputRows}`);

  console.log(`\nRow Validation:`);
  console.log(`  Valid rows:          ${metrics.validRows}`);
  console.log(`  Invalid rows:        ${metrics.invalidRows}`);

  console.log(`\nResource Metrics:`);
  console.log(`  Resources created:   ${metrics.createdResources}`);
  console.log(`  Resources existing:  ${metrics.existingResources}`);
  console.log(`  Total accounted:     ${metrics.createdResources + metrics.existingResources} / ${metrics.totalInputRows}`);

  console.log(`\nTutor Contribution Metrics:`);
  console.log(`  Contributors created:       ${metrics.createdContributors}`);
  console.log(`  Contributors existing:      ${metrics.existingContributors}`);
  console.log(`  Contribution links created: ${metrics.createdContributions}`);
  console.log(`  Contribution links existing:${metrics.existingContributions}`);

  console.log(`\nSource Metrics:`);
  console.log(`  Sources created:     ${metrics.createdSources}`);
  console.log(`  Sources existing:    ${metrics.existingSources}`);

  console.log(`\nJunction Mappings:`);
  console.log(`  Resource levels created:     ${metrics.resourceLevelsCreated}`);
  console.log(`  Resource categories created: ${metrics.resourceCategoriesCreated}`);

  console.log(`\nDiagnostics & Unmapped Warnings:`);
  console.log(`  Unmapped CEFR levels:        ${metrics.unmappedLevels}`);
  console.log(`  Unmapped categories:        ${metrics.unmappedCategories}`);
  console.log(`  Duplicate rows encountered: ${metrics.duplicateRows}`);
  console.log(`  Failed rows:                ${metrics.failedRows}`);

  console.log(`\nDatabase Execution:`);
  console.log(`  Database writes:     ${metrics.dbWrites}`);

  console.log(`\n==================================================`);
  console.log(`ROW-BY-ROW RECONCILIATION SUMMARY (${metrics.reconciliation.length} rows)`);
  console.log(`==================================================`);
  metrics.reconciliation.forEach((r) => {
    console.log(
      `Row #${r.rowIdx.toString().padStart(2, '0')} | [${r.language.padEnd(8)}] | Tutor: ${r.tutor.padEnd(16)} | Res: ${r.resourceAction.padEnd(7)} (${r.resourceId.slice(0, 8)}...) | Contrib: ${r.contributionAction.padEnd(7)} | Status: ${r.status}`,
    );
  });
  console.log(`==================================================\n`);
}

runImporter();
