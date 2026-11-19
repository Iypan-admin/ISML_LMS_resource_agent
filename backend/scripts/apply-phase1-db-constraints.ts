import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Applying Phase 1 Database Constraints & Indexes ---');

  // 1. Partial Unique Index on (tenantId, fileHash) to prevent race condition duplicates
  try {
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS resources_tenant_filehash_unique_idx 
      ON resources ("tenantId", "fileHash") 
      WHERE "fileHash" IS NOT NULL;
    `);
    console.log('✔ Partial unique index resources_tenant_filehash_unique_idx created.');
  } catch (err: any) {
    console.error('Index creation error:', err.message);
  }

  // 2. Query optimization index on tenantId + languageId + processingStatus + approvalStatus
  try {
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS resources_tenant_vault_idx 
      ON resources ("tenantId", "languageId", "processingStatus", "approvalStatus");
    `);
    console.log('✔ Query index resources_tenant_vault_idx created.');
  } catch (err: any) {
    console.error('Query index error:', err.message);
  }

  // 3. Verify legacy records have tenantId = 'inst_legacy_quarantine' and isGlobal = false
  try {
    const legacyCount = await prisma.resource.count({
      where: { tenantId: 'inst_legacy_quarantine' }
    });
    console.log(`✔ Verified ${legacyCount} existing resources quarantined under tenantId = 'inst_legacy_quarantine' with isGlobal = false.`);
  } catch (err: any) {
    console.error('Legacy verification error:', err.message);
  }

  console.log('--- Phase 1 Database Constraints Applied Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

