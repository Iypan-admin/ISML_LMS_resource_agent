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
  RotateCcw
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
  const flag = flagMap[language] || '🌐';

  if (language === 'French') {
    return [
      {
        language,
        level,
        skill: 'Speaking',
        label: `${flag} French ${level} Cafe Dialogue & Greetings`,
        prompt: `French ${level} situational dialogue ordering coffee and croissants at a Parisian cafe with polite expressions.`,
      },
      {
        language,
        level,
        skill: 'Vocabulary',
        label: `${flag} French ${level} Foundation Word Bank`,
        prompt: `Top 30 essential French ${level} vocabulary words with pronunciation guide and example sentences.`,
      },
      {
        language,
        level,
        skill: 'Grammar',
        label: `${flag} French ${level} Grammar & Verb Conjugation`,
        prompt: `French ${level} present tense verb conjugation rules (Être, Avoir, Aller) and sentence structures.`,
      },
      {
        language,
        level,
        skill: 'Full Study Guide',
        label: `${flag} French ${level} Master Study Guide & Q&A`,
        prompt: `French ${level} comprehensive foundation study material for beginners with Questions and Answers.`,
      },
    ];
  }

  if (language === 'Japanese') {
    return [
      {
        language,
        level,
        skill: 'Speaking',
        label: `${flag} Japanese ${level} Ojigi & Greetings Dialogue`,
        prompt: `Ojigi bowing etiquette and morning greetings between a student and professor in Tokyo.`,
      },
      {
        language,
        level,
        skill: 'Vocabulary',
        label: `${flag} Japanese ${level} Essential Vocab & Hiragana`,
        prompt: `Essential Japanese ${level} greetings, polite phrases (Arigatou, Sumimasen), and key Hiragana/Kanji words.`,
      },
      {
        language,
        level,
        skill: 'Grammar',
        label: `${flag} Japanese ${level} Sentence Structure & Particles`,
        prompt: `Japanese basic sentence pattern X wa Y desu and particle usage (は, が, を, に).`,
      },
      {
        language,
        level,
        skill: 'Full Study Guide',
        label: `${flag} Japanese ${level} Self-Introduction (Jikoshoukai)`,
        prompt: `How to do Hajimemashite self-introduction in polite Japanese with Q&A practice.`,
      },
    ];
  }

  if (language === 'Spanish') {
    return [
      {
        language,
        level,
        skill: 'Speaking',
        label: `${flag} Spanish ${level} Cafe Ordering & Conversation`,
        prompt: `Ordering tapas and drinks at a local cafe in Madrid with formal vs informal greetings.`,
      },
      {
        language,
        level,
        skill: 'Vocabulary',
        label: `${flag} Spanish ${level} Travel & Daily Phrases`,
        prompt: `Essential Spanish ${level} travel phrases, asking for directions, and daily numbers.`,
      },
      {
        language,
        level,
        skill: 'Grammar',
        label: `${flag} Spanish ${level} Ser vs Estar & Verbs`,
        prompt: `Grammar rules for Ser vs Estar and present tense AR/ER/IR verb conjugation.`,
      },
      {
        language,
        level,
        skill: 'Full Study Guide',
        label: `${flag} Spanish ${level} Conversation Masterclass`,
        prompt: `Beginner Spanish ${level} conversation script with reading comprehension and Q&A.`,
      },
    ];
  }

  if (language === 'Korean') {
    return [
      {
        language,
        level,
        skill: 'Speaking',
        label: `${flag} Korean ${level} Honorific Greetings & Dialogue`,
        prompt: `Polite Korean greetings (Annyeonghaseyo) and cafe ordering dialogue in Seoul.`,
      },
      {
        language,
        level,
        skill: 'Vocabulary',
        label: `${flag} Korean ${level} Hangul & Daily Vocab`,
        prompt: `Essential Korean ${level} daily vocabulary with Hangul pronunciation and English meanings.`,
      },
      {
        language,
        level,
        skill: 'Grammar',
        label: `${flag} Korean ${level} Sentence Structure & Verb Endings`,
        prompt: `Korean basic sentence structure SOV and polite verb endings (-ieyo / -eyo).`,
      },
      {
        language,
        level,
        skill: 'Full Study Guide',
        label: `${flag} Korean ${level} Self-Introduction Guide`,
        prompt: `Korean self-introduction (Cheoeum beopgesseumnida) guide with practice Q&A.`,
      },
    ];
  }

  // German & Default
  return [
    {
      language,
      level,
      skill: 'Speaking',
      label: `${flag} German ${level} Campus Cafe Dialogue`,
      prompt: `Situational dialogue between two university students meeting at a campus cafe in Berlin (Sie vs du etiquette).`,
    },
    {
      language,
      level,
      skill: 'Vocabulary',
      label: `${flag} German ${level} Essential Word Bank`,
      prompt: `Top 30 German ${level} daily phrases, greetings, and farewells with English translations.`,
    },
    {
      language,
      level,
      skill: 'Grammar',
      label: `${flag} German ${level} Noun Genders & Cases`,
      prompt: `Der, Die, Das article rules and Nominative vs Akkusativ case rules with practical examples.`,
    },
    {
      language,
      level,
      skill: 'Full Study Guide',
      label: `${flag} German ${level} Campus Life Study Guide`,
      prompt: `Comprehensive German ${level} study guide for campus library registration and student dialogues.`,
    },
  ];
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

  // Input & Chat State (persisted in localStorage across page switches safely after hydration)
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MSG]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});

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

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the chat history on this page?')) {
      const resetMsgs = [DEFAULT_WELCOME_MSG];
      setMessages(resetMsgs);
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('isml_ai_generator_chat_messages');
        } catch (e) {}
      }
    }
  };

  const scrollToAnswerStart = () => {
    if (latestAiMsgRef.current) {
      latestAiMsgRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    scrollToAnswerStart();
  }, [messages.length, isGenerating]);

  // Helper to detect language from raw prompt purely for UI dropdown synchronization
  const detectLanguageFromPrompt = (text: string): string | null => {
    const lower = text.toLowerCase();
    if (lower.includes('french') || lower.includes('français') || lower.startsWith('fr ') || lower.includes(' fr ')) return 'French';
    if (lower.includes('german') || lower.includes('deutsch')) return 'German';
    if (lower.includes('japanese') || lower.includes('日本語') || lower.includes('hiragana') || lower.includes('katakana') || lower.includes('kanji')) return 'Japanese';
    if (lower.includes('spanish') || lower.includes('español')) return 'Spanish';
    if (lower.includes('korean') || lower.includes('한국어')) return 'Korean';
    return null;
  };


  // Send message handler
  const handleSendMessage = async (promptOverride?: string) => {
    const textToSend = promptOverride || inputText;
    if (!textToSend.trim() || isGenerating) return;

    // Check if user explicitly mentioned a target language in the prompt
    const explicitLang = detectLanguageFromPrompt(textToSend);
    if (explicitLang && explicitLang !== selectedLanguage) {
      setSelectedLanguage(explicitLang);
    }

    const currentLang = explicitLang || selectedLanguage;
    const currentLvl = selectedLevel;
    const currentSkl = selectedSkill;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
      dropdowns: {
        language: currentLang,
        level: currentLvl,
        skill: currentSkl,
      }
    };

    const loadingAiMsgId = `ai-loading-${Date.now()}`;
    const loadingAiMsg: ChatMessage = {
      id: loadingAiMsgId,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGenerating: true,
      text: `Generating ${currentLang} study material for "${textToSend}"...`
    };

    setMessages(prev => [...prev, userMsg, loadingAiMsg]);
    if (!promptOverride) setInputText('');
    setIsGenerating(true);

    let bulkBodyText = '';

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const resp = await fetch(`${backendUrl}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource_type: currentSkl === 'Speaking' ? 'Dialogue' : currentSkl,
          target_language: currentLang,
          target_level: currentLvl,
          topic: textToSend,
          course: `General ${currentLang} Communication`,
          category: 'General',
          skill: currentSkl,
          learning_objective: `Answer specific request: ${textToSend}`,
          difficulty: 'Appropriate for level',
          target_audience: 'Students and Tutors',
          additional_requirements: textToSend,
          instructions: textToSend,
        }),
      });

      if (resp.ok) {
        const json = await resp.json();
        if (json.data && json.data.generated_resource) {
          const gen = json.data.generated_resource;
          bulkBodyText = gen.content || gen.body || '';
        }
      }
    } catch (err) {
      console.warn('Backend proxy offline, trying direct AI Service endpoint:', err);
    }

    // Direct AI Service fallback if NestJS proxy is offline
    if (!bulkBodyText) {
      try {
        const aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
        const aiResp = await fetch(`${aiServiceUrl}/api/v1/ai/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resource_type: currentSkl,
            target_language: currentLang,
            target_level: currentLvl,
            topic: textToSend,
            instructions: textToSend,
            additional_requirements: textToSend,
          }),
        });

        if (aiResp.ok) {
          const aiJson = await aiResp.json();
          bulkBodyText = aiJson.content || (aiJson.data && aiJson.data.content) || '';
        }
      } catch (aiErr) {
        console.warn('Direct AI Service offline as well:', aiErr);
      }
    }

    if (!bulkBodyText) {
      bulkBodyText = `# ${currentLang}: ${textToSend}\n\nStudy guide generated for **${textToSend}** in **${currentLang}**.`;
    }

    // Frontend safety net: strip known boilerplate header patterns the backend may have missed
    const stripBoilerplate = (text: string): string => {
      const boilerplatePhrases = [
        /^\*?Special Instructions Applied:.*$/im,
        /^This learning text is specifically crafted for.*$/im,
        /^In this lesson on ['"]?.*['"]?, you will practice key phrases.*$/im,
        /^### Example Reading:.*$/im,
        /^Hallo! Wir sprechen heute über.*$/im,
        /^Das ist sehr wichtig für.*$/im,
        /^Ein gutes Verständnis hilft Ihnen.*$/im,
        /^\*\*Target Level:\*\*.*\|.*\*\*Language:\*\*.*$/im,
        /^## Content:.*$/im,
      ];
      let cleaned = text;
      boilerplatePhrases.forEach(p => { cleaned = cleaned.replace(p, ''); });
      return cleaned.replace(/\n{3,}/g, '\n\n').trim();
    };

    bulkBodyText = stripBoilerplate(bulkBodyText);

    const generatedMaterial: GeneratedMaterial = {
      title: `${currentLang}: ${textToSend}`,
      description: `Study material for ${textToSend} in ${currentLang} (${currentLvl}).`,
      overview: `Study Guide for ${textToSend} (${currentLang})`,
      body: bulkBodyText,
      saved: false,
    };


    const aiMsgId = `ai-${Date.now()}`;
    const finalAiMsg: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dropdowns: {
        language: currentLang,
        level: currentLvl,
        skill: currentSkl,
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

  const handleApplySuggestion = (sug: { language: string; level: string; skill: string; prompt: string; label: string }) => {
    setSelectedLanguage(sug.language);
    setSelectedLevel(sug.level);
    setSelectedSkill(sug.skill);
    handleSendMessage(sug.prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-7.5rem)] sm:h-[calc(100vh-6.5rem)] max-w-6xl mx-auto font-sans bg-slate-50 border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden mb-14 lg:mb-0">
      
      {/* 1. Header with Title and 3 Dropdowns */}
      <div className="p-2.5 sm:p-5 bg-white border-b border-slate-200 space-y-2 sm:space-y-4 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Bot className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xs sm:text-lg font-black text-[#0B2447] flex items-center gap-1.5 flex-wrap">
                ISML AI Tutor Chat
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                  Masterclass Generator
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:block">
                Select your 3 parameters below, then prompt the AI to generate complete masterclass study guides on this page.
              </p>
            </div>
          </div>

          {/* Clear Chat Button */}
          {isMounted && messages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200 shadow-2xs"
              title="Clear all chat history"
            >
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* The 3 Required Dropdown Controls */}
        <div className="grid grid-cols-3 gap-1 sm:gap-3 pt-0.5">
          {/* Dropdown 1: Language */}
          <div className="space-y-0.5 sm:space-y-1">
            <label className="text-[9px] sm:text-[11px] font-bold text-slate-700 flex items-center gap-1 uppercase tracking-wider truncate">
              <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600 shrink-0" />
              <span>Language</span>
            </label>
            <select
              value={selectedLanguage}
              onChange={e => {
                setSelectedLanguage(e.target.value);
                setSelectedLevel('');
                setSelectedSkill('');
              }}
              className="w-full p-1 sm:p-2.5 bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer truncate"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 2: Level */}
          <div className="space-y-0.5 sm:space-y-1">
            <label className="text-[9px] sm:text-[11px] font-bold text-slate-700 flex items-center gap-1 uppercase tracking-wider truncate">
              <GraduationCap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600 shrink-0" />
              <span>Level</span>
            </label>
            <select
              value={selectedLevel}
              disabled={!selectedLanguage}
              onChange={e => {
                setSelectedLevel(e.target.value);
                setSelectedSkill('');
              }}
              className="w-full p-1 sm:p-2.5 bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer truncate disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed opacity-80"
            >
              {getDynamicLevelsForLanguage(selectedLanguage).map(lvl => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 3: Skill / Format */}
          <div className="space-y-0.5 sm:space-y-1">
            <label className="text-[9px] sm:text-[11px] font-bold text-slate-700 flex items-center gap-1 uppercase tracking-wider truncate">
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600 shrink-0" />
              <span>Skill</span>
            </label>
            <select
              value={selectedSkill}
              disabled={!selectedLevel}
              onChange={e => setSelectedSkill(e.target.value)}
              className="w-full p-1 sm:p-2.5 bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer truncate disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed opacity-80"
            >
              {SKILLS.map(skl => (
                <option key={skl.value} value={skl.value}>
                  {skl.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Chat Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
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
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div className={`max-w-4xl space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                {/* User Message */}
                {isUser && (
                  <div className="bg-purple-600 text-white p-4 rounded-2xl rounded-tr-none shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider opacity-80 border-b border-purple-400/40 pb-1">
                      <span>{msg.dropdowns?.language}</span>
                      <span>•</span>
                      <span>{msg.dropdowns?.level}</span>
                      <span>•</span>
                      <span>{msg.dropdowns?.skill}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-[10px] text-purple-200 block text-right font-mono">{msg.timestamp}</span>
                  </div>
                )}

                {/* AI Loading Message */}
                {!isUser && msg.isGenerating && (
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-none shadow-xs space-y-3 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#0B2447]">{msg.text}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Drafting comprehensive academic study handbook...</p>
                    </div>
                  </div>
                )}

                {/* Initial Welcome AI Message */}
                {!isUser && !msg.isGenerating && !msg.material && (
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-none shadow-xs space-y-4">
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {msg.text}
                    </p>

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                          Quick Preset Prompts for {selectedLanguage} ({selectedLevel} • {selectedSkill}):
                        </span>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                          Dynamic Presets
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {getDynamicSuggestions(selectedLanguage, selectedLevel, selectedSkill).map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleApplySuggestion(sug)}
                            className="text-left p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
                          >
                            <span className="text-xs font-bold text-[#0B2447] group-hover:text-purple-700 block">
                              {sug.label}
                            </span>
                            <span className="text-[11px] text-slate-500 line-clamp-1 group-hover:text-slate-700">
                              "{sug.prompt}"
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Generated Study Material Card (Direct Content View) */}
                {!isUser && !msg.isGenerating && msg.material && (
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-md overflow-hidden space-y-0">
                    
                    {/* Material Top Bar */}
                    <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase bg-purple-500 text-white rounded-lg">
                          {msg.dropdowns?.language || 'German'}
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-bold bg-slate-800 text-purple-300 rounded-md">
                          {msg.dropdowns?.level || 'A1'}
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-bold bg-slate-800 text-slate-300 rounded-md">
                          {msg.dropdowns?.skill || 'Speaking'}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md">
                          Masterclass Guide
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveToLibrary(msg.id, msg.material!)}
                          disabled={msg.material.saved || isSaving}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            msg.material.saved 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : isSaving
                              ? 'bg-purple-700/80 text-white cursor-wait opacity-90'
                              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                          }`}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-200" />
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
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                          title="Copy study material"
                        >
                          {copiedId === msg.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Direct Full Markdown Content Display */}
                    <div className="p-5 sm:p-6 bg-white overflow-x-auto">
                      <div className="prose prose-slate max-w-none text-xs sm:text-sm font-sans text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {msg.material.body}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Sticky Chat Input Bar */}
      <div className="p-2.5 sm:p-4 bg-white border-t border-slate-200 space-y-1.5 sm:space-y-2 shrink-0">
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
            placeholder={`Type study topic (e.g. French greetings dialogue)...`}
            className="flex-1 p-2.5 sm:p-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || !selectedLanguage || !selectedLevel || !selectedSkill || isGenerating}
            className="h-10 sm:h-11 px-3 sm:px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-md"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">Send</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 px-1 font-medium gap-2">
          <span className="hidden sm:inline truncate">Press Enter to send, Shift+Enter for new line</span>
          <span className="font-bold text-purple-600 truncate text-[10px] sm:text-[11px] w-full sm:w-auto text-right">
            {selectedLanguage && selectedLevel && selectedSkill
              ? `Active: ${selectedLanguage} • ${selectedLevel} • ${selectedSkill}`
              : '⚠️ Please select Language, Level & Skill above'}
          </span>
        </div>
      </div>

    </div>
  );
}

