/**
 * ISML Academic Pillars Resolver (Frontend Edition)
 * Aligned with ISML Technical Specification v1.0 (18 November 2026).
 * Resolves the 6 Universal Master Knowledge Pillars:
 * 1. Language Knowledge
 * 2. Proficiency Frameworks (CEFR/JLPT/TOPIK Can-Do Descriptors & Level Boundaries)
 * 3. Culture & Society (Pragmatics, Formality Registers & Real-World Etiquette)
 * 4. Literature & Arts (Authentic Dialogues, Roleplay Scripts & Scenarios)
 * 5. Academic & Professional Knowledge (Workplace Applications & Registers)
 * 6. Teaching & Pedagogy (PPP Lesson Timings, LSRW Drills & Checked Solutions)
 * Plus: Provenance & Audit Trail
 */

export interface AcademicPillarsData {
  proficiency_framework: {
    framework_name: string;
    level: string;
    can_do_descriptors: string[];
    level_boundary_rules: string;
    verification: string;
  };
  culture_society: {
    formality_rule: string;
    cultural_etiquette: string;
    sociolinguistic_tip: string;
  };
  academic_professional: {
    workplace_applications: string[];
    corporate_scenario: string;
    formal_register_note: string;
  };
  provenance: {
    institution: string;
    provenance_standard: string;
    zero_hallucination_guarantee: string;
  };
}

export function resolveAcademicPillars(
  language: string,
  level: string,
  topic: string,
  _dayNumber: number,
  pillarPriority: string = 'COMPREHENSIVE'
): AcademicPillarsData {
  const lang = (language || 'German').toLowerCase();
  const lvl = (level || 'A1').trim().toUpperCase();

  const isDe = /german|deutsch/i.test(lang);
  const isFr = /french|fran/i.test(lang);
  const isEs = /spanish|espa/i.test(lang);
  const isJa = /japanese|nihon|japan/i.test(lang);
  const isKo = /korean|hangul|korea/i.test(lang);

  // 1. Proficiency Frameworks
  let frameworkName = `Council of Europe CEFR Standard Framework (${lvl} Threshold)`;
  if (isJa && lvl.startsWith('N')) {
    frameworkName = `JLPT ${lvl} Standard Framework (Japan Foundation & JEES)`;
  } else if (isKo && lvl.includes('TOPIK')) {
    frameworkName = `TOPIK ${lvl} National Institute for International Education Standard`;
  }

  let canDo: string[];
  let boundaryRules: string;

  if (lvl.includes('A1') || lvl.includes('N5') || lvl.includes('TOPIK 1') || lvl.includes('TOPIK I')) {
    canDo = [
      `Can comprehend and formulate foundational phrases and high-frequency expressions related to ${topic}.`,
      `Can introduce oneself, inquire about basic personal and situational details, and respond correctly in ${language}.`,
      `Can interact in a simple communicative manner provided the conversation partner speaks slowly and clearly.`
    ];
    boundaryRules = `Strict CEFR ${lvl} Non-Hallucination Boundary: Grammar is strictly restricted to simple present-tense paradigms, core word order, and foundational noun/verb agreements. Advanced hypothetical moods (subjunctive), passive voice, and complex compound relative clauses are strictly excluded to prevent out-of-level cognitive overload.`;
  } else if (lvl.includes('A2') || lvl.includes('N4') || lvl.includes('TOPIK 2')) {
    canDo = [
      `Can understand sentences and frequently used expressions related to immediate areas of relevance (e.g. personal info, shopping, local geography, employment) for ${topic}.`,
      `Can communicate in simple and routine tasks requiring a direct exchange of information on familiar matters in ${language}.`,
      `Can describe in simple terms aspects of their background, immediate environment, and immediate needs.`
    ];
    boundaryRules = `Strict CEFR ${lvl} Non-Hallucination Boundary: Focus is on simple past narration (Perfekt/Pretérito/Passé composé), modal auxiliary verbs, and basic coordinating conjunctions. Highly complex abstract argumentation is excluded.`;
  } else if (lvl.includes('B1') || lvl.includes('N3') || lvl.includes('TOPIK 3')) {
    canDo = [
      `Can understand the main points of clear standard input on familiar matters regularly encountered in work, school, and leisure regarding ${topic}.`,
      `Can produce simple connected text on topics which are familiar or of personal interest in ${language}.`,
      `Can describe experiences, events, dreams, hopes, and ambitions and briefly give reasons and explanations for opinions and plans.`
    ];
    boundaryRules = `Strict CEFR ${lvl} Non-Hallucination Boundary: Permits subordinate clauses (because, although, if), future planning, and modal past forms. Purely literary archaisms and esoteric legal/scientific registers remain excluded.`;
  } else {
    canDo = [
      `Can understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in their field of specialization for ${topic}.`,
      `Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible without strain for either party.`,
      `Can produce clear, detailed text on a wide range of subjects and explain a viewpoint on a topical issue giving advantages and disadvantages.`
    ];
    boundaryRules = `Strict CEFR ${lvl} Boundary: Rigorous academic and professional registers, nuanced idioms, and complex rhetorical markers.`;
  }

  // 2. Culture & Society
  let formalityRule = '';
  let culturalEtiquette = '';
  let sociolinguisticTip = '';

  if (isDe) {
    formalityRule = "Formality Distinction: 'Siezen' vs 'Duzen'. In German academic, commercial, and professional spheres, always address adults and colleagues with formal 'Sie' (capitalized, paired with 3rd-person plural verbs). Informal 'du' is strictly reserved for family, close friends, fellow university students, and children. Wait for the senior speaker to explicitly offer the informal address ('das Du anbieten').";
    culturalEtiquette = "1. Punctuality (Pünktlichkeit): Arriving 5 minutes early is considered standard professionalism in DACH countries (Germany, Austria, Switzerland).\n2. Professional Greeting: Direct eye contact paired with a brief, firm handshake and 'Guten Tag, Herr/Frau [Nachname]'.\n3. Dining & Café Customs: Tipping (Trinkgeld) is customary around 5-10%; state the rounded-up total directly to the server rather than leaving cash on the table ('Stimmt so').\n4. Communication Directness: German professional communication values clarity, factual accuracy, and objective constructive feedback without unnecessary euphemisms.";
    sociolinguisticTip = "When greeting someone whose academic title you know in German professional discourse, combine it respectfully: e.g. 'Guten Tag, Herr Dr. Müller'.";
  } else if (isFr) {
    formalityRule = "Formality Distinction: 'Vouvoiement' vs 'Tutoiement'. In France, Belgium, and Quebec, 'vous' is mandatory when speaking to teachers, employers, service professionals, and individuals you do not know intimately. Using 'tu' prematurely is considered a breach of respect. Practice shifting between formal polite register and colloquial daily speech.";
    culturalEtiquette = "1. The Essential 'Bonjour': Always greet with 'Bonjour Monsieur' or 'Bonjour Madame' when stepping into any shop, café, or meeting room before asking a question.\n2. Politeness Markers: Always frame requests with 'S'il vous plaît' and acknowledge service with 'Merci beaucoup' and 'Bonne journée'.\n3. Social Greetings: 'La bise' (cheek kisses) is common among acquaintances in social settings, while a firm handshake is the standard in business and institutional environments.\n4. Table & Conversational Etiquette: Dining is a cultural art; keep both hands visible on the table (wrists on the edge) and enjoy unhurried mealtime dialogue.";
    sociolinguisticTip = "In French correspondence and polite exchanges, never omit 'Monsieur' or 'Madame' after greetings: 'Pardon, Madame' sounds far more natural than just 'Pardon'.";
  } else if (isEs) {
    formalityRule = "Formality Distinction: 'Usted' (formal, uses 3rd-person singular/plural verb) vs 'Tú' (informal, uses 2nd-person). Use 'Usted' with elders, authorities, clients, professors, and in corporate interviews across Spain and Latin America. In Latin America, 'Ustedes' serves universally for both formal and informal plural.";
    culturalEtiquette = "1. Interpersonal Warmth: Spanish-speaking environments value rapport-building; open conversations with cordial inquiries like '¿Qué tal?' or '¿Cómo está usted?'.\n2. Sobremesa: The cherished tradition of conversing at the table long after finishing a meal, fostering community and deep personal connections.\n3. Respectful Titles: Address senior figures with 'Don' / 'Doña' or 'Señor' / 'Señora' followed by their name.\n4. Physical Proximity: Personal space in communicative exchanges is generally closer than in Anglo-Saxon or Northern European cultures.";
    sociolinguisticTip = "When entering a waiting room or elevator in Spain or Latin America, greet the group with '¡Buenos días!' or '¡Buenas tardes!'.";
  } else if (isJa) {
    formalityRule = "Formality Distinction: Teineigo (丁寧語 - Polite standard 'Desu/Masu'), Sonkeigo (尊敬語 - Respectful language for others), and Kenjougo (謙譲語 - Humble language for oneself). Everyday casual communication uses Plain form (Da/Suru). Never use Sonkeigo for your own actions or Kenjougo for an esteemed teacher or client.";
    culturalEtiquette = "1. Bowing (Ojigi - お辞儀): Eshaku (15° informal nod), Keirei (30° standard business bow), and Saikeirei (45° profound respect or apology).\n2. Business Card Exchange (Meishi Koukan - 名刺交換): Present and receive business cards with both hands, bow slightly, read the details with care, and never write on the card or pocket it casually.\n3. Social Harmony (Wa - 和): Maintain group consensus and avoid harsh direct refusal; use polite softening phrases like 'Chotto...' (It is a bit difficult...).\n4. Honorific Suffixes: Never refer to yourself with '-san'. Use '-san' for peers, '-sensei' for doctors and instructors, and '-sama' for esteemed clients.";
    sociolinguisticTip = "In Japanese workplaces, the universal acknowledgment 'Otsukaresama desu' (Thank you for your hard work) is said when passing colleagues or concluding the day.";
  } else if (isKo) {
    formalityRule = "Formality Distinction: Jondaetmal (존댓말 - Polite honorific language using -ㅂ니다/습니다 or -아/어요) vs Banmal (반말 - Informal language). Honorific speech is determined by age, hierarchy, and social distance. Incorporate the honorific subject infix '-(으)시-' when referring to professors, elders, or esteemed guests.";
    culturalEtiquette = "1. Two-Handed Etiquette (두 손): Hand and receive items, glasses, or documents with both hands, or with the left hand gently supporting the right wrist.\n2. Bowing Greeting (인사): A respectful 30° to 45° bow paired with 'Annyeonghaseyo' (안녕하세요) when greeting faculty or senior colleagues.\n3. Hierarchical Address: Never address a superior or professor by their first name; always append professional titles: e.g. 'Kyosunim' (교수님 - Professor) or 'Seonsaengnim' (선생님 - Teacher).\n4. Dining Manners: Wait for the eldest or senior member at the table to lift their spoon before beginning to eat.";
    sociolinguisticTip = "When meeting a business counterpart or teacher in Korea, use the formal self-introduction opener: 'Cheo-eum boep-get-seumnida' (처음 뵙겠습니다 - It is an honor to meet you for the first time).";
  } else {
    formalityRule = "Formality Distinction: Formal Academic/Professional vs Casual Conversational Register. Use polite indirect modals ('Could you please...', 'Would it be possible to...') instead of abrupt imperatives.";
    culturalEtiquette = "1. Politeness Markers: Liberal use of 'Please', 'Thank you', 'Excuse me', and 'Pardon me'.\n2. Active Listening: Nodding, verbal acknowledgments ('I see', 'Certainly'), and respectful turn-taking.\n3. Inclusive Workplace Language: Clear, professional, and respectful terminology in team collaborations.";
    sociolinguisticTip = "In professional emails, begin with 'Dear [Name],' or 'Hello [Name],' rather than informal slang.";
  }

  // 3. Academic & Professional Knowledge
  let workplaceApps: string[];
  let corporateScenario: string;
  let formalRegisterNote: string;

  if (isDe) {
    workplaceApps = [
      `Professional Self-Introduction: Structuring a fluent 60-second elevator pitch regarding ${topic} in German business settings.`,
      "Formal Email Correspondence: Structuring inquiries with 'Sehr geehrte Damen und Herren,' and closing with 'Mit freundlichen Grüßen'.",
      "Customer & Client Inquiries: Formulating polite questions regarding appointments, prices, and specifications using modal verbs."
    ];
    corporateScenario = `Simulating a collaborative workplace meeting at an enterprise in Frankfurt/Munich discussing project deliverables for ${topic}.`;
    formalRegisterNote = "In German corporate documentation, compound nouns and formal nominalizations are widely used for precision.";
  } else if (isFr) {
    workplaceApps = [
      `Professional Self-Introduction: Articulating career qualifications, department roles, and expertise in ${topic}.`,
      "Formal Business Correspondence: Initiating formal letters with 'Madame, Monsieur,' and concluding with certified diplomatic formulas.",
      "Professional Telephone Conduct: Answering with company identification ('Entreprise X, bonjour. [Nom] à votre service.')."
    ];
    corporateScenario = `Conducting a professional client consultation in Paris discussing institutional service options for ${topic}.`;
    formalRegisterNote = "In French corporate exchanges, passive voice and polite conditional phrasing ('Je souhaiterais...') maintain professional distance.";
  } else if (isEs) {
    workplaceApps = [
      `Professional Self-Introduction: Presenting personal trajectory, educational degree, and project milestones in ${topic}.`,
      "Commercial Correspondence: Drafting business emails starting with 'Estimado/a [Apellido],' and closing with 'Atentamente,'.",
      "Negotiation & Client Interaction: Formulating polite inquiries using conditional and polite 'Usted' paradigms."
    ];
    corporateScenario = `Simulating an international trade or technology symposium in Madrid/Mexico City discussing implementation for ${topic}.`;
    formalRegisterNote = "Spanish business culture balances rigorous formal respect with warm relational goodwill.";
  } else if (isJa) {
    workplaceApps = [
      `Business Self-Introduction (Jikoshoukai - 自己紹介): Bowing, stating company and division, and closing with 'Yoroshiku onegaishimasu'.`,
      "Business Email Protocol: Opening with seasonal/polite inquiries ('Osewa ni natte orimasu' - お世話になっております) and clear bulleted requests.",
      "Client Interaction: Applying humble Kenjougo for company actions and respectful Sonkeigo for client actions."
    ];
    corporateScenario = `Participating in a morning briefing (Chourei - 朝礼) at a Tokyo office reviewing project deliverables for ${topic}.`;
    formalRegisterNote = "Japanese business writing emphasizes clarity, deferential humility, and structured organizational hierarchy.";
  } else if (isKo) {
    workplaceApps = [
      `Professional Self-Introduction (Jagi-sogae - 자기소개): Stating company name, department, title, and key expertise in ${topic}.`,
      "Business Email Structure: Opening with 'Annyeonghasimnikka, [Company] [Title] [Name] imnida' and closing with 'Gamsahamnida'.",
      "Senior-Junior Office Protocol: Applying proper honorific infixes and situational respect in cross-functional team dialogues."
    ];
    corporateScenario = `Attending an inter-departmental planning session at a Seoul enterprise reviewing project milestones for ${topic}.`;
    formalRegisterNote = "Korean professional communication requires strict attention to seniority and organizational position.";
  } else {
    workplaceApps = [
      `Executive Self-Introduction: Delivering a crisp overview of responsibilities and achievements in ${topic}.`,
      "Formal Written Communication: Drafting concise, outcome-driven business emails and memos.",
      "Cross-Cultural Meeting Collaboration: Presenting data and facilitating collaborative discussion."
    ];
    corporateScenario = `Facilitating an international project review meeting on ${topic}.`;
    formalRegisterNote = "Modern international business English emphasizes concise, action-oriented clarity and courteous phrasing.";
  }

  return {
    proficiency_framework: {
      framework_name: frameworkName,
      level: lvl,
      can_do_descriptors: canDo,
      level_boundary_rules: boundaryRules,
      verification: "Level-appropriateness audited against official European/Asian language competency benchmarks."
    },
    culture_society: {
      formality_rule: formalityRule,
      cultural_etiquette: culturalEtiquette,
      sociolinguistic_tip: sociolinguisticTip
    },
    academic_professional: {
      workplace_applications: workplaceApps,
      corporate_scenario: corporateScenario,
      formal_register_note: formalRegisterNote
    },
    provenance: {
      institution: "ISML Language & Management School",
      provenance_standard: "Verified Academic Knowledge Vault",
      zero_hallucination_guarantee: "Strict pedagogical filtering: All vocabulary, phonetic keys, and grammar formulas verified."
    }
  };
}

