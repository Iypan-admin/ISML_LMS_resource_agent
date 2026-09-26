export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type AcademicLevel = CEFRLevel | JLPTLevel | string;

export type Skill = 
  | 'Grammar' 
  | 'Vocabulary' 
  | 'Reading' 
  | 'Listening' 
  | 'Speaking' 
  | 'Writing' 
  | 'Pronunciation' 
  | 'Practice' 
  | 'Worksheet' 
  | 'Quiz'
  | 'Other / Custom Skill...'
  | string;

export type ResourceType = 
  | 'Reading' 
  | 'Listening' 
  | 'Speaking' 
  | 'Writing' 
  | 'Vocabulary' 
  | 'Grammar' 
  | 'Worksheet' 
  | 'Quiz' 
  | 'Practice Exercise' 
  | 'Website' 
  | 'Video' 
  | 'Document' 
  | 'Dialogue'
  | 'Other / Custom Format...'
  | string;

export type DifficultyLevel = 
  | 'Beginner' 
  | 'Elementary' 
  | 'Intermediate' 
  | 'Upper Intermediate' 
  | 'Advanced'
  | string;

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  resourceCount: number;
  activeCount: number;
  needsReviewCount: number;
}

export interface Course {
  id: string;
  languageId: string;
  code: string;
  title: string;
  description: string;
}

export interface AcademicModule {
  id: string;
  courseId: string;
  level: CEFRLevel;
  code: string;
  title: string;
}

export interface Topic {
  id: string;
  moduleId: string;
  code: string;
  title: string;
}

export interface LearningObjective {
  id: string;
  topicId: string;
  code: string;
  title: string;
}

export interface AcademicContext {
  language: string;
  course: string;
  level: AcademicLevel;
  module: string;
  topic: string;
  customTopic?: string;
  learningObjective?: string;
  skill: Skill;
  customSkill?: string;
  resourceType: ResourceType;
  customResourceType?: string;
  difficulty: DifficultyLevel;
  contentLength?: string;
}
