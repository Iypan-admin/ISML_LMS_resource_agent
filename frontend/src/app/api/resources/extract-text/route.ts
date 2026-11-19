import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { extractDocumentContent } from '@/lib/extractor';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, base64, fileUrl, fileName = 'document.docx' } = body;

    // 1. Extract from base64 data URL
    if (base64 && typeof base64 === 'string') {
      const pureBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
      const buffer = Buffer.from(pureBase64, 'base64');
      const docInfo = await extractDocumentContent(buffer, fileName);
      if (docInfo.success && docInfo.text && docInfo.text.length > 10) {
        return NextResponse.json({
          success: true,
          text: docInfo.text,
          html: docInfo.html,
          source: 'base64_extraction',
          wordCount: docInfo.wordCount,
          pageCount: docInfo.pageCount,
        });
      }
    }

    // 2. Extract from local uploads directory
    if (fileUrl && typeof fileUrl === 'string' && fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', fileUrl);
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const docInfo = await extractDocumentContent(buffer, path.basename(filePath));
        if (docInfo.success && docInfo.text) {
          return NextResponse.json({
            success: true,
            text: docInfo.text,
            html: docInfo.html,
            source: 'file_extraction',
            wordCount: docInfo.wordCount,
            pageCount: docInfo.pageCount,
          });
        }
      }
    }

    // 3. Check if resource exists in database with vector chunks
    if (id) {
      const chunks = await prisma.sessionVectorChunk.findMany({
        where: { resourceId: id },
        orderBy: { chunkIndex: 'asc' },
      });

      if (chunks.length > 0) {
        const fullText = chunks.map(c => c.content).join('\n\n');
        return NextResponse.json({
          success: true,
          text: fullText,
          source: 'vector_chunks',
          wordCount: fullText.split(/\s+/).filter(Boolean).length,
        });
      }

      // Check resource description
      const res = await prisma.resource.findUnique({ where: { id } });
      if (res && res.description && res.description.length > 50) {
        return NextResponse.json({
          success: true,
          text: res.description,
          source: 'resource_description',
          wordCount: res.wordCount || res.description.split(/\s+/).filter(Boolean).length,
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Could not extract text from provided inputs',
    }, { status: 404 });
  } catch (error: any) {
    console.error('[Extract Text API Error]:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Extraction failed',
    }, { status: 500 });
  }
}
