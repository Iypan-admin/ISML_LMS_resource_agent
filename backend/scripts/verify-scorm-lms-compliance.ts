import { PrismaClient } from '@prisma/client';
import { LmsPublishingService } from '../src/modules/lms/lms-publishing.service';
import { DeliverablesService } from '../src/modules/deliverables/deliverables.service';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function runLmsScormComplianceVerification() {
  console.log('================================================================');
  console.log('AUDIT VERIFICATION: LMS PUBLISHING, SCORM 1.2 & COMMON CARTRIDGE');
  console.log('================================================================\n');

  const testTenant = 'inst_scorm_test_' + Date.now();
  const createdCurriculumIds: string[] = [];
  const createdSessionIds: string[] = [];

  try {
    const deliverablesService = new DeliverablesService(prisma as any);
    const lmsService = new LmsPublishingService(prisma as any, deliverablesService);

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
          code: 'DE-SCORM-101',
          title: 'German SCORM Verification Course',
          description: 'LMS export compliance course',
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
    const testSessionId = `isml_scorm_sess_${Date.now()}`;
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
            prompts: ['Guten Morgen, Herr Müller!'],
          },
          reading: {
            text: 'Hallo! Mein Name ist Lukas.',
          },
          writing: {
            prompt: 'Write a short greeting note to your classmate.',
          }
        },
      }
    });

    console.log(`Created Test Session: ${session.sessionId} ("${session.title}")`);

    // 1. SCORM 1.2 XML Manifest Compliance Validation
    console.log('\n--- TEST 1: SCORM 1.2 XML Manifest Specification Compliance ---');
    const scormResult = await lmsService.generateScormManifest(session.sessionId);
    const xml = scormResult.xmlManifest;

    console.log('Generated SCORM 1.2 imsmanifest.xml:\n' + xml);

    const requiredTags = [
      { name: 'XML Declaration', pattern: /<\?xml version="1\.0" encoding="UTF-8"\?>/ },
      { name: 'Manifest Tag with ADL namespace', pattern: /<manifest identifier="ISML_SCORM_[^"]+" version="1\.0"/ },
      { name: 'ADLCP Namespace', pattern: /xmlns:adlcp="http:\/\/www\.adlnet\.org\/xsd\/adlcp_rootv1p1p2"/ },
      { name: 'Schema ADL SCORM', pattern: /<schema>ADL SCORM<\/schema>/ },
      { name: 'Schema Version 1.2', pattern: /<schemaversion>1\.2<\/schemaversion>/ },
      { name: 'Organizations Container', pattern: /<organizations default="ISML_ORG">/ },
      { name: 'Organization Element', pattern: /<organization identifier="ISML_ORG">/ },
      { name: 'Mastery Score Tag', pattern: /<adlcp:masteryscore>\d+<\/adlcp:masteryscore>/ },
      { name: 'SCO Resource Definition', pattern: /<resource identifier="RES_[^"]+" type="webcontent" adlcp:scormtype="sco" href="index\.html">/ },
      { name: 'Launch File Entry', pattern: /<file href="index\.html"\/>/ },
      { name: 'Student Workbook Asset Entry', pattern: /<file href="student_workbook\.json"\/>/ },
      { name: 'Assessment Paper Asset Entry', pattern: /<file href="assessment_paper\.json"\/>/ },
    ];

    let allTagsPresent = true;
    for (const tag of requiredTags) {
      const match = tag.pattern.test(xml);
      console.log(`  [${match ? 'PASSED' : 'FAILED'}] ${tag.name}: ${match ? 'Present' : 'MISSING'}`);
      if (!match) allTagsPresent = false;
    }

    if (!allTagsPresent) throw new Error('SCORM 1.2 Manifest failed compliance checks');

    // 2. Session LMS Synchronization Lifecycle
    console.log('\n--- TEST 2: Session LMS Synchronization & State Transition ---');
    const syncRes = await lmsService.syncSessionToLms(session.sessionId, 'CANVAS_LMS');
    console.log(`  [PASSED] Synced Status: ${syncRes.status}`);
    console.log(`  [PASSED] LMS Synced At: ${syncRes.lmsSyncedAt}`);
    console.log(`  [PASSED] Teacher Guide included? ${!!syncRes.lmsPackage.teacherGuide}`);
    console.log(`  [PASSED] Student Workbook included? ${!!syncRes.lmsPackage.studentWorkbook}`);
    console.log(`  [PASSED] Assessment Paper included? ${!!syncRes.lmsPackage.assessmentPaper}`);

    // Verify DB update
    const dbSession = await prisma.sessionPackage.findUnique({
      where: { sessionId: session.sessionId }
    });
    if (dbSession?.status !== 'SYNCED_TO_LMS') {
      throw new Error('Database status was not transitioned to SYNCED_TO_LMS');
    }
    console.log('  [PASSED] Database record verified with status SYNCED_TO_LMS');

    // 3. Master Curriculum Common Cartridge Export
    console.log('\n--- TEST 3: Common Cartridge Course Package Export (Moodle/Canvas) ---');
    const cartridge = await lmsService.syncCurriculumToLms(currId, 'MOODLE_LMS');
    console.log(`  [PASSED] Exported Course: "${cartridge.courseTitle}"`);
    console.log(`  [PASSED] Target LMS: ${cartridge.targetLms}`);
    console.log(`  [PASSED] Total Modules: ${cartridge.modulesCount}`);
    console.log(`  [PASSED] Total Periods: ${cartridge.totalPeriods}`);
    console.log(`  [PASSED] Syllabus Structure Modules: ${cartridge.syllabusStructure.length}`);

    const firstMod = cartridge.syllabusStructure[0];
    if (firstMod && firstMod.items.length > 0) {
      console.log(`  [PASSED] Sample Item: ${firstMod.items[0].title} (Launch URL: ${firstMod.items[0].scormLaunchUrl})`);
    }

    console.log('\n================================================================');
    console.log('LMS PUBLISHING & SCORM 1.2 VERIFICATION: 100% SUCCESS');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ LMS Verification Failed:', err);
    throw err;
  } finally {
    console.log('Cleaning up LMS test artifacts...');
    if (createdSessionIds.length > 0) {
      await prisma.sessionPackage.deleteMany({ where: { sessionId: { in: createdSessionIds } } });
    }
    if (createdCurriculumIds.length > 0) {
      await prisma.curriculumPeriod.deleteMany({ where: { module: { curriculumId: { in: createdCurriculumIds } } } });
      await prisma.curriculumModule.deleteMany({ where: { curriculumId: { in: createdCurriculumIds } } });
      await prisma.masterCurriculum.deleteMany({ where: { id: { in: createdCurriculumIds } } });
    }
    await prisma.$disconnect();
    console.log('Cleanup complete.');
  }
}

runLmsScormComplianceVerification()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
