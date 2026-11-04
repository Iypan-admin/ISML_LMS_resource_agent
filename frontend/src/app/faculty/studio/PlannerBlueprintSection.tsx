

import React from 'react';
import { LayoutGrid, ChevronDown, Sparkles } from 'lucide-react';

interface PlannerBlueprintProps {
  proposedPlanner: any;
  plannerActiveModule: number;
  plannerViewMode: 'cards' | 'table';
  setPlannerViewMode: (mode: 'cards' | 'table') => void;
  isEditingPlanner: boolean;
  expandedPeriodId: number | null;
  setExpandedPeriodId: (id: number | null) => void;
  updateDayInPlanner: (dayNum: number, field: any, val: any) => void;
  setCoPilotPrompt: (prompt: string) => void;
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
  setCoPilotPrompt,
}: PlannerBlueprintProps) {
  const activeMod =
    proposedPlanner?.modules?.find((m: any) => m.moduleNumber === plannerActiveModule) ||
    proposedPlanner?.modules?.[0];

  if (!activeMod) return null;

  return (
    <div className="p-5 sm:p-6 space-y-4 bg-slate-50/50">
      {/* View Controls & Module Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <div>
            <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Module {activeMod.moduleNumber} Pedagogical Blueprint</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-800 border border-blue-200/60">
                {proposedPlanner.unit_name}s {activeMod.startUnit} to {activeMod.endUnit}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Structured linguistic progression, grammar paradigms, and communicative drills for ~{activeMod.approxWeeks} weeks of study.
            </p>
          </div>
        </div>

        {/* Card vs Table View Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-200/80 p-0.5 rounded-xl flex items-center border border-slate-300/80 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setPlannerViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${plannerViewMode === 'cards'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Blueprint Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setPlannerViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${plannerViewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <span>Matrix Table</span>
            </button>
          </div>

          {isEditingPlanner && (
            <span className="text-[11px] text-amber-800 font-bold bg-amber-100/80 px-2.5 py-1.5 rounded-xl border border-amber-300/80">
              Editing active
            </span>
          )}
        </div>
      </div>

      {/* 1. VISUAL BLUEPRINT CARD GRID */}
      {plannerViewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeMod.days.map((d: any) => {
            const cleanTopic = d.day_topic.replace(/^(Period|Session)\s*\d+:\s*/i, '');
            const isMilestone = d.day_number % 10 === 0;
            const practiceQ =
              (d.in_class_exercises && d.in_class_exercises[0]) ||
              d.student_lsrw_practice?.grammar_exercise?.fill_in_blanks?.[0] ||
              'Target linguistic structure application drill';
            const phases = d.teacher_lesson_breakdown?.phases || [
              { phase: 'Phonetic Warm-up', minutes: Math.round(proposedPlanner.period_duration_minutes * 0.15) },
              { phase: 'Concept & Grammar Lecture', minutes: Math.round(proposedPlanner.period_duration_minutes * 0.35) },
              { phase: 'Guided Pair Drills', minutes: Math.round(proposedPlanner.period_duration_minutes * 0.3) },
              { phase: 'Formative Wrap-up', minutes: Math.round(proposedPlanner.period_duration_minutes * 0.2) },
            ];

            return (
              <div
                key={d.day_number}
                className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden ${isMilestone
                    ? 'border-amber-300 ring-2 ring-amber-200/50 shadow-sm'
                    : 'border-slate-200 hover:border-blue-300'
                  }`}
              >
                {/* Card Header Bar */}
                <div
                  className={`p-3.5 border-b flex items-center justify-between ${isMilestone
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                      : 'bg-slate-50/70 border-slate-100'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono shadow-2xs ${isMilestone ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-white'
                        }`}
                    >
                      {proposedPlanner.unit_name} {d.day_number}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                      {proposedPlanner.period_duration_minutes} Mins
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isMilestone && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-md shadow-xs">
                        Formal Quiz
                      </span>
                    )}
                    <div className="flex items-center gap-1 font-mono text-[9px] font-bold text-slate-700">
                      <span className="w-4 h-4 rounded flex items-center justify-center bg-blue-50 text-blue-700 border border-blue-200" title="Listening">L</span>
                      <span className="w-4 h-4 rounded flex items-center justify-center bg-emerald-50 text-emerald-700 border border-emerald-200" title="Speaking">S</span>
                      <span className="w-4 h-4 rounded flex items-center justify-center bg-purple-50 text-purple-700 border border-purple-200" title="Reading">R</span>
                      <span className="w-4 h-4 rounded flex items-center justify-center bg-amber-50 text-amber-700 border border-amber-200" title="Writing">W</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1">
                  {/* Lesson Topic Title */}
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                      Session Target
                    </span>
                    {isEditingPlanner ? (
                      <input
                        type="text"
                        value={cleanTopic}
                        onChange={(e) =>
                          updateDayInPlanner(
                            d.day_number,
                            'day_topic',
                            `${proposedPlanner.unit_name} ${d.day_number}: ${e.target.value}`
                          )
                        }
                        className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <h5 className="text-xs font-black text-slate-900 leading-snug line-clamp-2">
                        {cleanTopic}
                      </h5>
                    )}
                  </div>

                  {/* Linguistic Grammar Anchor */}
                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-2.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold text-blue-900">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        Grammar & Structure Paradigm
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                      {d.grammar_rules_detail || 'Core sentence patterns, verb structures, and morpho-syntactic agreements.'}
                    </p>
                  </div>

                  {/* Class Period Phases */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      Period Phase Allocation
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                      {phases.slice(0, 4).map((ph: any, phi: number) => (
                        <div
                          key={phi}
                          className="bg-slate-50 border border-slate-200/80 rounded-lg p-1.5 flex items-center justify-between gap-1"
                        >
                          <span className="truncate text-slate-700 font-semibold" title={ph.phase}>
                            {ph.phase.replace(/^\d+\.\s*/, '')}
                          </span>
                          <span className="font-mono font-bold text-slate-700 shrink-0 text-[10px] bg-white px-1.5 py-0.2 rounded border border-slate-200">
                            {ph.minutes}m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Communicative Practice Task */}
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Communicative Drill
                    </span>
                    <p className="text-[10.5px] text-emerald-950 font-medium leading-relaxed">
                      {practiceQ}
                    </p>
                  </div>

                  {/* Vocabulary Bank Preview */}
                  {d.vocabulary_bank && d.vocabulary_bank.length > 0 && (
                    <div className="pt-1 border-t border-slate-100 flex flex-wrap items-center gap-1">
                      <span className="text-[9.5px] font-bold text-slate-500 mr-1">Anchor Vocab:</span>
                      {d.vocabulary_bank.slice(0, 4).map((v: any, vi: number) => (
                        <span
                          key={vi}
                          className="bg-slate-100 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200/60"
                        >
                          {typeof v === 'string' ? v : v.word}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer Quick Action */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setCoPilotPrompt(
                        `Refine and optimize pedagogical drill for ${proposedPlanner.unit_name} ${d.day_number} (${cleanTopic})`
                      )
                    }
                    className="text-[11px] text-blue-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Refine with AI</span>
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">
                    CEFR {proposedPlanner.level}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 2. TRADITIONAL MATRIX TABLE VIEW */
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4 w-28">{proposedPlanner.unit_name}</th>
                <th className="py-3 px-3 w-20">Duration</th>
                <th className="py-3 px-4">Lesson Topic / Linguistic Target</th>
                <th className="py-3 px-3 w-32 hidden sm:table-cell text-center">Skills Covered</th>
                <th className="py-3 px-4 w-28 text-right">Details</th>
                {isEditingPlanner && <th className="py-3 px-3 w-36">Notes</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {activeMod.days.map((d: any) => {
                const cleanTopic = d.day_topic.replace(/^(Period|Session)\s*\d+:\s*/i, '');
                const isExpanded = expandedPeriodId === d.day_number;
                const isMilestone = d.day_number % 10 === 0;

                return (
                  <tr
                    key={d.day_number}
                    onClick={() => setExpandedPeriodId(isExpanded ? null : d.day_number)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50/90 font-medium' : ''
                      } ${isMilestone ? 'bg-amber-50/20' : ''}`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900">
                          {proposedPlanner.unit_name} {d.day_number}
                        </span>
                        {isMilestone && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">
                            Quiz
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[11px]">
                        {proposedPlanner.period_duration_minutes}m
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 text-xs block truncate max-w-[280px] sm:max-w-[480px]">
                        {cleanTopic}
                      </span>
                    </td>
                    <td className="py-3 px-3 hidden sm:table-cell text-center">
                      <div className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-slate-600">
                        <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 border border-slate-200">L</span>
                        <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 border border-slate-200">S</span>
                        <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 border border-slate-200">R</span>
                        <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 border border-slate-200">W</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setExpandedPeriodId(isExpanded ? null : d.day_number)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </td>
                    {isEditingPlanner && (
                      <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={d.grammar_rules_detail || ''}
                          onChange={(e) =>
                            updateDayInPlanner(d.day_number, 'grammar_rules_detail', e.target.value)
                          }
                          placeholder="Note..."
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[11px] text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    )}
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
