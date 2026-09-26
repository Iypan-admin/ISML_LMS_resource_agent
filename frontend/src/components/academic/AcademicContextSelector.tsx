"use client";

import React, { useMemo, useEffect, useState } from 'react';
import SearchableSelect from '../common/SearchableSelect';
import { AcademicContext } from '@/types/academic';
import { useMasterData } from '@/context/MasterDataContext';
import { GraduationCap, CheckCircle2, AlertCircle, Edit3, ChevronDown, ChevronUp, Sparkles, SlidersHorizontal, Loader2 } from 'lucide-react';

interface AcademicContextSelectorProps {
  value: AcademicContext;
  onChange: (val: AcademicContext) => void;
  onValidationChange?: (isValid: boolean) => void;
  onDiscover?: () => void;
  isDiscovering?: boolean;
  className?: string;
}

export default function AcademicContextSelector({
  value,
  onChange,
  onValidationChange,
  onDiscover,
  isDiscovering = false,
  className = ''
}: AcademicContextSelectorProps) {
  const { languages, courses, levels, skills, topics, resourceTypes, isLoading, error } = useMasterData();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isCustomTopicActive, setIsCustomTopicActive] = useState(
    value.topic === 'Other / Custom Topic...' || (!!value.customTopic && value.customTopic === value.topic)
  );
  const [isCustomSkillActive, setIsCustomSkillActive] = useState(
    (value.skill as string) === 'Other / Custom Skill...' || (!!value.customSkill && value.customSkill === value.skill)
  );
  const [isCustomFormatActive, setIsCustomFormatActive] = useState(
    (value.resourceType as string) === 'Other / Custom Format...' || (!!value.customResourceType && value.customResourceType === value.resourceType)
  );

  // Default auto-fills for optional fields if unset
  useEffect(() => {
    let changed = false;
    const updated = { ...value };

    if (!updated.course) {
      updated.course = `${value.language || 'General'} Program`;
      changed = true;
    }
    if (!updated.module) {
      updated.module = 'Module 1: Core Fundamentals';
      changed = true;
    }
    if (!updated.difficulty) {
      updated.difficulty = 'Beginner';
      changed = true;
    }
    if (!updated.contentLength) {
      updated.contentLength = 'Short (1-5 mins)';
      changed = true;
    }

    if (changed) {
      onChange(updated);
    }
  }, [value.language]);

  // Languages options
  const languageOptions = useMemo(() => {
    if (languages.length > 0) {
      return languages.map(l => ({
        value: l.name,
        label: `${l.name} (${l.nativeName || l.code.toUpperCase()})`,
        icon: l.flagEmoji || '🌐',
        sublabel: `Code: ${l.code}`,
      }));
    }
    return [
      { value: 'German', label: 'German (Deutsch)', icon: '🇩🇪' },
      { value: 'French', label: 'French (Français)', icon: '🇫🇷' },
      { value: 'Japanese', label: 'Japanese (日本語)', icon: '🇯🇵' },
      { value: 'Spanish', label: 'Spanish (Español)', icon: '🇪🇸' },
      { value: 'English', label: 'English (English)', icon: '🇬🇧' },
    ];
  }, [languages]);

  // Level options
  const isJapanese = value.language?.toLowerCase() === 'japanese';

  const levelOptions = useMemo(() => {
    if (isJapanese) {
      return [
        { value: 'N5', label: 'JLPT N5 (Beginner)' },
        { value: 'N4', label: 'JLPT N4 (Basic)' },
        { value: 'N3', label: 'JLPT N3 (Intermediate)' },
        { value: 'N2', label: 'JLPT N2 (Pre-Advanced)' },
        { value: 'N1', label: 'JLPT N1 (Advanced)' },
      ];
    }
    return [
      { value: 'A1', label: 'CEFR A1 (Beginner)' },
      { value: 'A2', label: 'CEFR A2 (Elementary)' },
      { value: 'B1', label: 'CEFR B1 (Intermediate)' },
      { value: 'B2', label: 'CEFR B2 (Upper Intermediate)' },
      { value: 'C1', label: 'CEFR C1 (Advanced)' },
      { value: 'C2', label: 'CEFR C2 (Mastery)' },
    ];
  }, [isJapanese]);

  // Topics options with "Other / Custom Topic..."
  const availableTopics = useMemo(() => {
    let baseList: string[] = [];
    if (topics.length > 0) {
      baseList = topics.map(t => t.name);
    } else if (isJapanese) {
      baseList = [
        'Greetings & Ojigi (Greetings)',
        'Hiragana & Katakana Syllabary',
        'Basic Particles (は, が, を, に, で)',
        'Kanji Stroke Order & Radicals',
        'Desu / Masu Polite Form',
        'Listening & Audio Comprehension',
      ];
    } else {
      baseList = [
        'Greetings & Farewells',
        'Nouns & Gender Rules',
        'Sentence Structure & Particles',
        'Listening & Audio Comprehension',
        'Reading Comprehension & Passages',
        'Vocabulary & Expression Building',
      ];
    }
    return [...baseList, 'Other / Custom Topic...'];
  }, [topics, isJapanese]);

  // Skills options with "Other / Custom Skill..."
  const skillOptions = useMemo(() => {
    let baseList: string[] = [];
    if (skills.length > 0) {
      baseList = skills.map(s => s.name);
    } else {
      baseList = ['Speaking', 'Listening', 'Reading', 'Writing', 'Grammar', 'Vocabulary'];
    }
    return [...baseList, 'Other / Custom Skill...'];
  }, [skills]);

  // Resource types options (Clean 4 Core Options + Write-in Custom Format)
  const resourceTypeOptions = useMemo(() => {
    return [
      { value: 'Web Portal / Page', label: 'Web Portal / Page' },
      { value: 'Video Lesson', label: 'Video Lesson' },
      { value: 'PDF / Document', label: 'PDF / Document' },
      { value: 'Interactive Exercise / Quiz', label: 'Interactive Exercise / Quiz' },
      { value: 'Other / Custom Format...', label: 'Other / Custom Format...' },
    ];
  }, []);

  // Core 5 Required Fields Validation
  const coreFields = [
    { key: 'language', label: 'Target Language' },
    { key: 'level', label: isJapanese ? 'JLPT Level' : 'CEFR Level' },
    { key: 'topic', label: 'Specific Topic' },
    { key: 'skill', label: 'Primary Skill' },
    { key: 'resourceType', label: 'Resource Format' },
  ];

  const missingCore = coreFields.filter(f => {
    const val = value[f.key as keyof AcademicContext];
    if (!val || val.trim() === '' || val === 'Select option...') return true;
    if (f.key === 'topic' && (val === 'Other / Custom Topic...' || isCustomTopicActive)) {
      return !value.customTopic || value.customTopic.trim() === '';
    }
    if (f.key === 'skill' && (val === 'Other / Custom Skill...' || isCustomSkillActive)) {
      return !value.customSkill || value.customSkill.trim() === '';
    }
    if (f.key === 'resourceType' && (val === 'Other / Custom Format...' || isCustomFormatActive)) {
      return !value.customResourceType || value.customResourceType.trim() === '';
    }
    return false;
  });

  const isValid = missingCore.length === 0;

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  const handleFieldChange = (field: keyof AcademicContext, val: any) => {
    const updated = { ...value, [field]: val };
    
    if (field === 'language') {
      updated.level = '';
      updated.topic = '';
      updated.skill = '';
      updated.resourceType = '';
      updated.course = val ? `${val} General Program` : '';
    } else if (field === 'level') {
      updated.topic = '';
      updated.skill = '';
      updated.resourceType = '';
    } else if (field === 'topic') {
      updated.skill = '';
      updated.resourceType = '';
      if (val === 'Other / Custom Topic...') {
        setIsCustomTopicActive(true);
        if (updated.customTopic) updated.topic = updated.customTopic;
      } else {
        setIsCustomTopicActive(false);
        updated.customTopic = undefined;
      }
    } else if (field === 'skill') {
      updated.resourceType = '';
      if (val === 'Other / Custom Skill...') {
        setIsCustomSkillActive(true);
        if (updated.customSkill) updated.skill = updated.customSkill as any;
      } else {
        setIsCustomSkillActive(false);
        updated.customSkill = undefined;
      }
    } else if (field === 'resourceType') {
      if (val === 'Other / Custom Format...') {
        setIsCustomFormatActive(true);
        if (updated.customResourceType) updated.resourceType = updated.customResourceType as any;
      } else {
        setIsCustomFormatActive(false);
        updated.customResourceType = undefined;
      }
    }

    onChange(updated);
  };

  const handleCustomTopicChange = (customText: string) => {
    onChange({
      ...value,
      customTopic: customText,
      topic: customText.trim() ? customText : 'Other / Custom Topic...'
    });
  };

  const handleCustomSkillChange = (customText: string) => {
    onChange({
      ...value,
      customSkill: customText,
      skill: (customText.trim() ? customText : 'Other / Custom Skill...') as any
    });
  };

  const handleCustomFormatChange = (customText: string) => {
    onChange({
      ...value,
      customResourceType: customText,
      resourceType: (customText.trim() ? customText : 'Other / Custom Format...') as any
    });
  };

  return (
    <div className={`isml-card p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 font-sans ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-[#0052CC]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#0B2447]">Academic Context Selector</h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Select 5 primary learning criteria to discover aligned AI resources
            </p>
          </div>
        </div>

        {/* Validation Status Indicator */}
        {isValid ? (
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Ready for AI Discovery
          </span>
        ) : (
          <span className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-extrabold flex items-center gap-1.5 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Missing: {missingCore.map(m => m.label).join(', ')}
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Primary 5 Core Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. Language */}
        <SearchableSelect
          label="1. Target Language *"
          options={languageOptions}
          value={value.language}
          placeholder="Select Target Language..."
          onChange={val => handleFieldChange('language', val)}
        />

        {/* 2. Level */}
        <SearchableSelect
          label={isJapanese ? "2. JLPT Level *" : "2. CEFR Level *"}
          options={levelOptions}
          value={value.level}
          placeholder={!value.language ? "Select Language First..." : "Select Level..."}
          disabled={!value.language}
          onChange={val => handleFieldChange('level', val)}
        />

        {/* 3. Specific Topic */}
        <div className="space-y-1">
          <SearchableSelect
            label="3. Specific Topic *"
            options={availableTopics}
            value={isCustomTopicActive ? 'Other / Custom Topic...' : value.topic}
            placeholder={!value.level ? "Select Level First..." : "Select Specific Topic..."}
            disabled={!value.level}
            onChange={val => handleFieldChange('topic', val)}
          />

          {/* Custom Topic Write-In Input Box */}
          {isCustomTopicActive && (
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="text-[11px] font-extrabold text-[#0052CC] flex items-center gap-1">
                <Edit3 className="w-3 h-3 text-[#0052CC]" /> Type Custom Topic / Search Keywords:
              </label>
              <input
                type="text"
                value={value.customTopic || ''}
                onChange={e => handleCustomTopicChange(e.target.value)}
                placeholder="e.g. Asking for directions, Past tense grammar, Kanji radicals..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#0052CC] outline-none shadow-2xs"
              />
            </div>
          )}
        </div>

        {/* 4. Target Skill */}
        <div className="space-y-1">
          <SearchableSelect
            label="4. Primary Skill *"
            options={skillOptions}
            value={isCustomSkillActive ? 'Other / Custom Skill...' : value.skill}
            placeholder={!value.topic ? "Select Topic First..." : "Select Primary Skill..."}
            disabled={!value.topic}
            onChange={val => handleFieldChange('skill', val)}
          />

          {/* Custom Skill Write-In Input Box */}
          {isCustomSkillActive && (
            <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="text-[11px] font-extrabold text-purple-900 flex items-center gap-1">
                <Edit3 className="w-3 h-3 text-purple-700" /> Type Custom Skill / Focus Area:
              </label>
              <input
                type="text"
                value={value.customSkill || ''}
                onChange={e => handleCustomSkillChange(e.target.value)}
                placeholder="e.g. Phonetics, Slang & Idioms, Accent Training, Dictation..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-600 outline-none shadow-2xs"
              />
            </div>
          )}
        </div>

        {/* 5. Resource Format */}
        <div className="space-y-1">
          <SearchableSelect
            label="5. Resource Format *"
            options={resourceTypeOptions}
            value={isCustomFormatActive ? 'Other / Custom Format...' : value.resourceType}
            placeholder={!value.skill ? "Select Skill First..." : "Select Resource Format..."}
            disabled={!value.skill}
            onChange={val => handleFieldChange('resourceType', val)}
          />

          {/* Custom Format Write-In Input Box */}
          {isCustomFormatActive && (
            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="text-[11px] font-extrabold text-amber-900 flex items-center gap-1">
                <Edit3 className="w-3 h-3 text-amber-700" /> Type Custom Resource Format:
              </label>
              <input
                type="text"
                value={value.customResourceType || ''}
                onChange={e => handleCustomFormatChange(e.target.value)}
                placeholder="e.g. Mindmap, Flashcards, Interactive Quiz, Infographic..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-600 outline-none shadow-2xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Optional Advanced Details Accordion */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-bold text-slate-600 hover:text-[#0052CC] flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Advanced Curriculum Tagging (Course, Module, Difficulty - Optional)</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
        </button>

        {showAdvanced && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in duration-200">
            <SearchableSelect
              label="Academic Course"
              options={[
                { value: `${value.language} General Program`, label: `${value.language} General Program` },
                { value: `${value.language} Intensive Academic`, label: `${value.language} Intensive Academic` },
                { value: `${value.language} Professional`, label: `${value.language} Professional` },
              ]}
              value={value.course || `${value.language} General Program`}
              onChange={val => handleFieldChange('course', val)}
            />

            <SearchableSelect
              label="Module / Unit"
              options={[
                { value: 'Module 1: Greetings & Introductions', label: 'Module 1: Greetings & Introductions' },
                { value: 'Module 2: Grammar & Sentences', label: 'Module 2: Grammar & Sentences' },
                { value: 'Module 3: Everyday Situations', label: 'Module 3: Everyday Situations' },
              ]}
              value={value.module || 'Module 1: Greetings & Introductions'}
              onChange={val => handleFieldChange('module', val)}
            />

            <SearchableSelect
              label="Target Difficulty"
              options={['Beginner', 'Intermediate', 'Advanced']}
              value={value.difficulty || 'Beginner'}
              onChange={val => handleFieldChange('difficulty', val)}
            />

            <SearchableSelect
              label="Target Duration"
              options={['Short (1-5 mins)', 'Medium (5-15 mins)', 'Comprehensive (15-30 mins)']}
              value={value.contentLength || 'Short (1-5 mins)'}
              onChange={val => handleFieldChange('contentLength', val)}
            />
          </div>
        )}
      </div>

      {/* Dynamic Summary & Primary Action Bar */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#0052CC]" /> Target Focus:
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0052CC] font-bold text-[11px]">{value.language || '?'}</span>
          <span className="text-slate-400">›</span>
          <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 font-bold text-[11px]">{value.level || '?'}</span>
          <span className="text-slate-400">›</span>
          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[11px]">
            {value.customSkill || value.skill || '?'}
          </span>
          <span className="text-slate-400">›</span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[11px] truncate max-w-[180px]">
            {value.customTopic || value.topic || '?'}
          </span>
          <span className="text-slate-400">›</span>
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[11px]">
            {value.customResourceType || value.resourceType || '?'}
          </span>
        </div>

        {onDiscover && (
          <button
            type="button"
            onClick={onDiscover}
            disabled={!isValid || isDiscovering}
            className="w-full sm:w-auto min-h-[44px] px-7 rounded-xl bg-[#0052CC] hover:bg-blue-700 active:scale-95 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isDiscovering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Discovering...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Discover Resources
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

