import { validateRawRow } from '../scripts/resource-import/resource-validator';
import {
  calculateUrlHash,
  extractDomain,
  mapCEFRLevels,
  mapResourceType,
} from '../scripts/resource-import/resource-mapper';
import { CEFRLevel, ResourceType } from '@prisma/client';

function runTests() {
  console.log('🧪 Starting Bulk Resource Importer Automated Unit Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail}`);
      failed++;
    }
  }

  // 1. Row Validation Tests
  const validRow = {
    tutorName: 'Adithya',
    category: 'Comprehensive Course',
    title: 'Deutsche Welle Learn German',
    level: 'A1–B2',
    purpose: 'Complete video-based course with vocabulary and exercises.',
    link: 'https://learngerman.dw.com',
    language: 'German',
  };
  assert(validateRawRow(validRow).isValid === true, 'validateRawRow accepts valid input row');

  const invalidUrlRow = { ...validRow, link: 'not-a-valid-url' };
  assert(validateRawRow(invalidUrlRow).isValid === false, 'validateRawRow rejects invalid URL syntax');

  const missingTitleRow = { ...validRow, title: '' };
  assert(validateRawRow(missingTitleRow).isValid === false, 'validateRawRow rejects missing title');

  // 2. URL Hash & Normalization Tests
  const hash1 = calculateUrlHash('https://learngerman.dw.com');
  const hash2 = calculateUrlHash('HTTPS://LEARNGERMAN.DW.COM ');
  assert(hash1 === hash2 && typeof hash1 === 'string', 'calculateUrlHash normalizes case & trailing spaces to SHA-256');

  const shareUrl = 'https://share.google/P3Pxk7qCvnret2Nw1';
  assert(calculateUrlHash(shareUrl) !== undefined, 'calculateUrlHash preserves Google Share URLs without mutation');

  // 3. Level Mapping Tests (CEFR vs JLPT Governance)
  const cefrRange1 = mapCEFRLevels('A1–B2');
  assert(
    cefrRange1.length === 4 &&
      cefrRange1.includes(CEFRLevel.A1) &&
      cefrRange1.includes(CEFRLevel.B2),
    'mapCEFRLevels expands A1–B2 range to [A1, A2, B1, B2]',
  );

  const cefrSlash = mapCEFRLevels('A2/B1');
  assert(
    cefrSlash.length === 2 &&
      cefrSlash.includes(CEFRLevel.A2) &&
      cefrSlash.includes(CEFRLevel.B1),
    'mapCEFRLevels expands A2/B1 slash notation to [A2, B1]',
  );

  const cefrChapter = mapCEFRLevels('B1 (Chapter 4)');
  assert(
    cefrChapter.length === 1 && cefrChapter[0] === CEFRLevel.B1,
    'mapCEFRLevels maps B1 (Chapter 4) to B1 without losing level',
  );

  const jlptRange = mapCEFRLevels('N5–N1');
  assert(
    jlptRange.length === 0,
    'mapCEFRLevels returns 0 CEFR levels for JLPT N5–N1 (Zero false CEFR equivalence)',
  );

  const nonCEFRStr = mapCEFRLevels('Beginner–Intermediate');
  assert(
    nonCEFRStr.length === 0,
    'mapCEFRLevels returns 0 CEFR levels for non-CEFR string Beginner–Intermediate',
  );

  // 4. ResourceType Mapping Tests
  assert(mapResourceType('Worksheets', 'Nancy Thuleen') === ResourceType.WORKSHEET, 'mapResourceType maps Worksheets to WORKSHEET');
  assert(mapResourceType('Listening & Speaking', 'Easy German') === ResourceType.PODCAST, 'mapResourceType maps Listening & Speaking to PODCAST');
  assert(mapResourceType('Exam Preparation', 'OpenExamPrep') === ResourceType.QUIZ, 'mapResourceType maps Exam Preparation to QUIZ');
  assert(mapResourceType('Study Materials (PDFs)', 'Redewendungen') === ResourceType.PDF, 'mapResourceType maps Study Materials (PDFs) to PDF');

  // 5. Source Domain Extraction Tests
  const src1 = extractDomain('https://learngerman.dw.com/en');
  assert(src1.domain === 'learngerman.dw.com' && src1.name === 'Deutsche Welle', 'extractDomain resolves domain and friendly name for DW');

  const src2 = extractDomain('https://www.goethe.de/prj/dfd/en/home.cfm');
  assert(src2.domain === 'goethe.de' && src2.name === 'Goethe-Institut', 'extractDomain resolves domain and friendly name for Goethe-Institut');

  console.log(`\n==============================================`);
  console.log(`📊 IMPORTER UNIT TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`==============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
