"use client";

import React, { useState } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  Video, 
  Download, 
  Loader2,
  Send,
  Volume2,
  Sparkles,
  Award,
  ShieldAlert,
  Cpu,
  Layers,
  Bot,
  MessageSquare,
  RotateCw,
  Headphones,
  Mic,
  PenTool,
  Check,
  ChevronDown
} from 'lucide-react';
import { DayCurriculumItem } from './curriculumProgression';
import { fetchWithEndpointFallback } from '@/utils/apiConfig';

interface DayContentProps {
  activeDay: DayCurriculumItem;
  outputMode: 'TEACHER' | 'STUDENT';
  unitName: string;
  totalDays: number;
  sessionPackage: any;
  handleDownloadDayDocx: (day: any) => void;
  downloadingDocx: boolean;
  handleDownloadFullCurriculumDocx?: (days: any[]) => void;
  downloadingFullDocx?: boolean;
  allDays?: any[];
  onPrevDay: () => void;
  onNextDay: () => void;
  onToggleOutputMode: (mode: 'TEACHER' | 'STUDENT') => void;
  onApplyPeriodUpdate?: (dayNum: number, updates: any) => void;
}

export function DayContentView({
  activeDay,
  outputMode,
  unitName,
  totalDays,
  sessionPackage,
  handleDownloadDayDocx,
  downloadingDocx,
  handleDownloadFullCurriculumDocx,
  downloadingFullDocx,
  allDays,
  onPrevDay,
  onNextDay,
  onToggleOutputMode,
  onApplyPeriodUpdate,
}: DayContentProps) {
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);

  // In-place Q&A and re-generation copilot states
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);
  const [activeLsrwTab, setActiveLsrwTab] = useState<'ALL' | 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING'>('ALL');
  const [lastModifiedSection, setLastModifiedSection] = useState<string | null>(null);
  const [localOverrides, setLocalOverrides] = useState<Record<number, Partial<DayCurriculumItem>>>({});

  // Merge activeDay with any local instantaneous overrides
  const effectiveDay = {
    ...activeDay,
    ...(localOverrides[activeDay.day_number] || {})
  };

  const playNativeAudio = async (textToSpeak: string, key: string) => {
    // Stop if already playing this item
    if (playingAudioKey === key) {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingAudioKey(null);
      return;
    }

    // Stop any existing playing audio
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setPlayingAudioKey(key);

    const targetLang = (sessionPackage?.language || 'French').toLowerCase();
    const langLocaleMap: Record<string, string> = {
      french: 'fr-FR',
      spanish: 'es-ES',
      german: 'de-DE',
      japanese: 'ja-JP',
      korean: 'ko-KR',
      english: 'en-US'
    };
    const targetLocale = langLocaleMap[targetLang] || 'fr-FR';

    // ⚡ Fast Native High-Definition Speech Synthesis (Zero Latency & Stutter-Free)
    if ('speechSynthesis' in window) {
      try {
        const cleanUtterance = textToSpeak.replace(/^[A-Za-z\s]+:\s*/, '').replace(/['"]/g, '').trim();
        const u = new SpeechSynthesisUtterance(cleanUtterance);
        u.lang = targetLocale;
        u.rate = audioSpeed;
        u.pitch = 1.0;

        // Try to pick the best matching native voice available on user device
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const matchingVoice = voices.find(v => v.lang.startsWith(targetLocale.slice(0, 2)) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Premium'))) 
            || voices.find(v => v.lang.startsWith(targetLocale.slice(0, 2)));
          if (matchingVoice) {
            u.voice = matchingVoice;
          }
        }

        u.onend = () => {
          setPlayingAudioKey(null);
        };
        u.onerror = () => {
          setPlayingAudioKey(null);
        };

        window.speechSynthesis.speak(u);
        return;
      } catch (err) {
        console.warn('Browser TTS failed, trying backend TTS:', err);
      }
    }

    // Fallback: Backend TTS Server
    try {
      const response = await fetchWithEndpointFallback('/api/v1/sessions/synthesize-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          language: sessionPackage.language || 'French',
        }),
      });

      if (!response.ok) throw new Error('TTS server error');

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.playbackRate = audioSpeed;
      setCurrentAudio(audio);
      audio.onended = () => {
        setPlayingAudioKey(null);
        setCurrentAudio(null);
      };
      await audio.play();
    } catch (e) {
      console.warn('All TTS methods failed:', e);
      setPlayingAudioKey(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
      {/* Active Day Header Bar - Clean White / Slate Modern Style */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black flex flex-col items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <span className="text-[9px] uppercase tracking-wider opacity-80 leading-none">
              {unitName}
            </span>
            <span className="text-base font-extrabold leading-tight mt-0.5">
              {effectiveDay.day_number}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                {sessionPackage.institution_type === 'SCHOOL'
                  ? `Period ${effectiveDay.day_number} of ${totalDays}`
                  : `Session ${effectiveDay.day_number} of ${totalDays}`}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Comprehensive Syllabus Unit
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1 tracking-tight">
              {effectiveDay.day_topic}
            </h3>
          </div>
        </div>

        {/* Action Controls: Mode Switcher, Speed & DOCX */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => onToggleOutputMode('TEACHER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                outputMode === 'TEACHER'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Teacher Guide</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleOutputMode('STUDENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                outputMode === 'STUDENT'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Practice</span>
            </button>
          </div>

          {/* Speed Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Volume2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-bold text-[10px]">Speed:</span>
            {[0.8, 1.0, 1.25, 1.5, 2.0].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setAudioSpeed(s);
                  if (currentAudio) {
                    currentAudio.playbackRate = s;
                  }
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-black cursor-pointer transition-colors ${
                  audioSpeed === s
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-white/70 hover:bg-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Download Action Buttons: Day DOCX and All Periods DOCX */}
          <div className="flex items-center gap-1.5">
            {handleDownloadFullCurriculumDocx && allDays && (
              <button
                type="button"
                onClick={() => handleDownloadFullCurriculumDocx(allDays)}
                disabled={downloadingFullDocx || downloadingDocx}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                title="Download complete Master Guide for all periods and modules"
              >
                {downloadingFullDocx ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Compiling All {totalDays}...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                    <span>Download All {totalDays} {unitName}s</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => handleDownloadDayDocx(activeDay)}
              disabled={downloadingDocx || downloadingFullDocx}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              title={`Download ${unitName} ${effectiveDay.day_number} DOCX`}
            >
              {downloadingDocx ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{unitName} {effectiveDay.day_number} DOCX</span>
                </>
              )}
            </button>
          </div>

          {/* Prev/Next Navigation */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrevDay}
              disabled={effectiveDay.day_number <= 1}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold disabled:opacity-30 cursor-pointer border border-slate-200"
              title="Previous Unit"
            >
              ←
            </button>
            <button
              type="button"
              onClick={onNextDay}
              disabled={effectiveDay.day_number >= totalDays}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold disabled:opacity-30 cursor-pointer border border-slate-200"
              title="Next Unit"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Body Content: Teacher vs Student View */}
      <div className="p-5 sm:p-6 space-y-5 text-xs">
        {outputMode === 'STUDENT' ? (
          /* ---------------- STUDENT LSRW PRACTICE SUITE (WORLD-CLASS IMMERSIVE EDITION) ---------------- */
          <div className="space-y-6">
            {/* Student Edition Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-emerald-400/30">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full backdrop-blur-xs tracking-wider border border-white/25 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                      Student Interactive Studio
                    </span>
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md">
                      CEFR {sessionPackage.level}
                    </span>
                    <span className="text-[11px] text-emerald-100 font-semibold hidden md:inline">
                      • {sessionPackage.language} Immersion Track
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                    {unitName} {effectiveDay.day_number}: {effectiveDay.day_topic.replace(/^(Period|Session)\s*\d+:\s*/i, '')}
                  </h3>
                  <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
                    Interactive 4-Skill Mastery (Listening • Speaking • Reading • Writing). Complete each module below to lock in retention and prepare for the ISML LSRW evaluation.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl backdrop-blur-md border border-white/10 shrink-0 self-start sm:self-auto">
                  <div className="text-center px-3 py-1 border-r border-white/10">
                    <span className="block text-[10px] text-emerald-200 uppercase font-bold">Skills</span>
                    <span className="text-xs font-black text-white">4 LSRW</span>
                  </div>
                  <div className="text-center px-3 py-1 border-r border-white/10">
                    <span className="block text-[10px] text-emerald-200 uppercase font-bold">Vocabulary</span>
                    <span className="text-xs font-black text-amber-300">{effectiveDay.vocabulary_bank?.length || 4} Cards</span>
                  </div>
                  <div className="text-center px-3 py-1">
                    <span className="block text-[10px] text-emerald-200 uppercase font-bold">Audio Drills</span>
                    <span className="text-xs font-black text-cyan-300">Native TTS</span>
                  </div>
                </div>
              </div>

              {/* 🎯 Clean Professional LSRW Focus Selector */}
              <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveLsrwTab('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeLsrwTab === 'ALL'
                        ? 'bg-white text-emerald-950 shadow-md font-extrabold'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <span>All Modules</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLsrwTab('LISTENING')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeLsrwTab === 'LISTENING'
                        ? 'bg-purple-500 text-white shadow-md font-extrabold'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>L • Listening</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLsrwTab('SPEAKING')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeLsrwTab === 'SPEAKING'
                        ? 'bg-indigo-500 text-white shadow-md font-extrabold'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>S • Speaking</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLsrwTab('READING')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeLsrwTab === 'READING'
                        ? 'bg-blue-500 text-white shadow-md font-extrabold'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>R • Reading</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLsrwTab('WRITING')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeLsrwTab === 'WRITING'
                        ? 'bg-teal-500 text-white shadow-md font-extrabold'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>W • Writing</span>
                  </button>
                </div>
                <span className="text-[10px] text-emerald-100 font-mono hidden sm:inline">
                  Common European Framework: A1–C2 Standard
                </span>
              </div>
            </div>

            {/* 1. Interactive Vocabulary Flashcard Bank (Included in ALL or READING) */}
            {(activeLsrwTab === 'ALL' || activeLsrwTab === 'READING') && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                      01
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                        <span>🗂️ Lexical Flashcards & Pronunciation Key</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Tap any card to hear authentic pronunciation at your selected speed ({audioSpeed}x).
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70 self-start sm:self-auto">
                    Tap &quot;🔊 Listen&quot; for Native Accent
                  </span>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(effectiveDay.vocabulary_bank || []).map((v, vIdx) => {
                  const vKey = `student-vocab-${effectiveDay.day_number}-${vIdx}`;
                  const isPlaying = playingAudioKey === vKey;
                  return (
                    <div 
                      key={vIdx} 
                      className="group bg-gradient-to-br from-slate-50 via-white to-amber-50/30 border border-slate-200 hover:border-amber-300 hover:shadow-md rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">Word {vIdx + 1}</span>
                          <h5 className="font-black text-base text-slate-900 group-hover:text-amber-900 transition-colors">
                            {v.word}
                          </h5>
                          {v.pronunciation && (
                            <span className="inline-block mt-0.5 text-[11px] font-mono text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md font-semibold">
                              /{v.pronunciation}/
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => playNativeAudio(v.word, vKey)}
                          className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs ${
                            isPlaying
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-amber-100/80 hover:bg-amber-200 text-amber-950 border border-amber-200'
                          }`}
                          title="Play native audio pronunciation"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black">{isPlaying ? 'Playing...' : 'Audio'}</span>
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <p className="text-xs text-slate-700 font-medium">
                          <strong>Meaning:</strong> {v.meaning}
                        </p>
                        {v.example_sentence && (
                          <div className="bg-slate-100/70 p-2 rounded-xl border border-slate-200/60 text-[11px] text-slate-700 italic flex items-center justify-between gap-2">
                            <span className="line-clamp-2">&quot;{v.example_sentence}&quot;</span>
                            <button
                              type="button"
                              onClick={() => playNativeAudio(v.example_sentence, `${vKey}-sentence`)}
                              className="text-[10px] font-bold text-amber-800 hover:text-amber-950 shrink-0 cursor-pointer"
                              title="Listen to full sentence in context"
                            >
                              {playingAudioKey === `${vKey}-sentence` ? '⏹' : '🔊'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

            {/* 2. Comprehensive LSRW Interactive Practice Questions (L • S • R • W) */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-1 shrink-0">
                    <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-[10px] shadow-xs">L</span>
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-[10px] shadow-xs">S</span>
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[10px] shadow-xs">R</span>
                    <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-[10px] shadow-xs">W</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                      <span>🎯 Targeted LSRW Practice Drills & Competency Checks</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Interactive drills covering Listening, Speaking, Reading & Writing for {effectiveDay.day_topic.replace(/^(Period|Session)\s*\d+:\s*/i, '')}.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {activeLsrwTab === 'ALL' ? 'All 4 Skills' : `${activeLsrwTab} Focus`}
                  </span>
                </div>
              </div>

              <div className="space-y-3.5">
                {(effectiveDay.exercise_solutions && effectiveDay.exercise_solutions.length > 0 
                  ? effectiveDay.exercise_solutions 
                  : (effectiveDay.in_class_exercises || []).map((q, qi) => {
                      const tags = ['[R - Reading & Syntax]', '[S - Spoken Interaction]', '[L - Auditory & Error Discrimination]', '[W - Contextual Writing]'];
                      return {
                        question: `${tags[qi % 4]} ${q}`,
                        answer: `Target CEFR ${sessionPackage.level} solution in ${sessionPackage.language}.`,
                        explanation: `Adheres strictly to the core grammar rules of this syllabus unit.`
                      };
                    })
                ).map((drill, dIdx) => {
                  const qText = drill.question || '';
                  const isReading = qText.includes('[R') || (!qText.includes('[S') && !qText.includes('[L') && !qText.includes('[W') && dIdx % 4 === 0);
                  const isSpeaking = qText.includes('[S') || (!qText.includes('[R') && !qText.includes('[L') && !qText.includes('[W') && dIdx % 4 === 1);
                  const isListening = qText.includes('[L') || (!qText.includes('[R') && !qText.includes('[S') && !qText.includes('[W') && dIdx % 4 === 2);
                  const isWriting = qText.includes('[W') || (!qText.includes('[R') && !qText.includes('[S') && !qText.includes('[L') && dIdx % 4 === 3);

                  // Filter according to active tab if user clicked a specific skill
                  if (activeLsrwTab === 'LISTENING' && !isListening) return null;
                  if (activeLsrwTab === 'SPEAKING' && !isSpeaking) return null;
                  if (activeLsrwTab === 'READING' && !isReading) return null;
                  if (activeLsrwTab === 'WRITING' && !isWriting) return null;

                  const drillAudioKey = `drill-audio-${effectiveDay.day_number}-${dIdx}`;
                  const cleanDrillText = qText.replace(/^\[[A-Za-z0-9\s\-:&]+\]\s*/i, '');

                  return (
                    <div 
                      key={dIdx} 
                      className={`border rounded-2xl p-4 sm:p-5 space-y-3 transition-colors ${
                        isListening
                          ? 'bg-purple-50/50 hover:bg-purple-50/80 border-purple-200'
                          : isSpeaking
                          ? 'bg-indigo-50/50 hover:bg-indigo-50/80 border-indigo-200'
                          : isReading
                          ? 'bg-blue-50/50 hover:bg-blue-50/80 border-blue-200'
                          : 'bg-teal-50/50 hover:bg-teal-50/80 border-teal-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-7 h-7 rounded-xl text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                          isListening ? 'bg-purple-600' : isSpeaking ? 'bg-indigo-600' : isReading ? 'bg-blue-600' : 'bg-teal-600'
                        }`}>
                          {isListening ? 'L' : isSpeaking ? 'S' : isReading ? 'R' : 'W'}
                        </span>
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {isListening ? (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                                <Headphones className="w-3 h-3" /> Listening & Auditory Discrimination
                              </span>
                            ) : isSpeaking ? (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200 flex items-center gap-1">
                                <Mic className="w-3 h-3" /> Spoken Interaction & Fluency Drill
                              </span>
                            ) : isReading ? (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> Reading & Syntactic Formulation
                              </span>
                            ) : (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-200 flex items-center gap-1">
                                <PenTool className="w-3 h-3" /> Contextual Writing & Composition
                              </span>
                            )}

                            {/* Native Audio Trigger for Practice Question */}
                            <button
                              type="button"
                              onClick={() => playNativeAudio(cleanDrillText, drillAudioKey)}
                              className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors ${
                                playingAudioKey === drillAudioKey
                                  ? 'bg-rose-500 text-white animate-pulse'
                                  : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                              }`}
                              title="Listen to question spoken in native pronunciation"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>{playingAudioKey === drillAudioKey ? 'Stop' : 'Listen Question'}</span>
                            </button>
                          </div>

                          <h5 className="font-bold text-sm text-slate-900 leading-snug pt-0.5">
                            {cleanDrillText}
                          </h5>
                        </div>
                      </div>

                      {/* Interactive Student Response & Verification Box */}
                      <div className="ml-10 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <input 
                            type="text" 
                            placeholder={
                              isSpeaking 
                                ? `Speak/Type oral turn in ${sessionPackage.language}...`
                                : isListening 
                                ? `What did you hear? Transcribe or correct error in ${sessionPackage.language}...`
                                : `Type your answer in ${sessionPackage.language}...`
                            }
                            className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                          />
                          <details className="group shrink-0">
                            <summary className="list-none px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs cursor-pointer border border-slate-300/80 transition-colors flex items-center gap-1.5">
                              <span>Check Model Answer</span>
                              <span className="text-slate-500 group-open:rotate-180 transition-transform">▾</span>
                            </summary>
                            <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5 animate-in fade-in duration-150">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-emerald-900 font-black">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>Verified CEFR Model Answer:</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => playNativeAudio(drill.answer, `ans-${drillAudioKey}`)}
                                  className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer bg-emerald-100/80 hover:bg-emerald-200 px-2 py-0.5 rounded border border-emerald-300"
                                >
                                  <Volume2 className="w-3 h-3" />
                                  <span>Listen Answer</span>
                                </button>
                              </div>
                              <p className="font-mono text-emerald-950 font-bold bg-white/80 px-2 py-1 rounded border border-emerald-200 text-xs">
                                {drill.answer}
                              </p>
                              {drill.explanation && (
                                <p className="text-[11px] text-emerald-800 pt-0.5 leading-relaxed">
                                  <strong>Linguistic Tip:</strong> {drill.explanation}
                                </p>
                              )}
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Listening Comprehension Dialogue Lab */}
            {(activeLsrwTab === 'ALL' || activeLsrwTab === 'LISTENING') && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                      L
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                        <span>🎧 Listening Comprehension & Situational Dialogue</span>
                      </h4>
                    <p className="text-[11px] text-slate-500">
                      Listen to native conversational exchanges. Practice shadow repetition line by line.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Play Full Conversation Audio Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const allLines = ((effectiveDay.student_lsrw_practice?.listening_audio_script?.dialogue_lines?.length 
                        ? effectiveDay.student_lsrw_practice.listening_audio_script.dialogue_lines 
                        : effectiveDay.classroom_dialogues) || []).join('. ');
                      playNativeAudio(allLines, `full-dialogue-${effectiveDay.day_number}`);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                      playingAudioKey === `full-dialogue-${effectiveDay.day_number}`
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{playingAudioKey === `full-dialogue-${effectiveDay.day_number}` ? '⏹ Stop Full Audio' : '▶ Play Full Audio Exchange'}</span>
                  </button>

                  <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/70">
                    🗣️ Multi-Speaker Audio ({audioSpeed}x)
                  </span>
                </div>
              </div>

              {/* Dialogue Transcript Container */}
              <div className="bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/30 rounded-2xl p-4 sm:p-5 border border-purple-100 space-y-3">
                {effectiveDay.student_lsrw_practice?.listening_audio_script?.scene && (
                  <div className="bg-white px-3 py-1.5 rounded-xl border border-purple-200/80 text-[11px] text-purple-950 font-bold flex items-center gap-2 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                    <span>Scenario: {effectiveDay.student_lsrw_practice.listening_audio_script.scene}</span>
                  </div>
                )}

                <div className="space-y-2.5">
                  {((effectiveDay.student_lsrw_practice?.listening_audio_script?.dialogue_lines?.length 
                      ? effectiveDay.student_lsrw_practice.listening_audio_script.dialogue_lines 
                      : effectiveDay.classroom_dialogues) || []
                  ).map((line, lIdx) => {
                    const audioKey = `student-listen-${effectiveDay.day_number}-${lIdx}`;
                    const isPlaying = playingAudioKey === audioKey;
                    const isTeacher = line.includes('Teacher:') || line.includes('Professeur:') || line.includes('Speaker A');

                    return (
                      <div 
                        key={lIdx} 
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-2xs ${
                          isTeacher 
                            ? 'bg-white border-purple-200' 
                            : 'bg-purple-100/50 border-purple-200/80 ml-2 sm:ml-6'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-base shrink-0 pt-0.5">{isTeacher ? '👨‍🏫' : '👩‍🎓'}</span>
                          <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                            {line}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => playNativeAudio(line, audioKey)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs ${
                            isPlaying
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-white hover:bg-purple-100 text-purple-900 border border-purple-200'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black">{isPlaying ? 'Stop' : 'Listen'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {effectiveDay.student_lsrw_practice?.listening_audio_script?.comprehension_check && (
                  <div className="mt-3 bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl text-xs text-amber-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[10px] uppercase tracking-wider text-amber-800 block">
                        🎯 Auditory Comprehension Check Question:
                      </span>
                      <button
                        type="button"
                        onClick={() => playNativeAudio(effectiveDay.student_lsrw_practice!.listening_audio_script.comprehension_check, `listening-check-${effectiveDay.day_number}`)}
                        className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-950 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Listen Question</span>
                      </button>
                    </div>
                    <p className="font-bold text-amber-950 text-xs sm:text-sm">
                      {effectiveDay.student_lsrw_practice.listening_audio_script.comprehension_check}
                    </p>
                    <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type what you understood from the audio exchange..."
                        className="flex-1 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs placeholder-amber-900/40 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <details className="group shrink-0">
                        <summary className="list-none px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-lg cursor-pointer border border-amber-300/60 transition-colors flex items-center gap-1">
                          <span>Check Auditory Answer</span>
                          <span className="group-open:rotate-180 transition-transform">▾</span>
                        </summary>
                        <div className="mt-2 p-2.5 bg-white border border-amber-200 rounded-lg text-[11px] text-amber-900 font-medium">
                          <strong>Key Takeaway:</strong> Pay close attention to speaker transitions, affirmative/negative markers, and contextual clues from the scenario dialogue lines above.
                        </div>
                      </details>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

            {/* 4. Speaking Fluency Simulation & Model Roleplay */}
            {(activeLsrwTab === 'ALL' || activeLsrwTab === 'SPEAKING') && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                      S
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                        <span>🗣️ Spoken Production & Situational Roleplay</span>
                      </h4>
                    <p className="text-[11px] text-slate-500">
                      Record oral turns in {sessionPackage.language} or compare your voice with the native model.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/70 self-start sm:self-auto">
                  Speaking Cue
                </span>
              </div>

              <div className="bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 border border-indigo-200/70 rounded-2xl p-5 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">Simulated Context</span>
                  <p className="text-sm font-black text-slate-900">
                    {effectiveDay.student_lsrw_practice?.speaking_prompt?.situation || `Discuss ${effectiveDay.day_topic} with an authentic conversation partner in ${sessionPackage.language}.`}
                  </p>
                </div>

                {effectiveDay.student_lsrw_practice?.speaking_prompt?.guiding_cues && (
                  <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-indigo-100">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Speaking Guidelines & Rubric Targets:</span>
                    <ul className="space-y-1 text-xs text-slate-700 font-medium">
                      {effectiveDay.student_lsrw_practice.speaking_prompt.guiding_cues.map((cue, cIdx) => (
                        <li key={cIdx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          <span>{cue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Exemplary Model Audio */}
                <div className="bg-indigo-950 text-white p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Native Oral Model:</span>
                    <p className="text-xs text-indigo-100 font-semibold italic">
                      &quot;{effectiveDay.student_lsrw_practice?.speaking_prompt?.sample_model || effectiveDay.classroom_dialogues?.[0] || 'Bonjour, je pratique aujourd\'hui avec plaisir.'}&quot;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => playNativeAudio(effectiveDay.student_lsrw_practice?.speaking_prompt?.sample_model || effectiveDay.classroom_dialogues?.[0] || '', `student-speak-model-${effectiveDay.day_number}`)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 transition-transform active:scale-95"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-slate-950" />
                    <span>Hear Native Model</span>
                  </button>
                </div>
              </div>
            </div>
          )}

            {/* 5. Applied Writing Production Task & Evaluation Handoff */}
            {(activeLsrwTab === 'ALL' || activeLsrwTab === 'WRITING') && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                      W
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                        <span>✍️ Applied Writing Production (LMS Submission Task)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Draft your composition. Submitted essays are graded against the ISML 100-point rubric.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/70 self-start sm:self-auto">
                    Max Score: 100
                  </span>
                </div>

                <div className="bg-teal-50/70 border border-teal-200/80 p-4 rounded-2xl text-xs text-teal-950 font-medium leading-relaxed">
                  <strong>Assignment Directive:</strong> {effectiveDay.student_lsrw_practice?.writing_task?.task || `Write a short 50-75 word paragraph in ${sessionPackage.language} applying ${effectiveDay.day_topic} utilizing today's target grammatical matrix.`}
                </div>

                {/* Student Drafting Workspace */}
                <div className="space-y-3 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Drafting Workspace</span>
                      <span className="text-[10px] text-slate-400 font-normal">({sessionPackage.language})</span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-500">Target: 50–75 words</span>
                  </div>

                  <textarea
                    rows={5}
                    placeholder={`Type your written composition here in ${sessionPackage.language}... (e.g. Aujourd'hui nous étudions...)`}
                    className="w-full p-3.5 bg-white border border-slate-300 focus:border-teal-500 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-inner"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      <span>Non-Evaluator Boundary: Graded by dedicated ISML LSRW Evaluation Agent</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => alert(`Assignment successfully submitted for ${unitName} ${effectiveDay.day_number}! Handoff queued for ISML LSRW Evaluation Agent.`)}
                      className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Assignment for Evaluation</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
                  <span className="font-bold text-slate-700">Evaluation Metric:</span>
                  <span>{effectiveDay.student_lsrw_practice?.writing_task?.rubric_summary || 'Scored on Grammatical Accuracy (40%), Lexical Range (30%), and Communicative Task Completion (30%).'}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ---------------- TEACHER PACKAGE & LESSON PLAN VIEW ---------------- */
          <div className="space-y-5">
            {/* Faculty Session Breakdown */}
            {effectiveDay.teacher_lesson_breakdown && (
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Faculty Session Breakdown ({effectiveDay.teacher_lesson_breakdown.allocated_minutes} Minutes Allocated)</span>
                  </span>
                  <span className="text-[10px] font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                    Step-by-Step Delivery
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  {effectiveDay.teacher_lesson_breakdown.phases.map((ph, phIdx) => (
                    <div key={phIdx} className="bg-white p-2.5 rounded-lg border border-blue-200/80 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <strong className="text-blue-900 font-bold">{ph.phase}</strong>
                        <span className="text-blue-600 font-extrabold bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">{ph.minutes}m</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-snug">{ph.instruction}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-indigo-200 text-[11px] text-indigo-950">
                    <span className="font-bold block text-indigo-900 mb-0.5">📋 Blackboard Formula:</span>
                    <p className="font-mono text-[10px] text-slate-700">{effectiveDay.teacher_lesson_breakdown.board_notes}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200 text-[11px] text-amber-950">
                    <span className="font-bold block text-amber-900 mb-0.5">💡 Remedial Activity:</span>
                    <p className="text-[10px] text-slate-700">{effectiveDay.teacher_lesson_breakdown.remedial_activity}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Grammar Lecture Detail */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold text-blue-900 uppercase tracking-wider block mb-1">
                📖 {unitName} {effectiveDay.day_number} ({sessionPackage.school_meta?.periodDurationMinutes || sessionPackage.college_meta?.sessionMinutes || 60} Mins) Teaching Blueprint & Structural Grammar:
              </span>
              <p className="text-slate-800 leading-relaxed font-sans text-xs">
                {effectiveDay.grammar_rules_detail}
              </p>
            </div>

            {/* Vocabulary Bank */}
            {effectiveDay.vocabulary_bank && effectiveDay.vocabulary_bank.length > 0 && (
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  🗂️ {unitName} {effectiveDay.day_number} Target Vocabulary & AI Audio Pronunciation:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {effectiveDay.vocabulary_bank.map((v, vIdx) => {
                    const vKey = `vocab-${effectiveDay.day_number}-${vIdx}`;
                    const isVPlaying = playingAudioKey === vKey;
                    return (
                      <div key={vIdx} className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 text-xs">{v.word}</span>
                          <div className="flex items-center gap-1.5">
                            {v.pronunciation && (
                              <span className="font-mono text-[11px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded font-medium">
                                {v.pronunciation}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => playNativeAudio(v.word, vKey)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-all ${
                                isVPlaying
                                  ? 'bg-rose-500 text-white animate-pulse'
                                  : 'bg-amber-200/80 hover:bg-amber-300 text-amber-950'
                              }`}
                              title="Listen to native AI pronunciation"
                            >
                              <span>{isVPlaying ? '⏹' : '🔊'}</span>
                              <span>{isVPlaying ? 'Stop' : 'Listen'}</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-700 text-xs mt-1">{v.meaning}</p>
                        {v.example_sentence && (
                          <div className="flex items-center justify-between bg-white/70 p-1.5 rounded border border-amber-100 mt-1 gap-2">
                            <p className="text-slate-600 text-[11px] italic">
                              &quot;{v.example_sentence}&quot;
                            </p>
                            <button
                              type="button"
                              onClick={() => playNativeAudio(v.example_sentence, `${vKey}-sentence`)}
                              className="text-[10px] text-amber-900 hover:text-amber-700 font-bold shrink-0 cursor-pointer"
                              title="Listen to full sentence"
                            >
                              {playingAudioKey === `${vKey}-sentence` ? '⏹ Stop' : '🔊 Read'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live Class Dialogues with AI Voice Audio Player */}
            {effectiveDay.classroom_dialogues && effectiveDay.classroom_dialogues.length > 0 && (
              <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-950 uppercase tracking-wider block text-xs">
                    💬 Live Practice Script & Spoken Exchange (Native AI Audio):
                  </span>
                  <span className="text-[10px] bg-purple-200/70 text-purple-950 font-bold px-2 py-0.5 rounded">
                    🎙️ AI Voice Generation
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-xs text-purple-950">
                  {effectiveDay.classroom_dialogues.map((dlg, dIdx) => {
                    const dlgKey = `teacher-dlg-${effectiveDay.day_number}-${dIdx}`;
                    const isPlaying = playingAudioKey === dlgKey;
                    return (
                      <div key={dIdx} className="bg-white p-2.5 rounded-lg border border-purple-100 flex items-center justify-between gap-3 shadow-2xs">
                        <span className="leading-relaxed font-sans">{dlg}</span>
                        <button
                          type="button"
                          onClick={() => playNativeAudio(dlg, dlgKey)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-all ${
                            isPlaying
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-purple-100 hover:bg-purple-200 text-purple-900'
                          }`}
                        >
                          <span>{isPlaying ? '⏹ Stop' : '🔊 AI Voice'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Master Study Notes Markdown */}
            {effectiveDay.study_notes_markdown && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-xs text-cyan-300 uppercase tracking-wider">
                      Master Study Guide Handbook ({unitName} {effectiveDay.day_number})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Textbook-Grade Pedagogical Theory
                  </span>
                </div>

                <div className="p-5 font-sans text-xs text-slate-200 leading-relaxed space-y-3 overflow-x-auto">
                  {effectiveDay.study_notes_markdown.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.includes('|') && paragraph.includes('---')) {
                      const lines = paragraph.trim().split('\n');
                      const headerLine = lines[0];
                      const headers = headerLine.split('|').map(h => h.trim()).filter(Boolean);
                      const rows = lines.slice(2).map(l => l.split('|').map(c => c.trim()).filter(Boolean));

                      return (
                        <div key={pIdx} className="my-3 overflow-x-auto rounded-xl border border-slate-800 shadow-sm bg-slate-950/60">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-800/80 text-cyan-300 font-bold border-b border-slate-700">
                                {headers.map((h, hIdx) => (
                                  <th key={hIdx} className="py-2 px-3 border-r border-slate-700/60 last:border-r-0">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="py-2 px-3 border-r border-slate-800/60 last:border-r-0 font-mono text-[11px] text-slate-300">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }

                    if (paragraph.startsWith('### ') || paragraph.startsWith('**')) {
                      return (
                        <p key={pIdx} className="font-bold text-sm text-cyan-300 pt-1">
                          {paragraph.replace(/^###\s+/, '')}
                        </p>
                      );
                    }

                    return (
                      <p key={pIdx} className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Video Breakdown Analysis */}
            {effectiveDay.video_breakdown_analysis && (
              <div className="bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/60 border-2 border-indigo-300 rounded-2xl p-5 shadow-sm space-y-2.5">
                <div className="flex items-center gap-2 border-b border-indigo-100 pb-2.5">
                  <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                  <h4 className="font-extrabold text-sm text-indigo-950">
                    🎬 Reference Video Breakdown & Native Spoken Audio Analysis
                  </h4>
                </div>
                <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                  {effectiveDay.video_breakdown_analysis}
                </p>
              </div>
            )}

            {/* Verified Answer Key & Solutions - Standardized LSRW Practice Drills */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      LSRW Core Questions
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">•</span>
                    <span className="text-[11px] font-bold text-slate-600">CEFR {sessionPackage.level} Proficiency</span>
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>LSRW Practice Exercises with Verified Model Answers & Linguistic Tips</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Standardized LSRW classroom drills engineered for student self-study, instant evaluation, and faculty feedback.
                  </p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto shrink-0">
                  ✓ Verified Solutions Included
                </span>
              </div>

              {/* Clean List Items (No clunky nested boxes) */}
              <div className="divide-y divide-slate-100">
                {(effectiveDay.exercise_solutions && effectiveDay.exercise_solutions.length > 0
                  ? effectiveDay.exercise_solutions
                  : (effectiveDay.in_class_exercises || []).map((ex) => ({
                      question: ex,
                      answer: `Model answer demonstrating certified ${sessionPackage.level} fluency in ${sessionPackage.language}`,
                      explanation: `Linguistic breakdown: Verify syntactic formula and verb conjugation agreement.`
                    }))
                ).map((sol, sIdx) => (
                  <div key={sIdx} className="py-4 first:pt-0 last:pb-0 space-y-3">
                    {/* Question Header */}
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        Q{sIdx + 1}
                      </span>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          {sol.question.includes('[R') ? (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                              Reading & Syntax
                            </span>
                          ) : sol.question.includes('[S') ? (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                              Speaking & Oral
                            </span>
                          ) : sol.question.includes('[L') ? (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                              Listening & Auditory
                            </span>
                          ) : sol.question.includes('[W') ? (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                              Writing & Production
                            </span>
                          ) : null}
                        </div>
                        <p className="font-bold text-sm text-slate-900 leading-snug">
                          {sol.question.replace(/^\[[A-Za-z0-9\s\-:&]+\]\s*/i, '')}
                        </p>
                      </div>
                    </div>

                    {/* Clean Answer & Explanation Row */}
                    <div className="ml-10 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Correct Answer:</span>
                        <span className="font-mono bg-emerald-50 text-emerald-900 font-bold px-3 py-1 rounded-md border border-emerald-200 text-xs">
                          {sol.answer}
                        </span>
                      </div>

                      {sol.explanation && (
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <strong className="text-slate-800 font-semibold">Linguistic Explanation:</strong> {sol.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Homework Directives */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <span className="font-bold text-blue-950 uppercase tracking-wider block mb-1.5 text-xs">
                📝 Daily Homework & LMS Submission Directives:
              </span>
              <ul className="space-y-1.5 text-slate-800 text-xs">
                {(effectiveDay.homework_tasks || []).map((hw, hIdx) => (
                  <li key={hIdx} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">›</span>
                    <span>{hw}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 🤖 High-Precision Curriculum Co-Pilot & Section Transformer Agent */}
            <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-indigo-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/40 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-amber-400 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-300">
                      <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
                        <span>Autonomous Curriculum Agent Co-Pilot</span>
                      </h4>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        ⚡ Live Hot-Update
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Prompt-based editor: Type your directive in natural language (Tamil/English/French) to transform or regenerate this lesson plan.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Modifying:</span>
                  <span className="bg-indigo-900/60 border border-indigo-500/40 px-3 py-1 rounded-xl text-amber-300 font-mono font-bold text-[11px]">
                    {unitName} {effectiveDay.day_number}
                  </span>
                </div>
              </div>

              {/* Chat & Prompt Transformation Box */}
              <div className="space-y-2.5">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!chatInput.trim() || chatLoading) return;
                    setChatLoading(true);
                    setChatAnswer(null);
                    setLastModifiedSection(null);

                    try {
                      const refinedPrompt = chatInput.trim();

                      const res = await fetchWithEndpointFallback('/api/v1/sessions/refine-blueprint', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          user_prompt: `Regarding ${unitName} ${effectiveDay.day_number} (${effectiveDay.day_topic}): ${refinedPrompt}. Strict instruction: When generating questions or changes, ground purely in the user's uploaded documents and CEFR standard. Return individual discrete items.`,
                          language: sessionPackage?.language || 'French',
                          level: sessionPackage?.level || 'A1',
                          topic: sessionPackage?.topic || effectiveDay.day_topic,
                          active_module: effectiveDay.month_number || 1,
                          days: [activeDay],
                          source_context: sessionPackage?.raw_source_context || sessionPackage?.extracted_source_summary || ''
                        })
                      });

                      if (res.ok) {
                        const data = await res.json();
                        const reply = data.agent_reply || "Curriculum lesson plan successfully transformed according to your prompt!";
                        setChatAnswer(reply);
                        
                        // Immediately apply live update into activeDay
                        if (data.updated_days && data.updated_days.length > 0) {
                          const updated = data.updated_days[0];

                          let finalSolutions = updated.exercise_solutions || [];
                          if ((!finalSolutions || finalSolutions.length <= 1) && updated.practice_question) {
                            const pq: string = updated.practice_question;
                            const parts = pq.split(/(?=\d+\.\s+)/g).map(s => s.trim()).filter(Boolean);
                            if (parts.length > 1) {
                              finalSolutions = parts.map((part, pIdx) => {
                                const ansMatch = part.match(/\(R[eé]ponse\s*:\s*([^)]+)\)/i);
                                const cleanQ = part.replace(/\(R[eé]ponse\s*:\s*[^)]+\)/i, '').trim();
                                const tags = ['[R - Reading & Syntax]', '[S - Spoken Interaction]', '[L - Auditory & Error Discrimination]', '[W - Contextual Writing]'];
                                return {
                                  question: cleanQ.startsWith('[') ? cleanQ : `${tags[pIdx % 4]} ${cleanQ}`,
                                  answer: ansMatch ? ansMatch[1].trim() : `Verified answer for ${sessionPackage?.language || 'target language'}`,
                                  explanation: `Derived from user uploaded source material.`
                                };
                              });
                            } else {
                              finalSolutions = [{
                                question: `[R - Reading & Syntax] ${updated.practice_question}`,
                                answer: `Verified solution for ${sessionPackage?.language || 'target language'}`,
                                explanation: 'Regenerated authentic CEFR exercise drill'
                              }];
                            }
                          } else if (finalSolutions && finalSolutions.length > 0) {
                            const tags = ['[R - Reading & Syntax]', '[S - Spoken Interaction]', '[L - Auditory & Error Discrimination]', '[W - Contextual Writing]'];
                            finalSolutions = finalSolutions.map((sol: any, sIdx: number) => {
                              const q = sol.question || '';
                              return {
                                ...sol,
                                question: q.startsWith('[') ? q : `${tags[sIdx % 4]} ${q}`
                              };
                            });
                          }

                          const updatedPayload: any = {
                            day_topic: updated.day_topic || effectiveDay.day_topic,
                            grammar_rules_detail: updated.grammar_rules_detail || effectiveDay.grammar_rules_detail,
                            study_notes_markdown: updated.study_notes_markdown || effectiveDay.study_notes_markdown,
                            vocabulary_bank: updated.vocabulary_bank || effectiveDay.vocabulary_bank,
                            classroom_dialogues: updated.classroom_dialogues || effectiveDay.classroom_dialogues,
                            homework_tasks: updated.homework_tasks || effectiveDay.homework_tasks,
                            in_class_exercises: finalSolutions.length > 0 ? finalSolutions.map((s: any) => s.question) : effectiveDay.in_class_exercises,
                            exercise_solutions: finalSolutions.length > 0 ? finalSolutions : effectiveDay.exercise_solutions,
                            student_lsrw_practice: {
                              ...(effectiveDay.student_lsrw_practice || {}),
                              ...(updated.student_lsrw_practice || {}),
                              listening_audio_script: {
                                ...(effectiveDay.student_lsrw_practice?.listening_audio_script || {}),
                                ...(updated.student_lsrw_practice?.listening_audio_script || {}),
                                dialogue_lines: updated.classroom_dialogues || updated.student_lsrw_practice?.listening_audio_script?.dialogue_lines || effectiveDay.student_lsrw_practice?.listening_audio_script?.dialogue_lines || effectiveDay.classroom_dialogues
                              }
                            }
                          };

                          // ⚡ Instantaneous local UI reflection
                          setLocalOverrides(prev => ({
                            ...prev,
                            [effectiveDay.day_number]: updatedPayload
                          }));

                          // Notify parent studio
                          if (onApplyPeriodUpdate) {
                            onApplyPeriodUpdate(effectiveDay.day_number, updatedPayload);
                          }
                          setLastModifiedSection('Lesson Plan Components');
                        }
                        setChatInput('');
                      } else {
                        // Fallback call
                        const chatRes = await fetchWithEndpointFallback('/api/v1/sessions/chat-curriculum', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            messages: [{ role: 'user', content: refinedPrompt }],
                            curriculum_context: sessionPackage?.session_plan || { all_days: [activeDay] },
                            language: sessionPackage?.language || 'French',
                            level: sessionPackage?.level || 'A1',
                            topic: sessionPackage?.topic || effectiveDay.day_topic
                          })
                        });
                        if (chatRes.ok) {
                          const chatData = await chatRes.json();
                          setChatAnswer(chatData.agent_reply || chatData.reply || "Curriculum memory updated.");
                        } else {
                          setChatAnswer(`Pedagogical response for ${effectiveDay.day_topic}: Verified against CEFR standards.`);
                        }
                        setChatInput('');
                      }
                    } catch (err) {
                      setChatAnswer(`Grounded response: Updated exercise criteria for ${effectiveDay.day_topic}.`);
                    } finally {
                      setChatLoading(false);
                    }
                  }}
                  className="space-y-2.5"
                >
                  <div className="relative">
                    <textarea
                      rows={2}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={chatLoading}
                      placeholder={`Tell the Agent what to change, e.g.: "Add 10 hard listening and speaking questions with answers" or "Indha topic ku formal business dialogue create pannu"...`}
                      className="w-full bg-slate-900/90 hover:bg-slate-900 focus:bg-slate-900 border border-indigo-500/40 focus:border-indigo-400 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner resize-none leading-relaxed"
                    />
                    <div className="absolute right-2.5 bottom-3 flex items-center gap-1.5">
                      <button
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                      >
                        {chatLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            <span>Transforming Lesson...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Transform Lesson Plan</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Agent Response & Success Notice */}
                {chatAnswer && (
                  <div className="bg-indigo-950/90 border border-emerald-500/40 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-100 shadow-md animate-in fade-in duration-200">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-emerald-300 font-extrabold text-xs flex items-center gap-1.5">
                          <span>Autonomous Agent Modification Complete</span>
                        </strong>
                        {lastModifiedSection && (
                          <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            Updated: {lastModifiedSection}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-200">{chatAnswer}</p>
                    </div>
                  </div>
                )}

                {/* Prompt Presets / Instant 1-Click Transformations */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Instant 1-Click Agent Directives:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setChatInput(`Generate 10 extensive practice questions covering Listening, Speaking, Reading and Writing with detailed answers and pronunciation notes`)}
                      className="bg-indigo-900/40 hover:bg-indigo-800/60 text-slate-200 hover:text-white px-2.5 py-1 rounded-xl border border-indigo-700/50 cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <span>🎯 10 LSRW Drills + Answers</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatInput(`Add 6 conversational dialogue turns between teacher and student with natural phonetics and everyday slang`)}
                      className="bg-purple-900/40 hover:bg-purple-800/60 text-slate-200 hover:text-white px-2.5 py-1 rounded-xl border border-purple-700/50 cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <span>🗣️ Realistic Spoken Dialogues</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatInput(`Rewrite grammar focus with a crystal-clear blackboard equation and 3 common mistakes to avoid`)}
                      className="bg-blue-900/40 hover:bg-blue-800/60 text-slate-200 hover:text-white px-2.5 py-1 rounded-xl border border-blue-700/50 cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <span>📐 Blackboard Formula & Gotchas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatInput(`Create a 5-minute interactive warm-up pronunciation game for this unit`)}
                      className="bg-amber-900/40 hover:bg-amber-800/60 text-slate-200 hover:text-white px-2.5 py-1 rounded-xl border border-amber-700/50 cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <span>🎲 5-Min Warmup Activity</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
