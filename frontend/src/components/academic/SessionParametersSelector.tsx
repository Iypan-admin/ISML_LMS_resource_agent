"use client";

import React, { useState } from 'react';
import {
  Languages,
  GraduationCap,
  Calendar,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  CheckCircle2
} from 'lucide-react';

export type CourseTrackMode = 'STANDARD' | 'INTERNSHIP' | 'SUPER_INTERNSHIP' | 'CUSTOM';

export interface SessionParametersValue {
  language: string;
  level: string;
  trackMode: CourseTrackMode;
  customDays?: number;
  customDaysMode?: 'TOTAL' | 'MONTHLY';
  monthlyMonths?: number;
}

export const CORE_LANGUAGES = [
  { value: 'Spanish', label: 'Spanish (Español)', flag: '🇪🇸', framework: 'CEFR (A1–C2)', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
  { value: 'German', label: 'German (Deutsch)', flag: '🇩🇪', framework: 'CEFR (A1–C2)', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
  { value: 'French', label: 'French (Français)', flag: '🇫🇷', framework: 'CEFR (A1–C2)', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
  { value: 'Japanese', label: 'Japanese (日本語)', flag: '🇯🇵', framework: 'JLPT (N5–N1)', levels: ['N5', 'N4', 'N3', 'N2', 'N1'] },
  { value: 'Korean', label: 'Korean (한국어)', flag: '🇰🇷', framework: 'TOPIK (1–6)', levels: ['TOPIK 1', 'TOPIK 2', 'TOPIK 3', 'TOPIK 4', 'TOPIK 5', 'TOPIK 6'] },
];

export const TRACK_CONFIGS: Record<CourseTrackMode, {
  name: string;
  duration: string;
  badge: string;
  description: string;
}> = {
  STANDARD: {
    name: 'Standard Level',
    duration: '12 Calendar Months (365 Days • Jan–Dec)',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Comprehensive 12-month calendar academic curriculum matching real calendar days (Jan: 31d, Feb: 28/29d, Mar: 31d, Apr: 30d, etc.).'
  },
  INTERNSHIP: {
    name: 'Internship',
    duration: '6 Calendar Months (181 Days • Jan–Jun)',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    description: '6-month career curriculum aligned with authentic calendar months (Jan: 31d, Feb: 28/29d, Mar: 31d, Apr: 30d, May: 31d, Jun: 30d).'
  },
  SUPER_INTERNSHIP: {
    name: 'Super Internship',
    duration: '3 Calendar Months (90 Days • Jan–Mar)',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    description: '3-month accelerated immersion across authentic calendar months (Jan: 31d, Feb: 28/29d, Mar: 31d).'
  },
  CUSTOM: {
    name: 'Custom Duration Sprint',
    duration: 'Custom Calendar Days',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Targeted short-course or customized syllabus engineered for any selected number of calendar days.'
  }
};

interface SessionParametersSelectorProps {
  value: SessionParametersValue;
  onChange: (val: SessionParametersValue) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export default function SessionParametersSelector({
  value,
  onChange,
  title = "Session Parameters & Course Track",
  subtitle = "Configure target foreign language, proficiency level, and calendar duration track",
  compact = false,
  collapsible = false,
  defaultExpanded = true,
  className = "",
}: SessionParametersSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const currentLang = CORE_LANGUAGES.find(
    l => l.value.toLowerCase() === (value.language || 'spanish').toLowerCase()
  ) || CORE_LANGUAGES[0];

  const handleLanguageChange = (newLangVal: string) => {
    const langObj = CORE_LANGUAGES.find(l => l.value.toLowerCase() === newLangVal.toLowerCase()) || CORE_LANGUAGES[0];
    onChange({
      ...value,
      language: langObj.value,
      level: langObj.levels[0], // Reset level to lowest for this language
    });
  };

  const handleLevelChange = (lvl: string) => {
    onChange({
      ...value,
      level: lvl,
    });
  };

  const handleTrackChange = (track: CourseTrackMode) => {
    onChange({
      ...value,
      trackMode: track,
      customDays: value.customDays || 5,
      customDaysMode: value.customDaysMode || 'TOTAL',
    });
  };

  const handleCustomDaysChange = (days: number | '') => {
    const num = days === '' ? 5 : Number(days);
    onChange({
      ...value,
      customDays: num,
    });
  };

  const handleCustomStrategyChange = (mode: 'TOTAL' | 'MONTHLY') => {
    onChange({
      ...value,
      customDaysMode: mode,
    });
  };

  const activeTrack = TRACK_CONFIGS[value.trackMode || 'STANDARD'];

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden transition-all ${className}`}>
      {/* Header Bar */}
      <div className="bg-[#0B2447] text-white p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0052CC] text-cyan-300 flex items-center justify-center shrink-0 shadow-md">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                {title}
              </h3>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-cyan-400 text-slate-950 rounded-full">
                {currentLang.flag} {currentLang.value} • {value.level || currentLang.levels[0]}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Collapsible toggle or active badge */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${activeTrack.badge}`}>
            {activeTrack.name} ({value.trackMode === 'CUSTOM' ? `${value.customDays || 5} Days` : activeTrack.duration.split('(')[0].trim()})
          </span>

          {collapsible && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
              title={isExpanded ? "Collapse panel" : "Expand panel"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      {(!collapsible || isExpanded) && (
        <div className="p-4 sm:p-6 space-y-5">
          {/* 1. Language & Level Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Language Selection - Strictly 5 Core Languages */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-[#0052CC]" /> Language (5 Core Languages)
              </label>
              <select
                value={currentLang.value}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer shadow-2xs"
              >
                {CORE_LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label} {lang.flag}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Proficiency Level */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#0052CC]" /> Target Proficiency Level
                </label>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {currentLang.framework}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {currentLang.levels.map((lvl) => {
                  const isSelected = (value.level || currentLang.levels[0]) === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleLevelChange(lvl)}
                      className={`flex-1 min-w-[50px] py-2 px-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0052CC] text-white shadow-md ring-2 ring-blue-400 font-extrabold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Course Track Mode Selection */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#0052CC]" /> Course Track / Duration
            </label>

            <div className={`grid gap-2.5 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
              {(Object.keys(TRACK_CONFIGS) as CourseTrackMode[]).map((trackKey) => {
                const cfg = TRACK_CONFIGS[trackKey];
                const isSelected = (value.trackMode || 'STANDARD') === trackKey;
                return (
                  <button
                    key={trackKey}
                    type="button"
                    onClick={() => handleTrackChange(trackKey)}
                    className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/90 border-[#0052CC] ring-2 ring-blue-500/20 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className={`text-xs font-black ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
                          {cfg.name}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0052CC] shrink-0" />}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mb-1.5 ${cfg.badge}`}>
                        {cfg.duration.split('(')[0].trim()}
                      </span>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                        {cfg.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Days Input & Mode Selection */}
            {value.trackMode === 'CUSTOM' && (
              <div className="mt-3 p-4 bg-emerald-50/80 border border-emerald-300 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-950">
                    Duration Strategy:
                  </label>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Total Classes: {value.customDays || 5} Classes
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-emerald-200">
                  <button
                    type="button"
                    onClick={() => handleCustomStrategyChange('TOTAL')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      (value.customDaysMode || 'TOTAL') === 'TOTAL'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Only {value.customDays || 5} Days Total
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomStrategyChange('MONTHLY')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      value.customDaysMode === 'MONTHLY'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {value.customDays || 5} Days / Month
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={value.customDays || 5}
                      onChange={(e) => handleCustomDaysChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      className="w-20 px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-sm font-black text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                    />
                    <span className="text-xs text-emerald-900 font-bold">
                      Days (Exact curriculum scope)
                    </span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 mr-0.5">Quick:</span>
                    {[5, 10, 15, 20, 30].map((preset) => {
                      const isPreset = (value.customDays || 5) === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleCustomDaysChange(preset)}
                          className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                            isPreset
                              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                              : 'bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          {preset}d
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
