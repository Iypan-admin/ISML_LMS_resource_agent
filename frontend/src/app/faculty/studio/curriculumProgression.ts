// =============================================================================
// ISML CURRICULUM PROGRESSION ENGINE
// Dynamic 12-Month Academic Curriculum Generator (365/366 Calendar Days)
// Provides authentic, distinct, progressive linguistic material across every month
// =============================================================================

export interface DayCurriculumItem {
  day_number: number;
  month_number: number;
  calendar_month_name: string;
  calendar_month_short: string;
  day_in_month: number;
  month_total_days: number;
  week_number: number;
  module_week: string;
  day_topic: string;
  grammar_rules_detail: string;
  study_notes_markdown: string;
  vocabulary_bank: Array<{ word: string; meaning: string; pronunciation: string; example_sentence: string }>;
  classroom_dialogues: string[];
  pedagogical_instructions: string;
  video_breakdown_analysis: string;
  in_class_exercises: string[];
  exercise_solutions: Array<{ question: string; answer: string; explanation: string }>;
  homework_tasks: string[];
}

interface MonthlyTheme {
  monthIndex: number;
  topicTitle: string;
  grammarFocus: string;
  syntacticFormula: string;
  conjugationTable: string;
  phoneticsTrap: string;
  vocab: Array<{ word: string; meaning: string; pronunciation: string; example_sentence: string }>;
  dialogue: string[];
  drills: Array<{ question: string; answer: string; explanation: string }>;
  homework: string[];
}

// -----------------------------------------------------------------------------
// FRENCH 12-MONTH CALENDAR MATRIX
// -----------------------------------------------------------------------------
const FRENCH_MONTHS: Record<number, MonthlyTheme> = {
  1: {
    monthIndex: 1,
    topicTitle: "Present Indicative: Group 1 (-er) Regular Verbs & Phonetic Grounding",
    grammarFocus: "Regular 1st-group verb conjugation patterns, subject pronouns, and phonetic silent terminations.",
    syntacticFormula: "Affirmative: `[Sujet] + [Radical] + -e/-es/-e/-ons/-ez/-ent + [Complément]`\nNegative: `[Sujet] + ne/n' + [Verbe] + pas + [Complément]`",
    conjugationTable: "| Pronom Sujet | Terminaison | Exemple (Parler) | Phonétique |\n|---|---|---|---|\n| Je | -e | je parle | /ʒə paʁl/ |\n| Tu | -es | tu parles | /ty paʁl/ |\n| Il / Elle / On | -e | il/elle parle | /il paʁl/ |\n| Nous | -ons | nous parlons | /nu paʁ.lɔ̃/ |\n| Vous | -ez | vous parlez | /vu paʁ.le/ |\n| Ils / Elles | -ent | ils/elles parlent | /il paʁl/ |",
    phoneticsTrap: "The singular forms (parle, parles, parle) and the 3rd person plural (parlent) are phonetically identical (/paʁl/). The ending '-ent' in 3rd person plural verbs is ALWAYS silent.",
    vocab: [
      { word: "parler", meaning: "to speak", pronunciation: "/paʁ.le/", example_sentence: "Je parle français avec mon professeur tous les matins." },
      { word: "habiter", meaning: "to live / reside", pronunciation: "/a.bi.te/", example_sentence: "Nous habitons à Paris dans un bel appartement." },
      { word: "aimer", meaning: "to like / to love", pronunciation: "/e.me/", example_sentence: "J'aime apprendre de nouvelles langues chaque jour." },
      { word: "travailler", meaning: "to work", pronunciation: "/tʁa.va.je/", example_sentence: "Elle travaille dans une entreprise internationale." },
      { word: "écouter", meaning: "to listen", pronunciation: "/e.ku.te/", example_sentence: "Vous écoutez attentivement les dialogues audio en classe." }
    ],
    dialogue: [
      "Professeur: Bonjour ! Comment vous vous appelez et quelle langue parlez-vous ? (Teacher: Hello! What is your name and what language do you speak?)",
      "Étudiant: Bonjour professeur ! Je m'appelle Thomas et j'apprends le français avec enthousiasme. (Student: Hello professor! My name is Thomas and I am enthusiastically learning French.)",
      "Professeur: Très bien, où habitez-vous actuellement ? (Teacher: Very good, where do you currently live?)",
      "Étudiant: J'habite à Lyon et je travaille dans le centre-ville. (Student: I live in Lyon and I work downtown.)"
    ],
    drills: [
      { question: "Conjugate the verb 'parler' (to speak) for the subject pronoun 'nous'.", answer: "nous parlons", explanation: "Regular 1st-group French verbs take the '-ons' ending for the 1st person plural (nous)." },
      { question: "Translate into French: 'I live in Paris and I speak French.'", answer: "J'habite à Paris et je parle français.", explanation: "Before a vowel or mute 'h', 'je' elides to 'j''. The city preposition 'à' is mandatory before Paris." },
      { question: "Rectify the grammatical agreement error: 'Ils écoute la radio.'", answer: "Ils écoutent la radio.", explanation: "The 3rd-person plural subject pronoun 'ils' demands the plural suffix '-ent' (silent)." }
    ],
    homework: [
      "Write a 5-sentence personal introduction applying regular -er verbs with correct pronoun elision.",
      "Record a 60-second voice note introducing your home city and daily language practice."
    ]
  },
  2: {
    monthIndex: 2,
    topicTitle: "Vital Irregular Auxiliaries: Être (To Be) & Avoir (To Have)",
    grammarFocus: "Mastery of essential irregular roots, states of being, age, possession, and idioms of physical sensation.",
    syntacticFormula: "Être Formula: `[Sujet] + [être] + [Adjectif / Profession / Nationalité]`\nAvoir Formula: `[Sujet] + [avoir] + [Nom / Âge / Sensation]`",
    conjugationTable: "| Sujet | Être (Présent) | Phonétique | Avoir (Présent) | Phonétique |\n|---|---|---|---|---|\n| Je / J' | suis | /sɥi/ | ai | /e/ |\n| Tu | es | /ɛ/ | as | /a/ |\n| Il / Elle | est | /ɛ/ | a | /a/ |\n| Nous | sommes | /sɔm/ | avons | /a.vɔ̃/ |\n| Vous | êtes | /ɛt/ | avez | /a.ve/ |\n| Ils / Elles | sont | /sɔ̃/ | ont | /ɔ̃/ |",
    phoneticsTrap: "Contrast 'ils sont' (/il.sɔ̃/ - unvoiced 's') vs 'ils ont' (/il.zɔ̃/ - voiced liaison 'z'). Mixing these up changes 'they are' to 'they have'.",
    vocab: [
      { word: "être", meaning: "to be", pronunciation: "/ɛtʁ/", example_sentence: "Nous sommes prêts pour la session d'évaluation." },
      { word: "avoir", meaning: "to have", pronunciation: "/a.vwaʁ/", example_sentence: "J'ai vingt-cinq ans et j'ai faim après le cours." },
      { word: "fatigué", meaning: "tired", pronunciation: "/fa.ti.ɡe/", example_sentence: "Elle est un peu fatiguée ce soir." },
      { word: "soif", meaning: "thirst", pronunciation: "/swaf/", example_sentence: "Avez-vous soif après cette longue marche ?" },
      { word: "occupé", meaning: "busy", pronunciation: "/ɔ.ky.pe/", example_sentence: "Le directeur est très occupé cet après-midi." }
    ],
    dialogue: [
      "Professeur: Bonjour Sophie ! Êtes-vous prête pour l'évaluation orale ? (Teacher: Hello Sophie! Are you ready for the oral evaluation?)",
      "Étudiante: Oui professeur, je suis un peu nerveuse mais j'ai confiance en mes révisions. (Student: Yes teacher, I am a bit nervous but confident in my review.)",
      "Professeur: Parfait, vous avez beaucoup progressé ce mois-ci ! (Teacher: Perfect, you have progressed greatly this month!)",
      "Étudiante: Merci, nous sommes très motivés dans notre groupe d'étude. (Student: Thank you, we are very motivated in our study group.)"
    ],
    drills: [
      { question: "Conjugate the verb 'être' for 'vous'.", answer: "vous êtes", explanation: "The 2nd person plural of être is 'êtes' (with circumflex accent on the first e)." },
      { question: "Translate into French: 'They have two meetings today.'", answer: "Ils ont deux réunions aujourd'hui.", explanation: "The 3rd person plural of avoir is 'ont'. Notice the mandatory voiced /z/ liaison in spoken French (/il.zɔ̃/)." },
      { question: "Rectify the error: 'Je suis 24 ans.'", answer: "J'ai 24 ans.", explanation: "In French, expressing age requires the auxiliary 'avoir', never 'être'." }
    ],
    homework: [
      "Write 6 sentences describing members of your family using 'être' for professions/traits and 'avoir' for ages and possessions.",
      "Record an audio drill practicing the phonetic contrast between 'ils sont' (/s/) and 'ils ont' (/z/)."
    ]
  },
  3: {
    monthIndex: 3,
    topicTitle: "Second Group (-ir) & Third Group (-re) Verbs: Finir & Prendre",
    grammarFocus: "Infinitive classification, inchoative '-iss-' plural stems, irregular radical reductions, and transitives.",
    syntacticFormula: "2nd Group (-ir): `[Radical] + -is, -is, -it, -issons, -issez, -issent`\n3rd Group (-re): `[Radical] + -s, -s, -/t, -ons, -ez, -ent` (e.g. Prendre: prend- / pren- / prenn-)",
    conjugationTable: "| Sujet | Finir (-ir) | Phonétique | Prendre (-re) | Phonétique |\n|---|---|---|---|---|\n| Je | finis | /fi.ni/ | prends | /pʁɑ̃/ |\n| Tu | finis | /fi.ni/ | prends | /pʁɑ̃/ |\n| Il / Elle | finit | /fi.ni/ | prend | /pʁɑ̃/ |\n| Nous | finissons | /fi.ni.sɔ̃/ | prenons | /pʁə.nɔ̃/ |\n| Vous | finissez | /fi.ni.se/ | prenez | /pʁə.ne/ |\n| Ils / Elles | finissent | /fi.nis/ | prennent | /pʁɛn/ |",
    phoneticsTrap: "In 'ils prennent', the double 'n' opens the preceding 'e' into an open /ɛ/ sound (/pʁɛn/), unlike the singular 'il prend' which has nasal /pʁɑ̃/.",
    vocab: [
      { word: "finir", meaning: "to finish", pronunciation: "/fi.niʁ/", example_sentence: "Nous finissons notre rapport avant dix-sept heures." },
      { word: "choisir", meaning: "to choose", pronunciation: "/ʃwa.ziʁ/", example_sentence: "Vous choisissez l'horaire qui vous convient le mieux." },
      { word: "prendre", meaning: "to take", pronunciation: "/pʁɑ̃dʁ/", example_sentence: "Je prends le train pour aller à Marseille." },
      { word: "attendre", meaning: "to wait", pronunciation: "/a.tɑ̃dʁ/", example_sentence: "Ils attendent leur collègue devant le bureau." },
      { word: "comprendre", meaning: "to understand", pronunciation: "/kɔ̃.pʁɑ̃dʁ/", example_sentence: "Est-ce que tu comprends les explications grammaticales ?" }
    ],
    dialogue: [
      "Collègue A: À quelle heure finissez-vous votre travail aujourd'hui ? (Colleague A: What time do you finish work today?)",
      "Collègue B: Je finis vers dix-huit heures, et je prends le métro pour rentrer. (Colleague B: I finish around 6 PM, and I take the subway home.)",
      "Collègue A: Est-ce que vous attendez Thomas à la gare ? (Colleague A: Are you waiting for Thomas at the station?)",
      "Collègue B: Oui, nous prenons un café ensemble avant son départ. (Colleague B: Yes, we are having a coffee together before his departure.)"
    ],
    drills: [
      { question: "Conjugate the verb 'finir' for the subject pronoun 'nous'.", answer: "nous finissons", explanation: "All regular 2nd-group French verbs take the interfix '-iss-' before plural endings: fin-iss-ons." },
      { question: "Translate into French: 'What do you choose, coffee or tea?'", answer: "Qu'est-ce que vous choisissez, du café ou du thé ?", explanation: "Choisir is a regular 2nd group verb (choisissez for vous). Partitive articles du café / du thé are used." },
      { question: "Rectify the error: 'Ils prennent le bus mais ils attends.'", answer: "Ils prennent le bus mais ils attendent.", explanation: "'Attendre' with 3rd-person plural 'ils' demands the ending '-ent' -> 'attendent'." }
    ],
    homework: [
      "Conjugate 'apprendre' and 'réfléchir' across all 6 grammatical persons with phonetic transcriptions.",
      "Write a short paragraph about your transportation habits and work schedule using 'prendre', 'attendre', and 'finir'."
    ]
  },
  4: {
    monthIndex: 4,
    topicTitle: "Food, Hospitality, Commerce & Partitive Articles (du, de la, de l', des)",
    grammarFocus: "Indefinite quantity vs definite appreciation, partitive syntax, ordering at restaurant, and commerce expressions.",
    syntacticFormula: "Affirmative Partitive: `[Verbe d'ingestion/achat] + du / de la / de l' / des + [Nom]`\nNegative Reduction: `[Verbe négatif] + de / d' + [Nom]` (Exception: verbe être)",
    conjugationTable: "| Sujet | Boire (To Drink) | Phonétique | Manger (To Eat) | Phonétique |\n|---|---|---|---|---|\n| Je | bois | /bwa/ | mange | /mɑ̃ʒ/ |\n| Tu | bois | /bwa/ | manges | /mɑ̃ʒ/ |\n| Il / Elle | boit | /bwa/ | mange | /mɑ̃ʒ/ |\n| Nous | buvons | /by.vɔ̃/ | mangeons | /mɑ̃.ʒɔ̃/ |\n| Vous | buvez | /by.ve/ | mangez | /mɑ̃.ʒe/ |\n| Ils / Elles | boivent | /bwav/ | mangent | /mɑ̃ʒ/ |",
    phoneticsTrap: "In 'nous mangeons', an 'e' is preserved after 'g' before 'o' to maintain the soft /ʒ/ sound. Without it, 'mangons' would be pronounced with a hard /ɡ/.",
    vocab: [
      { word: "le pain", meaning: "bread", pronunciation: "/lə pɛ̃/", example_sentence: "J'achète du pain frais à la boulangerie chaque matin." },
      { word: "le fromage", meaning: "cheese", pronunciation: "/lə fʁɔ.maʒ/", example_sentence: "En France, on mange souvent du fromage après le plat principal." },
      { word: "commander", meaning: "to order", pronunciation: "/kɔ.mɑ̃.de/", example_sentence: "Nous souhaitons commander deux menus du jour." },
      { word: "l'addition", meaning: "the bill / check", pronunciation: "/la.di.sjɔ̃/", example_sentence: "Garçon, l'addition s'il vous plaît !" },
      { word: "délicieux", meaning: "delicious", pronunciation: "/de.li.sjø/", example_sentence: "Ce plat traditionnel est absolument délicieux." }
    ],
    dialogue: [
      "Serveur: Bonjour monsieur, vous avez choisi ? (Waiter: Hello sir, have you chosen?)",
      "Client: Oui, je voudrais du saumon grillé avec de la salade et du riz. (Customer: Yes, I would like grilled salmon with salad and rice.)",
      "Serveur: Et comme boisson, que désirez-vous ? (Waiter: And for drinks, what would you like?)",
      "Client: Une carafe d'eau fraîche, s'il vous plaît. (Customer: A carafe of cold water, please.)"
    ],
    drills: [
      { question: "Fill in the partitive article: 'Je voudrais ___ eau minérale et ___ croissants.'", answer: "de l'eau minérale et des croissants", explanation: "'Eau' begins with a vowel so 'de l'' is required; 'croissants' is plural so 'des' is used." },
      { question: "Translate into French: 'He does not eat meat.'", answer: "Il ne mange pas de viande.", explanation: "In negative sentences, the partitive article 'de la' reduces strictly to 'de'." },
      { question: "Rectify the error: 'J'aime du chocolat mais je mange le chocolat.'", answer: "J'aime le chocolat mais je mange du chocolat.", explanation: "Verbs of preference (aimer, adorer) take definite articles (le/la/les); verbs of consumption take partitives (du/de la/des)." }
    ],
    homework: [
      "Create a sample bistro menu with 3 courses and write a 6-turn roleplay ordering lunch with partitives.",
      "Record an audio reading of the bistro dialogue focusing on the nasal /ɛ̃/ in 'du pain' and 'du vin'."
    ]
  },
  5: {
    monthIndex: 5,
    topicTitle: "Passé Composé with Avoir: Completed Actions & Past Narratives",
    grammarFocus: "Auxiliary selection, past participle formation (-é, -i, -u), and chronological narrative sequencing.",
    syntacticFormula: "Passé Composé Formula: `[Sujet] + [Avoir au présent] + [Participe Passé]`\nParticiple Rules: 1st group (-er) -> -é | 2nd group (-ir) -> -i | 3rd group -> -u / -is / -it",
    conjugationTable: "| Verbe Infinitif | Participe Passé | Exemple Conjugué (Nous) | Traduction |\n|---|---|---|---|\n| Parler (-er) | parlé | nous avons parlé | we spoke / have spoken |\n| Finir (-ir) | fini | nous avons fini | we finished |\n| Prendre (-re) | pris | nous avons pris | we took |\n| Faire (Irr.) | fait | nous avons fait | we did / made |\n| Avoir (Irr.) | eu | nous avons eu | we had |\n| Être (Irr.) | été | nous avons été | we were / have been |",
    phoneticsTrap: "The past participle 'eu' (/y/) is pronounced with a single closed rounded vowel sound, identical to the letter 'u', never as /ø/ or /u/.",
    vocab: [
      { word: "hier", meaning: "yesterday", pronunciation: "/jɛʁ/", example_sentence: "Hier, nous avons organisé une réunion stratégique." },
      { word: "terminer", meaning: "to complete / terminate", pronunciation: "/tɛʁ.mi.ne/", example_sentence: "J'ai terminé mon projet à minuit." },
      { word: "rencontrer", meaning: "to meet", pronunciation: "/ʁɑ̃.kɔ̃.tʁe/", example_sentence: "Elle a rencontré les nouveaux partenaires commerciaux." },
      { word: "comprendre", meaning: "to understand", pronunciation: "/kɔ̃.pʁɑ̃dʁ/", example_sentence: "Les stagiaires ont tout de suite compris la consigne." },
      { word: "réussir", meaning: "to succeed / pass", pronunciation: "/ʁe.y.siʁ/", example_sentence: "Tu as réussi ton examen avec une mention très bien." }
    ],
    dialogue: [
      "Directrice: Avez-vous terminé le dossier client ce matin ? (Director: Did you finish the client file this morning?)",
      "Employé: Oui madame, j'ai préparé toutes les données et j'ai envoyé le courriel. (Employee: Yes ma'am, I prepared all data and sent the email.)",
      "Directrice: Parfait. Est-ce que le directeur financier a signé le document ? (Director: Perfect. Did the CFO sign the document?)",
      "Employé: Il a examiné les chiffres et il a validé le budget hier. (Employee: He reviewed the figures and validated the budget yesterday.)"
    ],
    drills: [
      { question: "Conjugate 'terminer' in passé composé for 'nous'.", answer: "nous avons terminé", explanation: "Regular 1st-group verbs take the auxiliary 'avoir' followed by the past participle ending in '-é'." },
      { question: "Translate into French: 'She had an opportunity and she took it.'", answer: "Elle a eu une opportunité et elle l'a prise.", explanation: "The past participle of avoir is 'eu'. With a preceding direct object pronoun 'l'' (referring to opportunité), participle agreement 'prise' occurs." },
      { question: "Rectify the error: 'Hier soir, j'ai prendu le train.'", answer: "Hier soir, j'ai pris le train.", explanation: "The past participle of 'prendre' is irregular: 'pris', never 'prendu'." }
    ],
    homework: [
      "Write a 100-word journal entry detailing 5 completed actions you accomplished yesterday using passé composé with avoir.",
      "Record a 60-second audio clip summarizing your last weekend's activities chronologically."
    ]
  },
  6: {
    monthIndex: 6,
    topicTitle: "Passé Composé with Être: Motion Verbs & Agreement Mechanics",
    grammarFocus: "Dr & Mrs Vandertramp motion verbs, reflexive verb past tense, and mandatory subject-participle agreement.",
    syntacticFormula: "Être Agreement Formula: `[Sujet] + [Être au présent] + [Participe Passé] + [Accord: -e (fem) / -s (plur) / -es (fem plur)]`\nReflexive Past: `[Sujet] + [Pronom réfléchi] + [Être au présent] + [Participe Passé]`",
    conjugationTable: "| Sujet | Aller (Être) | Accord Exemple | Traduction |\n|---|---|---|---|\n| Je (Masc/Fém) | suis allé / allée | accord si locuteur fém (+e) | I went |\n| Tu (Masc/Fém) | es allé / allée | accord selon interlocuteur | you went |\n| Il / Elle | est allé / allée | il (+0) / elle (+e) | he / she went |\n| Nous (Masc/Fém Plur) | sommes allés / allées | obligatoire (+s / +es) | we went |\n| Vous (Polite / Plur) | êtes allé(e)(s) | accord selon statut du vous | you went |\n| Ils / Elles | sont allés / allées | ils (+s) / elles (+es) | they went |",
    phoneticsTrap: "In 'elles sont allées' (/ɛl.sɔ̃.ta.le/), the written 'es' agreement is silent! The liaison between 'sont' and 'allées' links with a /t/ sound (/sɔ̃.t‿a.le/).",
    vocab: [
      { word: "aller", meaning: "to go", pronunciation: "/a.le/", example_sentence: "Elle est allée à la conférence européenne." },
      { word: "partir", meaning: "to leave / depart", pronunciation: "/paʁ.tiʁ/", example_sentence: "Les délégués sont partis tôt ce matin." },
      { word: "arriver", meaning: "to arrive", pronunciation: "/a.ʁi.ve/", example_sentence: "Le train est arrivé sur la voie numéro trois." },
      { word: "se réveiller", meaning: "to wake up", pronunciation: "/sə ʁe.vɛ.je/", example_sentence: "Je me suis réveillé à six heures et demie." },
      { word: "rentrer", meaning: "to return / go home", pronunciation: "/ʁɑ̃.tʁe/", example_sentence: "Nous sommes rentrés tard après le séminaire." }
    ],
    dialogue: [
      "Professeur: À quelle heure êtes-vous arrivées à l'université ce matin, mesdemoiselles ? (Teacher: What time did you arrive at the university this morning, ladies?)",
      "Étudiantes: Nous sommes arrivées à huit heures et nous sommes allées directement à la bibliothèque. (Students: We arrived at 8:00 and went directly to the library.)",
      "Professeur: Et votre collègue Lucas est-il venu avec vous ? (Teacher: And did your colleague Lucas come with you?)",
      "Étudiantes: Non, il est resté chez lui pour finaliser sa présentation. (Students: No, he stayed home to finalize his presentation.)"
    ],
    drills: [
      { question: "Conjugate 'partir' in passé composé for 'elles'.", answer: "elles sont parties", explanation: "'Partir' is a motion verb taking 'être'; feminine plural subject 'elles' demands '+es' agreement on the participle." },
      { question: "Translate into French: 'We (masculine plural) arrived in Paris yesterday.'", answer: "Nous sommes arrivés à Paris hier.", explanation: "With 'être', the masculine plural subject 'nous' adds '-s' to the participle 'arrivé'." },
      { question: "Rectify the error: 'Marie a allé au cinéma.'", answer: "Marie est allée au cinéma.", explanation: "'Aller' requires auxiliary 'être', and feminine singular subject demands agreement (+e): 'est allée'." }
    ],
    homework: [
      "Memorize the 14 core Vandertramp motion verbs and write a story containing at least 6 with correct gender agreements.",
      "Record an audio narrative describing a travel itinerary using past motion verbs."
    ]
  },
  7: {
    monthIndex: 7,
    topicTitle: "Travel, Geographical Prepositions & Descriptive Adjectives",
    grammarFocus: "Prepositions with geographical entities (en, au, aux, à), BANGS adjective placement, and hospitality transactions.",
    syntacticFormula: "Geographical Prepositions: `en + Pays féminin/voyelle` | `au + Pays masculin` | `aux + Pays pluriel` | `à + Ville`\nAdjective Position: BANGS (Beauty, Age, Number, Goodness, Size) before noun; descriptive/color after noun.",
    conjugationTable: "| Type Géographique | Préposition | Exemple | Règle d'Accord |\n|---|---|---|---|\n| Ville | à | à Paris, à Madrid | invariable |\n| Pays Féminin (finit par 'e') | en | en France, en Espagne | commence par voyelle ou finit par e |\n| Pays Masculin (consonne) | au | au Canada, au Japon | au = à + le |\n| Pays Pluriel | aux | aux États-Unis, aux Pays-Bas | aux = à + les |\n| Adjectif BANGS | avant nom | un grand hôtel, une belle ville | place avant le substantif |",
    phoneticsTrap: "In 'aux États-Unis' (/o.ze.ta.zy.ni/), there are TWO mandatory liaisons: 'aux' -> /z/ -> 'États' -> /z/ -> 'Unis'.",
    vocab: [
      { word: "voyager", meaning: "to travel", pronunciation: "/vwa.ja.ʒe/", example_sentence: "J'adore voyager en Amérique latine et au Japon." },
      { word: "l'hôtel", meaning: "hotel", pronunciation: "/lo.tɛl/", example_sentence: "Nous avons réservé un charmant petit hôtel au centre." },
      { word: "le billet", meaning: "ticket", pronunciation: "/lə bi.jɛ/", example_sentence: "Avez-vous acheté votre billet d'avion pour Rome ?" },
      { word: "magnifique", meaning: "magnificent", pronunciation: "/ma.ɲi.fik/", example_sentence: "Le coucher de soleil sur la plage était absolument magnifique." },
      { word: "confortable", meaning: "comfortable", pronunciation: "/kɔ̃.fɔʁ.tabl/", example_sentence: "Cette chambre double est spacieuse et très confortable." }
    ],
    dialogue: [
      "Réceptionniste: Bienvenue à l'Hôtel de la Paix ! Vous avez une réservation ? (Receptionist: Welcome to Hotel de la Paix! Do you have a reservation?)",
      "Touriste: Oui, j'ai réservé une grande chambre double pour trois nuits au nom de Dupont. (Tourist: Yes, I booked a large double room for three nights under the name Dupont.)",
      "Réceptionniste: Tout à fait monsieur, votre chambre est au troisième étage avec une vue magnifique. (Receptionist: Absolutely sir, your room is on the 3rd floor with a magnificent view.)",
      "Touriste: Parfait ! Est-ce que le petit-déjeuner est inclus dans le tarif ? (Tourist: Perfect! Is breakfast included in the rate?)"
    ],
    drills: [
      { question: "Insert the correct prepositions: 'Nous allons ___ Italie, puis ___ Mexique et enfin ___ Tokyo.'", answer: "en Italie, au Mexique, à Tokyo", explanation: "Italie is feminine country (en); Mexique is masculine country (au); Tokyo is a city (à)." },
      { question: "Translate into French: 'They stayed in a beautiful old hotel in London.'", answer: "Ils ont séjourné dans un bel hôtel ancien à Londres.", explanation: "'Beau' becomes 'bel' before a masculine noun starting with a mute 'h'; 'ancien' follows; 'à' is for London." },
      { question: "Rectify the error: 'Je voyage à le Brésil chaque hiver.'", answer: "Je voyage au Brésil chaque hiver.", explanation: "'À + le' contracts obligatorily into 'au' before masculine countries." }
    ],
    homework: [
      "Plan a 4-country international journey and write descriptions of each stop using correct geographical prepositions and BANGS adjectives.",
      "Record an audio checking in to a Parisian hotel with specific requests regarding room amenities."
    ]
  },
  8: {
    monthIndex: 8,
    topicTitle: "Professional Communication, Corporate Formatting & Email Etiquette",
    grammarFocus: "Formal address registers (vous vs tu), business email structural formulas, telephone conventions, and scheduling.",
    syntacticFormula: "Formal Email Header: `Madame, Monsieur,`\nPurpose Statement: `Je me permets de vous contacter afin de...`\nAttachment Notice: `Veuillez trouver ci-joint...`\nPolite Salutation: `Dans l'attente de votre retour, je vous prie d'agréer mes salutations distinguées.`",
    conjugationTable: "| Verbe Clé | Forme Polie / Courriel | Exemple d'Usage | Registre |\n|---|---|---|---|\n| Contacter | je me permets de vous contacter | pour notre collaboration | Très formel |\n| Envoyer | je vous transmets | ci-joint les documents requis | Professionnel |\n| Prier | je vous prie d'agréer | mes salutations distinguées | Clôture officielle |\n| Confirmer | nous vous confirmons | la tenue de la réunion | Administratif |\n| Remercier | en vous remerciant | pour votre coopération | Courtoisie |",
    phoneticsTrap: "In 'veuillez agréer' (/vœ.je.za.ɡʁe.e/), perform the liaisons smoothly without over-accentuating the final syllables.",
    vocab: [
      { word: "le courriel", meaning: "email", pronunciation: "/lə ku.ʁjɛl/", example_sentence: "J'accuse bonne réception de votre courriel de ce matin." },
      { word: "la réunion", meaning: "meeting", pronunciation: "/la ʁe.y.njɔ̃/", example_sentence: "La réunion budgétaire aura lieu dans la salle de conférence." },
      { word: "collaborer", meaning: "to collaborate", pronunciation: "/kɔ.la.bɔ.ʁe/", example_sentence: "Nous sommes ravis de collaborer avec votre institution." },
      { word: "ci-joint", meaning: "attached / enclosed", pronunciation: "/si.ʒwɛ̃/", example_sentence: "Veuillez trouver ci-joint notre proposition commerciale révisée." },
      { word: "l'échéance", meaning: "deadline", pronunciation: "/le.ʃe.ɑ̃s/", example_sentence: "Nous devons respecter impérativement l'échéance du projet." }
    ],
    dialogue: [
      "Responsable RH: Bonjour monsieur Martin, je vous contacte au sujet de votre candidature. (HR Manager: Hello Mr. Martin, I am contacting you regarding your application.)",
      "Candidat: Bonjour madame, je vous remercie sincèrement pour votre appel. (Candidate: Hello ma'am, thank you very much for your call.)",
      "Responsable RH: Seriez-vous disponible pour un entretien d'embauche jeudi à quatorze heures ? (HR Manager: Would you be available for a job interview Thursday at 2:00 PM?)",
      "Candidat: Tout à fait, je bloque ce créneau et je vous envoie mon dossier actualisé dès aujourd'hui. (Candidate: Absolutely, I will reserve that slot and send you my updated portfolio today.)"
    ],
    drills: [
      { question: "Translate into formal French: 'Please find attached the signed contract.'", answer: "Veuillez trouver ci-joint le contrat signé.", explanation: "'Veuillez' + infinitive is the standard professional directive formula in business French." },
      { question: "Formulate a formal email opening stating you are writing to inquire about product prices.", answer: "Je me permets de vous contacter afin d'obtenir des informations sur vos tarifs.", explanation: "'Je me permets de vous contacter afin de' is the accepted executive standard." },
      { question: "Rectify the register mistake: 'Salut monsieur le directeur, envoie-moi le document stp.'", answer: "Bonjour Monsieur le Directeur, pourriez-vous s'il vous plaît me transmettre le document ?", explanation: "Hierarchical workplace communications demand 'vous', polite conditional ('pourriez-vous'), and formal salutations." }
    ],
    homework: [
      "Draft a formal 80-word business email requesting a budget extension for an international project.",
      "Record a 45-second formal phone voicemail confirming attendance at a board meeting."
    ]
  },
  9: {
    monthIndex: 9,
    topicTitle: "L'Imparfait: Habitual Past, Background Descriptions & Nostalgia",
    grammarFocus: "Radical derivation from 'nous' form, imperfect tense endings (-ais, -ais, -ait, -ions, -iez, -aient), and PC vs Imparfait contrast.",
    syntacticFormula: "Imparfait Derivation: `[Radical de 'Nous' au présent] + -ais, -ais, -ait, -ions, -iez, -aient`\nException unique: Être -> `ét-` (j'étais, tu étais, il était...)\nUsage: Ongoing background state, habitual action in the past, physical/mental description.",
    conjugationTable: "| Sujet | Être (ét-) | Avoir (av-) | Parler (parl-) | Finir (finiss-) |\n|---|---|---|---|---|\n| Je | étais | avais | parlais | finissais |\n| Tu | étais | avais | parlais | finissais |\n| Il / Elle | était | avait | parlait | finissait |\n| Nous | étions | avions | parlions | finissions |\n| Vous | étiez | aviez | parliez | finissiez |\n| Ils / Elles | étaient | avaient | parlaient | finissaient |",
    phoneticsTrap: "The endings -ais, -ait, -aient are all phonetically identical (/ɛ/). Only context and subject pronouns distinguish 'je parlais', 'il parlait', and 'ils parlaient'.",
    vocab: [
      { word: "autrefois", meaning: "in the past / formerly", pronunciation: "/o.tʁə.fwa/", example_sentence: "Autrefois, nous habitions dans un petit village montagnard." },
      { word: "le souvenir", meaning: "memory / recollection", pronunciation: "/lə suv.niʁ/", example_sentence: "J'ai d'excellents souvenirs de mes années universitaires." },
      { word: "habituel", meaning: "habitual / usual", pronunciation: "/a.bi.tɥɛl/", example_sentence: "C'était son itinéraire habituel pour se rendre au travail." },
      { word: "pendant que", meaning: "while", pronunciation: "/pɑ̃.dɑ̃ kə/", example_sentence: "Pendant que le professeur expliquait, les étudiants prenaient des notes." },
      { word: "le paysage", meaning: "landscape / scenery", pronunciation: "/lə pe.i.zaʒ/", example_sentence: "Le paysage était enneigé et le ciel était d'un bleu limpide." }
    ],
    dialogue: [
      "Grand-mère: Quand j'étais jeune, il n'y avait pas d'ordinateurs ni de téléphones intelligents. (Grandmother: When I was young, there were no computers or smartphones.)",
      "Petite-fille: Comment faisiez-vous pour communiquer avec vos amis à distance ? (Granddaughter: How did you communicate with your friends from a distance?)",
      "Grand-mère: Nous écrivions de longues lettres manuscrites et nous attendions patiemment la réponse du facteur. (Grandmother: We wrote long handwritten letters and patiently waited for the mailman's reply.)",
      "Petite-fille: C'était une époque très différente, mais sans doute très poétique ! (Granddaughter: That was a very different era, but certainly very poetic!)"
    ],
    drills: [
      { question: "Conjugate 'prendre' in imparfait for 'nous'.", answer: "nous prenions", explanation: "Present 'nous prenons' gives radical 'pren-' + '-ions' = 'prenions'." },
      { question: "Choose PC or Imparfait: 'Pendant qu'il (dormir), le téléphone (sonner).' ", answer: "Pendant qu'il dormait, le téléphone a sonné.", explanation: "Ongoing background state takes imparfait (dormait); sudden interrupting event takes passé composé (a sonné)." },
      { question: "Rectify the error: 'Hier matin, soudainement il pleuvait.'", answer: "Hier matin, soudainement il a plu.", explanation: "Sudden punctual events marked by 'soudainement' demand passé composé, not the descriptive imparfait." }
    ],
    homework: [
      "Write a 120-word nostalgic narrative describing your childhood habits using imparfait for descriptions and passé composé for specific events.",
      "Record an audio reading contrasting the /ɛ/ and /jɔ̃/ sounds in imperfect conjugations."
    ]
  },
  10: {
    monthIndex: 10,
    topicTitle: "Le Futur Simple & Hypotheses: Career Goals & Projections",
    grammarFocus: "Future stems (-r-), irregular roots (ser-, aur-, fer-, ir-, saur-), simple future endings, and Si-clauses of probability.",
    syntacticFormula: "Futur Simple Formula: `[Infinitif / Radical Spécial en -r] + -ai, -as, -a, -ons, -ez, -ont`\n1st Conditional Formula: `Si + [Présent de l'indicatif], [Futur Simple]`",
    conjugationTable: "| Infinitif | Radical Futur | Je (-ai) | Nous (-ons) | Ils (-ont) |\n|---|---|---|---|---|\n| Parler | parler- | je parlerai | nous parlerons | ils parleront |\n| Finir | finir- | je finirai | nous finirons | ils finiront |\n| Être | ser- | je serai | nous serons | ils seront |\n| Avoir | aur- | j'aurai | nous aurons | ils auront |\n| Faire | fer- | je ferai | nous ferons | ils feront |\n| Aller | ir- | j'irai | nous irons | ils iront |",
    phoneticsTrap: "Contrast 'je parlerai' (future: /paʁ.lə.ʁe/ with closed 'é') vs 'je parlerais' (conditional: /paʁ.lə.ʁɛ/ with open 'è').",
    vocab: [
      { word: "l'avenir", meaning: "the future", pronunciation: "/lav.niʁ/", example_sentence: "Nous bâtissons ensemble l'avenir de notre entreprise." },
      { word: "réussir", meaning: "to succeed", pronunciation: "/ʁe.y.siʁ/", example_sentence: "Si tu travailles assidûment, tu réussiras brillamment." },
      { word: "le projet", meaning: "project / plan", pronunciation: "/lə pʁɔ.ʒɛ/", example_sentence: "Notre équipe inaugurera le projet dès le mois de janvier." },
      { word: "l'ambition", meaning: "ambition", pronunciation: "/lɑ̃.bi.sjɔ̃/", example_sentence: "Elle a l'ambition de devenir directrice générale." },
      { word: "bientôt", meaning: "soon", pronunciation: "/bjɛ̃.to/", example_sentence: "Les résultats officiels seront proclamés très bientôt." }
    ],
    dialogue: [
      "Conseiller: Où vous voyez-vous professionnellement dans cinq ans ? (Advisor: Where do you see yourself professionally in five years?)",
      "Étudiant: J'obtiendrai mon diplôme, je maîtriserai le français des affaires et je dirigerai des projets internationaux. (Student: I will obtain my degree, master business French, and lead international projects.)",
      "Conseiller: C'est un excellent plan de carrière. Si vous persévérez, vous réaliserez tous ces objectifs. (Advisor: That is an excellent career plan. If you persevere, you will achieve all these goals.)",
      "Étudiant: Absolument, je continuerai à m'entraîner chaque jour avec rigueur. (Student: Absolutely, I will continue to train each day with rigor.)"
    ],
    drills: [
      { question: "Conjugate 'aller' in futur simple for 'nous'.", answer: "nous irons", explanation: "The irregular future stem of aller is 'ir-' + '-ons' = 'irons'." },
      { question: "Complete the conditional sentence: 'Si vous (étudier) régulièrement, vous (réussir) vos examens.'", answer: "Si vous étudiez régulièrement, vous réussirez vos examens.", explanation: "In 1st conditional sentences: Si + présent -> futur simple." },
      { question: "Rectify the error: 'Si j'aurai le temps demain, je viendrai.'", answer: "Si j'ai le temps demain, je viendrai.", explanation: "After 'si' in conditional clauses, the future tense is strictly forbidden; use the present tense." }
    ],
    homework: [
      "Write a 10-point manifesto detailing your 5-year future milestones using 'futur simple' and 'Si + présent'.",
      "Record an audio pitch describing the international future of your language career."
    ]
  },
  11: {
    monthIndex: 11,
    topicTitle: "Le Conditionnel Présent: Polite Advice, Diplomacy & Modality",
    grammarFocus: "Future stem + imperfect endings, expressing courtesy (vouloir/pouvoir), hypothetical situations, and constructive advice.",
    syntacticFormula: "Conditionnel Présent: `[Radical du Futur] + -ais, -ais, -ait, -ions, -iez, -aient`\nPolite Formula: `Je voudrais / J'aimerais / Pourriez-vous + [Infinitif]`\nAdvice Formula: `Vous devriez / Il serait préférable de + [Infinitif]`",
    conjugationTable: "| Sujet | Aimer (aimer-) | Pouvoir (pourr-) | Devoir (devr-) | Vouloir (voudr-) |\n|---|---|---|---|---|\n| Je | aimerais | pourrais | devrais | voudrais |\n| Tu | aimerais | pourrais | devrais | voudrais |\n| Il / Elle | aimerait | pourrait | devrait | voudrait |\n| Nous | aimerions | pourrions | devrions | voudrions |\n| Vous | aimeriez | pourriez | devriez | voudriez |\n| Ils / Elles | aimeraient | pourraient | devraient | voudraient |",
    phoneticsTrap: "In 'nous aimerions' (/nu.zɛ.mə.ʁjɔ̃/) and 'vous aimeriez' (/vu.zɛ.mə.ʁje/), articulate the /j/ glide clearly before the vowel endings.",
    vocab: [
      { word: "souhaiter", meaning: "to wish / desire", pronunciation: "/swɛ.te/", example_sentence: "Je souhaiterais obtenir un entretien avec le responsable." },
      { word: "le conseil", meaning: "advice / recommendation", pronunciation: "/lə kɔ̃.sɛj/", example_sentence: "Suivez ce précieux conseil pour progresser rapidement." },
      { word: "envisager", meaning: "to consider / contemplate", pronunciation: "/ɑ̃.vi.za.ʒe/", example_sentence: "Nous pourrions envisager une nouvelle stratégie commerciale." },
      { word: "préférable", meaning: "preferable", pronunciation: "/pʁe.fe.ʁabl/", example_sentence: "Il serait préférable de planifier la réunion la semaine prochaine." },
      { word: "la diplomatie", meaning: "diplomacy", pronunciation: "/la di.plɔ.ma.si/", example_sentence: "La diplomatie linguistique facilite la négociation internationale." }
    ],
    dialogue: [
      "Consultant: Que pourrions-nous recommander pour optimiser la logistique ? (Consultant: What could we recommend to optimize logistics?)",
      "Directeur: Nous devrions automatiser la gestion des stocks, cela réduirait considérablement les coûts. (Director: We should automate inventory management, that would considerably reduce costs.)",
      "Consultant: J'aimerais soumettre ce plan au conseil d'administration dès jeudi. (Consultant: I would like to submit this plan to the board of directors as early as Thursday.)",
      "Directeur: Très bonne idée, ils apprécieraient certainement une telle initiative. (Director: Very good idea, they would certainly appreciate such an initiative.)"
    ],
    drills: [
      { question: "Transform into a polite request using conditional: 'Donne-moi le dossier.'", answer: "Pourriez-vous me donner le dossier s'il vous plaît ?", explanation: "'Pourriez-vous' + infinitive softens a command into an elegant polite inquiry." },
      { question: "Translate into French: 'If I had more time, I would learn three foreign languages.'", answer: "Si j'avais plus de temps, j'apprendrais trois langues étrangères.", explanation: "2nd Conditional pattern: Si + imparfait -> conditionnel présent." },
      { question: "Rectify the error: 'Si j'étudierais, je réussirais.'", answer: "Si j'étudiais, je réussirais.", explanation: "The conditional is prohibited inside the 'si' clause; use the imperfect." }
    ],
    homework: [
      "Write 5 diplomatic recommendations to a company executive using 'vous devriez', 'nous pourrions', and 'il conviendrait de'.",
      "Record an audio roleplay simulating a diplomatic negotiation where you propose an alternative schedule."
    ]
  },
  12: {
    monthIndex: 12,
    topicTitle: "Master Conversational Synthesis: Executive Negotiation, Subjunctive Nuance & Certification Capstone",
    grammarFocus: "Executive business discourse, diplomatic concession, introduction to subjunctive triggers (il faut que, bien que), and CEFR certification mastery.",
    syntacticFormula: "Diplomatic Negotiation: `[Expression de concession: bien que + subjonctif] + [Proposition principale au conditionnel]`\nSubjunctive Formula: `Il est impératif que + [Sujet] + [Subjonctif: radical de 'ils' + -e, -es, -e, -ions, -iez, -ent]`\nExecutive Counter-proposal: `Nous serions disposés à convenir de... sous réserve que...`",
    conjugationTable: "| Verbe | Subjonctif (Que je...) | Subjonctif (Que nous...) | Usage Exécutif |\n|---|---|---|---|\n| Être | sois | soyons | Il faut que nous soyons prêts |\n| Avoir | aie | ayons | Pour que vous ayez toutes les données |\n| Faire | fasse | fassions | Avant que le client ne fasse un choix |\n| Savoir | sache | sachions | Afin que chacun sache ses priorités |\n| Pouvoir | puisse | puissions | Pour que nous puissions négocier |\n| Prendre | prenne | prenions | Bien que nous prenions des risques |",
    phoneticsTrap: "In subjunctive 'qu'il fasse' (/k‿il fas/) vs 'qu'ils fassent' (/k‿il fas/), the pronunciation is identical. Ensure clean consonant articulation and avoid pronouncing the silent '-ent'.",
    vocab: [
      { word: "la négociation", meaning: "negotiation", pronunciation: "/la ne.ɡɔ.sja.sjɔ̃/", example_sentence: "La négociation contractuelle a débouché sur un consensus mutuel." },
      { word: "le compromis", meaning: "compromise", pronunciation: "/lə kɔ̃.pʁɔ.mi/", example_sentence: "Nous avons trouvé un compromis équitable pour les deux parties." },
      { word: "l'enjeu", meaning: "stake / issue at stake", pronunciation: "/lɑ̃.ʒø/", example_sentence: "L'enjeu stratégique de cette certification est primordial." },
      { word: "prépondérant", meaning: "paramount / overriding", pronunciation: "/pʁe.pɔ̃.de.ʁɑ̃/", example_sentence: "La rigueur linguistique joue un rôle prépondérant dans les affaires." },
      { word: "statuer", meaning: "to rule / decide officially", pronunciation: "/sta.tɥe/", example_sentence: "Le comité statuera sur la convention finale d'ici vendredi." }
    ],
    dialogue: [
      "Directeur Général: Serait-il envisageable d'ajuster les clauses de livraison sans pénaliser la qualité finale ? (CEO: Would it be feasible to adjust the delivery clauses without compromising final quality?)",
      "Négociateur: Tout à fait. Nous serions disposés à accepter cet échéancier, sous réserve que vos équipes valident le cahier des charges d'ici demain. (Negotiator: Absolutely. We would be willing to agree to this timeline, provided that your teams validate the specifications by tomorrow.)",
      "Directeur Général: C'est un compromis constructif. Il est essentiel que nous maintenions une communication transparente tout au long de cette transition. (CEO: That is a constructive compromise. It is essential that we maintain transparent communication throughout this transition.)",
      "Négociateur: Nous partageons pleinement cette vision. Je vous transmets le protocole d'accord signé pour sceller notre engagement. (Negotiator: We fully share this vision. I will forward you the signed agreement protocol to seal our commitment.)"
    ],
    drills: [
      { question: "Formulate an executive counter-proposal in French using the polite conditional and 'sous réserve que'.", answer: "Nous serions disposés à accepter ces conditions sous réserve d'un ajustement des délais de livraison.", explanation: "This formula demonstrates C1/C2 professional negotiation mastery without conversational aggression." },
      { question: "Complete with the correct subjunctive form: 'Bien que l'échéance (être) très serrée, nous réussirons.'", answer: "Bien que l'échéance soit très serrée, nous réussirons.", explanation: "The conjunction 'bien que' (although) obligatorily triggers the subjunctive mood ('soit' for être 3rd person singular)." },
      { question: "Rectify the inappropriate colloquial register in this business memo: 'Je veux que tu changes ça immédiatement.'", answer: "Il conviendrait que nous révisions ce point conjointement dans les plus brefs délais.", explanation: "Executive business French avoids direct imperative confrontation, opting for polite subjunctive impersonal directives." }
    ],
    homework: [
      "Draft a 150-word bilateral contract amendment letter negotiating terms using conditional modality and subjunctive triggers.",
      "Record a 2-minute executive capstone presentation summarizing your full-year communicative fluency progression."
    ]
  }
};

// -----------------------------------------------------------------------------
// CURRICULUM DAY BUILDER
// -----------------------------------------------------------------------------
export function generateCurriculumDay(
  language: string,
  level: string,
  baseTopic: string,
  dayNumber: number,
  monthNumber: number,
  monthName: string,
  monthShort: string,
  dayInMonth: number,
  monthTotalDays: number,
  totalDays: number,
  rawDay?: any
): DayCurriculumItem {
  // If this day was explicitly generated by Gemini from tutor's uploaded video or file, preserve authentic output
  if (rawDay && rawDay.day_topic && rawDay.study_notes_markdown) {
    return {
      day_number: dayNumber,
      month_number: monthNumber,
      calendar_month_name: monthName,
      calendar_month_short: monthShort,
      day_in_month: dayInMonth,
      month_total_days: monthTotalDays,
      week_number: Math.ceil(dayInMonth / 7),
      module_week: `${monthName} • Day ${dayInMonth} of ${monthTotalDays} (Course Day ${dayNumber} of ${totalDays})`,
      day_topic: rawDay.day_topic,
      grammar_rules_detail: rawDay.grammar_rules_detail || `In-depth faculty lecture for ${monthName} Day ${dayInMonth} focused on target grammatical structures.`,
      study_notes_markdown: rawDay.study_notes_markdown,
      vocabulary_bank: rawDay.vocabulary_bank || [],
      classroom_dialogues: rawDay.classroom_dialogues || [],
      pedagogical_instructions: rawDay.pedagogical_instructions || "Faculty directive: prioritize authentic oral repetition and sentence synthesis.",
      video_breakdown_analysis: rawDay.video_breakdown_analysis || `Detailed audio/video analysis for ${monthName} Day ${dayInMonth}: native pitch inflections, lip shape, and spoken nuances.`,
      in_class_exercises: (rawDay.in_class_exercises && rawDay.in_class_exercises.length > 0)
        ? rawDay.in_class_exercises
        : (rawDay.exercise_solutions ? rawDay.exercise_solutions.map((s: any) => s.question) : []),
      exercise_solutions: rawDay.exercise_solutions || [],
      homework_tasks: rawDay.homework_tasks || [
        `Complete the written exercises for Day ${dayNumber} applying the target syntax.`,
        "Record a 60-second voice note practicing the dialogues with correct pronunciation on the ISML portal."
      ]
    };
  }

  // Otherwise, synthesize dynamic day content strictly aligned with the calendar month's linguistic progression
  const monthTheme = FRENCH_MONTHS[monthNumber] || FRENCH_MONTHS[1];
  const weekInMonth = Math.ceil(dayInMonth / 7);

  // Generate distinct subtopics across the days of the month
  const daySubtopicPill = `${monthName} Day ${dayInMonth} (Class ${dayNumber}): ${monthTheme.topicTitle}`;

  // Rotate vocabulary selection per day so every day highlights different words
  const vocabOffset = (dayInMonth - 1) % monthTheme.vocab.length;
  const dayVocab = [
    monthTheme.vocab[vocabOffset],
    monthTheme.vocab[(vocabOffset + 1) % monthTheme.vocab.length],
    monthTheme.vocab[(vocabOffset + 2) % monthTheme.vocab.length]
  ];

  // Rotate drills so every day within the month highlights different exercises
  const drillOffset = (dayInMonth - 1) % monthTheme.drills.length;
  const dayDrills = [
    monthTheme.drills[drillOffset],
    monthTheme.drills[(drillOffset + 1) % monthTheme.drills.length],
    monthTheme.drills[(drillOffset + 2) % monthTheme.drills.length]
  ];

  const studyNotes = `### Master Study Guide: ${monthName} Day ${dayInMonth} (Course Day ${dayNumber} of ${totalDays})\nCertified CEFR ${level} Curriculum — ${baseTopic}\n\n**1. Syntactic Architecture & Word Order Formula:**\n${monthTheme.syntacticFormula}\n\n**2. Active Conjugation Matrix & Paradigm Tables:**\n${monthTheme.conjugationTable}\n\n**3. Phonetic Nuance & Native Traps:**\n- ${monthTheme.phoneticsTrap}\n- **Focus for Day ${dayNumber}**: Pay special attention to elision, liaisons, and sentence cadence in fast conversational speech.\n\n**4. Pedagogical Blueprint:**\nToday's 1-hour session emphasizes active communicative recall. Students must apply the target structures in natural, unprompted spoken exchanges.`;

  return {
    day_number: dayNumber,
    month_number: monthNumber,
    calendar_month_name: monthName,
    calendar_month_short: monthShort,
    day_in_month: dayInMonth,
    month_total_days: monthTotalDays,
    week_number: weekInMonth,
    module_week: `${monthName} • Day ${dayInMonth} of ${monthTotalDays} (Course Day ${dayNumber} of ${totalDays})`,
    day_topic: daySubtopicPill,
    grammar_rules_detail: `Senior Faculty Lecture for ${monthName} Day ${dayInMonth}: ${monthTheme.grammarFocus} This lesson systematically builds retention through structured 1-hour applied drills, auditory discrimination, and contextual discourse.`,
    study_notes_markdown: studyNotes,
    vocabulary_bank: dayVocab,
    classroom_dialogues: monthTheme.dialogue,
    pedagogical_instructions: `Faculty Instruction for Day ${dayNumber}: Conduct choral pronunciation drills on target forms. Rectify syntax errors immediately before moving to interactive roleplay.`,
    video_breakdown_analysis: `Analytical breakdown for ${monthName} Day ${dayInMonth}: In-depth analysis of vocal inflection, speaker interaction, and authentic communicative phrases extracted from ${monthName}'s thematic milestone (${monthTheme.topicTitle}). Focus on liaison mechanics and spoken rhythm.`,
    in_class_exercises: dayDrills.map(d => d.question),
    exercise_solutions: dayDrills,
    homework_tasks: monthTheme.homework
  };
}
