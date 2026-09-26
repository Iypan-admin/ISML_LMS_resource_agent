"use client";

import React, { useState } from 'react';
import { QuizQuestion } from '@/types/discovery';
import { 
  ArrowLeft, 
  BookOpen, 
  MessageSquare, 
  List, 
  FileText, 
  HelpCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  PlusCircle, 
  CheckCircle2, 
  Volume2, 
  Video, 
  Sparkles, 
  ChevronRight,
  ChevronLeft,
  CheckSquare,
  Award,
  Search,
  Eye,
  EyeOff,
  Layers,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';

export interface ExtractedPayload {
  overview?: string;
  body?: string;
  dialogueScript?: Array<{ speaker: string; text: string; translation?: string }>;
  vocabularyList?: Array<{ word: string; partOfSpeech?: string; translation: string; example?: string }>;
  grammarNotes?: string;
  videoUrl?: string;
  pdfUrl?: string;
}

interface ExtractedContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sourceName: string;
  sourceUrl: string;
  language: string;
  level: string;
  skill: string;
  topic?: string;
  extractedContent: ExtractedPayload;
  questions?: QuizQuestion[];
  onSaveToQueue?: () => void;
  isSaved?: boolean;
}

export default function ExtractedContentModal({
  isOpen,
  onClose,
  title,
  sourceName,
  sourceUrl,
  language,
  level,
  skill,
  topic,
  extractedContent,
  questions = [],
  onSaveToQueue,
  isSaved = false,
}: ExtractedContentModalProps) {
  const [activeSection, setActiveSection] = useState<number | 'all'>('all');
  const [showTranslations, setShowTranslations] = useState<boolean>(true);
  const [vocabSearch, setVocabSearch] = useState<string>('');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showDrillAnswers, setShowDrillAnswers] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const topicClean = topic || "Academic Resource";

  // Filter vocabulary by search query
  const filteredVocab = (extractedContent.vocabularyList || []).filter(item => 
    item.word.toLowerCase().includes(vocabSearch.toLowerCase()) ||
    item.translation.toLowerCase().includes(vocabSearch.toLowerCase()) ||
    (item.partOfSpeech && item.partOfSpeech.toLowerCase().includes(vocabSearch.toLowerCase()))
  );

  // Extract YouTube Embed URL if available
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(sourceUrl);

  const handleCopyFullMasterclass = () => {
    let text = `====================================================\n`;
    text += `📘 ACADEMIC RESOURCE STUDY GUIDE\n`;
    text += `TITLE: ${title}\n`;
    text += `TARGET LANGUAGE: ${language} | LEVEL: ${level} | SKILL: ${skill}\n`;
    text += `TOPIC: ${topicClean}\n`;
    text += `SOURCE: ${sourceName} (${sourceUrl})\n`;
    text += `====================================================\n\n`;

    // Section 1: Overview
    text += `--- SECTION 1: OVERVIEW & LEARNING OBJECTIVES ---\n`;
    if (extractedContent.overview) {
      text += `${extractedContent.overview}\n\n`;
    }
    text += `Core Competencies Target:\n`;
    text += `1. High-frequency vocabulary in ${topicClean}\n`;
    text += `2. Contextual expression for ${skill} at ${level} level\n`;
    text += `3. Grammar syntax rules for ${language}\n\n`;

    // Section 2: Passage & Dialogue
    text += `--- SECTION 2: READING PASSAGE & SITUATIONAL DIALOGUE ---\n`;
    if (extractedContent.body) {
      text += `Reading Passage:\n${extractedContent.body}\n\n`;
    }
    if (extractedContent.dialogueScript && extractedContent.dialogueScript.length > 0) {
      text += `Situational Dialogue Script:\n`;
      extractedContent.dialogueScript.forEach(line => {
        text += `${line.speaker}: ${line.text}\n`;
        if (line.translation) text += `   (English: ${line.translation})\n`;
      });
      text += `\n`;
    }

    // Section 3: Vocabulary
    text += `--- SECTION 3: TARGET VOCABULARY BANK ---\n`;
    if (extractedContent.vocabularyList && extractedContent.vocabularyList.length > 0) {
      extractedContent.vocabularyList.forEach((item, idx) => {
        text += `${idx + 1}. ${item.word} [${item.partOfSpeech || 'word'}] = ${item.translation}\n`;
        if (item.example) text += `   Example: ${item.example}\n`;
      });
      text += `\n`;
    }

    // Section 4: Grammar
    text += `--- SECTION 4: GRAMMAR ARCHITECTURE ---\n`;
    if (extractedContent.grammarNotes) {
      text += `${extractedContent.grammarNotes}\n\n`;
    }

    // Section 5: Practice Drills
    text += `--- SECTION 5: PRACTICE DRILLS & EVALUATION ---\n`;
    if (questions && questions.length > 0) {
      questions.forEach((q, idx) => {
        text += `Q${idx + 1}: ${q.question}\n`;
        q.options.forEach((opt, oIdx) => {
          text += `   [${String.fromCharCode(65 + oIdx)}] ${opt}\n`;
        });
        text += `✓ Correct Answer: ${q.answer}\n`;
        if (q.explanation) text += `💡 Explanation: ${q.explanation}\n`;
        text += `\n`;
      });
    } else {
      text += `Self-Assessment Checkpoints:\n`;
      text += `[ ] 1. I can explain the main concepts of '${topicClean}' in ${language}.\n`;
      text += `[ ] 2. I can use key vocabulary words accurately in ${skill}.\n`;
      text += `[ ] 3. I understand the syntactic rules outlined for CEFR ${level}.\n`;
    }

    text += `====================================================\n`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const sectionsList = [
    { num: 'all' as const, label: 'Full Study Guide', icon: Layers },
    { num: 2, label: 'Reading & Dialogue', icon: MessageSquare },
    { num: 3, label: 'Vocabulary Bank', icon: List },
    { num: 4, label: 'Grammar Rules', icon: HelpCircle },
    { num: 5, label: 'Practice Drills', icon: CheckSquare },
    { num: 1, label: 'Overview & Objectives', icon: BookOpen },
  ];

  const handleSelectOption = (qId: string, opt: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: opt }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto flex flex-col font-sans animate-fade-in">
      
      {/* FULLSCREEN APP THEME HEADER BAR */}
      <div className="sticky top-0 z-30 bg-[#0B2447] text-white shadow-lg border-b border-[#19376D]">
        
        {/* Top Bar Navigation & Controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-2 text-xs font-extrabold cursor-pointer shrink-0"
              aria-label="Back to discovery"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-300" />
              <span className="hidden sm:inline">Back to Discovery</span>
            </button>

            <div className="h-6 w-px bg-white/20 hidden sm:block" />

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[11px] font-extrabold">
                  {language}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px] font-extrabold">
                  {level}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-[11px] font-extrabold hidden sm:inline-block">
                  {skill}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-white truncate max-w-xl">
                {title}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyFullMasterclass}
              className="px-3.5 py-2 rounded-xl bg-[#0052CC] hover:bg-blue-600 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy Guide</span>
                </>
              )}
            </button>

            {onSaveToQueue && (
              <button
                onClick={onSaveToQueue}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSaved 
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' 
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Saved to Library</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Save to Library</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile & Desktop Scrollable Tab Navigation */}
        <div className="bg-[#19376D] border-t border-[#0B2447]">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none text-xs font-bold">
            {sectionsList.map(s => {
              const Icon = s.icon;
              const isActive = activeSection === s.num;
              return (
                <button
                  key={String(s.num)}
                  onClick={() => setActiveSection(s.num)}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#0052CC] text-white font-extrabold shadow-md border border-blue-400/40'
                      : 'text-blue-100/80 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-blue-300'}`} />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Source & Context Information Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4 flex-wrap text-xs font-semibold">
          <div className="flex items-center gap-2 text-slate-600 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold">
              Topic: <strong>{topicClean}</strong>
            </span>
            <span>•</span>
            <span>Source: <strong className="text-slate-900">{sourceName}</strong></span>
          </div>

          <a 
            href={sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#0052CC] hover:underline flex items-center gap-1 font-bold"
          >
            Open Source Link <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* ================= SECTION 2: READING & DIALOGUE ================= */}
        {(activeSection === 2 || activeSection === 'all') && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#0B2447] flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-cyan-600" /> Reading Passage & Dialogue
              </h2>

              {extractedContent.dialogueScript && extractedContent.dialogueScript.length > 0 && (
                <button
                  onClick={() => setShowTranslations(!showTranslations)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {showTranslations ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-[#0052CC]" />}
                  {showTranslations ? 'Hide English Translations' : 'Show English Translations'}
                </button>
              )}
            </div>

            {/* Embedded YouTube Video Player */}
            {youtubeEmbedUrl && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-red-600" /> Embedded Lesson Player
                </h3>
                <div className="aspect-video w-full max-w-4xl rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-black">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Core Reading Passage */}
            {extractedContent.body && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0052CC]" /> Core Reading Passage ({language})
                </h3>
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 text-sm sm:text-base text-slate-800 leading-relaxed font-serif shadow-xs whitespace-pre-line border-l-4 border-l-[#0052CC]">
                  {extractedContent.body}
                </div>
              </div>
            )}

            {/* Dialogue Script */}
            {extractedContent.dialogueScript && extractedContent.dialogueScript.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-cyan-600" /> Situational Dialogue Script
                </h3>

                <div className="space-y-3">
                  {extractedContent.dialogueScript.map((line, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        idx % 2 === 0 ? 'bg-blue-50/70 border-blue-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-[#0B2447] flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white flex items-center justify-center font-bold text-[10px]">
                            {line.speaker.charAt(0)}
                          </span>
                          {line.speaker}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Turn {idx + 1}
                        </span>
                      </div>

                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug pl-8">
                        {line.text}
                      </p>

                      {showTranslations && line.translation && (
                        <div className="mt-2.5 pl-8">
                          <p className="text-xs text-slate-600 italic bg-white/90 p-3 rounded-xl border border-slate-200 font-sans">
                            🇬🇧 Translation: {line.translation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 1: OVERVIEW & OBJECTIVES ================= */}
        {(activeSection === 1 || activeSection === 'all') && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base sm:text-lg font-black text-[#0B2447] flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-[#0052CC]" /> Overview & Learning Objectives
              </h2>
              <span className="px-3 py-1 rounded-lg bg-blue-100 text-[#0052CC] font-bold text-xs">
                Syllabus Overview
              </span>
            </div>

            {/* Overview Banner Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0B2447] to-[#19376D] text-white shadow-lg space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-300" /> Lesson Core Summary
              </div>
              <p className="text-sm sm:text-base font-medium leading-relaxed text-slate-100">
                {extractedContent.overview || extractedContent.body || `This study guide provides a structured breakdown of '${topicClean}' tailored for ${language} learners at the ${level} level.`}
              </p>
            </div>

            {/* Learning Outcomes & Study Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" /> Target Competencies
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Master core vocabulary for <strong>{topicClean}</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Develop contextual fluency in <strong>{skill}</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Understand syntax and word order for <strong>{level}</strong> level</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Apply appropriate registers in <strong>{language}</strong></span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-4">
                <h3 className="text-xs font-extrabold text-[#0052CC] uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Cultural Register & Usage Context
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0052CC]/10 text-[#0052CC] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span><strong>Formal vs. Informal Registers:</strong> Social distance rules & pronoun selection in <strong>{language}</strong> for {level}.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0052CC]/10 text-[#0052CC] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span><strong>Contextual Application:</strong> Authentic oral & written expression for <strong>{topicClean}</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0052CC]/10 text-[#0052CC] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span><strong>Curriculum Material:</strong> Full study content ready for tutor distribution & student learning.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 2: READING & DIALOGUE ================= */}
        {(activeSection === 2 || activeSection === 'all') && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#0B2447] flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-cyan-600" /> Reading Passage & Dialogue
              </h2>

              {extractedContent.dialogueScript && extractedContent.dialogueScript.length > 0 && (
                <button
                  onClick={() => setShowTranslations(!showTranslations)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {showTranslations ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-[#0052CC]" />}
                  {showTranslations ? 'Hide English Translations' : 'Show English Translations'}
                </button>
              )}
            </div>

            {/* Embedded YouTube Video Player */}
            {youtubeEmbedUrl && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-red-600" /> Embedded Lesson Player
                </h3>
                <div className="aspect-video w-full max-w-4xl rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-black">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Core Reading Passage */}
            {extractedContent.body && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0052CC]" /> Core Reading Passage ({language})
                </h3>
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 text-sm sm:text-base text-slate-800 leading-relaxed font-serif shadow-xs whitespace-pre-line border-l-4 border-l-[#0052CC]">
                  {extractedContent.body}
                </div>
              </div>
            )}

            {/* Dialogue Script */}
            {extractedContent.dialogueScript && extractedContent.dialogueScript.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-cyan-600" /> Situational Dialogue Script
                </h3>

                <div className="space-y-3">
                  {extractedContent.dialogueScript.map((line, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        idx % 2 === 0 ? 'bg-blue-50/70 border-blue-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-[#0B2447] flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white flex items-center justify-center font-bold text-[10px]">
                            {line.speaker.charAt(0)}
                          </span>
                          {line.speaker}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Turn {idx + 1}
                        </span>
                      </div>

                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug pl-8">
                        {line.text}
                      </p>

                      {showTranslations && line.translation && (
                        <div className="mt-2.5 pl-8">
                          <p className="text-xs text-slate-600 italic bg-white/90 p-3 rounded-xl border border-slate-200 font-sans">
                            🇬🇧 Translation: {line.translation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 3: VOCABULARY BANK ================= */}
        {(activeSection === 3 || activeSection === 'all') && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#0B2447] flex items-center gap-2.5">
                <List className="w-5 h-5 text-purple-600" /> Target Vocabulary Bank
              </h2>
              <span className="px-3 py-1 rounded-lg bg-purple-100 text-purple-900 font-bold text-xs">
                {extractedContent.vocabularyList?.length || 0} Key Terms
              </span>
            </div>

            {/* Vocab Filter Search Bar */}
            <div className="relative max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search vocabulary by word, part of speech, or meaning..."
                value={vocabSearch}
                onChange={(e) => setVocabSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
              />
            </div>

            {/* Responsive Table for Desktop & Cards for Mobile */}
            {filteredVocab.length > 0 ? (
              <div>
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-3xl bg-white shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200 uppercase tracking-wider">
                        <th className="p-4">#</th>
                        <th className="p-4">Target Word ({language})</th>
                        <th className="p-4">Part of Speech</th>
                        <th className="p-4">English Meaning</th>
                        <th className="p-4">Example Usage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredVocab.map((item, i) => (
                        <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                          <td className="p-4 text-slate-400 font-bold">{i + 1}</td>
                          <td className="p-4 font-extrabold text-[#0B2447] text-sm">{item.word}</td>
                          <td className="p-4 text-slate-500 font-semibold">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[10px]">
                              {item.partOfSpeech || 'N/A'}
                            </span>
                          </td>
                          <td className="p-4 text-[#0052CC] font-bold">{item.translation}</td>
                          <td className="p-4 text-slate-600 italic font-serif">{item.example || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List View */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {filteredVocab.map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-[#0B2447]">{item.word}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {item.partOfSpeech || 'word'}
                        </span>
                      </div>
                      <p className="text-xs text-[#0052CC] font-bold">🇬🇧 {item.translation}</p>
                      {item.example && (
                        <p className="text-xs text-slate-500 italic font-serif bg-slate-50 p-2 rounded-lg">
                          "{item.example}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                No vocabulary terms found matching "{vocabSearch}".
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 4: GRAMMAR RULES ================= */}
        {(activeSection === 4 || activeSection === 'all') && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base sm:text-lg font-black text-[#0B2447] flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5 text-amber-600" /> Grammar Architecture & Rules
              </h2>
              <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs">
                Syntax Notes
              </span>
            </div>

            {/* Grammar Notes Content */}
            {extractedContent.grammarNotes ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line space-y-4 shadow-xs">
                {extractedContent.grammarNotes}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600">
                Grammar rules for <strong>{topicClean}</strong> focus on syntax structure, word order, and verb conjugations at the {level} level.
              </div>
            )}

            {/* Grammar Tips Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-emerald-600" /> Pro Grammar Tip
                </h3>
                <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium">
                  When applying <strong>{topicClean}</strong>, focus on correct auxiliary verb positioning and natural word rhythm in {language}.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <h3 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Common Pitfall to Avoid
                </h3>
                <p className="text-xs sm:text-sm text-rose-900 leading-relaxed font-medium">
                  Do not translate word-for-word from native language; adhere strictly to target syntactic structure for level {level}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 5: PRACTICE DRILLS ================= */}
        {(activeSection === 5 || activeSection === 'all') && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#0B2447] flex items-center gap-2.5">
                <CheckSquare className="w-5 h-5 text-emerald-600" /> Practice Drills & Assessment
              </h2>
              <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs">
                Interactive Check
              </span>
            </div>

            {questions && questions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Assessment Questions ({questions.length} Items)
                  </h3>
                  <button
                    onClick={() => setShowDrillAnswers(!showDrillAnswers)}
                    className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1"
                  >
                    {showDrillAnswers ? 'Hide Solutions' : 'Reveal Solutions'}
                  </button>
                </div>

                {questions.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-xl bg-[#0052CC]/10 text-[#0052CC] font-extrabold text-xs flex items-center justify-center shrink-0">
                        Q{qIdx + 1}
                      </span>
                      <h4 className="text-sm sm:text-base font-extrabold text-[#0B2447] leading-snug">
                        {q.question}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-0 sm:pl-11">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[q.id] === opt;
                        const isCorrect = q.answer === opt;

                        let btnStyle = "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";
                        if (showDrillAnswers) {
                          if (isCorrect) btnStyle = "border-emerald-500 bg-emerald-500 text-white font-bold";
                          else if (isSelected && !isCorrect) btnStyle = "border-rose-500 bg-rose-500 text-white font-bold";
                        } else if (isSelected) {
                          btnStyle = "border-[#0052CC] bg-[#0052CC] text-white font-bold";
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`p-3.5 rounded-xl border text-xs text-left font-medium transition-all flex items-center gap-2.5 cursor-pointer ${btnStyle}`}
                          >
                            <span className="w-5 h-5 rounded-lg bg-white/20 text-xs font-bold flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {showDrillAnswers && (
                      <div className="sm:ml-11 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-700 space-y-1">
                        <p className="font-bold text-[#0052CC]">✓ Answer: {q.answer}</p>
                        {q.explanation && <p className="text-slate-600">{q.explanation}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-[#0052CC] font-bold text-xs">
                    Oral Practice Prompt
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-800">Speaking & Dialogue Practice</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Read the dialogue in Section 2 out loud 3 times. Focus on pronunciation, pitch accent, and rhythm in {language}.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-bold text-xs">
                    Writing Prompt
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-800">Sentence Construction</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Construct 3 original sentences using target vocabulary from Section 3 tailored to <strong>{topicClean}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* FOOTER NAVIGATION CONTROL BAR */}
      <div className="sticky bottom-0 z-30 bg-white border-t border-slate-200 p-4 sm:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection(prev => (typeof prev === 'number' && prev > 1 ? (prev - 1) : 1))}
              disabled={activeSection === 1 || activeSection === 'all'}
              className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="text-xs font-extrabold text-slate-600 px-2">
              {activeSection === 'all' ? 'All Sections' : `Section ${activeSection} of 5`}
            </span>

            <button
              onClick={() => setActiveSection(prev => (typeof prev === 'number' && prev < 5 ? (prev + 1) : 5))}
              disabled={activeSection === 5 || activeSection === 'all'}
              className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer"
          >
            Done Reading
          </button>

        </div>
      </div>

    </div>
  );
}
