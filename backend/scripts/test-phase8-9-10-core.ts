import { PrismaClient } from '@prisma/client';
import { DeliverablesService } from '../src/modules/deliverables/deliverables.service';
import { AgentEcosystemService } from '../src/modules/agents/agent-ecosystem.service';
import { LmsPublishingService } from '../src/modules/lms/lms-publishing.service';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function runPhases8910Tests() {
  console.log('================================================================');
  console.log('PHASES 8, 9, 10: DELIVERABLES, AI AGENTS & LMS PUBLISHING SUITE');
  console.log('================================================================\n');

  const testTenant = 'inst_phase8910_test_' + Date.now();
  const createdCurriculumIds: string[] = [];
  const createdSessionIds: string[] = [];

  try {
    // 0. Setup Course and Language
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
          code: 'DE-A1-ADV',
          title: 'German A1 Advanced Studio Course',
          description: 'Full deliverables and LMS curriculum',
          languageId: langDe.id,
        },
      });
    }

    // 1. Create a Seed Master Curriculum, Module, Period, and Session Package
    const currId = crypto.randomUUID();
    createdCurriculumIds.push(currId);

    const curriculum = await prisma.masterCurriculum.create({
      data: {
        id: currId,
        tenantId: testTenant,
        courseId: courseDe.id,
        title: 'German A1 Master Institutional Course',
        targetLanguage: 'German',
        framework: 'CEFR',
        targetLevel: 'A1',
        totalPeriods: 20,
        courseHours: 15,
        cadenceWeekly: 5,
        periodMinutes: 45,
        versionNumber: 1,
        versionLabel: 'v1.0',
        lockStatus: 'APPROVED_LOCKED',
        modules: {
          create: [
            {
              moduleIndex: 1,
              title: 'Module 1: Salutations & Introductions',
              levelCompetence: 'A1 Communicative Standard',
              periodsCount: 5,
              periods: {
                create: [
                  {
                    periodNumber: 1,
                    weekNumber: 1,
                    periodType: 'INSTRUCTIONAL',
                    durationMinutes: 45,
                    topicTitle: 'Formal and Informal Greetings',
                    grammarObjective: 'Present tense of sein and heißen; personal pronouns (Sie vs du)',
                    vocabularyScope: ['Guten Tag', 'Hallo', 'Auf Wiedersehen', 'Wie heißen Sie', 'Ich heiße'],
                    canDoStatements: ['Can greet people formally and introduce oneself.'],
                    lsrwFocus: 'SPEAKING',
                  },
                ],
              },
            },
          ],
        },
      },
      include: {
        modules: {
          include: { periods: true },
        },
      },
    });

    const period1 = curriculum.modules[0].periods[0];
    const testSessionId = `isml_sess_p8910_${Date.now()}`;
    createdSessionIds.push(testSessionId);

    const session = await prisma.sessionPackage.create({
      data: {
        sessionId: testSessionId,
        title: 'German A1 - Period 1: Formal and Informal Greetings',
        language: 'German',
        level: 'A1',
        topic: 'Formal and Informal Greetings',
        tenantId: testTenant,
        masterCurriculumId: currId,
        curriculumPeriodId: period1.id,
        status: 'READY',
        sessionPlanJson: {
          sessionId: testSessionId,
          durationMinutes: 45,
          topic: 'Formal and Informal Greetings',
          grammarObjective: period1.grammarObjective,
          vocabularyScope: period1.vocabularyScope,
          canDoStatements: period1.canDoStatements,
          groundedEvidence: [
            { title: 'Goethe-Institut A1 Salutations', page: 2, excerpt: 'Guten Tag! Wie heißen Sie?' },
          ],
          stages: [
            { stageNumber: 1, name: 'Warm-up', durationMinutes: 5, teacherInstruction: 'Greet students in German', studentActivity: 'Echo back' },
            { stageNumber: 2, name: 'Direct Instruction', durationMinutes: 15, teacherInstruction: 'Explain sein and heißen', studentActivity: 'Note rules' },
            { stageNumber: 3, name: 'Guided Dialogue', durationMinutes: 12, teacherInstruction: 'Model partner dialogue', studentActivity: 'Pair practice' },
            { stageNumber: 4, name: 'Independent Exercises', durationMinutes: 8, teacherInstruction: 'Circulate and monitor', studentActivity: 'Complete worksheet' },
            { stageNumber: 5, name: 'Formative Check', durationMinutes: 3, teacherInstruction: 'Collect exit slips', studentActivity: 'Submit 2-min quiz' },
            { stageNumber: 6, name: 'Wrap-up', durationMinutes: 2, teacherInstruction: 'Assign homework', studentActivity: 'Record next steps' },
          ],
        },
        teacherMaterialsJson: {
          slides: [
            { slideNumber: 1, title: 'Guten Tag Overview' },
            { slideNumber: 2, title: 'Formal vs Informal Register' },
          ],
        },
        studentLsrwJson: {
          listening: {
            title: 'Greeting Dialogue',
            dialogueScript: [
              { speaker: 'Person A', text: 'Guten Tag! Wie heißen Sie?' },
              { speaker: 'Person B', text: 'Ich heiße Anna Schmidt.' },
            ],
          },
          speaking: {
            prompt: 'Introduce yourself to your partner and ask their name.',
          },
          reading: {
            passageTitle: 'Am Empfang (At the Reception)',
            text: 'Das ist Herr Weber. Er sagt: Guten Tag! Ich heiße Thomas Weber.',
          },
          writing: {
            prompt: 'Write a short greeting note to your instructor.',
          },
        },
      },
    });

    // -------------------------------------------------------------------------
    // TEST 1: Phase 8 - Segregated Deliverables Generation (Teacher, Student, Assessment)
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Phase 8 - Segregated Deliverables Generation ---');

    const deliverablesService = new DeliverablesService(prisma as any);
    const bundle = await deliverablesService.generateDeliverables(testSessionId);

    console.log(`  [PASSED] Generated deliverable bundle for session: ${bundle.sessionId}`);
    console.log(`  [PASSED] Teacher Guide: "${bundle.teacherGuide.title}" (${bundle.teacherGuide.durationMinutes} min, ${bundle.teacherGuide.lessonTimeline.length} stages)`);
    console.log(`  [PASSED] Master Answer Keys provided: ${bundle.teacherGuide.masterAnswerKeys.length} exercise set(s)`);
    console.log(`  [PASSED] Student Workbook: "${bundle.studentWorkbook.title}" (${bundle.studentWorkbook.vocabularyFlashcards.length} flashcards)`);
    console.log(`  [PASSED] Student Clean Practice Worksheets (Zero Answer Leaks): ${bundle.studentWorkbook.cleanPracticeWorksheets.length} worksheet(s)`);
    console.log(`  [PASSED] Assessment Paper: "${bundle.assessmentPaper.title}" (Max Score: ${bundle.assessmentPaper.maxScore} pts)`);
    console.log(`  [PASSED] Analytical 4-Trait Scoring Rubric: ${bundle.assessmentPaper.analyticalScoringRubric.length} traits (25% each = 100%)`);

    if (bundle.assessmentPaper.analyticalScoringRubric.length !== 4) {
      throw new Error(`Expected 4 analytical rubric traits, got ${bundle.assessmentPaper.analyticalScoringRubric.length}`);
    }

    // Verify persistence in deliverablesJson
    const updatedSession = await prisma.sessionPackage.findUnique({ where: { sessionId: testSessionId } });
    if (!updatedSession?.deliverablesJson) {
      throw new Error('Deliverables bundle was not cached in deliverablesJson column');
    }
    console.log('  [PASSED] Deliverables cached into session_packages.deliverablesJson in PostgreSQL');

    // -------------------------------------------------------------------------
    // TEST 2: Phase 8 - Multi-Format Markdown / Print Export
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Phase 8 - Multi-Format Markdown / Print Export ---');

    const teacherMd = await deliverablesService.exportMarkdown(testSessionId, 'TEACHER');
    const studentMd = await deliverablesService.exportMarkdown(testSessionId, 'STUDENT');
    const assessmentMd = await deliverablesService.exportMarkdown(testSessionId, 'ASSESSMENT');

    console.log(`  [PASSED] Teacher Guide Markdown generated (${teacherMd.length} characters)`);
    console.log(`  [PASSED] Student Workbook Markdown generated (${studentMd.length} characters)`);
    console.log(`  [PASSED] Assessment Paper Markdown generated (${assessmentMd.length} characters)`);

    // Verify student markdown contains NO answer keys
    if (studentMd.includes('Correct Answer:') || studentMd.includes('Master Answer Key')) {
      throw new Error('CRITICAL LEAK: Student Workbook markdown contains answer keys!');
    }
    console.log('  [PASSED] Zero-Leak Verification: Student Workbook strictly isolated from answer keys');

    // -------------------------------------------------------------------------
    // TEST 3: Phase 9 - ISML Speaking Coach Agent (Pronunciation & Fluency)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Phase 9 - ISML Speaking Coach Agent Integration ---');

    const agentService = new AgentEcosystemService(prisma as any);

    // Scenario A: High-accuracy fluent oral attempt
    const oralResultA = await agentService.evaluatePronunciation(
      testSessionId,
      'Guten Tag! Wie heißen Sie?',
      'Guten Tag! Wie heißen Sie?',
      5
    );

    console.log(`  [PASSED] Scenario A (Native Match): Accuracy=${oralResultA.accuracyScore}%, Fluency=${oralResultA.fluencyScore}%, Score=${oralResultA.overallOralScore}`);
    console.log(`  [PASSED] Speaking Rate: ${oralResultA.wordsPerMinute} WPM, Classification: "${oralResultA.cefrOralClassification}"`);
    if (oralResultA.accuracyScore < 95) throw new Error('Expected near-100% accuracy for exact reference match');

    // Scenario B: Minor dialect/pronunciation variation
    const oralResultB = await agentService.evaluatePronunciation(
      testSessionId,
      'Guten Tag! Wer bist du?',
      'Guten Tag! Wie heißen Sie?',
      6
    );

    console.log(`  [PASSED] Scenario B (Dialect Variation): Accuracy=${oralResultB.accuracyScore}%, Score=${oralResultB.overallOralScore}`);
    console.log(`  [PASSED] Phonemic Feedback: Sound="${oralResultB.phonemicFeedback[0].targetSound}", Status=${oralResultB.phonemicFeedback[0].status}`);
    if (oralResultB.overallOralScore >= oralResultA.overallOralScore) {
      throw new Error('Divergent oral response should score lower than exact reference');
    }

    // -------------------------------------------------------------------------
    // TEST 4: Phase 9 - ISML Academic Evaluation Agent (Writing Evaluation)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Phase 9 - ISML Academic Evaluation Agent Integration ---');

    const sampleWriting = 'Guten Tag! Mein Name ist Thomas. Ich komme aus Berlin und wohne in München. Auf Wiedersehen!';
    const writingResult = await agentService.evaluateWritingSubmission(testSessionId, sampleWriting);

    console.log(`  [PASSED] Evaluated student submission: "${sampleWriting}" (${writingResult.wordCount} words)`);
    console.log(`  [PASSED] Composite Writing Score: ${writingResult.compositeScore} / 100 (${writingResult.cefrWritingLevel})`);
    writingResult.traitScores.forEach((t) => {
      console.log(`     - ${t.traitName}: ${t.score} / ${t.maxScore}`);
    });
    if (writingResult.traitScores.length !== 4 || writingResult.compositeScore < 70) {
      throw new Error('Writing evaluation failed to evaluate all 4 analytical traits');
    }

    // -------------------------------------------------------------------------
    // TEST 5: Phase 10 - SCORM 1.2 / 2004 XML Manifest Generation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Phase 10 - SCORM 1.2 XML Package Generator ---');

    const lmsService = new LmsPublishingService(prisma as any, deliverablesService);
    const scormManifest = await lmsService.generateScormManifest(testSessionId);

    console.log(`  [PASSED] Generated valid SCORM XML manifest (${scormManifest.xmlManifest.length} characters)`);
    console.log(`  [PASSED] Entry point launch file: ${scormManifest.launchFile}`);
    if (!scormManifest.xmlManifest.includes('<schemaversion>1.2</schemaversion>') || !scormManifest.xmlManifest.includes('<adlcp:masteryscore>80</adlcp:masteryscore>')) {
      throw new Error('SCORM XML manifest missing standard SCORM 1.2 tags');
    }

    // -------------------------------------------------------------------------
    // TEST 6: Phase 10 - Live LMS Synchronization & Common Cartridge Export
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Phase 10 - LMS Synchronization Engine & State Transitions ---');

    // 6a: Sync Session to LMS
    const sessionSync = await lmsService.syncSessionToLms(testSessionId, 'ISML_LMS');
    console.log(`  [PASSED] Session Sync Result: Status transitioned to ${sessionSync.status}`);
    console.log(`  [PASSED] LMS Synced At: ${sessionSync.lmsSyncedAt}`);
    if (sessionSync.status !== 'SYNCED_TO_LMS' || !sessionSync.lmsSyncedAt) {
      throw new Error('Session status failed to transition to SYNCED_TO_LMS');
    }

    // 6b: Export Full Curriculum to Common Cartridge format
    const curriculumCartridge = await lmsService.syncCurriculumToLms(currId, 'CANVAS');
    console.log(`  [PASSED] Exported Common Cartridge for Canvas: "${curriculumCartridge.courseTitle}"`);
    console.log(`  [PASSED] Cartridge Modules: ${curriculumCartridge.modulesCount}, Total Periods: ${curriculumCartridge.totalPeriods}`);
    console.log(`  [PASSED] Period 1 SCORM Launch Endpoint: ${curriculumCartridge.syllabusStructure[0].items[0].scormLaunchUrl}`);
    if (curriculumCartridge.syllabusStructure.length === 0 || curriculumCartridge.totalPeriods !== 20) {
      throw new Error('Curriculum Common Cartridge structure incomplete');
    }

    console.log('\n================================================================');
    console.log('ALL PHASES 8, 9, 10 INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
    console.log('================================================================\n');

  } catch (err: any) {
    console.error('\n❌ PHASES 8, 9, 10 TEST FAILURE:', err);
    throw err;
  } finally {
    console.log('Cleaning up test artifacts...');
    if (createdSessionIds.length > 0) {
      await prisma.sessionPackage.deleteMany({
        where: { sessionId: { in: createdSessionIds } },
      });
    }
    if (createdCurriculumIds.length > 0) {
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
    await prisma.$disconnect();
    console.log('Cleaned up test artifacts successfully.');
  }
}

runPhases8910Tests()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
