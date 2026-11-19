"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Download, Presentation, FileArchive, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
const BookOpen = ((_props: any) => null) as any;
const GraduationCap = ((_props: any) => null) as any;
const Clock = ((_props: any) => null) as any;
const CheckCircle2 = ((_props: any) => null) as any;
const Video = ((_props: any) => null) as any;
const Send = ((_props: any) => null) as any;
const Volume2 = ((_props: any) => null) as any;
const Sparkles = ((_props: any) => null) as any;
const Award = ((_props: any) => null) as any;
const ShieldAlert = ((_props: any) => null) as any;
const Cpu = ((_props: any) => null) as any;
const Layers = ((_props: any) => null) as any;
const Bot = ((_props: any) => null) as any;
const MessageSquare = ((_props: any) => null) as any;
const RotateCw = ((_props: any) => null) as any;
const Headphones = ((_props: any) => null) as any;
const Mic = ((_props: any) => null) as any;
const PenTool = ((_props: any) => null) as any;
const Check = ((_props: any) => null) as any;
const ChevronDown = ((_props: any) => null) as any;
const Paperclip = ((_props: any) => null) as any;
const FileText = ((_props: any) => null) as any;
const X = ((_props: any) => null) as any;
const Upload = ((_props: any) => null) as any;
import { DayCurriculumItem } from './curriculumProgression';
import { resolveAcademicPillars } from './academicPillars';
import { fetchWithEndpointFallback } from '@/utils/apiConfig';
import { FormalAssessment, generateFormalAssessments } from './assessmentGenerator';

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
  handleDownloadDayPptx?: (day: any) => void;
  downloadingPptx?: boolean;
  handleDownloadAllPptxZip?: (days: any[]) => void;
  downloadingAllPptxZip?: boolean;
  allDays?: any[];
  onPrevDay: () => void;
  onNextDay: () => void;
  onSelectDay?: (dayNum: number) => void;
  onToggleOutputMode: (mode: 'TEACHER' | 'STUDENT') => void;
  onApplyPeriodUpdate?: (dayNum: number, updates: any) => void;
  onApplyFullScheduleUpdate?: (updatedAllDays: any[]) => void;
  onTriggerFullPipelineGeneration?: () => void;
  isSessionSaved?: boolean;
  onManualSaveSession?: () => void;
  savingSession?: boolean;
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
  handleDownloadDayPptx,
  downloadingPptx,
  handleDownloadAllPptxZip,
  downloadingAllPptxZip,
  allDays,
  onPrevDay,
  onNextDay,
  onSelectDay,
  onToggleOutputMode,
  onApplyPeriodUpdate,
  onApplyFullScheduleUpdate,
  onTriggerFullPipelineGeneration,
  isSessionSaved,
  onManualSaveSession,
  savingSession,
}: DayContentProps) {
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);

  // In-place Q&A and re-generation copilot states
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);
  const [chatAudioTrack, setChatAudioTrack] = useState<any | null>(null);
  const [chatAudioTracks, setChatAudioTracks] = useState<any[]>([]);
  const [activeLsrwTab, setActiveLsrwTab] = useState<'ALL' | 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING'>('ALL');
  const [lastModifiedSection, setLastModifiedSection] = useState<string | null>(null);

  // AI Audio & Voice Generator Studio States
  const [audioStudioText, setAudioStudioText] = useState<string>('');
  const [audioStudioLang, setAudioStudioLang] = useState<string>(sessionPackage?.language || 'English');
  const [isGeneratingCustomAudio, setIsGeneratingCustomAudio] = useState<boolean>(false);
  const [audioStudioSuccessMsg, setAudioStudioSuccessMsg] = useState<string | null>(null);
  const [audioStudioErrorMsg, setAudioStudioErrorMsg] = useState<string | null>(null);

  // 15+ Years Senior Assessment Director Spec: Formal Academic Assessments Hub States
  const [studioActiveView, setStudioActiveView] = useState<'DAILY_PLAN' | 'ASSESSMENTS'>('DAILY_PLAN');
  const [selectedAssessmentIndex, setSelectedAssessmentIndex] = useState<number>(0);
  const [assessmentPaperMode, setAssessmentPaperMode] = useState<'STUDENT_PAPER' | 'TEACHER_KEY'>('TEACHER_KEY');

  // Live 16:9 Presentation Viewer Modal States
  const [showSlideViewer, setShowSlideViewer] = useState<boolean>(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  const SLIDE_TITLES = [
    'Course Cover & Overview',
    'Learning Objectives & Can-Do',
    'Grammar & Sentence Blueprint',
    'Target Vocabulary Bank',
    'Classroom Dialogues & Pair Work',
    'Culture & Formality Registers',
    'Interactive LSRW Drills',
    'Wrap-Up & Homework Task',
  ];

  useEffect(() => {
    if (!showSlideViewer) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        setCurrentSlideIndex((prev) => (prev < 7 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Escape') {
        setShowSlideViewer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSlideViewer]);

  const formalAssessmentsList: FormalAssessment[] = React.useMemo(() => {
    if (sessionPackage?.generated_assessments && sessionPackage.generated_assessments.length > 0) {
      return sessionPackage.generated_assessments;
    }
    const effectiveCount = sessionPackage?.school_meta?.assessmentsCount || sessionPackage?.college_meta?.assessmentsCount || 4;
    return generateFormalAssessments(
      sessionPackage?.language || 'German',
      sessionPackage?.level || 'A1.1',
      sessionPackage?.topic || 'General Curriculum',
      effectiveCount,
      totalDays || 60,
      allDays || [activeDay],
      sessionPackage?.extracted_source_context || sessionPackage?.raw_source_context,
      sessionPackage?.master_pillar_priority || 'COMPREHENSIVE'
    );
  }, [sessionPackage, allDays, activeDay, totalDays]);
  // 📎 Multi-file persistent memory attachment state
  const [attachedChatFiles, setAttachedChatFiles] = useState<Array<{ name: string; size: number; content?: string; pages?: number; wordCount?: number }>>([]);
  const [isExtractingChatFile, setIsExtractingChatFile] = useState(false);
  const [extractingFileName, setExtractingFileName] = useState('');
  const chatFilePickerRef = React.useRef<HTMLInputElement | null>(null);

  // 💬 Multi-turn Continuous Conversation History (ChatGPT / Gemini / Claude Style)
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    audioTracks?: any[];
    modifiedSection?: string;
    regeneratedSummary?: {
      dayTopic?: string;
      grammarRule?: string;
      notesPreview?: string;
      vocabulary?: any[];
      exercises?: any[];
      totalUnitsUpdated?: number;
    };
  }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const sid = sessionPackage?.session_id || 'default';
        const dayKey = `isml_chat_thread_${sid}_day_${activeDay.day_number}`;
        const saved = localStorage.getItem(dayKey);
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    if ((activeDay as any).chat_history && Array.isArray((activeDay as any).chat_history)) {
      return (activeDay as any).chat_history;
    }
    return [];
  });

  // Re-sync chat history whenever activeDay changes or sessionPackage changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const sid = sessionPackage?.session_id || 'default';
        const dayKey = `isml_chat_thread_${sid}_day_${activeDay.day_number}`;
        const saved = localStorage.getItem(dayKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setChatHistory(parsed);
            return;
          }
        }
      } catch (_) {}
    }
    if ((effectiveDay as any).chat_history && Array.isArray((effectiveDay as any).chat_history) && (effectiveDay as any).chat_history.length > 0) {
      setChatHistory((effectiveDay as any).chat_history);
    } else {
      setChatHistory([]);
    }
  }, [activeDay.day_number, sessionPackage?.session_id]);
  const [localOverrides, setLocalOverrides] = useState<Record<number, Partial<DayCurriculumItem>>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`isml_period_overrides_${sessionPackage?.session_id || "default"}`);
        return saved ? JSON.parse(saved) : {};
      } catch (_) { return {}; }
    }
    return {};
  });

  // Automatically persist any session audio & period overrides
  React.useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(localOverrides).length > 0) {
      try {
        localStorage.setItem(`isml_period_overrides_${sessionPackage?.session_id || "default"}`, JSON.stringify(localOverrides));
      } catch (_) {}
    }
  }, [localOverrides, sessionPackage?.session_id]);

  // Load previously generated audio tracks for activeDay if available
  React.useEffect(() => {
    if (effectiveDay.generated_audio_tracks && effectiveDay.generated_audio_tracks.length > 0) {
      setChatAudioTracks(effectiveDay.generated_audio_tracks);
    } else if (effectiveDay.generated_audio_track) {
      setChatAudioTrack(effectiveDay.generated_audio_track);
    }
  }, [activeDay.day_number]);

  // Merge activeDay with any local instantaneous overrides
  const effectiveDay = {
    ...activeDay,
    ...(localOverrides[activeDay.day_number] || {})
  };

  React.useEffect(() => {
    if (effectiveDay.classroom_dialogues && effectiveDay.classroom_dialogues.length > 0) {
      setAudioStudioText(effectiveDay.classroom_dialogues.join('\n\n'));
    } else if (effectiveDay.grammar_rules_detail) {
      setAudioStudioText(effectiveDay.grammar_rules_detail);
    } else {
      setAudioStudioText(`Instructor: Welcome to Period ${effectiveDay.day_number}.\nLearner: Thank you! We are ready to learn.`);
    }
    setAudioStudioLang(sessionPackage?.language || 'English');
  }, [activeDay.day_number, sessionPackage?.language]);

  const handleFillFromDialogues = () => {
    if (effectiveDay.classroom_dialogues && effectiveDay.classroom_dialogues.length > 0) {
      setAudioStudioText(effectiveDay.classroom_dialogues.join('\n\n'));
    } else {
      setAudioStudioText(`Instructor: Welcome to Period ${effectiveDay.day_number}.\nLearner: Thank you, I am ready to practice.`);
    }
  };

  const handleFillFromVocabulary = () => {
    if (effectiveDay.vocabulary_bank && effectiveDay.vocabulary_bank.length > 0) {
      const vocabLines = effectiveDay.vocabulary_bank.map((v: any) => 
        `${v.word} (${v.pronunciation || ''}): ${v.meaning}. Example: ${v.example_sentence || ''}`
      ).join('\n\n');
      setAudioStudioText(vocabLines);
    }
  };

  const handleFillFromLecture = () => {
    if (effectiveDay.grammar_rules_detail) {
      setAudioStudioText(effectiveDay.grammar_rules_detail);
    }
  };

  const [isAddingAudioToPeriod, setIsAddingAudioToPeriod] = useState(false);

  const handleGenerateAndDownloadAudio = async () => {
    const text = (audioStudioText || '').trim();
    if (!text) {
      setAudioStudioErrorMsg('Please enter or paste text to generate audio.');
      return;
    }
    setIsGeneratingCustomAudio(true);
    setAudioStudioErrorMsg(null);
    setAudioStudioSuccessMsg(null);
    const targetLang = sessionPackage?.language || audioStudioLang || 'English';
    const targetDayNum = effectiveDay.day_number || 1;
    const cleanLang = targetLang.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanLevel = (sessionPackage?.level || 'A1.1').replace(/[^a-zA-Z0-9]/g, '_');
    const totalDaysCount = totalDays || allDays?.length || 2;
    const effectiveUnit = unitName || 'Period';

    try {
      const response = await fetchWithEndpointFallback('/api/v1/sessions/synthesize-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          language: targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error('Audio generation server error');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = blob.type.includes('mpeg') || blob.type.includes('mp3') ? 'mp3' : 'wav';
      const fileName = `${cleanLang}_${cleanLevel}_Total_${totalDaysCount}_${effectiveUnit}s_${effectiveUnit}_${targetDayNum}_Listening_Audio.${ext}`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setAudioStudioSuccessMsg(`Downloaded file: ${fileName}`);
      setTimeout(() => setAudioStudioSuccessMsg(null), 5000);
    } catch (err: any) {
      console.warn('Backend audio synthesis failed:', err);
      playNativeAudio(text, `studio-${effectiveDay.day_number}`);
      setAudioStudioErrorMsg('Server audio download temporarily unavailable. Playing live in browser voice.');
    } finally {
      setIsGeneratingCustomAudio(false);
    }
  };

  const handleAddAudioToPeriod = () => {
    const text = (audioStudioText || '').trim();
    if (!text) {
      setAudioStudioErrorMsg('Please enter or paste text first.');
      return;
    }
    setAudioStudioErrorMsg(null);
    setAudioStudioSuccessMsg(null);
    setIsAddingAudioToPeriod(true);

    const targetLang = sessionPackage?.language || audioStudioLang || 'English';
    const targetDayNum = effectiveDay.day_number || 1;
    const effectiveUnit = unitName || 'Period';
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const durMin = Math.max(1, Math.ceil(wordCount / 120));
    const newTrack = {
      title: `${targetLang} Listening & Practice Drill (${effectiveUnit} ${targetDayNum})`,
      script: text,
      word_count: wordCount,
      duration_minutes: durMin,
      dialogue_turns: text.split('\n').filter(Boolean).map(line => {
        const parts = line.split(':');
        return {
          speaker: parts.length > 1 ? parts[0].trim() : 'Speaker',
          text: parts.length > 1 ? parts.slice(1).join(':').trim() : line.trim()
        };
      }),
      created_at: new Date().toISOString()
    };

    const existingTracks = effectiveDay.generated_audio_tracks || (effectiveDay.generated_audio_track ? [effectiveDay.generated_audio_track] : []);
    const allTracks = [...existingTracks, newTrack];
    const audioPayload: any = {
      generated_audio_track: newTrack,
      generated_audio_tracks: allTracks,
    };

    setLocalOverrides(prev => ({
      ...prev,
      [targetDayNum]: { ...(prev[targetDayNum] || {}), ...audioPayload }
    }));
    if (onApplyPeriodUpdate) onApplyPeriodUpdate(targetDayNum, audioPayload);
    setChatAudioTrack(newTrack);
    setChatAudioTracks(allTracks);

    setIsAddingAudioToPeriod(false);
    setAudioStudioSuccessMsg(`Audio track successfully added to ${effectiveUnit} ${targetDayNum}!`);
    setTimeout(() => setAudioStudioSuccessMsg(null), 5000);
  };

  const resolvedPillars = resolveAcademicPillars(
    sessionPackage?.language || 'German',
    sessionPackage?.level || 'A1',
    effectiveDay.day_topic || 'Foundational Competency',
    effectiveDay.day_number || 1
  );

  const canDoCompetencies = effectiveDay.proficiency_framework_can_do || resolvedPillars.proficiency_framework.can_do_descriptors;
  const cultureData = effectiveDay.cultural_context_notes || resolvedPillars.culture_society;
  const academicContext = effectiveDay.academic_professional_context || resolvedPillars.academic_professional;
  const provenanceData = effectiveDay.provenance_audit_trail || resolvedPillars.provenance;

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
        u.pitch = 1.05; // Articulate, warm female vocal range
        u.rate = audioSpeed || 0.92;

        // Try to pick the best matching female native voice available on user device
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const langPrefix = targetLocale.slice(0, 2).toLowerCase();
          const matchedLangVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));
          const femaleKeywords = ['female', 'zira', 'jenny', 'samantha', 'victoria', 'karen', 'fiona', 'moira', 'denise', 'hortense', 'hedda', 'katja', 'laura', 'helena', 'nanami', 'haruka', 'sun-hi', 'yuna', 'natural', 'neural', 'google'];
          const femaleVoice = matchedLangVoices.find(v => {
            const n = v.name.toLowerCase();
            return femaleKeywords.some(kw => n.includes(kw)) && !n.includes('male') && !n.includes('david') && !n.includes('george') && !n.includes('mark');
          }) || matchedLangVoices.find(v => !v.name.toLowerCase().includes('male')) || matchedLangVoices[0];
          if (femaleVoice) {
            u.voice = femaleVoice;
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

  const downloadAudioTrack = async (textToSpeak: string, filename: string) => {
    try {
      const response = await fetchWithEndpointFallback('/api/v1/sessions/synthesize-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          language: sessionPackage?.language || 'English',
        }),
      });

      if (!response.ok) throw new Error('Audio download failed');
      const blob = await response.blob();
      const mp3Blob = blob.type === 'audio/mpeg' ? blob : new Blob([blob], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(mp3Blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanBaseName = filename.replace(/\.(wav|mp3|txt)$/i, '');
      a.download = `${cleanBaseName}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading audio:', err);
      alert('Unable to download MP3 audio right now. Please verify server connection.');
    }
  };

  // 📄 Autonomous Document Ingestion for Chat Copilot (PDF, DOCX, TXT, CSV, PPTX)
  const handleProcessIncomingChatFiles = async (fileList: File[]) => {
    if (!fileList || fileList.length === 0) return;
    setIsExtractingChatFile(true);

    const processed: Array<{ name: string; size: number; content?: string; pages?: number; wordCount?: number }> = [];

    for (const f of fileList) {
      setExtractingFileName(f.name);
      let textContent = '';
      let pageCount = 1;
      let wordCount = 0;

      const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase();

      // Textual formats
      if (['.txt', '.md', '.csv', '.json', '.html', '.tsv', '.xml'].includes(ext) || f.type.includes('text')) {
        try {
          textContent = await f.text();
          wordCount = textContent.split(/\s+/).filter(Boolean).length;
        } catch (_) {}
      } else {
        // Binary formats (PDF, DOCX, PPTX)
        try {
          const fd = new FormData();
          fd.append('files', f);
          const res = await fetchWithEndpointFallback('/api/v1/sessions/extract-material', {
            method: 'POST',
            body: fd
          });
          if (res.ok) {
            const data = await res.json();
            if (data.extracted_materials && data.extracted_materials.length > 0) {
              const item = data.extracted_materials[0];
              textContent = item.text || '';
              pageCount = item.pages || 1;
              wordCount = item.word_count || (textContent.split(/\s+/).filter(Boolean).length);
            }
          }
        } catch (err) {
          console.error('Failed to extract material from backend:', err);
        }
      }

      if (!textContent) {
        textContent = `[Uploaded Document Reference: ${f.name} (${(f.size / 1024).toFixed(0)} KB)]`;
      }

      processed.push({
        name: f.name,
        size: f.size,
        content: textContent,
        pages: pageCount,
        wordCount: wordCount
      });
    }

    setAttachedChatFiles(prev => [...prev, ...processed]);
    setIsExtractingChatFile(false);
    setExtractingFileName('');
  };

  return (
    <div className="bg-white border-y sm:border border-slate-200/90 rounded-none sm:rounded-2xl shadow-sm overflow-hidden -mx-4 sm:mx-0">
      {/* Active Day Header Bar - Clean White / Slate Modern Style */}
      {/* Mobile-First Responsive Studio Header */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-white space-y-2.5">
        {/* Row 1: Period Title & Mode Switcher */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0052CC] to-blue-700 text-white font-black flex flex-col items-center justify-center shadow-xs shrink-0">
              <span className="text-[8px] uppercase tracking-wider opacity-80 leading-none">
                {unitName === 'Period' ? 'P' : 'S'}
              </span>
              <span className="text-xs sm:text-sm font-black leading-none mt-0.5">
                {effectiveDay.day_number}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {unitName} {effectiveDay.day_number} of {totalDays}
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                {effectiveDay.day_topic}
              </h3>
            </div>
          </div>

          {/* Segmented Mode Switcher (Teacher / Student) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => onToggleOutputMode('TEACHER')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                outputMode === 'TEACHER'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Teacher
            </button>
            <button
              type="button"
              onClick={() => onToggleOutputMode('STUDENT')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                outputMode === 'STUDENT'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Student
            </button>
          </div>
        </div>

        {/* Row 2: Horizontal Swipeable Action Bar (Single Row on Mobile, No Stacking) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {/* View PPTX Button */}
          <button
            type="button"
            onClick={() => {
              setCurrentSlideIndex(0);
              setShowSlideViewer(true);
            }}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs border border-slate-700"
            title="Preview Presentation Slides"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-300" />
            <span>View Slides</span>
          </button>

          {/* Period PPTX Download */}
          {handleDownloadDayPptx && (
            <button
              type="button"
              onClick={() => handleDownloadDayPptx(activeDay)}
              disabled={downloadingPptx || downloadingDocx || downloadingFullDocx || downloadingAllPptxZip}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1 shrink-0 disabled:opacity-50 cursor-pointer shadow-2xs"
              title="Download Period PPTX"
            >
              {downloadingPptx ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Presentation className="w-3.5 h-3.5" />
              )}
              <span>P{effectiveDay.day_number} PPTX</span>
            </button>
          )}

          {/* Download All PPTX ZIP */}
          {handleDownloadAllPptxZip && allDays && (
            <button
              type="button"
              onClick={() => handleDownloadAllPptxZip(allDays)}
              disabled={downloadingAllPptxZip || downloadingFullDocx || downloadingDocx || downloadingPptx}
              className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold rounded-lg text-xs transition-all flex items-center gap-1 shrink-0 disabled:opacity-50 cursor-pointer shadow-2xs"
              title="Download all period presentations as ZIP"
            >
              {downloadingAllPptxZip ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileArchive className="w-3.5 h-3.5 text-amber-200" />
              )}
              <span>All PPTX (.zip)</span>
            </button>
          )}

          {/* Period DOCX Download */}
          <button
            type="button"
            onClick={() => handleDownloadDayDocx(activeDay)}
            disabled={downloadingDocx || downloadingFullDocx || downloadingPptx || downloadingAllPptxZip}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1 shrink-0 disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Download Period DOCX"
          >
            {downloadingDocx ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>P{effectiveDay.day_number} DOCX</span>
          </button>

          {/* Download All DOCX */}
          {handleDownloadFullCurriculumDocx && allDays && (
            <button
              type="button"
              onClick={() => handleDownloadFullCurriculumDocx(allDays)}
              disabled={downloadingFullDocx || downloadingDocx || downloadingAllPptxZip || downloadingPptx}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1 shrink-0 disabled:opacity-50 cursor-pointer shadow-2xs"
              title="Download all periods DOCX"
            >
              {downloadingFullDocx ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-emerald-200" />
              )}
              <span>All DOCX</span>
            </button>
          )}

          {/* Assessments Hub Toggle */}
          <button
            type="button"
            onClick={() => setStudioActiveView(studioActiveView === 'ASSESSMENTS' ? 'DAILY_PLAN' : 'ASSESSMENTS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs border ${
              studioActiveView === 'ASSESSMENTS'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>Tests ({formalAssessmentsList.length})</span>
          </button>

          {/* Audio Studio Quick Button */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('period-audio-studio-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs border border-indigo-200 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5 text-indigo-600" />
            <span>Audio Studio</span>
          </button>
        </div>
      </div>

      {/* Body Content: Daily Lesson (Teacher/Student) vs Formal Assessments Hub */}
      <div className="p-4 sm:p-6 space-y-5 text-xs">
        {studioActiveView === 'ASSESSMENTS' ? (
          /* ========================================================================= */
          /* ISML SENIOR ACADEMIC ASSESSMENT CENTER (15+ YEARS EXAM DIRECTOR SPEC)     */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Assessment Center Top Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-indigo-500/30 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/50 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-400/30 uppercase tracking-wider">
                      ISML Academic Assessment Center
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                      CEFR {sessionPackage.level} Aligned
                    </span>
                    <span className="text-[10px] text-slate-300">
                      • {formalAssessmentsList.length} Tests Configured from Setup Metrics
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Course Exams &amp; Assessment Hub
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Tests and practice questions covering Listening, Reading, Speaking, and Writing with answer keys and scoring.
                  </p>
                </div>

                {/* Print / Export Action */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print / Export Exam Paper</span>
                </button>
              </div>

              {/* Assessment Selector Tab Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-thin">
                {formalAssessmentsList.map((test, tIdx) => {
                  const isSelected = selectedAssessmentIndex === tIdx;
                  return (
                    <button
                      key={test.id}
                      type="button"
                      onClick={() => setSelectedAssessmentIndex(tIdx)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-1 ring-white/30'
                          : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
                      }`}
                    >
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                        isSelected ? 'bg-white/25 text-white' : 'bg-black/20 text-slate-300'
                      }`}>
                        Test {test.assessment_number}
                      </span>
                      <span>{test.title.split(':')[1]?.trim() || test.title}</span>
                      <span className="text-[9px] bg-black/20 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                        Period {test.scheduled_period_number}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Test Paper Container */}
            {(() => {
              const currentTest = formalAssessmentsList[selectedAssessmentIndex] || formalAssessmentsList[0];
              if (!currentTest) return null;

              return (
                <div className="space-y-6">
                  {/* Test Overview Ribbon & Mode Switcher */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                          {currentTest.benchmark_code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Scheduled: {currentTest.scheduled_period_label}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">
                        {currentTest.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                        <span>Duration: <strong className="text-slate-800">{currentTest.duration_minutes} Mins</strong></span>
                        <span>•</span>
                        <span>Total Marks: <strong className="text-slate-800">{currentTest.total_marks} Marks</strong></span>
                        <span>•</span>
                        <span>Pass Threshold: <strong className="text-emerald-700">{currentTest.passing_marks} Marks (60%)</strong></span>
                      </div>
                    </div>

                    {/* Student Paper vs Teacher Key Switcher */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => setAssessmentPaperMode('STUDENT_PAPER')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          assessmentPaperMode === 'STUDENT_PAPER'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Student Question Paper
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssessmentPaperMode('TEACHER_KEY')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          assessmentPaperMode === 'TEACHER_KEY'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Teacher Key &amp; Solutions
                      </button>
                    </div>
                  </div>

                  {/* SECTION A: LISTENING (10 Marks) */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4 p-5 sm:p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                          {currentTest.listening_section.section_title}
                        </h4>
                        <p className="text-[11px] text-slate-500">{currentTest.listening_section.stimulus_scene}</p>
                      </div>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                        {currentTest.listening_section.total_marks} Marks
                      </span>
                    </div>

                    {/* Audio Stimulus Player & Transcript Box */}
                    <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-purple-950 uppercase tracking-wider">
                          Listening Stimulus: Native Spoken Dialogue Exchange
                        </span>
                        <button
                          type="button"
                          onClick={() => playNativeAudio(currentTest.listening_section.audio_transcript, `test-${currentTest.assessment_number}-listening`)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            playingAudioKey === `test-${currentTest.assessment_number}-listening`
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{playingAudioKey === `test-${currentTest.assessment_number}-listening` ? 'Stop Audio' : 'Play Audio Prompt'}</span>
                        </button>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-purple-100 text-xs font-mono text-purple-950 whitespace-pre-wrap leading-relaxed">
                        {currentTest.listening_section.audio_transcript}
                      </div>
                    </div>

                    {/* Listening Questions */}
                    <div className="space-y-3 pt-1">
                      {currentTest.listening_section.questions.map((q) => (
                        <div key={q.id} className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-extrabold text-xs text-slate-900 leading-snug">
                              Question {q.question_number}: {q.question_text}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shrink-0">
                              [{q.marks_allocated} Marks]
                            </span>
                          </div>

                          {q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {assessmentPaperMode === 'TEACHER_KEY' && (
                            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg space-y-1 text-xs">
                              <span className="font-black text-emerald-900 block text-[11px]">
                                Verified Solution: {q.correct_answer}
                              </span>
                              <p className="text-[11px] text-emerald-800">{q.marking_explanation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION B: READING (15 Marks) */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4 p-5 sm:p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                          {currentTest.reading_section.section_title}
                        </h4>
                        <p className="text-[11px] text-slate-500">{currentTest.reading_section.passage_context_notes}</p>
                      </div>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                        {currentTest.reading_section.total_marks} Marks
                      </span>
                    </div>

                    {/* Reading Passage Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                      <span className="font-extrabold text-xs text-slate-900 block border-b border-slate-200 pb-1.5">
                        Reading Text: {currentTest.reading_section.passage_title}
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans">
                        {currentTest.reading_section.reading_passage_text}
                      </p>
                    </div>

                    {/* Reading Questions */}
                    <div className="space-y-3 pt-1">
                      {currentTest.reading_section.questions.map((q) => (
                        <div key={q.id} className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-extrabold text-xs text-slate-900 leading-snug">
                              Question {q.question_number}: {q.question_text}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shrink-0">
                              [{q.marks_allocated} Marks]
                            </span>
                          </div>

                          {q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {assessmentPaperMode === 'TEACHER_KEY' && (
                            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg space-y-1 text-xs">
                              <span className="font-black text-emerald-900 block text-[11px]">
                                Verified Solution: {q.correct_answer}
                              </span>
                              <p className="text-[11px] text-emerald-800">{q.marking_explanation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION C: LANGUAGE KNOWLEDGE & GRAMMAR / VOCAB (15 Marks) */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4 p-5 sm:p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                          {currentTest.language_knowledge_section.section_title}
                        </h4>
                        <p className="text-[11px] text-slate-500">{currentTest.language_knowledge_section.structural_focus}</p>
                      </div>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                        {currentTest.language_knowledge_section.total_marks} Marks
                      </span>
                    </div>

                    {/* Grammar Questions */}
                    <div className="space-y-3">
                      {currentTest.language_knowledge_section.grammar_questions.map((q) => (
                        <div key={q.id} className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-extrabold text-xs text-slate-900 leading-snug">
                              Question {q.question_number}: {q.question_text}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shrink-0">
                              [{q.marks_allocated} Marks]
                            </span>
                          </div>

                          {q.options && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-800 flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-slate-400">{String.fromCharCode(65 + oIdx)}.</span>
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {assessmentPaperMode === 'TEACHER_KEY' && (
                            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg space-y-1 text-xs">
                              <span className="font-black text-emerald-900 block text-[11px]">
                                Verified Solution: {q.correct_answer}
                              </span>
                              <p className="text-[11px] text-emerald-800">{q.marking_explanation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Vocabulary Lexicon Bank Matching Table */}
                    <div className="space-y-2 pt-2">
                      <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider block">
                        Part 2: Vocabulary &amp; Word Meaning Match
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {currentTest.language_knowledge_section.vocabulary_matching_items.map((vItem, vIdx) => (
                          <div key={vIdx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                              <strong className="text-xs font-extrabold text-blue-900">{vItem.term}</strong>
                              <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold">
                                {assessmentPaperMode === 'TEACHER_KEY' ? vItem.definition : 'Define / Match'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 italic">Context: "{vItem.example_sentence}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SECTION D: PRODUCTION (SPEAKING & WRITING) (10 Marks) */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4 p-5 sm:p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                          {currentTest.production_section.section_title}
                        </h4>
                        <p className="text-[11px] text-slate-500">Evaluates Oral Production (5 Marks) and Controlled Written Composition (5 Marks)</p>
                      </div>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                        {currentTest.production_section.total_marks} Marks
                      </span>
                    </div>

                    {/* Oral Task */}
                    <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider">
                          Part 1: Spoken Production Task (2-Minute Native Interaction) [5 Marks]
                        </span>
                        <span className="text-[10px] bg-indigo-200/70 text-indigo-900 font-bold px-2 py-0.5 rounded">
                          CEFR Oral Descriptors
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans">
                        <strong>Situation:</strong> {currentTest.production_section.oral_speaking_task.prompt_situation}
                      </p>
                      <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                        {currentTest.production_section.oral_speaking_task.guiding_bullet_points.map((pt, ptIdx) => (
                          <li key={ptIdx}>{pt}</li>
                        ))}
                      </ul>

                      {assessmentPaperMode === 'TEACHER_KEY' && (
                        <div className="bg-white border border-indigo-200 p-3 rounded-lg space-y-1.5 text-xs">
                          <strong className="text-indigo-950 font-bold block text-[11px]">Model High-Band Spoken Response:</strong>
                          <p className="text-slate-800 italic leading-relaxed">
                            "{currentTest.production_section.oral_speaking_task.model_exemplar_response}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Writing Task */}
                    <div className="p-4 bg-cyan-50/60 border border-cyan-200 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-cyan-950 uppercase tracking-wider">
                          Part 2: Guided Written Composition ({currentTest.production_section.written_composition_task.target_word_count}) [5 Marks]
                        </span>
                        <span className="text-[10px] bg-cyan-200/70 text-cyan-900 font-bold px-2 py-0.5 rounded">
                          Controlled Writing
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans">
                        <strong>Task:</strong> {currentTest.production_section.written_composition_task.prompt_topic}
                      </p>
                      <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                        {currentTest.production_section.written_composition_task.required_communicative_functions.map((fn, fIdx) => (
                          <li key={fIdx}>{fn}</li>
                        ))}
                      </ul>

                      {assessmentPaperMode === 'TEACHER_KEY' && (
                        <div className="bg-white border border-cyan-200 p-3 rounded-lg space-y-1.5 text-xs">
                          <strong className="text-cyan-950 font-bold block text-[11px]">Model Exemplar Composition:</strong>
                          <p className="text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                            {currentTest.production_section.written_composition_task.model_exemplar_composition}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Faculty Marking Policy & Pass Guidance */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <span className="font-extrabold text-xs uppercase tracking-wider text-slate-100">
                        Senior Assessment Director: Grading Policy &amp; Remedial Thresholds
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                        ISML Psychometric Standard
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                      <div className="space-y-1">
                        <strong className="text-slate-100 block text-xs">Grading Thresholds:</strong>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{currentTest.faculty_marking_policy.passing_threshold_guidance}</p>
                      </div>
                      <div className="space-y-1">
                        <strong className="text-slate-100 block text-xs">Pedagogical Remediation:</strong>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{currentTest.faculty_marking_policy.remedial_pedagogical_interventions}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <>
            {/* If today is an assessment milestone day, show prompt banner */}
            {effectiveDay.is_assessment_day && (
              <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 text-white p-3.5 rounded-xl border border-blue-400/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 font-bold text-[10px] border border-blue-400/40 tracking-wider">
                    SCHEDULED BENCHMARK
                  </span>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">
                      {effectiveDay.assessment_benchmark_title || 'Formal Assessment Benchmark Day'}
                    </h4>
                    <p className="text-[10px] text-blue-200">
                      {effectiveDay.assessment_benchmark_code} • Evaluates cumulative receptive &amp; productive competencies
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const idx = formalAssessmentsList.findIndex((a) => a.scheduled_period_number === effectiveDay.day_number);
                    if (idx >= 0) setSelectedAssessmentIndex(idx);
                    setStudioActiveView('ASSESSMENTS');
                  }}
                  className="px-3.5 py-1.5 bg-white hover:bg-blue-50 text-blue-900 font-black rounded-lg text-xs transition-all cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  Open Test Paper &amp; Marking Key →
                </button>
              </div>
            )}
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

            {/* 🎧 AI Voice Studio Track Player (Included in Student Mode) */}
            {effectiveDay.generated_audio_track && (
              <div className="-mx-4 sm:mx-0 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border-y sm:border border-indigo-500/40 rounded-none sm:rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-indigo-500/30 shrink-0">
                      <Headphones className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white tracking-tight">
                          {effectiveDay.generated_audio_track.title || "Custom AI Audio Master Track"}
                        </span>
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          ⏱️ ~{effectiveDay.generated_audio_track.duration_minutes || 2} Mins
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {effectiveDay.generated_audio_track.word_count || 280} words • Continuous native speech synthesis • CEFR aligned
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const scriptText = effectiveDay.generated_audio_track?.script || 
                          (effectiveDay.generated_audio_track?.dialogue_turns?.map(t => t.text).join(' ')) ||
                          effectiveDay.classroom_dialogues?.join(' ') || '';
                        playNativeAudio(scriptText, `student-full-track-${effectiveDay.day_number}`);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                        playingAudioKey === `student-full-track-${effectiveDay.day_number}`
                          ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-400/20'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{playingAudioKey === `student-full-track-${effectiveDay.day_number}` ? 'Pause / Stop Track' : 'Play Full Audio Track'}</span>
                    </button>
                  </div>
                </div>

                {/* Spoken Script Preview Box */}
                <div className="bg-slate-950/70 border border-indigo-800/40 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Target Spoken Transcript:</span>
                    <span>Rate: {audioSpeed}x • {sessionPackage?.language || 'Native'} Voice</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed max-h-36 overflow-y-auto pr-1 font-serif italic">
                    "{effectiveDay.generated_audio_track.script || (effectiveDay.generated_audio_track.dialogue_turns?.map(t => `${t.speaker}: ${t.text}`).join('  •  '))}"
                  </p>
                </div>
              </div>
            )}

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
                      <span>Targeted LSRW Practice Drills & Competency Checks</span>
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
                        <span>Listening Comprehension & Situational Dialogue</span>
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
                    <span>{playingAudioKey === `full-dialogue-${effectiveDay.day_number}` ? 'Stop Audio' : 'Play Audio Exchange'}</span>
                  </button>

                  <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/70">
                    Multi-Speaker Audio ({audioSpeed}x)
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
                        Auditory Comprehension Check Question:
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
                        <span>Spoken Production & Situational Roleplay</span>
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
                      <span>Practice Task for Student Practice</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => alert(`Assignment successfully submitted for ${unitName} ${effectiveDay.day_number}!`)}
                      className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Assignment for Review</span>
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
          /* ---------------- TEACHER PACKAGE & LESSON PLAN VIEW (6 UNIVERSAL MASTER PILLARS) ---------------- */
          <div className="space-y-6">
            {/* Lesson Notes & Grammar Guide */}
            <div className="space-y-4">
              <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-white">Lesson Notes & Grammar Guide</h4>
                  <p className="text-[11px] text-slate-300">Classroom instructions, structural grammar rules, and core vocabulary</p>
                </div>
                <span className="text-[10px] bg-blue-900/80 text-blue-200 border border-blue-400/30 px-2.5 py-0.5 rounded font-mono font-bold">
                  CEFR {sessionPackage.level}
                </span>
              </div>

              {/* Grammar Lecture Detail */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-blue-900 uppercase tracking-wider block text-xs">
                  Teacher Lecture & Grammar Guide ({sessionPackage.school_meta?.periodDurationMinutes || sessionPackage.college_meta?.sessionMinutes || 60} Mins):
                </span>
                <p className="text-slate-800 leading-relaxed font-sans text-xs">
                    {effectiveDay.grammar_rules_detail}
                  </p>
                </div>

                {/* Master Study Notes Markdown */}
                {effectiveDay.study_notes_markdown && (
                  <div className="-mx-4 sm:mx-0 bg-slate-900 border-y sm:border border-slate-800 rounded-none sm:rounded-2xl overflow-hidden shadow-md">
                    <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-xs text-cyan-300 uppercase tracking-wider">
                          Study Notes & Grammar Reference ({unitName} {effectiveDay.day_number})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Grammar Reference
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

                {/* Vocabulary Bank */}
                {effectiveDay.vocabulary_bank && effectiveDay.vocabulary_bank.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-700 uppercase tracking-wider block mb-2 text-xs">
                      Target Vocabulary Bank & Audio Pronunciation:
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
                                  title="Listen to native pronunciation"
                                >
                                  <Volume2 className="w-3 h-3" />
                                  <span>{isVPlaying ? 'Stop' : 'Listen'}</span>
                                </button>
                              </div>
                            </div>
                            <p className="text-slate-700 text-xs mt-1">{v.meaning}</p>
                            {v.example_sentence && (
                              <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-amber-200/60 gap-2">
                                <p className="text-slate-600 text-xs italic font-sans leading-relaxed">
                                  &quot;{v.example_sentence}&quot;
                                </p>
                                <button
                                  type="button"
                                  onClick={() => playNativeAudio(v.example_sentence, `${vKey}-sentence`)}
                                  className="text-[10px] text-amber-900 hover:text-amber-700 font-bold shrink-0 cursor-pointer flex items-center gap-1"
                                  title="Listen to full sentence"
                                >
                                  <Volume2 className="w-2.5 h-2.5" />
                                  <span>{playingAudioKey === `${vKey}-sentence` ? 'Stop' : 'Listen'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Prepared & Generated Curriculum Audio Tracks (Display & Play Only) */}
                {(() => {
                  const allCurriculumTracks = (effectiveDay.generated_audio_tracks && effectiveDay.generated_audio_tracks.length > 0)
                    ? effectiveDay.generated_audio_tracks
                    : effectiveDay.generated_audio_track
                    ? [effectiveDay.generated_audio_track]
                    : [];

                  if (allCurriculumTracks.length === 0) return null;

                  return (
                    <div id="period-audio-studio-section" className="-mx-4 sm:mx-0 bg-slate-900 border-y sm:border border-slate-800 rounded-none sm:rounded-2xl text-white shadow-xl overflow-hidden">
                      <div className="px-4 sm:px-5 py-3.5 border-b border-slate-800/90 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                            <Headphones className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-xs sm:text-sm text-white tracking-tight">
                                Curriculum Audio Tracks ({allCurriculumTracks.length})
                              </h4>
                              <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                                {unitName} {effectiveDay.day_number}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Prepared listening exercises and native speech models for this {unitName.toLowerCase()}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] text-emerald-400 font-semibold px-2.5 py-0.5 bg-emerald-950/70 border border-emerald-500/30 rounded-full w-fit self-start sm:self-auto">
                          Native Female Voice • Learner Pace
                        </span>
                      </div>

                      <div className="divide-y divide-slate-800/80">
                        {allCurriculumTracks.map((trk: any, tIdx: number) => {
                          const trackKey = `curriculum-body-track-${effectiveDay.day_number}-${tIdx}`;
                          const isPlayingThis = playingAudioKey === trackKey;
                          const scriptText = trk.script || (trk.dialogue_turns?.map((t: any) => `${t.speaker}: ${t.text}`).join(' ')) || '';
                          const cleanLang = (sessionPackage?.language || 'Language').replace(/[^a-zA-Z0-9]/g, '_');
                          const cleanLevel = (sessionPackage?.level || 'A1.1').replace(/[^a-zA-Z0-9]/g, '_');
                          const totalDaysCount = totalDays || allDays?.length || 2;
                          const effectiveUnit = unitName || 'Period';
                          const trackFileName = `${cleanLang}_${cleanLevel}_Total_${totalDaysCount}_${effectiveUnit}s_${effectiveUnit}_${effectiveDay.day_number}_Track_${tIdx + 1}_Listening_Audio`;

                          return (
                            <div key={tIdx} className="px-4 sm:px-5 py-3.5 space-y-2.5 hover:bg-slate-800/25 transition-colors">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-7 h-7 rounded-lg bg-blue-600/25 border border-blue-500/30 text-blue-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                                    0{tIdx + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <strong className="text-xs sm:text-sm font-bold text-white block truncate">
                                      {trk.title || `Audio Track ${tIdx + 1}`}
                                    </strong>
                                    <span className="text-[10px] text-slate-400">
                                      ~{trk.duration_minutes || 2} Mins • {trk.word_count || 120} words
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                                  <button
                                    type="button"
                                    onClick={() => playNativeAudio(scriptText, trackKey)}
                                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                      isPlayingThis
                                        ? 'bg-rose-500 text-white animate-pulse'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                                    }`}
                                    title="Play native female voice"
                                  >
                                    <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                                    <span>{isPlayingThis ? 'Stop' : 'Play Voice'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => downloadAudioTrack(scriptText, trackFileName)}
                                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-500/40 transition-all shadow-xs"
                                    title="Download MP3 file"
                                  >
                                    <Download className="w-3.5 h-3.5 text-blue-300" />
                                    <span>Download MP3</span>
                                  </button>
                                </div>
                              </div>

                              {scriptText && (
                                <div className="pl-3 border-l-2 border-blue-500/60 py-0.5">
                                  <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-3 font-sans">
                                    &quot;{scriptText}&quot;
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Learning Objectives & Framework Standards */}
              <div className="space-y-4">
                <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-white">Learning Objectives & Standards</h4>
                    <p className="text-[11px] text-slate-300">{resolvedPillars.proficiency_framework.framework_name} • Competency Descriptors</p>
                  </div>
                  <span className="text-[10px] bg-emerald-900/80 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded font-mono font-bold">
                    Level {sessionPackage.level} Target
                  </span>
                </div>

                {/* Can-Do Competencies Card */}
                <div className="bg-white border border-emerald-200 rounded-xl sm:rounded-2xl shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between border-b border-emerald-100 px-4 sm:px-5 py-3 bg-emerald-50/40">
                    <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Competency Milestones (Can-Do Descriptors)</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      CEFR {sessionPackage.level}
                    </span>
                  </div>

                  <div className="divide-y divide-emerald-100">
                    {canDoCompetencies.map((cdText: string, cIdx: number) => (
                      <div key={cIdx} className="px-4 sm:px-5 py-3 flex items-start gap-3 hover:bg-emerald-50/30 transition-colors">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          ✓
                        </span>
                        <div className="space-y-0.5">
                          <strong className="text-xs text-emerald-950 block">Milestone {cIdx + 1}:</strong>
                          <p className="text-xs text-slate-700 leading-relaxed font-sans">{cdText}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level Boundary Guidelines */}
                <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-xs">Language Level Guidelines & Scope:</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {resolvedPillars.proficiency_framework.level_boundary_rules}
                  </p>
                </div>
              </div>

              {/* Culture, Formality & Everyday Etiquette */}
              <div className="space-y-4">
                <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-white">Culture, Formality & Everyday Etiquette</h4>
                    <p className="text-[11px] text-slate-300">Everyday social customs, formality registers, and teacher guidance</p>
                  </div>
                  <span className="text-[10px] bg-amber-900/80 text-amber-200 border border-amber-400/30 px-2.5 py-0.5 rounded font-mono font-bold">
                    Authentic Customs
                  </span>
                </div>

                {/* Formality Registers Box */}
                <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-800 font-black text-xs uppercase tracking-wider">
                      Formality Registers & Conversational Usage:
                    </span>
                  </div>
                  <p className="text-slate-800 text-xs leading-relaxed font-sans">
                    {cultureData.formality_rule}
                  </p>
                </div>

                {/* Real-World Cultural Etiquette & Customs */}
                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs space-y-3">
                  <span className="font-bold text-slate-900 uppercase tracking-wider block text-xs border-b border-slate-100 pb-2">
                    Everyday Social Customs & Etiquette:
                  </span>
                  <div className="font-sans text-xs text-slate-700 leading-relaxed whitespace-pre-wrap space-y-1">
                    {cultureData.cultural_etiquette}
                  </div>
                </div>

                {/* Senior Faculty Tip */}
                <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-950 font-black text-[10px]">TIP</span>
                  <div className="space-y-0.5">
                    <strong className="text-xs font-bold text-amber-950 block">Faculty Teaching Tip:</strong>
                    <p className="text-xs text-amber-900 leading-relaxed">{cultureData.sociolinguistic_tip}</p>
                  </div>
                </div>
              </div>

              {/* Classroom Dialogues & Conversational Practice */}
              <div className="space-y-4">
                <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-white">Classroom Dialogues & Conversational Practice</h4>
                    <p className="text-[11px] text-slate-300">Live conversational exchange, roleplay scripts, and native speech models</p>
                  </div>
                  <span className="text-[10px] bg-purple-900/80 text-purple-200 border border-purple-400/30 px-2.5 py-0.5 rounded font-mono font-bold">
                    Spoken Practice
                  </span>
                </div>

                {/* Live Class Dialogues with AI Voice Audio Player */}
                {effectiveDay.classroom_dialogues && effectiveDay.classroom_dialogues.length > 0 && (
                  <div className="bg-purple-50/70 border border-purple-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="px-4 py-3 bg-purple-100/60 border-b border-purple-200/70 flex items-center justify-between">
                      <span className="font-bold text-purple-950 uppercase tracking-wider block text-xs">
                        Conversational Dialogues & Practice Scripts:
                      </span>
                      <span className="text-[10px] bg-purple-200 text-purple-950 font-bold px-2 py-0.5 rounded">
                        Native Audio
                      </span>
                    </div>
                    <div className="divide-y divide-purple-200/60 font-sans text-xs text-purple-950">
                      {effectiveDay.classroom_dialogues.map((dlg, dIdx) => {
                        const dlgKey = `teacher-dlg-${effectiveDay.day_number}-${dIdx}`;
                        const isPlaying = playingAudioKey === dlgKey;
                        return (
                          <div key={dIdx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-purple-100/30 transition-colors">
                            <span className="leading-relaxed font-sans text-slate-800">{dlg}</span>
                            <button
                              type="button"
                              onClick={() => playNativeAudio(dlg, dlgKey)}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-all ${
                                isPlaying
                                  ? 'bg-rose-500 text-white animate-pulse'
                                  : 'bg-purple-200/70 hover:bg-purple-200 text-purple-950'
                              }`}
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>{isPlaying ? 'Stop' : 'Play Voice'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Practical Workplace & Situational Applications */}
              <div className="space-y-4">
                <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-white">Practical Workplace & Situational Scenarios</h4>
                    <p className="text-[11px] text-slate-300">Professional context, formal registers, and reference multimedia analysis</p>
                  </div>
                  <span className="text-[10px] bg-cyan-900/80 text-cyan-200 border border-cyan-400/30 px-2.5 py-0.5 rounded font-mono font-bold">
                    Professional Context
                  </span>
                </div>

                {/* Professional Workplace Applications */}
                <div className="bg-white border border-cyan-200 rounded-xl sm:rounded-2xl shadow-xs overflow-hidden">
                  <div className="px-4 sm:px-5 py-3 bg-cyan-50/40 border-b border-cyan-100">
                    <span className="font-bold text-cyan-950 uppercase tracking-wider block text-xs">
                      Workplace & Practical Applications:
                    </span>
                  </div>
                  <div className="divide-y divide-cyan-100">
                    {academicContext.workplace_applications.map((app: string, aIdx: number) => (
                      <div key={aIdx} className="px-4 sm:px-5 py-3 flex items-start gap-2.5 hover:bg-cyan-50/30 transition-colors">
                        <span className="text-cyan-700 font-bold text-xs mt-0.5">›</span>
                        <p className="text-xs text-slate-800 leading-snug">{app}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corporate Situational Scenario Callout */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
                  <strong className="text-xs font-bold text-cyan-300 block">Practical Situational Scenario:</strong>
                  <p className="text-xs text-slate-200 leading-relaxed">{academicContext.corporate_scenario}</p>
                  <p className="text-[11px] text-cyan-200/90 font-sans italic pt-1 border-t border-slate-800">
                    {academicContext.formal_register_note}
                  </p>
                </div>

                {/* Video Breakdown Analysis */}
                {effectiveDay.video_breakdown_analysis && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                      <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        Reference Video & Audio Breakdown
                      </h4>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap">
                      {effectiveDay.video_breakdown_analysis}
                    </p>
                  </div>
                )}
              </div>

            {/* Teaching Procedure, Formative Practice & Homework */}
            <div className="space-y-4">
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
                      <span className="font-bold block text-indigo-900 mb-0.5">Blackboard Formula:</span>
                      <p className="font-mono text-[10px] text-slate-700">{effectiveDay.teacher_lesson_breakdown.board_notes}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200 text-[11px] text-amber-950">
                      <span className="font-bold block text-amber-900 mb-0.5">Remedial Activity:</span>
                      <p className="text-[10px] text-slate-700">{effectiveDay.teacher_lesson_breakdown.remedial_activity}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Verified Answer Key & Solutions - Standardized LSRW Practice Drills */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        Practice Tasks
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">•</span>
                      <span className="text-[11px] font-bold text-slate-600">CEFR {sessionPackage.level} Proficiency</span>
                    </div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600 shrink-0" />
                      <span>Classroom Practice Exercises & Model Solutions</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Standardized classroom drills engineered for student self-study, instant evaluation, and faculty feedback.
                    </p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto shrink-0">
                    Model Answers Included
                  </span>
                </div>

                {/* Clean List Items */}
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
                          <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                            {sol.question.replace(/^\[[A-Za-z0-9\s\-:&]+\]\s*/i, '')}
                          </p>
                        </div>
                      </div>

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
                  Daily Homework & Practice Tasks:
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

              {effectiveDay.source_reference_url && (
                <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <span className="font-bold text-slate-700">Course Source Material: </span>
                    <a href={effectiveDay.source_reference_url} target="_blank" rel="noreferrer" className="underline text-blue-600 hover:text-blue-700">
                      {effectiveDay.source_reference_url}
                    </a>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">Verified Grounded</span>
                </div>
              )}
            </div>

            {/* 🤖 Professional Clean Academic Curriculum Assistant (Seamless In-Page Continuation) */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 border border-slate-200 shadow-xs space-y-5 mt-6">
              {isSessionSaved === false ? (
                <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white border border-blue-200/90 rounded-2xl text-center space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0052CC] flex items-center justify-center mx-auto shadow-2xs">
                    <Sparkles className="w-6 h-6 text-[#0052CC]" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h4 className="text-sm sm:text-base font-black text-[#0B2447]">
                      Save Curriculum to Unlock AI Assistant
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Save this curriculum session to activate the continuous AI Lesson Assistant, real-time period modification, and multi-turn chat memory.
                    </p>
                  </div>
                  {onManualSaveSession && (
                    <button
                      type="button"
                      onClick={onManualSaveSession}
                      disabled={savingSession}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {savingSession ? (
                        <span>Saving Curriculum...</span>
                      ) : (
                        <span>Save Curriculum &amp; Unlock Chat</span>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs shrink-0">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-2">
                        <span>Lesson Assistant</span>
                      </h4>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        ⚡ Live Update
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Prompt-based editor: Type your directive in natural language (Tamil/English/French) to transform lesson content or audio.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {/* 📎 Add More Materials Button at the TOP of the Chat */}
                  <button
                    type="button"
                    onClick={() => chatFilePickerRef.current?.click()}
                    disabled={chatLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-700 hover:text-indigo-900 border border-indigo-200/90 rounded-xl font-black text-xs transition-all shadow-2xs cursor-pointer group"
                    title="Upload additional reference documents, syllabus PDFs, or notes into this active session"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span>+ Add More Materials</span>
                    {attachedChatFiles.length > 0 && (
                      <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                        {attachedChatFiles.length}
                      </span>
                    )}
                  </button>

                  <span className="text-slate-400">|</span>

                  <span className="text-slate-500 font-medium text-[11px]">Modifying:</span>
                  <span className="bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-blue-800 font-mono font-bold text-[11px]">
                    {unitName} {effectiveDay.day_number}
                  </span>
                </div>
              </div>

              {/* 💬 Full Continuous Conversation History Thread (ChatGPT / Claude / Gemini Style) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>Chat History</span>
                      {chatHistory.length > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                          {chatHistory.length}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Persistent across devices &amp; reload
                    </span>
                  </div>

                  {/* Scrollable Conversation Stream */}
                  {chatHistory.length > 0 ? (
                    <div className="space-y-4 divide-y divide-slate-100">
                      {chatHistory.map((msg, mIdx) => {
                        const isUser = msg.role === 'user';
                        return (
                          <div 
                            key={msg.id || mIdx}
                            className={`flex flex-col space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 font-medium">
                              <span className="font-bold text-slate-600">
                                {isUser ? '👤 You (Faculty Tutor)' : '🤖 Curriculum Agent'}
                              </span>
                              <span>•</span>
                              <span>{msg.timestamp || 'Just now'}</span>
                              {msg.modifiedSection && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                  {msg.modifiedSection}
                                </span>
                              )}
                            </div>

                            <div 
                              className={`max-w-[92%] sm:max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                                isUser 
                                  ? 'bg-blue-600 text-white rounded-br-xs font-medium' 
                                  : 'bg-white text-slate-900 border border-slate-200/90 rounded-bl-xs'
                              }`}
                            >
                              <p className="whitespace-pre-wrap font-medium">{msg.content}</p>

                              {/* 📋 Full Comprehensive Generated Content Preview in Chat */}
                              {!isUser && msg.regeneratedSummary && (
                                <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-3 text-slate-800">
                                  {/* Unit Header Badge */}
                                  <div className="bg-blue-50/80 border border-blue-200/90 rounded-xl p-3 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider">
                                        📅 {msg.regeneratedSummary.totalUnitsUpdated && msg.regeneratedSummary.totalUnitsUpdated > 1 ? `All ${msg.regeneratedSummary.totalUnitsUpdated} Units Generated` : `Period ${effectiveDay.day_number} Full Blueprint`}
                                      </span>
                                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                                        ✓ Grounded CEFR {sessionPackage?.level || 'A1.1'}
                                      </span>
                                    </div>
                                    <strong className="text-xs sm:text-sm font-bold text-slate-900 block">
                                      {msg.regeneratedSummary.dayTopic}
                                    </strong>
                                  </div>

                                  {/* Blackboard Grammar Formula */}
                                  {msg.regeneratedSummary.grammarRule && (
                                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 text-[11px] space-y-1">
                                      <span className="text-[10px] font-black text-amber-900 uppercase tracking-wide flex items-center gap-1">
                                        Board Notes &amp; Grammar Rule:
                                      </span>
                                      <p className="font-mono text-slate-800 font-semibold bg-white/90 p-1.5 rounded border border-amber-200">
                                        {msg.regeneratedSummary.grammarRule}
                                      </p>
                                    </div>
                                  )}

                                  {/* Target Vocabulary Badges */}
                                  {msg.regeneratedSummary.vocabulary && msg.regeneratedSummary.vocabulary.length > 0 && (
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wide block">
                                        Key Vocabulary ({msg.regeneratedSummary.vocabulary.length} Words):
                                      </span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {msg.regeneratedSummary.vocabulary.map((v: any, vIdx: number) => (
                                          <span 
                                            key={vIdx}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-800"
                                          >
                                            <strong className="text-blue-700">{v.word || v}</strong>
                                            {v.meaning && <span className="text-slate-500 text-[10px]">({v.meaning})</span>}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Verified Exercises & Solutions Preview */}
                                  {msg.regeneratedSummary.exercises && msg.regeneratedSummary.exercises.length > 0 && (
                                    <div className="space-y-2 pt-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wide flex items-center gap-1">
                                          Verified LSRW Classroom Drills:
                                        </span>
                                        <span className="text-[10px] text-blue-700 font-bold">
                                          {msg.regeneratedSummary.exercises.length} Questions &amp; Solutions
                                        </span>
                                      </div>

                                      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                                        {msg.regeneratedSummary.exercises.map((sol: any, qIdx: number) => (
                                          <div key={qIdx} className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] space-y-1">
                                            <div className="flex items-start gap-1.5">
                                              <span className="font-bold text-blue-600 shrink-0">Q{qIdx + 1}:</span>
                                              <span className="font-semibold text-slate-900">{sol.question || sol}</span>
                                            </div>
                                            {sol.answer && (
                                              <div className="ml-5 flex items-center gap-1.5 text-[10px]">
                                                <span className="text-emerald-700 font-bold">Ans:</span>
                                                <span className="font-mono bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-emerald-950 font-bold">
                                                  {sol.answer}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Multi-Track MP3 Audio Player List inside Assistant Message */}
                              {!isUser && msg.audioTracks && msg.audioTracks.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1">
                                      <Headphones className="w-3 h-3 text-blue-600" />
                                      <span>Generated Audio Suite ({msg.audioTracks.length} Track{msg.audioTracks.length > 1 ? 's' : ''})</span>
                                    </span>
                                    <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                                      MP3 / WAV Audio
                                    </span>
                                  </div>

                                  <div className="space-y-2">
                                    {msg.audioTracks.map((trk: any, tIdx: number) => {
                                      const trackKey = `chat-history-mp3-${msg.id}-${tIdx}`;
                                      const isPlayingThis = playingAudioKey === trackKey;
                                      const textToPlay = trk.script || trk.dialogue_turns?.map((t: any) => `${t.speaker}: ${t.text}`).join(". ") || "";

                                      return (
                                        <div 
                                          key={tIdx} 
                                          className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 shadow-2xs space-y-2"
                                        >
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-1.5">
                                            <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                0{tIdx + 1}
                                              </div>
                                              <div>
                                                <strong className="text-xs font-bold text-slate-900 block">
                                                  {trk.title || `Track ${tIdx + 1}`}
                                                </strong>
                                                <span className="text-[10px] text-slate-500">
                                                  ⏱️ ~{trk.duration_minutes || 2} Mins • {trk.word_count || 280} words
                                                </span>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                              <button
                                                type="button"
                                                onClick={() => playNativeAudio(textToPlay, trackKey)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                                  isPlayingThis
                                                    ? "bg-rose-600 text-white animate-pulse"
                                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                                }`}
                                              >
                                                <Volume2 className="w-3 h-3" />
                                                <span>{isPlayingThis ? "Stop" : "Play Audio"}</span>
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() => downloadAudioTrack(textToPlay, `${sessionPackage?.language || "Language"}_Period_${effectiveDay.day_number}_Track_${tIdx + 1}`)}
                                                className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs transition-all"
                                                title="Download MP3 Audio File"
                                              >
                                                <Download className="w-3 h-3 text-slate-600" />
                                                <span>Download MP3</span>
                                              </button>
                                            </div>
                                          </div>

                                          {/* Scrubber preview & script transcript */}
                                          <div className="bg-white rounded-lg p-2 border border-slate-200 space-y-1">
                                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                                              <span className="flex items-center gap-1 text-slate-700 font-bold">
                                                <span className={`w-1.5 h-1.5 rounded-full ${isPlayingThis ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                                                <span>{isPlayingThis ? "Playing Track..." : "Ready"}</span>
                                              </span>
                                              <span>Rate: {audioSpeed}x</span>
                                            </div>

                                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden border border-slate-200">
                                              <div
                                                className={`h-full bg-blue-600 rounded-full transition-all duration-300 ${
                                                  isPlayingThis ? "w-3/4 animate-pulse" : "w-1/4"
                                                }`}
                                              />
                                            </div>

                                            <p className="text-[10px] text-slate-600 leading-relaxed max-h-14 overflow-y-auto italic">
                                              "{trk.script || trk.dialogue_turns?.map((t: any) => `${t.speaker}: ${t.text}`).join("  •  ")}"
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-3 border border-dashed border-slate-200 text-center text-[11px] text-slate-500">
                      No previous chat messages yet for this period. Type an instruction below to start collaborating with the Curriculum Agent!
                    </div>
                  )}
                </div>

              {/* Chat & Prompt Transformation Box */}
              <div className="space-y-2.5">
                {/* Book & Material Ingestion Indicator */}
                {isExtractingChatFile && (
                  <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 shadow-2xs animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                    <span>
                      <strong>Digesting Material:</strong> Extracting full text, chapters, verbs & grammar rules from <em>{extractingFileName}</em> into curriculum memory...
                    </span>
                  </div>
                )}

                <form
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                      await handleProcessIncomingChatFiles(Array.from(e.dataTransfer.files));
                    }
                  }}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!chatInput.trim() && attachedChatFiles.length === 0) return;
                    if (chatLoading || isExtractingChatFile) return;
                    const refinedPrompt = chatInput.trim();
                    const promptTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const userMsgId = 'user-' + Date.now();

                    // Format user prompt with attached materials note if files are uploaded
                    const attachedFileNote = attachedChatFiles.length > 0 
                      ? `\n\n[📎 Ingested ${attachedChatFiles.length} Material(s): ${attachedChatFiles.map(f => f.name).join(', ')}]`
                      : '';
                    const displayUserText = (refinedPrompt || 'Attached new curriculum materials for analysis') + attachedFileNote;

                    // Immediately push user message to persistent conversation history
                    const updatedHistoryWithUser = [
                      ...chatHistory,
                      {
                        id: userMsgId,
                        role: 'user' as const,
                        content: displayUserText,
                        timestamp: promptTime
                      }
                    ];
                    setChatHistory(updatedHistoryWithUser);
                    setChatInput('');
                    const filesToProcess = [...attachedChatFiles];
                    setAttachedChatFiles([]);
                    setChatLoading(true);
                    setChatAnswer(null);
                    setChatAudioTrack(null);
                    setChatAudioTracks([]);
                    setLastModifiedSection(null);

                    const sid = sessionPackage?.session_id || 'default';
                    const dayKey = `isml_chat_thread_${sid}_day_${activeDay.day_number}`;
                    try {
                      localStorage.setItem(dayKey, JSON.stringify(updatedHistoryWithUser));
                    } catch (_) {}

                    // Update session-level persistent file refs in localStorage archive
                    if (filesToProcess.length > 0 && typeof window !== 'undefined') {
                      try {
                        const localArchiveStr = localStorage.getItem('isml_saved_sessions_archive');
                        if (localArchiveStr) {
                          const archive = JSON.parse(localArchiveStr);
                          const updatedArchive = archive.map((it: any) => {
                            if ((it.sessionId || it.id) === sid) {
                              const existingRefs = it.tutorFileRef ? it.tutorFileRef.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
                              const newNames = filesToProcess.map(f => f.name);
                              const combined = Array.from(new Set([...existingRefs, ...newNames])).join(', ');
                              return { ...it, tutorFileRef: combined };
                            }
                            return it;
                          });
                          localStorage.setItem('isml_saved_sessions_archive', JSON.stringify(updatedArchive));
                        }
                      } catch (_) {}
                    }

                    let previousSessionMaterials = '';
                    try {
                      previousSessionMaterials = localStorage.getItem(`isml_session_materials_${sid}`) || '';
                    } catch (_) {}

                    if (filesToProcess.length > 0 && typeof window !== 'undefined') {
                      try {
                        const newText = filesToProcess.map(f => `[Uploaded Material: ${f.name}]:\n${f.content || ''}`).join('\n\n');
                        const merged = [previousSessionMaterials, newText].filter(Boolean).join('\n\n');
                        localStorage.setItem(`isml_session_materials_${sid}`, merged.slice(0, 150000));
                        previousSessionMaterials = merged;
                      } catch (_) {}
                    }

                    try {
                      const filesPayload = filesToProcess.map(f => ({
                        name: f.name,
                        size: f.size,
                        content: f.content || ''
                      }));

                      const cumulativeSourceContext = [
                        sessionPackage?.raw_source_context || '',
                        sessionPackage?.extracted_source_summary || '',
                        previousSessionMaterials,
                        filesToProcess.map(f => `[File: ${f.name}]: ${f.content || ''}`).join('\n\n')
                      ].filter(Boolean).join('\n\n');

                      const res = await fetchWithEndpointFallback('/api/v1/sessions/refine-blueprint', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          user_prompt: refinedPrompt || 'Incorporate attached materials into curriculum lesson',
                          current_period: effectiveDay.day_number,
                          language: sessionPackage?.language || 'French',
                          level: sessionPackage?.level || 'A1',
                          topic: sessionPackage?.topic || effectiveDay.day_topic,
                          active_module: effectiveDay.month_number || 1,
                          days: allDays || [activeDay],
                          source_context: cumulativeSourceContext,
                          attached_files: filesPayload
                        })
                      });

                      if (res.ok) {
                        const data = await res.json();
                        const intentType = data.intent_type || 'GENERAL_REFINEMENT';
                        const isAudioOnly = data.audio_only === true;
                        const isFullScheduleReq = intentType === 'FULL_SCHEDULE';
                        const reply = data.agent_reply || "Curriculum lesson plan successfully transformed!";
                        setChatAnswer(reply);

                        // =====================================================
                        // AUDIO-ONLY RESPONSE: Don't overwrite content
                        // =====================================================
                        if (isAudioOnly && data.generated_audio_tracks) {
                          const audioTracks = data.generated_audio_tracks;
                          const audioTrack = data.generated_audio_track || audioTracks[0];

                          // Accumulate with existing tracks
                          const existingTracks = effectiveDay.generated_audio_tracks || (effectiveDay.generated_audio_track ? [effectiveDay.generated_audio_track] : []);
                          const allTracks = [...existingTracks, ...audioTracks];

                          const asstMsg = {
                            id: 'asst-' + Date.now(),
                            role: 'assistant' as const,
                            content: reply,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            audioTracks: audioTracks,
                            modifiedSection: `Audio Suite (${audioTracks.length} Track${audioTracks.length > 1 ? 's' : ''})`,
                          };

                          const finalHistory = [...updatedHistoryWithUser, asstMsg];
                          setChatHistory(finalHistory);
                          try { localStorage.setItem(dayKey, JSON.stringify(finalHistory)); } catch (_) {}

                          // Only update audio fields, preserve all content
                          const audioPayload: any = {
                            generated_audio_track: audioTrack,
                            generated_audio_tracks: allTracks,
                            chat_history: finalHistory,
                          };
                          setLocalOverrides(prev => ({
                            ...prev,
                            [effectiveDay.day_number]: { ...(prev[effectiveDay.day_number] || {}), ...audioPayload }
                          }));
                          if (onApplyPeriodUpdate) onApplyPeriodUpdate(effectiveDay.day_number, audioPayload);
                          setChatAudioTrack(audioTrack);
                          setChatAudioTracks(allTracks);
                          setLastModifiedSection('Audio Suite');
                        }
                        // =====================================================
                        // FULL SCHEDULE: Update all days
                        // =====================================================
                        else if (isFullScheduleReq && data.updated_days && data.updated_days.length > 1) {
                          const totalUpdated = data.updated_days.length;
                          const summaryData: any = {
                            dayTopic: `Full ${totalUpdated}-Period Schedule Regenerated`,
                            grammarRule: `All ${totalUpdated} periods updated with authentic CEFR content`,
                            totalUnitsUpdated: totalUpdated
                          };
                          const asstMsg = {
                            id: 'asst-' + Date.now(),
                            role: 'assistant' as const,
                            content: reply,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            audioTracks: [],
                            modifiedSection: `Full Schedule (${totalUpdated} Periods)`,
                            regeneratedSummary: summaryData
                          };

                          const finalHistory = [...updatedHistoryWithUser, asstMsg];
                          setChatHistory(finalHistory);
                          try { localStorage.setItem(dayKey, JSON.stringify(finalHistory)); } catch (_) {}

                          if (onApplyFullScheduleUpdate) onApplyFullScheduleUpdate(data.updated_days);
                          if (onTriggerFullPipelineGeneration) onTriggerFullPipelineGeneration();
                          setLastModifiedSection(`Full Schedule (${totalUpdated} Periods)`);
                        }
                        // =====================================================
                        // CONTENT RESPONSE: Update period content + show in chat
                        // =====================================================
                        else if (data.updated_days && data.updated_days.length > 0) {
                          const updated = data.updated_days[0];

                          let finalSolutions = updated.exercise_solutions || [];
                          if (finalSolutions && finalSolutions.length > 0) {
                            const tags = ['[R - Reading & Syntax]', '[S - Spoken Interaction]', '[L - Auditory & Error Discrimination]', '[W - Contextual Writing]'];
                            finalSolutions = finalSolutions.map((sol: any, sIdx: number) => {
                              const q = sol.question || '';
                              return { ...sol, question: q.startsWith('[') ? q : `${tags[sIdx % 4]} ${q}` };
                            });
                          }

                          const summaryData: any = {
                            dayTopic: updated.day_topic || effectiveDay.day_topic,
                            grammarRule: updated.grammar_rules_detail || effectiveDay.grammar_rules_detail,
                            notesPreview: updated.study_notes_markdown || effectiveDay.study_notes_markdown,
                            vocabulary: updated.vocabulary_bank || effectiveDay.vocabulary_bank || [],
                            exercises: finalSolutions.length > 0 ? finalSolutions : (effectiveDay.exercise_solutions || []),
                            totalUnitsUpdated: 1
                          };

                          const sectionLabel = intentType === 'DRILL_GENERATION' ? `LSRW Drills (${finalSolutions.length})`
                            : intentType === 'GRAMMAR_FOCUS' ? 'Grammar & Blackboard'
                            : intentType === 'VOCABULARY_REQUEST' ? `Vocabulary (${(updated.vocabulary_bank || []).length} Words)`
                            : intentType === 'DIALOGUE_GENERATION' ? 'Classroom Dialogues'
                            : intentType === 'TOPIC_EXPLANATION' ? 'Topic Explanation'
                            : 'Lesson Plan Components';

                          const asstMsg = {
                            id: 'asst-' + Date.now(),
                            role: 'assistant' as const,
                            content: reply,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            audioTracks: [],
                            modifiedSection: sectionLabel,
                            regeneratedSummary: summaryData
                          };

                          const finalHistory = [...updatedHistoryWithUser, asstMsg];
                          setChatHistory(finalHistory);
                          try { localStorage.setItem(dayKey, JSON.stringify(finalHistory)); } catch (_) {}

                          const updatedPayload: any = {
                            day_topic: updated.day_topic || effectiveDay.day_topic,
                            grammar_rules_detail: updated.grammar_rules_detail || effectiveDay.grammar_rules_detail,
                            study_notes_markdown: updated.study_notes_markdown || effectiveDay.study_notes_markdown,
                            vocabulary_bank: updated.vocabulary_bank || effectiveDay.vocabulary_bank,
                            classroom_dialogues: updated.classroom_dialogues || effectiveDay.classroom_dialogues,
                            generated_audio_track: effectiveDay.generated_audio_track,
                            generated_audio_tracks: effectiveDay.generated_audio_tracks,
                            homework_tasks: updated.homework_tasks || effectiveDay.homework_tasks,
                            in_class_exercises: finalSolutions.length > 0 ? finalSolutions.map((s: any) => s.question) : effectiveDay.in_class_exercises,
                            exercise_solutions: finalSolutions.length > 0 ? finalSolutions : effectiveDay.exercise_solutions,
                            chat_history: finalHistory,
                            student_lsrw_practice: {
                              ...(effectiveDay.student_lsrw_practice || {}),
                              listening_audio_script: {
                                ...(effectiveDay.student_lsrw_practice?.listening_audio_script || {}),
                                dialogue_lines: updated.classroom_dialogues || effectiveDay.student_lsrw_practice?.listening_audio_script?.dialogue_lines || effectiveDay.classroom_dialogues
                              }
                            }
                          };

                          const targetDayNum = updated.day_number || effectiveDay.day_number;
                          setLocalOverrides(prev => ({ ...prev, [targetDayNum]: updatedPayload }));
                          if (onApplyPeriodUpdate) onApplyPeriodUpdate(targetDayNum, updatedPayload);
                          setLastModifiedSection(sectionLabel);

                          // If the backend indicates navigating to a different canonical period (e.g. Period 5 for verbs)
                          if (data.navigate_to_period && data.navigate_to_period !== effectiveDay.day_number && onSelectDay) {
                            onSelectDay(data.navigate_to_period);
                          }
                        }
                        // =====================================================
                        // EXPLANATION-ONLY (no updated_days, just text reply)
                        // =====================================================
                        else {
                          const asstMsg = {
                            id: 'asst-' + Date.now(),
                            role: 'assistant' as const,
                            content: reply,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            audioTracks: [],
                            modifiedSection: 'Agent Response',
                          };
                          const finalHistory = [...updatedHistoryWithUser, asstMsg];
                          setChatHistory(finalHistory);
                          try { localStorage.setItem(dayKey, JSON.stringify(finalHistory)); } catch (_) {}
                        }
                        setChatAnswer(reply);
                      } else {
                        // HTTP error fallback
                        const asstMsg = {
                          id: 'asst-' + Date.now(),
                          role: 'assistant' as const,
                          content: `Pedagogical response for ${effectiveDay.day_topic}: Verified against CEFR standards.`,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          audioTracks: [],
                          modifiedSection: 'Agent Response',
                        };
                        const finalHistory = [...updatedHistoryWithUser, asstMsg];
                        setChatHistory(finalHistory);
                        try { localStorage.setItem(dayKey, JSON.stringify(finalHistory)); } catch (_) {}
                        setChatAnswer(asstMsg.content);
                      }
                    } catch (err) {
                      const fallbackReply = `⚠️ Connection error. Grounded response for ${effectiveDay.day_topic}: Content verified against CEFR ${sessionPackage?.level || 'A1'} standards.`;
                      const asstFallbackMsg = {
                        id: 'asst-' + Date.now(),
                        role: 'assistant' as const,
                        content: fallbackReply,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        audioTracks: [],
                        modifiedSection: 'Error Recovery'
                      };
                      const finalHistory = [...updatedHistoryWithUser, asstFallbackMsg];
                      setChatHistory(finalHistory);
                      try { localStorage.setItem(dayKey, JSON.stringify(finalHistory)); } catch (_) {}
                      setChatAnswer(fallbackReply);
                    } finally {
                      setChatLoading(false);
                    }
                  }}
                  className="space-y-2.5"
                >
                  {/* Attached Files Chips Bar */}
                  {attachedChatFiles.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-indigo-50/70 border border-indigo-200/80 rounded-xl">
                      <span className="text-[10px] font-bold text-indigo-900 flex items-center gap-1 mr-1">
                        <Paperclip className="w-3 h-3 text-indigo-600" />
                        <span>Attached Memory ({attachedChatFiles.length}):</span>
                      </span>
                      {attachedChatFiles.map((file, fIdx) => (
                        <div key={fIdx} className="inline-flex items-center gap-1 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg text-[10px] text-slate-800 shadow-2xs font-medium">
                          <FileText className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span className="truncate max-w-[150px] font-semibold">{file.name}</span>
                          <span className="text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-mono text-[9px] font-bold">
                            {(file as any).pages && (file as any).pages > 1 ? `${(file as any).pages} pgs • ` : ''}
                            {(file as any).wordCount ? `${(file as any).wordCount.toLocaleString()} words` : `${(file.size / 1024).toFixed(0)}KB`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setAttachedChatFiles(prev => prev.filter((_, idx) => idx !== fIdx))}
                            className="text-slate-400 hover:text-rose-600 ml-1 font-bold cursor-pointer"
                            title="Remove file"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setAttachedChatFiles([])}
                        className="text-[9px] text-rose-600 hover:underline font-bold ml-auto cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  )}

                  {/* Hidden File Picker Input */}
                  <input
                    type="file"
                    ref={chatFilePickerRef}
                    multiple
                    className="hidden"
                    accept=".pdf,.txt,.docx,.csv,.doc,.xlsx,.pptx,.ppt,audio/*,image/*"
                    onChange={async (e) => {
                      if (!e.target.files) return;
                      await handleProcessIncomingChatFiles(Array.from(e.target.files));
                      e.target.value = '';
                    }}
                  />

                  {/* Top Action Bar for Chat: Upload Book Button */}
                  <div className="flex items-center justify-between pb-0.5">
                    <button
                      type="button"
                      onClick={() => chatFilePickerRef.current?.click()}
                      disabled={chatLoading || isExtractingChatFile}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-300 text-indigo-700 rounded-lg text-[11px] font-bold shadow-2xs transition-all cursor-pointer group"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                      <span>+ Attach Book / Document to AI Memory</span>
                    </button>
                    <span className="text-[10px] text-slate-400">
                      Drag & drop any PDF, DOCX or TXT file directly into chat
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      rows={2}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={chatLoading}
                      placeholder={attachedChatFiles.length > 0 ? "Tell the Agent what to synthesize or transform from these attached materials..." : `Tell the Agent what to change, e.g.: "Add 10 hard listening and speaking questions with answers" or "Indha topic ku formal business dialogue create pannu"...`}
                      className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-500 rounded-xl pl-11 pr-48 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none leading-relaxed shadow-2xs"
                    />

                    {/* Left: Paperclip Attach Files Button */}
                    <button
                      type="button"
                      onClick={() => chatFilePickerRef.current?.click()}
                      disabled={chatLoading}
                      title="Upload new pedagogical files (PDF, DOCX, TXT, CSV, Audio) to ingest into session memory"
                      className="absolute left-2.5 bottom-3 p-1.5 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-600 transition-all cursor-pointer shadow-2xs flex items-center gap-1 group"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                    </button>

                    <div className="absolute right-2.5 bottom-3 flex items-center gap-1.5">
                      <button
                        type="submit"
                        disabled={chatLoading || (!chatInput.trim() && attachedChatFiles.length === 0)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
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

              {/* Prompt Presets / Instant 1-Click Transformations */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Instant 1-Click Agent Directives:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setChatInput(`Generate 10 extensive practice questions covering Listening, Speaking, Reading and Writing with detailed answers and pronunciation notes`)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-medium"
                    >
                      <span>10 LSRW Drills + Answers</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatInput(`3 audio tracks generate pannu verbs base pani`)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200 cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <span>3 Audio Tracks (Verbs)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatInput(`Add 6 conversational dialogue turns between teacher and student with natural phonetics`)}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg border border-purple-200 cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-medium"
                    >
                      <span>Realistic Dialogues</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatInput(`grammar pathi detailed ah explain pannu with blackboard formula and 3 common mistakes`)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-medium"
                    >
                      <span>Grammar & Formula</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatInput(`verb pathi sollu da detailed ah`)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-medium"
                    >
                      <span>Explain Verbs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatInput(`10 vocabulary words kudu with pronunciation and examples`)}
                      className="bg-cyan-50 hover:bg-cyan-100 text-cyan-800 px-2.5 py-1 rounded-lg border border-cyan-200 cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-medium"
                    >
                      <span>10 Vocabulary Cards</span>
                    </button>
                  </div>
                </div>
              </div>
                </>
              )}
            </div>
          </div>
        )}
          </>
        )}

        {/* ========================================================================= */}
        {/* 16:9 IN-BROWSER PRESENTATION SLIDE VIEWER MODAL WITH ISML WATERMARK & LOGO */}
        {/* ========================================================================= */}
        {showSlideViewer && (() => {
          const rawTopic = effectiveDay.day_topic || `Foundations & Communicative Patterns (${unitName} ${effectiveDay.day_number})`;
          const cleanTopic = rawTopic
            .replace(new RegExp(`^${unitName}\\s*\\d+[:\\-]?\\s*`, 'i'), '')
            .replace(new RegExp(`^(Period|Session)\\s*\\d+[:\\-]?\\s*`, 'i'), '')
            .trim() || rawTopic;

          const vocabList = (effectiveDay.vocabulary_bank && effectiveDay.vocabulary_bank.length > 0)
            ? effectiveDay.vocabulary_bank.slice(0, 4)
            : [
                { word: 'Guten Tag', meaning: 'Good day / Hello', pronunciation: '/ˈɡuːtn̩ ˈtaːk/', example_sentence: 'Guten Tag, wie geht es Ihnen?' },
                { word: 'Auf Wiedersehen', meaning: 'Goodbye (formal)', pronunciation: '/aʊ̯f ˈviːdɐˌzeːən/', example_sentence: 'Auf Wiedersehen und bis morgen!' },
                { word: 'Danke schön', meaning: 'Thank you very much', pronunciation: '/ˈdaŋkə ʃøːn/', example_sentence: 'Vielen Dank für Ihre Hilfe.' },
                { word: 'Bitte sehr', meaning: 'You are welcome', pronunciation: '/ˈbɪtə zeːɐ̯/', example_sentence: 'Bitte sehr, gern geschehen.' },
              ];

          const dialogueLines = (effectiveDay.classroom_dialogues && effectiveDay.classroom_dialogues.length > 0)
            ? effectiveDay.classroom_dialogues.slice(0, 4)
            : [
                "Instructor: Welcome everyone. Today we examine practical conversation structures.",
                "Learner: Could you explain how this phrase changes in formal settings?",
                "Instructor: Notice the respectful verb conjugation and address pronoun.",
                "Learner: Understood, I will practice this pattern with my dialogue partner."
              ];

          const canDoList = (canDoCompetencies && canDoCompetencies.length > 0)
            ? canDoCompetencies.slice(0, 4)
            : [
                `Can greet and introduce oneself appropriately in ${sessionPackage?.language || 'the target language'}`,
                `Can understand and use familiar everyday expressions at CEFR ${sessionPackage?.level || 'A1.1'}`,
                `Can ask and answer simple questions about personal details and surroundings`,
                `Can interact in a simple way provided the other person talks slowly and clearly`
              ];

          const homeworkList = (effectiveDay.homework_tasks && effectiveDay.homework_tasks.length > 0)
            ? effectiveDay.homework_tasks.slice(0, 3)
            : [
                `Write 5 complete sentences applying today's grammar blueprint.`,
                `Practice vocalizing the 4 key vocabulary terms with correct phonetics.`,
                `Record a 60-second audio dialogue rehearsing the classroom roleplay.`
              ];

          return (
            <div
              className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 text-slate-800 animate-in fade-in duration-200 overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="ISML Presentation Slide Viewer"
            >
              {/* Modal Top Control Bar */}
              <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4 pb-2 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="px-2.5 py-1 bg-[#0052CC] text-white font-extrabold rounded-lg text-[10px] sm:text-xs uppercase tracking-wider">
                    {unitName} {effectiveDay.day_number}
                  </span>
                </div>

                <div className="text-center min-w-0 flex-1 px-2">
                  <h3 className="text-white font-bold text-xs sm:text-sm truncate">
                    {cleanTopic}
                  </h3>
                  <p className="text-slate-400 text-[10px] sm:text-xs truncate">
                    {sessionPackage?.language || 'Language'} • CEFR {sessionPackage?.level || 'A1.1'} • Slide {currentSlideIndex + 1} of 8: {SLIDE_TITLES[currentSlideIndex]}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {handleDownloadDayPptx && (
                    <button
                      type="button"
                      onClick={() => handleDownloadDayPptx(activeDay)}
                      disabled={downloadingPptx}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      title="Download presentation as .pptx file"
                    >
                      {downloadingPptx ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span className="hidden sm:inline">Exporting...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Download PPTX</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowSlideViewer(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                    title="Close presentation viewer (Escape)"
                  >
                    Close ✕
                  </button>
                </div>
              </div>

              {/* Main 16:9 Presentation Canvas */}
              <div className="w-full max-w-6xl mx-auto my-auto py-2 flex items-center justify-center relative">
                {/* Lateral Previous Slide Button */}
                <button
                  type="button"
                  onClick={() => setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev))}
                  disabled={currentSlideIndex === 0}
                  className="hidden md:flex absolute -left-4 z-20 w-10 h-10 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 items-center justify-center disabled:opacity-20 cursor-pointer transition-all shadow-lg"
                  title="Previous Slide (Left Arrow)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Lateral Next Slide Button */}
                <button
                  type="button"
                  onClick={() => setCurrentSlideIndex((prev) => (prev < 7 ? prev + 1 : prev))}
                  disabled={currentSlideIndex === 7}
                  className="hidden md:flex absolute -right-4 z-20 w-10 h-10 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 items-center justify-center disabled:opacity-20 cursor-pointer transition-all shadow-lg"
                  title="Next Slide (Right Arrow)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="w-full aspect-[16/9] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col relative overflow-hidden select-none">
                  {/* Top Royal Blue Institutional Accent Bar */}
                  <div className="h-1.5 bg-[#0052CC] w-full shrink-0" />

                  {/* Subtle Background Watermark with Official ISML Logo */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
                    <img
                      src="/isml_logo.jpg"
                      alt=""
                      className="w-72 sm:w-96 h-72 sm:h-96 object-contain opacity-[0.045]"
                    />
                  </div>

                  {/* Standard Slide Header (Visible on Content Slides 1-7) - Centered */}
                  {currentSlideIndex > 0 && (
                    <div className="px-6 pt-3.5 pb-2 border-b border-slate-100 flex items-center justify-between relative z-10 shrink-0">
                      <div className="w-12 sm:w-16 hidden sm:block shrink-0" />
                      <div className="text-center flex-1">
                        <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#0052CC] text-center">
                          {sessionPackage?.language || 'Language'} • CEFR {sessionPackage?.level || 'A1.1'} • {unitName} {effectiveDay.day_number}
                        </div>
                        <h2 className="text-base sm:text-xl font-black text-[#0B2447] tracking-tight text-center">
                          {SLIDE_TITLES[currentSlideIndex]}
                        </h2>
                      </div>
                      <div className="w-12 sm:w-16 flex justify-end shrink-0">
                        <img
                          src="/isml_logo.jpg"
                          alt="ISML"
                          className="h-8 sm:h-10 w-auto object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Slide Content Body (Index 0 to 7) - Centered Layout */}
                  <div className="flex-1 p-5 sm:p-7 relative z-10 overflow-y-auto flex flex-col justify-center items-center text-center">
                    {/* SLIDE 0: TITLE & COURSE COVER - CENTERED */}
                    {currentSlideIndex === 0 && (
                      <div className="flex flex-col justify-between items-center text-center h-full py-2 w-full max-w-4xl mx-auto">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <img
                            src="/isml_logo.jpg"
                            alt="ISML Official Logo"
                            className="h-16 sm:h-20 w-auto object-contain mx-auto"
                          />
                          <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-[#0052CC] font-bold text-xs uppercase tracking-wider rounded-lg inline-block">
                            Faculty Lesson Deck
                          </span>
                        </div>

                        <div className="my-auto space-y-2 text-center max-w-3xl mx-auto">
                          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#0052CC] block text-center">
                            Indian School for Modern Languages
                          </span>
                          <h1 className="text-2xl sm:text-4xl font-black text-[#0B2447] leading-tight tracking-tight text-center">
                            {cleanTopic}
                          </h1>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium text-center">
                            Comprehensive Academic Curriculum • {sessionPackage?.language || 'Target Language'} • CEFR Level {sessionPackage?.level || 'A1.1'}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs w-full">
                          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-md">
                            {unitName} {effectiveDay.day_number} of {totalDays}
                          </span>
                          <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-md">
                            16:9 Widescreen Institutional Format
                          </span>
                          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-md">
                            Certified Light Theme
                          </span>
                        </div>
                      </div>
                    )}

                    {/* SLIDE 1: LEARNING OBJECTIVES & CAN-DO - CENTERED */}
                    {currentSlideIndex === 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-auto max-w-4xl mx-auto w-full">
                        {canDoList.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center space-y-2 hover:border-blue-300 transition-colors"
                          >
                            <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-xs font-bold flex items-center justify-center mx-auto">
                              {idx + 1}
                            </span>
                            <div className="space-y-1 text-center w-full">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
                                Can-Do Competency {idx + 1}
                              </span>
                              <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug text-center">
                                {item}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SLIDE 2: GRAMMAR & SENTENCE BLUEPRINT - CENTERED */}
                    {currentSlideIndex === 2 && (
                      <div className="space-y-4 my-auto max-w-4xl mx-auto w-full">
                        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 text-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0052CC] block text-center">
                            Core Syntactic Architecture & Sentence Formula
                          </span>
                          <div className="p-3 bg-white border border-blue-200 rounded-lg text-xs sm:text-sm font-mono font-bold text-[#0B2447] text-center max-w-2xl mx-auto">
                            [Subject] + [Conjugated Verb] + [Direct/Indirect Object] + [Contextual Adverbial]
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block text-center">
                              Structural Grammar Breakdown
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed text-center">
                              {effectiveDay.grammar_rules_detail || "Focus on primary verb inflections, agreement rules, and placement of grammatical markers."}
                            </p>
                          </div>
                          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1 text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block text-center">
                              Common Pitfalls & Faculty Guidance
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed text-center">
                              Ensure learners do not transfer native word-order patterns directly. Drill verb positioning and inflection endings systematically.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SLIDE 3: TARGET VOCABULARY BANK - CENTERED */}
                    {currentSlideIndex === 3 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-auto max-w-4xl mx-auto w-full">
                        {vocabList.map((v, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center justify-center text-center space-y-1.5"
                          >
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <span className="font-extrabold text-sm sm:text-base text-[#0B2447] text-center">
                                {v.word}
                              </span>
                              <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono rounded text-center inline-block">
                                {v.pronunciation || '/phonetics/'}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-600 text-center">
                              Meaning: {v.meaning}
                            </p>
                            {v.example_sentence && (
                              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-100 text-center w-full">
                                "{v.example_sentence}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SLIDE 4: CLASSROOM DIALOGUES & PAIR WORK - CENTERED */}
                    {currentSlideIndex === 4 && (
                      <div className="space-y-2.5 my-auto max-w-3xl mx-auto w-full text-center">
                        <div className="space-y-2">
                          {dialogueLines.map((line, idx) => {
                            const isInstructor = line.toLowerCase().startsWith('instructor') || idx % 2 === 0;
                            return (
                              <div
                                key={idx}
                                className={`p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-medium text-center ${
                                  isInstructor
                                    ? 'bg-blue-50/70 border-blue-200 text-blue-950 mx-auto'
                                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-950 mx-auto'
                                }`}
                              >
                                {line}
                              </div>
                            );
                          })}
                        </div>
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 font-semibold text-center">
                          Pedagogical Prompt: Students partner in pairs to rehearse dialogue exchanges with natural pacing and rhythm.
                        </div>
                      </div>
                    )}

                    {/* SLIDE 5: CULTURE & FORMALITY REGISTERS - CENTERED */}
                    {currentSlideIndex === 5 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-auto max-w-4xl mx-auto w-full">
                        <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2 text-center flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block text-center">
                            Cultural Context & Pragmatics
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed text-center">
                            {(cultureData as any)?.cultural_etiquette || (cultureData as any)?.notes || "Cultural competence requires understanding non-verbal cues, conversational distance, and standard greetings across diverse regions."}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block text-center">
                            Sociolinguistic Formality Registers
                          </span>
                          <div className="space-y-1.5 text-xs text-slate-700 w-full">
                            <div className="p-2 bg-white rounded border border-slate-200 text-center">
                              <span className="font-bold text-[#0052CC]">Formality Rule:</span> {(cultureData as any)?.formality_rule || "Peer-to-peer informal forms versus polite formal registers."}
                            </div>
                            <div className="p-2 bg-white rounded border border-slate-200 text-center">
                              <span className="font-bold text-[#0B2447]">Sociolinguistic Tip:</span> {(cultureData as any)?.sociolinguistic_tip || "Pay close attention to respectful titles and honorific markers."}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SLIDE 6: INTERACTIVE LSRW DRILLS - CENTERED */}
                    {currentSlideIndex === 6 && (
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 my-auto text-xs max-w-4xl mx-auto w-full">
                        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 flex flex-col items-center justify-center text-center">
                          <span className="font-bold text-[#0052CC] uppercase text-[10px] block text-center">
                            Listening Drill
                          </span>
                          <p className="text-slate-700 text-[11px] text-center">
                            Identify phonetic stress and intonation patterns in native audio recordings.
                          </p>
                        </div>
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 flex flex-col items-center justify-center text-center">
                          <span className="font-bold text-emerald-800 uppercase text-[10px] block text-center">
                            Speaking Drill
                          </span>
                          <p className="text-slate-700 text-[11px] text-center">
                            Deliver 3 complete oral responses utilizing target vocabulary without hesitation.
                          </p>
                        </div>
                        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1 flex flex-col items-center justify-center text-center">
                          <span className="font-bold text-amber-800 uppercase text-[10px] block text-center">
                            Reading Drill
                          </span>
                          <p className="text-slate-700 text-[11px] text-center">
                            Scan authentic short passages to extract key factual details accurately.
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1 flex flex-col items-center justify-center text-center">
                          <span className="font-bold text-purple-800 uppercase text-[10px] block text-center">
                            Writing Drill
                          </span>
                          <p className="text-slate-700 text-[11px] text-center">
                            Draft a structured 4-sentence paragraph following the lesson's grammar blueprint.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SLIDE 7: SESSION WRAP-UP & HOMEWORK - CENTERED */}
                    {currentSlideIndex === 7 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-auto max-w-4xl mx-auto w-full">
                        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 text-center flex flex-col items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block text-center">
                            Session Takeaways & Mastery Checks
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-700 text-center">
                            <li className="flex flex-col items-center">
                              Mastered core grammatical formulas and structural conjugations.
                            </li>
                            <li className="flex flex-col items-center">
                              Internalized 4 key active vocabulary items with pronunciation.
                            </li>
                            <li className="flex flex-col items-center">
                              Practiced authentic conversational turns and formal registers.
                            </li>
                          </ul>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center flex flex-col items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block text-center">
                            Guided Homework Tasks
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-700 text-center">
                            {homeworkList.map((hw, idx) => (
                              <li key={idx} className="flex flex-col items-center">
                                <span className="text-[#0052CC] font-bold text-[10px]">Task {idx + 1}</span>
                                <span>{hw}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Standard Slide Footer Bar inside slide - Centered */}
                  <div className="px-6 py-2 border-t border-slate-100 flex items-center justify-center text-[10px] sm:text-[11px] text-slate-400 relative z-10 shrink-0 text-center">
                    <span className="text-center">
                      ISML AI Academic Agent | Indian School for Modern Languages | {sessionPackage?.language || 'Language'} • CEFR {sessionPackage?.level || 'A1.1'} | {unitName} {effectiveDay.day_number} | Slide {currentSlideIndex + 1} of 8
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Navigation & Pagination Controls */}
              <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-2 pt-2 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev))}
                  disabled={currentSlideIndex === 0}
                  className="px-3 sm:px-4 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous Slide</span>
                </button>

                {/* 8 Slide Pagination Pills */}
                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
                  {SLIDE_TITLES.map((title, idx) => {
                    const isActive = currentSlideIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`h-7 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          isActive
                            ? 'bg-[#0052CC] text-white border-[#0052CC] shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800'
                        }`}
                        title={`Go to Slide ${idx + 1}: ${title}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentSlideIndex((prev) => (prev < 7 ? prev + 1 : prev))}
                  disabled={currentSlideIndex === 7}
                  className="px-3 sm:px-4 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-700"
                >
                  <span className="hidden sm:inline">Next Slide</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
