import { PrismaClient } from '@prisma/client';
import { ResourcesService } from '../src/modules/resources/resources.service';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function runFailClosedRegressionSuite() {
  console.log('================================================================');
  console.log('COMPREHENSIVE REGRESSION: STRICT FAIL-CLOSED RLS & STORAGE SUITE');
  console.log('================================================================\n');

  const tenantAlpha = 'inst_reg_alpha_' + Date.now();
  const tenantBeta = 'inst_reg_beta_' + Date.now();
  const resAlphaId = crypto.randomUUID();
  const resBetaId = crypto.randomUUID();
  const resGlobalId = crypto.randomUUID();
  const chunkAlphaId = crypto.randomUUID();

  try {
    const resourcesService = new ResourcesService(prisma as any, {} as any);
    const lang = await prisma.language.findFirst();
    if (!lang) throw new Error('Language not found');

    // 0. Seed test records using superuser bypass flag app.is_system_admin = 'true'
    console.log('--- SEEDING: Controlled Test Records ---');
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SELECT set_config('app.is_system_admin', 'true', true);`);

      // Alpha Private Resource
      await tx.$executeRawUnsafe(`
        INSERT INTO resources (
          id, slug, title, description, "resourceType", "languageId", "tenantId", "isGlobal", "approvalStatus", "updatedAt"
        ) VALUES (
          $1, $2, 'Alpha Proprietary Blueprint', 'Secret Alpha', 'PDF', $3, $4, false, 'APPROVED', NOW()
        );
      `, resAlphaId, `alpha-res-${Date.now()}`, lang.id, tenantAlpha);

      // Beta Private Resource
      await tx.$executeRawUnsafe(`
        INSERT INTO resources (
          id, slug, title, description, "resourceType", "languageId", "tenantId", "isGlobal", "approvalStatus", "updatedAt"
        ) VALUES (
          $1, $2, 'Beta Standard Document', 'Standard Beta', 'PDF', $3, $4, false, 'APPROVED', NOW()
        );
      `, resBetaId, `beta-res-${Date.now()}`, lang.id, tenantBeta);

      // Global Approved Resource
      await tx.$executeRawUnsafe(`
        INSERT INTO resources (
          id, slug, title, description, "resourceType", "languageId", "tenantId", "isGlobal", "approvalStatus", "updatedAt"
        ) VALUES (
          $1, $2, 'Global Official Curriculum Framework', 'Shared Public', 'PDF', $3, 'inst_isml_global', true, 'APPROVED', NOW()
        );
      `, resGlobalId, `global-res-${Date.now()}`, lang.id);

      // Vector chunk linked to Alpha Resource
      await tx.$executeRawUnsafe(`
        INSERT INTO session_vector_chunks (
          id, "resourceId", "sourceType", "sourceTitle", "chunkIndex", "totalChunks", content, "tokenCount",
          language, "cefrLevel", "embeddingProvider", "embeddingModel", "embeddingVersion",
          "embeddingDimension", embedding, "createdAt"
        ) VALUES (
          $1, $2, 'PDF', 'Alpha Secret Text', 0, 1, 'Classified pedagogical contents for Alpha school', 10,
          'German', 'A1', 'GEMINI', 'gemini-embedding-001', 'v1.0', 768,
          (SELECT array_fill(0.01::float4, ARRAY[768]))::vector, NOW()
        );
      `, chunkAlphaId, resAlphaId);
    });
    console.log('  [OK] Seeded Alpha, Beta, Global Resources and Alpha Vector Chunk.');

    // -------------------------------------------------------------
    // TEST 1: Missing Tenant Context (NULL) -> MUST BE DENIED
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Missing Tenant Context (NULL) -> DENY ---');
    const missingContextRead: any[] = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      // Do not set app.current_tenant_id at all
      return tx.$queryRawUnsafe(`SELECT id, title, "tenantId" FROM resources WHERE id = $1;`, resAlphaId);
    });
    console.log(`  Querying Alpha record with NULL context: returned ${missingContextRead.length} rows.`);
    console.log(`  [${missingContextRead.length === 0 ? 'PASSED' : 'FAILED'}] Missing context blocked? ${missingContextRead.length === 0 ? 'YES (0 ROWS RETURNED - FAIL CLOSED)' : 'NO (LEAK)'}`);
    if (missingContextRead.length > 0) throw new Error('FAIL-OPEN BREACH: Missing tenant context leaked records');

    // -------------------------------------------------------------
    // TEST 2: Empty Tenant Context ('') -> MUST BE DENIED
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Empty Tenant Context (\'\') -> DENY ---');
    const emptyContextRead: any[] = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', '', true);`);
      return tx.$queryRawUnsafe(`SELECT id, title, "tenantId" FROM resources WHERE id = $1;`, resAlphaId);
    });
    console.log(`  Querying Alpha record with empty string context: returned ${emptyContextRead.length} rows.`);
    console.log(`  [${emptyContextRead.length === 0 ? 'PASSED' : 'FAILED'}] Empty string context blocked? ${emptyContextRead.length === 0 ? 'YES (0 ROWS RETURNED)' : 'NO (LEAK)'}`);
    if (emptyContextRead.length > 0) throw new Error('FAIL-OPEN BREACH: Empty tenant context leaked records');

    // -------------------------------------------------------------
    // TEST 3: Invalid Tenant Context -> MUST BE DENIED
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Invalid Tenant Context -> DENY ---');
    const invalidContextRead: any[] = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', 'invalid_nonexistent_tenant', true);`);
      return tx.$queryRawUnsafe(`SELECT id, title, "tenantId" FROM resources WHERE id = $1;`, resAlphaId);
    });
    console.log(`  Querying Alpha record with invalid tenant context: returned ${invalidContextRead.length} rows.`);
    console.log(`  [${invalidContextRead.length === 0 ? 'PASSED' : 'FAILED'}] Invalid context blocked? ${invalidContextRead.length === 0 ? 'YES (0 ROWS RETURNED)' : 'NO (LEAK)'}`);
    if (invalidContextRead.length > 0) throw new Error('RLS VIOLATION: Invalid tenant context accessed record');

    // -------------------------------------------------------------
    // TEST 4: Cross-Tenant SELECT (Beta querying Alpha) -> MUST BE DENIED
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Cross-Tenant SELECT (Tenant Beta reading Alpha) -> DENY ---');
    const crossSelectRead: any[] = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true);`, tenantBeta);
      return tx.$queryRawUnsafe(`SELECT id, title, "tenantId" FROM resources WHERE id = $1;`, resAlphaId);
    });
    console.log(`  Tenant Beta querying Alpha record: returned ${crossSelectRead.length} rows.`);
    console.log(`  [${crossSelectRead.length === 0 ? 'PASSED' : 'FAILED'}] Cross-tenant SELECT blocked? ${crossSelectRead.length === 0 ? 'YES (0 ROWS RETURNED)' : 'NO (LEAK)'}`);
    if (crossSelectRead.length > 0) throw new Error('RLS VIOLATION: Cross-tenant SELECT succeeded');

    // -------------------------------------------------------------
    // TEST 5: Cross-Tenant INSERT (Beta spoofing Alpha's tenantId) -> REJECTED
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Cross-Tenant INSERT (Beta inserting with Alpha tenantId) -> REJECTED ---');
    let crossInsertBlocked = false;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
        await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true);`, tenantBeta);
        await tx.$executeRawUnsafe(`
          INSERT INTO resources (
            id, slug, title, description, "resourceType", "languageId", "tenantId", "isGlobal", "approvalStatus", "updatedAt"
          ) VALUES (
            $1, $2, 'Illegal Injected Record', 'exploit', 'PDF', $3, $4, false, 'APPROVED', NOW()
          );
        `, crypto.randomUUID(), `spoof-${Date.now()}`, lang.id, tenantAlpha);
      });
    } catch (err: any) {
      if (err.message.includes('violates row-level security policy') || err.message.includes('42501')) {
        crossInsertBlocked = true;
        console.log(`  Kernel Error: "${err.message.split('\n').pop()}"`);
      }
    }
    console.log(`  [${crossInsertBlocked ? 'PASSED' : 'FAILED'}] Cross-tenant INSERT rejected by WITH CHECK? ${crossInsertBlocked ? 'YES (POSTGRESQL REJECTED)' : 'NO (BREACH)'}`);
    if (!crossInsertBlocked) throw new Error('RLS VIOLATION: Cross-tenant INSERT succeeded');

    // -------------------------------------------------------------
    // TEST 6: Cross-Tenant UPDATE (Beta trying to update Alpha record) -> 0 ROWS
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Cross-Tenant UPDATE (Beta updating Alpha) -> 0 ROWS ---');
    const crossUpdateResult = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true);`, tenantBeta);
      return tx.$executeRawUnsafe(`UPDATE resources SET title = 'Compromised' WHERE id = $1;`, resAlphaId);
    });
    console.log(`  Tenant Beta attempting to UPDATE Alpha record: updated ${crossUpdateResult} rows.`);
    console.log(`  [${crossUpdateResult === 0 ? 'PASSED' : 'FAILED'}] Cross-tenant UPDATE blocked? ${crossUpdateResult === 0 ? 'YES (0 ROWS AFFECTED)' : 'NO (TAMPERED)'}`);
    if (crossUpdateResult > 0) throw new Error('RLS VIOLATION: Cross-tenant UPDATE succeeded');

    // -------------------------------------------------------------
    // TEST 7: Cross-Tenant DELETE (Beta trying to delete Alpha record) -> 0 ROWS
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Cross-Tenant DELETE (Beta deleting Alpha) -> 0 ROWS ---');
    const crossDeleteResult = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true);`, tenantBeta);
      return tx.$executeRawUnsafe(`DELETE FROM resources WHERE id = $1;`, resAlphaId);
    });
    console.log(`  Tenant Beta attempting to DELETE Alpha record: deleted ${crossDeleteResult} rows.`);
    console.log(`  [${crossDeleteResult === 0 ? 'PASSED' : 'FAILED'}] Cross-tenant DELETE blocked? ${crossDeleteResult === 0 ? 'YES (0 ROWS DELETED)' : 'NO (DELETED)'}`);
    if (crossDeleteResult > 0) throw new Error('RLS VIOLATION: Cross-tenant DELETE succeeded');

    // -------------------------------------------------------------
    // TEST 8: Cross-Tenant Vector Chunk Retrieval -> 0 CHUNKS
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Cross-Tenant Vector Retrieval (Beta searching Alpha chunk) -> 0 CHUNKS ---');
    const crossVectorRead: any[] = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true);`, tenantBeta);
      return tx.$queryRawUnsafe(`
        SELECT svc.id, svc.content 
        FROM session_vector_chunks svc 
        WHERE svc.id = $1;
      `, chunkAlphaId);
    });
    console.log(`  Tenant Beta querying Alpha vector chunk: returned ${crossVectorRead.length} chunks.`);
    console.log(`  [${crossVectorRead.length === 0 ? 'PASSED' : 'FAILED'}] Cross-tenant vector chunk blocked by RLS? ${crossVectorRead.length === 0 ? 'YES (0 CHUNKS LEAKED)' : 'NO (LEAK)'}`);
    if (crossVectorRead.length > 0) throw new Error('RLS VIOLATION: Cross-tenant vector chunk leaked');

    // -------------------------------------------------------------
    // TEST 9: Manipulated Storage Object Keys -> REJECTED
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: Manipulated Storage Key Upload (Beta inserting Alpha path) -> REJECTED ---');
    let manipulatedKeyBlocked = false;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
        await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true);`, tenantBeta);
        await tx.$executeRawUnsafe(`
          INSERT INTO storage.objects (
            id, bucket_id, name, owner, created_at, updated_at, last_accessed_at
          ) VALUES (
            $1::uuid, 'isml-knowledge-vault', $2, NULL, NOW(), NOW(), NOW()
          );
        `, crypto.randomUUID(), `${tenantAlpha}/manipulated_exploit.pdf`);
      });
    } catch (err: any) {
      if (err.message.includes('violates row-level security policy') || err.message.includes('42501')) {
        manipulatedKeyBlocked = true;
        console.log(`  Kernel Error: "${err.message.split('\n').pop()}"`);
      }
    }
    console.log(`  [${manipulatedKeyBlocked ? 'PASSED' : 'FAILED'}] Manipulated storage key rejected by storage RLS? ${manipulatedKeyBlocked ? 'YES (POSTGRESQL REJECTED)' : 'NO (BREACH)'}`);
    if (!manipulatedKeyBlocked) throw new Error('Storage RLS failed to reject manipulated path');

    // -------------------------------------------------------------
    // TEST 10: Unauthorized Signed URL Generation -> 403 DENIED
    // -------------------------------------------------------------
    console.log('\n--- TEST 10: Unauthorized Signed URL Generation -> 403 DENIED ---');
    let signedUrlDenied = false;
    try {
      await resourcesService.getPresignedUrl(resAlphaId, tenantBeta);
    } catch (err: any) {
      if (err.message.includes('Access denied to resource in isolated tenant')) {
        signedUrlDenied = true;
      }
    }
    console.log(`  [${signedUrlDenied ? 'PASSED' : 'FAILED'}] Cross-tenant signed URL rejected? ${signedUrlDenied ? 'YES (403 DENIED)' : 'NO (LEAK)'}`);
    if (!signedUrlDenied) throw new Error('Unauthorized signed URL generated');

    // -------------------------------------------------------------
    // TEST 11: Spoofed system_admin in app.current_tenant_id -> MUST BE DENIED
    // -------------------------------------------------------------
    console.log('\n--- TEST 11: Client Spoofing app.current_tenant_id = \'system_admin\' -> DENIED ---');
    // An attacker attempts to set app.current_tenant_id = 'system_admin' to bypass isolation.
    // Our policy requires current_setting('app.is_system_admin', true) = 'true', NOT app.current_tenant_id!
    const spoofedAdminRead: any[] = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', 'system_admin', true);`);
      return tx.$queryRawUnsafe(`SELECT id, title FROM resources WHERE id = $1;`, resAlphaId);
    });
    console.log(`  Attacker setting app.current_tenant_id = 'system_admin': returned ${spoofedAdminRead.length} rows.`);
    console.log(`  [${spoofedAdminRead.length === 0 ? 'PASSED' : 'FAILED'}] Spoofed admin string blocked? ${spoofedAdminRead.length === 0 ? 'YES (0 ROWS RETURNED - ATTACK FAILED)' : 'NO (BYPASS)'}`);
    if (spoofedAdminRead.length > 0) throw new Error('SECURITY BYPASS: app.current_tenant_id = system_admin bypassed RLS');

    // -------------------------------------------------------------
    // TEST 12: Global Resource Read / Write Rules
    // -------------------------------------------------------------
    console.log('\n--- TEST 12: Global Resource Read / Write Rules ---');
    // 12a: Read global approved resource as Tenant Beta
    const globalRead: any[] = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true);`, tenantBeta);
      return tx.$queryRawUnsafe(`SELECT id, title, "isGlobal" FROM resources WHERE id = $1;`, resGlobalId);
    });
    console.log(`  Tenant Beta reading approved global resource: returned ${globalRead.length} rows.`);
    console.log(`  [${globalRead.length === 1 ? 'PASSED' : 'FAILED'}] Global resource readable? ${globalRead.length === 1 ? 'YES (ACCESSIBLE)' : 'NO (BLOCKED)'}`);

    // 12b: Tenant Beta attempting to UPDATE global resource -> MUST BE BLOCKED
    let globalUpdateBlocked = false;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
        await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true);`, tenantBeta);
        const rows = await tx.$executeRawUnsafe(`UPDATE resources SET title = 'Defaced Global' WHERE id = $1;`, resGlobalId);
        if (rows === 0) globalUpdateBlocked = true;
      });
    } catch (err: any) {
      if (err.message.includes('violates row-level security policy') || err.message.includes('42501')) {
        globalUpdateBlocked = true;
        console.log(`  Kernel Error: "${err.message.split('\n').pop()}"`);
      }
    }
    console.log(`  [${globalUpdateBlocked ? 'PASSED' : 'FAILED'}] Global resource write-protected against regular tenant? ${globalUpdateBlocked ? 'YES (POSTGRESQL WITH CHECK REJECTED)' : 'NO (DEFACED)'}`);
    if (!globalUpdateBlocked) throw new Error('SECURITY VIOLATION: Regular tenant updated global resource');

    console.log('\n================================================================');
    console.log('STRICT FAIL-CLOSED REGRESSION: ALL 12 SECURITY GATES PASSED (100%)');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ FAIL-CLOSED REGRESSION FAILED:', err);
    throw err;
  } finally {
    console.log('Cleaning up seed test records...');
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SELECT set_config('app.is_system_admin', 'true', true);`);
      await tx.$executeRawUnsafe(`DELETE FROM session_vector_chunks WHERE id = $1;`, chunkAlphaId);
      await tx.$executeRawUnsafe(`DELETE FROM resources WHERE id IN ($1, $2, $3);`, resAlphaId, resBetaId, resGlobalId);
    });
    await prisma.$disconnect();
    console.log('Cleanup complete.');
  }
}

runFailClosedRegressionSuite()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
