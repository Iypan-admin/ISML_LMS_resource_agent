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
  updateDayInPlanner: (dayNum: number, field: any, val?: any) => void;
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

      const lang = proposedPlanner.language || 'English';
      const lvl = proposedPlanner.level || 'A1.1';
      const currentCleanTopic = (currentDay.day_topic || '')
        .replace(/^(Period|Session)\s*\d+:?\s*/i, '')
        .replace(/(isml|faculty|student|master|curriculum|blueprint|edition|multi-period|scheduled unit|executive lecture)/gi, '')
        .trim() || `Core Foundations in ${lang}`;

      const vWords = (currentDay.vocabulary_bank && currentDay.vocabulary_bank.length > 0)
        ? currentDay.vocabulary_bank
        : [
          { word: "Alphabet", meaning: "Ordered set of letters used in a language" },
          { word: "Vowel", meaning: "Speech sound produced without constriction in the vocal tract" },
          { word: "Pronounce", meaning: "To make the correct sound of a word or letter" }
        ];

      const primaryWord = typeof vWords[0] === 'string' ? vWords[0] : (vWords[0]?.word || 'Alphabet');
      const secondaryWord = typeof vWords[1] === 'string' ? vWords[1] : (vWords[1]?.word || 'Vowel');
      const tertiaryWord = typeof vWords[2] === 'string' ? vWords[2] : (vWords[2]?.word || 'Pronounce');

      // Baseline exercises in simple, practical English
      const defaultExercises = [
        `🎧 [Listening] Listen to the audio for "${currentCleanTopic}". How is "${primaryWord}" used in the sentence?`,
        `🗣️ [Speaking] Speak a clear sentence using "${primaryWord}" to express a simple thought.`,
        `📖 [Reading] Read the sentence with "${secondaryWord}" and explain its meaning in ${lang}.`,
        `✍️ [Writing] Write two simple sentences using both "${primaryWord}" and "${secondaryWord}".`
      ];

      let currentExercises: string[] = (Array.isArray(currentDay.in_class_exercises) && currentDay.in_class_exercises.length > 0)
        ? [...currentDay.in_class_exercises]
        : defaultExercises;

      let replyMessage = `Updated ${unitName} ${dayNum} based on your request.`;

      // Helper for contextual drill questions
      const generateDrills = (count: number, startIndex: number, topic: string, w1: string, w2: string, w3: string) => {
        const drills: string[] = [];
        const templates = [
          () => `🎧 [Listening] Listen to the audio for "${topic}" and identify "${w1}".`,
          () => `🗣️ [Speaking] Practice saying a sentence aloud using "${w1}" and "${w2}".`,
          () => `📖 [Reading] Read the sentence and check where "${w2}" is placed.`,
          () => `✍️ [Writing] Write a short 2-line dialogue using "${w1}".`,
          () => `🎧 [Listening] Listen to the dialogue for "${topic}" and answer what "${w3 || w1}" means.`,
          () => `🗣️ [Speaking] Practice clear pronunciation and accents using "${w2}".`,
          () => `📖 [Reading] Read the sample sentence and spot any spelling or word mistake with "${w1}".`,
          () => `✍️ [Writing] Write a question and answer using "${w2}".`
        ];
        for (let i = 0; i < count; i++) {
          const tIdx = (startIndex + i) % templates.length;
          drills.push(templates[tIdx]());
        }
        return drills;
      };

      // Detect Question Intent
      const isQuestionIntent = /question|ques|drill|task|exercise|kelvi/i.test(lower);
      const isAddIntent = /more|add|extra|innum|serthu|kooduthala|plus|further|rendum|pudhusaa/i.test(lower) ||
        /\b\d+\s*(more|extra|add|questions?\s*add)\b/i.test(lower) ||
        /(ques|question)\w*\s*(add|podu|serthu)/i.test(lower);

      // Detect Audio Flow Intent
      const isAudioFlow = (lower.includes('audio') || lower.includes('stream') || lower.includes('breakdown') || lower.includes('dialogue') || lower.includes('listening flow') || lower.includes('mins') || lower.includes('timing')) &&
        !isQuestionIntent;

      // Extract number if present
      let count = 2;
      const matchNum = lower.match(/\d+/);
      if (matchNum) {
        count = parseInt(matchNum[0], 10);
      } else if (/one|oru|onnu/i.test(lower)) {
        count = 1;
      } else if (/two|rendu|irandu/i.test(lower)) {
        count = 2;
      } else if (/three|moonu|moondru/i.test(lower)) {
        count = 3;
      } else if (/four|naalu|naangu/i.test(lower)) {
        count = 4;
      } else if (/five|anju|aindhu/i.test(lower)) {
        count = 5;
      }

      // ─────────────────────────────────────────────────────────────
      // 1. ADD QUESTIONS (e.g. "2 more ques add panu", "add 2 questions", "innum 2 question venum")
      // ─────────────────────────────────────────────────────────────
      if (isQuestionIntent && isAddIntent) {
        const toAdd = Math.min(10, Math.max(1, count));
        const newDrills = generateDrills(toAdd, currentExercises.length, currentCleanTopic, primaryWord, secondaryWord, tertiaryWord);
        const updatedTasks = [...currentExercises, ...newDrills];
        updateDayInPlanner(dayNum, 'in_class_exercises', updatedTasks);
        replyMessage = `Added ${toAdd} contextual questions to Auditory Decoding & Context Tasks (${updatedTasks.length} Tasks total).`;
      }

      // ─────────────────────────────────────────────────────────────
      // 2. SET TOTAL QUESTIONS (e.g. "10 questions venum", "5 drills podu")
      // ─────────────────────────────────────────────────────────────
      else if (isQuestionIntent && !isAddIntent) {
        const total = Math.min(20, Math.max(2, count));
        const newTasks = generateDrills(total, 0, currentCleanTopic, primaryWord, secondaryWord, tertiaryWord);
        updateDayInPlanner(dayNum, 'in_class_exercises', newTasks);
        replyMessage = `Configured ${total} structured tasks for ${unitName} ${dayNum}.`;
      }

      // ─────────────────────────────────────────────────────────────
      // 3. NATIVE LISTENING & AUDITORY IMMERSION FLOW ADJUSTMENTS
      // ─────────────────────────────────────────────────────────────
      else if (isAudioFlow) {
        const matchMins = lower.match(/(\d+)\s*(m|min|minute|mins)/) || lower.match(/\b(\d+)\b/);
        const explicitMins = matchMins ? parseInt(matchMins[1], 10) : null;

        let newStream = currentDay.audio_stream_mins ?? Math.max(5, Math.round(periodDuration * 0.15));
        let newBreakdown = currentDay.audio_breakdown_mins ?? Math.max(12, Math.round(periodDuration * 0.40));
        let newDialogues = currentDay.audio_dialogues_mins ?? Math.max(10, Math.round(periodDuration * 0.30));
        let newCheck = currentDay.audio_check_mins ?? Math.max(5, Math.max(0, periodDuration - newStream - newBreakdown - newDialogues));
        let stageName = '';

        if (lower.includes('stream') || lower.includes('tuning') || lower.includes('stage 1')) {
          newStream = explicitMins || Math.min(20, newStream + 3);
          stageName = 'Audio Stream';
        } else if (lower.includes('breakdown') || lower.includes('decoding') || lower.includes('stage 2')) {
          newBreakdown = explicitMins || Math.min(30, newBreakdown + 5);
          stageName = 'Audio Breakdown';
        } else if (lower.includes('dialogue') || lower.includes('speaking') || lower.includes('stage 3')) {
          newDialogues = explicitMins || Math.min(25, newDialogues + 5);
          stageName = 'Audio Dialogues';
        } else if (lower.includes('check') || lower.includes('exit') || lower.includes('stage 4')) {
          newCheck = explicitMins || Math.min(15, newCheck + 3);
          stageName = 'Audio Check';
        } else {
          newBreakdown = Math.min(25, newBreakdown + 4);
          newDialogues = Math.min(20, newDialogues + 3);
          stageName = 'Immersion Flow';
        }

        const flowPatch: Record<string, any> = {
          audio_stream_mins: newStream,
          audio_breakdown_mins: newBreakdown,
          audio_dialogues_mins: newDialogues,
          audio_check_mins: newCheck
        };

        if (lower.includes('business') || lower.includes('meeting')) {
          flowPatch.audio_dialogues_desc = 'Business situational dialogues and communicative turns';
        } else if (lower.includes('pronunciation') || lower.includes('phonetic')) {
          flowPatch.audio_breakdown_desc = 'Phonological decoding, liaison rules, stress & intonation patterns';
        }

        updateDayInPlanner(dayNum, flowPatch);
        replyMessage = `Adjusted ${stageName} timings: Stream ${newStream}m, Breakdown ${newBreakdown}m, Dialogues ${newDialogues}m, Check ${newCheck}m.`;
      }

      // ─────────────────────────────────────────────────────────────
      // 4. SPECIFIC READING TASK MODIFICATION
      // ─────────────────────────────────────────────────────────────
      else if (lower.includes('reading') || lower.includes('read') || lower.includes('passage') || lower.includes('syntax')) {
        const cleanInstruction = prompt
          .replace(/^(please|can you|change|set|add|make|focus on|teach|la change panu|change panu|content ah|content)s*/gi, '')
          .replace(/(la change panu|change panu|content ah|panu|da)/gi, '')
          .trim();
        const readingTheme = cleanInstruction.length > 2 ? cleanInstruction : currentCleanTopic;
        const newReadingTask = `📖 [Reading & Syntax] Analyze authentic paragraph on "${readingTheme}": synthesize syntactic agreements and answer 3 textual comprehension queries in ${lang} (${lvl}).`;

        if (currentExercises.length >= 3 && currentExercises[2].includes('[Reading')) {
          currentExercises[2] = newReadingTask;
        } else if (currentExercises.length > 0) {
          currentExercises[0] = newReadingTask;
        } else {
          currentExercises.push(newReadingTask);
        }
        updateDayInPlanner(dayNum, 'in_class_exercises', currentExercises);
        replyMessage = `Updated Reading & Syntax task to focus on "${readingTheme}".`;
      }

      // ─────────────────────────────────────────────────────────────
      // 5. SPECIFIC SPEAKING / AUDIO TASK MODIFICATION
      // ─────────────────────────────────────────────────────────────
      else if (lower.includes('speaking') || lower.includes('spoken') || lower.includes('oral') || lower.includes('dialogue')) {
        const cleanInstruction = prompt
          .replace(/^(please|can you|change|set|add|make|focus on|oral|audio|speaking|dialogue|la change panu|panu|da)s*/gi, '')
          .replace(/(la change panu|change panu|content ah|panu|da)/gi, '')
          .trim();
        const spokenTheme = cleanInstruction.length > 2 ? cleanInstruction : currentCleanTopic;
        const newSpeakingTask = `🗣️ [Speaking & Oral Production] Deliver spontaneous oral response on "${spokenTheme}" adhering to CEFR ${lvl} fluency and native stress patterns in ${lang}.`;

        if (currentExercises.length >= 2 && currentExercises[1].includes('[Speaking')) {
          currentExercises[1] = newSpeakingTask;
        } else if (currentExercises.length > 0) {
          currentExercises[0] = newSpeakingTask;
        } else {
          currentExercises.push(newSpeakingTask);
        }
        updateDayInPlanner(dayNum, 'in_class_exercises', currentExercises);
        replyMessage = `Configured conversational oral speaking task for ${unitName} ${dayNum}.`;
      }

      // ─────────────────────────────────────────────────────────────
      // 6. SPECIFIC WRITING TASK MODIFICATION
      // ─────────────────────────────────────────────────────────────
      else if (lower.includes('writing') || lower.includes('write') || lower.includes('essay') || lower.includes('sentence')) {
        const cleanInstruction = prompt
          .replace(/^(please|can you|change|set|add|make|focus on|writing|write|la change panu|panu|da)s*/gi, '')
          .replace(/(la change panu|change panu|content ah|panu|da)/gi, '')
          .trim();
        const writeTheme = cleanInstruction.length > 2 ? cleanInstruction : currentCleanTopic;
        const newWritingTask = `✍️ [Contextual Writing] Compose 3 structured sentences on "${writeTheme}" applying target vocabulary and correct morphological agreement in ${lang}.`;

        if (currentExercises.length >= 4) {
          currentExercises[3] = newWritingTask;
        } else {
          currentExercises.push(newWritingTask);
        }
        updateDayInPlanner(dayNum, 'in_class_exercises', currentExercises);
        replyMessage = `Updated contextual writing task for ${unitName} ${dayNum}.`;
      }

      // ─────────────────────────────────────────────────────────────
      // 7. SPECIFIC TOPIC, GRAMMAR, OR VERB RULE CHANGE
      // ─────────────────────────────────────────────────────────────
      else if (lower.includes('verb') || lower.includes('tense') || lower.includes('past') || lower.includes('greeting') || lower.includes('food') || lower.includes('travel') || lower.includes('topic') || lower.includes('vocab') || lower.includes('teach') || lower.includes('solli')) {
        const cleanPrompt = prompt
          .replace(/^(please|can you|change|set|add|make|focus on|teach|solli kodu|solli|kodu|topic ah|topic)\s*/gi, '')
          .replace(/(venum|topic|la change panu|change panu|panu|da)/gi, '')
          .trim();
        const cleanTopicTitle = cleanPrompt.length > 2
          ? (cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1))
          : 'Target Pedagogical Progression';

        // Synthesize authentic vocab
        let newVocab = [
          { word: "Vocabulaire clé", meaning: "Target lexical item" },
          { word: "Expression", meaning: "Idiomatic phrase" },
          { word: "Structure", meaning: "Morphological anchor" }
        ];

        const tLower = cleanPrompt.toLowerCase();
        if (tLower.includes('past') || tLower.includes('verb') || tLower.includes('tense')) {
          if (lang.toLowerCase().includes('french')) {
            newVocab = [
              { word: "Hier", meaning: "Yesterday (temporal anchor)" },
              { word: "Passé composé", meaning: "Past narrative tense" },
              { word: "Avoir / Être", meaning: "Auxiliary verb agreement" },
              { word: "Participe passé", meaning: "Past participle form" }
            ];
          } else if (lang.toLowerCase().includes('spanish')) {
            newVocab = [
              { word: "Ayer", meaning: "Yesterday (temporal anchor)" },
              { word: "Pretérito", meaning: "Simple past narrative" },
              { word: "Haber / Fue", meaning: "Auxiliary & irregular past forms" },
              { word: "Participio", meaning: "Past participle agreement" }
            ];
          } else {
            newVocab = [
              { word: "Yesterday", meaning: "Past temporal anchor" },
              { word: "Walked / Did", meaning: "Past regular / irregular action" },
              { word: "Completed", meaning: "Finished aspectual marker" },
              { word: "Ago", meaning: "Temporal interval marker" }
            ];
          }
        } else if (tLower.includes('food') || tLower.includes('restaurant') || tLower.includes('dining')) {
          newVocab = [
            { word: "Order / Commander", meaning: "To place a food order" },
            { word: "Menu", meaning: "Culinary bill of fare" },
            { word: "The Bill / L'addition", meaning: "Dining payment receipt" },
            { word: "Delicious", meaning: "Pleasing culinary taste" }
          ];
        } else if (tLower.includes('travel') || tLower.includes('airport') || tLower.includes('hotel')) {
          newVocab = [
            { word: "Ticket / Billet", meaning: "Transit document" },
            { word: "Departure", meaning: "Scheduled departure time" },
            { word: "Terminal / Station", meaning: "Transit arrival platform" },
            { word: "Luggage", meaning: "Travel bags and baggage" }
          ];
        }

        const newPWord = newVocab[0].word;
        const newSWord = newVocab[1].word;
        const updatedGrammar = `Core focus on ${cleanPrompt}. Pedagogical Goal: Real-world communication with active drills and targeted vocabulary in ${lang} (${lvl}).`;

        const refreshedTasks = [
          `🎧 [Listening] Listen to the audio for "${cleanTopicTitle}". How is "${newPWord}" applied in the sentence?`,
          `🗣️ [Speaking] Deliver a clear spoken sentence incorporating "${newPWord}" to express a fact or action.`,
          `📖 [Reading & Syntax] Analyze the clause pattern around "${newSWord}" within ${cleanTopicTitle}.`,
          `✍️ [Writing] Compose two communicative sentences applying both "${newPWord}" and "${newSWord}".`
        ];

        updateDayInPlanner(dayNum, {
          day_topic: `${unitName} ${dayNum}: ${cleanTopicTitle}`,
          grammar_rules_detail: updatedGrammar,
          vocabulary_bank: newVocab,
          audio_breakdown_desc: `Sentence decoding, stress & intonation patterns for ${cleanTopicTitle}`,
          audio_dialogues_desc: `Interactive conversational dialogue turns practicing ${cleanTopicTitle}`,
          in_class_exercises: refreshedTasks
        });

        replyMessage = `Re-anchored ${unitName} ${dayNum} to "${cleanTopicTitle}" with updated vocabulary, audio flow, and 4 contextual tasks.`;
      }

      // ─────────────────────────────────────────────────────────────
      // 8. GENERAL ENHANCEMENT DIRECTIVE
      // ─────────────────────────────────────────────────────────────
      else {
        const cleanPrompt = prompt.replace(/(venum|change panu|panu|da)/gi, '').trim();
        const updatedGrammar = `${currentDay.grammar_rules_detail || ''} • Custom Focus: ${cleanPrompt}`;
        const extra = generateDrills(2, currentExercises.length, currentCleanTopic, primaryWord, secondaryWord, tertiaryWord);
        const refreshed = [...currentExercises, ...extra];

        updateDayInPlanner(dayNum, {
          grammar_rules_detail: updatedGrammar,
          in_class_exercises: refreshed
        });
        replyMessage = `Applied custom directive "${cleanPrompt}" to ${unitName} ${dayNum} (${refreshed.length} Tasks total).`;
      }

      setPeriodAiReplies(prev => ({
        ...prev,
        [dayNum]: `✓ Updated: ${replyMessage}`
      }));

      setPeriodPrompts(prev => ({ ...prev, [dayNum]: '' }));
      setPeriodChatLoading(null);
    }, 350);
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

      {/* ── SECTION HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{unitName} Schedule & Lesson Plan</span>
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
              {allDays.length} {allDays.length === 1 ? unitName : `${unitName}s`}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Review lessons, class schedule, vocabulary, and practice exercises.
          </p>
        </div>
      </div>

      {/* ── PERIOD CARDS GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {allDays.map((d: any) => {
          const cleanTopic = (d.day_topic || '').replace(/^(Period|Session)\s*\d+:\s*/i, '');
          const isMilestone = d.day_number % 10 === 0;
          const currentPrompt = periodPrompts[d.day_number] || '';
          const isLoadingThisPeriod = periodChatLoading === d.day_number;
          const aiReply = periodAiReplies[d.day_number];

          // Calculate precise phase timings (reading dynamic overrides from d or defaulting)
          const streamMins = d.audio_stream_mins ?? Math.max(5, Math.round(periodDuration * 0.15));
          const breakdownMins = d.audio_breakdown_mins ?? Math.max(12, Math.round(periodDuration * 0.40));
          const dialoguesMins = d.audio_dialogues_mins ?? Math.max(10, Math.round(periodDuration * 0.30));
          const checkMins = d.audio_check_mins ?? Math.max(5, Math.max(0, periodDuration - streamMins - breakdownMins - dialoguesMins));
          const totalFlowMins = streamMins + breakdownMins + dialoguesMins + checkMins;

          const streamDesc = d.audio_stream_desc || 'Listen to native speaker audio and pronunciation';
          const breakdownDesc = d.audio_breakdown_desc || 'Sentence practice, word stress, and pronunciation';
          const dialoguesDesc = d.audio_dialogues_desc || 'Conversation practice and dialogues';
          const checkDesc = d.audio_check_desc || 'Quick check and review of what was learned';

          const vWords = (d.vocabulary_bank && d.vocabulary_bank.length > 0)
            ? d.vocabulary_bank
            : [
              { word: "Alphabet", meaning: "Ordered set of letters used in a language" },
              { word: "Vowel", meaning: "Speech sound produced without constriction in the vocal tract" },
              { word: "Pronounce", meaning: "To make the correct sound of a word or letter" }
            ];
          const primaryWord = typeof vWords[0] === 'string' ? vWords[0] : (vWords[0]?.word || 'Alphabet');
          const secondaryWord = typeof vWords[1] === 'string' ? vWords[1] : (vWords[1]?.word || 'Vowel');

          const defaultExercises = [
            `🎧 [Listening] Listen to the audio for "${cleanTopic}". How is "${primaryWord}" used in the sentence?`,
            `🗣️ [Speaking] Speak a clear sentence using "${primaryWord}" to express a simple thought.`,
            `📖 [Reading] Read the sample sentence with "${secondaryWord}" and explain its meaning.`,
            `✍️ [Writing] Write two simple sentences using both "${primaryWord}" and "${secondaryWord}".`
          ];

          const currentTasks = (d.in_class_exercises && d.in_class_exercises.length > 0)
            ? d.in_class_exercises
            : defaultExercises;

          return (
            <div
              key={d.day_number}
              className="bg-white border-2 border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 hover:border-blue-500 hover:shadow-md transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top Period Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0">
                      {d.day_number}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight whitespace-nowrap">
                          {unitName} {d.day_number}
                        </span>
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 whitespace-nowrap">
                          {periodDuration} Mins
                        </span>
                        <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 whitespace-nowrap">
                          {proposedPlanner.language}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-blue-700 font-semibold truncate block">
                        Lesson Plan
                      </span>
                    </div>
                  </div>

                  {d.is_assessment_day ? (
                    <div className="self-start sm:self-center shrink-0">
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-400 px-2.5 py-1 rounded-full shadow-2xs inline-flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse shrink-0" />
                        <span className="whitespace-nowrap">{d.assessment_benchmark_code || 'EXAM'}</span>
                      </span>
                    </div>
                  ) : isMilestone ? (
                    <div className="self-start sm:self-center shrink-0">
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 px-2.5 py-1 rounded-full shadow-2xs whitespace-nowrap">
                        Review Test
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0 self-start sm:self-center">
                      Module {(Math.ceil(d.day_number / 10))}
                    </span>
                  )}
                </div>

                {/* Assessment Milestone Banner */}
                {d.is_assessment_day && (
                  <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="bg-amber-600 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded shadow-2xs shrink-0 whitespace-nowrap">
                        {d.assessment_benchmark_code || 'TEST'}
                      </span>
                      <div className="text-amber-950 font-bold truncate">
                        {d.assessment_benchmark_title || 'Progress Test'}
                      </div>
                    </div>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 self-start sm:self-center whitespace-nowrap">
                      50 Marks • 45 Mins
                    </span>
                  </div>
                )}

                {/* ── PRIORITY 1: CONTENT BLUEPRINT & PEDAGOGICAL ANCHOR ── */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      1. Lesson Topic & Learning Goals
                    </span>
                    <span className="text-[9px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      Main Focus
                    </span>
                  </div>

                  {/* Lesson Topic & Theme */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center justify-between">
                      <span>Lesson Topic</span>
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
                      <span>Learning Goals & Grammar Focus</span>
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
                      Key Words & Vocabulary:
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
                      2. Class Schedule & Audio Flow
                    </span>
                    <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      {totalFlowMins} Mins
                    </span>
                  </div>

                  {/* 4-Stage In-Class Bell Schedule / Flow */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 bg-white border border-blue-200/80 rounded-xl space-y-0.5 shadow-2xs">
                      <div className="flex items-center justify-between text-[10px] font-bold text-blue-900">
                        <span>1. Listen</span>
                        <span className="font-mono text-blue-600">{streamMins}m</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-tight">
                        {streamDesc}
                      </p>
                    </div>

                    <div className="p-2.5 bg-white border border-indigo-200/80 rounded-xl space-y-0.5 shadow-2xs">
                      <div className="flex items-center justify-between text-[10px] font-bold text-indigo-900">
                        <span>2. Breakdown</span>
                        <span className="font-mono text-indigo-600">{breakdownMins}m</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-tight line-clamp-2" title={breakdownDesc}>
                        {breakdownDesc}
                      </p>
                    </div>

                    <div className="p-2.5 bg-white border border-sky-200/80 rounded-xl space-y-0.5 shadow-2xs">
                      <div className="flex items-center justify-between text-[10px] font-bold text-sky-900">
                        <span>3. Dialogue</span>
                        <span className="font-mono text-sky-600">{dialoguesMins}m</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-tight line-clamp-2" title={dialoguesDesc}>
                        {dialoguesDesc}
                      </p>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5 shadow-2xs">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-800">
                        <span>4. Review</span>
                        <span className="font-mono text-slate-600">{checkMins}m</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-tight">
                        {checkDesc}
                      </p>
                    </div>
                  </div>

                  {/* Practice Drills Checklist */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                      <span className="flex items-center gap-1.5 text-blue-900">
                        Practice Tasks & Questions:
                      </span>
                      <span className="text-[10px] text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-full font-mono font-bold">
                        {currentTasks.length} Tasks
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {currentTasks.map((ex: any, ei: number) => {
                        const exText = typeof ex === 'string' ? ex : (ex.question || ex.title || 'Exercise');
                        return (
                          <div key={ei} className="text-[11px] text-slate-700 bg-white border border-blue-100 rounded-lg p-2.5 flex items-start gap-2 shadow-2xs hover:border-blue-300 transition-colors">
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
                      Ask AI to customize this lesson:
                    </span>
                    <span className="text-[10px] text-slate-400">Change topic, add questions, audio, etc.</span>
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
    </div>
  );
}
