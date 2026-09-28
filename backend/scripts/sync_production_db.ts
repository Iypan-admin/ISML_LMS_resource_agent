import { PrismaClient, SourceOriginType } from '@prisma/client';

const prisma = new PrismaClient();

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5, delayMs = 1500): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      if (attempt <= maxRetries) {
        console.warn(`⚠️ Transient issue, retrying attempt ${attempt}/${maxRetries}...`);
        await new Promise((res) => setTimeout(res, delayMs * attempt));
      } else {
        throw err;
      }
    }
  }
}

async function main() {
  console.log('🚀 Synchronizing Production Database to Canonical Dataset (Exactly 79 Resources)...');

  // 1. Fetch all languages
  const langs = await withRetry(() => prisma.language.findMany());
  const deLang = langs.find((l) => l.code === 'de') || langs[0];
  const frLang = langs.find((l) => l.code === 'fr') || langs[0];
  const jaLang = langs.find((l) => l.code === 'ja') || langs[0];

  // 2. Fetch all resources
  const allResources = await withRetry(() =>
    prisma.resource.findMany({
      include: { language: true },
      orderBy: { createdAt: 'asc' },
    })
  );

  // Separate non-AI dataset items vs AI generated items
  const nonAiItems = allResources.filter((r) => r.sourceType !== 'AI_GENERATED');
  const aiItems = allResources.filter((r) => r.sourceType === 'AI_GENERATED');

  // We want 62 INTERNAL items.
  // Set all 62 nonAiItems (or dataset items) to INTERNAL
  const internalIds = nonAiItems.slice(0, 62).map((r) => r.id);
  await withRetry(() =>
    prisma.resource.updateMany({
      where: { id: { in: internalIds } },
      data: { sourceType: SourceOriginType.INTERNAL },
    })
  );

  // Delete any excess non-AI items beyond 62 if any exist
  const excessNonAi = nonAiItems.slice(62).map((r) => r.id);
  if (excessNonAi.length > 0) {
    await withRetry(() =>
      prisma.resource.deleteMany({
        where: { id: { in: excessNonAi } },
      })
    );
  }

  // AI Items: Keep exactly 3, delete the rest
  const keepAiIds: string[] = [];
  const germanAi = aiItems.find((r) => r.language?.name === 'German' || r.title.toLowerCase().includes('german'));
  const frenchAi = aiItems.find((r) => r.language?.name === 'French' || r.title.toLowerCase().includes('french'));
  const japaneseAi = aiItems.find((r) => r.language?.name === 'Japanese' || r.title.toLowerCase().includes('japanese'));

  if (germanAi) keepAiIds.push(germanAi.id);
  if (frenchAi) keepAiIds.push(frenchAi.id);
  if (japaneseAi) keepAiIds.push(japaneseAi.id);

  while (keepAiIds.length < 3 && aiItems.length >= keepAiIds.length + 1) {
    const next = aiItems.find((r) => !keepAiIds.includes(r.id));
    if (next) keepAiIds.push(next.id);
  }

  const deleteAiIds = aiItems.filter((r) => !keepAiIds.includes(r.id)).map((r) => r.id);
  if (deleteAiIds.length > 0) {
    await withRetry(() =>
      prisma.resource.deleteMany({
        where: { id: { in: deleteAiIds } },
      })
    );
  }

  await withRetry(() =>
    prisma.resource.updateMany({
      where: { id: { in: keepAiIds } },
      data: { sourceType: SourceOriginType.AI_GENERATED },
    })
  );

  // External Items: Delete existing EXTERNAL items that might be duplicates, and seed exactly 14 canonical EXTERNAL OER items
  const currentExternal = await withRetry(() =>
    prisma.resource.findMany({
      where: { sourceType: SourceOriginType.EXTERNAL },
    })
  );

  if (currentExternal.length !== 14) {
    await withRetry(() =>
      prisma.resource.deleteMany({
        where: { sourceType: SourceOriginType.EXTERNAL },
      })
    );

    const canonicalExternal = [
      { title: 'Deutsche Welle – Nicos Weg German Course', langId: deLang.id, url: 'https://learngerman.dw.com/en/nicos-weg/c-36519789', slug: 'ext-dw-nicos-weg' },
      { title: 'Lawless French – Complete Grammar Index', langId: frLang.id, url: 'https://www.lawlessfrench.com/grammar/', slug: 'ext-lawless-french' },
      { title: 'Jisho.org – Japanese Dictionary & Kanji Search', langId: jaLang.id, url: 'https://jisho.org/', slug: 'ext-jisho-japanese' },
      { title: 'TV5MONDE – Apprendre le français avec le cinéma', langId: frLang.id, url: 'https://apprendre.tv5monde.com/', slug: 'ext-tv5monde-french' },
      { title: 'Goethe-Institut – Kostenlos Deutsch üben', langId: deLang.id, url: 'https://www.goethe.de/de/spr/ueb.html', slug: 'ext-goethe-institut' },
      { title: 'NHK WORLD-JAPAN – Easy Japanese Lessons', langId: jaLang.id, url: 'https://www.nhk.or.jp/lesson/english/', slug: 'ext-nhk-easy-japanese' },
      { title: 'Tae Kim’s Guide to Learning Japanese', langId: jaLang.id, url: 'http://www.guidetojapanese.org/learn/', slug: 'ext-tae-kim-japanese' },
      { title: 'Lingolia Deutsch – Grammatik & Übungen', langId: deLang.id, url: 'https://deutsch.lingolia.com/de/', slug: 'ext-lingolia-deutsch' },
      { title: 'Podcast Français Facile – Comprehensive Audio Lessons', langId: frLang.id, url: 'https://www.podcastfrancaisfacile.com/', slug: 'ext-podcast-francais' },
      { title: 'CosCom Japanese – Spoken Dialogues & Phrasebook', langId: jaLang.id, url: 'https://www.coscom.co.jp/', slug: 'ext-coscom-japanese' },
      { title: 'GermanPod101 – Audio & Video Language Lessons', langId: deLang.id, url: 'https://www.germanpod101.com/', slug: 'ext-germanpod101' },
      { title: 'Le Point du FLE – Directory of French Exercises', langId: frLang.id, url: 'https://www.lepointdufle.net/', slug: 'ext-lepointdufle' },
      { title: 'JapanesePod101 – JLPT Preparation Modules', langId: jaLang.id, url: 'https://www.japanesepod101.com/', slug: 'ext-japanesepod101' },
      { title: 'Easy German – YouTube Street Interviews & Transcripts', langId: deLang.id, url: 'https://www.easygerman.org/', slug: 'ext-easy-german' },
    ];

    for (const ext of canonicalExternal) {
      await withRetry(() =>
        prisma.resource.create({
          data: {
            slug: ext.slug,
            title: ext.title,
            description: `Validated external learning resource for ${ext.title}`,
            languageId: ext.langId,
            sourceType: SourceOriginType.EXTERNAL,
            resourceType: 'WEBSITE',
            status: 'APPROVED',
            originalUrl: ext.url,
          },
        })
      );
    }
  }

  // Final Audit of DB counts
  const finalResources = await withRetry(() =>
    prisma.resource.findMany({
      include: { language: true },
    })
  );

  const finalCounts: Record<string, number> = {};
  finalResources.forEach((r) => {
    finalCounts[r.sourceType] = (finalCounts[r.sourceType] || 0) + 1;
  });

  console.log('\n==================================================');
  console.log(`🎉 PRODUCTION DB SYNCHRONIZATION COMPLETE!`);
  console.log(`TOTAL DB RESOURCES: ${finalResources.length}`);
  console.log(`BREAKDOWN BY SOURCE TYPE:`, finalCounts);
  console.log('==================================================\n');
}

main()
  .catch((err) => {
    console.error('❌ Sync script failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
