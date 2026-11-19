import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditVectorChunks() {
  console.log('================================================================');
  console.log('AUDIT: EMBEDDING CONSISTENCY & VECTOR SPACE AUDIT');
  console.log('================================================================\n');

  const modelDist = await prisma.$queryRawUnsafe(`
    SELECT "embeddingProvider", "embeddingModel", "embeddingVersion", "embeddingDimension", COUNT(*) as count
    FROM session_vector_chunks
    GROUP BY "embeddingProvider", "embeddingModel", "embeddingVersion", "embeddingDimension";
  `);
  console.log('Vector Chunk Model & Dimension Distribution:');
  console.table(modelDist);

  const dimCheck = await prisma.$queryRawUnsafe(`
    SELECT 
      COUNT(*) FILTER (WHERE embedding IS NOT NULL) as total_embedded_chunks,
      COUNT(*) FILTER (WHERE embedding IS NULL) as total_unembedded_chunks
    FROM session_vector_chunks;
  `);
  console.table(dimCheck);

  await prisma.$disconnect();
}

auditVectorChunks();

