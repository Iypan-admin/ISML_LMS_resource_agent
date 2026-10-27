"use client";

import React, { useState } from 'react';
import { useResources } from '@/context/ResourceContext';
import { useMasterData } from '@/context/MasterDataContext';
import ResourceCard from '@/components/resource/ResourceCard';
import ResourceTable from '@/components/resource/ResourceTable';
import SearchableSelect from '@/components/common/SearchableSelect';
import { EmptyState } from '@/components/common/States';
import { LayoutGrid, List, RotateCcw, Filter, Plus, School, GraduationCap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import {
  InstitutionType,
  SchoolCategoryKey,
  CollegeTrackKey,
  SCHOOL_CATEGORIES,
  SCHOOL_LEVEL_SCHEDULES,
  COLLEGE_TRACKS,
  COLLEGE_LEVEL_SCHEDULES,
  getSchoolSchedule,
  getCollegeSchedule
} from '../faculty/studio/institutionalSchedules';

export default function ResourceLibraryPage() {
  const { filters, setFilters, resetFilters, filteredResources, resources, isLoading, error } = useResources();
  const { languages, levels, skills, resourceTypes } = useMasterData();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Institutional Stream State: SCHOOL vs COLLEGE
  const [institutionType, setInstitutionType] = useState<InstitutionType>('SCHOOL');
  const [schoolCategory, setSchoolCategory] = useState<SchoolCategoryKey>('CAT_1');
  const [schoolLevel, setSchoolLevel] = useState<string>('All');
  const [collegeTrack, setCollegeTrack] = useState<CollegeTrackKey>('STANDARD');

  // Language options matching AcademicContextSelector UI
  const languageOptions = React.useMemo(() => {
    const list = [
      { value: 'All', label: 'All Languages', icon: '🌐' },
      { value: 'German', label: 'German (Deutsch)', icon: '🇩🇪' },
      { value: 'French', label: 'French (Français)', icon: '🇫🇷' },
      { value: 'Japanese', label: 'Japanese (日本語)', icon: '🇯🇵' },
      { value: 'Spanish', label: 'Spanish (Español)', icon: '🇪🇸' },
      { value: 'Korean', label: 'Korean (한국어)', icon: '🇰🇷' },
      { value: 'English', label: 'English (English)', icon: '🇬🇧' },
    ];

    if (languages.length > 0) {
      languages.forEach(l => {
        if (!list.some(item => item.value.toLowerCase() === l.name.toLowerCase())) {
          list.push({
            value: l.name,
            label: `${l.name} (${l.nativeName || l.code.toUpperCase()})`,
            icon: l.flagEmoji || '🌐',
          });
        }
      });
    }

    return list;
  }, [languages]);

  // CEFR & JLPT Level options dynamically adapted to selected language
  const levelOptions = React.useMemo(() => {
    const isJapanese = filters.language?.toLowerCase() === 'japanese';

    if (isJapanese) {
      return [
        { value: 'All', label: 'All JLPT Levels (N5 - N1)' },
        { value: 'N5', label: 'JLPT N5 (Basic Japanese)', sublabel: 'Basic Hiragana, Katakana & Kanji' },
        { value: 'N4', label: 'JLPT N4 (Elementary Japanese)', sublabel: 'Basic conversation & grammar' },
        { value: 'N3', label: 'JLPT N3 (Intermediate Japanese)', sublabel: 'Bridge to advanced Japanese' },
        { value: 'N2', label: 'JLPT N2 (Pre-Advanced Japanese)', sublabel: 'Business & media Japanese' },
        { value: 'N1', label: 'JLPT N1 (Advanced Japanese)', sublabel: 'Native-level JLPT mastery' },
      ];
    }

    if (filters.language && filters.language !== 'All') {
      return [
        { value: 'All', label: `All ${filters.language} Levels (A1 - C2)` },
        { value: 'A1', label: 'CEFR A1 (Beginner)', sublabel: 'Basic phrases & greetings' },
        { value: 'A2', label: 'CEFR A2 (Elementary)', sublabel: 'Daily expressions & routine' },
        { value: 'B1', label: 'CEFR B1 (Intermediate)', sublabel: 'Travel & work conversations' },
        { value: 'B2', label: 'CEFR B2 (Upper Intermediate)', sublabel: 'Complex text & discussions' },
        { value: 'C1', label: 'CEFR C1 (Advanced)', sublabel: 'Professional & academic fluency' },
        { value: 'C2', label: 'CEFR C2 (Mastery)', sublabel: 'Native-level proficiency' },
      ];
    }

    return [
      { value: 'All', label: 'All Levels (A1-C2 / N5-N1)' },
      { value: 'A1', label: 'CEFR A1 (Beginner)', sublabel: 'Basic phrases & greetings' },
      { value: 'A2', label: 'CEFR A2 (Elementary)', sublabel: 'Daily expressions & routine' },
      { value: 'B1', label: 'CEFR B1 (Intermediate)', sublabel: 'Travel & work conversations' },
      { value: 'B2', label: 'CEFR B2 (Upper Intermediate)', sublabel: 'Complex text & discussions' },
      { value: 'C1', label: 'CEFR C1 (Advanced)', sublabel: 'Professional & academic fluency' },
      { value: 'C2', label: 'CEFR C2 (Mastery)', sublabel: 'Native-level proficiency' },
      { value: 'N5', label: 'JLPT N5 (Basic Japanese)', sublabel: 'Basic Hiragana, Katakana & Kanji' },
      { value: 'N4', label: 'JLPT N4 (Elementary Japanese)', sublabel: 'Basic conversation & grammar' },
      { value: 'N3', label: 'JLPT N3 (Intermediate Japanese)', sublabel: 'Bridge to advanced Japanese' },
      { value: 'N2', label: 'JLPT N2 (Pre-Advanced Japanese)', sublabel: 'Business & media Japanese' },
      { value: 'N1', label: 'JLPT N1 (Advanced Japanese)', sublabel: 'Native-level JLPT mastery' },
    ];
  }, [filters.language]);

  // Skill options matching AcademicContextSelector UI
  const skillOptions = React.useMemo(() => {
    return [
      { value: 'All', label: 'All Academic Skills' },
      { value: 'Speaking', label: 'Dialogue & Speaking', sublabel: 'Situational dialogues & roleplay' },
      { value: 'Vocabulary', label: 'Vocabulary Bank', sublabel: 'Essential word lists & definitions' },
      { value: 'Grammar', label: 'Grammar Rules & Usage', sublabel: 'Verbs, particles & sentence rules' },
      { value: 'Reading', label: 'Reading Comprehension', sublabel: 'Stories, passages & articles' },
      { value: 'Listening', label: 'Listening & Audio', sublabel: 'Pronunciation & listening checks' },
      { value: 'Writing', label: 'Writing & Composition', sublabel: 'Character writing & essays' },
      { value: 'Full Study Guide', label: 'Full Masterclass Handbook', sublabel: 'Comprehensive handbook & Q&A' },
    ];
  }, []);

  // Resource Format options matching AcademicContextSelector UI
  const typeOptions = React.useMemo(() => {
    return [
      { value: 'All', label: 'All Resource Formats' },
      { value: 'Dialogue', label: 'Dialogue Script', sublabel: 'Situational conversational script' },
      { value: 'WEBSITE', label: 'Web Portal / Website', sublabel: 'Interactive web learning link' },
      { value: 'ARTICLE', label: 'Article / Study Notes', sublabel: 'Text explanation & lesson guide' },
      { value: 'PDF', label: 'PDF Document / Worksheet', sublabel: 'Printable exercises & sheets' },
      { value: 'VIDEO', label: 'Video Lesson', sublabel: 'YouTube & video clips' },
      { value: 'EXERCISE', label: 'Exercise / Quiz', sublabel: 'Practice questions & tests' },
    ];
  }, []);

  // Status options
  const statusOptions = React.useMemo(() => {
    return [
      { value: 'All', label: 'All Statuses' },
      { value: 'Published', label: 'Published' },
      { value: 'Approved', label: 'Approved' },
      { value: 'Pending Review', label: 'Pending Review' },
      { value: 'Changes Required', label: 'Changes Required' },
      { value: 'Rejected', label: 'Rejected' },
      { value: 'Archived', label: 'Archived' },
    ];
  }, []);

  // Source Type options
  const sourceOptions = React.useMemo(() => {
    return [
      { value: 'All', label: 'All Source Types' },
      { value: 'Internal', label: '🏢 Internal Resources', sublabel: 'LMS Catalog Dataset' },
      { value: 'AI Generated', label: '🤖 AI Generated', sublabel: 'ISML AI Studio' },
      { value: 'External', label: '⚡ External Resources', sublabel: 'Validated OER Links' },
    ];
  }, []);

  return (
    <div className="space-y-6 font-sans pb-24 max-w-7xl mx-auto">
      {/* Studio-Grade Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            ISML Foreign Language Curriculum & Resource Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Central Resource Library & Curriculum Alignment
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Validated repository of foreign-language learning modules, lesson slides, and certified practice kits ({filteredResources.length} of {resources.length} active resources).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-blue-900 shadow-md' : 'text-slate-300 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white text-blue-900 shadow-md' : 'text-slate-300 hover:text-white'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/resources/add"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold">
          ⚠️ {error}
        </div>
      )}



      {/* Institutional Schedule & Curriculum Filter (Schools vs Colleges Matrix) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        {/* Switcher & Framework Heading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curriculum Stream & Schedule Alignment</span>
            </div>
            <h3 className="text-base font-extrabold text-[#0B2447]">
              {institutionType === 'SCHOOL' ? '🏫 School Category Schedule Matrix (K-12 Periods)' : '🎓 College Immersion Track Matrix (Higher Ed)'}
            </h3>
          </div>

          {/* School / College Switcher Toggle Buttons */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setInstitutionType('SCHOOL');
                if (filters.language === 'Japanese') {
                  setFilters(prev => ({ ...prev, language: 'Spanish', level: 'All' }));
                }
              }}
              className={`py-2 px-4 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                institutionType === 'SCHOOL'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <School className="w-4 h-4" />
              <span>Schools</span>
            </button>
            <button
              type="button"
              onClick={() => setInstitutionType('COLLEGE')}
              className={`py-2 px-4 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                institutionType === 'COLLEGE'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Colleges</span>
            </button>
          </div>
        </div>

        {/* ----------------- SCHOOL FILTER SECTION ----------------- */}
        {institutionType === 'SCHOOL' && (
          <div className="space-y-4 p-4 bg-sky-50/70 border border-sky-200 rounded-2xl">
            {/* Category Selection (Cat 1 to Cat 6) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-sky-950 uppercase tracking-wider">
                  Select Period Category:
                </label>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded border border-sky-300">
                  {SCHOOL_CATEGORIES[schoolCategory].durationMinutes} Mins / Period
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {(Object.keys(SCHOOL_CATEGORIES) as SchoolCategoryKey[]).map((catKey) => {
                  const catMeta = SCHOOL_CATEGORIES[catKey];
                  const isCatSelected = schoolCategory === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setSchoolCategory(catKey)}
                      className={`p-2.5 rounded-xl text-center border text-xs font-bold transition-all ${
                        isCatSelected
                          ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                          : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                      }`}
                    >
                      <span className="block text-[11px] font-black">{catMeta.key.replace('_', ' ')}</span>
                      <span className="text-[10px] opacity-90">{catMeta.durationMinutes}m / period</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* School Grade Levels (A1.1 to B1.4) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-sky-950 uppercase tracking-wider">
                  Target School Level (A1.1 – B1.4):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSchoolLevel('All');
                    setFilters(prev => ({ ...prev, level: 'All' }));
                  }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                    schoolLevel === 'All' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:underline'
                  }`}
                >
                  All School Levels
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
                {SCHOOL_LEVEL_SCHEDULES.map((sched) => {
                  const isLvlSelected = schoolLevel === sched.level || filters.level === sched.level;
                  return (
                    <button
                      key={sched.level}
                      type="button"
                      onClick={() => {
                        setSchoolLevel(sched.level);
                        setFilters(prev => ({ ...prev, level: sched.level }));
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center border ${
                        isLvlSelected
                          ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                          : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                      }`}
                    >
                      <span className="block font-black">{sched.level}</span>
                      <span className="text-[9px] opacity-80">{sched.courseDurationHours}h</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Metric Summary Ribbon */}
            {(() => {
              const activeSchool = getSchoolSchedule(schoolLevel === 'All' ? 'A1.1' : schoolLevel, schoolCategory);
              return (
                <div className="bg-white border border-sky-200 rounded-xl p-3 shadow-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                    <span className="text-[11px] font-extrabold uppercase text-sky-900 flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-sky-600" />
                      <span>Standardized School Schedule Parameters</span>
                    </span>
                    <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {activeSchool.totalPeriods} Total Periods • {activeSchool.periodsPerWeek} Periods / Week
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-sky-50 p-2 rounded-lg">
                      <span className="text-[10px] text-sky-700 block font-semibold">Period Duration:</span>
                      <strong className="text-sky-950 text-sm">{activeSchool.periodDurationMinutes} Minutes</strong>
                    </div>
                    <div className="bg-sky-50 p-2 rounded-lg">
                      <span className="text-[10px] text-sky-700 block font-semibold">Course Hours:</span>
                      <strong className="text-sky-950 text-sm">{activeSchool.courseDurationHours} Hours</strong>
                    </div>
                    <div className="bg-sky-50 p-2 rounded-lg">
                      <span className="text-[10px] text-sky-700 block font-semibold">Assessments:</span>
                      <strong className="text-sky-950 text-sm">{activeSchool.assessmentsCount} Tests</strong>
                    </div>
                    <div className="bg-sky-50 p-2 rounded-lg">
                      <span className="text-[10px] text-sky-700 block font-semibold">Human Speaking:</span>
                      <strong className="text-sky-950 text-sm">{activeSchool.humanPracticeMinutesPer2Weeks}m / 2 wks</strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-sky-900 bg-sky-100/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                    <span>🤖 AI Speaking Daily Practice:</span>
                    <strong className="text-sky-950">{activeSchool.aiPracticePerDay} times / day</strong>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ----------------- COLLEGE FILTER SECTION ----------------- */}
        {institutionType === 'COLLEGE' && (
          <div className="space-y-4 p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
            {/* Track Selection (Standard, Intensive, Super-Intensive) */}
            <div>
              <label className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider block mb-1.5">
                Select Immersion Track:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(Object.keys(COLLEGE_TRACKS) as CollegeTrackKey[]).map((tKey) => {
                  const tMeta = COLLEGE_TRACKS[tKey];
                  const isTSelected = collegeTrack === tKey;
                  return (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setCollegeTrack(tKey)}
                      className={`p-3 rounded-xl text-center border text-xs font-bold transition-all ${
                        isTSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-100'
                      }`}
                    >
                      <span className="block text-xs font-black">{tKey.replace('_', ' ')}</span>
                      <span className="text-[10px] opacity-90">{tMeta.sessionMinutes} mins / session</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* College Target Levels */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">
                  Target Proficiency Level ({filters.language === 'Japanese' ? 'JLPT' : 'CEFR'}):
                </label>
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, level: 'All' }))}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                    filters.level === 'All' ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:underline'
                  }`}
                >
                  All College Levels
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {(filters.language === 'Japanese'
                  ? ['N5', 'N4', 'N3', 'N2']
                  : ['A1', 'A2', 'B1', 'B2']
                ).map((lvl) => {
                  const isLvlSelected = filters.level.toLowerCase().includes(lvl.toLowerCase()) || filters.level === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, level: lvl }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        isLvlSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Metric Summary Ribbon */}
            {(() => {
              const activeCollege = getCollegeSchedule(filters.language || 'French', filters.level === 'All' ? 'A1' : filters.level, collegeTrack);
              return (
                <div className="bg-white border border-indigo-200 rounded-xl p-3 shadow-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                    <span className="text-[11px] font-extrabold uppercase text-indigo-900 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Higher Ed Academic Track Specifications</span>
                    </span>
                    <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {activeCollege.sessionsRequired} Sessions • {activeCollege.monthsRequired} Months Completion
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <span className="text-[10px] text-indigo-700 block font-semibold">Weekly Cadence:</span>
                      <strong className="text-indigo-950 text-sm">{activeCollege.sessionsPerWeek} Sessions/wk</strong>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <span className="text-[10px] text-indigo-700 block font-semibold">Session Length:</span>
                      <strong className="text-indigo-950 text-sm">{activeCollege.sessionMinutes} Minutes</strong>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <span className="text-[10px] text-indigo-700 block font-semibold">Assessments:</span>
                      <strong className="text-indigo-950 text-sm">{activeCollege.assessmentsCount} Tests</strong>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <span className="text-[10px] text-indigo-700 block font-semibold">Human Speaking:</span>
                      <strong className="text-indigo-950 text-sm">{activeCollege.humanPracticeMinutesPerWeek}m / week</strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-indigo-900 bg-indigo-100/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                    <span>🤖 AI Speaking Daily Practice:</span>
                    <strong className="text-indigo-950">{activeCollege.aiPracticePerDay} times / day</strong>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>



      {/* Resource Content Grid or Table */}
      {isLoading ? (
        <div className="p-8 text-center text-xs font-bold text-slate-500">
          Loading resources from NestJS Backend...
        </div>
      ) : filteredResources.length === 0 ? (
        <EmptyState
          title="No resources matched your criteria"
          description="Try broadening your language, level, or skill filters to explore available items."
          onAction={resetFilters}
        />
      ) : (
        <>
          {/* Professional System / Desktop Table View */}
          <div className={viewMode === 'table' ? 'hidden sm:block' : 'hidden'}>
            <ResourceTable resources={filteredResources} />
          </div>

          {/* Mobile Card Grid View */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'grid sm:hidden grid-cols-1 gap-4'}>
            {filteredResources.map((res) => (
              <ResourceCard key={res.id} resource={res} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
