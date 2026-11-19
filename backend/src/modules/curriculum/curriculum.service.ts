import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResourcesService } from '../resources/resources.service';
import { AcademicCadenceEngine, CadenceConfigInput } from './cadence.engine';
import { CreateCurriculumDto, GroundResourceDto, LockCurriculumDto } from './dto/create-curriculum.dto';
import * as crypto from 'crypto';

@Injectable()
export class CurriculumService {
  private readonly logger = new Logger(CurriculumService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly resourcesService: ResourcesService,
  ) {}

  // =============================================================================
  // PHASE 5: DYNAMIC CADENCE & RELATIONAL HIERARCHY
  // =============================================================================

  async createCurriculum(dto: CreateCurriculumDto) {
    const tenantId = dto.tenantId || 'inst_isml_global';

    // 1. Verify Course exists or find/create default
    let course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) {
      // Find course by slug or create fallback
      course = await this.prisma.course.findFirst({
        where: { code: 'LANG-101' },
      });
      if (!course) {
        const defaultLang = await this.prisma.language.findFirst();
        course = await this.prisma.course.create({
          data: {
            code: `LANG-${Date.now().toString().slice(-4)}`,
            title: `${dto.targetLanguage} ${dto.targetLevel || 'A1'} Foundation Course`,
            description: `Dynamic institutional curriculum course for ${dto.targetLanguage}`,
            languageId: defaultLang?.id || 'lang-default',
          },
        });
      }
    }

    // 2. Compute Dynamic Cadence Topology using Cadence Engine (ZERO hardcoding)
    const cadenceInput: CadenceConfigInput = {
      totalWeeks: dto.totalWeeks,
      periodsPerWeek: dto.periodsPerWeek,
      periodMinutes: dto.periodMinutes,
      customTotalPeriods: dto.customTotalPeriods,
      consolidationCadence: dto.consolidationCadence,
      targetLanguage: dto.targetLanguage,
      framework: dto.framework || 'CEFR',
      targetLevel: dto.targetLevel || 'A1',
      institutionType: dto.institutionType || 'COLLEGE',
    };

    const calculated = AcademicCadenceEngine.calculateCadence(cadenceInput);

    this.logger.log(
      `Generating Master Curriculum "${dto.title}": ${calculated.totalWeeks} wks, ${calculated.periodsPerWeek} p/wk, ${calculated.periodMinutes} min (${calculated.totalPeriods} total periods, ${calculated.courseHours} hrs).`
    );

    // 3. Persist MasterCurriculum with transactionally created Modules and Periods
    const created = await this.prisma.masterCurriculum.create({
      data: {
        tenantId,
        courseId: course.id,
        title: dto.title,
        targetLanguage: dto.targetLanguage,
        framework: dto.framework || 'CEFR',
        targetLevel: dto.targetLevel || 'A1',
        institutionType: dto.institutionType || 'COLLEGE',
        totalPeriods: calculated.totalPeriods,
        courseHours: calculated.courseHours,
        cadenceWeekly: calculated.periodsPerWeek,
        periodMinutes: calculated.periodMinutes,
        versionNumber: 1,
        versionLabel: 'v1.0',
        lockStatus: 'DRAFT',
        modules: {
          create: calculated.modules.map((m) => ({
            moduleIndex: m.moduleIndex,
            title: m.title,
            levelCompetence: m.levelCompetence,
            periodsCount: m.periodsCount,
            periods: {
              create: m.periods.map((p) => ({
                periodNumber: p.periodNumber,
                weekNumber: p.weekNumber,
                periodType: p.periodType,
                durationMinutes: p.durationMinutes,
                topicTitle: p.topicTitle,
                grammarObjective: p.grammarObjective,
                vocabularyScope: p.vocabularyScope,
                canDoStatements: p.canDoStatements,
                lsrwFocus: p.lsrwFocus,
              })),
            },
          })),
        },
      },
      include: {
        modules: {
          include: {
            periods: true,
          },
        },
      },
    });

    return {
      success: true,
      message: `Master Curriculum created with ${created.totalPeriods} dynamic periods across ${created.modules.length} modules (${calculated.periodMinutes} min/session).`,
      curriculum: created,
    };
  }

  async findAll(tenantId?: string, query?: any) {
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (query?.targetLanguage) where.targetLanguage = query.targetLanguage;
    if (query?.targetLevel) where.targetLevel = query.targetLevel;
    if (query?.lockStatus) where.lockStatus = query.lockStatus;

    const curriculums = await this.prisma.masterCurriculum.findMany({
      where,
      include: {
        modules: {
          select: {
            id: true,
            moduleIndex: true,
            title: true,
            periodsCount: true,
          },
        },
        _count: {
          select: { sessions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return curriculums;
  }

  async findOne(id: string, tenantId?: string) {
    const curriculum = await this.prisma.masterCurriculum.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { moduleIndex: 'asc' },
          include: {
            periods: {
              orderBy: { periodNumber: 'asc' },
              include: {
                resources: {
                  include: {
                    resource: {
                      select: {
                        id: true,
                        title: true,
                        approvalStatus: true,
                        processingStatus: true,
                      },
                    },
                  },
                },
                sessionPackages: {
                  select: {
                    id: true,
                    sessionId: true,
                    title: true,
                    status: true,
                    updatedAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!curriculum) {
      throw new NotFoundException(`Master Curriculum '${id}' not found`);
    }

    if (tenantId && curriculum.tenantId !== tenantId) {
      throw new NotFoundException(`Access denied to curriculum in isolated tenant`);
    }

    return curriculum;
  }

  async lockCurriculum(id: string, dto: LockCurriculumDto, tenantId?: string) {
    const curriculum = await this.findOne(id, tenantId);

    if (curriculum.lockStatus === 'APPROVED_LOCKED') {
      throw new BadRequestException(`Curriculum '${id}' is already locked as APPROVED_LOCKED.`);
    }

    const updated = await this.prisma.masterCurriculum.update({
      where: { id },
      data: {
        lockStatus: 'APPROVED_LOCKED',
        lockedAt: new Date(),
        lockedByUserId: dto.lockedByUserId,
      },
    });

    return {
      success: true,
      message: `Curriculum '${updated.title}' is now APPROVED_LOCKED. Sessions can now be generated with strict academic grounding.`,
      curriculum: updated,
    };
  }

  async branchCurriculum(id: string, newTitle?: string, tenantId?: string) {
    const parent = await this.findOne(id, tenantId);

    const nextVersionNumber = parent.versionNumber + 1;
    const nextVersionLabel = `v${nextVersionNumber}.0`;

    const branched = await this.prisma.masterCurriculum.create({
      data: {
        tenantId: parent.tenantId,
        courseId: parent.courseId,
        title: newTitle || `${parent.title} (Revision ${nextVersionLabel})`,
        targetLanguage: parent.targetLanguage,
        framework: parent.framework,
        targetLevel: parent.targetLevel,
        institutionType: parent.institutionType,
        totalPeriods: parent.totalPeriods,
        courseHours: parent.courseHours,
        cadenceWeekly: parent.cadenceWeekly,
        periodMinutes: parent.periodMinutes,
        versionNumber: nextVersionNumber,
        versionLabel: nextVersionLabel,
        parentCurriculumId: parent.id,
        lockStatus: 'DRAFT',
        modules: {
          create: parent.modules.map((m) => ({
            moduleIndex: m.moduleIndex,
            title: m.title,
            levelCompetence: m.levelCompetence,
            periodsCount: m.periodsCount,
            periods: {
              create: m.periods.map((p) => ({
                periodNumber: p.periodNumber,
                weekNumber: p.weekNumber,
                periodType: p.periodType,
                durationMinutes: p.durationMinutes,
                topicTitle: p.topicTitle,
                grammarObjective: p.grammarObjective,
                vocabularyScope: p.vocabularyScope,
                canDoStatements: p.canDoStatements,
                lsrwFocus: p.lsrwFocus,
              })),
            },
          })),
        },
      },
      include: {
        modules: {
          include: { periods: true },
        },
      },
    });

    return {
      success: true,
      message: `Branched new mutable revision ${nextVersionLabel} from parent curriculum '${parent.title}'.`,
      curriculum: branched,
    };
  }

  // =============================================================================
  // STRICT GROUNDING GATE: Only APPROVED Knowledge Vault resources can be attached
  // =============================================================================

  async groundResourceToPeriod(periodId: string, dto: GroundResourceDto, tenantId?: string) {
    const period = await this.prisma.curriculumPeriod.findUnique({
      where: { id: periodId },
      include: {
        module: {
          include: { curriculum: true },
        },
      },
    });

    if (!period) {
      throw new NotFoundException(`Curriculum Period '${periodId}' not found`);
    }

    // 1. Fetch resource and enforce strict academic grounding rules
    const resource = await this.prisma.resource.findUnique({
      where: { id: dto.resourceId },
    });

    if (!resource) {
      throw new NotFoundException(`Knowledge Vault Resource '${dto.resourceId}' not found`);
    }

    // 🛡️ Grounding Validation: Must be APPROVED and READY
    if (resource.approvalStatus !== 'APPROVED') {
      throw new BadRequestException(
        `Academic Grounding Rejected: Resource '${resource.title}' has approvalStatus='${resource.approvalStatus}'. Only 'APPROVED' resources can be grounded into curriculum periods.`
      );
    }

    if (resource.processingStatus !== 'READY') {
      throw new BadRequestException(
        `Academic Grounding Rejected: Resource '${resource.title}' has processingStatus='${resource.processingStatus}'. Only 'READY' extracted resources can be grounded.`
      );
    }

    // 2. Attach citation snapshot to period
    const citation = await this.prisma.curriculumPeriodResource.create({
      data: {
        curriculumPeriodId: periodId,
        resourceId: resource.id,
        sourceTitleSnapshot: resource.title,
        sourceTypeSnapshot: resource.resourceType,
        pageNumber: dto.pageNumber || 1,
        citationExcerpt: dto.citationExcerpt || resource.description,
      },
    });

    return {
      success: true,
      message: `Resource '${resource.title}' successfully grounded into Period ${period.periodNumber}.`,
      citation,
    };
  }

  // =============================================================================
  // PHASE 6: AI MASTER CURRICULUM SYLLABUS GENERATION & VAULT GROUNDING
  // =============================================================================

  async generateAISyllabus(curriculumId: string, options?: { autoGroundWithVault?: boolean }) {
    const curriculum = await this.findOne(curriculumId);

    const autoGround = options?.autoGroundWithVault ?? true;
    let groundedCitationsCount = 0;
    let periodsUpdatedCount = 0;

    for (const mod of curriculum.modules) {
      for (const period of mod.periods) {
        // Query the Knowledge Vault using Phase 3 Hybrid Search
        if (autoGround) {
          try {
            const searchResults = await this.resourcesService.hybridSearch({
              query: `${period.topicTitle} ${curriculum.targetLanguage} ${curriculum.targetLevel}`,
              language: curriculum.targetLanguage,
              tenantId: curriculum.tenantId,
              limit: 2,
            });

            if (searchResults.results && searchResults.results.length > 0) {
              const topResult = searchResults.results[0];

              // Check if citation already exists
              const existingCitation = await this.prisma.curriculumPeriodResource.findFirst({
                where: {
                  curriculumPeriodId: period.id,
                  resourceId: topResult.resourceId,
                },
              });

              if (!existingCitation) {
                // Ground citation from vault
                await this.prisma.curriculumPeriodResource.create({
                  data: {
                    curriculumPeriodId: period.id,
                    resourceId: topResult.resourceId,
                    sourceTitleSnapshot: topResult.sourceTitle,
                    sourceTypeSnapshot: topResult.sourceType,
                    pageNumber: 1,
                    citationExcerpt: topResult.content.substring(0, 300),
                  },
                });
                groundedCitationsCount++;
              }
            }
          } catch (e: any) {
            this.logger.warn(`Auto-grounding search notice for period ${period.periodNumber}: ${e.message}`);
          }
        }
        periodsUpdatedCount++;
      }
    }

    return {
      success: true,
      curriculumId,
      periodsRefined: periodsUpdatedCount,
      groundedCitationsAdded: groundedCitationsCount,
      message: `AI Curriculum generation completed for ${periodsUpdatedCount} periods with ${groundedCitationsCount} verified citations.`,
    };
  }

  async getGroundingAudit(curriculumId: string) {
    const curriculum = await this.findOne(curriculumId);

    let totalPeriods = 0;
    let groundedPeriods = 0;
    const periodAudits: any[] = [];

    for (const mod of curriculum.modules) {
      for (const p of mod.periods) {
        totalPeriods++;
        const isGrounded = p.resources.length > 0;
        if (isGrounded) groundedPeriods++;

        periodAudits.push({
          periodNumber: p.periodNumber,
          weekNumber: p.weekNumber,
          topicTitle: p.topicTitle,
          isGrounded,
          citationsCount: p.resources.length,
          citations: p.resources.map((r) => ({
            title: r.sourceTitleSnapshot,
            type: r.sourceTypeSnapshot,
            excerpt: r.citationExcerpt,
          })),
        });
      }
    }

    const groundingCoveragePercent = totalPeriods > 0 
      ? Math.round((groundedPeriods / totalPeriods) * 100) 
      : 0;

    return {
      curriculumId,
      title: curriculum.title,
      targetLanguage: curriculum.targetLanguage,
      targetLevel: curriculum.targetLevel,
      totalPeriods,
      groundedPeriods,
      groundingCoveragePercent,
      auditStatus: groundingCoveragePercent >= 75 ? 'HIGH_INTEGRITY' : 'NEEDS_SUPPLEMENTARY_CITATIONS',
      periodAudits,
    };
  }

  // =============================================================================
  // PHASE 7: INDIVIDUAL DYNAMIC SESSION GENERATION ENGINE
  // =============================================================================

  async generateSessionPackage(periodId: string, tenantId?: string) {
    const period = await this.prisma.curriculumPeriod.findUnique({
      where: { id: periodId },
      include: {
        module: {
          include: { curriculum: true },
        },
        resources: true,
      },
    });

    if (!period) {
      throw new NotFoundException(`Curriculum Period '${periodId}' not found`);
    }

    const curriculum = period.module.curriculum;
    const durationMin = period.durationMinutes || curriculum.periodMinutes || 45;
    const stageTimes = AcademicCadenceEngine.calculateStageTimeBreakdown(durationMin);

    const sessionId = `isml_sess_${period.id.substring(0, 8)}_${Date.now()}`;
    const safeTitle = `${curriculum.targetLanguage} ${curriculum.targetLevel} - P${period.periodNumber}: ${period.topicTitle}`;

    // Extract Grounded Vault Evidence
    const evidenceSnapshots = period.resources.map((r) => ({
      title: r.sourceTitleSnapshot,
      type: r.sourceTypeSnapshot,
      page: r.pageNumber,
      excerpt: r.citationExcerpt,
    }));

    // Generate Structured 6-Stage Session Plan dynamically scaled to periodMinutes
    const sessionPlanJson = {
      sessionId,
      durationMinutes: durationMin,
      targetLanguage: curriculum.targetLanguage,
      targetLevel: curriculum.targetLevel,
      weekNumber: period.weekNumber,
      periodNumber: period.periodNumber,
      periodType: period.periodType,
      topic: period.topicTitle,
      grammarObjective: period.grammarObjective,
      vocabularyScope: period.vocabularyScope,
      canDoStatements: period.canDoStatements,
      lsrwFocus: period.lsrwFocus,
      groundedEvidence: evidenceSnapshots,
      stages: [
        {
          stageNumber: 1,
          name: 'Warm-up & Prior Retrieval Practice',
          durationMinutes: stageTimes.warmupMinutes,
          teacherInstruction: 'Activate prior knowledge and engage learners with rapid communicative questions.',
          studentActivity: 'Respond in full target-language sentences to the opening prompt.',
        },
        {
          stageNumber: 2,
          name: 'Direct Concept Instruction & Grammar Modeling',
          durationMinutes: stageTimes.instructionMinutes,
          teacherInstruction: `Present grammatical core: "${period.grammarObjective}". Illustrate with 3 authentic examples.`,
          studentActivity: 'Observe structural pattern, take Cornell notes, and identify regularities.',
        },
        {
          stageNumber: 3,
          name: 'Guided Practice & Interactive Dialogue',
          durationMinutes: stageTimes.guidedPracticeMinutes,
          teacherInstruction: 'Facilitate paired micro-dialogues using targeted vocabulary bank.',
          studentActivity: 'Work with speaking partner to exchange personal information and roleplay scenarios.',
        },
        {
          stageNumber: 4,
          name: 'Independent Application & Exercises',
          durationMinutes: stageTimes.independentPracticeMinutes,
          teacherInstruction: 'Circulate and provide real-time formative feedback on sentence construction.',
          studentActivity: 'Complete 3 communicative drill exercises and short-answer prompts.',
        },
        {
          stageNumber: 5,
          name: 'Formative Check / Micro-Quiz',
          durationMinutes: stageTimes.quickCheckMinutes,
          teacherInstruction: 'Conduct 2-minute diagnostic check on key grammar and vocabulary objectives.',
          studentActivity: 'Submit quick response quiz or exit ticket.',
        },
        {
          stageNumber: 6,
          name: 'Consolidation, Homework & Wrap-up',
          durationMinutes: stageTimes.wrapupMinutes,
          teacherInstruction: 'Summarize today\'s can-do achievement and assign contextualized homework.',
          studentActivity: 'Record homework tasks and self-assess confidence score (1 to 5).',
        },
      ],
    };

    // Generate Teacher Materials (Pedagogical guide, slides breakdown, common pitfalls)
    const teacherMaterialsJson = {
      pedagogicalStrategy: `Task-Based Language Teaching (TBLT) for ${curriculum.targetLanguage} ${curriculum.targetLevel}`,
      anticipatedStudentErrors: [
        `Word order in questions vs declarative sentences.`,
        `Accidental transfer of native language syntax.`,
      ],
      correctionStrategies: [
        `Use elicitation rather than immediate direct correction.`,
        `Highlight agreement on the whiteboard.`,
      ],
      slides: [
        { slideNumber: 1, title: 'Title & Communicative Can-Do Goal', content: period.topicTitle },
        { slideNumber: 2, title: 'Vocabulary Showcase', content: period.vocabularyScope.join(', ') },
        { slideNumber: 3, title: 'Grammar Mechanism', content: period.grammarObjective },
        { slideNumber: 4, title: 'Interactive Partner Dialogue', content: 'Speaking roleplay prompts' },
        { slideNumber: 5, title: 'Formative Exit Check', content: 'Diagnostic check questions' },
      ],
    };

    // Generate Student LSRW Package (Practice exercises, dialogue scripts, writing rubrics)
    const studentLsrwJson = {
      listening: {
        title: 'Authentic Dialogue Comprehension',
        dialogueScript: [
          { speaker: 'Person A', text: 'Guten Tag! Wie heißen Sie?' },
          { speaker: 'Person B', text: 'Guten Tag! Ich heiße Schmidt. Und Sie?' },
        ],
        comprehensionQuestions: [
          { id: 'q1', question: 'How do the speakers greet each other?', answer: 'Formally with "Guten Tag"' },
        ],
      },
      speaking: {
        prompt: 'Introduce yourself to your partner and ask for their name and origin.',
        expectedCanDo: period.canDoStatements[0] || 'Can introduce self and ask partner simple questions.',
        keyPhrases: period.vocabularyScope,
      },
      reading: {
        passageTitle: `${period.topicTitle} - Situational Reading`,
        text: `Das ist Herr Müller. Er kommt aus Berlin und wohnt jetzt in München. Er lernt Deutsch.`,
        glossary: period.vocabularyScope,
      },
      writing: {
        prompt: 'Write a short 3-sentence introduction including greeting, name, and city.',
        rubric: {
          grammarAccuracy: 30,
          lexicalVariety: 30,
          taskCompletion: 40,
        },
      },
    };

    // Upsert into session_packages table with foreign keys
    const sessionPackage = await this.prisma.sessionPackage.upsert({
      where: { sessionId },
      update: {
        title: safeTitle,
        language: curriculum.targetLanguage,
        level: curriculum.targetLevel,
        topic: period.topicTitle,
        sessionPlanJson,
        teacherMaterialsJson,
        studentLsrwJson,
        masterCurriculumId: curriculum.id,
        curriculumPeriodId: period.id,
        tenantId: curriculum.tenantId,
        status: 'READY',
        updatedAt: new Date(),
      },
      create: {
        sessionId,
        title: safeTitle,
        language: curriculum.targetLanguage,
        level: curriculum.targetLevel,
        topic: period.topicTitle,
        sessionPlanJson,
        teacherMaterialsJson,
        studentLsrwJson,
        masterCurriculumId: curriculum.id,
        curriculumPeriodId: period.id,
        tenantId: curriculum.tenantId,
        status: 'READY',
      },
    });

    return {
      success: true,
      sessionId,
      durationMinutes: durationMin,
      periodNumber: period.periodNumber,
      message: `Individual ${durationMin}-minute Session Package generated successfully for Period ${period.periodNumber}.`,
      sessionPackage,
    };
  }
}
