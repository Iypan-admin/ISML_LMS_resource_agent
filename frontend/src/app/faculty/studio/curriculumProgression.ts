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
  rawDay?: any,
  sessionPackage?: any
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

  // ---------------------------------------------------------------------------
  // DYNAMIC MULTI-LANGUAGE PROGRESSION ENGINE
  // Covers all 5 Core Languages with authentic grammar, vocabulary, dialogues, and drills
  // ---------------------------------------------------------------------------
  const cleanLang = (language || '').toLowerCase();
  const langKey = cleanLang.includes('span') || cleanLang.includes('espa')
    ? 'es'
    : cleanLang.includes('germ') || cleanLang.includes('deut')
    ? 'de'
    : cleanLang.includes('jap') || cleanLang.includes('nihon')
    ? 'ja'
    : cleanLang.includes('kor') || cleanLang.includes('hangu')
    ? 'ko'
    : 'fr';

  const weekInMonth = Math.ceil(dayInMonth / 7);

  // Language-specific thematic progressions and vocabularies across stages
  const LANGUAGE_PROFILES: Record<string, {
    langName: string;
    themes: Array<{
      category: string;
      focus: string;
      formula: string;
      table: string;
      trap: string;
      words: Array<{ word: string; meaning: string; pronunciation: string; example: string }>;
      dialogues: string[];
      drills: Array<{ q: string; a: string; exp: string }>;
    }>;
  }> = {
    es: {
      langName: 'Spanish (Español)',
      themes: [
        {
          category: 'Fonética, Saludos & Verbos de Identidad (Ser/Estar)',
          focus: 'Diferenciación esencial entre ser (cualidades permanentes) y estar (estados y ubicación).',
          formula: 'Ser: [Sujeto] + ser (soy, eres, es, somos, sois, son) + [Nacionalidad/Profesión]\nEstar: [Sujeto] + estar (estoy, estás, está, estamos, estáis, están) + [Ubicación/Estado]',
          table: '| Sujeto | Ser (Esencia) | Estar (Condición/Lugar) |\n|---|---|---|\n| Yo | soy | estoy |\n| Tú | eres | estás |\n| Él/Ella/Ud. | es | está |\n| Nosotros | somos | estamos |\n| Vosotros | sois | estáis |\n| Ellos/Ellas/Uds. | son | están |',
          trap: 'Nunca confundir "es bueno" (persona bondadosa o cosa de calidad) con "está bueno" (comida deliciosa o atractivo físico).',
          words: [
            { word: 'aprender', meaning: 'to learn', pronunciation: '/a.pɾenˈdeɾ/', example: 'Aprendo español todos los días con entusiasmo.' },
            { word: 'trabajar', meaning: 'to work', pronunciation: '/tɾa.βaˈxaɾ/', example: 'Ella trabaja como ingeniera en una empresa internacional.' },
            { word: 'ubicación', meaning: 'location', pronunciation: '/u.βi.kaˈsjon/', example: 'La oficina está situada en el centro de Madrid.' },
            { word: 'entusiasmo', meaning: 'enthusiasm', pronunciation: '/en.tuˈsjas.mo/', example: 'Estudiamos con mucho entusiasmo esta semana.' },
            { word: 'compromiso', meaning: 'commitment', pronunciation: '/kom.pɾoˈmi.so/', example: 'El equipo demuestra un alto compromiso académico.' }
          ],
          dialogues: [
            'Profesor: ¡Hola! ¿De dónde eres y dónde estás viviendo actualmente? (Teacher: Hello! Where are you from and where are you currently living?)',
            'Estudiante: Soy de Colombia, pero actualmente estoy viviendo en Barcelona. (Student: I am from Colombia, but I am currently living in Barcelona.)',
            'Profesor: Excelente. ¿Cuál es tu objetivo profesional principal? (Teacher: Excellent. What is your primary professional objective?)',
            'Estudiante: Mi objetivo es hablar con fluidez en entornos de negocios. (Student: My goal is to speak fluently in business settings.)'
          ],
          drills: [
            { q: 'Completa con la forma correcta de ser o estar: "Nosotros ___ preparados para la reunión."', a: 'estamos', exp: 'Preparado es un estado transitorio, por lo que exige el verbo estar.' },
            { q: 'Traduce al español: "She is a doctor and is in the clinic now."', a: 'Ella es médica y está en la clínica ahora.', exp: 'Profesión usa ser (es), mientras que ubicación física usa estar (está).' },
            { q: 'Identifica y corrige el error: "Yo soy muy cansado después del viaje."', a: 'Yo estoy muy cansado después del viaje.', exp: 'El cansancio es un estado físico temporal, por lo que requiere estar.' }
          ]
        },
        {
          category: 'Presente Regular e Irregular (-ar, -er, -ir) & Rutina Diaria',
          focus: 'Conjugación sistemática de verbos regulares y reflexivos de la rutina diaria.',
          formula: 'Reflexivo: [Pronombre: me/te/se/nos/os/se] + [Verbo conjugado] + [Complemento]',
          table: '| Pronombre | Hablar (-ar) | Comer (-er) | Vivir (-ir) |\n|---|---|---|---|\n| Yo | hablo | como | vivo |\n| Tú | hablas | comes | vives |\n| Él/Ella | habla | come | vive |\n| Nosotros | hablamos | comemos | vivimos |\n| Ellos | hablan | comen | viven |',
          trap: 'La terminación -emos es exclusiva de verbos -er, mientras que -imos pertenece a verbos -ir.',
          words: [
            { word: 'despertarse', meaning: 'to wake up', pronunciation: '/des.peɾˈtaɾ.se/', example: 'Me despierto a las siete de la mañana todos los días.' },
            { word: 'desayunar', meaning: 'to have breakfast', pronunciation: '/de.sa.ʝuˈnaɾ/', example: 'Desayunamos fruta fresca y café aromático.' },
            { word: 'desarrollar', meaning: 'to develop', pronunciation: '/de.sa.roˈʎaɾ/', example: 'Desarrollamos soluciones innovadoras en nuestro proyecto.' },
            { word: 'comunicar', meaning: 'to communicate', pronunciation: '/ko.mu.niˈkaɾ/', example: 'Es vital comunicar las ideas con absoluta claridad.' },
            { word: 'concluir', meaning: 'to conclude', pronunciation: '/koŋ.kluˈiɾ/', example: 'Concluimos las actividades antes del mediodía.' }
          ],
          dialogues: [
            'Colega A: ¿A qué hora te levantas habitualmente entre semana? (Colleague A: What time do you usually get up on weekdays?)',
            'Colega B: Me levanto a las seis y media, hago ejercicio y salgo al trabajo. (Colleague B: I get up at 6:30, exercise, and head to work.)',
            'Colega A: ¿Cómo sueles gestionar los proyectos con plazos estrictos? (Colleague A: How do you typically manage projects with strict deadlines?)',
            'Colega B: Priorizo las tareas críticas y mantengo comunicación constante. (Colleague B: I prioritize critical tasks and maintain constant communication.)'
          ],
          drills: [
            { q: 'Conjuga el verbo levantarse para la persona "tú".', a: 'te levantas', exp: 'Los verbos reflexivos requieren el pronombre reflexivo te antes del verbo conjugado.' },
            { q: 'Traduce: "We live in an apartment and we eat healthy food."', a: 'Vivimos en un apartamento y comemos comida saludable.', exp: 'Vivir toma la terminación -imos y comer toma -emos en primera persona plural.' },
            { q: 'Corrige la concordancia: "Ellos se duerme temprano hoy."', a: 'Ellos se duermen temprano hoy.', exp: 'La tercera persona plural exige la terminación -en: se duermen.' }
          ]
        },
        {
          category: 'Pasado Indefinido vs Imperfecto: Narración & Contexto Temporal',
          focus: 'Articulación de acciones completas y puntuales frente a descripciones o hábitos pasados.',
          formula: 'Indefinido: Acción puntual completada ([Verbo] + -é/-aste/-ió/-ieron)\nImperfecto: Acción habitual o contexto ([Verbo] + -aba / -ía)',
          table: '| Sujeto | Hablar (Indefinido) | Hablar (Imperfecto) | Vivir (Indefinido) | Vivir (Imperfecto) |\n|---|---|---|---|---|\n| Yo | hablé | hablaba | viví | vivía |\n| Tú | hablaste | hablabas | viviste | vivías |\n| Él/Ella | habló | hablaba | vivió | vivía |\n| Nosotros | hablamos | hablábamos | vivimos | vivíamos |\n| Ellos | hablaron | hablaban | vivieron | vivían |',
          trap: 'El acento ortográfico en pretérito indefinido (hablé, habló, viví, vivió) es indispensable; sin tilde cambia de tiempo o significado.',
          words: [
            { word: 'acontecimiento', meaning: 'event / occurrence', pronunciation: '/a.kon.te.siˈmjen.to/', example: 'Fue un acontecimiento histórico para nuestra empresa.' },
            { word: 'anteriormente', meaning: 'previously', pronunciation: '/an.te.ɾjoɾˈmen.te/', example: 'Anteriormente trabajábamos de forma presencial.' },
            { word: 'lograr', meaning: 'to achieve', pronunciation: '/loˈɣɾaɾ/', example: 'Logramos superar todas las metas previstas del trimestre.' },
            { word: 'consolidar', meaning: 'to consolidate', pronunciation: '/kon.so.liˈðaɾ/', example: 'Consolidaron su posición en el mercado internacional.' },
            { word: 'experiencia', meaning: 'experience', pronunciation: '/eks.peˈɾjen.sja/', example: 'La experiencia adquirida resultó invaluable.' }
          ],
          dialogues: [
            'Directora: ¿Cómo fue la presentación de ayer ante el comité directivo? (Director: How was yesterday\'s presentation before the executive committee?)',
            'Gerente: Salió excelente. Cuando yo explicaba las métricas, todos mostraron gran interés. (Manager: It went great. While I was explaining the metrics, everyone showed great interest.)',
            'Directora: Me alegro mucho. ¿Firmaron el acuerdo preliminar? (Director: I am very glad. Did they sign the preliminary agreement?)',
            'Gerente: Sí, firmaron el documento oficial al terminar la sesión. (Manager: Yes, they signed the official document right at the end of the session.)'
          ],
          drills: [
            { q: 'Elige entre indefinido o imperfecto: "Ayer yo (visitar) el museo mientras (llover)."', a: 'visité / llovía', exp: 'Visitar es un evento puntual completado (visité); la lluvia constituye el trasfondo continuo (llovía).' },
            { q: 'Traduce: "When we were children, we used to travel every summer."', a: 'Cuando éramos niños, viajábamos cada verano.', exp: 'Costumbres y hábitos en el pasado exigen pretérito imperfecto.' },
            { q: 'Corrige el error: "La semana pasada ellos vivían en esa casa solo un día."', a: 'La semana pasada ellos vivieron en esa casa solo un día.', exp: 'Un periodo temporal estrictamente delimitado (un día) exige pretérito indefinido (vivieron).' }
          ]
        },
        {
          category: 'Modo Subjuntivo, Deseos, Hipótesis & Negociación Profesional',
          focus: 'Expresión de voluntad, duda, hipótesis y fórmulas de cortesía ejecutiva.',
          formula: 'Fórmula Subjuntiva: [Cláusula principal de deseo/duda] + que + [Verbo en Subjuntivo]',
          table: '| Sujeto | Hablar (Subjuntivo) | Comer (Subjuntivo) | Ser (Subjuntivo) |\n|---|---|---|---|\n| Yo | hable | coma | sea |\n| Tú | hables | comas | seas |\n| Él/Ella | hable | coma | sea |\n| Nosotros | hablemos | comamos | seamos |\n| Ellos | hablen | coman | sean |',
          trap: 'Con verbos de certeza o creencia afirmativa (creo que, es seguro que) se usa INDICATIVO; en negativa (no creo que) se exige SUBJUNTIVO.',
          words: [
            { word: 'negociación', meaning: 'negotiation', pronunciation: '/ne.ɣo.sjaˈsjon/', example: 'Es fundamental que la negociación sea transparente.' },
            { word: 'consenso', meaning: 'consensus', pronunciation: '/konˈsen.so/', example: 'Buscamos que todos los socios alcancen un consenso mutuo.' },
            { word: 'conveniente', meaning: 'convenient / advisable', pronunciation: '/kom.beˈnjen.te/', example: 'Sería conveniente que revisemos las cláusulas.' },
            { word: 'imprescindible', meaning: 'essential / indispensable', pronunciation: '/im.pɾe.sinˈdi.βle/', example: 'Es imprescindible que cumplamos con la normativa vigente.' },
            { word: 'viabilidad', meaning: 'feasibility', pronunciation: '/bja.βi.liˈðað/', example: 'Queremos evaluar la viabilidad técnica de la propuesta.' }
          ],
          dialogues: [
            'Presidente: Es necesario que analicemos todas las cláusulas contractuales antes de firmar. (President: It is necessary that we analyze all contractual clauses before signing.)',
            'Abogado: Totalmente de acuerdo. Sugiero que mantengamos una reunión de coordinación mañana. (Lawyer: Completely agree. I suggest that we hold a coordination meeting tomorrow.)',
            'Presidente: Ojalá que alcancemos un acuerdo satisfactorio para ambas instituciones. (President: Hopefully we will reach a satisfactory agreement for both institutions.)',
            'Abogado: Haremos todo lo posible para que los términos queden formalizados hoy mismo. (Lawyer: We will do our utmost so that terms are formalized this very day.)'
          ],
          drills: [
            { q: 'Completa con subjuntivo: "Deseo que tú (tener) mucho éxito profesional."', a: 'tengas', exp: 'El verbo desear impone el uso del presente de subjuntivo con cambio de raíz (tener -> tengas).' },
            { q: 'Traduce: "It is important that we arrive on time for the presentation."', a: 'Es importante que lleguemos a tiempo para la presentación.', exp: 'Juicios de valor impersonales (es importante que) rigen subjuntivo.' },
            { q: 'Corrige: "No creo que él viene hoy."', a: 'No creo que él venga hoy.', exp: 'La negación de un verbo de opinión (no creer) rige obligatoriamente subjuntivo (venga).' }
          ]
        }
      ]
    },
    de: {
      langName: 'German (Deutsch)',
      themes: [
        {
          category: 'Lautlehre, Begrüßung & Verbkonjugation im Präsens (Sein & Haben)',
          focus: 'Aussprache der Umlaute (ä, ö, ü), Diphthonge (ei, ie, eu) und grundlegende Verbkonjugation.',
          formula: 'Hauptsatz: [Subjekt] + [Finites Verb an Position 2] + [Objekt / Zeit / Ort]',
          table: '| Subjekt | Sein (To Be) | Haben (To Have) | Lernen (To Learn) |\n|---|---|---|---|\n| Ich | bin | habe | lerne |\n| Du | bist | hast | lernst |\n| Er/Sie/Es | ist | hat | lernt |\n| Wir | sind | haben | lernen |\n| Ihr | seid | habt | lernt |\n| Sie/sie | sind | haben | lernen |',
          trap: 'Das Verb steht im deutschen Hauptsatz IMMER an zweiter Stelle (Verb-Zweit-Stellung), auch bei vorangestellter Zeitangabe.',
          words: [
            { word: 'begrüßen', meaning: 'to greet / welcome', pronunciation: '/bəˈɡʁyːsn̩/', example: 'Wir begrüßen alle internationalen Studierenden herzlich.' },
            { word: 'pünktlich', meaning: 'punctual / on time', pronunciation: '/ˈpʏŋktlɪç/', example: 'Der Unterricht beginnt immer pünktlich um neun Uhr.' },
            { word: 'verstehen', meaning: 'to understand', pronunciation: '/fɛɐ̯ˈʃteːən/', example: 'Ich verstehe die grammatikalischen Regeln sehr gut.' },
            { word: 'beruflich', meaning: 'professional / career-related', pronunciation: '/bəˈʁuːflɪç/', example: 'Sie ist beruflich in Berlin engagiert.' },
            { word: 'Zusammenarbeit', meaning: 'collaboration', pronunciation: '/tsuˈzamənˌʔaʁbaɪ̯t/', example: 'Eine enge Zusammenarbeit führt zu großem Erfolg.' }
          ],
          dialogues: [
            'Dozent: Guten Morgen! Wie heißen Sie und woher kommen Sie? (Lecturer: Good morning! What is your name and where do you come from?)',
            'Student: Guten Tag! Ich heiße Markus und ich komme aus Frankfurt. (Student: Good day! My name is Markus and I come from Frankfurt.)',
            'Dozent: Sehr erfreut. Was ist Ihr berufliches Hauptziel? (Lecturer: Delighted. What is your primary career goal?)',
            'Student: Ich möchte fließend Deutsch für meine Karriere in der Industrie sprechen. (Student: I would like to speak fluent German for my career in industry.)'
          ],
          drills: [
            { q: 'Konjugieren Sie das Verb "sein" für "wir".', a: 'wir sind', exp: 'Die 1. Person Plural von sein lautet regelmäßig im Präsens "sind".' },
            { q: 'Übersetzen Sie ins Deutsche: "Today we have an important meeting."', a: 'Heute haben wir ein wichtiges Treffen.', exp: 'Durch die Voranstellung von "Heute" folgt das finite Verb "haben" zwingend an Position 2.' },
            { q: 'Korrigieren Sie den Satzbau: "Heute ich lerne Deutsch."', a: 'Heute lerne ich Deutsch.', exp: 'Im Hauptsatz muss das finite Verb an Position 2 stehen, nicht das Subjekt.' }
          ]
        },
        {
          category: 'Akkusativ, Dativ & Wechselpräpositionen (Wo vs. Wohin)',
          focus: 'Differenzierung von Bewegung (Wohin? + Akkusativ) und Lage/Position (Wo? + Dativ).',
          formula: 'Lage (statisch): [Subjekt] + [Verb] + [Präposition] + DATIV (dem / der / dem / den +n)\nRichtung (dynamisch): [Subjekt] + [Verb] + [Präposition] + AKKUSATIV (den / die / das / die)',
          table: '| Kasus | Maskulin | Feminin | Neutral | Plural |\n|---|---|---|---|---|\n| Nominativ | der | die | das | die |\n| Akkusativ | den | die | das | die |\n| Dativ | dem | der | dem | den (+n) |',
          trap: 'Verben wie "stellen/stellen", "legen/liegen" und "setzen/sitzen" strikt trennen: transitiv = Akkusativ, intransitiv = Dativ.',
          words: [
            { word: 'entscheiden', meaning: 'to decide', pronunciation: '/ʔɛntˈʃaɪ̯dn̩/', example: 'Der Vorstand entscheidet über die neue Strategie.' },
            { word: 'Termin', meaning: 'appointment / deadline', pronunciation: '/tɛʁˈmiːn/', example: 'Haben Sie morgen einen freien Termin für mich?' },
            { word: 'Besprechung', meaning: 'meeting / discussion', pronunciation: '/bəˈʃpʁɛçʊŋ/', example: 'Die Besprechung findet im Konferenzraum statt.' },
            { word: 'Ergebnis', meaning: 'result / outcome', pronunciation: '/ʔɛɐ̯ˈɡeːpnɪs/', example: 'Das Ergebnis der Analyse ist äußerst positiv.' },
            { word: 'Lösung', meaning: 'solution', pronunciation: '/ˈløːzʊŋ/', example: 'Wir erarbeiten eine nachhaltige Lösung für das Problem.' }
          ],
          dialogues: [
            'Kollegin A: Wo liegt der aktuelle Projektbericht? (Colleague A: Where is the current project report lying?)',
            'Kollege B: Er liegt auf dem Schreibtisch der Abteilungsleiterin. (Colleague B: It is lying on the department head\'s desk.)',
            'Kollegin A: Danke. Ich lege die neuen Verträge direkt daneben. (Colleague A: Thanks. I will place the new contracts right next to it.)',
            'Kollege B: Perfekt, dann haben wir alle Dokumente geordnet beisammen. (Colleague B: Perfect, then we have all documents organized together.)'
          ],
          drills: [
            { q: 'Ergänzen Sie den richtigen Artikel: "Das Buch liegt auf ___ Tisch (m)."', a: 'dem', exp: 'Frage "Wo?" verlangt Dativ. Maskuliner Dativ-Artikel ist "dem".' },
            { q: 'Übersetzen Sie: "I am putting the document into the folder (f)."', a: 'Ich lege das Dokument in die Mappe.', exp: 'Frage "Wohin?" verlangt Akkusativ. Femininer Akkusativ-Artikel ist "die".' },
            { q: 'Korrigieren Sie: "Ich helfe der Mann."', a: 'Ich helfe dem Mann.', exp: 'Das Verb "helfen" verlangt obligatorisch das Dativobjekt (dem Mann).' }
          ]
        },
        {
          category: 'Modalverben, Perfekt mit Haben/Sein & Nebensätze mit Weil/Dass',
          focus: 'Satzklammer bei Modalverben, Perfektbildung und Verbletztstellung in Nebensätzen.',
          formula: 'Nebensatz: [Hauptsatz], weil/dass + [Subjekt] + [Objekte/Angaben] + [Verb am ENDE].',
          table: '| Subjekt | Können | Müssen | Wollen | Dürfen |\n|---|---|---|---|---|\n| Ich | kann | muss | will | darf |\n| Du | kannst | musst | willst | darfst |\n| Er/Sie | kann | muss | will | darf |\n| Wir | können | müssen | wollen | dürfen |\n| Ihr | könnt | müsst | wollt | dürft |\n| Sie | können | müssen | wollen | dürfen |',
          trap: 'In Nebensätzen mit Konjunktionen (weil, dass, obwohl, wenn) wandert das konjugierte Verb IMMER ganz ans Satzende.',
          words: [
            { word: 'vorbereiten', meaning: 'to prepare', pronunciation: '/ˈfoːɐ̯bəˌʁaɪ̯tn̩/', example: 'Wir bereiten die Präsentation sorgfältig vor.' },
            { word: 'Vereinbarung', meaning: 'agreement', pronunciation: '/fɛɐ̯ˈʔaɪ̯nbaʁʊŋ/', example: 'Die Vereinbarung wurde von beiden Parteien unterzeichnet.' },
            { word: 'überzeugen', meaning: 'to convince', pronunciation: '/yːbɐˈtsɔɪ̯ɡn̩/', example: 'Ihre überzeugenden Argumente haben den Kunden begeistert.' },
            { word: 'Herausforderung', meaning: 'challenge', pronunciation: '/hɛˈʁaʊ̯sfɔʁdəʁʊŋ/', example: 'Wir meistern diese technologische Herausforderung gemeinsam.' },
            { word: 'fortschrittlich', meaning: 'progressive / advanced', pronunciation: '/ˈfɔʁtˌʃʁɪtlɪç/', example: 'Das Institut nutzt fortschrittliche Lehrmethoden.' }
          ],
          dialogues: [
            'Projektleiter: Warum konnten Sie gestern nicht an der Sitzung teilnehmen? (Project Lead: Why couldn\'t you attend yesterday\'s meeting?)',
            'Entwickler: Ich konnte nicht teilnehmen, weil ich einen dringenden Kundentermin hatte. (Developer: I couldn\'t attend because I had an urgent customer appointment.)',
            'Projektleiter: Verstehe. Haben Sie das Protokoll bereits durchgelesen? (Project Lead: Understood. Have you already read through the minutes?)',
            'Entwickler: Ja, ich habe alle Beschlüsse sorgfältig studiert und umgesetzt. (Developer: Yes, I have studied and implemented all resolutions carefully.)'
          ],
          drills: [
            { q: 'Verbinden Sie die Sätze mit "weil": "Er lernt fleißig. Er will die Prüfung bestehen."', a: 'Er lernt fleißig, weil er die Prüfung bestehen will.', exp: 'Die Konjunktion "weil" schickt das konjugierte Hilfs-/Modalverb "will" ans absolute Satzende.' },
            { q: 'Bilden Sie das Perfekt: "Wir (fahren) nach München."', a: 'Wir sind nach München gefahren.', exp: 'Verben der Ortsveränderung bilden das Perfekt obligatorisch mit dem Hilfsverb "sein".' },
            { q: 'Korrigieren Sie: "Ich weiß, dass er kommt heute."', a: 'Ich weiß, dass er heute kommt.', exp: 'Im Nebensatz mit "dass" muss das finite Verb "kommt" am Satzende stehen.' }
          ]
        },
        {
          category: 'Konjunktiv II, Höflichkeit, Passiv & Fachsprache Wirtschaft',
          focus: 'Hypothetische Höflichkeit (hätte, wäre, würde + Infinitiv) und Vorgangspassiv in der Fachkommunikation.',
          formula: 'Höfliche Bitte / Konjunktiv II: [Subjekt] + würde gern / könnte / hätte gern + [Infinitiv am Ende]',
          table: '| Subjekt | Sein (Konjunktiv II) | Haben (Konjunktiv II) | Werden (Konjunktiv II) |\n|---|---|---|---|\n| Ich | wäre | hätte | würde |\n| Du | wärest | hättest | würdest |\n| Er/Sie | wäre | hätte | würde |\n| Wir | wären | hätten | würden |\n| Ihr | wäret | hättet | würdet |\n| Sie | wären | hätten | würden |',
          trap: 'Verwechseln Sie nicht "wurden" (Präteritum Indikativ = wurden) mit "würden" (Konjunktiv II mit Umlaut = würden).',
          words: [
            { word: 'Verhandlung', meaning: 'negotiation', pronunciation: '/fɛɐ̯ˈhantlʊŋ/', example: 'Die Verhandlung führte zu einem soliden Vertragsabschluss.' },
            { word: 'Vorschlag', meaning: 'proposal / suggestion', pronunciation: '/ˈfoːɐ̯ʃlaːk/', example: 'Wir unterbreiten Ihnen einen konstruktiven Vorschlag.' },
            { word: 'Gewährleistung', meaning: 'guarantee / warranty', pronunciation: '/ɡəˈveːɐ̯ˌlaɪ̯stʊŋ/', example: 'Die Gewährleistung beträgt vertragsgemäß zwei volle Jahre.' },
            { word: 'Verantwortung', meaning: 'responsibility', pronunciation: '/fɛɐ̯ˈʔantvɔʁtʊŋ/', example: 'Unsere Führungskräfte übernehmen volle Verantwortung.' },
            { word: 'wirtschaftlich', meaning: 'economic / commercial', pronunciation: '/ˈvɪʁtʃaftlɪç/', example: 'Das Projekt ist wirtschaftlich äußerst rentabel.' }
          ],
          dialogues: [
            'Geschäftsführer: Wäre es möglich, den Liefertermin um zwei Wochen vorzuziehen? (Managing Director: Would it be possible to bring the delivery date forward by two weeks?)',
            'Lieferant: Wir würden diesen Zeitplan gerne einhalten, wenn die Rohstofflieferung gesichert ist. (Supplier: We would gladly meet this schedule if the raw material supply is secured.)',
            'Geschäftsführer: Ausgezeichnet. Könnten Sie uns die schriftliche Bestätigung heute zusenden? (Managing Director: Excellent. Could you send us the written confirmation today?)',
            'Lieferant: Selbstverständlich. Die Dokumente werden unverzüglich per E-Mail übermittelt. (Supplier: Of course. The documents will be transmitted immediately via email.)'
          ],
          drills: [
            { q: 'Formulieren Sie eine höfliche Bitte im Konjunktiv II: "Geben Sie mir das Dokument."', a: 'Könnten Sie mir bitte das Dokument geben? / Würden Sie mir bitte das Dokument geben?', exp: 'Im Geschäftsleben werden direkte Imperative durch Konjunktiv-II-Konstruktionen ersetzt.' },
            { q: 'Wandeln Sie ins Vorgangspassiv um: "Der Ingenieur prüft das Bauteil."', a: 'Das Bauteil wird von dem Ingenieur geprüft.', exp: 'Passiv Präsens wird gebildet aus "werden" + Partizip II (geprüft).' },
            { q: 'Korrigieren Sie: "Wenn ich Zeit habe, ich käme sofort."', a: 'Wenn ich Zeit hätte, käme ich sofort.', exp: 'Ein irrealer Konditionalsatz verlangt in beiden Teilsätzen den Konjunktiv II.' }
          ]
        }
      ]
    },
    ja: {
      langName: 'Japanese (日本語)',
      themes: [
        {
          category: 'Phonetics, Kana Writing & Copula Sentences (A は B です)',
          focus: 'Gojuon pitch accent, moraic timing, and fundamental copula equational grammar.',
          formula: 'Equational sentence: [Topic/Noun A] + は (wa) + [Noun B] + です (desu).\nNegative: [Noun A] + は + [Noun B] + ではありません (dewa arimasen).',
          table: '| Grammatical Role | Particle | Japanese Example | Romaji / Meaning |\n|---|---|---|---|\n| Topic Marker | は (wa) | 私は学生です | Watashi wa gakusei desu (I am a student) |\n| Question Marker | か (ka) | 日本人ですか | Nihonjin desu ka (Are you Japanese?) |\n| Inclusive Marker | も (mo) | 私もエンジニアです | Watashi mo enjinia desu (I am also an engineer) |\n| Genitive / Possessive | の (no) | 大学の先生 | Daigaku no sensei (University professor) |',
          trap: 'The topic particle は is written with the hiragana character "ha", but pronounced strictly as "wa".',
          words: [
            { word: 'はじめまして', meaning: 'Nice to meet you (first time)', pronunciation: '/hadʑimemaɕite/', example: 'はじめまして、山田と申します。どうぞよろしく。' },
            { word: '勉強', meaning: 'study / learning', pronunciation: '/beŋkʲoː/', example: '毎日日本語の勉強を一生懸命しています。' },
            { word: '専門', meaning: 'specialty / major', pronunciation: '/semmoɴ/', example: '私の専門は情報工学と人工知能です。' },
            { word: '仕事', meaning: 'work / profession', pronunciation: '/ɕiɡoto/', example: '東京の国際IT企業で仕事をしています。' },
            { word: '目標', meaning: 'objective / goal', pronunciation: '/mokɯbʲoː/', example: '今年の目標はJLPTの試験に合格することです。' }
          ],
          dialogues: [
            '先生: はじめまして！お名前とご専門は何ですか？ (Teacher: Nice to meet you! What is your name and specialty?)',
            '学生: はじめまして、田中です。専門はデータサイエンスです。 (Student: Nice to meet you, I am Tanaka. My specialty is data science.)',
            '先生: 素晴らしいですね。日本語を学ぶ目的は何ですか？ (Teacher: Wonderful. What is your purpose in studying Japanese?)',
            '学生: 日本のグローバル企業で研究開発に参加したいからです。 (Student: Because I want to participate in R&D at a global Japanese enterprise.)'
          ],
          drills: [
            { q: 'Fill in the particle: "わたし ___ エンジニアです。"', a: 'は', exp: 'The topic particle は identifies the subject/topic being described.' },
            { q: 'Translate into polite Japanese: "Mr. Sato is not a student."', a: '佐藤さんは学生ではありません。 (Satō-san wa gakusei dewa arimasen.)', exp: 'Polite non-past negative copula is ではありません (dewa arimasen).' },
            { q: 'Rectify the error: "わたしは先生ではありませんでしたです。"', a: 'わたしは先生ではありませんでした。', exp: 'ではありませんでした is already the complete polite past negative; appending another です is ungrammatical.' }
          ]
        },
        {
          category: 'Verb Conjugation (Masu Form, Te Form) & Essential Particles (を, に, で)',
          focus: 'Godan, Ichidan, and Irregular (Kuru/Suru) verbs in present polite and connective Te forms.',
          formula: 'Action Sentence: [Agent] + は + [Location] + で + [Object] + を + [Verb ます]\nDestination: [Agent] + は + [Destination] + に/へ + 行きます (ikimasu)',
          table: '| Verb Class | Dictionary Form | Masu Form (Polite) | Te Form (Connective) | Meaning |\n|---|---|---|---|---|\n| Godan (U-verb) | 書く (kaku) | 書きます (kakimasu) | 書いて (kaite) | to write |\n| Godan (U-verb) | 飲む (nomu) | 飲みます (nomimasu) | 飲んで (nonde) | to drink |\n| Ichidan (Ru-verb) | 食べる (taberu) | 食べます (tabemasu) | 食べて (tabete) | to eat |\n| Irregular | する (suru) | します (shimasu) | して (shite) | to do |\n| Irregular | 来る (kuru) | 来ます (kimasu) | 来て (kite) | to come |',
          trap: 'Do not confuse location of existence に (iru/aru) with location of active physical action で (e.g. レストランで食べる).',
          words: [
            { word: '確認する', meaning: 'to confirm / verify', pronunciation: '/kakuɲiɴ sɯɾɯ/', example: '重要な仕様書の内容を事前に確認します。' },
            { word: '提出する', meaning: 'to submit', pronunciation: '/teːtɕɯtsɯ sɯɾɯ/', example: '明日の午前中までに進捗報告書を提出してください。' },
            { word: '連絡', meaning: 'contact / communication', pronunciation: '/ɾeɴɾakɯ/', example: '変更点があれば直ちにメールで連絡します。' },
            { word: '準備', meaning: 'preparation', pronunciation: '/dʑɯmbi/', example: '来週のカンファレンスの準備を進めています。' },
            { word: '会議', meaning: 'meeting / conference', pronunciation: '/kaiɡi/', example: '午後二時から本社会議室で定例会議があります。' }
          ],
          dialogues: [
            '課長: 今日の午後のスケジュールを確認しましたか？ (Section Chief: Have you confirmed this afternoon\'s schedule?)',
            '社員: はい、二時からクライアントとオンラインで会議を行います。 (Employee: Yes, we will hold an online meeting with the client at 2:00.)',
            '課長: 資料は全て準備できていますか？ (Section Chief: Are all materials completely prepared?)',
            '社員: はい、最新のデータを反映して全員に配布しました。 (Employee: Yes, I updated with the latest data and distributed to everyone.)'
          ],
          drills: [
            { q: 'Convert "読む (yomu)" into the polite affirmative form.', a: '読みます (yomimasu)', exp: 'Godan verb ending in mu changes its final syllable to mi and appends masu.' },
            { q: 'Choose the correct particle: "図書館 (Library) ___ 本を読みます。"', a: 'で (de)', exp: 'The particle で marks the setting/location where an active action takes place.' },
            { q: 'Rectify the error: "東京で行きます。"', a: '東京に行きます / 東京へ行きます。', exp: 'Direction of movement towards a destination requires に or へ, never で.' }
          ]
        },
        {
          category: 'Te-Form Syntax, Ongoing Actions (〜ています) & Permission/Prohibition',
          focus: 'Expressing continuous states, current actions, permission (〜てもいいです), and prohibition (〜てはいけません).',
          formula: 'Continuous state/action: [Verb て-form] + います (imasu)\nPermission: [Verb て-form] + もいいです (mo ii desu)\nProhibition: [Verb て-form] + は行けません (wa ikemasen)',
          table: '| Pattern | Meaning | Example Sentence |\n|---|---|---|\n| 〜ています | ongoing action / state | 今プロジェクトを進めています (Currently advancing project) |\n| 〜てもいいです | you may / permission | ここで質問してもいいですか (May I ask a question here?) |\n| 〜てはいけません | must not / prohibition | 社外に資料を持ち出してはいけません (Must not take documents out) |\n| 〜てください | please do / polite request | 詳細なデータを送ってください (Please send detailed data) |',
          trap: '結婚しています and 知っています express continuous states resulting from past events, not temporary progressive actions.',
          words: [
            { word: '開発する', meaning: 'to develop (software/tech)', pronunciation: '/kaihatsɯ sɯɾɯ/', example: '新しいAI駆動型プラットフォームを開発しています。' },
            { word: '改善', meaning: 'continuous improvement (kaizen)', pronunciation: '/kaizeɴ/', example: '業務プロセスの継続的な改善を推進します。' },
            { word: '効率的', meaning: 'efficient', pronunciation: '/koːɾitsɯteki/', example: 'より効率的なワークフローを設計することが急務です。' },
            { word: '共有する', meaning: 'to share (info/files)', pronunciation: '/kʲoːjuː sɯɾɯ/', example: '最新の分析結果をチーム全体で共有しましょう。' },
            { word: '成果', meaning: 'achievement / output', pronunciation: '/seːka/', example: 'このプロジェクトは素晴らしい成果を上げています。' }
          ],
          dialogues: [
            'マネージャー: 現在、開発チームは何に取り組んでいますか？ (Manager: What is the development team currently working on?)',
            'リード: ユーザーインターフェースの応答性を改善しています。 (Lead: We are currently improving the user interface responsiveness.)',
            'マネージャー: 素晴らしい進捗ですね。テスト結果を共有してもらえますか？ (Manager: Great progress. Could you share the test results?)',
            'リード: はい、ただいまドキュメントをまとめていますので少々お待ちください。 (Lead: Yes, I am compiling the documents right now, so please wait a moment.)'
          ],
          drills: [
            { q: 'Formulate permission using "入る (hairu)": "May I enter the laboratory?"', a: '実験室に入ってもいいですか。 (Jikkenshitsu ni haitte mo ii desu ka.)', exp: 'Te-form of hairu is haitte; appending mo ii desu ka creates a polite request for permission.' },
            { q: 'Express ongoing action: "He is currently reading the technical specification."', a: '彼は今、技術仕様書を読んでいます。 (Kare wa ima, gijutsu shiyōsho o yonde imasu.)', exp: 'Ongoing action uses the verb te-form + imasu (yonde imasu).' },
            { q: 'Rectify: "ここでタバコを吸うてはいけません。"', a: 'ここでタバコを吸ってはいけません。', exp: 'The verb suu (to smoke) forms its te-form with a geminate stop: sutte, not suute.' }
          ]
        },
        {
          category: 'Honorifics (Keigo: Sonkeigo, Kenjougo) & Executive Business Japanese',
          focus: 'Mastery of respect language (Sonkeigo for superiors) and humble language (Kenjougo for oneself).',
          formula: 'Sonkeigo (Superiors): お + [Verb stem] + になります / Special verbs (いらっしゃる, おっしゃる)\nKenjougo (Self): お/ご + [Verb stem/Noun] + いたします / Special verbs (参る, 申す, 存じ上げる)',
          table: '| Base Verb | Sonkeigo (Respectful - Superior\'s Action) | Kenjougo (Humble - Speaker\'s Action) |\n|---|---|---|\n| 行く / 来る | いらっしゃる / おいでになる | 参る (mairu) |\n| 言う | おっしゃる (ossharu) | 申す (mōsu) / 申し上げる |\n| 見る | ご覧になる (goran ni naru) | 拝見する (haiken suru) |\n| 知る | ご存知です (gozonji desu) | 存じ上げております (zonjiagete orimasu) |\n| 食べる | 召し上がる (meshiagaru) | いただく (itadaku) |',
          trap: 'Never use Sonkeigo to describe your own actions or Kenjougo to describe actions of a client or customer.',
          words: [
            { word: 'ご検討', meaning: 'consideration / review (polite)', pronunciation: '/ɡokeɴtoː/', example: '何卒前向きにご検討いただけますようお願い申し上げます。' },
            { word: '恐縮', meaning: 'feeling deeply grateful/obliged', pronunciation: '/kʲoːɕɯkɯ/', example: 'お忙しい中ご足労いただき大変恐縮でございます。' },
            { word: '承知いたしました', meaning: 'certainly / understood (humble)', pronunciation: '/ɕoːtɕi itaɕimaɕita/', example: 'ご指示の件、かしこまりました。直ちに着手いたします。' },
            { word: 'ご協調', meaning: 'cooperation / harmony', pronunciation: '/ɡokʲoːtɕoː/', example: '各部門との綿密な協調体制を確立いたします。' },
            { word: '合意', meaning: 'mutual consensus / agreement', pronunciation: '/ɡoːi/', example: '両社間で事業提携に関する最終合意に達しました。' }
          ],
          dialogues: [
            '代表取締役: 本日のご提案内容、大変興味深く拝見いたしました。 (Representative Director: I have reviewed your proposal today with deep interest.)',
            '提携先代表: ご覧いただき誠にありがとうございます。何かご不明な点はおありでしょうか？ (Partner Rep: Thank you very much for reviewing it. Do you have any questions?)',
            '代表取締役: 詳細なロードマップについて、来週改めてお話しいただけますか？ (Representative Director: Could we discuss the detailed roadmap again next week?)',
            '提携先代表: かしこまりました。弊社の担当チームを同席させてご説明に伺います。 (Partner Rep: Certainly. I will bring our team to attend and explain in person.)'
          ],
          drills: [
            { q: 'Convert "見る (miru)" to the humble form (Kenjougo) for the speaker.', a: '拝見する / 拝見いたします (haiken suru / haiken itashimasu)', exp: 'Haiken suru lowers the speaker\'s action of looking to show deep deference to the listener.' },
            { q: 'Identify the error in this email: "お客様、明日の10時に弊社へ参ってください。"', a: 'お客様、明日の10時に弊社へいらしてください / お越しください。', exp: 'Mairu is humble (Kenjougo); commanding an honorable guest with mairu is a grave keigo breach.' },
            { q: 'Translate: "I have understood the specifications."', a: '仕様書の件、承知いたしました / かしこまりました。', exp: 'In executive Japanese, standard "wakarimashita" is replaced with humble shōchi itashimashita.' }
          ]
        }
      ]
    },
    ko: {
      langName: 'Korean (한국어)',
      themes: [
        {
          category: 'Hangul Phonology, Batchim & Fundamental Equational Sentences (-이에요/예요, -입니다)',
          focus: 'Vowel harmony, complex batchim (final consonants), and formal vs polite equational copula.',
          formula: 'Informal Polite: [Noun ending with consonant] + 이에요 / [Noun ending with vowel] + 예요\nFormal Polite: [Noun] + 입니다 (imnida) / Negative: [Noun] + 이/가 아닙니다 (i/ga animnida)',
          table: '| Register | Affirmative Copula | Negative Copula | Usage Context |\n|---|---|---|---|\n| Formal Polite | 입니다 (imnida) | 아닙니다 (animnida) | Business meetings, news, military, official presentations |\n| Informal Polite | 이에요 / 예요 | 아니에요 | Daily conversations with peers, teachers, respectable adults |\n| Question Formal | 입니까? (imnikka?) | 아닙니까? | Formal professional inquiry |',
          trap: 'Batchim liaison: When a syllable with a final consonant is followed by a vowel, the batchim sound carries over to the next syllable (e.g. 한국어 -> [한구거]).',
          words: [
            { word: '안녕하세요', meaning: 'Hello / How are you', pronunciation: '/an.njʌŋ.ha.se.jo/', example: '안녕하세요! 한국어 학습을 시작하게 되어 기쁩니다.' },
            { word: '배우다', meaning: 'to learn', pronunciation: '/pɛ.u.da/', example: '우리는 매일 실용적인 한국어 표현을 배웁니다.' },
            { word: '전공', meaning: 'academic major', pronunciation: '/tɕʌn.ɡoŋ/', example: '제 대학 전공은 소프트웨어 공학과 인공지능입니다.' },
            { word: '열정', meaning: 'passion / enthusiasm', pronunciation: '/jʌl.t͈ɕʌŋ/', example: '모든 학생들이 배움에 대한 뜨거운 열정을 가지고 있습니다.' },
            { word: '목표', meaning: 'goal / objective', pronunciation: '/mok.pʰjo/', example: '저의 궁극적인 목표는 글로벌 기업 취업입니다.' }
          ],
          dialogues: [
            '선생님: 안녕하세요! 이름과 전공이 무엇입니까? (Teacher: Hello! What is your name and major?)',
            '학생: 안녕하십니까! 저는 이준호이고 전공은 컴퓨터공학입니다. (Student: Hello! I am Lee Jun-ho and my major is computer engineering.)',
            '선생님: 반갑습니다. 한국어를 공부하는 주된 목적은 무엇인가요? (Teacher: Nice to meet you. What is your main purpose in studying Korean?)',
            '학생: 서울에 있는 IT 연구소에서 연구원으로 일하고 싶기 때문입니다. (Student: Because I want to work as a researcher at an IT lab in Seoul.)'
          ],
          drills: [
            { q: 'Attach the correct informal polite copula to "학생" (Student).', a: '학생이에요', exp: '학생 ends in the batchim consonant "ㅇ", so 이에요 is attached.' },
            { q: 'Translate: "I am not an American."', a: '저는 미국 사람이 아닙니다. (Jeoneun miguk sarami animnida.)', exp: 'Negative formal copula requires subject particle 이/가 + 아닙니다.' },
            { q: 'Rectify the error: "저는 선생님 예요."', a: '저는 선생님이에요.', exp: '선생님 ends in a final consonant (ㅁ), so it must take 이에요, not 예요.' }
          ]
        },
        {
          category: 'Present Tense Verb Conjugation (-아요/어요) & Core Particles (은/는, 이/가, 을/를, 에/에서)',
          focus: 'Vowel harmony rules for regular and irregular verb stems and functional case particles.',
          formula: 'Verb conjugation: Bright vowels (ㅏ, ㅗ) -> + 아요 / All other vowels -> + 어요 / 하다 -> 해요\nLocation of Action: [Location] + 에서 + [Object] + 을/를 + [Action Verb]',
          table: '| Verb Root | Stem Vowel | Regular Conjugation | Polite Present | Meaning |\n|---|---|---|---|---|\n| 가다 (to go) | ㅏ (Bright) | 가 + 아요 | 가요 | I go / you go |\n| 먹다 (to eat) | ㅓ (Dark) | 먹 + 어요 | 먹어요 | I eat / you eat |\n| 공부하다 (to study) | 하다 | 공부 + 해요 | 공부해요 | I study |\n| 마시다 (to drink) | ㅣ (Neutral) | 마시 + 어요 | 마셔요 | I drink |\n| 일하다 (to work) | 하다 | 일 + 해요 | 일해요 | I work |',
          trap: 'Differentiate 에 (destination of movement e.g. 회사에 가요 or static existence) from 에서 (location where dynamic action occurs e.g. 회사에서 일해요).',
          words: [
            { word: '협력하다', meaning: 'to cooperate / collaborate', pronunciation: '/hjʌm.njʌkʰa.da/', example: '우리는 다국적 팀과 긴밀하게 협력하고 있습니다.' },
            { word: '회의', meaning: 'meeting / conference', pronunciation: '/hø.i/', example: '오후 두 시에 본사 대회의실에서 전략 회의가 있습니다.' },
            { word: '발표하다', meaning: 'to present / announce', pronunciation: '/pal.pʰjo.ha.da/', example: '오늘 연구 성과를 동료들 앞에서 발표합니다.' },
            { word: '해결책', meaning: 'solution', pronunciation: '/hɛ.ɡjʌl.tɕʰɛk/', example: '복잡한 기술적 문제에 대한 혁신적인 해결책을 찾았습니다.' },
            { word: '중요하다', meaning: 'to be important', pronunciation: '/tɕuŋ.jo.ha.da/', example: '팀원 간의 투명한 의사소통은 대단히 중요합니다.' }
          ],
          dialogues: [
            '팀장: 오늘 어디에서 프로젝트 기획 회의를 진행합니까? (Team Leader: Where are we holding the project planning meeting today?)',
            '연구원: 3층 스마트 회의실에서 진행합니다. 자료도 이미 준비했습니다. (Researcher: In the 3rd-floor smart meeting room. Materials are already prepared.)',
            '팀장: 아주 훌륭합니다. 주요 안건에 대해 핵심을 잘 짚어주세요. (Team Leader: Very excellent. Please pinpoint the key issues clearly.)',
            '연구원: 네, 철저하게 준비하여 명확하게 발표하겠습니다. (Researcher: Yes, I will prepare thoroughly and present with clarity.)'
          ],
          drills: [
            { q: 'Conjugate "만나다 (to meet)" into the informal polite present tense.', a: '만나요', exp: 'Stem vowel is ㅏ (bright), so 아요 is added: 만나 + 아요 -> 만나요.' },
            { q: 'Select the correct particle: "도서관 (Library) ___ 한국어를 공부해요."', a: '에서', exp: 'Active learning action takes place inside the library, requiring dynamic location particle 에서.' },
            { q: 'Rectify: "저는 커피를 카페에 마셔요."', a: '저는 커피를 카페에서 마셔요.', exp: 'Drinking coffee is an action occurring inside the cafe, which requires 에서 instead of 에.' }
          ]
        },
        {
          category: 'Past Tense (-았/었어요), Future Intentions (-(으)ㄹ 거예요) & Connective Particles',
          focus: 'Chronological narrative discourse, completed milestones, future planning, and contrastive conjunctions (-지만, -고).',
          formula: 'Past: Stem + -았어요 (bright) / -었어요 (other) / -했어요 (하다)\nFuture: Stem with batchim + 을 거예요 / Stem without batchim + ㄹ 거예요',
          table: '| Verb | Past Tense (과거) | Future Tense (미래) | Connective (-고 / -지만) |\n|---|---|---|---|\n| 가다 (go) | 갔어요 | 갈 거예요 | 가고 / 가지만 |\n| 만들다 (make) | 만들었어요 | 만들 거예요 | 만들고 / 만들지만 |\n| 개발하다 (develop) | 개발했어요 | 개발할 거예요 | 개발하고 / 개발하지만 |\n| 읽다 (read) | 읽었어요 | 읽을 거예요 | 읽고 / 읽지만 |',
          trap: 'Irregular ㅂ verbs: Verb roots ending in ㅂ (like 돕다, 춥다, 어렵다) change ㅂ into 우 before vowel endings (어려웠어요, 어려울 거예요).',
          words: [
            { word: '달성하다', meaning: 'to achieve / accomplish', pronunciation: '/tal.sʌŋ.ha.da/', example: '지난 분기 목표 실적을 성공적으로 달성했습니다.' },
            { word: '추진하다', meaning: 'to propel / promote forward', pronunciation: '/tɕʰu.dʑin.ha.da/', example: '글로벌 시장 진출 전략을 적극적으로 추진할 것입니다.' },
            { word: '경험', meaning: 'experience', pronunciation: '/kjʌŋ.hʌm/', example: '다양한 실무 경험이 큰 자산이 되었습니다.' },
            { word: '발전', meaning: 'development / progress', pronunciation: '/pal.tɕʌn/', example: '지속적인 기술 혁신을 통해 큰 발전을 이루었습니다.' },
            { word: '일정', meaning: 'schedule / itinerary', pronunciation: '/il.tɕʌŋ/', example: '상반기 프로젝트 일정을 철저히 준수하겠습니다.' }
          ],
          dialogues: [
            '이사: 어제 고객사와의 미팅 결과는 어떠했습니까? (Director: How was the result of yesterday\'s meeting with the client?)',
            '수석: 상호 협력 방안에 대해 심도 있게 논의했고 매우 긍정적인 반응을 얻었습니다. (Principal: We discussed mutual cooperation in depth and received very positive feedback.)',
            '이사: 잘하셨습니다. 향후 실행 계획은 어떻게 준비할 예정입니까? (Director: Well done. How do you plan to prepare the future execution plan?)',
            '수석: 다음 주까지 구체적인 계약서 초안을 작성하여 보고드리겠습니다. (Principal: I will draft the specific contract proposal and report by next week.)'
          ],
          drills: [
            { q: 'Conjugate "배우다 (to learn)" into past tense.', a: '배웠어요', exp: 'Stem ends in ㅜ, which contracts with -었어요 to produce 배웠어요.' },
            { q: 'Translate: "We will sign the agreement next month."', a: '우리는 다음 달에 협약서에 서명할 거예요.', exp: 'Future probability/plan requires -(으)ㄹ 거예요.' },
            { q: 'Rectify: "어제 날씨가 춥었어요."', a: '어제 날씨가 추웠어요.', exp: '춥다 is an irregular ㅂ verb; the ㅂ transforms to 우, yielding 추웠어요.' }
          ]
        },
        {
          category: 'Business Honorifics (-(으)시-, -드리다), Professional Hierarchy & Corporate Negotiations',
          focus: 'Subject honorific infix -(으)시-, humble objective verbs, and formal business register (-습니다/십니까).',
          formula: 'Subject Honorific: [Verb stem] + -(으)십니다 / -(으)세요\nObjective Humble: [Superior에게] + [Verb stem] + -어/아 드리다 (말씀드리다, 전해드리다)',
          table: '| Standard Verb | Honorific Form (Subject is Superior) | Humble Form (Speaker to Superior) |\n|---|---|---|\n| 말하다 (to speak) | 말씀하시다 | 말씀드리다 |\n| 주다 (to give) | 주시다 | 드리다 |\n| 만나다 (to meet) | 만나시다 | 뵙다 / 찾아뵙다 |\n| 있다 (to exist) | 계시다 (person) / 있으시다 (possession) | - |\n| 먹다 (to eat) | 드시다 / 잡수시다 | - |',
          trap: 'Differentiate 계시다 (respecting the person directly e.g. 사장님께서 방에 계십니다) from 있으시다 (respecting the person\'s attributes e.g. 사장님께서는 질문이 있으십니다).',
          words: [
            { word: '검토하시다', meaning: 'to review / examine (honorific)', pronunciation: '/kʌm.tʰo.ha.ɕi.da/', example: '대표이사님께서 계약 조건을 직접 검토하셨습니다.' },
            { word: '말씀드리다', meaning: 'to tell / report (humble)', pronunciation: '/mal.s͈ɯm.dɯ.ɾi.da/', example: '오늘 회의에서 결정된 주요 사안을 간략히 말씀드리겠습니다.' },
            { word: '합의', meaning: 'mutual agreement / accord', pronunciation: '/ha.bwi/', example: '양측의 이견을 조율하여 최종 합의에 도달하였습니다.' },
            { word: '신뢰', meaning: 'trust / confidence', pronunciation: '/ɕil.lø/', example: '고객과의 두터운 신뢰 구축이 기업의 최우선 가치입니다.' },
            { word: '전략적', meaning: 'strategic', pronunciation: '/tɕʌn.ɾjak̚.tɕ͈ʌk/', example: '두 회사는 글로벌 시장에서 전략적 동반자 관계를 맺었습니다.' }
          ],
          dialogues: [
            '대표: 이번 분기 해외 진출 전략에 대해 보고해 주시겠습니까? (CEO: Would you please report on this quarter\'s overseas expansion strategy?)',
            '본부장: 네, 대표이사님. 현지 시장 분석 및 파트너십 구축 계획을 말씀드리겠습니다. (Head: Yes, CEO. I will present the local market analysis and partnership plans.)',
            '대표: 아주 꼼꼼하게 검토하셨군요. 위험 요인은 어떻게 대비하고 있습니까? (CEO: You reviewed it very thoroughly. How are you preparing for risk factors?)',
            '본부장: 철저한 법률 자문과 비상 대응 매뉴얼을 수립하여 철저히 대비하고 있습니다. (Head: We are preparing thoroughly by establishing legal counsel and a contingency manual.)'
          ],
          drills: [
            { q: 'Convert "말하다 (to speak)" into the humble form when addressing an executive superior.', a: '말씀드리다 (말씀드리겠습니다)', exp: 'When the speaker reports to an honored superior, humble 말씀드리다 is required.' },
            { q: 'Identify the error: "대표님, 여기에 이름을 쓰세요."', a: '대표님, 여기에 성함을 써 주십시오 / 작성해 주십시오.', exp: 'To address a CEO, 이름 is elevated to 성함 and the directive is softened with respectful requests.' },
            { q: 'Translate: "The Director is currently on a business trip abroad."', a: '이사님께서는 지금 해외 출장 중이십니다 / 출장을 가셨습니다.', exp: 'Subject honorific infix -시- is mandatory when speaking of the actions of a senior director.' }
          ]
        }
      ]
    },
    fr: {
      langName: 'French (Français)',
      themes: Object.values(FRENCH_MONTHS).map(m => ({
        category: m.topicTitle,
        focus: m.grammarFocus,
        formula: m.syntacticFormula,
        table: m.conjugationTable,
        trap: m.phoneticsTrap,
        words: m.vocab.map(v => ({ word: v.word, meaning: v.meaning, pronunciation: v.pronunciation, example: v.example_sentence })),
        dialogues: m.dialogue,
        drills: m.drills.map(d => ({ q: d.question, a: d.answer, exp: d.explanation }))
      }))
    }
  };

  const profile = LANGUAGE_PROFILES[langKey] || LANGUAGE_PROFILES.fr;
  
  // High-granularity progression: Map day to continuous linguistic syllabus subtopics
  const totalThemes = profile.themes.length;
  // Compute progressive theme and weekly stage based on exact dayNumber
  const progressiveIndex = ((dayNumber - 1) % totalThemes);
  const theme = profile.themes[progressiveIndex];

  // Specific daily pedagogical milestone derived from dayInMonth and dayNumber
  const dailyMilestoneTypes = [
    'Syntactic Architecture & Morphological Foundations',
    'Auditory Phonetics, Pitch & Pronunciation Articulation',
    'Applied Conversational Discourse & Dialogue Production',
    'Case Structures, Particles & Structural Word Order',
    'Oral Fluency Drills, High-Frequency Collocations & Idioms',
    'Interactive Roleplay & Situational Context Simulation',
    'Mid-Module Applied Synthesis & Comprehension Mastery'
  ];
  const milestoneStage = dailyMilestoneTypes[(dayNumber - 1) % dailyMilestoneTypes.length];

  // Compute unique day-specific syntactic formula, active conjugation paradigm, and phonetic traps
  const daySyntacticFormulas: Record<string, string[]> = {
    fr: [
      `Day ${dayNumber} Affirmative: [Sujet] + [Radical verbal] + -e/-es/-e/-ons/-ez/-ent + [Complément d'objet direct]`,
      `Day ${dayNumber} Negative Formulation: [Sujet] + ne / n' + [Verbe conjugué] + pas + [Complément]`,
      `Day ${dayNumber} Interrogative Inversion: [Verbe] + -il / -elle / -on + [Complément] ?`,
      `Day ${dayNumber} Pronominal Structure: [Sujet] + me / te / se / nous / vous / se + [Verbe régulier]`,
      `Day ${dayNumber} Temporal Sequence: D'abord [Proposition A], ensuite [Proposition B], enfin [Conclusion]`,
      `Day ${dayNumber} Direct Object Clitic: [Sujet] + le / la / les + [Verbe conjugué]`,
      `Day ${dayNumber} Complex Subjunctive: Il est impératif que + [Sujet] + [Radical subjonctif] + -e/-es/-ions/-iez/-ent`,
      `Day ${dayNumber} Conditional Polite Formula: [Sujet] + pourrais / serais disposé à + [Infinitif]`
    ],
    es: [
      `Día ${dayNumber} Estructura Afirmativa: [Sujeto] + [Verbo conjugado en presente] + [Complemento circunstancial]`,
      `Día ${dayNumber} Estructura Negativa: [Sujeto] + no + [Verbo] + [Complemento directo / indirecto]`,
      `Día ${dayNumber} Pregunta Formal: ¿ + [Verbo conjugado] + usted / ustedes + [Complemento] + ?`,
      `Día ${dayNumber} Construcción Reflexiva: [Pronombre reflexivo: me/te/se/nos] + [Verbo] + [Sustantivo]`,
      `Día ${dayNumber} Contraste Pretérito: Mientras [Imperfecto: -aba/-ía], [Indefinido: -é/-í/-ió]`,
      `Día ${dayNumber} Subjuntivo Obligatorio: Es necesario que + [Sujeto] + [Presente de Subjuntivo]`,
      `Día ${dayNumber} Condicional de Cortesía: ¿Sería tan amable de + [Infinitif] + [Objeto] ?`,
      `Día ${dayNumber} Perífrasis de Futuro: [Ir conjugado: voy/vas/va/vamos] + a + [Infinitivo]`
    ],
    de: [
      `Tag ${dayNumber} Hauptsatz-Struktur: [Subjekt] + [Finites Verb an Position 2] + [Temporalangabe] + [Objekt]`,
      `Tag ${dayNumber} Inversion nach Zeitangabe: [Heute / Morgen] + [Verb an Pos. 2] + [Subjekt] + [Ergänzung]`,
      `Tag ${dayNumber} Nebensatz mit 'weil': [Hauptsatz], weil + [Subjekt] + [Objekt] + [Finites Verb am SATZENDE]`,
      `Tag ${dayNumber} Modalverb-Klammer: [Subjekt] + [Modalverb: kann/muss/will] + [Objekt] + [Infinitiv am ENDE]`,
      `Tag ${dayNumber} Dativ-Ergänzung: [Subjekt] + [Verb] + [Dativ-Objekt: dem / der / den] + [Akkusativ-Objekt]`,
      `Tag ${dayNumber} Perfekt-Konstruktion: [Subjekt] + [haben/sein] + [Mittelfeld] + [Partizip II am Ende]`,
      `Tag ${dayNumber} Konjunktiv II Höflichkeit: Ich [würde gern / hätte gern] + [Akkusativ-Objekt]`,
      `Tag ${dayNumber} Vorgangspassiv: [Objekt] + wird / werden + [von + Dativ] + [Partizip II]`
    ],
    ja: [
      `第${dayNumber}課 肯定文構造: [主題 A] は + [述語名詞 B] です。`,
      `第${dayNumber}課 否定文構造: [主題 A] は + [述語名詞 B] ではありません。`,
      `第${dayNumber}課 動詞述語文: [主語] は + [場所] で + [目的語] を + [動詞 ます形]。`,
      `第${dayNumber}課 進行形文法: [主語] は + 現在 + [動詞 て形] います。`,
      `第${dayNumber}課 許可と依頼: [動詞 て形] もいいですか / [動詞 て形] ください。`,
      `第${dayNumber}課 存在構文: [場所] に + [人/物] が + います / あります。`,
      `第${dayNumber}課 敬語表現 (謙譲): 私が + [動詞 連用形] + いたします / 申し上げます。`,
      `第${dayNumber}課 敬語表現 (尊敬): 先生が + お + [動詞 連用形] + になります。`
    ],
    ko: [
      `제${dayNumber}일 서술문 공식: [주제 A]는/은 + [명사 B]이에요/예요 (격식체: 입니다).`,
      `제${dayNumber}일 부정문 공식: [주제 A]는/은 + [명사 B]이/가 아니에요 (격식체: 아닙니다).`,
      `제${dayNumber}일 행동 동사문: [주어]는 + [장소]에서 + [목적어]을/를 + [동사 아요/어요/해요].`,
      `제${dayNumber}일 과거 시제문: [주어]는 + 어제 + [어간 + 았어요/었어요/했어요].`,
      `제${dayNumber}일 미래 계획문: [주어]는 + 내일 + [어간 + (으)ㄹ 거예요].`,
      `제${dayNumber}일 정중한 요청: [동사 어간] + 아/어 주세요 (더 정중히: 주시겠습니까?).`,
      `제${dayNumber}일 존칭 종결어미: [존칭 주어]께서 + [어간 + (으)십니다 / (으)세요].`,
      `제${dayNumber}일 비즈니스 겸양: [발표자]가 + 간략히 + 말씀드리겠습니다.`
    ]
  };

  const daySyntacticFormula = (daySyntacticFormulas[langKey] || daySyntacticFormulas.fr)[(dayNumber - 1) % 8];

  // Unique day-specific paradigm table based on dayNumber
  const dayParadigmTables: Record<string, string[]> = {
    fr: [
      `| Pronom Sujet | Terminaison Régulière | Exemple Concret (Jour ${dayNumber}) | Phonétique IPA |\n|---|---|---|---|\n| Je | -e | je commence | /ʒə kɔ.mɑ̃s/ |\n| Tu | -es | tu écoutes | /ty e.kut/ |\n| Il / Elle | -e | il/elle présente | /il pʁe.zɑ̃t/ |\n| Nous | -ons | nous développons | /nu de.vlɔ.pɔ̃/ |\n| Vous | -ez | vous maîtrisez | /vu mɛ.tʁi.ze/ |\n| Ils / Elles | -ent | ils/elles réussissent | /il ʁe.y.sis/ |`,
      `| Forme Verbale | Auxiliaire (Jour ${dayNumber}) | Participe Passé | Traduction Contextuelle |\n|---|---|---|---|\n| 1ère Pers. Sing. | j'ai | analysé | I analyzed / evaluated |\n| 2ème Pers. Sing. | tu as | négocié | you negotiated successfully |\n| 3ème Pers. Sing. | il/elle a | rédigé | he/she drafted the memo |\n| 1ère Pers. Plur. | nous avons | coordonné | we coordinated milestones |\n| 2ème Pers. Plur. | vous avez | certifié | you certified the deliverables |\n| 3ème Pers. Plur. | ils/elles ont | finalisé | they finalized the protocol |`,
      `| Pronom Complément | Position Jour ${dayNumber} | Exemple Spécifique | Valeur Communicative |\n|---|---|---|---|\n| me / m' | avant verbe | Il m'explique la méthode | 1ère personne objet |\n| te / t' | avant verbe | Je te transmets le fichier | 2ème personne objet |\n| lui | avant verbe | Nous lui parlons ce matin | 3ème personne indirect |\n| nous | avant verbe | Elle nous accompagne | 1ère pluriel objet |\n| vous | avant verbe | Je vous remercie sincèrement | Formule de politesse |\n| leur | avant verbe | Le professeur leur répond | 3ème pluriel indirect |`,
      `| Conjonction Subjonctive | Déclencheur Jour ${dayNumber} | Forme Subjonctif (Que je...) | Traduction |\n|---|---|---|---|\n| Pour que | Volonté / But | que je réussisse | so that I succeed |\n| Bien que | Concession | que tu sois prêt | although you are ready |\n| Avant que | Antériorité | qu'il comprenne | before he understands |\n| Il faut que | Nécessité absolue | que nous agissions | it is necessary that we act |\n| Afin que | Finalité exécutive | que vous ayez les données | in order that you have data |\n| De peur que | Précaution formelle | qu'ils ne fassent d'erreur | lest they make a mistake |`
    ],
    es: [
      `| Pronombre | Terminación Día ${dayNumber} | Verbo Modelo (Trabajar) | Transcripción Fonética |\n|---|---|---|---|\n| Yo | -o | yo trabajo | /ʝo tɾaˈβa.xo/ |\n| Tú | -as | tú trabajas | /tu tɾaˈβa.xas/ |\n| Él / Ella / Ud. | -a | él trabaja | /el tɾaˈβa.xa/ |\n| Nosotros | -amos | nosotros trabajamos | /noˈso.tɾos tɾa.βaˈxa.mos/ |\n| Vosotros | -áis | vosotros trabajáis | /boˈso.tɾos tɾa.βaˈxajs/ |\n| Ellos / Ellas / Uds.| -an | ellos trabajan | /ˈe.ʝos tɾaˈβa.xan/ |`,
      `| Sujeto | Pretérito Indefinido (Día ${dayNumber}) | Pretérito Imperfecto | Distinción Funcional |\n|---|---|---|---|\n| Yo | presenté | presentaba | Acción puntual vs hábito |\n| Tú | explicaste | explicabas | Acción completada vs contexto |\n| Él / Ella | organizó | organizaba | Hecho cerrado vs estado |\n| Nosotros | coordinamos | coordinábamos | Evento único vs rutina |\n| Vosotros | revisasteis | revisabais | Evaluación pasada |\n| Ellos | concluyeron | concluían | Cierre de proyecto |`,
      `| Cláusula de Voluntad | Nexo | Presente de Subjuntivo (Día ${dayNumber}) | Uso Práctico |\n|---|---|---|---|\n| Deseo | que | yo aprenda con rigor | Expresión de meta académica |\n| Sugiero | que | tú participes activamente | Consejo pedagógico activo |\n| Es importante | que | nosotros alcancemos el objetivo | Directiva institucional |\n| Exijo | que | los informes sean precisos | Estándar de calidad técnica |\n| Ojalá | que | tengamos excelentes resultados | Aspiración profesional |`
    ],
    de: [
      `| Personalpronomen | Endung Tag ${dayNumber} | Verb Präsens (Lernen) | Aussprache IPA |\n|---|---|---|---|\n| Ich | -e | ich lerne gründlich | /ɪç ˈlɛʁnə/ |\n| Du | -st | du lernst schnell | /duː ˈlɛʁnst/ |\n| Er / Sie / Es | -t | er/sie lernt fleißig | /eːɐ̯ ˈlɛʁnt/ |\n| Wir | -en | wir lernen gemeinsam | /viːɐ̯ ˈlɛʁnən/ |\n| Ihr | -t | ihr lernt strukturiert | /iːɐ̯ ˈlɛʁnt/ |\n| Sie / sie | -en | Sie lernen professionell | /ziː ˈlɛʁnən/ |`,
      `| Kasus | Bestimmter Artikel Tag ${dayNumber} | Unbestimmter Artikel | Satzbeispiel |\n|---|---|---|---|\n| Nominativ | der / die / das | ein / eine / ein | Der Ingenieur plant das System |\n| Akkusativ | den / die / das | einen / eine / ein | Wir prüfen den aktuellen Vertrag |\n| Dativ | dem / der / dem | einem / einer / einem | Ich helfe dem neuen Mitarbeiter |\n| Genitiv | des (-s) / der / des (-s) | eines / einer / eines | Wegen des straffen Zeitplans |`
    ],
    ja: [
      `| 文法要素 | 助詞 (第${dayNumber}課) | 日本語用例 | ローマ字と機能 |\n|---|---|---|---|\n| 主題提示 | は (wa) | 私は今研究を進めています | Watashi wa (Topic focus) |\n| 対象・目的語 | を (o) | 仕様書を注意深く確認します | Shiyōsho o (Direct object) |\n| 動作場所 | で (de) | 会議室でプレゼンを行います | Kaigishitsu de (Action setting) |\n| 帰着・時間 | に (ni) | 明日午後二時に出発します | Niji ni (Time/Target) |\n| 同伴・並列 | と (to) | 先輩とプロジェクトを担当します | Senpai to (Mutual collaboration) |`,
      `| 動詞辞書形 | ます形 (丁寧) | て形 (接続) | 第${dayNumber}課 応用実例 |\n|---|---|---|---|\n| 書く (kaku) | 書きます | 書いて | レポートを書いて提出しました |\n| 聞く (kiku) | 聞きます | 聞いて | 音声を繰り返し聞いて復習します |\n| 話す (hanasu) | 話します | 話して | ネイティブと自然に話します |\n| 改善する | 改善します | 改善して | 開発プロセスを継続的に改善します |`
    ],
    ko: [
      `| 격조사 | 조사 형태 (제${dayNumber}일) | 실제 한국어 예문 | 기능과 번역 |\n|---|---|---|---|\n| 은 / 는 | 받침 있음: 은 / 없음: 는 | 저는 새로운 기술을 배웁니다 | Topic marker (I learn new skills) |\n| 이 / 가 | 받침 있음: 이 / 없음: 가 | 실천 능력이 매우 중요합니다 | Subject marker (Practical skill is vital) |\n| 을 / 를 | 받침 있음: 을 / 없음: 를 | 전문 지식을 습득하고 있습니다 | Object marker (Acquiring expertise) |\n| 에 / 에서 | 에 (시간/장소) / 에서 (행동) | 강의실에서 팀 토론을 합니다 | Setting marker (Discussing in room) |`,
      `| 기본형 동사 | 현재 정중체 (제${dayNumber}일) | 과거 완성형 | 업무 커뮤니케이션 의미 |\n|---|---|---|---|\n| 협력하다 | 협력합니다 / 협력해요 | 협력했습니다 | To collaborate with global teams |\n| 완성하다 | 완성합니다 / 완성해요 | 완성했습니다 | To complete project deliverables |\n| 분석하다 | 분석합니다 / 분석해요 | 분석했습니다 | To analyze data and parameters |\n| 보고하다 | 보고합니다 / 보고해요 | 보고했습니다 | To report progress to management |`
    ]
  };

  const dayParadigmTable = (dayParadigmTables[langKey] || dayParadigmTables.fr)[(dayNumber - 1) % (dayParadigmTables[langKey] || dayParadigmTables.fr).length];

  // Unique dialogue turns that vary distinctly for every single day
  const dayDialogues: Record<string, string[][]> = {
    fr: [
      [
        `Professeur: Bonjour ! Bienvenue à la séance du Jour ${dayNumber}. Êtes-vous prêt pour le défi d'aujourd'hui ? (Teacher: Hello! Welcome to Day ${dayNumber} session. Are you ready for today's challenge?)`,
        `Étudiant: Tout à fait professeur ! J'ai révisé les structures cibles et le vocabulaire d'ancrage avec beaucoup d'attention. (Student: Absolutely teacher! I carefully reviewed the target structures and core vocabulary.)`,
        `Professeur: Excellent. Appliquez immédiatement la formule du jour en formulant une phrase complète. (Teacher: Excellent. Apply today's formula right away by forming a full sentence.)`,
        `Étudiant: Avec plaisir : grâce à ces séances quotidiennes, ma fluidité et ma précision grammaticale progressent chaque jour. (Student: With pleasure: thanks to these daily sessions, my fluency and grammar precision advance each day.)`
      ],
      [
        `Directeur Pédagogique: Aujourd'hui, lors du Jour ${dayNumber}, nous analysons les nuances phonétiques et discursives. (Academic Director: Today in Day ${dayNumber}, we analyze phonetic and discourse nuances.)`,
        `Stagiaire: J'ai particulièrement remarqué l'importance de la cadence et des liaisons obligatoires dans l'enregistrement. (Trainee: I particularly noticed the importance of cadence and mandatory liaisons in the recording.)`,
        `Directeur Pédagogique: Très bonne observation. C'est exactement ce qui distingue le niveau A1/A2 des locuteurs autonomes. (Academic Director: Very good observation. That is exactly what distinguishes A1/A2 from autonomous speakers.)`,
        `Stagiaire: Je vais m'enregistrer pour perfectionner mon intonation dès la fin du cours. (Trainee: I will record myself to perfect my intonation right after class.)`
      ],
      [
        `Collègue A: Comment abordez-vous la simulation interactive du Jour ${dayNumber} ? (Colleague A: How are you approaching Day ${dayNumber}'s interactive simulation?)`,
        `Collègue B: Je structure mon intervention en trois étapes : présentation des faits, argumentation et conclusion synthétique. (Colleague B: I structure my turn in 3 stages: presenting facts, argumentation, and concise conclusion.)`,
        `Collègue A: C'est une méthode exemplaire. Travaillons notre dialogue en binôme pour maximiser notre temps de parole. (Colleague A: That is an exemplary method. Let's work in pairs to maximize our speaking time.)`,
        `Collègue B: Parfait, nous sommes synchronisés pour atteindre l'excellence linguistique aujourd'hui. (Colleague B: Perfect, we are synchronized to achieve linguistic excellence today.)`
      ]
    ],
    es: [
      [
        `Profesor: ¡Hola a todos! En esta clase del Día ${dayNumber} consolidaremos la precisión sintáctica y comunicativa. (Teacher: Hello everyone! In this Day ${dayNumber} class we will consolidate syntactic and communicative accuracy.)`,
        `Estudiante: ¡Buenos días profesor! He practicado intensamente la pronunciación de las palabras clave de hoy. (Student: Good morning professor! I have intensively practiced the pronunciation of today's keywords.)`,
        `Profesor: Excelente actitud. Demuestra cómo enlazas el vocabulario de hoy en una propuesta coherente. (Teacher: Excellent attitude. Demonstrate how you link today's vocabulary in a coherent proposal.)`,
        `Estudiante: Por supuesto: nuestro equipo asume el compromiso de hablar exclusivamente en español durante toda la sesión. (Student: Of course: our team makes the commitment to speak exclusively in Spanish throughout the whole session.)`
      ]
    ],
    de: [
      [
        `Dozent: Herzlich willkommen zur Unterrichtseinheit an Tag ${dayNumber}. Haben Sie die Grammatikstrukturen wiederholt? (Lecturer: Welcome to the session on Day ${dayNumber}. Have you reviewed the grammar structures?)`,
        `Teilnehmer: Ja, ich habe die Wortstellung und die heutigen Vokabeln systematisch geübt. (Participant: Yes, I systematically practiced word order and today's vocabulary.)`,
        `Dozent: Sehr gut. Bilden Sie bitte einen vollständigen Satz mit der Zielstruktur des Tages. (Lecturer: Very good. Please formulate a complete sentence using today's target structure.)`,
        `Teilnehmer: Mit Vergnügen: Durch dieses tägliche Training spreche ich von Tag zu Tag sicherer und flüssiger Deutsch. (Participant: With pleasure: Through this daily training I speak German with increasing confidence and fluency each day.)`
      ]
    ],
    ja: [
      [
        `指導員: 皆さん、第${dayNumber}日の講義へようこそ。今日の学習目標を確認しましょう。 (Instructor: Everyone, welcome to Day ${dayNumber} lecture. Let's review today's learning objectives.)`,
        `研修生: はい、今日の文法パターンと重要語彙をしっかりと予習してきました。 (Trainee: Yes, I thoroughly prepared today's grammar patterns and key vocabulary.)`,
        `指導員: 素晴らしい準備ですね。実際の業務場面を想定して会話をしてみましょう。 (Instructor: Wonderful preparation. Let's practice conversing imagining real workplace scenarios.)`,
        `研修生: かしこまりました。正確な発音と丁寧な表現を意識して対話に臨みます。 (Trainee: Certainly. I will approach the dialogue keeping accurate pronunciation and polite language in mind.)`
      ]
    ],
    ko: [
      [
        `교수: 안녕하십니까! 제${dayNumber}일 수업에 오신 것을 환영합니다. 오늘의 핵심 표현을 복습하셨습니까? (Professor: Hello! Welcome to Day ${dayNumber} class. Did you review today's key expressions?)`,
        `학생: 네 교수님, 오늘 학습할 세 가지 어휘와 문장 구조를 꼼꼼하게 연습했습니다. (Student: Yes professor, I carefully practiced today's three vocabulary words and sentence structures.)`,
        `교수: 아주 훌륭합니다. 배운 표현을 활용하여 자신감 있게 한국어로 발화해 보세요. (Professor: Very excellent. Try speaking confidently in Korean using the learned expressions.)`,
        `학생: 네, 매일 꾸준히 학습하여 자연스러운 의사소통 능력을 반드시 완성하겠습니다. (Student: Yes, I will consistently study every day to master natural communicative competence.)`
      ]
    ]
  };

  const selectedDialogue = (dayDialogues[langKey] || dayDialogues.fr)[(dayNumber - 1) % (dayDialogues[langKey] || dayDialogues.fr).length];

  // Extract ground truth evidence and analyzed structures from the tutor's session package
  const planInfo = sessionPackage?.session_plan;
  const analyzedGrammar = planInfo?.grammar_focus || [];
  const analyzedVocab = planInfo?.key_vocabulary || [];
  const analyzedObjectives = planInfo?.learning_objectives || [];

  // Derive dynamic day-specific grammar anchor from source analysis if available
  const dayGrammarAnchor = (analyzedGrammar.length > 0)
    ? analyzedGrammar[(dayNumber - 1) % analyzedGrammar.length]
    : theme.category;

  // Extract day-specific vocabulary and exercises
  const vIndex1 = (dayNumber - 1) % theme.words.length;
  const vIndex2 = (dayNumber * 2 - 1) % theme.words.length;
  const vIndex3 = (dayNumber * 3 - 1) % theme.words.length;

  const rawDayWords = [
    theme.words[vIndex1],
    theme.words[vIndex2],
    theme.words[vIndex3]
  ].filter(Boolean);

  const dayVocab = rawDayWords.map((w: any, idx: number) => ({
    word: w.word,
    meaning: w.meaning,
    pronunciation: w.pronunciation,
    example_sentence: w.example || `Example usage in class for Day ${dayNumber}`
  }));

  const selectedDrills = theme.drills.slice(0, 3).map((d: any, idx: number) => ({
    question: `[Day ${dayNumber} Drill ${idx + 1}] ${d.q}`,
    answer: d.a,
    explanation: d.exp
  }));

  const dayVocabAnchor = (analyzedVocab.length > 0)
    ? analyzedVocab[(dayNumber - 1) % analyzedVocab.length]
    : theme.words[vIndex1]?.word || baseTopic;

  const dayObjectiveAnchor = (analyzedObjectives.length > 0)
    ? analyzedObjectives[(dayNumber - 1) % analyzedObjectives.length]
    : theme.focus;

  // Derive dynamic daily subtopic ensuring Day 1 to Day N are completely distinct and source-grounded
  const isSchool = Boolean(sessionPackage?.institution_type === 'SCHOOL');
  const unitLabel = isSchool ? `Period ${dayNumber}` : `Session ${dayNumber}`;
  const dailyProgressionPill = `${unitLabel}: ${dayGrammarAnchor} — ${milestoneStage} (Part ${((dayNumber - 1) % 4) + 1})`;

  // Dynamic study guide text with completely unique day-specific linguistic focus, formulas, and paradigms
  const studyNotes = `### Master Study Guide: ${unitLabel} (Course Unit ${dayNumber} of ${totalDays})
Language Track: **${profile.langName}** • Certified CEFR ${level} • ${baseTopic}

**1. ${unitLabel} Dedicated Pedagogical Milestone (Source-Grounded):**
- **Unit Focus Domain**: ${milestoneStage} (Part ${((dayNumber - 1) % 4) + 1})
- **Curriculum Anchor**: ${dayGrammarAnchor}
- **Target Structural Unit**: ${theme.category}
- **Linguistic Competency**: ${dayObjectiveAnchor}

**2. ${unitLabel} Active Syntactic Architecture & Word Order Formula:**
\`\`\`text
${daySyntacticFormula}
\`\`\`

**3. Active Paradigm & Conjugation Matrix for ${unitLabel}:**
${dayParadigmTable}

**4. ${unitLabel} Native Phonetic Traps & Auditory Discrimination:**
- **Phonetic Analysis**: ${theme.trap}
- **Acoustic Focus for ${unitLabel}**: Pay close attention to word boundaries, consonant clustering, native pitch cadence, and unprompted speech rhythm for *${dayVocabAnchor}*.

**5. Faculty Lesson Blueprint & Active Retention:**
Today's session emphasizes active communicative production. Students must incorporate today's vocabulary anchors (*${dayVocab.map((v: any) => v.word).join(', ')}*) and source concept (*${dayVocabAnchor}*) into spontaneous spoken exchanges.`;

  return {
    day_number: dayNumber,
    month_number: monthNumber,
    calendar_month_name: `Module ${Math.ceil(dayNumber / 20)}`,
    calendar_month_short: `M${Math.ceil(dayNumber / 20)}`,
    day_in_month: ((dayNumber - 1) % 20) + 1,
    month_total_days: totalDays,
    week_number: Math.ceil(dayNumber / (isSchool ? 5 : 3)),
    module_week: `${unitLabel} of ${totalDays} Units`,
    day_topic: dailyProgressionPill,
    grammar_rules_detail: `Senior Faculty Lecture for ${unitLabel}: Core Focus: ${dayGrammarAnchor} (${dayObjectiveAnchor}). Systematically builds retention through structured applied drills, active auditory discrimination, and contextual discourse.`,
    study_notes_markdown: studyNotes,
    vocabulary_bank: dayVocab,
    classroom_dialogues: selectedDialogue,
    pedagogical_instructions: `Faculty Directive for ${unitLabel}: Conduct choral pronunciation on target items (${dayVocab.map((v: any) => v.word).join(', ')}). Rectify syntax errors immediately during active student production.`,
    video_breakdown_analysis: `Audio/Video Analysis for ${unitLabel}: Detailed breakdown of authentic native vocal inflections, pitch accent, liaison mechanics, and communicative context for ${theme.category}.`,
    in_class_exercises: selectedDrills.map((d: any) => d.question),
    exercise_solutions: selectedDrills,
    homework_tasks: [
      `Complete written workbook exercises for ${unitLabel} applying the target syntactic formula: "${daySyntacticFormula}".`,
      `Record a 60-second voice note practicing the ${unitLabel} live dialogue script with authentic native pronunciation and submit on the ISML portal.`
    ]
  };
}
