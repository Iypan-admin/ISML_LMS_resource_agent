import { Resource } from '../types/resource';

export const mockResources: Resource[] = [
  {
    id: 'res-de-001',
    title: 'German A1 Speaking: Basic Greetings & Small Talk Conversation',
    description: 'Practical dialogue practice covering formal and informal German greetings, self-introductions, and daily conversation.',
    academicContext: {
      language: 'German',
      course: 'General German Communication',
      level: 'A1',
      module: 'Module 1: Greetings & Introductions',
      topic: 'Greetings & Farewells',
      learningObjective: 'Students will be able to introduce themselves and greet others in formal and informal contexts.',
      skill: 'Speaking',
      resourceType: 'Dialogue',
      difficulty: 'Beginner',
      contentLength: '5 min dialogue'
    },
    sourceType: 'AI Generated',
    sourceName: 'ISML AI Language Studio',
    status: 'Published',
    tags: ['German', 'A1', 'Speaking', 'Greetings', 'Dialogue', 'Beginner'],
    createdAt: '2026-09-20T10:30:00Z',
    updatedAt: '2026-09-21T14:20:00Z',
    publishedAt: '2026-09-21T15:00:00Z',
    publishedLocation: 'German A1 > Module 1 > Greetings > Session 1',
    analysis: {
      relevanceScore: 98,
      levelMatchScore: 95,
      languageCorrectness: 99,
      skillMatchScore: 96,
      completenessScore: 94,
      overallQualityScore: 96,
      aiSummary: 'Accurate A1 German dialogue with authentic phrasing, clear turn-taking, and tailored vocabulary for beginner students.',
      keyVocabulary: ['Guten Tag', 'Wie heißen Sie?', 'Ich heiße...', 'Auf Wiedersehen', 'Tschüss'],
      detectedCEFR: 'A1',
      aiRecommendation: 'APPROVED_RECOMMENDED',
      recommendationReason: 'Exemplary alignment with CEFR A1 speaking objectives and natural conversational structure.'
    },
    copyright: {
      sourceName: 'ISML AI Generator',
      sourceUrl: 'https://isml.edu/ai-studio',
      license: 'ISML Platform Original (CC-BY-4.0)',
      attributionRequired: false,
      commercialUsageAllowed: true,
      modificationAllowed: true,
      redistributionAllowed: true,
      hostingPermission: true,
      riskLevel: 'LOW_CONCERN',
      riskExplanation: 'Fully generated original content created via ISML AI Engine.',
      recommendedAction: 'Safe for instant institutional distribution and LMS publication.'
    },
    content: {
      body: 'Here is a situational dialogue between Thomas and Anna meeting at a language center in Berlin.',
      dialogueScript: [
        { speaker: 'Thomas', text: 'Guten Tag! Mein Name ist Thomas Müller.', translation: 'Good day! My name is Thomas Müller.' },
        { speaker: 'Anna', text: 'Hallo Thomas! Ich bin Anna Schmidt. Freut mich, Sie kennenzulernen.', translation: 'Hello Thomas! I am Anna Schmidt. Pleased to meet you.' },
        { speaker: 'Thomas', text: 'Gleichfalls, Anna! Woher kommen Sie?', translation: 'Likewise, Anna! Where are you from?' },
        { speaker: 'Anna', text: 'Ich komme aus Spanien, aber ich wohne jetzt in Berlin. Und Sie?', translation: 'I am from Spain, but I live in Berlin now. And you?' },
        { speaker: 'Thomas', text: 'Ich komme aus Deutschland, aus München.', translation: 'I am from Germany, from Munich.' }
      ],
      questions: [
        {
          id: 'q1',
          question: 'Where is Anna originally from?',
          options: ['Germany', 'Spain', 'Austria', 'Switzerland'],
          answer: 'Spain',
          explanation: 'Anna states "Ich komme aus Spanien".'
        },
        {
          id: 'q2',
          question: 'What is the formal German greeting used by Thomas?',
          options: ['Tschüss', 'Guten Tag', 'Bis später', 'Gute Nacht'],
          answer: 'Guten Tag',
          explanation: 'Thomas greets Anna with "Guten Tag!".'
        }
      ],
      vocabularyList: [
        { word: 'Guten Tag', translation: 'Good day / Hello', partOfSpeech: 'Phrase', example: 'Guten Tag, Frau Weber!' },
        { word: 'kennenzulernen', translation: 'to get to know', partOfSpeech: 'Verb', example: 'Freut mich, Sie kennenzulernen.' }
      ]
    },
    versions: [
      {
        id: 'v1',
        versionNumber: 1,
        title: 'German A1 Speaking: Basic Greetings (Initial Draft)',
        description: 'First version of German greeting dialogue.',
        content: {},
        updatedBy: 'AI Generator',
        updatedAt: '2026-09-20T10:30:00Z',
        changeSummary: 'Initial AI generation from prompt parameters.'
      },
      {
        id: 'v2',
        versionNumber: 2,
        title: 'German A1 Speaking: Basic Greetings & Small Talk Conversation',
        description: 'Added English translations, audio script tags, and comprehension questions.',
        content: {},
        updatedBy: 'Academic Reviewer (Dr. Sarah Weber)',
        updatedAt: '2026-09-21T14:20:00Z',
        changeSummary: 'Refined vocabulary translations and approved for publishing.'
      }
    ],
    activity: [
      { id: 'act-1', timestamp: '2026-09-20T10:30:00Z', actor: 'AI Resource Agent', action: 'Generated', details: 'Resource generated using German A1 Speaking parameters.' },
      { id: 'act-2', timestamp: '2026-09-20T10:31:00Z', actor: 'AI Quality Service', action: 'Analyzed', details: 'Quality score calculated at 96/100 (Low Copyright Concern).' },
      { id: 'act-3', timestamp: '2026-09-21T14:20:00Z', actor: 'Dr. Sarah Weber', action: 'Approved', details: 'Approved resource after reviewing translations.' },
      { id: 'act-4', timestamp: '2026-09-21T15:00:00Z', actor: 'Dr. Sarah Weber', action: 'Published', details: 'Published to German A1 Course Library.' }
    ]
  },
  {
    id: 'res-de-002',
    title: 'German A1 Grammar: Definite Articles (der, die, das) Rules & Charts',
    description: 'Clear reference guide for German definite articles, noun gender rules, and beginner grammar tables.',
    academicContext: {
      language: 'German',
      course: 'General German Communication',
      level: 'A1',
      module: 'Module 2: Daily Life & Family',
      topic: 'Articles (der/die/das)',
      skill: 'Grammar',
      resourceType: 'Website',
      difficulty: 'Beginner'
    },
    sourceType: 'External',
    sourceUrl: 'https://www.dw.com/de/deutsch-lernen/s-2055',
    sourceName: 'Deutsche Welle',
    status: 'Published',
    tags: ['German', 'Grammar', 'Articles', 'External', 'DW'],
    createdAt: '2026-09-22T08:00:00Z',
    updatedAt: '2026-09-22T08:00:00Z',
    analysis: {
      relevanceScore: 92,
      levelMatchScore: 88,
      languageCorrectness: 100,
      skillMatchScore: 94,
      completenessScore: 90,
      overallQualityScore: 91,
      aiSummary: 'Authoritative external website offering extensive German grammar tables and interactive exercises.',
      keyVocabulary: ['der', 'die', 'das', 'Bestimmter Artikel', 'Unbestimmter Artikel'],
      detectedCEFR: 'A1',
      aiRecommendation: 'NEEDS_HUMAN_REVIEW',
      recommendationReason: 'External link requires verification of usage license and framing guidelines.'
    },
    copyright: {
      sourceName: 'Deutsche Welle (DW)',
      sourceUrl: 'https://www.dw.com/de/deutsch-lernen/s-2055',
      license: 'Public Educational Media (Educational Link)',
      attributionRequired: true,
      commercialUsageAllowed: false,
      modificationAllowed: false,
      redistributionAllowed: false,
      hostingPermission: false,
      riskLevel: 'REVIEW_REQUIRED',
      riskExplanation: 'External media outlet. Linking is allowed with clear attribution, but content cannot be directly scraped or rehosted without written permission.',
      recommendedAction: 'Link externally to DW site; do not embed raw text in internal worksheets.'
    },
    content: {
      body: 'External educational resource provided by Deutsche Welle. Contains interactive charts for der, die, das and accusative case shifts.'
    },
    versions: [
      {
        id: 'v1',
        versionNumber: 1,
        title: 'German A1 Grammar: Definite Articles Rules & Charts',
        description: 'Discovered via AI Search Agent.',
        content: {},
        updatedBy: 'AI Search Agent',
        updatedAt: '2026-09-22T08:00:00Z',
        changeSummary: 'Discovered external resource and populated metadata.'
      }
    ],
    activity: [
      { id: 'act-1', timestamp: '2026-09-22T08:00:00Z', actor: 'AI Discovery Agent', action: 'Discovered', details: 'Found via Web Search tool matching German A1 Articles.' }
    ]
  },
  {
    id: 'res-fr-001',
    title: 'French A1 Reading: My Daily Routine in Paris (Short Story)',
    description: 'Easy French reading passage describing a student morning routine, visiting a cafe, and taking the metro.',
    academicContext: {
      language: 'French',
      course: 'General French Program',
      level: 'A1',
      module: 'Module 1: Basic Conversations',
      topic: 'Greetings & Courtesy',
      skill: 'Reading',
      resourceType: 'Reading',
      difficulty: 'Beginner'
    },
    sourceType: 'Uploaded',
    sourceName: 'Uploaded PDF Document (french_a1_paris_day.pdf)',
    status: 'Approved',
    tags: ['French', 'A1', 'Reading', 'Paris', 'Daily Life'],
    createdAt: '2026-09-21T11:00:00Z',
    updatedAt: '2026-09-21T16:45:00Z',
    analysis: {
      relevanceScore: 94,
      levelMatchScore: 92,
      languageCorrectness: 97,
      skillMatchScore: 95,
      completenessScore: 91,
      overallQualityScore: 93,
      aiSummary: 'Well-structured A1 French text with simple present tense verb forms (habiter, prendre, manger) and side glossary.',
      keyVocabulary: ['Bonjour', 'Café', 'Métro', 'Croissant', 'Le soir'],
      detectedCEFR: 'A1',
      aiRecommendation: 'APPROVED_RECOMMENDED',
      recommendationReason: 'Clear vocabulary density and appropriate sentence length for French A1 beginners.'
    },
    copyright: {
      sourceName: 'Uploaded Document',
      sourceUrl: '',
      license: 'Teacher Created / Internal License',
      attributionRequired: false,
      commercialUsageAllowed: true,
      modificationAllowed: true,
      redistributionAllowed: true,
      hostingPermission: true,
      riskLevel: 'LOW_CONCERN',
      riskExplanation: 'Uploaded by ISML Senior Faculty member with full ownership rights.',
      recommendedAction: 'Ready for publishing to French course stream.'
    },
    content: {
      body: 'Je m’appelle Marc. J’habite à Paris. Le matin, je prends un café et un croissant dans une boulangerie près de chez moi. Ensuite, je prends le métro pour aller à l’université.',
      fileDetails: {
        fileName: 'french_a1_paris_day.pdf',
        fileSize: '1.4 MB',
        mimeType: 'application/pdf'
      }
    },
    versions: [
      {
        id: 'v1',
        versionNumber: 1,
        title: 'French A1 Reading: My Daily Routine in Paris',
        description: 'Parsed from PDF upload.',
        content: {},
        updatedBy: 'AI Upload Analyzer',
        updatedAt: '2026-09-21T11:00:00Z',
        changeSummary: 'Uploaded PDF parsed and classified by AI.'
      }
    ],
    activity: [
      { id: 'act-1', timestamp: '2026-09-21T11:00:00Z', actor: 'Faculty User', action: 'Uploaded', details: 'File french_a1_paris_day.pdf uploaded.' },
      { id: 'act-2', timestamp: '2026-09-21T16:45:00Z', actor: 'Reviewer', action: 'Approved', details: 'Approved for publishing.' }
    ]
  },
  {
    id: 'res-es-001',
    title: 'Spanish A1 Grammar: How to Use "Ser" and "Estar" (Practice Exercises)',
    description: 'Beginner worksheet explaining when to use Ser (identity/origin) vs Estar (location/feelings) with fill-in-the-blank practice.',
    academicContext: {
      language: 'Spanish',
      course: 'Spanish Foundation',
      level: 'A1',
      module: 'Module 1: Introductions',
      topic: 'Ser vs Estar',
      skill: 'Grammar',
      resourceType: 'Worksheet',
      difficulty: 'Beginner'
    },
    sourceType: 'AI Generated',
    sourceName: 'ISML AI Studio',
    status: 'Changes Required',
    tags: ['Spanish', 'A1', 'Grammar', 'Ser vs Estar', 'Worksheet'],
    createdAt: '2026-09-22T06:15:00Z',
    updatedAt: '2026-09-22T07:30:00Z',
    analysis: {
      relevanceScore: 89,
      levelMatchScore: 84,
      languageCorrectness: 95,
      skillMatchScore: 92,
      completenessScore: 85,
      overallQualityScore: 87,
      aiSummary: 'Good overview of Ser vs Estar rules, but exercise #4 includes advanced subjunctive hints that exceed A1 scope.',
      keyVocabulary: ['Soy', 'Estoy', 'Origen', 'Ubicación', 'Estado'],
      detectedCEFR: 'A1',
      aiRecommendation: 'CHANGES_REQUIRED',
      recommendationReason: 'Simplify question #4 to exclude B1 subjunctive construction.'
    },
    copyright: {
      sourceName: 'ISML AI Generator',
      sourceUrl: '',
      license: 'ISML Platform Original',
      attributionRequired: false,
      commercialUsageAllowed: true,
      modificationAllowed: true,
      redistributionAllowed: true,
      hostingPermission: true,
      riskLevel: 'LOW_CONCERN',
      riskExplanation: 'Fully original AI generated worksheet.',
      recommendedAction: 'Apply recommended edits then resubmit for review.'
    },
    content: {
      body: 'Use "Ser" for identity, origin, nationality, and characteristics. Use "Estar" for location, feelings, and temporary conditions.',
      exercises: [
        { instruction: 'Fill in the blank with soy/estoy', item: 'Yo ______ de Madrid. (Origin)', answer: 'soy' },
        { instruction: 'Fill in the blank with soy/estoy', item: 'Yo ______ contento hoy. (Feeling)', answer: 'estoy' }
      ]
    },
    versions: [
      {
        id: 'v1',
        versionNumber: 1,
        title: 'Spanish A1 Grammar: How to Use "Ser" and "Estar"',
        description: 'Initial draft generated by AI.',
        content: {},
        updatedBy: 'AI Generator',
        updatedAt: '2026-09-22T06:15:00Z',
        changeSummary: 'Initial generation.'
      }
    ],
    activity: [
      { id: 'act-1', timestamp: '2026-09-22T06:15:00Z', actor: 'AI Resource Agent', action: 'Generated', details: 'Generated Spanish Ser vs Estar worksheet.' },
      { id: 'act-2', timestamp: '2026-09-22T07:30:00Z', actor: 'Lead Reviewer', action: 'Requested Changes', details: 'Feedback: Simplify sentence 4 to fit A1 scope.' }
    ]
  },
  {
    id: 'res-ja-001',
    title: 'Japanese A1 Vocabulary: Essential Daily Hiragana Expressions & Flashcards',
    description: 'Beginner Hiragana word list covering basic greetings, thank you phrases, and classroom vocabulary with romanization.',
    academicContext: {
      language: 'Japanese',
      course: 'Japanese Beginner Series',
      level: 'A1',
      module: 'Module 1: Hiragana & Greetings',
      topic: 'Daily Expressions',
      skill: 'Vocabulary',
      resourceType: 'Worksheet',
      difficulty: 'Beginner'
    },
    sourceType: 'AI Generated',
    sourceName: 'ISML AI Studio',
    status: 'Published',
    tags: ['Japanese', 'A1', 'Hiragana', 'Vocabulary', 'Flashcards'],
    createdAt: '2026-09-21T09:00:00Z',
    updatedAt: '2026-09-21T10:00:00Z',
    publishedAt: '2026-09-21T10:30:00Z',
    analysis: {
      relevanceScore: 98,
      levelMatchScore: 97,
      languageCorrectness: 100,
      skillMatchScore: 98,
      completenessScore: 95,
      overallQualityScore: 97,
      aiSummary: 'Clear Japanese A1 flashcard list with accurate Romaji and English translations.',
      keyVocabulary: ['こんにちは (Konnichiwa)', 'ありがとう (Arigatou)', 'すみません (Sumimasen)'],
      detectedCEFR: 'A1',
      aiRecommendation: 'APPROVED_RECOMMENDED',
      recommendationReason: 'Perfect entry-level vocabulary format for Japanese A1.'
    },
    copyright: {
      sourceName: 'ISML AI Generator',
      sourceUrl: '',
      license: 'ISML Platform Original',
      attributionRequired: false,
      commercialUsageAllowed: true,
      modificationAllowed: true,
      redistributionAllowed: true,
      hostingPermission: true,
      riskLevel: 'LOW_CONCERN',
      riskExplanation: 'Fully original AI generated vocabulary material.',
      recommendedAction: 'Safe to publish.'
    },
    content: {
      body: 'Master these 10 essential Japanese greetings used in daily life.',
      vocabularyList: [
        { word: 'こんにちは (Konnichiwa)', translation: 'Hello / Good afternoon', partOfSpeech: 'Greeting', example: 'Konnichiwa, Tanaka-san!' },
        { word: 'ありがとう (Arigatou)', translation: 'Thank you', partOfSpeech: 'Phrase', example: 'Domo arigatou.' }
      ]
    },
    versions: [],
    activity: []
  },
  {
    id: 'res-ta-001',
    title: 'Tamil A1 Listening: Everyday Conversation at the Market (Audio & Script)',
    description: 'Short audio dialogue script in conversational Tamil covering buying vegetables, asking prices, and basic numbers.',
    academicContext: {
      language: 'Tamil',
      course: 'Tamil Foundation',
      level: 'A1',
      module: 'Module 1: Market & Numbers',
      topic: 'Market Conversations',
      skill: 'Listening',
      resourceType: 'Dialogue',
      difficulty: 'Beginner'
    },
    sourceType: 'AI Generated',
    sourceName: 'ISML AI Studio',
    status: 'Published',
    tags: ['Tamil', 'A1', 'Listening', 'Market', 'Dialogue'],
    createdAt: '2026-09-20T14:00:00Z',
    updatedAt: '2026-09-20T15:00:00Z',
    publishedAt: '2026-09-20T15:30:00Z',
    analysis: {
      relevanceScore: 96,
      levelMatchScore: 94,
      languageCorrectness: 98,
      skillMatchScore: 95,
      completenessScore: 92,
      overallQualityScore: 95,
      aiSummary: 'Authentic Tamil A1 market dialogue with English transliteration.',
      keyVocabulary: ['வணக்கம் (Vanakkam)', 'எவ்வளவு (Evvalavu)', 'ரூபாய் (Roobai)'],
      detectedCEFR: 'A1',
      aiRecommendation: 'APPROVED_RECOMMENDED',
      recommendationReason: 'Extremely practical conversational listening material.'
    },
    copyright: {
      sourceName: 'ISML AI Generator',
      sourceUrl: '',
      license: 'ISML Platform Original',
      attributionRequired: false,
      commercialUsageAllowed: true,
      modificationAllowed: true,
      redistributionAllowed: true,
      hostingPermission: true,
      riskLevel: 'LOW_CONCERN',
      riskExplanation: 'Fully original AI generated dialogue.',
      recommendedAction: 'Safe to publish.'
    },
    content: {
      body: 'Conversational dialogue between a buyer and shopkeeper in Chennai market.',
      dialogueScript: [
        { speaker: 'Raman', text: 'வணக்கம்! தக்காளி ஒரு கிலோ எவ்வளவு? (Vanakkam! Thakkali oru kilo evvalavu?)', translation: 'Hello! How much is one kilo of tomatoes?' },
        { speaker: 'Shopkeeper', text: 'வணக்கம் தம்பி, ஒரு கிலோ 40 ரூபாய் (Vanakkam thambi, oru kilo 40 roobai).', translation: 'Hello brother, one kilo is 40 rupees.' }
      ]
    },
    versions: [],
    activity: []
  },
  {
    id: 'res-hi-001',
    title: 'Hindi A1 Writing: Basic Devanagari Script & Letter Tracing Sheet',
    description: 'Beginner Hindi writing practice sheet introducing Devanagari vowels (स्वर) and basic consonants with stroke orders.',
    academicContext: {
      language: 'Hindi',
      course: 'Hindi Communication Series',
      level: 'A1',
      module: 'Module 1: Alphabet & Phonetics',
      topic: 'Devanagari Script',
      skill: 'Writing',
      resourceType: 'Worksheet',
      difficulty: 'Beginner'
    },
    sourceType: 'AI Generated',
    sourceName: 'ISML AI Studio',
    status: 'Approved',
    tags: ['Hindi', 'A1', 'Writing', 'Devanagari', 'Worksheet'],
    createdAt: '2026-09-21T08:00:00Z',
    updatedAt: '2026-09-21T12:00:00Z',
    analysis: {
      relevanceScore: 97,
      levelMatchScore: 96,
      languageCorrectness: 99,
      skillMatchScore: 97,
      completenessScore: 93,
      overallQualityScore: 96,
      aiSummary: 'Clean Hindi Devanagari writing guide suitable for absolute beginners.',
      keyVocabulary: ['अ (A)', 'आ (Aa)', 'इ (I)', 'ई (Ee)', 'नमस्ते (Namaste)'],
      detectedCEFR: 'A1',
      aiRecommendation: 'APPROVED_RECOMMENDED',
      recommendationReason: 'Excellent foundational writing practice.'
    },
    copyright: {
      sourceName: 'ISML AI Generator',
      sourceUrl: '',
      license: 'ISML Platform Original',
      attributionRequired: false,
      commercialUsageAllowed: true,
      modificationAllowed: true,
      redistributionAllowed: true,
      hostingPermission: true,
      riskLevel: 'LOW_CONCERN',
      riskExplanation: 'Original AI generated script worksheet.',
      recommendedAction: 'Ready to publish.'
    },
    content: {
      body: 'Practice writing Hindi Devanagari vowels with correct stroke guidance.',
      vocabularyList: [
        { word: 'नमस्ते (Namaste)', translation: 'Hello / Greetings', partOfSpeech: 'Greeting', example: 'Namaste, aap kaise hain?' }
      ]
    },
    versions: [],
    activity: []
  }
];
