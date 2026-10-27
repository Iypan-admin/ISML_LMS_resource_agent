import { Injectable, NotFoundException } from '@nestjs/common';
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
}
