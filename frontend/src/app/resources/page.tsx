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

  const languageOptions = ['All', ...languages.map(l => l.name)];
  const levelOptions = ['All', ...levels.map(l => l.code)];
  const skillOptions = ['All', ...skills.map(s => s.name)];
  const typeOptions = ['All', ...resourceTypes.map(r => r.type)];
  const statusOptions = ['All', 'Published', 'Approved', 'Changes Required', 'Rejected', 'Archived'];
  const sourceOptions = ['All', 'Internal', 'AI Generated', 'External'];

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
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-white text-[#0052CC] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-[#0052CC] shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
          const count = tab.value === 'All' 
            ? resources.length 
            : resources.filter(r => {
                const isExt = r.sourceType === 'External' || (r.tags && (r.tags.includes('Discovered') || r.tags.includes('UserSavedExternal')));
                const isAI = r.sourceType === 'AI Generated' || (r.tags && r.tags.includes('AI Generated'));
                const isInt = r.sourceType === 'Internal' || r.sourceType === 'Uploaded' || (!isExt && !isAI);

                if (tab.value === 'External') return isExt;
                if (tab.value === 'AI Generated') return isAI;
                if (tab.value === 'Internal') return isInt;
                return r.sourceType === tab.value;
              }).length;

          return (
            <button
              key={tab.value}
              onClick={() => setFilters(prev => ({ ...prev, sourceType: tab.value }))}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                isActive
                  ? 'bg-[#0052CC] text-white border-[#0052CC] shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
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
            onChange={val => setFilters(prev => ({ ...prev, language: val }))}
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
