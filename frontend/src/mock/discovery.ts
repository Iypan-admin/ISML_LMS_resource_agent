import { DiscoveryResultItem } from '../types/discovery';

export const mockDiscoveryResults: Record<string, DiscoveryResultItem[]> = {
  Web: [
    {
      id: 'disc-web-1',
      title: 'German A1 Audio Dialogues & Pronunciation Drills',
      description: 'Free audio recordings with accompanying transcriptions for beginner German learners.',
      sourceUrl: 'https://vocal-german.org/a1-audio',
      sourceName: 'Vocal German Institute',
      sourceType: 'External',
      language: 'German',
      level: 'A1',
      skill: 'Listening',
      resourceType: 'Website',
      qualityScore: 94,
      copyrightRisk: 'LOW_CONCERN',
      license: 'Creative Commons CC-BY 4.0',
      summary: 'High educational value with native speaker audio recordings and clear CC-BY licensing.'
    },
    {
      id: 'disc-web-2',
      title: 'French Grammar Exercises: Passé Composé vs Imparfait',
      description: 'Comprehensive exercise bank with automated answer keys.',
      sourceUrl: 'https://lepointdufle.net/p/passecompose.htm',
      sourceName: 'Le Point du FLE',
      sourceType: 'External',
      language: 'French',
      level: 'B1',
      skill: 'Grammar',
      resourceType: 'Website',
      qualityScore: 89,
      copyrightRisk: 'REVIEW_REQUIRED',
      license: 'Copyrighted Educational Website',
      summary: 'Extensive exercise directory. Direct linking recommended; web scraping restricted.'
    }
  ],
  YouTube: [
    {
      id: 'disc-yt-1',
      title: 'Learn German A1 in 30 Minutes: Essential Greetings & Phrases',
      description: 'Video lesson breaking down German phonetics, formal vs informal address, and dialogue examples.',
      sourceUrl: 'https://www.youtube.com/watch?v=4-eDoThe6qo',
      sourceName: 'YouTube / Easy German Channel',
      sourceType: 'External',
      language: 'German',
      level: 'A1',
      skill: 'Speaking',
      resourceType: 'Video',
      qualityScore: 96,
      copyrightRisk: 'LOW_CONCERN',
      license: 'Standard YouTube License (Embeddable)',
      summary: 'Excellent video quality with native subtitle overlay. Fully embeddable via YouTube player.'
    },
    {
      id: 'disc-yt-2',
      title: 'French A1 Conversation Practice for Beginners (25 Minutes)',
      description: 'Full 25-minute French dialogue practice with on-screen text and pronunciation drills.',
      sourceUrl: 'https://www.youtube.com/watch?v=ujDtm0hZyII',
      sourceName: 'YouTube / FrenchPod101',
      sourceType: 'External',
      language: 'French',
      level: 'A1',
      skill: 'Listening',
      resourceType: 'Video',
      qualityScore: 95,
      copyrightRisk: 'LOW_CONCERN',
      license: 'Standard YouTube License',
      summary: 'Highly recommended for A1 ear training and listening comprehension.'
    }
  ],
  'PDF / Documents': [
    {
      id: 'disc-pdf-1',
      title: 'Goethe Institut A1 German Vocabulary Wordbook PDF',
      description: 'Official word list structured by semantic topics (Family, Hobbies, Shopping, Travel).',
      sourceUrl: 'https://www.goethe.de/resources/a1-wortschatz.pdf',
      sourceName: 'Goethe Institut',
      sourceType: 'External',
      language: 'German',
      level: 'A1',
      skill: 'Vocabulary',
      resourceType: 'Document',
      qualityScore: 98,
      copyrightRisk: 'LOW_CONCERN',
      license: 'Goethe Institute Free Educational PDF',
      summary: 'Gold standard vocabulary compilation for A1 exam candidates.'
    }
  ]
};
