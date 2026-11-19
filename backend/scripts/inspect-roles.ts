import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectRoles() {
  const roles = await prisma.$queryRawUnsafe(`
    SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin, rolreplication, rolbypassrls 
    FROM pg_roles 
    WHERE rolname IN ('postgres', 'authenticated', 'anon', 'service_role')
    ORDER BY rolname;
  `);
  console.table(roles);
  await prisma.$disconnect();
}

inspectRoles();

