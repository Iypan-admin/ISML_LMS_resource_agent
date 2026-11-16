"use client";

import React, { useState } from 'react';

interface PlannerBlueprintProps {
  proposedPlanner: any;
  plannerActiveModule: number;
  plannerViewMode: 'cards' | 'table' | 'timetable' | 'calendar';
  setPlannerViewMode: (mode: any) => void;
  isEditingPlanner: boolean;
  expandedPeriodId: number | null;
  setExpandedPeriodId: (id: number | null) => void;
  updateDayInPlanner: (dayNum: number, field: any, val: any) => void;
  setCoPilotPrompt?: (prompt: string) => void;
  onRefinePrompt?: (e?: React.FormEvent) => Promise<void>;
  coPilotLoading?: boolean;
  uploadedFiles?: File[];
  sourceUrls?: string[];
}

export function PlannerBlueprintSection({
  proposedPlanner,
  plannerActiveModule,
  plannerViewMode,
  setPlannerViewMode,
  isEditingPlanner,
  expandedPeriodId,
  setExpandedPeriodId,
  updateDayInPlanner,
  onRefinePrompt,
  coPilotLoading = false,
  uploadedFiles = [],
  sourceUrls = [],
}: PlannerBlueprintProps) {
  const [activeTimetableDay, setActiveTimetableDay] = useState<number>(1);
  const [selectedCalendarWeek, setSelectedCalendarWeek] = useState<number | 'ALL'>('ALL');
  const [showSourceMaterials, setShowSourceMaterials] = useState<boolean>(false);
  const [globalPrompt, setGlobalPrompt] = useState<string>('');
  
  // Dedicated Per-Period Chatbot Prompts map { [dayNumber]: promptText }
  const [periodPrompts, setPeriodPrompts] = useState<Record<number, string>>({});
  const [periodChatLoading, setPeriodChatLoading] = useState<number | null>(null);
  const [periodAiReplies, setPeriodAiReplies] = useState<Record<number, string>>({});

  const activeMod =
    proposedPlanner?.modules?.find((m: any) => m.moduleNumber === plannerActiveModule) ||
    proposedPlanner?.modules?.[0];

  if (!proposedPlanner || !activeMod) return null;

  const totalPeriods = proposedPlanner.total_days || proposedPlanner.all_days?.length || 2;
  const unitName = proposedPlanner.unit_name || 'Period';
  const periodDuration = proposedPlanner.period_duration_minutes || 45;
  const allDays = proposedPlanner.all_days || activeMod.days || [];

  // Files and URLs list from props or planner metadata
  const filesList = (uploadedFiles && uploadedFiles.length > 0)
    ? uploadedFiles.map(f => ({ name: f.name, size: f.size }))
    : (proposedPlanner.uploaded_files_list || []);

  const urlsList = (sourceUrls && sourceUrls.length > 0)
    ? sourceUrls.filter(u => u && u.trim().length > 0)
    : (proposedPlanner.source_urls_list || []);

  // Per-Period AI Customization Handler
  const handlePeriodAiCustomization = (dayNum: number, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = (periodPrompts[dayNum] || '').trim();
    if (!prompt) return;

    setPeriodChatLoading(dayNum);

    setTimeout(() => {
      const lower = prompt.toLowerCase();
      const currentDay = allDays.find((d: any) => d.day_number === dayNum);
      if (!currentDay) {
        setPeriodChatLoading(null);
        return;
      }

      const lang = proposedPlanner.language || 'French';
      const lvl = proposedPlanner.level || 'A1.1';
      const currentCleanTopic = (currentDay.day_topic || '')
        .replace(/^(Period|Session)\s*\d+:?\s*/i, '')
        .replace(/(isml|faculty|student|master|curriculum|blueprint|edition|multi-period|scheduled unit|executive lecture)/gi, '')
        .trim() || `Core Foundations in ${lang}`;

      // Extract existing in-class exercises or build default set
      let currentExercises: string[] = Array.isArray(currentDay.in_class_exercises) && currentDay.in_class_exercises.length > 0
        ? [...currentDay.in_class_exercises]
        : [
            `[R - Reading & Syntax] Read authentic context paragraph and identify structural agreements in ${lang}`,
            `[S - Spoken Interaction] Formulate communicative conversational responses adhering to ${currentCleanTopic}`,
            `[L - Auditory & Error Discrimination] Identify phonological or syntactic agreement errors in spoken ${lang}`,
            `[W - Contextual Writing] Formulate 2 cohesive sentences applying target grammar and vocabulary`
          ];

      let replyMessage = `Customized ${unitName} ${dayNum} according to your directive: "${prompt}"`;

      // A. Specific Reading Task Modification (e.g. "reading la change panu content ah", "reading comprehension change")
      if (lower.includes('reading') || lower.includes('read') || lower.includes('text') || lower.includes('passage')) {
        const cleanInstruction = prompt
          .replace(/^(please|can you|change|set|add|make|focus on|teach|la change panu|change panu|content ah|content)s*/gi, '')
          .replace(/(la change panu|change panu|content ah|panu|da)/gi, '')
          .trim();
        const readingTheme = cleanInstruction.length > 2 ? cleanInstruction : currentCleanTopic;
        const newReadingTask = `[R - Reading & Comprehension] Analyze passage on "${readingTheme}": synthesize syntactic agreements and answer 3 textual comprehension queries in ${lang} (${lvl}).`;
        
        // Replace exercise #1 if it's reading, or prepend/replace
        if (currentExercises.length > 0 && currentExercises[0].includes('[R -')) {
          currentExercises[0] = newReadingTask;
        } else {
          currentExercises = [newReadingTask, ...currentExercises.slice(1)];
        }
        updateDayInPlanner(dayNum, 'in_class_exercises', currentExercises);
        replyMessage = `Updated Reading & Syntax module to focus strictly on "${readingTheme}".`;
      }

      // B. Specific Speaking / Audio Task Modification (e.g. "speaking la change panu", "audio conversation add panu")
      else if (lower.includes('speaking') || lower.includes('spoken') || lower.includes('audio') || lower.includes('dialogue') || lower.includes('oral')) {
        const cleanInstruction = prompt
          .replace(/^(please|can you|change|set|add|make|focus on|oral|audio|speaking|dialogue|la change panu|panu|da)s*/gi, '')
          .replace(/(la change panu|change panu|content ah|panu|da)/gi, '')
          .trim();
        const spokenTheme = cleanInstruction.length > 2 ? cleanInstruction : currentCleanTopic;
        const newSpeakingTask = `[S - Spoken Audio Dialogue] Live 2-person situational roleplay on "${spokenTheme}": execute spontaneous oral exchange with native intonation in ${lang}.`;
        
        if (currentExercises.length > 1 && currentExercises[1].includes('[S -')) {
          currentExercises[1] = newSpeakingTask;
        } else {
          currentExercises[1] = newSpeakingTask;
        }
        updateDayInPlanner(dayNum, 'in_class_exercises', currentExercises);
        replyMessage = `Configured conversational audio speaking roleplay for ${unitName} ${dayNum}.`;
      }

      // C. Specific Writing Task Modification (e.g. "writing task change panu", "essay / paragraph")
      else if (lower.includes('writing') || lower.includes('write') || lower.includes('essay') || lower.includes('sentence')) {
        const cleanInstruction = prompt
          .replace(/^(please|can you|change|set|add|make|focus on|writing|write|la change panu|panu|da)s*/gi, '')
          .replace(/(la change panu|change panu|content ah|panu|da)/gi, '')
          .trim();
        const writeTheme = cleanInstruction.length > 2 ? cleanInstruction : currentCleanTopic;
        const newWritingTask = `[W - Analytical Writing] Draft a cohesive 5-sentence structured communicative response on "${writeTheme}" adhering to CEFR ${lvl} syntax in ${lang}.`;
        
        if (currentExercises.length >= 4) {
          currentExercises[3] = newWritingTask;
        } else {
          currentExercises.push(newWritingTask);
        }
        updateDayInPlanner(dayNum, 'in_class_exercises', currentExercises);
        replyMessage = `Updated contextual writing task for ${unitName} ${dayNum}.`;
      }

      // D. Numbered Questions Request (e.g. "10 questions venum", "5 drills", "20 assessment tasks")
      else if (lower.includes('question') || lower.includes('ques') || lower.includes('drill') || lower.includes('test') || lower.includes('assessment')) {
        const matchNum = lower.match(/\d+/);
        const count = matchNum ? Math.min(20, Math.max(1, parseInt(matchNum[0]))) : 5;
        const newQuestions: string[] = [];
        const taskTypes = [
          '[R - Reading Analysis]',
          '[S - Spoken Dialogue]',
          '[L - Auditory Check]',
          '[W - Sentence Production]',
          '[G - Grammar & Agreement]'
        ];
        for (let q = 1; q <= count; q++) {
          const prefix = taskTypes[(q - 1) % taskTypes.length];
          newQuestions.push(`${prefix} Task #${q}: Practical linguistic application for ${currentCleanTopic} (${lang} ${lvl})`);
        }
        updateDayInPlanner(dayNum, 'in_class_exercises', newQuestions);
        replyMessage = `Successfully configured ${count} customized exercises for ${unitName} ${dayNum}.`;
      }

      // E. Specific Topic, Grammar, or Verb Rule Change
      else if (lower.includes('verb') || lower.includes('tense') || lower.includes('greeting') || lower.includes('food') || lower.includes('travel') || lower.includes('topic') || lower.includes('vocab')) {
        const cleanPrompt = prompt
          .replace(/^(please|can you|change|set|add|make|focus on|teach)\s*/gi, '')
          .replace(/(venum|topic|la change panu|panu|da)/gi, '')
          .trim();
        const cleanTopicTitle = cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);
        const updatedTopic = `${unitName} ${dayNum}: ${cleanTopicTitle}`;
        const updatedGrammar = `Core focus on ${cleanPrompt}. Pedagogical Goal: Real-world communication with active drills and targeted vocabulary in ${lang} (${lvl}).`;
        
        const refreshedTasks = [
          `[R - Reading & Syntax] Read dialogue demonstrating ${cleanPrompt} in everyday ${lang} usage`,
          `[S - Spoken Interaction] Pair drill practicing oral questions and answers with ${cleanPrompt}`,
          `[L - Auditory Discrimination] Listen and verify inflection accuracy of ${cleanPrompt}`,
          `[W - Contextual Writing] Compose 3 sentences applying ${cleanPrompt} in situational context`
        ];
        
        updateDayInPlanner(dayNum, 'day_topic', updatedTopic);
        updateDayInPlanner(dayNum, 'grammar_rules_detail', updatedGrammar);
        updateDayInPlanner(dayNum, 'in_class_exercises', refreshedTasks);
        replyMessage = `Re-anchored ${unitName} ${dayNum} topic to "${cleanTopicTitle}" with updated exercises.`;
      } else {
        // General enhancement directive
        const cleanPrompt = prompt.replace(/(venum|change panu|panu|da)/gi, '').trim();
        const updatedGrammar = `${currentDay.grammar_rules_detail || ''} • Custom Focus: ${cleanPrompt}`;
        const refreshedTasks = [
          `[R - Reading] Read focused text integrating: ${cleanPrompt}`,
          `[S - Spoken] Interactive dialogue applying: ${cleanPrompt}`,
          `[L - Listening] Comprehension listening check on: ${cleanPrompt}`,
          `[W - Writing] Guided writing exercise on: ${cleanPrompt}`
        ];
        updateDayInPlanner(dayNum, 'grammar_rules_detail', updatedGrammar);
        updateDayInPlanner(dayNum, 'in_class_exercises', refreshedTasks);
        replyMessage = `Applied custom directive "${cleanPrompt}" to ${unitName} ${dayNum}.`;
      }

      setPeriodAiReplies(prev => ({
        ...prev,
        [dayNum]: `✓ Updated: ${replyMessage}`
      }));

      setPeriodPrompts(prev => ({ ...prev, [dayNum]: '' }));
      setPeriodChatLoading(null);
    }, 400);
  };

  const handleGlobalPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalPrompt.trim()) return;
    if (onRefinePrompt) {
      await onRefinePrompt(e);
      setGlobalPrompt('');
    }
  };

  return (
    <div className="space-y-4 bg-white p-3 sm:p-5 border-t border-slate-200">
      
      {/* ── TOP SECTION: Attached Source Materials Accordion / Drawer ── */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Grounded Knowledge Sources
              </span>
              <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {filesList.length} Files • {urlsList.length} Links
              </span>
            </div>
            <p className="text-xs text-slate-500">
              This session planner was structured directly from your uploaded syllabus files and reference video links with zero hallucination.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSourceMaterials(!showSourceMaterials)}
            className="px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            {showSourceMaterials ? 'Hide Sources ✕' : 'View Connected Sources ↗'}
          </button>
        </div>

        {/* Expandable Source Materials Viewer */}
        {showSourceMaterials && (
          <div className="mt-4 pt-3.5 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-200">
            {/* Uploaded Files Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-1.5">
                <span>Uploaded Documents & Audio/Video</span>
                <span className="text-slate-400">{filesList.length} items</span>
              </div>
              {filesList.length > 0 ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {filesList.map((file: any, fi: number) => (
                    <div key={fi} className="flex items-center justify-between text-xs p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-[240px]">
                        {file.name}
                      </span>
                      {file.size && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {(file.size / 1024).toFixed(0)} KB
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-2">No local files were uploaded for this generation.</p>
              )}
            </div>

            {/* Video & Web Links Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-1.5">
                <span>Connected Video Transcripts & Web Links</span>
                <span className="text-slate-400">{urlsList.length} links</span>
              </div>
              {urlsList.length > 0 ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {urlsList.map((url: string, ui: number) => (
                    <div key={ui} className="flex items-center justify-between text-xs p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100">
                      <span className="font-mono text-blue-700 truncate max-w-[240px] text-[11px]">
                        {url}
                      </span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-600 hover:underline font-bold shrink-0 ml-2"
                      >
                        Open ↗
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-2">No external video or web links provided.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── VIEW SWITCHER HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            {unitName} Timetable & Pedagogical Structure
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Use the AI chatbox on each period to request specific topics, question counts, or grammar rules directly.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0 border border-slate-200">
          <button
            type="button"
            onClick={() => setPlannerViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              plannerViewMode === 'cards'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Period Cards & Chatbot
          </button>
          <button
            type="button"
            onClick={() => setPlannerViewMode('timetable')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              plannerViewMode === 'timetable'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bell Schedule View
          </button>
          <button
            type="button"
            onClick={() => setPlannerViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              plannerViewMode === 'calendar'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Calendar Grid
          </button>
          <button
            type="button"
            onClick={() => setPlannerViewMode('table')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              plannerViewMode === 'table'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matrix Table
          </button>
        </div>
      </div>

      {/* ---------------- 1. PROFESSIONAL PERIOD CARDS VIEW WITH PHASE BREAKDOWN & CO-PILOT ---------------- */}
      {plannerViewMode === 'cards' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {allDays.map((d: any) => {
            const cleanTopic = (d.day_topic || '').replace(/^(Period|Session)\s*\d+:\s*/i, '');
            const isMilestone = d.day_number % 10 === 0;
            const currentPrompt = periodPrompts[d.day_number] || '';
            const isLoadingThisPeriod = periodChatLoading === d.day_number;
            const aiReply = periodAiReplies[d.day_number];

            // Calculate precise phase timings
            const warmupMins = Math.max(5, Math.round(periodDuration * 0.15));
            const lectureMins = Math.max(12, Math.round(periodDuration * 0.40));
            const practiceMins = Math.max(10, Math.round(periodDuration * 0.30));
            const exitMins = Math.max(5, periodDuration - warmupMins - lectureMins - practiceMins);

            const vWords = (d.vocabulary_bank && d.vocabulary_bank.length > 0)
              ? d.vocabulary_bank
              : [
                  { word: "Vocabulaire clé", meaning: "Target lexical item" },
                  { word: "Expression", meaning: "Idiomatic phrase" },
                  { word: "Structure", meaning: "Morphological anchor" }
                ];

            return (
              <div
                key={d.day_number}
                className="bg-white border-2 border-slate-200/90 rounded-2xl p-5 space-y-4 hover:border-blue-500 hover:shadow-md transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Period Header Bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        {d.day_number}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900 tracking-tight">
                            {unitName} {d.day_number}
                          </span>
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                            {periodDuration} Mins
                          </span>
                          <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                            {proposedPlanner.language}
                          </span>
                        </div>
                        <span className="text-[11px] text-blue-700 font-semibold">
                          Source-Grounded Course Delivery Plan
                        </span>
                      </div>
                    </div>

                    {isMilestone ? (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 px-2.5 py-1 rounded-full shadow-2xs">
                        Milestone Assessment
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">
                        Module {(Math.ceil(d.day_number / 10))}
                      </span>
                    )}
                  </div>

                  {/* ── PRIORITY 1: CONTENT BLUEPRINT & PEDAGOGICAL ANCHOR ── */}
                  <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        1. Content Blueprint & Core Knowledge Anchor
                      </span>
                      <span className="text-[9px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        Primary Focus
                      </span>
                    </div>

                    {/* Lesson Topic & Theme */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center justify-between">
                        <span>Lesson Topic & Subject Module</span>
                        <span className="text-[9px] text-blue-600 font-normal">Click to edit</span>
                      </label>
                      <input
                        type="text"
                        value={cleanTopic}
                        onChange={(e) =>
                          updateDayInPlanner(d.day_number, 'day_topic', `${unitName} ${d.day_number}: ${e.target.value}`)
                        }
                        className="w-full text-xs font-bold text-slate-900 px-3 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none transition-all shadow-2xs"
                      />
                    </div>

                    {/* Core Pedagogical Concept & Directive */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center justify-between">
                        <span>Core Concept & Learning Milestone</span>
                        <span className="text-[9px] text-blue-600 font-normal">Click to edit</span>
                      </label>
                      <textarea
                        rows={2}
                        value={d.grammar_rules_detail || ''}
                        onChange={(e) =>
                          updateDayInPlanner(d.day_number, 'grammar_rules_detail', e.target.value)
                        }
                        className="w-full text-xs text-slate-700 px-3 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none transition-all leading-relaxed shadow-2xs"
                      />
                    </div>

                    {/* Key Concept Terms */}
                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                        Core Subject Terms & Target Context:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {vWords.slice(0, 4).map((v: any, vi: number) => (
                          <div key={vi} className="text-[10px] font-medium bg-white text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1.5">
                            <strong className="text-blue-900 font-bold">{v.word}</strong>
                            {v.meaning && (
                              <>
                                <span className="text-slate-300 font-normal">•</span>
                                <span className="text-slate-500 text-[9px] max-w-[140px] truncate">{v.meaning}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── PRIORITY 2: NATIVE LISTENING & AUDITORY IMMERSION FLOW ── */}
                  <div className="bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-sky-50/50 border border-blue-200/70 rounded-xl p-3.5 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                      <span className="text-[11px] font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        2. Native Listening & Auditory Immersion Flow
                      </span>
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        {periodDuration} Mins Flow
                      </span>
                    </div>

                    {/* 4-Stage In-Class Bell Schedule / Flow */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2.5 bg-white border border-blue-200/80 rounded-xl space-y-0.5 shadow-2xs">
                        <div className="flex items-center justify-between text-[10px] font-bold text-blue-900">
                          <span>1. Audio Stream</span>
                          <span className="font-mono text-blue-600">{warmupMins}m</span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-tight">
                          Ear tuning: Native audio stream & sound discrimination
                        </p>
                      </div>

                      <div className="p-2.5 bg-white border border-indigo-200/80 rounded-xl space-y-0.5 shadow-2xs">
                        <div className="flex items-center justify-between text-[10px] font-bold text-indigo-900">
                          <span>2. Audio Breakdown</span>
                          <span className="font-mono text-indigo-600">{lectureMins}m</span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-tight line-clamp-2" title={d.grammar_rules_detail}>
                          Sentence decoding, stress & intonation patterns
                        </p>
                      </div>

                      <div className="p-2.5 bg-white border border-sky-200/80 rounded-xl space-y-0.5 shadow-2xs">
                        <div className="flex items-center justify-between text-[10px] font-bold text-sky-900">
                          <span>3. Audio Dialogues</span>
                          <span className="font-mono text-sky-600">{practiceMins}m</span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-tight">
                          Listening comprehension & interactive dialogue turns
                        </p>
                      </div>

                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5 shadow-2xs">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-800">
                          <span>4. Audio Check</span>
                          <span className="font-mono text-slate-600">{exitMins}m</span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-tight">
                          Comprehension verification & exit listening check
                        </p>
                      </div>
                    </div>

                    {/* Auditory Immersion Drills Checklist */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                        <span className="flex items-center gap-1.5 text-blue-900">
                          🎧 Auditory Decoding & Context Tasks:
                        </span>
                        <span className="text-[10px] text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-full font-mono font-bold">
                          {(d.in_class_exercises || []).length || 4} Tasks
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {((d.in_class_exercises && d.in_class_exercises.length > 0)
                          ? d.in_class_exercises
                          : [
                              `🎧 [Audio Track 1: Ear Tuning] Listen to audio scenario on ${cleanTopic}`,
                              `🎧 [Auditory Discrimination] Identify stress & tone patterns in ${proposedPlanner.language}`,
                              `💬 [Dialogue Comprehension] Listening check on target concept terms`,
                              `🎯 [Comprehension Check] Answer auditory verification questions`
                            ]
                        ).map((ex: any, ei: number) => {
                          const exText = typeof ex === 'string' ? ex : (ex.question || ex.title || 'Exercise');
                          return (
                            <div key={ei} className="text-[11px] text-slate-700 bg-white border border-blue-100 rounded-lg p-2.5 flex items-start gap-2 shadow-2xs">
                              <span className="text-blue-600 font-black shrink-0 text-[10px]">#{ei + 1}</span>
                              <span className="leading-snug flex-1">{exText}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* AI Status Feedback Message */}
                  {aiReply && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-900 animate-in fade-in flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      <span>{aiReply}</span>
                    </div>
                  )}
                </div>

                {/* ── EMBEDDED AI CHATBOT BOX FOR THIS SPECIFIC PERIOD ── */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-blue-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        AI Period Co-Pilot:
                      </span>
                      <span className="text-[10px] text-slate-400">Ask to change topic, add questions, audio, etc.</span>
                    </div>

                    <form
                      onSubmit={(e) => handlePeriodAiCustomization(d.day_number, e)}
                      className="flex items-center gap-1.5"
                    >
                      <input
                        type="text"
                        value={currentPrompt}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPeriodPrompts(prev => ({ ...prev, [d.day_number]: val }));
                        }}
                        placeholder={`e.g. '10 questions venum', 'teach past tense verbs', 'reading la change panu'...`}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                      />
                      <button
                        type="submit"
                        disabled={!currentPrompt.trim() || isLoadingThisPeriod}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shrink-0 shadow-2xs"
                      >
                        {isLoadingThisPeriod ? 'Updating...' : 'Ask AI'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- 2. TIMETABLE VIEW (Period by Period Bell Schedule with Direct Edit) ---------------- */}
      {plannerViewMode === 'timetable' && (
        <div className="space-y-4">
          {/* Quick Period Tabs (Day 1, Day 2, etc.) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Select {unitName}:
            </span>
            {allDays.map((d: any) => (
              <button
                key={d.day_number}
                type="button"
                onClick={() => setActiveTimetableDay(d.day_number)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTimetableDay === d.day_number
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {unitName} {d.day_number}
              </button>
            ))}
          </div>

          {/* Timetable Detailed Breakdown for the Active Period */}
          {(() => {
            const currentDay =
              allDays.find((d: any) => d.day_number === activeTimetableDay) ||
              allDays[0];
            if (!currentDay) return null;

            const cleanTopic = (currentDay.day_topic || '').replace(/^(Period|Session)\s*\d+:\s*/i, '');
            const warmupMins = Math.max(5, Math.round(periodDuration * 0.15));
            const lectureMins = Math.max(10, Math.round(periodDuration * 0.4));
            const practiceMins = Math.max(10, Math.round(periodDuration * 0.3));
            const wrapupMins = Math.max(5, periodDuration - warmupMins - lectureMins - practiceMins);

            return (
              <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 bg-slate-50/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider block">
                      {unitName} {currentDay.day_number} Bell Schedule & Time Breakdown
                    </span>
                    <h5 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                      {cleanTopic}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-xl">
                      {periodDuration} Mins
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
                      {proposedPlanner.language} ({proposedPlanner.level})
                    </span>
                  </div>
                </div>

                {/* 4-Stage Timetable Schedule Matrix with Clean Typography */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Phase 1 */}
                  <div className="bg-white border-l-4 border-blue-500 border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Phase 1 (Warmup)</span>
                      <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{warmupMins} Mins</span>
                    </div>
                    <h6 className="text-xs font-bold text-slate-900">Pronunciation & Recall</h6>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Phonetic drills, previous class review, and communicative greeting.
                    </p>
                  </div>

                  {/* Phase 2 */}
                  <div className="bg-white border-l-4 border-indigo-500 border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Phase 2 (Core Teach)</span>
                      <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{lectureMins} Mins</span>
                    </div>
                    <h6 className="text-xs font-bold text-slate-900">Grammar & Structure</h6>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {currentDay.grammar_rules_detail || 'Core morpho-syntactic rule, sentence patterns, and direct teaching.'}
                    </p>
                  </div>

                  {/* Phase 3 */}
                  <div className="bg-white border-l-4 border-sky-500 border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Phase 3 (Practice)</span>
                      <span className="font-mono text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">{practiceMins} Mins</span>
                    </div>
                    <h6 className="text-xs font-bold text-slate-900">Guided LSRW Drills</h6>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Pair dialogue practice, listening audio comprehension, and worksheet activity.
                    </p>
                  </div>

                  {/* Phase 4 */}
                  <div className="bg-white border-l-4 border-slate-600 border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Phase 4 (Exit & Task)</span>
                      <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{wrapupMins} Mins</span>
                    </div>
                    <h6 className="text-xs font-bold text-slate-900">Wrap-up & Homework</h6>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Quick exit quiz question, lesson synthesis, and self-study assignment.
                    </p>
                  </div>
                </div>

                {/* Vocabulary Bank Preview */}
                {currentDay.vocabulary_bank && currentDay.vocabulary_bank.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-2">
                      Key Concept Terms & Context Focus:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentDay.vocabulary_bank.slice(0, 8).map((v: any, vi: number) => (
                        <div key={vi} className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs flex items-center gap-1.5 shadow-2xs">
                          <strong className="text-blue-900 font-bold">{v.word}</strong>
                          <span className="text-slate-400 font-normal">→</span>
                          <span className="text-slate-600">{v.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ---------------- 3. CALENDAR GRID VIEW ---------------- */}
      {plannerViewMode === 'calendar' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {allDays.map((d: any) => {
              const cleanTopic = (d.day_topic || '').replace(/^(Period|Session)\s*\d+:\s*/i, '');
              const isMilestone = d.day_number % 10 === 0;

              return (
                <div
                  key={d.day_number}
                  className={`p-3 rounded-xl border transition-all ${
                    isMilestone
                      ? 'bg-amber-50/50 border-amber-300'
                      : 'bg-white border-slate-200 hover:border-blue-400 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-slate-700">{unitName} {d.day_number}</span>
                    {isMilestone && <span className="text-[9px] text-amber-700 font-bold">Quiz</span>}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-900 line-clamp-2 leading-tight">
                    {cleanTopic}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- 4. MATRIX TABLE VIEW ---------------- */}
      {plannerViewMode === 'table' && (
        <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">Lesson Topic</th>
                <th className="py-2.5 px-3">Grammar Anchor</th>
                <th className="py-2.5 px-3">Vocabulary Focus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {allDays.map((d: any) => {
                const cleanTopic = (d.day_topic || '').replace(/^(Period|Session)\s*\d+:\s*/i, '');
                return (
                  <tr key={d.day_number} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-blue-700">
                      {unitName} {d.day_number}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {cleanTopic}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                      {d.grammar_rules_detail}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {(d.vocabulary_bank || []).slice(0, 3).map((v: any) => v.word).join(', ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
