import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function runDatabaseRlsIsolationTest() {
  console.log('================================================================');
  console.log('SECURITY VERIFICATION: POSTGRESQL ENGINE RLS ISOLATION SUITE');
  console.log('================================================================\n');

  const tenantAlpha = 'inst_rls_alpha_' + Date.now();
  const tenantBeta = 'inst_rls_beta_' + Date.now();
  const resAlphaId = crypto.randomUUID();
  const resBetaId = crypto.randomUUID();

  try {
    const lang = await prisma.language.findFirst();
    if (!lang) throw new Error('Language not found');

    // 1. Provision Seed Records using admin context (without restricted role)
    console.log('--- STEP 1: Seeding Private Tenant Records ---');
    await prisma.$executeRawUnsafe(`
      INSERT INTO resources (
        id, slug, title, description, "resourceType", "languageId", "tenantId", "isGlobal", "approvalStatus", "updatedAt"
      ) VALUES (
        $1, $2, 'Alpha Proprietary Blueprint', 'Alpha secret', 'PDF', $3, $4, false, 'APPROVED', NOW()
      );
    `, resAlphaId, `alpha-res-${Date.now()}`, lang.id, tenantAlpha);

    await prisma.$executeRawUnsafe(`
      INSERT INTO resources (
        id, slug, title, description, "resourceType", "languageId", "tenantId", "isGlobal", "approvalStatus", "updatedAt"
      ) VALUES (
        $1, $2, 'Beta Standard Document', 'Beta doc', 'PDF', $3, $4, false, 'APPROVED', NOW()
      );
    `, resBetaId, `beta-res-${Date.now()}`, lang.id, tenantBeta);

    console.log(`  [OK] Seeded Alpha Resource: ${resAlphaId} (tenant: ${tenantAlpha})`);
    console.log(`  [OK] Seeded Beta Resource:  ${resBetaId} (tenant: ${tenantBeta})`);

    // 2. TEST 1: Cross-Tenant SELECT Under Restricted Role 'authenticated'
    console.log('\n--- TEST 1: Cross-Tenant SELECT Under authenticated Role ---');
    // We execute inside an isolated transaction setting ROLE to authenticated and tenant to Beta
    const crossSelectResult: any[] = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true);`, tenantBeta);
      return tx.$queryRawUnsafe(`SELECT id, title, "tenantId" FROM resources WHERE id = $1;`, resAlphaId);
    });

    console.log(`  Querying Alpha resource as Tenant Beta: returned ${crossSelectResult.length} rows.`);
    console.log(`  [PASSED] Cross-tenant read blocked by DB kernel RLS? ${crossSelectResult.length === 0 ? 'YES (0 ROWS RETURNED)' : 'NO (LEAK)'}`);
    if (crossSelectResult.length > 0) throw new Error('RLS VIOLATION: Cross-tenant row read succeeded');

    // 3. TEST 2: Legitimate Tenant SELECT Under Restricted Role
    console.log('\n--- TEST 2: Legitimate Tenant SELECT Under authenticated Role ---');
    const legitSelectResult: any[] = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true);`, tenantBeta);
      return tx.$queryRawUnsafe(`SELECT id, title, "tenantId" FROM resources WHERE id = $1;`, resBetaId);
    });

    console.log(`  Querying Beta resource as Tenant Beta: returned ${legitSelectResult.length} row(s).`);
    console.log(`  [PASSED] Legitimate read permitted by DB kernel RLS? ${legitSelectResult.length === 1 ? 'YES (ACCESSIBLE)' : 'NO (BLOCKED)'}`);
    if (legitSelectResult.length !== 1) throw new Error('RLS VIOLATION: Legitimate tenant read failed');

    // 4. TEST 3: Cross-Tenant UPDATE Under Restricted Role
    console.log('\n--- TEST 3: Cross-Tenant UPDATE Under authenticated Role ---');
    const updateResult = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true);`, tenantBeta);
      return tx.$executeRawUnsafe(`UPDATE resources SET title = 'Tampered' WHERE id = $1;`, resAlphaId);
    });

    console.log(`  Tenant Beta attempting to UPDATE Alpha resource: updated ${updateResult} rows.`);
    console.log(`  [PASSED] Cross-tenant update blocked by DB kernel RLS? ${updateResult === 0 ? 'YES (0 ROWS AFFECTED)' : 'NO (TAMPERED)'}`);
    if (updateResult > 0) throw new Error('RLS VIOLATION: Cross-tenant row update succeeded');

    // 5. TEST 4: Cross-Tenant DELETE Under Restricted Role
    console.log('\n--- TEST 4: Cross-Tenant DELETE Under authenticated Role ---');
    const deleteResult = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true);`, tenantBeta);
      return tx.$executeRawUnsafe(`DELETE FROM resources WHERE id = $1;`, resAlphaId);
    });

    console.log(`  Tenant Beta attempting to DELETE Alpha resource: deleted ${deleteResult} rows.`);
    console.log(`  [PASSED] Cross-tenant delete blocked by DB kernel RLS? ${deleteResult === 0 ? 'YES (0 ROWS DELETED)' : 'NO (DELETED)'}`);
    if (deleteResult > 0) throw new Error('RLS VIOLATION: Cross-tenant row delete succeeded');

    // 6. TEST 5: Spoofed INSERT Under Restricted Role (WITH CHECK violation)
    console.log('\n--- TEST 5: Spoofed INSERT with Mismatched tenantId ---');
    let insertBlocked = false;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
        await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true);`, tenantBeta);
        await tx.$executeRawUnsafe(`
          INSERT INTO resources (
            id, slug, title, description, "resourceType", "languageId", "tenantId", "isGlobal", "approvalStatus", "updatedAt"
          ) VALUES (
            $1, $2, 'Illegal Spoofed Doc', 'desc', 'PDF', $3, $4, false, 'APPROVED', NOW()
          );
        `, crypto.randomUUID(), `spoof-${Date.now()}`, lang.id, tenantAlpha); // Trying to insert with Alpha's tenantId!
      });
    } catch (err: any) {
      if (err.message.includes('violates row-level security policy') || err.message.includes('42501')) {
        insertBlocked = true;
        console.log(`  Intercepted Expected Kernel Error: "${err.message.split('\n').pop()}"`);
      }
    }

    console.log(`  [PASSED] Cross-tenant spoofed INSERT blocked by DB kernel WITH CHECK? ${insertBlocked ? 'YES (POSTGRESQL REJECTED)' : 'NO (BREACH)'}`);
    if (!insertBlocked) throw new Error('RLS VIOLATION: Spoofed INSERT succeeded without RLS violation');

    console.log('\n================================================================');
    console.log('POSTGRESQL ENGINE RLS ISOLATION: 100% EMPIRICALLY VERIFIED');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ RLS Isolation Test Failed:', err);
    throw err;
  } finally {
    console.log('Cleaning up RLS test seed records...');
    await prisma.$executeRawUnsafe(`DELETE FROM resources WHERE id IN ($1, $2);`, resAlphaId, resBetaId);
    await prisma.$disconnect();
    console.log('Cleanup complete.');
  }
}

runDatabaseRlsIsolationTest()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

