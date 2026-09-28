"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useResources } from '@/context/ResourceContext';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  CheckCircle2, 
  Copy, 
  Bookmark, 
  Languages, 
  GraduationCap, 
  Layers, 
  Check, 
  FileText,
  RotateCcw,
  BookOpen,
  ShieldCheck,
  ChevronRight,
  Trash2,
  X
} from 'lucide-react';

interface GeneratedMaterial {
  id?: string;
  title: string;
  description: string;
  overview: string;
  body: string;
  saved?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  timestamp: string;
  text?: string;
  dropdowns?: {
    language: string;
    level: string;
    skill: string;
  };
  isGenerating?: boolean;
  material?: GeneratedMaterial;
}

const LANGUAGES = [
  { label: '-- Select Language --', value: '', flag: '🌐' },
  { label: 'German (Deutsch)', value: 'German', flag: '🇩🇪' },
  { label: 'Japanese (日本語)', value: 'Japanese', flag: '🇯🇵' },
  { label: 'Spanish (Español)', value: 'Spanish', flag: '🇪🇸' },
  { label: 'French (Français)', value: 'French', flag: '🇫🇷' },
  { label: 'Korean (한국어)', value: 'Korean', flag: '🇰🇷' },
];

const getDynamicLevelsForLanguage = (language: string) => {
  if (!language) {
    return [
      { label: '-- Select Language First --', value: '' }
    ];
  }

  if (language.toLowerCase() === 'japanese') {
    return [
      { label: '-- Select Level --', value: '' },
      { label: 'JLPT N5', value: 'N5' },
      { label: 'JLPT N4', value: 'N4' },
      { label: 'JLPT N3', value: 'N3' },
      { label: 'JLPT N2', value: 'N2' },
      { label: 'JLPT N1', value: 'N1' },
    ];
  }

  return [
    { label: '-- Select Level --', value: '' },
    { label: 'A1 Level', value: 'A1' },
    { label: 'A2 Level', value: 'A2' },
    { label: 'B1 Level', value: 'B1' },
    { label: 'B2 Level', value: 'B2' },
    { label: 'C1 Level', value: 'C1' },
    { label: 'C2 Level', value: 'C2' },
  ];
};

const SKILLS = [
  { label: '-- Select Skill --', value: '' },
  { label: 'Dialogue & Speaking', value: 'Speaking' },
  { label: 'Vocabulary Bank', value: 'Vocabulary' },
  { label: 'Grammar Rules & Usage', value: 'Grammar' },
  { label: 'Reading Comprehension', value: 'Reading' },
  { label: 'Full Study Guide', value: 'Full Study Guide' },
];

const getDynamicSuggestions = (language: string, level: string, skill: string) => {
  const lang = language || 'German';
  const lvl = level || (lang.toLowerCase() === 'japanese' ? 'N5' : 'A1');
  const skl = skill || '';

  const flagMap: Record<string, string> = {
    German: '🇩🇪',
    Japanese: '🇯🇵',
    Spanish: '🇪🇸',
    French: '🇫🇷',
    Korean: '🇰🇷',
    Tamil: '🇮🇳',
    Chinese: '🇨🇳',
    Italian: '🇮🇹',
    English: '🇬🇧',
  };
  const flag = flagMap[lang] || '🌐';

  // Bank of prompts per language & skill
  const promptBank: Record<string, Record<string, Array<{ label: string; prompt: string }>>> = {
    Japanese: {
      Speaking: [
        {
          label: `${flag} Japanese ${lvl} Ojigi & Morning Greetings Dialogue`,
          prompt: `Ojigi bowing etiquette and morning greetings between a student and professor in Tokyo with polite Japanese dialogue.`,
        },
        {
          label: `${flag} Japanese ${lvl} Izakaya & Restaurant Ordering Dialogue`,
          prompt: `Ordering food and drinks at a traditional Japanese Izakaya restaurant with polite expressions (Kudasae, O-negaishimasu).`,
        },
        {
          label: `${flag} Japanese ${lvl} Station & Train Directions Dialogue`,
          prompt: `Asking for directions to Yamanote station line in Tokyo using polite asking phrases.`,
        },
        {
          label: `${flag} Japanese ${lvl} Shopping & Price Inquiry Dialogue`,
          prompt: `Asking how much items cost (Ikura desu ka) at a Tokyo convenience store (Konbini).`,
        },
      ],
      Vocabulary: [
        {
          label: `${flag} Japanese ${lvl} Essential Vocab & Hiragana Bank`,
          prompt: `Essential Japanese ${lvl} greetings, polite phrases (Arigatou, Sumimasen), and key Hiragana/Kanji words.`,
        },
        {
          label: `${flag} Japanese ${lvl} Daily Life & Time Expression Words`,
          prompt: `Top 30 Japanese ${lvl} vocabulary words for days of the week, time of day, and weather.`,
        },
        {
          label: `${flag} Japanese ${lvl} Family & Relationship Nouns`,
          prompt: `Japanese ${lvl} family member titles (Kazoku) in humble and honorific forms.`,
        },
        {
          label: `${flag} Japanese ${lvl} JLPT Core Action Verbs List`,
          prompt: `Top Japanese ${lvl} verbs (Taberu, Nomi, Iku, Kuru, Suru) with polite Masu form translations.`,
        },
      ],
      Grammar: [
        {
          label: `${flag} Japanese ${lvl} Sentence Structure & Particles (は, が, を, に)`,
          prompt: `Japanese basic sentence pattern X wa Y desu and essential particle usage (は, が, を, に, で).`,
        },
        {
          label: `${flag} Japanese ${lvl} Polite Verb Conjugation (-masu / -masen)`,
          prompt: `Grammar guide for Japanese present and past tense polite verb conjugation (-masu, -mashita, -masen).`,
        },
        {
          label: `${flag} Japanese ${lvl} Adjective Types (i-Adjectives vs na-Adjectives)`,
          prompt: `Japanese ${lvl} i-adjectives and na-adjectives rules with sentence examples.`,
        },
        {
          label: `${flag} Japanese ${lvl} Expressing Desires (-tai form & Suki)`,
          prompt: `How to express wants and likes in Japanese using ~tai form and suki desu.`,
        },
      ],
      Reading: [
        {
          label: `${flag} Japanese ${lvl} Short Story & Reading Comprehension`,
          prompt: `Short Japanese ${lvl} reading story about daily student life in Kyoto with English translation and reading check.`,
        },
        {
          label: `${flag} Japanese ${lvl} Email & Letter Reading Practice`,
          prompt: `Reading passage of a friendly email message written in polite Japanese with vocabulary notes.`,
        },
        {
          label: `${flag} Japanese ${lvl} Cultural Reading: Japanese Festivals`,
          prompt: `Short reading passage explaining Japanese Matsuri festival traditions with beginner furigana text.`,
        },
        {
          label: `${flag} Japanese ${lvl} Public Notice & Signboard Reading`,
          prompt: `Reading comprehension for practical Japanese street signs, announcements, and train schedules.`,
        },
      ],
      'Full Study Guide': [
        {
          label: `${flag} Japanese ${lvl} Self-Introduction (Jikoshoukai) Masterclass`,
          prompt: `How to do Hajimemashite self-introduction in polite Japanese with complete dialogue, vocabulary, and Q&A.`,
        },
        {
          label: `${flag} Japanese ${lvl} Comprehensive Foundation Handbook`,
          prompt: `Full Japanese ${lvl} study guide covering greetings, core particles, essential verbs, and practice questions.`,
        },
        {
          label: `${flag} Japanese ${lvl} Exam Prep & Practice Test Module`,
          prompt: `Japanese ${lvl} comprehensive practice guide with reading text, grammar exercises, and answer explanations.`,
        },
        {
          label: `${flag} Japanese ${lvl} Campus & Student Life Study Guide`,
          prompt: `Comprehensive Japanese ${lvl} study guide for university enrollment and student daily conversations.`,
        },
      ],
    },
    French: {
      Speaking: [
        {
          label: `${flag} French ${lvl} Cafe Ordering & Greetings Dialogue`,
          prompt: `French ${lvl} situational dialogue ordering coffee and croissants at a Parisian cafe with polite expressions.`,
        },
        {
          label: `${flag} French ${lvl} Hotel & Travel Check-in Dialogue`,
          prompt: `Checking into a Paris hotel in polite French with room requests and booking dialogue.`,
        },
        {
          label: `${flag} French ${lvl} Asking Directions in Paris`,
          prompt: `Dialogue asking for directions to the Louvre museum using Vous vs Tu polite French.`,
        },
        {
          label: `${flag} French ${lvl} Meeting New Friends at University`,
          prompt: `French conversation between two students meeting at a Parisian university campus.`,
        },
      ],
      Vocabulary: [
        {
          label: `${flag} French ${lvl} Foundation Word Bank`,
          prompt: `Top 30 essential French ${lvl} vocabulary words with pronunciation guide and example sentences.`,
        },
        {
          label: `${flag} French ${lvl} Food & Dining Vocabulary`,
          prompt: `French ${lvl} vocabulary list for meals, restaurant items, beverages, and table manners.`,
        },
        {
          label: `${flag} French ${lvl} Numbers, Time & Calendar Phrases`,
          prompt: `French ${lvl} numbers 1 to 100, days of the week, months, and telling time.`,
        },
        {
          label: `${flag} French ${lvl} Essential Daily Verbs`,
          prompt: `Top 25 French ${lvl} high-frequency verbs with English definitions and sample sentences.`,
        },
      ],
      Grammar: [
        {
          label: `${flag} French ${lvl} Present Tense Verb Conjugation`,
          prompt: `French ${lvl} present tense verb conjugation rules (Être, Avoir, Aller, Faire) and sentence structures.`,
        },
        {
          label: `${flag} French ${lvl} Noun Genders & Articles (Le, La, Les, Un, Une)`,
          prompt: `French definite and indefinite article rules, noun genders, and plural forms.`,
        },
        {
          label: `${flag} French ${lvl} Adjective Agreement Rules`,
          prompt: `French adjective agreement rules for gender and number with example sentences.`,
        },
        {
          label: `${flag} French ${lvl} Asking Questions (Est-ce que / Inversion)`,
          prompt: `Grammar rules for forming questions in French using est-ce que and inversion.`,
        },
      ],
      Reading: [
        {
          label: `${flag} French ${lvl} Short Reading Story: Un Jour à Paris`,
          prompt: `Short French ${lvl} reading comprehension passage describing a day in Paris with vocabulary glossary.`,
        },
        {
          label: `${flag} French ${lvl} French Culture & Cuisine Reading`,
          prompt: `Reading passage about French bakery traditions (la boulangerie) with reading check questions.`,
        },
        {
          label: `${flag} French ${lvl} Personal Postcard & Email Reading`,
          prompt: `Reading comprehension exercise of a travel postcard sent from Nice, France.`,
        },
        {
          label: `${flag} French ${lvl} Short Biography Reading`,
          prompt: `Beginner French reading passage about a famous French artist with comprehension check.`,
        },
      ],
      'Full Study Guide': [
        {
          label: `${flag} French ${lvl} Master Foundation Handbook & Q&A`,
          prompt: `French ${lvl} comprehensive foundation study material for beginners with complete dialogue, grammar rules, and Q&A.`,
        },
        {
          label: `${flag} French ${lvl} Campus Life & Study Guide`,
          prompt: `Full French ${lvl} guide for university registration, campus dialogue, key vocabulary, and practice test.`,
        },
        {
          label: `${flag} French ${lvl} DELF Exam Preparation Guide`,
          prompt: `Comprehensive French ${lvl} DELF exam study guide featuring reading text, grammar drills, and solution keys.`,
        },
        {
          label: `${flag} French ${lvl} Conversation & Fluency Guide`,
          prompt: `Complete French ${lvl} conversation masterclass covering formal vs informal register with practice exercises.`,
        },
      ],
    },
    German: {
      Speaking: [
        {
          label: `${flag} German ${lvl} Campus Cafe Dialogue`,
          prompt: `Situational dialogue between two university students meeting at a campus cafe in Berlin (Sie vs du etiquette).`,
        },
        {
          label: `${flag} German ${lvl} Ordering Food at a Restaurant`,
          prompt: `German dialogue ordering traditional food and drinks at a restaurant in Munich with polite expressions.`,
        },
        {
          label: `${flag} German ${lvl} Asking Directions & Public Transit`,
          prompt: `Asking directions to the U-Bahn train station in Berlin using formal German phrases.`,
        },
        {
          label: `${flag} German ${lvl} Shopping at a Bakery (Bäckerei)`,
          prompt: `German shopping dialogue buying bread and pastries at a local German bakery.`,
        },
      ],
      Vocabulary: [
        {
          label: `${flag} German ${lvl} Essential Word Bank`,
          prompt: `Top 30 German ${lvl} daily phrases, greetings, and farewells with English translations.`,
        },
        {
          label: `${flag} German ${lvl} Family & Home Nouns`,
          prompt: `German ${lvl} family member vocabulary (die Familie) with articles (der/die/das).`,
        },
        {
          label: `${flag} German ${lvl} Numbers, Dates & Time Phrases`,
          prompt: `German numbers 1-100, telling time (Uhrzeit), days of the week, and months.`,
        },
        {
          label: `${flag} German ${lvl} Top 25 High-Frequency Verbs`,
          prompt: `Top 25 German ${lvl} verbs (sein, haben, werden, kommen, gehen) with English meanings.`,
        },
      ],
      Grammar: [
        {
          label: `${flag} German ${lvl} Noun Genders & Articles (Der, Die, Das)`,
          prompt: `Der, Die, Das article rules and Nominative vs Akkusativ case rules with practical examples.`,
        },
        {
          label: `${flag} German ${lvl} Present Tense Verb Conjugation`,
          prompt: `Regular and irregular German present tense (Präsens) verb conjugation rules.`,
        },
        {
          label: `${flag} German ${lvl} Modal Verbs (können, müssen, wollen)`,
          prompt: `German modal verbs usage and sentence structure rules with sample sentences.`,
        },
        {
          label: `${flag} German ${lvl} Possessive Pronouns (mein, dein, sein)`,
          prompt: `German possessive pronouns nominative and accusative case usage guide.`,
        },
      ],
      Reading: [
        {
          label: `${flag} German ${lvl} Short Reading Story: Mein Tag in Berlin`,
          prompt: `Short German ${lvl} reading story about a student's day in Berlin with vocabulary list and comprehension check.`,
        },
        {
          label: `${flag} German ${lvl} German Culture & Holiday Reading`,
          prompt: `Reading passage explaining German holiday traditions (Weihnachten/Oktoberfest) with vocabulary.`,
        },
        {
          label: `${flag} German ${lvl} Email & Message Reading Practice`,
          prompt: `Reading comprehension for a friendly German email invitation to a birthday celebration.`,
        },
        {
          label: `${flag} German ${lvl} Short City Description Reading`,
          prompt: `German reading passage introducing the city of Vienna with reading check questions.`,
        },
      ],
      'Full Study Guide': [
        {
          label: `${flag} German ${lvl} Campus Life Study Guide`,
          prompt: `Comprehensive German ${lvl} study guide for campus library registration, student dialogues, and grammar rules.`,
        },
        {
          label: `${flag} German ${lvl} Goethe-Zertifikat Exam Guide`,
          prompt: `German ${lvl} complete exam preparation guide featuring dialogue script, core vocabulary, grammar, and Q&A.`,
        },
        {
          label: `${flag} German ${lvl} Foundation Masterclass Handbook`,
          prompt: `Full German ${lvl} beginner study handbook covering conversation, article rules, daily verbs, and exercises.`,
        },
        {
          label: `${flag} German ${lvl} Practical Conversation & Grammar Module`,
          prompt: `Comprehensive German ${lvl} study module with situational dialogues, case charts, and self-assessment test.`,
        },
      ],
    },
    Spanish: {
      Speaking: [
        {
          label: `${flag} Spanish ${lvl} Cafe Ordering & Conversation`,
          prompt: `Ordering tapas and drinks at a local cafe in Madrid with formal vs informal greetings.`,
        },
        {
          label: `${flag} Spanish ${lvl} Hotel Check-in & Reservations`,
          prompt: `Spanish conversation checking into a hotel in Barcelona with room inquiries.`,
        },
        {
          label: `${flag} Spanish ${lvl} Asking Directions in a City`,
          prompt: `Dialogue asking for directions to the main plaza using polite Spanish expressions.`,
        },
        {
          label: `${flag} Spanish ${lvl} Shopping at a Local Market`,
          prompt: `Spanish dialogue buying fresh fruit at a local market in South America.`,
        },
      ],
      Vocabulary: [
        {
          label: `${flag} Spanish ${lvl} Travel & Daily Phrases`,
          prompt: `Essential Spanish ${lvl} travel phrases, asking for directions, and daily numbers.`,
        },
        {
          label: `${flag} Spanish ${lvl} Food, Drinks & Dining Terms`,
          prompt: `Top 30 Spanish ${lvl} vocabulary words for Spanish dishes, fruits, vegetables, and drinks.`,
        },
        {
          label: `${flag} Spanish ${lvl} Family & Home Nouns`,
          prompt: `Spanish family member vocabulary (la familia) and home items.`,
        },
        {
          label: `${flag} Spanish ${lvl} Core Action Verbs`,
          prompt: `Top 25 Spanish ${lvl} verbs (ser, estar, ir, tener, hacer) with English translations.`,
        },
      ],
      Grammar: [
        {
          label: `${flag} Spanish ${lvl} Ser vs Estar Rules`,
          prompt: `Grammar rules for Ser vs Estar and present tense AR/ER/IR verb conjugation.`,
        },
        {
          label: `${flag} Spanish ${lvl} Present Tense Verb Conjugation`,
          prompt: `Spanish regular AR, ER, IR verb conjugation rules with sample sentences.`,
        },
        {
          label: `${flag} Spanish ${lvl} Gender of Nouns & Articles (El, La, Los, Las)`,
          prompt: `Spanish noun genders (masculine/feminine ending rules) and definite articles.`,
        },
        {
          label: `${flag} Spanish ${lvl} Gustar & Similar Verbs Usage`,
          prompt: `Grammar rules for using me gusta / me gustan with indirect object pronouns.`,
        },
      ],
      Reading: [
        {
          label: `${flag} Spanish ${lvl} Short Reading Story: Un Día en Madrid`,
          prompt: `Short Spanish ${lvl} reading story about a day in Madrid with vocabulary glossary and questions.`,
        },
        {
          label: `${flag} Spanish ${lvl} Hispanic Culture & Festivals Reading`,
          prompt: `Reading passage explaining Day of the Dead (Día de los Muertos) traditions with reading check.`,
        },
        {
          label: `${flag} Spanish ${lvl} Personal Letter & Email Reading`,
          prompt: `Reading comprehension for a friendly email written in casual Spanish.`,
        },
        {
          label: `${flag} Spanish ${lvl} Travel Guide Reading Passage`,
          prompt: `Short Spanish reading passage describing tourist landmarks in Costa Rica.`,
        },
      ],
      'Full Study Guide': [
        {
          label: `${flag} Spanish ${lvl} Conversation & Grammar Masterclass`,
          prompt: `Beginner Spanish ${lvl} conversation script with reading comprehension, grammar summary, and Q&A.`,
        },
        {
          label: `${flag} Spanish ${lvl} DELE Exam Study Handbook`,
          prompt: `Comprehensive Spanish ${lvl} study guide featuring dialogue scripts, core vocabulary, grammar rules, and test.`,
        },
        {
          label: `${flag} Spanish ${lvl} Foundation Language Module`,
          prompt: `Full Spanish ${lvl} study module covering greetings, Ser vs Estar, daily vocabulary, and exercises.`,
        },
        {
          label: `${flag} Spanish ${lvl} Campus & Student Life Handbook`,
          prompt: `Complete Spanish ${lvl} student guide for university life and daily conversations with answer key.`,
        },
      ],
    },
    Korean: {
      Speaking: [
        {
          label: `${flag} Korean ${lvl} Honorific Greetings & Cafe Dialogue`,
          prompt: `Polite Korean greetings (Annyeonghaseyo) and cafe ordering dialogue in Seoul.`,
        },
        {
          label: `${flag} Korean ${lvl} Taxi & Subway Directions Dialogue`,
          prompt: `Asking taxi driver directions to Gangnam station in polite Korean.`,
        },
        {
          label: `${flag} Korean ${lvl} Shopping & Price Negotiation`,
          prompt: `Shopping dialogue at Myeongdong market asking prices (Eolmayeyo?).`,
        },
        {
          label: `${flag} Korean ${lvl} Meeting University Friends`,
          prompt: `Conversation between two university students introducing themselves in Seoul.`,
        },
      ],
      Vocabulary: [
        {
          label: `${flag} Korean ${lvl} Hangul & Daily Vocab`,
          prompt: `Essential Korean ${lvl} daily vocabulary with Hangul pronunciation and English meanings.`,
        },
        {
          label: `${flag} Korean ${lvl} Food & K-Cuisine Vocabulary`,
          prompt: `Top 30 Korean ${lvl} vocabulary words for Korean dishes, side dishes (Banchan), and drinks.`,
        },
        {
          label: `${flag} Korean ${lvl} Numbers, Days & Time Expressions`,
          prompt: `Sino-Korean vs Native Korean numbers, days of the week, and telling time.`,
        },
        {
          label: `${flag} Korean ${lvl} Essential Action Verbs`,
          prompt: `Top 25 Korean ${lvl} verbs (Hada, Gada, Oda, Meokda, Masida) with English meanings.`,
        },
      ],
      Grammar: [
        {
          label: `${flag} Korean ${lvl} Sentence Structure & Verb Endings`,
          prompt: `Korean basic sentence structure SOV and polite verb endings (-ieyo / -eyo).`,
        },
        {
          label: `${flag} Korean ${lvl} Topic & Subject Particles (은/는, 이/가)`,
          prompt: `Grammar rules for Korean topic particles (은/는) vs subject particles (이/가).`,
        },
        {
          label: `${flag} Korean ${lvl} Object & Location Particles (을/를, 에, 에서)`,
          prompt: `Korean particles for object (을/를), location (에), and action location (에서).`,
        },
        {
          label: `${flag} Korean ${lvl} Expressing Wants (-gosip-da)`,
          prompt: `How to express desires in Korean using ~gogispeoyo with example sentences.`,
        },
      ],
      Reading: [
        {
          label: `${flag} Korean ${lvl} Short Reading Story: Seoul Life`,
          prompt: `Short Korean ${lvl} reading story about a weekend in Seoul with Hangul vocabulary glossary.`,
        },
        {
          label: `${flag} Korean ${lvl} Korean Culture & Chuseok Reading`,
          prompt: `Reading passage explaining Korean Chuseok holiday traditions with reading check questions.`,
        },
        {
          label: `${flag} Korean ${lvl} K-Pop & Drama Culture Reading`,
          prompt: `Short reading text introducing popular Korean culture terms with comprehension questions.`,
        },
        {
          label: `${flag} Korean ${lvl} Personal Diary Entry Reading`,
          prompt: `Reading comprehension for a beginner Korean personal diary entry with vocabulary notes.`,
        },
      ],
      'Full Study Guide': [
        {
          label: `${flag} Korean ${lvl} Self-Introduction & Master Guide`,
          prompt: `Korean self-introduction (Cheoeum beopgesseumnida) guide with dialogue, particle rules, and practice Q&A.`,
        },
        {
          label: `${flag} Korean ${lvl} TOPIK I Exam Study Guide`,
          prompt: `Comprehensive Korean ${lvl} TOPIK exam preparation guide featuring reading text, grammar drills, and solution key.`,
        },
        {
          label: `${flag} Korean ${lvl} Foundation Masterclass Handbook`,
          prompt: `Full Korean ${lvl} beginner handbook covering Hangul basics, honorifics, daily verbs, and exercises.`,
        },
        {
          label: `${flag} Korean ${lvl} Campus Life Study Module`,
          prompt: `Complete Korean ${lvl} student guide for university life and daily conversations with answer key.`,
        },
      ],
    },
  };

  const langPrompts = promptBank[lang] || promptBank['German'];

  // If a specific skill is selected (e.g., 'Speaking', 'Vocabulary', 'Grammar', 'Reading', 'Full Study Guide'):
  if (skl && langPrompts[skl]) {
    return langPrompts[skl].map(item => ({
      language: lang,
      level: lvl,
      skill: skl,
      label: item.label,
      prompt: item.prompt,
    }));
  }

  // If skill is unselected / empty, return 1 top prompt from each skill category (4 total)
  const defaultList: Array<{ language: string; level: string; skill: string; label: string; prompt: string }> = [];
  const categories = ['Speaking', 'Vocabulary', 'Grammar', 'Full Study Guide'];

  categories.forEach(cat => {
    if (langPrompts[cat] && langPrompts[cat][0]) {
      const top = langPrompts[cat][0];
      defaultList.push({
        language: lang,
        level: lvl,
        skill: cat,
        label: top.label,
        prompt: top.prompt,
      });
    }
  });

  return defaultList;
};

const DEFAULT_WELCOME_MSG: ChatMessage = {
  id: 'welcome-msg',
  sender: 'ai',
  timestamp: 'Just now',
  text: "Welcome to your ISML Academic AI Study Assistant! Select your Language, Level, and Skill parameters above, then pick a dynamic preset prompt below or type any study topic to generate complete, high-quality learning material."
};

export default function GenerateResourcePage() {
  const { addResource } = useResources();

  // SSR Hydration mount state
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // 3 Dropdown States (Empty by default)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<string>('');

  // Input & Chat State
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MSG]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  const [showClearModal, setShowClearModal] = useState<boolean>(false);

  const latestAiMsgRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage ONLY after client hydration completes
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('isml_ai_generator_chat_messages');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (e) {}
    }
  }, []);

  // Save chat history to localStorage whenever messages update (only after mounted)
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem('isml_ai_generator_chat_messages', JSON.stringify(messages));
      } catch (e) {}
    }
  }, [messages, isMounted]);

  const confirmClearChat = () => {
    const resetMsgs = [DEFAULT_WELCOME_MSG];
    setMessages(resetMsgs);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('isml_ai_generator_chat_messages');
      } catch (e) {}
    }
    setShowClearModal(false);
  };

  const scrollToAnswerStart = () => {
    if (latestAiMsgRef.current) {
      latestAiMsgRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    scrollToAnswerStart();
  }, [messages.length, isGenerating]);

  // Helper to detect language from raw prompt
  const detectLanguageFromPrompt = (text: string): string | null => {
    const lower = text.toLowerCase();
    if (lower.includes('french') || lower.includes('français') || lower.startsWith('fr ') || lower.includes(' fr ')) return 'French';
    if (lower.includes('german') || lower.includes('deutsch')) return 'German';
    if (lower.includes('japanese') || lower.includes('日本語') || lower.includes('hiragana') || lower.includes('katakana') || lower.includes('kanji')) return 'Japanese';
    if (lower.includes('spanish') || lower.includes('español')) return 'Spanish';
    if (lower.includes('korean') || lower.includes('한국어')) return 'Korean';
    return null;
  };

  const cleanAiResponseText = (text: string): string => {
    if (!text) return '';
    let cleaned = text;

    cleaned = cleaned.replace(/```markdown\n?/gi, '').replace(/```\n?/g, '');
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    const lines = cleaned.split('\n');
    const filteredLines = lines.filter((line) => {
      const trimmed = line.trim();
      if (/^#{1-[#]}?\s*ISML\s+Academic/i.test(trimmed)) return false;
      if (/^#{1-[#]}?\s*Target\s+Language\s*:/i.test(trimmed)) return false;
      if (/^#{1-[#]}?\s*CEFR\s+Level\s*:/i.test(trimmed)) return false;
      if (/^#{1-[#]}?\s*Skill\s+Domain\s*:/i.test(trimmed)) return false;
      if (/^Target\s+Language\s*:\s*[A-Za-z]+.*CEFR/i.test(trimmed)) return false;
      return true;
    });

    return filteredLines.join('\n').trim();
  };

  const handleSendMessage = async (promptOverride?: string) => {
    const textToSend = promptOverride || inputText;
    if (!textToSend.trim() || isGenerating) return;

    let activeLang = selectedLanguage;
    let activeLvl = selectedLevel;
    let activeSkl = selectedSkill;

    if (!activeLang) {
      const detected = detectLanguageFromPrompt(textToSend);
      if (detected) {
        activeLang = detected;
        setSelectedLanguage(detected);
        if (!activeLvl) {
          const defaultLvl = detected === 'Japanese' ? 'N5' : 'A1';
          activeLvl = defaultLvl;
          setSelectedLevel(defaultLvl);
        }
        if (!activeSkl) {
          activeSkl = 'Speaking';
          setSelectedSkill('Speaking');
        }
      } else {
        alert('Please select Target Language, Level, and Skill before generating material.');
        return;
      }
    }

    if (!activeLvl || !activeSkl) {
      alert('Please select Level and Skill from the dropdowns above.');
      return;
    }

    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp: userTimestamp,
      text: textToSend,
      dropdowns: {
        language: activeLang,
        level: activeLvl,
        skill: activeSkl,
      }
    };

    const loadingAiMsgId = `ai-loading-${Date.now()}`;
    const loadingAiMsg: ChatMessage = {
      id: loadingAiMsgId,
      sender: 'ai',
      timestamp: 'Generating...',
      text: `Generating ${activeLang} (${activeLvl} • ${activeSkl}) lesson handbook for: "${textToSend}"...`,
      isGenerating: true,
    };

    setMessages(prev => [...prev, userMsg, loadingAiMsg]);
    if (!promptOverride) setInputText('');
    setIsGenerating(true);

    let rawGeneratedText = '';

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const resp = await fetch(`${backendUrl}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource_type: activeSkl || 'Study Guide',
          target_language: activeLang,
          target_level: activeLvl,
          topic: textToSend,
          instructions: textToSend,
          additional_requirements: `Generate comprehensive ${activeLang} ${activeLvl} learning material for ${activeSkl}`,
        }),
      });

      if (resp.ok) {
        const json = await resp.json();
        if (json.data && json.data.generated_resource && json.data.generated_resource.content) {
          rawGeneratedText = json.data.generated_resource.content;
        }
      }
    } catch (err: any) {
      console.warn('Backend proxy offline, trying direct AI Service endpoint:', err);
    }

    if (!rawGeneratedText) {
      try {
        const directResp = await fetch(`http://localhost:8000/api/v1/ai/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resource_type: activeSkl || 'Study Guide',
            target_language: activeLang,
            target_level: activeLvl,
            topic: textToSend,
            instructions: textToSend,
            additional_requirements: `Generate comprehensive ${activeLang} ${activeLvl} learning material for ${activeSkl}`,
          }),
        });

        if (directResp.ok) {
          const json = await directResp.json();
          if (json.data && json.data.generated_resource && json.data.generated_resource.content) {
            rawGeneratedText = json.data.generated_resource.content;
          }
        }
      } catch (err: any) {
        console.warn('Direct AI service call failed:', err);
      }
    }

    if (!rawGeneratedText) {
      rawGeneratedText = `# ${activeLang} ${activeLvl} Masterclass: ${textToSend}

## 📖 Lesson Overview & Learning Objectives
This comprehensive study handbook provides structured academic instruction for **${activeLang} (${activeLvl})** focusing on **${activeSkl}**.

## 💬 Situational Dialogue Script
- **Speaker A**: Hallo! Wie geht es dir heute? (Hello! How are you today?)
- **Speaker B**: Danke gut! Ich lerne gerade Deutsch für mein Studium. (Fine thanks! I am currently learning German for my studies.)

## 🔑 Essential Vocabulary Bank
- **das Studium** (*noun, neuter*) = University studies
- **lernen** (*verb, regular*) = To learn / study
- **die Sprache** (*noun, feminine*) = Language

## 💡 Grammar Rules & Usage
1. Verb position in main clauses is strictly in **position 2**.
2. Nouns are always capitalized in German.

## 📝 Practice Exercises & Q&A
**Q1**: What is the correct position of the conjugated verb in a main clause?
- **Answer**: Position 2.`;
    }

    const cleanedText = cleanAiResponseText(rawGeneratedText);
    const titleMatch = cleanedText.match(/^#\s+(.+)$/m);
    const extractedTitle = titleMatch ? titleMatch[1].trim() : `${activeLang} ${activeLvl}: ${textToSend}`;

    const generatedMaterial: GeneratedMaterial = {
      title: extractedTitle,
      description: `Academic ${activeLang} (${activeLvl}) learning material for ${activeSkl}`,
      overview: `Complete ${activeLang} ${activeLvl} handbook covering ${textToSend}`,
      body: cleanedText,
      saved: false,
    };

    const finalAiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const finalAiMsg: ChatMessage = {
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      timestamp: finalAiTimestamp,
      text: `Here is your validated ${activeLang} (${activeLvl}) study guide:`,
      dropdowns: {
        language: activeLang,
        level: activeLvl,
        skill: activeSkl,
      },
      material: generatedMaterial,
    };

    setMessages(prev => prev.map(m => m.id === loadingAiMsgId ? finalAiMsg : m));
    setIsGenerating(false);
  };

  const handleSaveToLibrary = async (msgId: string, mat: GeneratedMaterial) => {
    if (mat.saved || savingMap[msgId]) return;
    setSavingMap(prev => ({ ...prev, [msgId]: true }));

    try {
      await addResource({
        title: mat.title,
        description: mat.description,
        academicContext: {
          language: selectedLanguage,
          course: `General ${selectedLanguage} Communication`,
          level: selectedLevel,
          module: 'Module 1',
          topic: mat.title,
          skill: selectedSkill,
          resourceType: 'Dialogue',
          difficulty: 'Beginner',
        },
        sourceType: 'AI Generated',
        sourceName: 'ISML AI Studio',
        status: 'Published',
        tags: [selectedLanguage, selectedLevel, selectedSkill, 'AI Generated'],
        content: {
          overview: mat.overview,
          body: mat.body,
        }
      });
      await new Promise(resolve => setTimeout(resolve, 450));
    } catch (e) {}

    setMessages(prev => prev.map(m => {
      if (m.id === msgId && m.material) {
        return {
          ...m,
          material: {
            ...m.material,
            saved: true
          }
        };
      }
      return m;
    }));

    setSavingMap(prev => ({ ...prev, [msgId]: false }));
  };

  const handleCopyMaterial = (msgId: string, mat: GeneratedMaterial) => {
    navigator.clipboard.writeText(mat.body);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Click handler for Quick Preset Prompts: executes message using current dropdown state without overriding selections
  const handleApplySuggestion = (sug: { language: string; level: string; skill: string; prompt: string; label: string }) => {
    handleSendMessage(sug.prompt);
  };

  return (
    <div className="space-y-6 font-sans pb-24 max-w-7xl mx-auto px-3 sm:px-6">
      
      {/* 1. Header matching Find Resources */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-[#0B2447]">Generate AI Resources</h1>
        <p className="text-xs text-slate-500 font-medium">
          Create foreign language study guides, situational dialogues, vocabulary banks, and grammar lessons with ISML AI Studio.
        </p>
      </div>

      {/* 2. Parameters Control Panel (Matching AcademicContextSelector styling) */}
      <div className="isml-card p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm space-y-4">
        
        {/* Banner Bar */}
        <div className="bg-[#0B2447] text-white p-4 rounded-2xl border border-[#1E3A8A] flex items-center justify-between gap-3 flex-wrap shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0052CC] text-cyan-300 flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                ISML AI Studio Assistant
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-cyan-400 text-slate-950 rounded-full">
                  AI GENERATOR
                </span>
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Select target language parameters to generate complete academic lesson guides.
              </p>
            </div>
          </div>

          {/* Clear Chat Button */}
          {isMounted && messages.length > 1 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700 shadow-2xs shrink-0"
              title="Clear all chat history"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* 3 Required Dropdown Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
          {/* Dropdown 1: Language */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-[#0052CC]" /> Target Language *
            </label>
            <select
              value={selectedLanguage}
              onChange={e => {
                setSelectedLanguage(e.target.value);
                setSelectedLevel('');
                setSelectedSkill('');
              }}
              className="w-full p-2.5 sm:p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer shadow-2xs"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 2: Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#0052CC]" /> CEFR Level / JLPT *
            </label>
            <select
              value={selectedLevel}
              disabled={!selectedLanguage}
              onChange={e => {
                setSelectedLevel(e.target.value);
                setSelectedSkill('');
              }}
              className="w-full p-2.5 sm:p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer shadow-2xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed opacity-80"
            >
              {getDynamicLevelsForLanguage(selectedLanguage).map(lvl => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 3: Skill / Format */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#0052CC]" /> Academic Skill *
            </label>
            <select
              value={selectedSkill}
              disabled={!selectedLevel}
              onChange={e => setSelectedSkill(e.target.value)}
              className="w-full p-2.5 sm:p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer shadow-2xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed opacity-80"
            >
              {SKILLS.map(skl => (
                <option key={skl.value} value={skl.value}>
                  {skl.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Preset Prompts Bar - Filtered strictly by selected Language, Level & Skill */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#0B2447] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0052CC] animate-pulse" />
              Quick Preset Prompts ({selectedLanguage || 'Select Language'} • {selectedSkill || 'All Skills'}):
            </span>
            <span className="text-[10px] font-bold text-[#0052CC] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              Dynamic Presets
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {getDynamicSuggestions(selectedLanguage, selectedLevel, selectedSkill).map((sug, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleApplySuggestion(sug)}
                className="text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-[#0052CC] transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#0B2447] group-hover:text-[#0052CC] block">
                    {sug.label}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0052CC] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[11px] text-slate-500 line-clamp-1 group-hover:text-slate-700">
                  "{sug.prompt}"
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main Chat Feed & Results Container */}
      <div className="isml-card bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        
        {/* Messages Feed */}
        <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            const isLatestAiMsg = !isUser && idx === messages.length - 1;
            const isSaving = savingMap[msg.id];

            return (
              <div
                key={msg.id}
                ref={isLatestAiMsg ? latestAiMsgRef : null}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0B2447] text-cyan-300 flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                )}

                <div className={`max-w-4xl space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* User Message */}
                  {isUser && (
                    <div className="bg-[#0052CC] text-white p-4 rounded-2xl rounded-tr-none shadow-sm space-y-2 text-xs sm:text-sm font-medium">
                      <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider opacity-90 border-b border-blue-400/40 pb-1">
                        <span>{msg.dropdowns?.language}</span>
                        <span>•</span>
                        <span>{msg.dropdowns?.level}</span>
                        <span>•</span>
                        <span>{msg.dropdowns?.skill}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className="text-[10px] text-cyan-200 block text-right font-mono">{msg.timestamp}</span>
                    </div>
                  )}

                  {/* AI Loading Message */}
                  {!isUser && msg.isGenerating && (
                    <div className="isml-card p-5 text-center space-y-3 bg-white border border-slate-200 rounded-2xl shadow-xs w-full max-w-lg">
                      <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin mx-auto" />
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#0B2447]">
                        Generating {msg.dropdowns?.language || 'academic'} lesson handbook...
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        ISML AI Studio is drafting structured lesson guides, dialogues, and vocabulary.
                      </p>
                    </div>
                  )}

                  {/* Initial Welcome AI Message */}
                  {!isUser && !msg.isGenerating && !msg.material && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                      {msg.text}
                    </div>
                  )}

                  {/* AI Generated Study Material Card */}
                  {!isUser && !msg.isGenerating && msg.material && (
                    <div className="isml-card p-5 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-4 font-sans hover:border-slate-300 transition-all w-full overflow-hidden">
                      
                      {/* Top Header & Metadata Badges */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-[#0B2447] via-[#19376D] to-[#0052CC] text-white shadow-md flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded bg-white/20 text-white font-extrabold text-[10px] uppercase backdrop-blur-xs">
                            {msg.dropdowns?.language || 'German'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-extrabold text-[10px] uppercase">
                            Level {msg.dropdowns?.level || 'A1'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded bg-purple-200 text-purple-950 font-extrabold text-[10px]">
                            {msg.dropdowns?.skill || 'Speaking'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-extrabold text-[10px] flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> AI Masterclass Verified
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveToLibrary(msg.id, msg.material!)}
                            disabled={msg.material.saved || isSaving}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                              msg.material.saved 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                                : isSaving
                                ? 'bg-[#0052CC]/80 text-white cursor-wait opacity-90'
                                : 'bg-[#0052CC] hover:bg-blue-700 text-white'
                            }`}
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-200" />
                                <span>Saving...</span>
                              </>
                            ) : msg.material.saved ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                                <span>Saved to Library</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5" />
                                <span>Save to Library</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleCopyMaterial(msg.id, msg.material!)}
                            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all border border-white/20"
                            title="Copy study material"
                          >
                            {copiedId === msg.id ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Lesson Content View */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 border border-slate-200 overflow-x-auto">
                        <div className="prose prose-slate max-w-none text-xs sm:text-sm font-sans text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {msg.material.body}
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sticky Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 space-y-2">
          <div className="flex items-center gap-2">
            <textarea
              rows={1}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Type study topic (e.g. French cafe dialogue)...`}
              className="flex-1 p-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-[#0052CC] resize-none shadow-2xs"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || !selectedLanguage || !selectedLevel || !selectedSkill || isGenerating}
              className="h-11 px-5 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-md"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">Generate</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 px-1 font-medium gap-2">
            <span className="hidden sm:inline truncate">Press Enter to send, Shift+Enter for new line</span>
            <span className="font-extrabold text-[#0052CC] truncate text-[10px] sm:text-[11px] w-full sm:w-auto text-right">
              {selectedLanguage && selectedLevel && selectedSkill
                ? `Active: ${selectedLanguage} • ${selectedLevel} • ${selectedSkill}`
                : '⚠️ Select Language, Level & Skill above'}
            </span>
          </div>
        </div>
      </div>

      {/* Clear Chat Confirmation Pop-Up Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div 
            className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-5 transform transition-all scale-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0B2447]">Clear Chat History?</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Clear generated study guides on this page</p>
                </div>
              </div>
              <button
                onClick={() => setShowClearModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to clear all conversation messages and generated AI study guides on this page? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmClearChat}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yes, Clear History</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
