import { AcademicContext } from './academic';
import { AIAnalysis } from './analysis';
import { CopyrightAnalysis } from './copyright';

export type ResourceStatus = 
  | 'Draft' 
  | 'Pending Review' 
  | 'Changes Required' 
  | 'Approved' 
  | 'Published' 
  | 'Rejected' 
  | 'Archived'
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'CHANGES_REQUIRED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

export type SourceType = 
  | 'Internal'
  | 'AI Generated' 
  | 'External' 
  | 'Uploaded';

export interface ResourceVersion {
  id: string;
  versionNumber: number;
  title: string;
  description: string;
  content: any;
  updatedBy: string;
  updatedAt: string;
  changeSummary: string;
}

export interface ResourceActivity {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export interface ResourceContentPayload {
  overview?: string;
  body?: string;
  dialogueScript?: { speaker: string; text: string; translation?: string }[];
  questions?: { id: string; question: string; options?: string[]; answer?: string; explanation?: string }[];
  vocabularyList?: { word: string; translation: string; partOfSpeech?: string; example?: string }[];
  grammarNotes?: string[] | string;
  exercises?: { instruction: string; item: string; answer: string }[];
  fileDetails?: { fileName: string; fileSize: string; mimeType: string; downloadUrl?: string; fileUrl?: string };
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  tutorName?: string;
  category?: string;
  purpose?: string;
  academicContext: AcademicContext;
  sourceType: SourceType;
  sourceUrl?: string;
  originalUrl?: string;
  sourceName: string;
  status: ResourceStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  publishedLocation?: string;
  analysis: AIAnalysis;
  copyright: CopyrightAnalysis;
  content: ResourceContentPayload;
  versions: ResourceVersion[];
  activity: ResourceActivity[];

  // Knowledge Vault & Multi-Stage Processing Fields
  processingStatus?: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';
  processingProgress?: number;
  failureReason?: string | null;
  approvalStatus?: 'DRAFT' | 'PENDING_REVIEW' | 'CHANGES_REQUIRED' | 'APPROVED' | 'REJECTED';
  publicationStatus?: 'UNPUBLISHED' | 'PUBLISHED' | 'ARCHIVED';
  tenantId?: string;
  isGlobal?: boolean;
  framework?: 'CEFR' | 'JLPT' | 'TOPIK' | 'ACTFL' | 'CUSTOM';
  cefrLevel?: string | null;
  wordCount?: number | null;
  tokenCount?: number | null;
  pageCount?: number | null;
  fileHash?: string | null;
  fileUrl?: string | null;
  fileData?: string | null;
  canonicalUrl?: string | null;
}
