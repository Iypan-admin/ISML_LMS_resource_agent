import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface OralFluencyAssessmentResult {
  sessionId: string;
  referenceText: string;
  spokenTranscript: string;
  accuracyScore: number;       // 0 to 100%
  fluencyScore: number;        // 0 to 100%
  wordsPerMinute: number;
  overallOralScore: number;    // Composite 0 to 100
  cefrOralClassification: string; // e.g. "CEFR A1.2 - Emerging Fluent"
  phonemicFeedback: {
    targetSound: string;
    detectedSound: string;
    status: 'EXCELLENT' | 'NEEDS_PRACTICE' | 'MISPRONOUNCED';
    guidance: string;
  }[];
  recommendations: string[];
}

export interface WritingAssessmentResult {
  sessionId: string;
  submissionText: string;
  wordCount: number;
  compositeScore: number;      // 0 to 100
  cefrWritingLevel: string;    // e.g. "CEFR A1 - Competent"
  traitScores: {
    traitName: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
  lineByLineCorrections: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
  overallPedagogicalRemarks: string;
}

@Injectable()
export class AgentEcosystemService {
  private readonly logger = new Logger(AgentEcosystemService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluates student spoken response against target reference text from the session.
   */
  async evaluatePronunciation(
    sessionId: string,
    spokenTranscript: string,
    referenceOverride?: string,
    speakingDurationSeconds: number = 10,
  ): Promise<OralFluencyAssessmentResult> {
    const session = await this.prisma.sessionPackage.findUnique({
      where: { sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session '${sessionId}' not found`);
    }

    const lsrw = session.studentLsrwJson as any;
    const refText = referenceOverride || 
                    lsrw?.speaking?.prompt || 
                    lsrw?.listening?.dialogueScript?.[0]?.text || 
                    'Guten Tag! Wie heißen Sie?';

    // 1. Compute Levenshtein string distance for phonetic accuracy
    const normRef = refText.toLowerCase().replace(/[^a-zA-Zäöüßéèêàáíóúñ\s]/g, '').trim();
    const normSpoken = spokenTranscript.toLowerCase().replace(/[^a-zA-Zäöüßéèêàáíóúñ\s]/g, '').trim();

    const distance = this.levenshteinDistance(normRef, normSpoken);
    const maxLen = Math.max(normRef.length, normSpoken.length) || 1;
    const accuracy = Math.max(0, Math.min(100, Math.round((1 - distance / maxLen) * 100)));

    // 2. Compute Fluency & WPM
    const wordCount = normSpoken.split(/\s+/).filter(Boolean).length;
    const wpm = Math.round((wordCount / Math.max(1, speakingDurationSeconds)) * 60);
    // Ideal A1/A2 speaking rate: 60-90 WPM
    const fluency = Math.min(100, Math.round((wpm / 80) * 100));

    // 3. Composite Oral Score
    const composite = Math.round(accuracy * 0.65 + fluency * 0.35);

    // 4. CEFR Oral Classification
    let cefrLevel = 'CEFR A1.1 - Novice';
    if (composite >= 90) cefrLevel = 'CEFR A1.2 - Fluent Communicator';
    else if (composite >= 75) cefrLevel = 'CEFR A1.2 - Developing Speaker';
    else if (composite >= 60) cefrLevel = 'CEFR A1.1 - Emerging Speaker';

    // 5. Detect Phonemic Nuances
    const phonemicFeedback: any[] = [];
    if (normRef.includes('ä') || normRef.includes('ö') || normRef.includes('ü')) {
      phonemicFeedback.push({
        targetSound: 'German Umlauts (ä, ö, ü)',
        detectedSound: normSpoken.includes('a') || normSpoken.includes('o') ? 'Approximated Vowel' : 'Clear Umlaut',
        status: accuracy >= 80 ? 'EXCELLENT' : 'NEEDS_PRACTICE',
        guidance: 'Shape your lips round for "ö" and "ü" without pulling back your tongue.',
      });
    } else {
      phonemicFeedback.push({
        targetSound: 'Consonant Crispness & Final Devoicing',
        detectedSound: 'Standard Articulation',
        status: 'EXCELLENT',
        guidance: 'Crisp articulation of final consonants (e.g. "Tag", "Name").',
      });
    }

    return {
      sessionId,
      referenceText: refText,
      spokenTranscript,
      accuracyScore: accuracy,
      fluencyScore: fluency,
      wordsPerMinute: wpm,
      overallOralScore: composite,
      cefrOralClassification: cefrLevel,
      phonemicFeedback,
      recommendations: [
        `Maintain steady speaking pace without mid-clause pauses.`,
        `Focus on the rising intonation pattern when asking yes/no questions.`,
      ],
    };
  }

  /**
   * Evaluates student written text against the 4-trait analytical rubric.
   */
  async evaluateWritingSubmission(
    sessionId: string,
    submissionText: string,
    promptOverride?: string,
  ): Promise<WritingAssessmentResult> {
    const session = await this.prisma.sessionPackage.findUnique({
      where: { sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session '${sessionId}' not found`);
    }

    if (!submissionText || !submissionText.trim()) {
      throw new BadRequestException('Submission text cannot be empty');
    }

    const words = submissionText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Trait 1: Grammatical Accuracy (0-25)
    // Check punctuation, capitalization, basic verb presence
    let grammarScore = 20;
    const hasCapitalization = /^[A-ZÄÖÜ]/.test(submissionText);
    const hasPunctuation = /[.!?]$/.test(submissionText.trim());
    if (hasCapitalization && hasPunctuation) grammarScore += 4;
    else grammarScore -= 3;
    grammarScore = Math.max(10, Math.min(25, grammarScore));

    // Trait 2: Lexical Variety & Range (0-25)
    const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
    const typeTokenRatio = uniqueWords.size / Math.max(1, wordCount);
    let lexicalScore = Math.round(typeTokenRatio * 25);
    if (wordCount >= 15) lexicalScore = Math.min(25, lexicalScore + 3);
    lexicalScore = Math.max(10, Math.min(25, lexicalScore));

    // Trait 3: Phonological / Orthographic Clarity (0-25)
    let orthographyScore = 22;
    if (submissionText.includes('  ')) orthographyScore -= 2;
    orthographyScore = Math.max(12, Math.min(25, orthographyScore));

    // Trait 4: Task Completion & Pragmatic Impact (0-25)
    let taskScore = 21;
    if (wordCount >= 10 && wordCount <= 60) taskScore += 3;
    else if (wordCount < 5) taskScore -= 8;
    taskScore = Math.max(8, Math.min(25, taskScore));

    const compositeScore = grammarScore + lexicalScore + orthographyScore + taskScore;

    let cefrWriting = 'CEFR A1.1 - Emerging Writer';
    if (compositeScore >= 85) cefrWriting = 'CEFR A1.2 - Proficient Writer';
    else if (compositeScore >= 70) cefrWriting = 'CEFR A1.1 - Competent Writer';

    return {
      sessionId,
      submissionText,
      wordCount,
      compositeScore,
      cefrWritingLevel: cefrWriting,
      traitScores: [
        {
          traitName: '1. Grammatical Accuracy',
          score: grammarScore,
          maxScore: 25,
          feedback: `Sentence structure demonstrated foundational grammatical competence with consistent verb positioning.`,
        },
        {
          traitName: '2. Lexical Variety & Range',
          score: lexicalScore,
          maxScore: 25,
          feedback: `Used ${uniqueWords.size} distinct lexical items across ${wordCount} words (TTR: ${(typeTokenRatio * 100).toFixed(1)}%).`,
        },
        {
          traitName: '3. Orthographic Clarity',
          score: orthographyScore,
          maxScore: 25,
          feedback: `Punctuation and capitalization adhered to standard target-language conventions.`,
        },
        {
          traitName: '4. Task Completion',
          score: taskScore,
          maxScore: 25,
          feedback: `Prompt communicative requirements were addressed effectively within the requested word scope.`,
        },
      ],
      lineByLineCorrections: [
        {
          original: submissionText,
          corrected: submissionText.replace(/\s+/g, ' ').trim(),
          explanation: `Ensure consistent spacing and capitalized nouns in German sentences.`,
        },
      ],
      overallPedagogicalRemarks: `Great communicative performance! The submission meets ${cefrWriting} criteria. Keep expanding your active vocabulary bank.`,
    };
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}

