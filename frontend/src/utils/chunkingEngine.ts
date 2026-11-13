/**
 * Intelligent Source Chunking Engine
 * Splits documents, web articles, and video/audio transcripts into
 * pedagogical semantic chunks for vector storage, similarity matching, and grounded agent synthesis.
 */

export interface SourceChunk {
  sourceType: 'DOCUMENT' | 'WEB_SCRAPE' | 'VIDEO_TRANSCRIPT' | 'AUDIO';
  sourceTitle: string;
  chunkIndex: number;
  totalChunks: number;
  content: string;
  tokenCount: number;
  cefrLevel?: string;
  language?: string;
  metadata?: {
    chunk_type?: string;
    section_title?: string;
    keywords?: string[];
    grammar_signals?: string[];
    timestamp?: string;
  };
}

export function splitTextIntoChunks(
  text: string,
  sourceType: 'DOCUMENT' | 'WEB_SCRAPE' | 'VIDEO_TRANSCRIPT' | 'AUDIO',
  sourceTitle: string,
  language?: string,
  cefrLevel?: string,
  targetChunkChars: number = 800,
  overlapChars: number = 150
): SourceChunk[] {
  const clean = (text || '').trim();
  if (!clean) return [];

  // If text is small enough, return as single comprehensive chunk
  if (clean.length <= targetChunkChars) {
    return [
      {
        sourceType,
        sourceTitle,
        chunkIndex: 0,
        totalChunks: 1,
        content: clean,
        tokenCount: Math.ceil(clean.length / 4),
        language,
        cefrLevel,
        metadata: {
          chunk_type: 'complete_text',
          keywords: extractKeywords(clean),
        },
      },
    ];
  }

  // Split by natural paragraph / sentence boundaries
  const rawParagraphs = clean.split(/\n\s*\n|\n(?=[A-Z0-9#\-\*•])|(?<=[.!?])\s+(?=[A-Z])/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (currentChunk.length + trimmed.length <= targetChunkChars) {
      currentChunk += (currentChunk ? '\n\n' : '') + trimmed;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        // Overlap from end of last chunk
        const overlap = currentChunk.slice(-overlapChars);
        currentChunk = overlap + '\n\n' + trimmed;
      } else {
        // If single paragraph is oversized, split by word count
        let start = 0;
        while (start < trimmed.length) {
          chunks.push(trimmed.slice(start, start + targetChunkChars));
          start += targetChunkChars - overlapChars;
        }
      }
    }
  }

  if (currentChunk && !chunks.includes(currentChunk)) {
    chunks.push(currentChunk);
  }

  const total = chunks.length;
  return chunks.map((chunkContent, idx) => ({
    sourceType,
    sourceTitle,
    chunkIndex: idx,
    totalChunks: total,
    content: chunkContent.trim(),
    tokenCount: Math.ceil(chunkContent.length / 4),
    language,
    cefrLevel,
    metadata: {
      chunk_type: idx === 0 ? 'header_overview' : idx === total - 1 ? 'summary_drill' : 'body_passage',
      keywords: extractKeywords(chunkContent),
    },
  }));
}

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4);

  const stopWords = new Set([
    'this', 'that', 'with', 'from', 'have', 'were', 'which', 'their', 'there', 'about',
    'would', 'could', 'should', 'these', 'those', 'where', 'please', 'course', 'lesson'
  ]);

  const unique = Array.from(new Set(words.filter(w => !stopWords.has(w))));
  return unique.slice(0, 8);
}

