import { CEFRLevel, Skill, ResourceType } from './academic';
import { CopyrightRiskLevel } from './copyright';

export type DiscoveryTab = 'Web' | 'YouTube' | 'PDF / Documents';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface DiscoveryResultItem {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  sourceName: string;
  sourceType: 'External';
  language: string;
  level: CEFRLevel;
  skill: Skill;
  resourceType: ResourceType;
  qualityScore: number;
  copyrightRisk: CopyrightRiskLevel;
  license?: string;
  summary: string;
  questions?: QuizQuestion[];
  extractedContent?: {
    overview?: string;
    body?: string;
    dialogueScript?: Array<{ speaker: string; text: string; translation?: string }>;
    vocabularyList?: Array<{ word: string; partOfSpeech?: string; translation: string; example?: string }>;
    grammarNotes?: string;
    videoUrl?: string;
    pdfUrl?: string;
  };
}

export type DiscoveryStep = 
  | 'idle' 
  | 'searching' 
  | 'extracting' 
  | 'classifying' 
  | 'validating' 
  | 'analyzing' 
  | 'results' 
  | 'error';
