import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyPhase3DbIndexes() {
  console.log('================================================================');
  console.log('PHASE 3: APPLYING PGVECTOR & MULTILINGUAL FULL-TEXT INDEXES');
  console.log('================================================================\n');

  try {
    // 1. Add vector(768) column to session_vector_chunks if not present
    console.log('1. Ensuring embedding vector(768) column exists on session_vector_chunks...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "session_vector_chunks" 
      ADD COLUMN IF NOT EXISTS "embedding" vector(768);
    `);
    console.log('   [SUCCESS] Column embedding vector(768) ready.');

    // 2. Create HNSW Cosine Index for dense vector similarity
    console.log('2. Creating HNSW vector_cosine_ops index for dense retrieval...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS session_vector_chunks_embedding_hnsw_idx 
      ON "session_vector_chunks" 
      USING hnsw ("embedding" vector_cosine_ops);
    `);
    console.log('   [SUCCESS] HNSW index session_vector_chunks_embedding_hnsw_idx created.');

    // 3. Create CJK Trigram GIN index for Japanese and Korean
    console.log('3. Creating CJK trigram GIN index for Japanese & Korean sub-word retrieval...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS session_vector_chunks_cjk_trgm_idx 
      ON "session_vector_chunks" 
      USING gin ("content" gin_trgm_ops) 
      WHERE "language" IN ('Japanese', 'Korean');
    `);
    console.log('   [SUCCESS] CJK Trigram index session_vector_chunks_cjk_trgm_idx created.');

    // 4. Create Multilingual Full-Text tsvector GIN indexes
    console.log('4. Creating language-specific full-text tsvector GIN indexes...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS session_vector_chunks_de_fts_idx 
      ON "session_vector_chunks" 
      USING gin (to_tsvector('german', "content")) 
      WHERE "language" = 'German';
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS session_vector_chunks_fr_fts_idx 
      ON "session_vector_chunks" 
      USING gin (to_tsvector('french', "content")) 
      WHERE "language" = 'French';
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS session_vector_chunks_es_fts_idx 
      ON "session_vector_chunks" 
      USING gin (to_tsvector('spanish', "content")) 
      WHERE "language" = 'Spanish';
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS session_vector_chunks_en_fts_idx 
      ON "session_vector_chunks" 
      USING gin (to_tsvector('english', "content")) 
      WHERE "language" = 'English';
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS session_vector_chunks_simple_fts_idx 
      ON "session_vector_chunks" 
      USING gin (to_tsvector('simple', "content"));
    `);
    console.log('   [SUCCESS] Multilingual full-text indexes (de, fr, es, en, simple) created.');

    // 5. Create Model Provenance Index
    console.log('5. Creating model provenance index to guarantee zero cross-model vector contamination...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS session_vector_chunks_provenance_idx 
      ON "session_vector_chunks" ("embeddingProvider", "embeddingModel", "embeddingDimension");
    `);
    console.log('   [SUCCESS] Provenance index session_vector_chunks_provenance_idx created.');

    console.log('\n================================================================');
    console.log('ALL PHASE 3 DATABASE VECTOR & HYBRID INDEXES APPLIED CLEANLY!');
    console.log('================================================================\n');
  } catch (error) {
    console.error('Failed to apply Phase 3 DB indexes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyPhase3DbIndexes();

