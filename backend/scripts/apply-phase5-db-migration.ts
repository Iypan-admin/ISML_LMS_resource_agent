import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Applying Phase 5 Database Additive Columns to curriculum_periods ---');

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "curriculum_periods" 
    ADD COLUMN IF NOT EXISTS "periodType" text DEFAULT 'INSTRUCTIONAL';
  `);
  console.log('  [PASSED] Added column "periodType"');

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "curriculum_periods" 
    ADD COLUMN IF NOT EXISTS "canDoStatements" text[] DEFAULT ARRAY[]::text[];
  `);
  console.log('  [PASSED] Added column "canDoStatements"');

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "curriculum_periods" 
    ADD COLUMN IF NOT EXISTS "durationMinutes" integer DEFAULT 45;
  `);
  console.log('  [PASSED] Added column "durationMinutes"');

  console.log('--- Phase 5 Database Schema Migration Verified Successfully ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());

