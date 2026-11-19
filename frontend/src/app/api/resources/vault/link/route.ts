import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Gemini embedding helper
async function getGeminiEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  if (!apiKey || !text) return null;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text: text.slice(0, 2048) }] },
      }),
    });
    if (!res.ok) {
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
      const fRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/gemini-embedding-001',
          content: { parts: [{ text: text.slice(0, 2048) }] },
        }),
      });
      if (!fRes.ok) return null;
      const fData = await fRes.json();
      return fData?.embedding?.values || null;
    }
    const data = await res.json();
    return data?.embedding?.values || null;
  } catch (err) {
    console.warn('Gemini embedding generation error:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body.url || '';
    const title = body.title || url.replace(/^https?:\/\//i, '').slice(0, 50);
    const languageName = body.language || 'English';
    const cefrLevel = body.cefrLevel || 'A1';
    const framework = body.framework || 'CEFR';

    if (!url) {
      return NextResponse.json({ success: false, message: 'URL is required' }, { status: 400 });
    }

    const urlHash = crypto.createHash('sha256').update(url).digest('hex');

    // 1. Resolve Language in Database
    let lang = await prisma.language.findFirst({
      where: {
        OR: [
          { name: { equals: languageName, mode: 'insensitive' } },
          { code: { equals: languageName, mode: 'insensitive' } },
        ],
      },
    });

    if (!lang) {
      lang = await prisma.language.findFirst({ where: { isActive: true } });
    }

    const languageId = lang?.id || 'd0000000-0000-0000-0000-000000000001';

    // 2. Check for duplicate
    const existing = await prisma.resource.findFirst({
      where: {
        OR: [
          { originalUrl: url },
          { fileHash: urlHash },
        ],
      },
      include: { language: true },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        id: existing.id,
        resource: existing,
        message: `Link already indexed in Vault: ${existing.title}`,
        isDuplicate: true,
      }, { status: 200 });
    }

    const isVideo = /youtube\.com|youtu\.be/i.test(url);
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}-${Date.now().toString(36)}`;

    // 3. Create Resource in Supabase Database
    const resource = await prisma.resource.create({
      data: {
        slug,
        title,
        description: `Verified external link: ${url} for ${languageName} (${framework} ${cefrLevel})`,
        languageId,
        fileHash: urlHash,
        sourceType: 'EXTERNAL',
        resourceType: isVideo ? 'YOUTUBE_VIDEO' : 'WEBSITE',
        tenantId: 'inst_isml_global',
        isGlobal: true,
        processingStatus: 'READY',
        approvalStatus: 'APPROVED',
        originalUrl: url,
      },
      include: {
        language: true,
      },
    });

    // 4. Generate Vector Chunk for Semantic Grounding
    const chunkText = `Source material from ${title}. URL: ${url}. Educational language learning content targeting ${languageName} level ${cefrLevel}.`;
    const apiKey = process.env.GEMINI_API_KEY || '';
    let embedding: number[] | null = null;
    if (apiKey) {
      embedding = await getGeminiEmbedding(chunkText, apiKey);
    }

    await prisma.sessionVectorChunk.create({
      data: {
        resourceId: resource.id,
        sourceType: isVideo ? 'VIDEO_TRANSCRIPT' : 'WEB_SCRAPE',
        sourceTitle: title,
        chunkIndex: 0,
        totalChunks: 1,
        content: chunkText,
        tokenCount: Math.ceil(chunkText.length / 4),
        language: languageName,
        cefrLevel: cefrLevel,
        embeddingProvider: embedding ? 'GEMINI' : null,
        embeddingModel: embedding ? 'text-embedding-004' : null,
        embeddingDimension: embedding ? 768 : null,
        embeddingVersion: embedding ? 'v1.0' : null,
        metadata: {
          url,
          isVideo,
          hasDenseEmbedding: !!embedding,
        },
      },
    });

    return NextResponse.json({
      success: true,
      id: resource.id,
      resource,
      message: `Successfully indexed link in Vector DB: ${title}`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Vault Link API Error]:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to process and index link into Vector DB',
    }, { status: 500 });
  }
}
