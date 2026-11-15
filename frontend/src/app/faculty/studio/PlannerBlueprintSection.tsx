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
}: PlannerBlueprintProps) {
  const [activeTimetableDay, setActiveTimetableDay] = useState<number>(1);
  const [selectedCalendarWeek, setSelectedCalendarWeek] = useState<number | 'ALL'>('ALL');

  const activeMod =
    proposedPlanner?.modules?.find((m: any) => m.moduleNumber === plannerActiveModule) ||
    proposedPlanner?.modules?.[0];

  if (!proposedPlanner || !activeMod) return null;

  const totalPeriods = proposedPlanner.total_days || proposedPlanner.all_days?.length || 2;
  const unitName = proposedPlanner.unit_name || 'Period';
  const periodDuration = proposedPlanner.period_duration_minutes || 45;
  const allDays = proposedPlanner.all_days || activeMod.days || [];

  return (
    <div className="space-y-4 bg-white p-3 sm:p-5 border-t border-slate-200">
      {/* View Switcher Header Bar (Cards, Timetable, Calendar, Matrix Table) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Module {activeMod.moduleNumber} Course Blueprint</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {unitName}s {activeMod.startUnit} to {activeMod.endUnit} ({totalPeriods} Total Course {unitName}s)
            </span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            100% customizable period timetable, structured learning objectives, and vocabulary balance.
          </p>
        </div>

        {/* View Mode Switcher Pill */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setPlannerViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              plannerViewMode === 'cards'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Period Cards
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
            Timetable View
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

      {/* ---------------- 1. TIMETABLE VIEW (Period by Period Bell Schedule) ---------------- */}
      {plannerViewMode === 'timetable' && (
        <div className="space-y-4">
          {/* Quick Period Tabs (Day 1, Day 2, etc.) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Select {unitName}:
            </span>
            {activeMod.days.map((d: any) => (
              <button
                key={d.day_number}
                type="button"
                onClick={() => setActiveTimetableDay(d.day_number)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
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
              activeMod.days.find((d: any) => d.day_number === activeTimetableDay) ||
              activeMod.days[0];
            if (!currentDay) return null;

            const cleanTopic = currentDay.day_topic.replace(/^(Period|Session)\s*\d+:\s*/i, '');
            const warmupMins = Math.max(5, Math.round(periodDuration * 0.15));
            const lectureMins = Math.max(10, Math.round(periodDuration * 0.4));
            const practiceMins = Math.max(10, Math.round(periodDuration * 0.3));
            const wrapupMins = Math.max(5, periodDuration - warmupMins - lectureMins - practiceMins);

            return (
              <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 bg-slate-50/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider">
                      {unitName} {currentDay.day_number} Bell Schedule & Time Breakdown
                    </span>
                    <h5 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                      {cleanTopic}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-xl">
                      {periodDuration} Minutes Slot
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
                      {proposedPlanner.language} ({proposedPlanner.level})
                    </span>
                  </div>
                </div>

                {/* 4-Stage Timetable Schedule Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white border-l-4 border-blue-500 border border-slate-200 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Phase 1 (Warmup)</span>
                      <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{warmupMins} Mins</span>
                    </div>
                    <h6 className="text-xs font-bold text-slate-900">Pronunciation & Recall</h6>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Phonetic drills, previous class review, and communicative greeting.
                    </p>
                  </div>

                  <div className="bg-white border-l-4 border-indigo-500 border border-slate-200 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Phase 2 (Core Teach)</span>
                      <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{lectureMins} Mins</span>
                    </div>
                    <h6 className="text-xs font-bold text-slate-900">Grammar & Structure</h6>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {currentDay.grammar_rules_detail || 'Core morpho-syntactic rule, sentence patterns, and direct teaching.'}
                    </p>
                  </div>

                  <div className="bg-white border-l-4 border-sky-500 border border-slate-200 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Phase 3 (Practice)</span>
                      <span className="font-mono text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">{practiceMins} Mins</span>
                    </div>
                    <h6 className="text-xs font-bold text-slate-900">Guided LSRW Drills</h6>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Pair dialogue practice, listening audio comprehension, and worksheet activity.
                    </p>
                  </div>

                  <div className="bg-white border-l-4 border-slate-600 border border-slate-200 rounded-xl p-3.5 space-y-1">
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
                      Target Vocabulary ({currentDay.vocabulary_bank.length} words):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentDay.vocabulary_bank.slice(0, 8).map((v: any, vi: number) => (
                        <div key={vi} className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs flex items-center gap-1.5">
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

      {/* ---------------- 2. CALENDAR GRID VIEW ---------------- */}
      {plannerViewMode === 'calendar' && (
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Curriculum Calendar Map ({allDays.length} {unitName}s)
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Click any period to inspect
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {allDays.map((d: any) => {
                const isSelected = expandedPeriodId === d.day_number;
                const isMilestone = d.day_number % 10 === 0;
                return (
                  <button
                    key={d.day_number}
                    type="button"
                    onClick={() => setExpandedPeriodId(isSelected ? null : d.day_number)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : isMilestone
                        ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {unitName.slice(0, 1)}{d.day_number}
                      </span>
                      {isMilestone && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                          Test
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-tight">
                      {d.day_topic.replace(/^(Period|Session)\s*\d+:\s*/i, '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 3. PERIOD CARDS (Visual Blueprint) ---------------- */}
      {plannerViewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {activeMod.days.map((d: any) => {
            const cleanTopic = d.day_topic.replace(/^(Period|Session)\s*\d+:\s*/i, '');
            const isMilestone = d.day_number % 10 === 0;

            return (
              <div
                key={d.day_number}
                className={`bg-white rounded-2xl border transition-all duration-200 p-4 space-y-3 flex flex-col justify-between ${
                  isMilestone ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white font-mono">
                      {unitName} {d.day_number}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {periodDuration} Mins
                    </span>
                  </div>
                  {isMilestone && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      Quiz Day
                    </span>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Lesson Topic</span>
                    {isEditingPlanner ? (
                      <input
                        type="text"
                        value={cleanTopic}
                        onChange={(e) =>
                          updateDayInPlanner(d.day_number, 'day_topic', `${unitName} ${d.day_number}: ${e.target.value}`)
                        }
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {cleanTopic}
                      </h5>
                    )}
                  </div>

                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-2.5 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-blue-900 block">Grammar Anchor</span>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                      {d.grammar_rules_detail || 'Key grammar patterns, conjugations, and linguistic structures.'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">L • S • R • W</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTimetableDay(d.day_number);
                      setPlannerViewMode('timetable');
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    View Timetable →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- 4. MATRIX TABLE VIEW ---------------- */}
      {plannerViewMode === 'table' && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4 w-28">{unitName}</th>
                <th className="py-3 px-3 w-20">Duration</th>
                <th className="py-3 px-4">Lesson Topic / Linguistic Target</th>
                <th className="py-3 px-3 hidden sm:table-cell text-center">Skills Covered</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {activeMod.days.map((d: any) => {
                const cleanTopic = d.day_topic.replace(/^(Period|Session)\s*\d+:\s*/i, '');
                return (
                  <tr key={d.day_number} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {unitName} {d.day_number}
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {periodDuration} Mins
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {cleanTopic}
                    </td>
                    <td className="py-3 px-3 hidden sm:table-cell text-center text-[10px] font-mono text-slate-500">
                      LSRW Core
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTimetableDay(d.day_number);
                          setPlannerViewMode('timetable');
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Timetable
                      </button>
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
