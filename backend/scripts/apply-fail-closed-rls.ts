import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyFailClosedRls() {
  console.log('================================================================');
  console.log('CRITICAL SECURITY CORRECTION: APPLYING STRICT FAIL-CLOSED RLS');
  console.log('================================================================\n');

  try {
    // 1. Drop existing fail-open policies
    console.log('--- 1. Dropping Existing Policies ---');
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS rls_resources_tenant_policy ON resources;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS rls_master_curriculums_tenant_policy ON master_curriculums;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS rls_curriculum_modules_tenant_policy ON curriculum_modules;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS rls_curriculum_periods_tenant_policy ON curriculum_periods;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS rls_session_packages_tenant_policy ON session_packages;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS rls_session_vector_chunks_tenant_policy ON session_vector_chunks;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS rls_storage_vault_tenant_policy ON storage.objects;`);
    console.log('  [OK] Old policies dropped.');

    // 2. Resources Policy (STRICTLY FAIL-CLOSED)
    // If current_tenant_id is missing, empty, or invalid -> DENIED.
    console.log('\n--- 2. Applying Fail-Closed Policy on resources ---');
    await prisma.$executeRawUnsafe(`
      CREATE POLICY rls_resources_tenant_policy ON resources
      FOR ALL
      TO authenticated, postgres, service_role
      USING (
        (
          NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
          AND "tenantId" = current_setting('app.current_tenant_id', true)
        )
        OR ("isGlobal" = true AND "approvalStatus" = 'APPROVED')
        OR (current_setting('app.is_system_admin', true) = 'true')
      )
      WITH CHECK (
        (
          NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
          AND "tenantId" = current_setting('app.current_tenant_id', true)
        )
        OR (current_setting('app.is_system_admin', true) = 'true')
      );
    `);
    console.log('  [OK] resources fail-closed policy applied.');

    // 3. Master Curriculums Policy (STRICTLY FAIL-CLOSED)
    console.log('\n--- 3. Applying Fail-Closed Policy on master_curriculums ---');
    await prisma.$executeRawUnsafe(`
      CREATE POLICY rls_master_curriculums_tenant_policy ON master_curriculums
      FOR ALL
      TO authenticated, postgres, service_role
      USING (
        (
          NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
          AND "tenantId" = current_setting('app.current_tenant_id', true)
        )
        OR (current_setting('app.is_system_admin', true) = 'true')
      )
      WITH CHECK (
        (
          NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
          AND "tenantId" = current_setting('app.current_tenant_id', true)
        )
        OR (current_setting('app.is_system_admin', true) = 'true')
      );
    `);
    console.log('  [OK] master_curriculums fail-closed policy applied.');

    // 4. Session Packages Policy (STRICTLY FAIL-CLOSED)
    console.log('\n--- 4. Applying Fail-Closed Policy on session_packages ---');
    await prisma.$executeRawUnsafe(`
      CREATE POLICY rls_session_packages_tenant_policy ON session_packages
      FOR ALL
      TO authenticated, postgres, service_role
      USING (
        (
          NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
          AND "tenantId" = current_setting('app.current_tenant_id', true)
        )
        OR (current_setting('app.is_system_admin', true) = 'true')
      )
      WITH CHECK (
        (
          NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
          AND "tenantId" = current_setting('app.current_tenant_id', true)
        )
        OR (current_setting('app.is_system_admin', true) = 'true')
      );
    `);
    console.log('  [OK] session_packages fail-closed policy applied.');

    // 5. Curriculum Modules Policy (STRICTLY FAIL-CLOSED)
    console.log('\n--- 5. Applying Fail-Closed Policy on curriculum_modules ---');
    await prisma.$executeRawUnsafe(`
      CREATE POLICY rls_curriculum_modules_tenant_policy ON curriculum_modules
      FOR ALL
      TO authenticated, postgres, service_role
      USING (
        (
          NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM master_curriculums mc
            WHERE mc.id = curriculum_modules."curriculumId"
              AND mc."tenantId" = current_setting('app.current_tenant_id', true)
          )
        )
        OR (current_setting('app.is_system_admin', true) = 'true')
      )
      WITH CHECK (
        (
          NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM master_curriculums mc
            WHERE mc.id = curriculum_modules."curriculumId"
              AND mc."tenantId" = current_setting('app.current_tenant_id', true)
          )
        )
        OR (current_setting('app.is_system_admin', true) = 'true')
      );
    `);
    console.log('  [OK] curriculum_modules fail-closed policy applied.');

    // 6. Curriculum Periods Policy (STRICTLY FAIL-CLOSED)
    console.log('\n--- 6. Applying Fail-Closed Policy on curriculum_periods ---');
    await prisma.$executeRawUnsafe(`
      CREATE POLICY rls_curriculum_periods_tenant_policy ON curriculum_periods
      FOR ALL
      TO authenticated, postgres, service_role
      USING (
        (
          NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM curriculum_modules cm
            JOIN master_curriculums mc ON mc.id = cm."curriculumId"
            WHERE cm.id = curriculum_periods."moduleId"
              AND mc."tenantId" = current_setting('app.current_tenant_id', true)
          )
        )
        OR (current_setting('app.is_system_admin', true) = 'true')
      )
      WITH CHECK (
        (
          NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM curriculum_modules cm
            JOIN master_curriculums mc ON mc.id = cm."curriculumId"
            WHERE cm.id = curriculum_periods."moduleId"
              AND mc."tenantId" = current_setting('app.current_tenant_id', true)
          )
        )
        OR (current_setting('app.is_system_admin', true) = 'true')
      );
    `);
    console.log('  [OK] curriculum_periods fail-closed policy applied.');

    // 7. Session Vector Chunks Policy (STRICTLY FAIL-CLOSED)
    console.log('\n--- 7. Applying Fail-Closed Policy on session_vector_chunks ---');
    await prisma.$executeRawUnsafe(`
      CREATE POLICY rls_session_vector_chunks_tenant_policy ON session_vector_chunks
      FOR ALL
      TO authenticated, postgres, service_role
      USING (
        (
          NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
          AND (
            EXISTS (
              SELECT 1 FROM resources r
              WHERE r.id = session_vector_chunks."resourceId"
                AND r."tenantId" = current_setting('app.current_tenant_id', true)
            )
            OR EXISTS (
              SELECT 1 FROM session_packages sp
              WHERE sp.id = session_vector_chunks."sessionId"
                AND sp."tenantId" = current_setting('app.current_tenant_id', true)
            )
          )
        )
        OR EXISTS (
          SELECT 1 FROM resources r
          WHERE r.id = session_vector_chunks."resourceId"
            AND r."isGlobal" = true AND r."approvalStatus" = 'APPROVED'
        )
        OR (current_setting('app.is_system_admin', true) = 'true')
      );
    `);
    console.log('  [OK] session_vector_chunks fail-closed policy applied.');

    // 8. Storage Objects Policy on storage.objects (STRICTLY FAIL-CLOSED)
    console.log('\n--- 8. Applying Fail-Closed Policy on storage.objects ---');
    await prisma.$executeRawUnsafe(`
      CREATE POLICY rls_storage_vault_tenant_policy ON storage.objects
      FOR ALL
      TO authenticated, postgres, service_role
      USING (
        bucket_id = 'isml-knowledge-vault'
        AND (
          (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND split_part(name, '/', 1) = current_setting('app.current_tenant_id', true)
          )
          OR split_part(name, '/', 1) = 'inst_isml_global'
          OR (current_setting('app.is_system_admin', true) = 'true')
        )
      )
      WITH CHECK (
        bucket_id = 'isml-knowledge-vault'
        AND (
          (
            NULLIF(current_setting('app.current_tenant_id', true), '') IS NOT NULL
            AND split_part(name, '/', 1) = current_setting('app.current_tenant_id', true)
          )
          OR (current_setting('app.is_system_admin', true) = 'true')
        )
      );
    `);
    console.log('  [OK] storage.objects fail-closed policy applied.');

    console.log('\n================================================================');
    console.log('STRICT FAIL-CLOSED RLS POLICIES SUCCESSFULLY DEPLOYED');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ Failed to deploy fail-closed RLS:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

applyFailClosedRls()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

