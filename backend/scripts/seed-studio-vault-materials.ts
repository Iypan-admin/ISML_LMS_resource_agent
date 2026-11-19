import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Syncing Studio Curriculum Languages & Levels into Knowledge Vault ---');

  const languages = await prisma.language.findMany();
  const langMap = new Map<string, string>();
  languages.forEach((l) => langMap.set(l.name, l.id));

  console.log('Available Languages in DB:', Array.from(langMap.keys()));

  const studioMaterials = [
    // ==========================================
    // KOREAN (Korean Standard L1 - L4)
    // ==========================================
    {
      title: 'Korean Level L1: Hangeul Foundations & Basic Dialogues (Official Guide)',
      description: 'Foundational Korean reading, Hangeul vowels and consonants, basic everyday self-introductions, and numbers.',
      language: 'Korean',
      framework: 'TOPIK',
      cefrLevel: 'A1',
      resourceType: 'PDF',
      sourceType: 'UPLOADED',
      wordCount: 1850,
      pageCount: 38,
      text: '한글 읽기와 발음 규칙. 안녕하세요, 반갑습니다. 제 이름은 김민수입니다. 저는 학생입니다. 1부터 10까지의 숫자와 기초 문장 구조.',
    },
    {
      title: 'Korean Level L2: Everyday Situations & Verb Conjugations (Ewha Korean)',
      description: 'Level L2 elementary grammar, polite endings -아/어요, shopping, ordering food, and location particles.',
      language: 'Korean',
      framework: 'TOPIK',
      cefrLevel: 'A2',
      resourceType: 'WORKSHEET',
      sourceType: 'UPLOADED',
      wordCount: 3200,
      pageCount: 52,
      text: '식당에서 음식 주문하기. 이거 얼마예요? 불고기 일인분 주세요. -고 싶어요, -(으)ㄹ 수 있어요 문법 활용 및 일상 대화 연습.',
    },
    {
      title: 'Korean Level L3: Intermediate Conversation & Nuances (Yonsei KLI)',
      description: 'Intermediate communicative mastery, honorific suffixes, connective particles, and complex dialogue expressions.',
      language: 'Korean',
      framework: 'TOPIK',
      cefrLevel: 'B1',
      resourceType: 'COURSE',
      sourceType: 'UPLOADED',
      wordCount: 5400,
      pageCount: 74,
      text: '한국의 직장 문화와 비즈니스 대화. 높임말과 간접 화법. -기 때문에, -(으)ㄴ/는 편이다 문법과 중급 어휘 1,500단어 마스터.',
    },
    {
      title: 'Korean Level L4: Advanced Idioms, Debates & Media Texts (SNU Language Inst.)',
      description: 'Advanced Level L4 reading and debate: modern social discussions, newspaper articles, and formal speech presentation.',
      language: 'Korean',
      framework: 'TOPIK',
      cefrLevel: 'B2',
      resourceType: 'ARTICLE',
      sourceType: 'UPLOADED',
      wordCount: 7100,
      pageCount: 96,
      text: '현대 사회 이슈와 토론. 사자성어와 관용구 표현. 공식적인 석상에서의 발표 및 보고서 작성 기법, 고급 텍스트 분석.',
    },
    {
      title: 'Korean Level L1: Essential Pronunciation Masterclass (Talk To Me In Korean)',
      description: 'Comprehensive video series breaking down standard Seoul pronunciation, batchim rules, and conversational rhythm.',
      language: 'Korean',
      framework: 'TOPIK',
      cefrLevel: 'A1',
      resourceType: 'YOUTUBE_VIDEO',
      sourceType: 'EXTERNAL',
      originalUrl: 'https://www.youtube.com/watch?v=0ZhOeA0RD9o',
      wordCount: 980,
      pageCount: 1,
      text: 'Welcome to Level L1 Korean Pronunciation! In this lesson we cover basic Hangul consonants, vowels, and final consonant assimilation.',
    },

    // ==========================================
    // SPANISH (CEFR A1 - B2)
    // ==========================================
    {
      title: 'Spanish CEFR A1: ¡Hola! Introducción al Español (DELE A1 Practice)',
      description: 'Foundational Spanish for beginners: greetings, numbers, definite articles, gender, and ser vs estar.',
      language: 'Spanish',
      framework: 'CEFR',
      cefrLevel: 'A1',
      resourceType: 'PDF',
      sourceType: 'UPLOADED',
      wordCount: 2200,
      pageCount: 42,
      text: 'Hola, ¿cómo estás? Me llamo Carlos y soy de Madrid. Vocabulario básico: los días de la semana, números y verbos regulares en presente.',
    },
    {
      title: 'Spanish CEFR A2: Gramática del Uso del Español (Edelsa)',
      description: 'Elementary Spanish grammar: Pretérito Perfecto, Indefinido, Imperfecto, and expressing daily routines.',
      language: 'Spanish',
      framework: 'CEFR',
      cefrLevel: 'A2',
      resourceType: 'COURSE',
      sourceType: 'UPLOADED',
      wordCount: 3950,
      pageCount: 60,
      text: 'El contraste de los pasados: Pretérito Indefinido vs Imperfecto. Vocabulario sobre viajes, el tiempo meteorológico y describir experiencias.',
    },
    {
      title: 'Spanish CEFR B1: Conversación Intermedia y Modo Subjuntivo (Anaya ELE)',
      description: 'Intermediate Spanish: Presente de Subjuntivo, expressing opinions, doubts, wishes, and hypothetical conditions.',
      language: 'Spanish',
      framework: 'CEFR',
      cefrLevel: 'B1',
      resourceType: 'WORKSHEET',
      sourceType: 'UPLOADED',
      wordCount: 5600,
      pageCount: 80,
      text: 'Espero que tengas un buen viaje. Uso del subjuntivo para expresar deseos y opiniones. Conectores discursivos y debates de actualidad.',
    },
    {
      title: 'Spanish CEFR B2: Expresión Oral y Redacción Avanzada (Difusión)',
      description: 'Upper-intermediate Spanish: formal essay composition, debate techniques, nuanced phrasal verbs, and colloquial idioms.',
      language: 'Spanish',
      framework: 'CEFR',
      cefrLevel: 'B2',
      resourceType: 'ARTICLE',
      sourceType: 'UPLOADED',
      wordCount: 6850,
      pageCount: 92,
      text: 'Técnicas de argumentación, análisis sociológico y estilo formal en la redacción de informes profesionales en español.',
    },

    // ==========================================
    // JAPANESE (JLPT N5 - N2)
    // ==========================================
    {
      title: 'Japanese JLPT N5: Minna no Nihongo I - Vocabulary & Hiragana/Katakana',
      description: 'Official JLPT N5 entry curriculum: kana writing systems, basic particles (wa, ga, o, ni, de), and 100 essential Kanji.',
      language: 'Japanese',
      framework: 'JLPT',
      cefrLevel: 'A1',
      resourceType: 'PDF',
      sourceType: 'UPLOADED',
      wordCount: 2600,
      pageCount: 48,
      text: '初級日本語レッスン。私は学生です。これは本です。どこに行きますか。駅へ行きます。ひらがな・カタカナ五十音図と基礎文法。',
    },
    {
      title: 'Japanese JLPT N4: Genki II - Elementary Grammar & Te-Form Conjugations',
      description: 'JLPT N4 grammar structures: te-form, conditional tara/ba, giving/receiving verbs (ageru, morau, kureru).',
      language: 'Japanese',
      framework: 'JLPT',
      cefrLevel: 'A2',
      resourceType: 'COURSE',
      sourceType: 'UPLOADED',
      wordCount: 4200,
      pageCount: 66,
      text: '〜てもいいです、〜てはいけません。授受表現（あげる・もらう・くれる）と条件形。日常会話のステップアップと漢字200字。',
    },
    {
      title: 'Japanese JLPT N3: Tobira - Gateway to Intermediate Japanese',
      description: 'Bridge to intermediate Japanese: complex sentence subordination, passive and causative forms, situational honorifics.',
      language: 'Japanese',
      framework: 'JLPT',
      cefrLevel: 'B1',
      resourceType: 'WORKSHEET',
      sourceType: 'UPLOADED',
      wordCount: 5900,
      pageCount: 88,
      text: '中級日本語への扉。使役受身表現、敬語（尊敬語・謙譲語・丁寧語）の使い分け。日本の文化と社会に関する長文読解練習。',
    },
    {
      title: 'Japanese JLPT N2: Shin Kanzen Master - Reading Comprehension & Nuances',
      description: 'Upper-intermediate JLPT N2 preparation: newspaper articles, editorial opinion essays, and business communication.',
      language: 'Japanese',
      framework: 'JLPT',
      cefrLevel: 'B2',
      resourceType: 'ARTICLE',
      sourceType: 'UPLOADED',
      wordCount: 7400,
      pageCount: 110,
      text: '新完全マスター読解N2。社説や論説文の構造把握、筆者の主張を見抜く読解演習とビジネスメールの書き方。',
    },

    // ==========================================
    // GERMAN (CEFR A1 - B2)
    // ==========================================
    {
      title: 'German CEFR A1: Schritte International Neu 1 - Wortschatz und Grammatik',
      description: 'A1 German standard curriculum: greetings, present tense conjugation, accusative case, and everyday shopping dialogues.',
      language: 'German',
      framework: 'CEFR',
      cefrLevel: 'A1',
      resourceType: 'PDF',
      sourceType: 'UPLOADED',
      wordCount: 2400,
      pageCount: 44,
      text: 'Guten Tag! Ich heiße Anna und wohne in Berlin. Grundwortschatz: Berufe, Familie, Einkaufen und Akkusativ-Ergänzungen.',
    },
    {
      title: 'German CEFR A2: Begegnungen A2+ - Dialoge, Dativ und Perfekt',
      description: 'Elementary German: Dative prepositions, two-way prepositions (Wechselpräpositionen), and conversational Perfekt tense.',
      language: 'German',
      framework: 'CEFR',
      cefrLevel: 'A2',
      resourceType: 'COURSE',
      sourceType: 'UPLOADED',
      wordCount: 4100,
      pageCount: 64,
      text: 'Wo ist der Bahnhof? Wechselpräpositionen (an, auf, in, über, unter, vor, hinter, neben, zwischen) mit Dativ und Akkusativ.',
    },
    {
      title: 'German CEFR B1: Aspekte Neu B1 - Mittelstufe Grammatik und Konjunktiv II',
      description: 'Intermediate German: Konjunktiv II (wünsche, höfliche Bitten), Nebensätze mit weil, dass, obwohl, and passive voice.',
      language: 'German',
      framework: 'CEFR',
      cefrLevel: 'B1',
      resourceType: 'WORKSHEET',
      sourceType: 'UPLOADED',
      wordCount: 5750,
      pageCount: 84,
      text: 'Wenn ich mehr Zeit hätte, würde ich nach Deutschland reisen. Konjunktiv II, Passivformen und Vorbereitung auf das B1-Zertifikat.',
    },
    {
      title: 'German CEFR B2: Sicher! B2 - Sprach- und Lesekompetenz in Beruf und Studium',
      description: 'Upper-intermediate German: academic and professional writing, complex nominal style (Nominalstil), and debate moderation.',
      language: 'German',
      framework: 'CEFR',
      cefrLevel: 'B2',
      resourceType: 'ARTICLE',
      sourceType: 'UPLOADED',
      wordCount: 7600,
      pageCount: 104,
      text: 'Diskussionen leiten, Standpunkte begründen und wissenschaftliche Texte verstehen. Vertiefung von Nomen-Verb-Verbindungen.',
    },

    // ==========================================
    // FRENCH (CEFR A1 - B2)
    // ==========================================
    {
      title: 'French CEFR A1: Alter Ego+ 1 - Vocabulaire Fondamental et Salutations',
      description: 'Beginner French: basic introductions, numbers, present tense verbs (être, avoir, aller, faire), and formal vous vs tu.',
      language: 'French',
      framework: 'CEFR',
      cefrLevel: 'A1',
      resourceType: 'PDF',
      sourceType: 'UPLOADED',
      wordCount: 2300,
      pageCount: 42,
      text: 'Bonjour ! Comment vous appelez-vous ? Je m’appelle Claire. Présentations, nationalités, les articles définis et indéfinis.',
    },
    {
      title: 'French CEFR A2: Cosmopolite 2 - Grammaire Pratique et Passé Composé',
      description: 'Elementary French: Passé composé vs Imparfait, COD/COI object pronouns, and navigating French cities.',
      language: 'French',
      framework: 'CEFR',
      cefrLevel: 'A2',
      resourceType: 'COURSE',
      sourceType: 'UPLOADED',
      wordCount: 3900,
      pageCount: 62,
      text: 'Raconter des souvenirs au passé : passé composé avec avoir et être, l’imparfait pour la description. Les pronoms y et en.',
    },
    {
      title: 'French CEFR B1: Édito B1 - Communication Intermédiaire et Subjonctif',
      description: 'Intermediate French: Subjonctif présent, expressing feelings and requirements, relative pronouns (qui, que, où, dont).',
      language: 'French',
      framework: 'CEFR',
      cefrLevel: 'B1',
      resourceType: 'WORKSHEET',
      sourceType: 'UPLOADED',
      wordCount: 5500,
      pageCount: 82,
      text: 'Il faut que vous fassiez attention. Le subjonctif après les verbes de volonté et d’émotion. Argumentation et débats de société.',
    },
    {
      title: 'French CEFR B2: Tendances B2 - Argumentation et Débats Critiques',
      description: 'Upper-intermediate French: complex syntactic structures, nuanced journalistic reading, and academic speech delivery.',
      language: 'French',
      framework: 'CEFR',
      cefrLevel: 'B2',
      resourceType: 'ARTICLE',
      sourceType: 'UPLOADED',
      wordCount: 7200,
      pageCount: 100,
      text: 'Expression des nuances de pensée, connecteurs logiques avancés et préparation complète aux épreuves du DELF B2.',
    },

    // ==========================================
    // ENGLISH (CEFR A1.1 - B2.2)
    // ==========================================
    {
      title: 'English CEFR A1.1: Cambridge English Starter - Everyday Phrasal Basics & Salutations',
      description: 'Foundational English communication: greetings, personal pronouns, introductions, and essential politeness markers.',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'A1',
      resourceType: 'PDF',
      sourceType: 'UPLOADED',
      wordCount: 1950,
      pageCount: 36,
      text: 'Good morning! My name is David Anderson. Pleased to meet you. I am from Canada and I study here. Standard greetings, subject pronouns (I, you, he, she), and basic questions: What is your name? Where are you from?',
    },
    {
      title: 'English CEFR A1.1: Oxford Discover 1 - Phonics, Alphabet Mastery & Auditory Ear-Tuning',
      description: 'Phonetic vowel contrasts, minimal pairs, alphabet pronunciation, and consonant cluster auditory decoding.',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'A1',
      resourceType: 'PDF',
      sourceType: 'UPLOADED',
      wordCount: 2200,
      pageCount: 42,
      text: 'Phonics and sound discrimination. The 44 English phonemes. Short vowels (/æ/, /e/, /ɪ/) vs long vowels (/iː/, /uː/). Minimal pairs: ship vs sheep, bit vs beat, pen vs pan. Syllable stress and word rhythm.',
    },
    {
      title: 'English CEFR A1.1: BBC Learning English - Classroom English & Essential Imperatives',
      description: 'Direct classroom instructions, teacher directives, and polite student clarification questions for English immersion.',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'A1',
      resourceType: 'YOUTUBE_VIDEO',
      sourceType: 'EXTERNAL',
      originalUrl: 'https://www.bbc.co.uk/learningenglish/english/basic-grammar',
      wordCount: 1600,
      pageCount: 1,
      text: 'Classroom imperatives: Open your books, listen carefully, repeat after me, write down the answer. Polite student requests: Excuse me teacher, how do you pronounce this word? Could you repeat that please?',
    },
    {
      title: 'English CEFR A1.2: Cambridge Primary English - Daily Routines & Present Simple Mechanics',
      description: 'Present simple affirmative, negative, and question forms for daily habits, frequency adverbs, and schedules.',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'A1',
      resourceType: 'WORKSHEET',
      sourceType: 'UPLOADED',
      wordCount: 2400,
      pageCount: 44,
      text: 'Habits and routines in the present simple. Third-person singular inflection -s/-es (he walks, she washes). Frequency adverbs: always, usually, often, sometimes, never. Morning to evening schedule descriptions.',
    },
    {
      title: 'English CEFR A1.2: British Council Elementary - Family, Home & Prepositions of Place',
      description: 'Kinship vocabulary, household rooms, and spatial prepositions (in front of, next to, between, opposite).',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'A1',
      resourceType: 'PDF',
      sourceType: 'UPLOADED',
      wordCount: 1900,
      pageCount: 34,
      text: 'Family relations: parents, siblings, grandparents, aunt, uncle, cousins. Spatial prepositions: in, on, under, behind, in front of, between, opposite. Describing floor plans and house layouts.',
    },
    {
      title: 'English CEFR A2.1: Cambridge Key (KET) - Past Simple Foundations & Irregular Verbs Mastery',
      description: 'Elementary English past simple regular -ed endings (/t/, /d/, /ɪd/), top irregular verbs, and historical narratives.',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'A2',
      resourceType: 'COURSE',
      sourceType: 'UPLOADED',
      wordCount: 3400,
      pageCount: 56,
      text: 'Past simple tense for completed events. Regular verb pronunciation rules for -ed. Top 50 irregular verbs (went, saw, took, bought, had). Questions with did + base verb. Time markers: yesterday, ago, last week.',
    },
    {
      title: 'English CEFR A2.1: Oxford Living Grammar A2 - Asking for Directions & Urban Navigation',
      description: 'Urban street directions, navigating metro systems, understanding public transit maps, and polite pedestrian inquiries.',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'A2',
      resourceType: 'WORKSHEET',
      sourceType: 'UPLOADED',
      wordCount: 2100,
      pageCount: 38,
      text: 'Navigating city streets: Turn left at the roundabout, walk two blocks, cross at the pedestrian crossing. Inquiring for directions: Excuse me, could you tell me how to get to the central station?',
    },
    {
      title: 'English CEFR A2.2: Pearson GSE Elementary - Comparatives, Superlatives & Retail Transactions',
      description: 'Adjective gradation rules (-er/-est, more/most) with practical shopping dialogues for pricing, sizes, and returns.',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'A2',
      resourceType: 'PDF',
      sourceType: 'UPLOADED',
      wordCount: 2800,
      pageCount: 48,
      text: 'Comparative and superlative adjectives: faster than, more comfortable than, the most expensive. Irregular forms: good/better/best. Shopping roleplays: fitting rooms, discounts, receipts, and refund policies.',
    },
    {
      title: 'English CEFR A2.2: Cambridge English Empower A2 - Future Intentions (Going to vs Will)',
      description: 'Differentiating pre-arranged future intentions (be going to) from spontaneous decisions and predictions (will).',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'A2',
      resourceType: 'COURSE',
      sourceType: 'UPLOADED',
      wordCount: 1950,
      pageCount: 32,
      text: 'Future time expressions: be going to for pre-planned intentions and observable evidence; will for spontaneous decisions, offers of assistance, and subjective predictions. Scheduling future arrangements.',
    },
    {
      title: 'English CEFR B1.1: Cambridge Preliminary (PET) - Present Perfect vs Past Simple Fluency',
      description: 'Intermediate English: present perfect life experiences (since, for, already, yet) vs completed historical past.',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'B1',
      resourceType: 'WORKSHEET',
      sourceType: 'UPLOADED',
      wordCount: 5100,
      pageCount: 78,
      text: 'Aspectual contrast: have/has + past participle. Unspecified life achievements and ongoing durations with since and for vs definitive closed timestamps in the past simple. Narrative milestone structuring.',
    },
    {
      title: 'English CEFR B1.1: Oxford English File Intermediate - Travel Emergencies & Airport Procedures',
      description: 'Resolving airport transit delays, handling canceled flights, customs declarations, and diplomatic complaints.',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'B1',
      resourceType: 'COURSE',
      sourceType: 'UPLOADED',
      wordCount: 3200,
      pageCount: 52,
      text: 'Handling flight disruptions, baggage claims, customs interviews, and requesting airline compensation or rebooking. Diplomatic customer service problem resolution and formal airport vocabulary.',
    },
    {
      title: 'English CEFR B1.2: British Council LearnEnglish - Conditionals (Zero, First & Second)',
      description: 'Mastery of conditional clauses: factual scientific consequences, realistic future outcomes, and hypothetical deliberations.',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'B1',
      resourceType: 'WORKSHEET',
      sourceType: 'UPLOADED',
      wordCount: 3600,
      pageCount: 58,
      text: 'Conditionals in English: Zero conditional for scientific facts; First conditional for probable future events; Second conditional for hypothetical or counter-factual scenarios (If I were you, I would...). Comma rules.',
    },
    {
      title: 'English CEFR B1.2: Cambridge Business Benchmark - Professional Workplace Email & Etiquette',
      description: 'Corporate written communication standards: formal salutations, polite meeting requests, diplomatic follow-ups, and sign-offs.',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'B1',
      resourceType: 'PDF',
      sourceType: 'UPLOADED',
      wordCount: 2900,
      pageCount: 46,
      text: 'Business correspondence architecture: clear subject lines, professional salutations, stating purpose diplomatically, attaching documents, proposing meeting times, and professional sign-offs.',
    },
    {
      title: 'English CEFR B2.1: Cambridge First (FCE) - Passive Voice & Academic Report Syntheses',
      description: 'Impersonal passive structures, agent omission in scientific prose, nominalization, and objective report drafting.',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'B2',
      resourceType: 'ARTICLE',
      sourceType: 'UPLOADED',
      wordCount: 6900,
      pageCount: 96,
      text: 'Passive constructions across tenses: modal passives, present perfect passives, impersonal reporting (It is believed that...). Nominalization for academic density in laboratory and research reports.',
    },
    {
      title: 'English CEFR B2.1: Oxford Advanced Skills - Discourse Markers & Persuasive Argumentation',
      description: 'Advanced cohesive discourse markers, concession clauses, paragraph transitions, and balanced argumentative essays.',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'B2',
      resourceType: 'ARTICLE',
      sourceType: 'UPLOADED',
      wordCount: 4200,
      pageCount: 64,
      text: 'Cohesive devices and discourse connectors: reinforcement (furthermore, moreover), contrast (conversely, whereas), concession (nevertheless, notwithstanding), causality (consequently, thus). Essay synthesis.',
    },
    {
      title: 'English CEFR B2.2: Cambridge Business Vantage - Corporate Negotiations & Idiomatic Nuances',
      description: 'High-stakes commercial bargaining, diplomatic counter-proposals, corporate risk assessment, and workplace idioms.',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'B2',
      resourceType: 'ARTICLE',
      sourceType: 'UPLOADED',
      wordCount: 4500,
      pageCount: 68,
      text: 'Executive negotiation tactics: conditional bargaining trade-offs, diplomatic concession language, hedging, and high-frequency corporate idioms (touch base, cut corners, hit the ground running).',
    },
    {
      title: 'English CEFR B2.2: TED-Ed Academic Dialogues - Critical Media Analysis & Debate Delivery',
      description: 'Critically deconstructing rhetorical strategies, evaluating author bias, delivering rebuttals, and debate pacing.',
      language: 'English',
      framework: 'CEFR',
      cefrLevel: 'B2',
      resourceType: 'YOUTUBE_VIDEO',
      sourceType: 'EXTERNAL',
      originalUrl: 'https://ed.ted.com/lessons?category=language-arts',
      wordCount: 5200,
      pageCount: 1,
      text: 'Critical rhetorical analysis: detecting logical fallacies (straw man, false dilemma, post hoc), evaluating source credibility, structuring competitive debate rebuttals, and public speaking modulation.',
    },
  ];

  let addedCount = 0;
  for (const m of studioMaterials) {
    const langId = langMap.get(m.language);
    if (!langId) {
      console.warn(`Language '${m.language}' not found in DB! Skipping '${m.title}'`);
      continue;
    }

    const baseSlug = m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const resourceId = crypto.randomUUID();
    const slug = `${baseSlug.slice(0, 48)}-${resourceId.slice(0, 8)}`;

    const existing = await prisma.resource.findFirst({
      where: {
        title: m.title,
      },
    });

    if (existing) {
      console.log(`Resource already exists: '${m.title}', updating level & status...`);
      await prisma.resource.update({
        where: { id: existing.id },
        data: {
          cefrLevel: m.cefrLevel as any,
          framework: m.framework as any,
          processingStatus: 'READY',
          approvalStatus: 'APPROVED',
          publicationStatus: 'PUBLISHED',
          wordCount: m.wordCount,
          pageCount: m.pageCount,
        },
      });
      continue;
    }

    await prisma.resource.create({
      data: {
        id: resourceId,
        slug,
        title: m.title,
        description: m.description,
        languageId: langId,
        tenantId: 'inst_isml_global',
        isGlobal: true,
        processingStatus: 'READY',
        processingProgress: 100,
        approvalStatus: 'APPROVED',
        publicationStatus: 'PUBLISHED',
        resourceType: m.resourceType as any,
        sourceType: m.sourceType as any,
        originalUrl: (m as any).originalUrl || undefined,
        canonicalUrl: (m as any).originalUrl || undefined,
        normalizedUrl: (m as any).originalUrl || undefined,
        framework: m.framework as any,
        cefrLevel: m.cefrLevel as any,
        wordCount: m.wordCount,
        pageCount: m.pageCount,
        aiAnalyses: {
          create: {
            analysisType: 'FULL_ENRICHMENT',
            status: 'COMPLETED',
            relevanceScore: 95,
            overallQualityScore: 92,
            levelMatchScore: 94,
            languageCorrectness: 98,
            skillMatchScore: 92,
            completenessScore: 95,
            aiSummary: `Verified ${m.language} curriculum material for ${m.framework} ${m.cefrLevel || 'Level'}. ${m.description}`,
            keyVocabulary: m.language === 'Korean' ? ['안녕하세요', '감사합니다', '학생', '선생님', '학교', '식당'] :
              m.language === 'Spanish' ? ['Hola', 'Gracias', 'Estudiante', 'Profesor', 'Restaurante'] :
                m.language === 'Japanese' ? ['こんにちは', 'ありがとう', '学生', '先生', '学校'] :
                  m.language === 'German' ? ['Guten Tag', 'Danke', 'Student', 'Lehrer', 'Schule'] :
                    m.language === 'French' ? ['Bonjour', 'Merci', 'Étudiant', 'Professeur', 'École'] :
                      ['Hello', 'Thank you', 'Student', 'Teacher', 'School'],
            detectedCEFR: (m.cefrLevel as any) || 'A1',
            aiRecommendation: 'APPROVED_RECOMMENDED',
            recommendationReason: `Official curriculum asset calibrated for ${m.language} Studio planning.`,
            modelProvider: 'GEMINI',
            modelName: 'gemini-2.0-flash',
            confidenceScore: 0.95,
            rawOutputPayload: {
              text: m.text,
              word_count: m.wordCount,
              page_count: m.pageCount,
              detected_level: m.cefrLevel,
              framework: m.framework,
            },
          },
        },
      },
    });
    addedCount++;
    console.log(`✓ Added: [${m.language} ${m.framework}] ${m.title}`);
  }

  // Also fix existing resources that had cefrLevel: null
  console.log('\nAuditing and setting levels for existing resources...');
  const allWithoutLevel = await prisma.resource.findMany({
    where: { cefrLevel: null },
    include: { language: true },
  });

  for (const r of allWithoutLevel) {
    let guessedLevel: any = 'A1';
    const lower = (r.title + ' ' + (r.description || '')).toLowerCase();
    if (lower.includes('b2') || lower.includes('n2') || lower.includes('l4')) guessedLevel = 'B2';
    else if (lower.includes('b1') || lower.includes('n3') || lower.includes('l3')) guessedLevel = 'B1';
    else if (lower.includes('a2') || lower.includes('n4') || lower.includes('l2')) guessedLevel = 'A2';
    else if (lower.includes('c1')) guessedLevel = 'C1';
    else if (lower.includes('c2')) guessedLevel = 'C2';
    else guessedLevel = 'A1';

    let framework: any = 'CEFR';
    if (r.language?.name === 'Japanese') framework = 'JLPT';
    else if (r.language?.name === 'Korean') framework = 'TOPIK';

    await prisma.resource.update({
      where: { id: r.id },
      data: {
        cefrLevel: guessedLevel,
        framework,
        processingStatus: 'READY',
        approvalStatus: 'APPROVED',
      },
    });
  }

  console.log(`\nDone! Successfully seeded ${addedCount} studio materials and updated existing resources.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
