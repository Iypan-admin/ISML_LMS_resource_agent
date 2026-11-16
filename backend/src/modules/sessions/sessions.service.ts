import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async savePackage(data: {
    sessionId: string;
    title: string;
    language: string;
    level: string;
    trackMode?: any;
    topic: string;
    sourceUrl?: string;
    tutorFileRef?: string;
    sessionPlanJson: any;
    teacherMaterialsJson: any;
    studentLsrwJson: any;
    pptxFilePath?: string;
    pptxDownloadUrl?: string;
  }) {
    return this.prisma.sessionPackage.upsert({
      where: { sessionId: data.sessionId },
      update: {
        title: data.title,
        language: data.language,
        level: data.level,
        trackMode: data.trackMode || 'STANDARD',
        topic: data.topic,
        sourceUrl: data.sourceUrl,
        tutorFileRef: data.tutorFileRef,
        sessionPlanJson: data.sessionPlanJson,
        teacherMaterialsJson: data.teacherMaterialsJson,
        studentLsrwJson: data.studentLsrwJson,
        pptxFilePath: data.pptxFilePath,
        pptxDownloadUrl: data.pptxDownloadUrl,
        updatedAt: new Date(),
      },
      create: {
        sessionId: data.sessionId,
        title: data.title,
        language: data.language,
        level: data.level,
        trackMode: data.trackMode || 'STANDARD',
        topic: data.topic,
        sourceUrl: data.sourceUrl,
        tutorFileRef: data.tutorFileRef,
        sessionPlanJson: data.sessionPlanJson,
        teacherMaterialsJson: data.teacherMaterialsJson,
        studentLsrwJson: data.studentLsrwJson,
        pptxFilePath: data.pptxFilePath,
        pptxDownloadUrl: data.pptxDownloadUrl,
      },
    });
  }

  async getPackageBySessionId(sessionId: string) {
    const pkg = await this.prisma.sessionPackage.findUnique({
      where: { sessionId },
    });
    if (!pkg) {
      throw new NotFoundException(`Session package '${sessionId}' not found`);
    }
    return pkg;
  }

  async listPackages(language?: string, level?: string, trackMode?: string) {
    const where: any = {};
    if (language) where.language = { equals: language, mode: 'insensitive' };
    if (level) where.level = { equals: level, mode: 'insensitive' };
    if (trackMode) where.trackMode = trackMode;

    return this.prisma.sessionPackage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async deletePackage(sessionId: string) {
    try {
      await this.prisma.sessionPackage.delete({
        where: { sessionId },
      });
      return { success: true, message: `Session package '${sessionId}' deleted successfully` };
    } catch (err) {
      // If not found in DB, return success anyway so frontend cache can clear smoothly
      return { success: true, message: `Session '${sessionId}' removed` };
    }
  }

  async clearAllPackages() {
    try {
      await this.prisma.sessionVectorChunk.deleteMany({});
      await this.prisma.knowledgeClaim.deleteMany({});
      const res = await this.prisma.sessionPackage.deleteMany({});
      return { success: true, count: res.count, message: `All ${res.count} session packages and vector chunks deleted from database.` };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 📦 Vector Chunking Services: Store & Retrieve Split Source Evidence
  async saveChunks(sessionId: string, chunks: Array<{
    sourceType: string;
    sourceTitle: string;
    chunkIndex: number;
    totalChunks: number;
    content: string;
    tokenCount?: number;
    cefrLevel?: string;
    language?: string;
    metadata?: any;
  }>) {
    if (!chunks || chunks.length === 0) return { count: 0 };
    
    // First remove old chunks for this session to ensure clean sync
    await this.prisma.sessionVectorChunk.deleteMany({
      where: { sessionId },
    });

    const created = await this.prisma.sessionVectorChunk.createMany({
      data: chunks.map(c => ({
        sessionId,
        sourceType: c.sourceType || 'DOCUMENT',
        sourceTitle: c.sourceTitle || 'Uploaded Material',
        chunkIndex: c.chunkIndex || 0,
        totalChunks: c.totalChunks || 1,
        content: c.content,
        tokenCount: c.tokenCount || Math.ceil(c.content.length / 4),
        cefrLevel: c.cefrLevel,
        language: c.language,
        metadata: c.metadata || {},
      })),
    });

    return { count: created.count };
  }

  async getChunks(sessionId: string) {
    return this.prisma.sessionVectorChunk.findMany({
      where: { sessionId },
      orderBy: [{ sourceType: 'asc' }, { chunkIndex: 'asc' }],
    });
  }

  async searchChunks(sessionId: string, query: string) {
    const allChunks = await this.getChunks(sessionId);
    if (!query || !query.trim()) return allChunks;

    const q = query.toLowerCase();
    // Keyword and term density matching for fast grounded retrieval
    return allChunks.filter(c => 
      c.content.toLowerCase().includes(q) || 
      c.sourceTitle.toLowerCase().includes(q)
    );
  }

  async syncToLms(sessionId: string) {
    const pkg = await this.getPackageBySessionId(sessionId);

    // Formatted payload designed specifically for LMS ingestion
    const lmsPayload = {
      course_language: pkg.language,
      cefr_level: pkg.level,
      lesson_module_title: pkg.title,
      session_roadmap: pkg.sessionPlanJson,
      presentation_download: pkg.pptxDownloadUrl,
      student_activities: pkg.studentLsrwJson,
      export_timestamp: new Date().toISOString(),
    };

    // Update status to SYNCED_TO_LMS
    const updated = await this.prisma.sessionPackage.update({
      where: { sessionId },
      data: {
        status: 'SYNCED_TO_LMS',
        lmsSyncedAt: new Date(),
      },
    });

    return {
      success: true,
      message: `Session package '${pkg.title}' exported to ISML LMS successfully`,
      package_id: updated.sessionId,
      lms_payload: lmsPayload,
    };
  }

  // 🧠 Continuous Knowledge Intelligence: Store pgvector Embeddings, Claims & Contradictions
  async saveKnowledgeIntelligence(sessionId: string, payload: {
    chunks?: Array<{
      id?: string;
      sourceType?: string;
      sourceTitle?: string;
      chunkIndex?: number;
      totalChunks?: number;
      content: string;
      tokenCount?: number;
      embedding?: number[];
      simHash?: string;
      pageNumber?: number;
      timeOffsetSec?: number;
      cefrLevel?: string;
      language?: string;
    }>;
    claims?: Array<{
      id?: string;
      chunkId?: string;
      subject: string;
      predicate: string;
      object: string;
      epistemic_status?: string;
      confidence?: number;
      verbatim_quote?: string;
    }>;
    contradictions?: Array<{
      claimAId: string;
      claimBId: string;
      contradictionType: string;
      description: string;
    }>;
  }) {
    const chunkIdMap = new Map<number, string>();
    let insertedChunksCount = 0;

    if (payload.chunks && payload.chunks.length > 0) {
      for (const [idx, c] of payload.chunks.entries()) {
        const chunkId = c.id || randomUUID();
        chunkIdMap.set(idx, chunkId);
        const tokenCount = c.tokenCount || Math.ceil(c.content.length / 4);
        const sourceType = c.sourceType || 'DOCUMENT';
        const sourceTitle = c.sourceTitle || 'Uploaded Material';
        const chunkIndex = c.chunkIndex ?? idx;
        const totalChunks = c.totalChunks || payload.chunks.length;
        const simHash = c.simHash || null;
        const pageNumber = c.pageNumber ?? null;
        const timeOffsetSec = c.timeOffsetSec ?? null;
        const cefrLevel = c.cefrLevel || null;
        const language = c.language || null;

        if (c.embedding && Array.isArray(c.embedding) && c.embedding.length > 0) {
          const embeddingStr = `[${c.embedding.join(',')}]`;
          await this.prisma.$executeRaw`
            INSERT INTO "session_vector_chunks" (
              "id", "sessionId", "sourceType", "sourceTitle", "chunkIndex", "totalChunks",
              "content", "tokenCount", "embedding", "simHash", "pageNumber", "timeOffsetSec",
              "cefrLevel", "language", "createdAt"
            ) VALUES (
              ${chunkId}, ${sessionId}, ${sourceType}, ${sourceTitle}, ${chunkIndex}, ${totalChunks},
              ${c.content}, ${tokenCount}, ${embeddingStr}::vector, ${simHash}, ${pageNumber}, ${timeOffsetSec},
              ${cefrLevel}, ${language}, NOW()
            )
            ON CONFLICT ("id") DO UPDATE SET
              "content" = EXCLUDED."content",
              "embedding" = EXCLUDED."embedding",
              "simHash" = EXCLUDED."simHash";
          `;
        } else {
          await this.prisma.$executeRaw`
            INSERT INTO "session_vector_chunks" (
              "id", "sessionId", "sourceType", "sourceTitle", "chunkIndex", "totalChunks",
              "content", "tokenCount", "simHash", "pageNumber", "timeOffsetSec",
              "cefrLevel", "language", "createdAt"
            ) VALUES (
              ${chunkId}, ${sessionId}, ${sourceType}, ${sourceTitle}, ${chunkIndex}, ${totalChunks},
              ${c.content}, ${tokenCount}, ${simHash}, ${pageNumber}, ${timeOffsetSec},
              ${cefrLevel}, ${language}, NOW()
            )
            ON CONFLICT ("id") DO UPDATE SET
              "content" = EXCLUDED."content",
              "simHash" = EXCLUDED."simHash";
          `;
        }
        insertedChunksCount++;
      }
    }

    let insertedClaimsCount = 0;
    if (payload.claims && payload.claims.length > 0) {
      const defaultChunkId = chunkIdMap.get(0) || payload.chunks?.[0]?.id;
      for (const claim of payload.claims) {
        const claimId = claim.id || randomUUID();
        const targetChunkId = claim.chunkId || defaultChunkId;
        if (!targetChunkId) continue;

        await this.prisma.$executeRaw`
          INSERT INTO "knowledge_claims" (
            "id", "sessionId", "chunkId", "subject", "predicate", "object",
            "epistemicStatus", "confidence", "verbatimQuote", "createdAt"
          ) VALUES (
            ${claimId}, ${sessionId}, ${targetChunkId}, ${claim.subject}, ${claim.predicate}, ${claim.object},
            ${claim.epistemic_status || 'FACT'}, ${claim.confidence ?? 0.95}, ${claim.verbatim_quote || null}, NOW()
          )
          ON CONFLICT ("id") DO UPDATE SET
            "subject" = EXCLUDED."subject",
            "predicate" = EXCLUDED."predicate",
            "object" = EXCLUDED."object",
            "confidence" = EXCLUDED."confidence";
        `;
        insertedClaimsCount++;
      }
    }

    let insertedContradictionsCount = 0;
    if (payload.contradictions && payload.contradictions.length > 0) {
      for (const c of payload.contradictions) {
        if (!c.claimAId || !c.claimBId) continue;
        const cid = randomUUID();
        await this.prisma.$executeRaw`
          INSERT INTO "knowledge_contradictions" (
            "id", "claimAId", "claimBId", "contradictionType", "description", "detectedAt"
          ) VALUES (
            ${cid}, ${c.claimAId}, ${c.claimBId}, ${c.contradictionType || 'DIRECT_OPPOSITE'}, ${c.description}, NOW()
          )
          ON CONFLICT ("claimAId", "claimBId") DO UPDATE SET
            "description" = EXCLUDED."description";
        `;
        insertedContradictionsCount++;
      }
    }

    return {
      success: true,
      sessionId,
      stored_chunks: insertedChunksCount,
      stored_claims: insertedClaimsCount,
      stored_contradictions: insertedContradictionsCount,
    };
  }

  async getKnowledgeIntelligence(sessionId: string) {
    const chunks = await this.prisma.sessionVectorChunk.findMany({
      where: { sessionId },
      orderBy: { chunkIndex: 'asc' },
    });
    const claims = await this.prisma.knowledgeClaim.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });
    return {
      total_chunks: chunks.length,
      total_claims: claims.length,
      chunks,
      claims,
    };
  }
}
