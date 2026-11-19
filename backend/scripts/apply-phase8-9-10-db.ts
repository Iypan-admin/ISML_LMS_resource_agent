import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Applying Phase 8, 9, 10 Additive Columns to session_packages ---');

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "session_packages" 
    ADD COLUMN IF NOT EXISTS "deliverablesJson" jsonb;
  `);
  console.log('  [PASSED] Added column "deliverablesJson"');

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "session_packages" 
    ADD COLUMN IF NOT EXISTS "lmsPackageJson" jsonb;
  `);
  console.log('  [PASSED] Added column "lmsPackageJson"');

  console.log('--- Phase 8, 9, 10 Database Schema Verified Successfully ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());

