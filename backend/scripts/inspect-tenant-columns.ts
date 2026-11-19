import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectColumns() {
  const cols = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('resources', 'master_curriculums', 'session_packages', 'session_vector_chunks', 'curriculum_modules', 'curriculum_periods') 
      AND (column_name ILIKE '%tenant%' OR column_name ILIKE '%global%' OR column_name = 'id')
    ORDER BY table_name, column_name;
  `);
  console.table(cols);
  await prisma.$disconnect();
}

inspectColumns();

