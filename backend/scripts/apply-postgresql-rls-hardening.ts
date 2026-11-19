import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyRlsHardening() {
  console.log('================================================================');
  console.log('SECURITY HARDENING: POSTGRESQL ROW LEVEL SECURITY (RLS) POLICIES');
  console.log('================================================================\n');

  try {
    // 1. Grant table access to 'authenticated' role
    console.log('--- 1. Granting Table Permissions to authenticated Role ---');
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO authenticated;`);
    await prisma.$executeRawUnsafe(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;`);
    await prisma.$executeRawUnsafe(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;`);
    console.log('  [OK] Permissions granted to authenticated role.');

    // 2. Enable Row Level Security on all tenant-owned tables
    const tenantTables = [
      'resources',
      'master_curriculums',
      'curriculum_modules',
      'curriculum_periods',
      'curriculum_period_resources',
      'session_packages',
      'session_vector_chunks',
    ];

    console.log('\n--- 2. Enabling RLS on Core Tenant Tables ---');
    for (const table of tenantTables) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`  [OK] RLS enabled on table: ${table}`);
    }

    // 3. Drop existing policies if any to ensure clean idempotent state
    console.log('\n--- 3. Configuring Idempotent RLS Policies ---');
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS rls_resources_tenant_policy ON resources;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS rls_master_curriculums_tenant_policy ON master_curriculums;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS rls_curriculum_modules_tenant_policy ON curriculum_modules;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS rls_curriculum_periods_tenant_policy ON curriculum_periods;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS rls_session_packages_tenant_policy ON session_packages;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS rls_session_vector_chunks_tenant_policy ON session_vector_chunks;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS rls_storage_vault_tenant_policy ON storage.objects;`);

    // 4. Create RLS Policy for 'resources'
    await prisma.$executeRawUnsafe(`
      CREATE POLICY rls_resources_tenant_policy ON resources
      FOR ALL
      TO authenticated, postgres, service_role
      USING (
        NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
        OR current_setting('app.current_tenant_id', true) = 'system_admin'
        OR "tenantId" = current_setting('app.current_tenant_id', true)
        OR ("isGlobal" = true AND "approvalStatus" = 'APPROVED')
      )
      WITH CHECK (
        NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
        OR current_setting('app.current_tenant_id', true) = 'system_admin'
        OR "tenantId" = current_setting('app.current_tenant_id', true)
      );
    `);
    console.log('  [OK] Policy created on resources.');

    // 5. Create RLS Policy for 'master_curriculums'
    await prisma.$executeRawUnsafe(`
      CREATE POLICY rls_master_curriculums_tenant_policy ON master_curriculums
      FOR ALL
      TO authenticated, postgres, service_role
      USING (
        NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
        OR current_setting('app.current_tenant_id', true) = 'system_admin'
        OR "tenantId" = current_setting('app.current_tenant_id', true)
      )
      WITH CHECK (
        NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
        OR current_setting('app.current_tenant_id', true) = 'system_admin'
        OR "tenantId" = current_setting('app.current_tenant_id', true)
      );
    `);
    console.log('  [OK] Policy created on master_curriculums.');

    // 6. Create RLS Policy for 'session_packages'
    await prisma.$executeRawUnsafe(`
      CREATE POLICY rls_session_packages_tenant_policy ON session_packages
      FOR ALL
      TO authenticated, postgres, service_role
      USING (
        NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
        OR current_setting('app.current_tenant_id', true) = 'system_admin'
        OR "tenantId" = current_setting('app.current_tenant_id', true)
      )
      WITH CHECK (
        NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
        OR current_setting('app.current_tenant_id', true) = 'system_admin'
        OR "tenantId" = current_setting('app.current_tenant_id', true)
      );
    `);
    console.log('  [OK] Policy created on session_packages.');

    // 7. Create RLS Policy for 'curriculum_modules' (via parent master_curriculums)
    await prisma.$executeRawUnsafe(`
      CREATE POLICY rls_curriculum_modules_tenant_policy ON curriculum_modules
      FOR ALL
      TO authenticated, postgres, service_role
      USING (
        NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
        OR current_setting('app.current_tenant_id', true) = 'system_admin'
        OR EXISTS (
          SELECT 1 FROM master_curriculums mc
          WHERE mc.id = curriculum_modules."curriculumId"
            AND mc."tenantId" = current_setting('app.current_tenant_id', true)
        )
      )
      WITH CHECK (
        NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
        OR current_setting('app.current_tenant_id', true) = 'system_admin'
        OR EXISTS (
          SELECT 1 FROM master_curriculums mc
          WHERE mc.id = curriculum_modules."curriculumId"
            AND mc."tenantId" = current_setting('app.current_tenant_id', true)
        )
      );
    `);
    console.log('  [OK] Policy created on curriculum_modules.');

    // 8. Create RLS Policy for 'session_vector_chunks'
    await prisma.$executeRawUnsafe(`
      CREATE POLICY rls_session_vector_chunks_tenant_policy ON session_vector_chunks
      FOR ALL
      TO authenticated, postgres, service_role
      USING (
        NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
        OR current_setting('app.current_tenant_id', true) = 'system_admin'
        OR EXISTS (
          SELECT 1 FROM resources r
          WHERE r.id = session_vector_chunks."resourceId"
            AND (r."tenantId" = current_setting('app.current_tenant_id', true) OR (r."isGlobal" = true AND r."approvalStatus" = 'APPROVED'))
        )
        OR EXISTS (
          SELECT 1 FROM session_packages sp
          WHERE sp.id = session_vector_chunks."sessionId"
            AND sp."tenantId" = current_setting('app.current_tenant_id', true)
        )
      );
    `);
    console.log('  [OK] Policy created on session_vector_chunks.');

    // 9. Storage RLS Policy on storage.objects for isml-knowledge-vault
    console.log('\n--- 4. Configuring Supabase Storage RLS Policy on storage.objects ---');
    await prisma.$executeRawUnsafe(`
      CREATE POLICY rls_storage_vault_tenant_policy ON storage.objects
      FOR ALL
      TO authenticated, postgres, service_role
      USING (
        bucket_id = 'isml-knowledge-vault'
        AND (
          NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
          OR current_setting('app.current_tenant_id', true) = 'system_admin'
          OR split_part(name, '/', 1) = current_setting('app.current_tenant_id', true)
          OR split_part(name, '/', 1) = 'inst_isml_global'
        )
      )
      WITH CHECK (
        bucket_id = 'isml-knowledge-vault'
        AND (
          NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
          OR current_setting('app.current_tenant_id', true) = 'system_admin'
          OR split_part(name, '/', 1) = current_setting('app.current_tenant_id', true)
        )
      );
    `);
    console.log('  [OK] Storage Policy created on storage.objects.');

    console.log('\n================================================================');
    console.log('POSTGRESQL RLS HARDENING SUCCESSFULLY APPLIED ACROSS ALL TIERS');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ Failed to apply RLS hardening:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

applyRlsHardening()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
