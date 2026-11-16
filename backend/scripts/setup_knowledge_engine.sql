-- =============================================================================
-- ISML Continuous Knowledge Intelligence Engine - Database Setup & RRF Function
-- Supabase PostgreSQL + pgvector Migration Script
-- =============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add Vector & Full-Text Search Columns to session_vector_chunks
-- Note: Default dimension is 768 to match Google Gemini 'text-embedding-004'.
-- If using OpenAI 'text-embedding-3-small', change vector(768) to vector(1536).
ALTER TABLE session_vector_chunks 
  ADD COLUMN IF NOT EXISTS embedding vector(768),
  ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(content, '') || ' ' || coalesce("sourceTitle", ''))
  ) STORED;

-- 3. High-Performance Indexes
-- HNSW Index for fast approximate nearest neighbor search (< 15ms)
CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw 
  ON session_vector_chunks USING hnsw (embedding vector_cosine_ops) 
  WITH (m = 16, ef_construction = 64);

-- GIN Index for rapid full-text search
CREATE INDEX IF NOT EXISTS idx_chunks_fts 
  ON session_vector_chunks USING gin (fts);

-- Secondary indexing for fast filtering
CREATE INDEX IF NOT EXISTS idx_chunks_resource_id ON session_vector_chunks ("resourceId");
CREATE INDEX IF NOT EXISTS idx_chunks_session_id ON session_vector_chunks ("sessionId");
CREATE INDEX IF NOT EXISTS idx_chunks_simhash ON session_vector_chunks ("simHash");

-- 4. Hybrid Search with Reciprocal Rank Fusion (RRF)
-- Combines dense vector similarity and sparse BM25/FTS text ranking.
CREATE OR REPLACE FUNCTION match_knowledge_chunks_rrf(
  query_text TEXT,
  query_embedding vector(768),
  match_count INT DEFAULT 10,
  rrf_k INT DEFAULT 60,
  target_language TEXT DEFAULT NULL,
  target_resource_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  chunk_id TEXT,
  resource_id TEXT,
  session_id TEXT,
  source_title TEXT,
  source_type TEXT,
  content TEXT,
  page_number INT,
  time_offset_sec INT,
  dense_rank BIGINT,
  sparse_rank BIGINT,
  combined_rrf_score FLOAT
)
LANGUAGE sql
STABLE
AS $$
WITH dense_search AS (
  SELECT 
    id, 
    ROW_NUMBER() OVER (ORDER BY embedding <=> query_embedding) as dense_rank
  FROM session_vector_chunks
  WHERE embedding IS NOT NULL
    AND (target_language IS NULL OR language = target_language)
    AND (target_resource_id IS NULL OR "resourceId" = target_resource_id)
  LIMIT 40
),
sparse_search AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      ORDER BY ts_rank_cd(fts, websearch_to_tsquery('english', query_text)) DESC
    ) as sparse_rank
  FROM session_vector_chunks
  WHERE fts @@ websearch_to_tsquery('english', query_text)
    AND (target_language IS NULL OR language = target_language)
    AND (target_resource_id IS NULL OR "resourceId" = target_resource_id)
  LIMIT 40
)
SELECT 
  c.id as chunk_id,
  c."resourceId" as resource_id,
  c."sessionId" as session_id,
  c."sourceTitle" as source_title,
  c."sourceType" as source_type,
  c.content,
  c."pageNumber" as page_number,
  c."timeOffsetSec" as time_offset_sec,
  d.dense_rank,
  s.sparse_rank,
  (COALESCE(1.0 / (rrf_k + d.dense_rank), 0.0) + 
   COALESCE(1.0 / (rrf_k + s.sparse_rank), 0.0))::FLOAT AS combined_rrf_score
FROM session_vector_chunks c
LEFT JOIN dense_search d ON c.id = d.id
LEFT JOIN sparse_search s ON c.id = s.id
WHERE d.id IS NOT NULL OR s.id IS NOT NULL
ORDER BY combined_rrf_score DESC
LIMIT match_count;
$$;

