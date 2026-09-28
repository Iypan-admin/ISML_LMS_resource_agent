"use client";

import React, { useState } from 'react';
import { useResources } from '@/context/ResourceContext';
import { useMasterData } from '@/context/MasterDataContext';
import ResourceCard from '@/components/resource/ResourceCard';
import ResourceTable from '@/components/resource/ResourceTable';
import SearchableSelect from '@/components/common/SearchableSelect';
import { EmptyState } from '@/components/common/States';
import { LayoutGrid, List, RotateCcw, Filter, Plus } from 'lucide-react';
import Link from 'next/link';

export default function ResourceLibraryPage() {
  const { filters, setFilters, resetFilters, filteredResources, resources, isLoading, error } = useResources();
  const { languages, levels, skills, resourceTypes } = useMasterData();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

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
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447]">Resource Library</h1>
          <p className="text-xs text-slate-500 font-medium">
            Central repository of validated foreign-language learning resources ({filteredResources.length} of {resources.length} showing)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-[#0052CC] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white text-[#0052CC] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/resources/add"
            className="px-3.5 py-2 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
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

      {/* Quick Category Source Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { label: '🌐 All Resources', value: 'All' },
          { label: '🏢 Internal Resources', value: 'Internal' },
          { label: '🤖 AI Generated', value: 'AI Generated' },
          { label: '⚡ External Resources', value: 'External' },
        ].map((tab) => {
          const isActive = filters.sourceType === tab.value;
          const count = resources.filter(res => {
            if (filters.search) {
              const query = filters.search.toLowerCase();
              const matchTitle = res.title.toLowerCase().includes(query);
              const matchDesc = res.description.toLowerCase().includes(query);
              const matchLang = res.academicContext.language.toLowerCase().includes(query);
              const matchTopic = res.academicContext.topic.toLowerCase().includes(query);
              if (!matchTitle && !matchDesc && !matchLang && !matchTopic) return false;
            }

            if (filters.language !== 'All' && res.academicContext.language.toLowerCase() !== filters.language.toLowerCase()) return false;

            if (filters.level !== 'All') {
              const reqLvl = filters.level.toLowerCase();
              const itemLvl = (res.academicContext.level || '').toLowerCase();
              if (itemLvl !== reqLvl && !itemLvl.includes(reqLvl) && !reqLvl.includes(itemLvl)) return false;
            }

            if (filters.skill !== 'All') {
              const reqSkl = filters.skill.toLowerCase();
              const itemSkl = (res.academicContext.skill || '').toLowerCase();
              if (itemSkl !== reqSkl && !itemSkl.includes(reqSkl) && !reqSkl.includes(itemSkl)) return false;
            }

            if (filters.resourceType !== 'All' && res.academicContext.resourceType !== filters.resourceType) return false;

            if (filters.status !== 'All') {
              const normFilter = (filters.status === 'PENDING_REVIEW' || filters.status === 'Pending Review' || filters.status === 'DRAFT' || filters.status === 'Draft') ? 'Published' : filters.status;
              const resStatus = (res.status === 'PENDING_REVIEW' || res.status === 'Pending Review' || res.status === 'DRAFT' || res.status === 'Draft') ? 'Published' : res.status;
              if (resStatus.toLowerCase() !== normFilter.toLowerCase()) return false;
            }

            if (tab.value === 'External') return res.sourceType === 'External';
            if (tab.value === 'AI Generated') return res.sourceType === 'AI Generated';
            if (tab.value === 'Internal') return res.sourceType === 'Internal' || res.sourceType === 'Uploaded';
            return true;
          }).length;

          return (
            <button
              key={tab.value}
              onClick={() => setFilters(prev => ({ ...prev, sourceType: tab.value }))}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${isActive
                  ? 'bg-[#0052CC] text-white border-[#0052CC] shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Control Bar */}
      <div className="isml-card p-4 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#0B2447] flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-[#0052CC]" /> Search & Filter Knowledge Base
          </span>

          <button
            onClick={resetFilters}
            className="text-[11px] font-bold text-slate-500 hover:text-[#0052CC] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset Filters
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <SearchableSelect
            label="Language"
            options={languageOptions}
            value={filters.language}
            onChange={val => setFilters(prev => ({ ...prev, language: val, level: 'All' }))}
          />
          <SearchableSelect
            label="CEFR Level"
            options={levelOptions}
            value={filters.level}
            onChange={val => setFilters(prev => ({ ...prev, level: val }))}
          />
          <SearchableSelect
            label="Skill"
            options={skillOptions}
            value={filters.skill}
            onChange={val => setFilters(prev => ({ ...prev, skill: val }))}
          />
          <SearchableSelect
            label="Resource Format"
            options={typeOptions}
            value={filters.resourceType}
            onChange={val => setFilters(prev => ({ ...prev, resourceType: val }))}
          />
          <SearchableSelect
            label="Status"
            options={statusOptions}
            value={filters.status}
            onChange={val => setFilters(prev => ({ ...prev, status: val }))}
          />
          <SearchableSelect
            label="Source Type"
            options={sourceOptions}
            value={filters.sourceType}
            onChange={val => setFilters(prev => ({ ...prev, sourceType: val }))}
          />
        </div>
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
