import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmbeddingColumn() {
  const col = await prisma.$queryRawUnsafe(`
    SELECT column_name, udt_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'session_vector_chunks' AND column_name = 'embedding';
  `);
  console.table(col);

  // Check HNSW indexes
  const indexes = await prisma.$queryRawUnsafe(`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'session_vector_chunks' AND indexname ILIKE '%vector%';
  `);
  console.log('VECTOR INDEXES:');
  console.table(indexes);

  await prisma.$disconnect();
}

checkEmbeddingColumn();

