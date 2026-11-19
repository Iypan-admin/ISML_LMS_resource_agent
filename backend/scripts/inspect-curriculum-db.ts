import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tables: any[] = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND (table_name LIKE '%curriculum%' OR table_name LIKE '%session%')
    ORDER BY table_name;
  `);
  console.log('Matching tables in DB:', tables.map(t => t.table_name));

  for (const t of tables) {
    const cols: any[] = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, t.table_name);
    console.log(`\nTable ${t.table_name}:`);
    cols.forEach(c => console.log(`  - ${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

