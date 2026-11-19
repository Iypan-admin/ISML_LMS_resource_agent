import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBypassRlsBehavior() {
  console.log('Testing whether postgres user bypasses RLS with FORCE ROW LEVEL SECURITY:');

  // Check rolbypassrls of current user
  const roleInfo: any[] = await prisma.$queryRawUnsafe(`
    SELECT current_user, session_user, r.rolbypassrls 
    FROM pg_roles r 
    WHERE r.rolname = current_user;
  `);
  console.log('Current Connection Role Info:', roleInfo[0]);

  // Check if switching to authenticated drops rolbypassrls
  const switchedRoleInfo: any[] = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
    return tx.$queryRawUnsafe(`
      SELECT current_user, session_user, r.rolbypassrls 
      FROM pg_roles r 
      WHERE r.rolname = current_user;
    `);
  });
  console.log('Switched (SET LOCAL ROLE authenticated) Role Info:', switchedRoleInfo[0]);

  await prisma.$disconnect();
}

testBypassRlsBehavior();

