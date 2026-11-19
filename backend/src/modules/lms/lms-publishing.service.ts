import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeliverablesService } from '../deliverables/deliverables.service';

export interface LmsCourseCartridge {
  courseId: string;
  courseTitle: string;
  language: string;
  level: string;
  targetLms: string; // 'CANVAS' | 'MOODLE' | 'BLACKBOARD' | 'ISML_LMS'
  modulesCount: number;
  totalPeriods: number;
  exportedAt: string;
  syllabusStructure: {
    moduleIndex: number;
    moduleTitle: string;
    items: {
      periodNumber: number;
      title: string;
      itemType: string;
      durationMinutes: number;
      sessionId?: string;
      scormLaunchUrl?: string;
    }[];
  }[];
}

@Injectable()
export class LmsPublishingService {
  private readonly logger = new Logger(LmsPublishingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly deliverablesService: DeliverablesService,
  ) {}

  /**
   * Generates a SCORM 1.2 / 2004 manifest XML structure for a session.
   */
  async generateScormManifest(sessionId: string): Promise<{ xmlManifest: string; launchFile: string }> {
    const session = await this.prisma.sessionPackage.findUnique({
      where: { sessionId },
      include: { curriculumPeriod: true },
    });

    if (!session) {
      throw new NotFoundException(`Session '${sessionId}' not found`);
    }

    const identifier = `ISML_SCORM_${sessionId}`;
    const title = session.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const xmlManifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${identifier}" version="1.0"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ISML_ORG">
    <organization identifier="ISML_ORG">
      <title>${title}</title>
      <item identifier="ITEM_${sessionId}" identifierref="RES_${sessionId}">
        <title>${title}</title>
        <adlcp:masteryscore>80</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES_${sessionId}" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="student_workbook.json"/>
      <file href="assessment_paper.json"/>
    </resource>
  </resources>
</manifest>`;

    return {
      xmlManifest,
      launchFile: 'index.html',
    };
  }

  /**
   * Synchronizes an individual session to LMS format and updates status.
   */
  async syncSessionToLms(sessionId: string, targetLms: string = 'ISML_LMS') {
    const session = await this.prisma.sessionPackage.findUnique({
      where: { sessionId },
      include: { curriculumPeriod: true, masterCurriculum: true },
    });

    if (!session) {
      throw new NotFoundException(`Session '${sessionId}' not found`);
    }

    // Ensure segregated deliverables exist
    const deliverables = await this.deliverablesService.generateDeliverables(sessionId);
    const scormManifest = await this.generateScormManifest(sessionId);

    const lmsPayload = {
      sessionId,
      targetLms,
      syncedAt: new Date().toISOString(),
      courseTitle: session.masterCurriculum?.title || session.title,
      periodNumber: session.curriculumPeriod?.periodNumber || 1,
      language: session.language,
      level: session.level,
      scorm: scormManifest,
      teacherGuide: deliverables.teacherGuide,
      studentWorkbook: deliverables.studentWorkbook,
      assessmentPaper: deliverables.assessmentPaper,
    };

    // Transition Session Status to SYNCED_TO_LMS and record timestamp
    const updated = await this.prisma.sessionPackage.update({
      where: { sessionId },
      data: {
        status: 'SYNCED_TO_LMS',
        lmsSyncedAt: new Date(),
        lmsPackageJson: lmsPayload as any,
      },
    });

    this.logger.log(`Session ${sessionId} successfully synced to ${targetLms} with status SYNCED_TO_LMS`);

    return {
      success: true,
      sessionId,
      status: updated.status,
      lmsSyncedAt: updated.lmsSyncedAt,
      message: `Session '${session.title}' synchronized to ${targetLms} with SCORM 1.2 manifest and deliverables.`,
      lmsPackage: lmsPayload,
    };
  }

  /**
   * Packages and synchronizes an entire Master Curriculum into Common Cartridge format.
   */
  async syncCurriculumToLms(curriculumId: string, targetLms: string = 'CANVAS'): Promise<LmsCourseCartridge> {
    const curriculum = await this.prisma.masterCurriculum.findUnique({
      where: { id: curriculumId },
      include: {
        modules: {
          orderBy: { moduleIndex: 'asc' },
          include: {
            periods: {
              orderBy: { periodNumber: 'asc' },
              include: {
                sessionPackages: true,
              },
            },
          },
        },
      },
    });

    if (!curriculum) {
      throw new NotFoundException(`Curriculum '${curriculumId}' not found`);
    }

    const syllabusStructure: any[] = [];

    for (const mod of curriculum.modules) {
      const items: any[] = [];
      for (const p of mod.periods) {
        const session = p.sessionPackages?.[0];
        if (session) {
          // Sync session
          await this.prisma.sessionPackage.update({
            where: { id: session.id },
            data: {
              status: 'SYNCED_TO_LMS',
              lmsSyncedAt: new Date(),
            },
          });
        }

        items.push({
          periodNumber: p.periodNumber,
          title: `Period ${p.periodNumber}: ${p.topicTitle}`,
          itemType: p.periodType,
          durationMinutes: p.durationMinutes || curriculum.periodMinutes,
          sessionId: session?.sessionId || null,
          scormLaunchUrl: session ? `/lms/launch/${session.sessionId}` : null,
        });
      }

      syllabusStructure.push({
        moduleIndex: mod.moduleIndex,
        moduleTitle: mod.title,
        items,
      });
    }

    const cartridge: LmsCourseCartridge = {
      courseId: curriculum.id,
      courseTitle: curriculum.title,
      language: curriculum.targetLanguage,
      level: curriculum.targetLevel,
      targetLms,
      modulesCount: curriculum.modules.length,
      totalPeriods: curriculum.totalPeriods,
      exportedAt: new Date().toISOString(),
      syllabusStructure,
    };

    this.logger.log(`Full Master Curriculum '${curriculum.title}' exported to ${targetLms} Common Cartridge structure`);
    return cartridge;
  }
}

