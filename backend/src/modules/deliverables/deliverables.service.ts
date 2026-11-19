import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface TeacherGuidePackage {
  title: string;
  language: string;
  level: string;
  durationMinutes: number;
  periodNumber: number;
  groundedCitations: any[];
  pedagogicalRationale: string;
  lessonTimeline: {
    stageNumber: number;
    stageName: string;
    durationMinutes: number;
    teacherInstructions: string;
    studentActions: string;
    boardCues: string;
  }[];
  commonStudentPitfalls: {
    misconception: string;
    spokenRemediationPrompt: string;
  }[];
  masterAnswerKeys: {
    exerciseTitle: string;
    solutions: { itemNumber: number; prompt: string; correctAnswer: string; explanation: string }[];
  }[];
  slideCueNotes: { slideIndex: number; title: string; teacherTalkingPoints: string[] }[];
}

export interface StudentWorkbookPackage {
  title: string;
  language: string;
  level: string;
  periodNumber: number;
  canDoTarget: string;
  vocabularyFlashcards: {
    word: string;
    phonetics: string;
    nativeTranslation: string;
    exampleSentence: string;
  }[];
  readingPassage: {
    passageTitle: string;
    bodyText: string;
    marginGlossary: { term: string; meaning: string }[];
    comprehensionChecks: { question: string; responseSpace: string }[];
  };
  speakingRoleplayCards: {
    scenario: string;
    partnerARole: string;
    partnerBRole: string;
    usefulPhrases: string[];
  };
  cleanPracticeWorksheets: {
    instruction: string;
    items: { itemNumber: number; question: string; blankLine: string }[];
  }[];
}

export interface AssessmentPaperPackage {
  title: string;
  periodNumber: number;
  language: string;
  level: string;
  maxScore: number;
  exitQuiz: {
    questionNumber: number;
    questionText: string;
    options: string[];
    points: number;
  }[];
  communicativeWritingTask: {
    prompt: string;
    requiredElements: string[];
    wordLimit: string;
  };
  analyticalScoringRubric: {
    traitName: string;
    maxPoints: number;
    weightPercent: number;
    descriptors: { range: string; criteria: string }[];
  }[];
}

export interface SegregatedDeliverableBundle {
  sessionId: string;
  generatedAt: string;
  teacherGuide: TeacherGuidePackage;
  studentWorkbook: StudentWorkbookPackage;
  assessmentPaper: AssessmentPaperPackage;
}

@Injectable()
export class DeliverablesService {
  private readonly logger = new Logger(DeliverablesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateDeliverables(sessionId: string): Promise<SegregatedDeliverableBundle> {
    const session = await this.prisma.sessionPackage.findUnique({
      where: { sessionId },
      include: {
        masterCurriculum: true,
        curriculumPeriod: {
          include: {
            resources: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session package '${sessionId}' not found`);
    }

    const plan = session.sessionPlanJson as any;
    const lsrw = session.studentLsrwJson as any;
    const teacherMeta = session.teacherMaterialsJson as any;
    const duration = plan?.durationMinutes || 45;
    const periodNum = session.curriculumPeriod?.periodNumber || 1;

    // 1. Build Teacher Guide Deliverable Package
    const teacherGuide: TeacherGuidePackage = {
      title: `Teacher Instructional Guide: ${session.title}`,
      language: session.language,
      level: session.level,
      durationMinutes: duration,
      periodNumber: periodNum,
      groundedCitations: plan?.groundedEvidence || [],
      pedagogicalRationale: `Communicative Task-Based Language Teaching (TBLT). Focuses on inductive grammar discovery and spoken production for ${session.language} ${session.level}.`,
      lessonTimeline: (plan?.stages || []).map((s: any) => ({
        stageNumber: s.stageNumber,
        stageName: s.name,
        durationMinutes: s.durationMinutes,
        teacherInstructions: s.teacherInstruction,
        studentActions: s.studentActivity,
        boardCues: `Write key grammar frame on left board; reserve center board for student dialogue modeling.`,
      })),
      commonStudentPitfalls: [
        {
          misconception: `Word order inversion in questions vs declarative sentences.`,
          spokenRemediationPrompt: `Prompt the learner: "Remember the verb sits in position 2 in declarative sentences, but moves to position 1 for yes/no questions!"`,
        },
        {
          misconception: `Pronunciation of diphthongs and vowel length.`,
          spokenRemediationPrompt: `Model contrastive repetition: pronounce short vs long vowels clearly and have students echo back.`,
        },
      ],
      masterAnswerKeys: [
        {
          exerciseTitle: `Diagnostic Practice Check`,
          solutions: [
            {
              itemNumber: 1,
              prompt: `Complete the formal greeting: "Guten ____, Herr Schmidt!"`,
              correctAnswer: `Tag`,
              explanation: `Standard formal daytime greeting across German-speaking regions is "Guten Tag".`,
            },
            {
              itemNumber: 2,
              prompt: `Transform into formal question: "Du heißt Anna" -> "____ Sie Anna?"`,
              correctAnswer: `Heißen`,
              explanation: `Formal address uses the pronoun "Sie" and the verb form "heißen".`,
            },
          ],
        },
      ],
      slideCueNotes: (teacherMeta?.slides || []).map((sl: any, idx: number) => ({
        slideIndex: idx + 1,
        title: sl.title || `Slide ${idx + 1}`,
        teacherTalkingPoints: [
          `Clarify the core target phrase before presenting text.`,
          `Check comprehension via choral repetition.`,
        ],
      })),
    };

    // 2. Build Student Workbook Deliverable Package (STRICT ZERO-ANSWER LEAKS)
    const studentWorkbook: StudentWorkbookPackage = {
      title: `Student Learning Workbook: ${session.topic}`,
      language: session.language,
      level: session.level,
      periodNumber: periodNum,
      canDoTarget: plan?.canDoStatements?.[0] || `Can understand and communicate essential expressions in ${session.language}.`,
      vocabularyFlashcards: (plan?.vocabularyScope || ['Guten Tag', 'Wie geht es Ihnen', 'Auf Wiedersehen']).map((v: string) => ({
        word: v,
        phonetics: `/${v.toLowerCase()}/`,
        nativeTranslation: `Essential communicative phrase (${session.language})`,
        exampleSentence: `${v}! Mein Name ist Alex.`,
      })),
      readingPassage: {
        passageTitle: `${session.topic} - Situational Reading`,
        bodyText: lsrw?.reading?.text || `Guten Tag! Ich bin Anna. Ich komme aus Berlin und wohne in München. Ich spreche Deutsch und Englisch.`,
        marginGlossary: [
          { term: 'kommen aus', meaning: 'to originate / come from' },
          { term: 'wohnen in', meaning: 'to reside / live in' },
        ],
        comprehensionChecks: [
          { question: `Where does Anna come from?`, responseSpace: `[ ______________________________________ ]` },
          { question: `Which two languages does Anna speak?`, responseSpace: `[ ______________________________________ ]` },
        ],
      },
      speakingRoleplayCards: {
        scenario: `You meet a new colleague or student at an international language academy.`,
        partnerARole: `Introduce yourself, greet politely, ask partner's name and city of origin.`,
        partnerBRole: `Respond politely, give name, state your city, and ask partner how they are doing.`,
        usefulPhrases: plan?.vocabularyScope || ['Guten Tag', 'Freut mich', 'Danke gut'],
      },
      cleanPracticeWorksheets: [
        {
          instruction: `Complete the sentences with the appropriate communicative phrases:`,
          items: [
            { itemNumber: 1, question: `Guten ____! Wie geht es Ihnen?`, blankLine: `[ ________ ]` },
            { itemNumber: 2, question: `Ich ____ Maria Schmidt. Und Sie?`, blankLine: `[ ________ ]` },
            { itemNumber: 3, question: `Auf ____! Bis morgen!`, blankLine: `[ ________ ]` },
          ],
        },
      ],
    };

    // 3. Build Assessment Paper Deliverable Package (Analytical 4-Trait Rubric)
    const assessmentPaper: AssessmentPaperPackage = {
      title: `Exit Formative Assessment Paper: ${session.topic}`,
      periodNumber: periodNum,
      language: session.language,
      level: session.level,
      maxScore: 100,
      exitQuiz: [
        {
          questionNumber: 1,
          questionText: `Which greeting is appropriate in a formal business context?`,
          options: ['A) Tschüss', 'B) Guten Tag', 'C) Bis später', 'D) Servus'],
          points: 10,
        },
        {
          questionNumber: 2,
          questionText: `Select the correct formal question form:`,
          options: ['A) Wie heißt du?', 'B) Wie heißen Sie?', 'C) Wer bist du?', 'D) Was ist dein Name?'],
          points: 10,
        },
      ],
      communicativeWritingTask: {
        prompt: `Write a short 3-to-4 sentence introduction about yourself in ${session.language}. Include greeting, name, city of origin, and a polite farewell.`,
        requiredElements: ['Formal greeting', 'Name & origin', 'Polite sign-off'],
        wordLimit: '25-40 words',
      },
      analyticalScoringRubric: [
        {
          traitName: '1. Grammatical Accuracy',
          maxPoints: 25,
          weightPercent: 25,
          descriptors: [
            { range: '22-25 pts', criteria: 'Flawless verb conjugation, correct word order, and zero agreement errors.' },
            { range: '17-21 pts', criteria: 'Minor morphological slips that do not obscure communicative meaning.' },
            { range: '10-16 pts', criteria: 'Frequent syntax errors; native language interference noticeable.' },
            { range: '0-9 pts', criteria: 'Grammar errors impede basic comprehension.' },
          ],
        },
        {
          traitName: '2. Lexical Precision & Range',
          maxPoints: 25,
          weightPercent: 25,
          descriptors: [
            { range: '22-25 pts', criteria: 'Accurate, rich usage of period vocabulary with exact spelling.' },
            { range: '17-21 pts', criteria: 'Adequate vocabulary matching the prompt with minor spelling slips.' },
            { range: '10-16 pts', criteria: 'Repetitive or limited vocabulary; partial expression.' },
            { range: '0-9 pts', criteria: 'Inappropriate or inadequate vocabulary.' },
          ],
        },
        {
          traitName: '3. Phonological / Orthographic Clarity',
          maxPoints: 25,
          weightPercent: 25,
          descriptors: [
            { range: '22-25 pts', criteria: 'Accurate capitalization (nouns in German), accents, and punctuation.' },
            { range: '17-21 pts', criteria: 'Occasional capitalization or punctuation omission.' },
            { range: '10-16 pts', criteria: 'Frequent orthographic errors that slow reading.' },
            { range: '0-9 pts', criteria: 'Pervasive spelling breakdowns.' },
          ],
        },
        {
          traitName: '4. Task Completion & Pragmatic Impact',
          maxPoints: 25,
          weightPercent: 25,
          descriptors: [
            { range: '22-25 pts', criteria: 'All required prompt elements fully satisfied with appropriate register.' },
            { range: '17-21 pts', criteria: 'Majority of elements satisfied with clear communicative intent.' },
            { range: '10-16 pts', criteria: 'Partial fulfillment; omitted one key communicative element.' },
            { range: '0-9 pts', criteria: 'Task requirements not addressed.' },
          ],
        },
      ],
    };

    const bundle: SegregatedDeliverableBundle = {
      sessionId,
      generatedAt: new Date().toISOString(),
      teacherGuide,
      studentWorkbook,
      assessmentPaper,
    };

    // Cache the deliverable bundle directly on the session record
    await this.prisma.sessionPackage.update({
      where: { sessionId },
      data: {
        deliverablesJson: bundle as any,
      },
    });

    this.logger.log(`Segregated deliverables generated and cached for session ${sessionId}`);
    return bundle;
  }

  async exportMarkdown(sessionId: string, target: 'TEACHER' | 'STUDENT' | 'ASSESSMENT'): Promise<string> {
    const bundle = await this.generateDeliverables(sessionId);

    if (target === 'TEACHER') {
      const tg = bundle.teacherGuide;
      return `# ${tg.title}
**Language:** ${tg.language} | **Level:** ${tg.level} | **Duration:** ${tg.durationMinutes} Minutes (Period ${tg.periodNumber})

---

## 1. Pedagogical Strategy & Rationale
${tg.pedagogicalRationale}

## 2. Lesson Execution Timeline
${tg.lessonTimeline.map((s) => `### Stage ${s.stageNumber}: ${s.stageName} (${s.durationMinutes} min)
- **Teacher:** ${s.teacherInstructions}
- **Student:** ${s.studentActions}
- **Board Note:** ${s.boardCues}
`).join('\n')}

## 3. Common Student Pitfalls & Spoken Interventions
${tg.commonStudentPitfalls.map((p) => `- **Pitfall:** ${p.misconception}\n  - **Intervention:** _"${p.spokenRemediationPrompt}"_`).join('\n')}

## 4. Master Answer Keys (Faculty Eyes Only)
${tg.masterAnswerKeys.map((k) => `### ${k.exerciseTitle}
${k.solutions.map((s) => `${s.itemNumber}. **${s.prompt}**  
   - **Correct Answer:** \`${s.correctAnswer}\`  
   - **Rationale:** ${s.explanation}`).join('\n\n')}`).join('\n')}
`;
    }

    if (target === 'STUDENT') {
      const sw = bundle.studentWorkbook;
      return `# ${sw.title}
**Course Level:** ${sw.language} ${sw.level} | **Period:** ${sw.periodNumber}

---

## Communicative Can-Do Target
> **Goal:** ${sw.canDoTarget}

## 1. Key Vocabulary Flashcards
| Word / Phrase | Phonetics | Meaning | Example in Context |
| :--- | :--- | :--- | :--- |
${sw.vocabularyFlashcards.map((f) => `| **${f.word}** | \`${f.phonetics}\` | ${f.nativeTranslation} | _"${f.exampleSentence}"_ |`).join('\n')}

## 2. Situational Reading
### ${sw.readingPassage.passageTitle}
${sw.readingPassage.bodyText}

**Margin Glossary:**
${sw.readingPassage.marginGlossary.map((g) => `- **${g.term}:** ${g.meaning}`).join('\n')}

**Comprehension Questions:**
${sw.readingPassage.comprehensionChecks.map((c, i) => `${i + 1}. ${c.question}\n   ${c.responseSpace}`).join('\n')}

## 3. Speaking Partner Roleplay
- **Scenario:** ${sw.speakingRoleplayCards.scenario}
- **Partner A:** ${sw.speakingRoleplayCards.partnerARole}
- **Partner B:** ${sw.speakingRoleplayCards.partnerBRole}
- **Useful Expressions:** ${sw.speakingRoleplayCards.usefulPhrases.join(' • ')}

## 4. Practice Worksheets
${sw.cleanPracticeWorksheets.map((w) => `### ${w.instruction}
${w.items.map((it) => `${it.itemNumber}. ${it.question}  
   ${it.blankLine}`).join('\n')}`).join('\n')}
`;
    }

    // ASSESSMENT
    const ap = bundle.assessmentPaper;
    return `# ${ap.title}
**Language:** ${ap.language} ${ap.level} | **Period:** ${ap.periodNumber} | **Total:** ${ap.maxScore} Points

---

## Part 1: Formative Quick Quiz
${ap.exitQuiz.map((q) => `**Question ${q.questionNumber}** (${q.points} pts): ${q.questionText}  
${q.options.map((opt) => `- [ ] ${opt}`).join('\n')}
`).join('\n')}

## Part 2: Communicative Writing Task
**Prompt:** ${ap.communicativeWritingTask.prompt}  
**Word Limit:** ${ap.communicativeWritingTask.wordLimit}  
**Mandatory Elements:** ${ap.communicativeWritingTask.requiredElements.join(', ')}

---

## Part 3: Analytical 4-Trait Scoring Rubric
| Evaluated Trait | Max Pts | Weight | Benchmark Descriptors |
| :--- | :---: | :---: | :--- |
${ap.analyticalScoringRubric.map((r) => `| **${r.traitName}** | ${r.maxPoints} pts | ${r.weightPercent}% | ${r.descriptors.map((d) => `**${d.range}:** ${d.criteria}`).join('<br>')} |`).join('\n')}
`;
  }
}

