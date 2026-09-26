import { Language, CEFRLevel, Skill, ResourceType, DifficultyLevel } from '../types/academic';

export const mockLanguages: Language[] = [
  { id: 'de', code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', resourceCount: 148, activeCount: 142, needsReviewCount: 6 },
  { id: 'fr', code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', resourceCount: 112, activeCount: 108, needsReviewCount: 4 },
  { id: 'es', code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', resourceCount: 96, activeCount: 94, needsReviewCount: 2 },
  { id: 'ja', code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', resourceCount: 78, activeCount: 76, needsReviewCount: 2 },
  { id: 'ko', code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', resourceCount: 54, activeCount: 52, needsReviewCount: 2 },
  { id: 'ta', code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', resourceCount: 42, activeCount: 41, needsReviewCount: 1 },
  { id: 'hi', code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', resourceCount: 38, activeCount: 36, needsReviewCount: 2 },
  { id: 'en', code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', resourceCount: 180, activeCount: 178, needsReviewCount: 2 },
];

export const mockCEFRLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const mockSkills: Skill[] = [
  'Grammar',
  'Vocabulary',
  'Reading',
  'Listening',
  'Speaking',
  'Writing',
  'Pronunciation',
  'Practice',
  'Worksheet',
  'Quiz',
];

export const mockResourceTypes: ResourceType[] = [
  'Reading',
  'Listening',
  'Speaking',
  'Writing',
  'Vocabulary',
  'Grammar',
  'Worksheet',
  'Quiz',
  'Practice Exercise',
  'Website',
  'Video',
  'Document',
  'Dialogue',
];

export const mockDifficulties: DifficultyLevel[] = [
  'Beginner',
  'Elementary',
  'Intermediate',
  'Upper Intermediate',
  'Advanced',
];

export const mockAcademicTree: Record<string, {
  courses: { id: string; name: string; levels: { level: CEFRLevel; modules: { name: string; topics: string[] }[] }[] }[]
}> = {
  German: {
    courses: [
      {
        id: 'de-gen',
        name: 'General German Communication',
        levels: [
          {
            level: 'A1',
            modules: [
              {
                name: 'Module 1: Greetings & Introductions',
                topics: ['Greetings & Farewells', 'Self Introductions', 'Numbers 1-100', 'Countries & Languages']
              },
              {
                name: 'Module 2: Daily Life & Family',
                topics: ['Family Members', 'Daily Routines', 'Articles (der/die/das)', 'Present Tense Verbs']
              },
              {
                name: 'Module 3: Food & Shopping',
                topics: ['At the Grocery Store', 'Ordering at a Cafe', 'Plural Nouns', 'Accusative Case']
              }
            ]
          },
          {
            level: 'A2',
            modules: [
              {
                name: 'Module 1: Travel & Transportation',
                topics: ['Buying Train Tickets', 'Asking for Directions', 'Dative Case', 'Modal Verbs']
              }
            ]
          }
        ]
      }
    ]
  },
  French: {
    courses: [
      {
        id: 'fr-gen',
        name: 'General French Program',
        levels: [
          {
            level: 'A1',
            modules: [
              {
                name: 'Module 1: Basic Conversations',
                topics: ['Greetings & Courtesy', 'Alphabet & Phonetics', 'Present Tense (Être/Avoir)']
              }
            ]
          }
        ]
      }
    ]
  },
  Spanish: {
    courses: [
      {
        id: 'es-gen',
        name: 'Spanish Foundation',
        levels: [
          {
            level: 'A1',
            modules: [
              {
                name: 'Module 1: Introductions',
                topics: ['Saludos y Despedidas', 'Ser vs Estar', 'Basic Vocabulary']
              }
            ]
          }
        ]
      }
    ]
  }
};
