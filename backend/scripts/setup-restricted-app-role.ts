import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupRestrictedAppRole() {
  console.log('================================================================');
  console.log('SECURITY STEP: PROVISIONING RESTRICTED APPLICATION DATABASE ROLE');
  console.log('================================================================\n');

  try {
    // 1. Create or alter the restricted application role
    console.log('--- 1. Configuring Restricted Application Role isml_app_user ---');
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'isml_app_user') THEN
          CREATE ROLE isml_app_user WITH LOGIN PASSWORD 'ISML_Secure_App_2026!' INHERIT;
        ELSE
          ALTER ROLE isml_app_user WITH LOGIN PASSWORD 'ISML_Secure_App_2026!' INHERIT;
        END IF;
      END
      $$;
    `);

    // Strictly enforce NOBYPASSRLS and NOSUPERUSER
    await prisma.$executeRawUnsafe(`ALTER ROLE isml_app_user NOSUPERUSER NOCREATEROLE NOCREATEDB NOREPLICATION NOBYPASSRLS;`);
    console.log('  [OK] Role isml_app_user configured with NOBYPASSRLS.');

    // 2. Grant privileges on schemas and tables
    console.log('\n--- 2. Granting Privileges to isml_app_user ---');
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO isml_app_user;`);
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA storage TO isml_app_user;`);
    await prisma.$executeRawUnsafe(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO isml_app_user;`);
    await prisma.$executeRawUnsafe(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA storage TO isml_app_user;`);
    await prisma.$executeRawUnsafe(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO isml_app_user;`);
    await prisma.$executeRawUnsafe(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA storage TO isml_app_user;`);

    // Ensure future tables inherit these permissions
    await prisma.$executeRawUnsafe(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO isml_app_user;`);
    await prisma.$executeRawUnsafe(`ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO isml_app_user;`);
    console.log('  [OK] Table, schema, and sequence grants assigned.');

    // 3. Verify role attributes
    const roleCheck: any[] = await prisma.$queryRawUnsafe(`
      SELECT rolname, rolsuper, rolcanlogin, rolbypassrls 
      FROM pg_roles 
      WHERE rolname = 'isml_app_user';
    `);
    console.table(roleCheck);

  } catch (err) {
    console.error('❌ Failed to provision restricted app role:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

setupRestrictedAppRole()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

