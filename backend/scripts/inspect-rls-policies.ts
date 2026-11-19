import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectRls() {
  console.log('================================================================');
  console.log('AUDIT: POSTGRESQL ROW LEVEL SECURITY (RLS) & STORAGE POLICIES');
  console.log('================================================================\n');

  try {
    const tables = ['resources', 'session_packages', 'master_curriculums', 'session_vector_chunks', 'curriculum_modules', 'curriculum_periods'];

    console.log('--- 1. Table RLS Enabled Status (relrowsecurity) ---');
    const rlsStatus: any[] = await prisma.$queryRawUnsafe(`
      SELECT relname, relrowsecurity, relforcerowsecurity 
      FROM pg_class 
      WHERE relname = ANY($1::text[])
      ORDER BY relname;
    `, tables);
    console.table(rlsStatus);

    console.log('\n--- 2. Active pg_policies on Application Tables ---');
    const appPolicies: any[] = await prisma.$queryRawUnsafe(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
      FROM pg_policies 
      WHERE tablename = ANY($1::text[])
      ORDER BY tablename, policyname;
    `, tables);
    if (appPolicies.length === 0) {
      console.log('  [NOTICE] No pg_policies found directly on application tables in public schema.');
    } else {
      console.table(appPolicies);
    }

    console.log('\n--- 3. Supabase Storage Policies (storage.objects) ---');
    const storagePolicies: any[] = await prisma.$queryRawUnsafe(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
      FROM pg_policies 
      WHERE schemaname = 'storage' AND tablename = 'objects'
      ORDER BY policyname;
    `);
    if (storagePolicies.length === 0) {
      console.log('  [NOTICE] No custom storage.objects policies found or schema storage restricted.');
    } else {
      console.table(storagePolicies);
    }

    console.log('\n--- 4. Active Database User & Role Inspection ---');
    const currentUser: any[] = await prisma.$queryRawUnsafe(`
      SELECT current_user, session_user, current_setting('is_superuser') as is_superuser;
    `);
    console.table(currentUser);

  } catch (err) {
    console.error('RLS Inspection Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

inspectRls();

