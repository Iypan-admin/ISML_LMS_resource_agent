import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cols: any = await prisma.$queryRaw`
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'session_vector_chunks'
    ORDER BY ordinal_position;
  `;
  console.log('Columns in session_vector_chunks:');
  for (const c of cols) {
    console.log(' ', c.column_name, '->', c.data_type, '(' + c.udt_name + ')');
  }

  // Also check existing indexes
  const idxs: any = await prisma.$queryRaw`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'session_vector_chunks';
  `;
  console.log('\nIndexes on session_vector_chunks:');
  for (const i of idxs) {
    console.log(' ', i.indexname, ':', i.indexdef);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

