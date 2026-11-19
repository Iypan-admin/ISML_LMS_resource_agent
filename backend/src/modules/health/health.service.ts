import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SystemHealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  database: {
    connected: boolean;
    latencyMs: number;
    pgvectorVersion: string | null;
    activePoolConnections: number;
  };
  storage: {
    provider: string;
    primaryBucket: string;
    status: 'READY' | 'UNAVAILABLE';
  };
  aiEcosystem: {
    canonicalEmbeddingModel: string;
    canonicalDimension: number;
    provider: string;
    hybridSearchMode: string;
    multilingualSupport: string[];
  };
  academicMetrics: {
    totalResources: number;
    readyForCurriculum: number;
    quarantinedLegacyResources: number;
    totalMasterCurriculums: number;
    lockedCurriculums: number;
    totalSessionPackages: number;
    syncedToLmsCount: number;
    indexedVectorChunks: number;
  };
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  async checkComprehensiveHealth(): Promise<SystemHealthStatus> {
    const t0 = Date.now();
    let dbConnected = false;
    let pgvectorVersion: string | null = null;

    // 1. Database Ping and pgvector verification
    try {
      await this.prisma.$queryRawUnsafe(`SELECT 1;`);
      dbConnected = true;

      const extRows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
      `);
      if (extRows.length > 0) {
        pgvectorVersion = extRows[0].extversion;
      }
    } catch (err: any) {
      this.logger.error(`Database health check failed: ${err.message}`);
    }

    const latencyMs = Date.now() - t0;

    // 2. Query Academic Production Metrics
    let totalResources = 0;
    let readyForCurriculum = 0;
    let quarantinedCount = 0;
    let totalCurriculums = 0;
    let lockedCurriculums = 0;
    let totalSessions = 0;
    let syncedLms = 0;
    let totalChunks = 0;

    if (dbConnected) {
      try {
        const [rTotal, rReady, rQuarantine, cTotal, cLocked, sTotal, sLms, chunkRows] = await Promise.all([
          this.prisma.resource.count(),
          this.prisma.resource.count({ where: { approvalStatus: 'APPROVED', processingStatus: 'READY' } }),
          this.prisma.resource.count({ where: { tenantId: 'inst_legacy_quarantine' } }),
          this.prisma.masterCurriculum.count(),
          this.prisma.masterCurriculum.count({ where: { lockStatus: 'APPROVED_LOCKED' } }),
          this.prisma.sessionPackage.count(),
          this.prisma.sessionPackage.count({ where: { status: 'SYNCED_TO_LMS' } }),
          this.prisma.$queryRawUnsafe<any[]>(`SELECT COUNT(*)::int as count FROM session_vector_chunks;`),
        ]);

        totalResources = rTotal;
        readyForCurriculum = rReady;
        quarantinedCount = rQuarantine;
        totalCurriculums = cTotal;
        lockedCurriculums = cLocked;
        totalSessions = sTotal;
        syncedLms = sLms;
        totalChunks = chunkRows?.[0]?.count || 0;
      } catch (err: any) {
        this.logger.warn(`Could not fetch full metrics: ${err.message}`);
      }
    }

    const mem = process.memoryUsage();

    return {
      status: dbConnected && pgvectorVersion ? 'HEALTHY' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round((Date.now() - this.startTime) / 1000),
      environment: process.env.NODE_ENV || 'production',
      database: {
        connected: dbConnected,
        latencyMs,
        pgvectorVersion,
        activePoolConnections: 1,
      },
      storage: {
        provider: 'SUPABASE_STORAGE',
        primaryBucket: 'isml-knowledge-vault',
        status: 'READY',
      },
      aiEcosystem: {
        canonicalEmbeddingModel: 'gemini-embedding-2',
        canonicalDimension: 768,
        provider: 'GEMINI',
        hybridSearchMode: 'HYBRID_DENSE_SPARSE_RRF_60',
        multilingualSupport: ['German', 'French', 'Spanish', 'Japanese', 'Korean', 'English'],
      },
      academicMetrics: {
        totalResources,
        readyForCurriculum,
        quarantinedLegacyResources: quarantinedCount,
        totalMasterCurriculums: totalCurriculums,
        lockedCurriculums,
        totalSessionPackages: totalSessions,
        syncedToLmsCount: syncedLms,
        indexedVectorChunks: totalChunks,
      },
      memoryUsageMb: {
        rss: Math.round(mem.rss / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      },
    };
  }
}

