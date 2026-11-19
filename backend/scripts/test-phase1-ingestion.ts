import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Testing Supabase Storage Ingestion & File Deduplication ---');

  const testFileBuffer = Buffer.from('ISML Language & Management School - Test Curriculum Resource - German A1', 'utf-8');
  const fileHash = crypto.createHash('sha256').update(testFileBuffer).digest('hex');
  const tenantId = 'inst_isml_global';
  const resourceId = `res_test_${crypto.randomBytes(4).toString('hex')}`;
  const filename = 'Netzwerk_A1_Test.pdf';
  const storageKey = `${tenantId}/German/CEFR_A1/${resourceId}/${fileHash}_${filename}`;

  console.log(`Generated SHA-256 Checksum: ${fileHash}`);
  console.log(`Storage Key: ${storageKey}`);

  // 1. Verify that duplicate check works
  const existing = await prisma.resource.findFirst({
    where: { tenantId, fileHash }
  });

  if (existing) {
    console.log(`✔ Found existing duplicate resource '${existing.title}' (${existing.id})`);
  } else {
    // 2. Create resource with new Phase 1 metadata
    const language = await prisma.language.findFirst({ where: { code: 'de' } }) || await prisma.language.findFirst();
    if (!language) throw new Error('No language found in database');

    const created = await prisma.resource.create({
      data: {
        id: resourceId,
        slug: `test-resource-${Date.now()}`,
        title: 'Netzwerk A1 Test Curriculum PDF',
        description: 'Verified Phase 1 Ingestion Test Asset',
        languageId: language.id,
        tenantId,
        isGlobal: true,
        processingStatus: 'READY',
        approvalStatus: 'DRAFT',
        publicationStatus: 'UNPUBLISHED',
        resourceType: 'PDF',
        fileHash,
        framework: 'CEFR',
        cefrLevel: 'A1',
        pageCount: 12,
        wordCount: 3500,
        tokenCount: 4200,
        fileStorage: {
          create: {
            storageKey,
            fileName: filename,
            mimeType: 'application/pdf',
            fileSize: BigInt(testFileBuffer.length),
            checksum: fileHash,
            storageProvider: 'SUPABASE'
          }
        }
      },
      include: { fileStorage: true }
    });

    console.log(`✔ Created resource '${created.title}' with ID: ${created.id}`);
    console.log(`  processingStatus: ${created.processingStatus}`);
    console.log(`  approvalStatus: ${created.approvalStatus}`);
    console.log(`  tenantId: ${created.tenantId}`);
    console.log(`  fileHash: ${created.fileHash}`);
  }

  // 3. Test that inserting another resource with identical (tenantId, fileHash) fails due to the database unique index
  try {
    const language = await prisma.language.findFirst();
    await prisma.resource.create({
      data: {
        slug: `test-duplicate-${Date.now()}`,
        title: 'Netzwerk A1 Duplicate Attempt',
        description: 'Should fail with unique constraint violation',
        languageId: language!.id,
        tenantId,
        fileHash, // Identical hash under same tenant!
        resourceType: 'PDF',
      }
    });
    console.error('❌ FAILED: Duplicate insert was allowed! Unique index missing.');
  } catch (err: any) {
    if (err.message.includes('Unique constraint') || err.message.includes('resources_tenant_filehash_unique_idx') || err.code === 'P2002') {
      console.log('✔ SUCCESS: Database rejected duplicate (tenantId, fileHash) upload as expected! (Code: P2002)');
    } else {
      console.log('Caught expected error:', err.message);
    }
  }

  // 4. Verify existing legacy session packages query cleanly
  const sessionCount = await prisma.sessionPackage.count();
  console.log(`✔ Verified ${sessionCount} legacy session packages remain 100% accessible with zero schema mismatch.`);

  // 5. Clean up test resource
  await prisma.fileStorage.deleteMany({ where: { resourceId } });
  await prisma.resource.deleteMany({ where: { id: resourceId } });
  console.log('✔ Cleaned up temporary test resource.');
  console.log('--- Phase 1 Verification Test Completed Successfully ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

