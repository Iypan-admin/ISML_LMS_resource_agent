import { CEFRLevel } from './academic';

export type AIRecommendation = 
  | 'APPROVED_RECOMMENDED' 
  | 'NEEDS_HUMAN_REVIEW' 
  | 'CHANGES_REQUIRED' 
  | 'REJECT_NOT_SUITABLE';

export interface AIAnalysis {
  relevanceScore: number;       // 0-100
  levelMatchScore: number;      // 0-100
  languageCorrectness: number;  // 0-100
  skillMatchScore: number;      // 0-100
  completenessScore: number;    // 0-100
  overallQualityScore: number;  // 0-100
  aiSummary: string;
  keyVocabulary: string[];
  detectedCEFR: CEFRLevel;
  aiRecommendation: AIRecommendation;
  recommendationReason: string;
}
