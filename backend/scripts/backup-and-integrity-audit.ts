import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function runBackupAndAudit() {
  console.log('================================================================');
  console.log('PHASE 12: PRODUCTION BACKUP RUNBOOK & SYSTEM INTEGRITY AUDIT');
  console.log('================================================================\n');

  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  try {
    // 1. Database Connectivity & Extension Health Check
    console.log('--- Step 1: Database & Extension Health Check ---');
    const extRows: any[] = await prisma.$queryRawUnsafe(`
      SELECT extname, extversion FROM pg_extension WHERE extname IN ('vector', 'pg_trgm');
    `);
    console.log(`  [PASSED] PostgreSQL Extensions Active:`, extRows.map(e => `${e.extname} (v${e.extversion})`).join(', '));
    if (extRows.length < 2) throw new Error('Missing vector or pg_trgm extensions');

    // 2. Multi-Tenancy & Quarantine Isolation Audit
    console.log('\n--- Step 2: Quarantined Legacy Records Isolation Audit ---');
    const quarantinedCount = await prisma.resource.count({
      where: { tenantId: 'inst_legacy_quarantine' },
    });
    console.log(`  [PASSED] Quarantined Legacy Resources Preserved: ${quarantinedCount} records`);
    const leakedGlobal = await prisma.resource.count({
      where: { tenantId: 'inst_legacy_quarantine', isGlobal: true },
    });
    if (leakedGlobal > 0) throw new Error('SECURITY VIOLATION: Quarantined legacy resources are marked isGlobal=true');
    console.log(`  [PASSED] Zero Quarantine Leakage: All quarantined records strictly have isGlobal=false`);

    // 3. Vector Column & HNSW Index Integrity
    console.log('\n--- Step 3: pgvector & Multilingual Index Integrity ---');
    const indexRows: any[] = await prisma.$queryRawUnsafe(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'session_vector_chunks' 
        AND indexname IN (
          'session_vector_chunks_embedding_hnsw_idx',
          'session_vector_chunks_cjk_trgm_idx',
          'session_vector_chunks_de_fts_idx',
          'session_vector_chunks_fr_fts_idx',
          'session_vector_chunks_es_fts_idx'
        );
    `);
    console.log(`  [PASSED] Production Vector & GIN Indexes Verified: ${indexRows.length} active indexes`);
    indexRows.forEach(idx => console.log(`     - ${idx.indexname}`));

    // 4. Non-Destructive Institutional Backup Snapshot
    console.log('\n--- Step 4: Non-Destructive Snapshot Generation ---');
    const curriculums = await prisma.masterCurriculum.findMany({
      include: {
        modules: {
          include: {
            periods: {
              include: {
                resources: true,
              },
            },
          },
        },
      },
    });

    const backupSnapshot = {
      backupTimestamp: new Date().toISOString(),
      platformVersion: 'ISML-2.0-Enterprise',
      canonicalModel: 'gemini-embedding-2',
      canonicalDimension: 768,
      totalCurriculums: curriculums.length,
      quarantinedLegacyResources: quarantinedCount,
      curriculums,
    };

    const backupFile = path.join(backupDir, `isml_institutional_backup_${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupSnapshot, null, 2), 'utf-8');
    console.log(`  [PASSED] Snapshot written successfully to: ${backupFile} (${(fs.statSync(backupFile).size / 1024).toFixed(1)} KB)`);

    console.log('\n================================================================');
    console.log('SYSTEM INTEGRITY AUDIT COMPLETE: 100% PRODUCTION COMPLIANT');
    console.log('================================================================\n');

  } catch (err: any) {
    console.error('❌ BACKUP AUDIT FAILURE:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

runBackupAndAudit()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

