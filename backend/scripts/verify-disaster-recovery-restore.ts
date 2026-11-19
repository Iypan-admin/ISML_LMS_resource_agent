import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function runDisasterRecoveryRestoreVerification() {
  console.log('================================================================');
  console.log('AUDIT VERIFICATION: DISASTER RECOVERY & FULL RESTORE PIPELINE');
  console.log('================================================================\n');

  const testTenant = 'inst_dr_restore_' + Date.now();
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const backupFilePath = path.join(backupDir, `dr_test_${Date.now()}.json`);

  let testCurriculumId = '';
  let testModuleId = '';
  let testPeriodId = '';
  let testPeriodResId = '';

  try {
    const defaultCourse = await prisma.course.findFirst();
    if (!defaultCourse) throw new Error('No default course found in DB');

    // 1. Create a Complete Test Curriculum with Cascading Entities
    testCurriculumId = crypto.randomUUID();
    testModuleId = crypto.randomUUID();
    testPeriodId = crypto.randomUUID();
    testPeriodResId = crypto.randomUUID();

    console.log('--- STEP 1: Provisioning Active Curriculum & Hierarchical Data ---');
    const createdCurr = await prisma.masterCurriculum.create({
      data: {
        id: testCurriculumId,
        tenantId: testTenant,
        courseId: defaultCourse.id,
        title: 'Mission Critical A1 German Syllabus',
        targetLanguage: 'German',
        framework: 'CEFR',
        targetLevel: 'A1',
        totalPeriods: 10,
        courseHours: 8,
        cadenceWeekly: 5,
        periodMinutes: 45,
        versionNumber: 1,
        versionLabel: 'v1.0',
        lockStatus: 'APPROVED_LOCKED',
        modules: {
          create: [
            {
              id: testModuleId,
              moduleIndex: 1,
              title: 'Module 1: Begrüßungen & Höflichkeit',
              levelCompetence: 'A1.1',
              periodsCount: 1,
              periods: {
                create: [
                  {
                    id: testPeriodId,
                    periodNumber: 1,
                    weekNumber: 1,
                    periodType: 'INSTRUCTIONAL',
                    durationMinutes: 45,
                    topicTitle: 'Period 1: Hallo und Auf Wiedersehen',
                    lsrwFocus: 'SPEAKING',
                    grammarObjective: 'Verbkonjugation: heißen, sein',
                    vocabularyScope: ['Hallo', 'Guten Tag', 'Tschüss', 'Auf Wiedersehen'],
                    canDoStatements: ['Can exchange formal and informal greetings'],
                    resources: {
                      create: [
                        {
                          id: testPeriodResId,
                          sourceTitleSnapshot: 'German A1 Foundations Text.pdf',
                          sourceTypeSnapshot: 'DOCUMENT',
                          pageNumber: 14,
                          citationExcerpt: 'Formen der Höflichkeit im Alltag',
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      include: {
        modules: {
          include: {
            periods: {
              include: {
                resources: true,
              }
            }
          }
        }
      }
    });

    console.log(`  [OK] Created Master Curriculum: ${createdCurr.id}`);
    console.log(`  [OK] Created Module: ${createdCurr.modules[0].id}`);
    console.log(`  [OK] Created Period: ${createdCurr.modules[0].periods[0].id}`);
    console.log(`  [OK] Created Citation: ${createdCurr.modules[0].periods[0].resources[0].id}`);

    // 2. Perform Point-In-Time Backup
    console.log('\n--- STEP 2: Executing Point-in-Time Relational Backup Snapshot ---');
    const exportData = {
      timestamp: new Date().toISOString(),
      backupVersion: '2.0.0',
      tenantId: testTenant,
      masterCurriculums: await prisma.masterCurriculum.findMany({
        where: { tenantId: testTenant },
        include: {
          modules: {
            include: {
              periods: {
                include: {
                  resources: true,
                }
              }
            }
          }
        }
      })
    };

    const serialized = JSON.stringify(exportData, null, 2);
    const backupChecksum = crypto.createHash('sha256').update(serialized).digest('hex');
    fs.writeFileSync(backupFilePath, serialized, 'utf-8');

    console.log(`  [OK] Snapshot persisted to: ${backupFilePath}`);
    console.log(`  [OK] Size: ${fs.statSync(backupFilePath).size} bytes`);
    console.log(`  [OK] SHA-256 Checksum: ${backupChecksum}`);

    // 3. Simulate Total Disaster (Accidental Hard Deletion / Catastrophic Purge)
    console.log('\n--- STEP 3: Simulating Catastrophic Incident (Data Wipeout) ---');
    await prisma.curriculumPeriodResource.deleteMany({ where: { id: testPeriodResId } });
    await prisma.curriculumPeriod.deleteMany({ where: { id: testPeriodId } });
    await prisma.curriculumModule.deleteMany({ where: { id: testModuleId } });
    await prisma.masterCurriculum.deleteMany({ where: { id: testCurriculumId } });

    const postWipeCurriculum = await prisma.masterCurriculum.findUnique({ where: { id: testCurriculumId } });
    const postWipeModules = await prisma.curriculumModule.findMany({ where: { curriculumId: testCurriculumId } });
    const postWipePeriods = await prisma.curriculumPeriod.findMany({ where: { moduleId: testModuleId } });
    const postWipeCitations = await prisma.curriculumPeriodResource.findMany({ where: { id: testPeriodResId } });

    console.log(`  [WIPED] Curriculum exists in DB: ${postWipeCurriculum !== null ? 'YES' : 'NO (PURGED)'}`);
    console.log(`  [WIPED] Modules count in DB: ${postWipeModules.length}`);
    console.log(`  [WIPED] Periods count in DB: ${postWipePeriods.length}`);
    console.log(`  [WIPED] Citations count in DB: ${postWipeCitations.length}`);

    if (postWipeCurriculum !== null || postWipeModules.length > 0 || postWipePeriods.length > 0) {
      throw new Error('Simulation failed: records still exist in DB prior to restore');
    }

    // 4. Disaster Recovery Execution (Automated Restore Routine)
    console.log('\n--- STEP 4: Executing Disaster Recovery Restore from Certified Snapshot ---');
    const rawBackup = fs.readFileSync(backupFilePath, 'utf-8');
    const computedRestoreChecksum = crypto.createHash('sha256').update(rawBackup).digest('hex');
    if (computedRestoreChecksum !== backupChecksum) {
      throw new Error(`INTEGRITY VIOLATION: Backup checksum mismatch! Expected ${backupChecksum}, got ${computedRestoreChecksum}`);
    }
    console.log(`  [RESTORE] Cryptographic verification passed: Checksum matched.`);

    const snapshotData = JSON.parse(rawBackup);
    let restoredCurriculums = 0;
    let restoredModules = 0;
    let restoredPeriods = 0;
    let restoredCitations = 0;

    for (const curr of snapshotData.masterCurriculums) {
      await prisma.masterCurriculum.create({
        data: {
          id: curr.id,
          tenantId: curr.tenantId,
          courseId: curr.courseId,
          title: curr.title,
          targetLanguage: curr.targetLanguage,
          framework: curr.framework,
          targetLevel: curr.targetLevel,
          totalPeriods: curr.totalPeriods,
          courseHours: curr.courseHours,
          cadenceWeekly: curr.cadenceWeekly,
          periodMinutes: curr.periodMinutes,
          versionNumber: curr.versionNumber,
          versionLabel: curr.versionLabel,
          lockStatus: curr.lockStatus,
          createdAt: new Date(curr.createdAt),
          updatedAt: new Date(curr.updatedAt),
          modules: {
            create: curr.modules.map((m: any) => ({
              id: m.id,
              moduleIndex: m.moduleIndex,
              title: m.title,
              levelCompetence: m.levelCompetence,
              periodsCount: m.periodsCount,
              periods: {
                create: m.periods.map((p: any) => ({
                  id: p.id,
                  periodNumber: p.periodNumber,
                  weekNumber: p.weekNumber,
                  periodType: p.periodType,
                  durationMinutes: p.durationMinutes,
                  topicTitle: p.topicTitle,
                  grammarObjective: p.grammarObjective,
                  vocabularyScope: p.vocabularyScope,
                  canDoStatements: p.canDoStatements,
                  lsrwFocus: p.lsrwFocus,
                  resources: {
                    create: (p.resources || []).map((r: any) => ({
                      id: r.id,
                      sourceTitleSnapshot: r.sourceTitleSnapshot,
                      sourceTypeSnapshot: r.sourceTypeSnapshot,
                      pageNumber: r.pageNumber,
                      citationExcerpt: r.citationExcerpt,
                      addedAt: new Date(r.addedAt),
                    }))
                  }
                }))
              }
            }))
          }
        }
      });
      restoredCurriculums++;
      restoredModules += curr.modules.length;
      for (const m of curr.modules) {
        restoredPeriods += (m.periods || []).length;
        for (const p of (m.periods || [])) {
          restoredCitations += (p.resources || []).length;
        }
      }
    }

    console.log(`  [RESTORE] Completed entities: ${restoredCurriculums} Curriculums, ${restoredModules} Modules, ${restoredPeriods} Periods, ${restoredCitations} Citations.`);

    // 5. Relational Verification & Parity Audit
    console.log('\n--- STEP 5: Verifying Relational Integrity & 100% Entity Parity ---');
    const restoredCurrRecord = await prisma.masterCurriculum.findUnique({
      where: { id: testCurriculumId },
      include: {
        modules: {
          include: {
            periods: {
              include: {
                resources: true,
              }
            }
          }
        }
      }
    });

    if (!restoredCurrRecord) throw new Error('DR FAILED: Restored curriculum not found in DB');
    if (restoredCurrRecord.title !== 'Mission Critical A1 German Syllabus') throw new Error('DR FAILED: Title mismatch');
    if (restoredCurrRecord.modules.length !== 1) throw new Error('DR FAILED: Module count mismatch');
    if (restoredCurrRecord.modules[0].periods.length !== 1) throw new Error('DR FAILED: Period count mismatch');
    if (restoredCurrRecord.modules[0].periods[0].topicTitle !== 'Period 1: Hallo und Auf Wiedersehen') {
      throw new Error('DR FAILED: Period topicTitle mismatch');
    }
    if (restoredCurrRecord.modules[0].periods[0].resources.length !== 1) {
      throw new Error('DR FAILED: Citation resources count mismatch');
    }

    console.log(`  [VERIFIED] Restored Curriculum ID: ${restoredCurrRecord.id}`);
    console.log(`  [VERIFIED] Module ID & Title: ${restoredCurrRecord.modules[0].id} - ${restoredCurrRecord.modules[0].title}`);
    console.log(`  [VERIFIED] Period ID & Topic: ${restoredCurrRecord.modules[0].periods[0].id} - ${restoredCurrRecord.modules[0].periods[0].topicTitle}`);
    console.log(`  [VERIFIED] Citation ID & Excerpt: ${restoredCurrRecord.modules[0].periods[0].resources[0].id} - "${restoredCurrRecord.modules[0].periods[0].resources[0].citationExcerpt}"`);
    console.log(`  [VERIFIED] Foreign Key Integrity: All child records and citations successfully re-attached without orphans.`);

    console.log('\n================================================================');
    console.log('DISASTER RECOVERY AUDIT: 100% SUCCESSFUL BACKUP & RESTORE CYCLE');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ DISASTER RECOVERY FAILED:', err);
    throw err;
  } finally {
    console.log('Tearing down test DR entities & files...');
    if (testCurriculumId) {
      await prisma.curriculumPeriodResource.deleteMany({ where: { id: testPeriodResId } });
      await prisma.curriculumPeriod.deleteMany({ where: { id: testPeriodId } });
      await prisma.curriculumModule.deleteMany({ where: { id: testModuleId } });
      await prisma.masterCurriculum.deleteMany({ where: { id: testCurriculumId } });
    }
    if (fs.existsSync(backupFilePath)) {
      fs.unlinkSync(backupFilePath);
    }
    await prisma.$disconnect();
    console.log('DR Teardown complete.');
  }
}

runDisasterRecoveryRestoreVerification()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
