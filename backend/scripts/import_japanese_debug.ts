import { PrismaClient, ContributorRole, ResourceStatus, SourceType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function calculateUrlHash(url: string): string {
  return crypto.createHash('sha256').update(url.trim().toLowerCase()).digest('hex');
}

async function main() {
  const jaLang = await prisma.language.findFirst({
    where: { OR: [{ code: 'ja' }, { name: 'Japanese' }] }
  });
  console.log('Japanese Language in DB:', jaLang);

  if (!jaLang) {
    console.error('Japanese language NOT found in DB!');
    return;
  }

  const jaPath = path.join(__dirname, 'resource-import/data/japanese.json');
  const rows = JSON.parse(fs.readFileSync(jaPath, 'utf8'));
  console.log(`Loaded ${rows.length} Japanese rows.`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const originalUrl = row.link.trim();
    const urlHash = calculateUrlHash(originalUrl);
    const slug = `${row.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')}-${urlHash.slice(0, 8)}`;

    const existing = await prisma.resource.findFirst({
      where: { OR: [{ urlHash }, { slug }] }
    });

    if (existing) {
      console.log(`[${i+1}/${rows.length}] Reused existing: ${row.title}`);
      continue;
    }

    // Resolve or create source
    const domain = new URL(originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`).hostname.replace(/^www\./, '');
    let source = await prisma.source.findFirst({
      where: { domain: { equals: domain, mode: 'insensitive' } }
    });

    if (!source) {
      source = await prisma.source.create({
        data: {
          name: row.title,
          domain,
          baseUrl: `https://${domain}`,
          sourceType: 'WEB_PORTAL'
        }
      });
    }

    // Create Resource
    const created = await prisma.resource.create({
      data: {
        slug,
        title: row.title,
        description: row.purpose,
        languageId: jaLang.id,
        sourceId: source.id,
        sourceType: SourceType.WEB_PORTAL,
        resourceType: 'WEBSITE',
        status: ResourceStatus.PENDING_REVIEW,
        originalUrl,
        canonicalUrl: originalUrl,
        normalizedUrl: originalUrl,
        urlHash,
        authorName: row.tutorName,
      }
    });

    console.log(`[${i+1}/${rows.length}] CREATED Japanese Resource: ${created.title} (ID: ${created.id})`);
  }

  const finalJaCount = await prisma.resource.count({
    where: { languageId: jaLang.id }
  });
  console.log(`✅ FINAL Japanese Resource Count in DB: ${finalJaCount}`);
}

main().finally(() => prisma.$disconnect());
