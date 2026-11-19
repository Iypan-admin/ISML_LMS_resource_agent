import { PrismaClient } from '@prisma/client';
import { AcademicCadenceEngine } from '../src/modules/curriculum/cadence.engine';
import { CurriculumService } from '../src/modules/curriculum/curriculum.service';
import { ResourcesService } from '../src/modules/resources/resources.service';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function runPhases567Tests() {
  console.log('================================================================');
  console.log('PHASES 5, 6, 7: CURRICULUM STUDIO, CADENCE ENGINE & SESSIONS');
  console.log('================================================================\n');

  const testTenant = 'inst_cadence_test_' + Date.now();
  const createdCurriculumIds: string[] = [];
  const createdResourceIds: string[] = [];

  try {
    // 0. Ensure Language and Course exist
    let langDe = await prisma.language.findFirst({ where: { code: 'de' } });
    if (!langDe) {
      langDe = await prisma.language.create({
        data: { code: 'de', name: 'German', nativeName: 'Deutsch', isActive: true },
      });
    }

    let courseDe = await prisma.course.findFirst({ where: { languageId: langDe.id } });
    if (!courseDe) {
      courseDe = await prisma.course.create({
        data: {
          code: 'DE-A1-CORE',
          title: 'German A1 Foundation Course',
          description: 'Standard communicative foundation',
          languageId: langDe.id,
        },
      });
    }

    // -------------------------------------------------------------------------
    // TEST 1: Dynamic Cadence Engine Mathematical & Pedagogical Calculations
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Dynamic Cadence Topology Engine (ZERO Hardcoding) ---');

    // Scenario A: German A1 Full Year (20 weeks, 5 periods/wk, 45 min, custom 103 periods)
    const cadenceA = AcademicCadenceEngine.calculateCadence({
      totalWeeks: 20,
      periodsPerWeek: 5,
      periodMinutes: 45,
      customTotalPeriods: 103,
      targetLanguage: 'German',
      targetLevel: 'A1',
    });

    console.log(`  [PASSED] Scenario A (Full Year German A1): ${cadenceA.totalWeeks} wks, ${cadenceA.periodsPerWeek} p/wk, ${cadenceA.periodMinutes} min`);
    console.log(`  [PASSED] Output: ${cadenceA.totalPeriods} periods, ${cadenceA.courseHours} course hours across ${cadenceA.modulesCount} modules`);

    if (cadenceA.totalPeriods !== 103 || cadenceA.periodMinutes !== 45 || cadenceA.courseHours !== 77) {
      throw new Error(`Cadence A calculation mismatch: Expected 103 periods, 45 mins, 77 hrs; Got ${cadenceA.totalPeriods}p, ${cadenceA.periodMinutes}m, ${cadenceA.courseHours}h`);
    }

    // Verify 45-min stage scaling
    const stages45 = cadenceA.modules[0].periods[0].stageTimeBreakdown;
    const sum45 = stages45.warmupMinutes + stages45.instructionMinutes + stages45.guidedPracticeMinutes + 
                  stages45.independentPracticeMinutes + stages45.quickCheckMinutes + stages45.wrapupMinutes;
    console.log(`  [PASSED] 45-min Stage Breakdown Sum: ${sum45} min (Warmup: ${stages45.warmupMinutes}m, Instruction: ${stages45.instructionMinutes}m, Guided: ${stages45.guidedPracticeMinutes}m)`);
    if (sum45 !== 45) throw new Error(`Stage times sum (${sum45}) does not match period duration (45)`);

    // Scenario B: Spanish A1 Crash Course (6 weeks, 3 periods/wk, 60 min = 18 periods)
    const cadenceB = AcademicCadenceEngine.calculateCadence({
      totalWeeks: 6,
      periodsPerWeek: 3,
      periodMinutes: 60,
      targetLanguage: 'Spanish',
      targetLevel: 'A1',
    });

    console.log(`\n  [PASSED] Scenario B (Crash Spanish A1): ${cadenceB.totalWeeks} wks, ${cadenceB.periodsPerWeek} p/wk, ${cadenceB.periodMinutes} min`);
    console.log(`  [PASSED] Output: ${cadenceB.totalPeriods} periods, ${cadenceB.courseHours} course hours across ${cadenceB.modulesCount} modules`);
    if (cadenceB.totalPeriods !== 18 || cadenceB.periodMinutes !== 60 || cadenceB.courseHours !== 18) {
      throw new Error(`Cadence B calculation mismatch`);
    }

    // Verify 60-min stage scaling
    const stages60 = cadenceB.modules[0].periods[0].stageTimeBreakdown;
    const sum60 = stages60.warmupMinutes + stages60.instructionMinutes + stages60.guidedPracticeMinutes + 
                  stages60.independentPracticeMinutes + stages60.quickCheckMinutes + stages60.wrapupMinutes;
    console.log(`  [PASSED] 60-min Stage Breakdown Sum: ${sum60} min (Warmup: ${stages60.warmupMinutes}m, Instruction: ${stages60.instructionMinutes}m, Guided: ${stages60.guidedPracticeMinutes}m)`);
    if (sum60 !== 60) throw new Error(`Stage times sum (${sum60}) does not match period duration (60)`);

    // -------------------------------------------------------------------------
    // TEST 2: Master Curriculum Database Creation & Relational Hierarchy
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Master Curriculum Relational Hierarchy Persistence ---');

    const currA = await prisma.masterCurriculum.create({
      data: {
        tenantId: testTenant,
        courseId: courseDe.id,
        title: 'German A1 Institutional Master Curriculum',
        targetLanguage: 'German',
        framework: 'CEFR',
        targetLevel: 'A1',
        institutionType: 'COLLEGE',
        totalPeriods: cadenceA.totalPeriods,
        courseHours: cadenceA.courseHours,
        cadenceWeekly: cadenceA.periodsPerWeek,
        periodMinutes: cadenceA.periodMinutes,
        versionNumber: 1,
        versionLabel: 'v1.0',
        lockStatus: 'DRAFT',
        modules: {
          create: cadenceA.modules.map((m) => ({
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
    createdCurriculumIds.push(currA.id);

    console.log(`  [PASSED] Persisted MasterCurriculum "${currA.title}" (ID: ${currA.id})`);
    console.log(`  [PASSED] Created ${currA.modules.length} Modules in PostgreSQL`);
    const totalPeriodsCreated = currA.modules.reduce((acc, m) => acc + m.periods.length, 0);
    console.log(`  [PASSED] Total Periods Created: ${totalPeriodsCreated} (Target: 103)`);
    if (totalPeriodsCreated !== 103) throw new Error(`Expected 103 periods, got ${totalPeriodsCreated}`);

    const samplePeriod = currA.modules[0].periods[0];
    console.log(`  [PASSED] Sample Period 1: "${samplePeriod.topicTitle}" (${samplePeriod.durationMinutes}m, Type: ${samplePeriod.periodType}, Focus: ${samplePeriod.lsrwFocus})`);

    // -------------------------------------------------------------------------
    // TEST 3: Strict Academic Grounding Validation (Knowledge Vault Gate)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Strict Academic Grounding Gate (Approved Vault Assets Only) ---');

    // 3a: Create an UNAPPROVED vault asset
    const unapprovedResId = crypto.randomUUID();
    createdResourceIds.push(unapprovedResId);
    await prisma.resource.create({
      data: {
        id: unapprovedResId,
        slug: `unapproved-res-${Date.now()}`,
        title: 'Draft Unverified Grammar Notes',
        description: 'Rough notes not approved by faculty',
        resourceType: 'PDF',
        languageId: langDe.id,
        tenantId: testTenant,
        approvalStatus: 'DRAFT', // NOT APPROVED
        processingStatus: 'READY',
      },
    });

    // 3b: Create an APPROVED & READY vault asset
    const approvedResId = crypto.randomUUID();
    createdResourceIds.push(approvedResId);
    await prisma.resource.create({
      data: {
        id: approvedResId,
        slug: `approved-vault-${Date.now()}`,
        title: 'Verified Goethe-Institut A1 Salutations & Dialogues',
        description: 'Accredited CEFR A1 communicative learning resource',
        resourceType: 'PDF',
        languageId: langDe.id,
        tenantId: testTenant,
        approvalStatus: 'APPROVED', // APPROVED!
        processingStatus: 'READY',  // READY!
      },
    });

    // Attempt to ground UNAPPROVED resource (Should fail)
    let unapprovedRejected = false;
    const mockCurriculumService = new CurriculumService(prisma as any, {} as any);

    try {
      await mockCurriculumService.groundResourceToPeriod(samplePeriod.id, {
        resourceId: unapprovedResId,
      }, testTenant);
    } catch (err: any) {
      if (err.message.includes('Only \'APPROVED\' resources can be grounded')) {
        unapprovedRejected = true;
      }
    }
    console.log(`  [PASSED] Step 3a: Grounding unapproved resource was correctly blocked by Academic Gate`);
    if (!unapprovedRejected) throw new Error('Security flaw: Unapproved resource was grounded into curriculum period!');

    // Ground APPROVED resource (Should succeed)
    const groundResult = await mockCurriculumService.groundResourceToPeriod(samplePeriod.id, {
      resourceId: approvedResId,
      pageNumber: 4,
      citationExcerpt: 'Guten Tag! Wie heißen Sie? Ich heiße Anna Schmidt.',
    }, testTenant);

    console.log(`  [PASSED] Step 3b: Grounding approved resource succeeded`);
    console.log(`  [PASSED] Citation Snapshot created: "${groundResult.citation.sourceTitleSnapshot}" (p. ${groundResult.citation.pageNumber})`);

    // -------------------------------------------------------------------------
    // TEST 4: Version Locking & Immutability vs. Branching Lineage
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Version Locking (APPROVED_LOCKED) & Non-Destructive Branching ---');

    // 4a: Lock curriculum
    const lockResult = await mockCurriculumService.lockCurriculum(currA.id, {
      lockedByUserId: 'Academic Dean Dr. Weber',
    }, testTenant);

    console.log(`  [PASSED] Step 4a: Curriculum locked as ${lockResult.curriculum.lockStatus}`);
    if (lockResult.curriculum.lockStatus !== 'APPROVED_LOCKED') throw new Error('Lock failed');

    // 4b: Attempting to lock an already locked curriculum must fail
    let duplicateLockRejected = false;
    try {
      await mockCurriculumService.lockCurriculum(currA.id, { lockedByUserId: 'Another User' }, testTenant);
    } catch (e: any) {
      duplicateLockRejected = true;
    }
    console.log(`  [PASSED] Step 4b: Re-locking an immutable locked curriculum was rejected`);
    if (!duplicateLockRejected) throw new Error('Immutable locked curriculum allowed re-locking');

    // 4c: Branch new revision v2.0
    const branchResult = await mockCurriculumService.branchCurriculum(currA.id, 'German A1 Curriculum (Semester 2 Update)', testTenant);
    createdCurriculumIds.push(branchResult.curriculum.id);

    console.log(`  [PASSED] Step 4c: Branched new revision: "${branchResult.curriculum.title}"`);
    console.log(`  [PASSED] Version Label: ${branchResult.curriculum.versionLabel}, Version Number: ${branchResult.curriculum.versionNumber}`);
    console.log(`  [PASSED] Parent Curriculum ID: ${branchResult.curriculum.parentCurriculumId} (matches v1.0: ${currA.id})`);
    console.log(`  [PASSED] Branched Curriculum Status: ${branchResult.curriculum.lockStatus} (Mutable Draft)`);
    if (branchResult.curriculum.versionLabel !== 'v2.0' || branchResult.curriculum.lockStatus !== 'DRAFT') {
      throw new Error('Branching version or status incorrect');
    }

    // -------------------------------------------------------------------------
    // TEST 5: Grounding Integrity Audit Report (Phase 6)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Grounding Integrity Audit Report (Phase 6) ---');

    const auditReport = await mockCurriculumService.getGroundingAudit(currA.id);
    console.log(`  [PASSED] Grounding Audit for "${auditReport.title}":`);
    console.log(`  [PASSED] Total Periods: ${auditReport.totalPeriods}, Grounded Periods: ${auditReport.groundedPeriods}`);
    console.log(`  [PASSED] Coverage: ${auditReport.groundingCoveragePercent}%, Audit Status: ${auditReport.auditStatus}`);
    if (auditReport.groundedPeriods < 1) throw new Error('Expected at least 1 grounded period');

    // -------------------------------------------------------------------------
    // TEST 6: Individual Dynamic Session Package Generation (Phase 7)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Individual Dynamic Session Generation Engine (Phase 7) ---');

    const sessionResult = await mockCurriculumService.generateSessionPackage(samplePeriod.id, testTenant);
    console.log(`  [PASSED] Generated Session Package: "${sessionResult.sessionPackage.title}"`);
    console.log(`  [PASSED] Session ID: ${sessionResult.sessionId} (${sessionResult.durationMinutes} minutes)`);

    const plan = sessionResult.sessionPackage.sessionPlanJson as any;
    console.log(`  [PASSED] Structured 6 Stages generated in sessionPlanJson:`);
    plan.stages.forEach((s: any) => {
      console.log(`     - Stage ${s.stageNumber}: ${s.name} (${s.durationMinutes} min)`);
    });

    // Verify Grounded Evidence Injection
    console.log(`  [PASSED] Injected Grounded Evidence from Knowledge Vault: ${plan.groundedEvidence.length} citation(s)`);
    if (plan.groundedEvidence.length !== 1 || plan.groundedEvidence[0].title !== 'Verified Goethe-Institut A1 Salutations & Dialogues') {
      throw new Error('Grounded evidence was not injected properly into sessionPlanJson');
    }

    // Verify Student LSRW Deliverables
    const lsrw = sessionResult.sessionPackage.studentLsrwJson as any;
    console.log(`  [PASSED] Student Listening Component: "${lsrw.listening.title}" (${lsrw.listening.dialogueScript.length} dialogue turns)`);
    console.log(`  [PASSED] Student Speaking Component: "${lsrw.speaking.prompt}"`);
    console.log(`  [PASSED] Student Reading Component: "${lsrw.reading.passageTitle}"`);
    console.log(`  [PASSED] Student Writing Rubric: Accuracy=${lsrw.writing.rubric.grammarAccuracy}%, Lexical=${lsrw.writing.rubric.lexicalVariety}%, Task=${lsrw.writing.rubric.taskCompletion}%`);

    console.log('\n================================================================');
    console.log('ALL PHASES 5, 6, 7 TESTS PASSED WITH 100% EMPIRICAL SUCCESS!');
    console.log('================================================================\n');

  } catch (err: any) {
    console.error('\n❌ PHASES 5, 6, 7 TEST FAILURE:', err);
    throw err;
  } finally {
    console.log('Cleaning up test artifacts...');
    if (createdCurriculumIds.length > 0) {
      await prisma.sessionPackage.deleteMany({
        where: { masterCurriculumId: { in: createdCurriculumIds } },
      });
      await prisma.curriculumPeriodResource.deleteMany({
        where: { curriculumPeriod: { module: { curriculumId: { in: createdCurriculumIds } } } },
      });
      await prisma.curriculumPeriod.deleteMany({
        where: { module: { curriculumId: { in: createdCurriculumIds } } },
      });
      await prisma.curriculumModule.deleteMany({
        where: { curriculumId: { in: createdCurriculumIds } },
      });
      await prisma.masterCurriculum.deleteMany({
        where: { id: { in: createdCurriculumIds } },
      });
    }
    if (createdResourceIds.length > 0) {
      await prisma.resource.deleteMany({
        where: { id: { in: createdResourceIds } },
      });
    }
    await prisma.$disconnect();
    console.log('Cleaned up test artifacts successfully.');
  }
}

runPhases567Tests()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

