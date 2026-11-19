"use client";

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  CheckCircle2,
  Sparkles,
  Layers,
  Copy,
  Check,
  Globe,
  Headphones,
  Mic,
  PenTool,
  GraduationCap
} from 'lucide-react';
import { useResources } from '@/context/ResourceContext';
import { Resource } from '@/types/resource';

function GroundedMaterialsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resources, isLoading } = useResources();

  // Read URL query parameters or fallback
  const initialLang = searchParams.get('lang') || 'English';
  const initialLevel = searchParams.get('level') || 'A1.1';
  const initialTopic = searchParams.get('topic') || '';

  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLang);
  const [selectedLevel, setSelectedLevel] = useState<string>(initialLevel);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Available Languages and Levels for switcher
  const availableLanguages = ['English', 'German', 'French', 'Spanish', 'Japanese', 'Korean', 'Tamil', 'Hindi'];
  const availableLevels = ['A1.1', 'A1.2', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2', 'A1', 'A2', 'B1', 'B2', 'L1', 'L2', 'L3', 'L4', 'N5', 'N4', 'N3', 'N2'];

  // Grounded Resources Filter
  const matchingResources = useMemo(() => {
    if (!selectedLanguage) return [];
    const targetLang = selectedLanguage.toLowerCase().trim();
    const rawLvl = (selectedLevel || '').toLowerCase().trim();
    const baseLvl = rawLvl.includes('.') ? rawLvl.split('.')[0] : rawLvl;

    return (resources || []).filter((r) => {
      // 1. Language Check
      const rLang = (r.academicContext?.language || (r as any).language || '').toLowerCase().trim();
      const rTitle = (r.title || '').toLowerCase();
      const rTags = Array.isArray(r.tags) ? r.tags.map((t: any) => String(t).toLowerCase()) : [];

      const langMatches =
        rLang.includes(targetLang) ||
        targetLang.includes(rLang) ||
        rTitle.includes(targetLang) ||
        rTags.some((t: string) => t.includes(targetLang));

      if (!langMatches) return false;

      // 2. Level Check
      if (!rawLvl || rawLvl === 'all' || rawLvl === 'custom') return true;

      const rLevel = (
        r.academicContext?.level ||
        r.cefrLevel ||
        (r as any).level ||
        r.analysis?.detectedCEFR ||
        ''
      ).toLowerCase().trim();

      if (rLevel === rawLvl) return true;

      const rBaseLvl = rLevel.includes('.') ? rLevel.split('.')[0] : rLevel;
      if (baseLvl && (rBaseLvl === baseLvl || rLevel === baseLvl)) return true;

      if (rTags.some((t: string) => t === rawLvl || t === baseLvl)) return true;
      if (rTitle.split(/[^a-z0-9.]+/).some((word: string) => word === rawLvl || word === baseLvl)) return true;

      if (
        rLevel.includes('all') ||
        rLevel.includes('general') ||
        rLevel.includes('foundation') ||
        rLevel.includes('comprehensive')
      ) {
        return true;
      }

      return false;
    });
  }, [resources, selectedLanguage, selectedLevel]);

  // Secondary Filter by search query, skill, and resource type
  const displayedResources = useMemo(() => {
    return matchingResources.filter((r) => {
      // Skill filter
      if (selectedSkillFilter !== 'ALL') {
        const skill = (r.academicContext?.skill || '').toLowerCase();
        if (!skill.includes(selectedSkillFilter.toLowerCase())) return false;
      }

      // Type filter
      if (selectedTypeFilter !== 'ALL') {
        const srcType = (r.sourceType || '').toUpperCase();
        const resType = (r.academicContext?.resourceType || '').toUpperCase();
        if (selectedTypeFilter === 'UPLOADED' && srcType !== 'UPLOADED') return false;
        if (selectedTypeFilter === 'EXTERNAL' && srcType !== 'EXTERNAL') return false;
        if (selectedTypeFilter === 'WORKSHEET' && !resType.includes('WORKSHEET')) return false;
        if (selectedTypeFilter === 'VIDEO' && !resType.includes('VIDEO') && !r.originalUrl?.includes('youtube')) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = r.title.toLowerCase().includes(q);
        const inDesc = (r.description || '').toLowerCase();
        const inBody = (typeof r.content === 'string' ? r.content : (r.content?.body || '')).toLowerCase();
        const inTags = Array.isArray(r.tags) && r.tags.some((t: any) => String(t).toLowerCase().includes(q));
        if (!inTitle && !inDesc.includes(q) && !inBody.includes(q) && !inTags) return false;
      }

      return true;
    });
  }, [matchingResources, selectedSkillFilter, selectedTypeFilter, searchQuery]);

  // Handle Copy Material Content to Clipboard
  const handleCopyContent = (item: Resource) => {
    const textToCopy = `[${item.title}]\nLevel: ${item.academicContext?.level || item.cefrLevel}\nDescription: ${item.description}\n\nContent:\n${item.content?.body || item.content?.overview || ''}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* ─────────────────────────────────────────────────────────────
          TOP NAVBAR & BREADCRUMBS
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-slate-300" />
              <span>Back to Studio Planner</span>
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <Link href="/faculty/studio" className="hover:text-white transition-colors">
                Studio
              </Link>
              <span>/</span>
              <span className="text-slate-200 font-semibold">Knowledge Vault Grounding</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/vault"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Open Full Vault</span>
              <ExternalLink className="w-3 h-3 text-blue-400" />
            </Link>

            <button
              type="button"
              onClick={() => router.push('/faculty/studio')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <span>Return to Timetable</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          HERO BANNER & CONTEXT BADGES
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-4 sm:space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
                <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg font-black tracking-wide text-[11px] sm:text-xs">
                  {selectedLanguage} • Level {selectedLevel}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg font-bold flex items-center gap-1 text-[11px] sm:text-xs">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                  <span>{matchingResources.length} Verified Sources Grounded</span>
                </span>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg font-bold flex items-center gap-1 text-[11px] sm:text-xs">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" />
                  <span>100% Zero-Hallucination Anchor</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                Knowledge Vault Grounded Materials
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                These authentic syllabus documents, phonetics breakdowns, and dialogues serve as the immutable ground-truth anchor for your lesson timetable, vocabulary drills, and assessments.
              </p>
            </div>

            {/* Quick Context Switchers */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-3 shrink-0 lg:w-80 shadow-md">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Switch Language & Level Scope
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {availableLanguages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Target Level</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {availableLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SEARCH, FILTER BAR & STATS
      ───────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search among ${matchingResources.length} ${selectedLanguage} ${selectedLevel} materials...`}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Total Display Counter */}
            <div className="text-xs font-bold text-slate-500 whitespace-nowrap self-end md:self-center">
              Showing <span className="text-blue-700 font-black">{displayedResources.length}</span> of {matchingResources.length} verified materials
            </div>
          </div>

          {/* Skill & Format Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {/* Skill Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Skill:</span>
              {['ALL', 'Speaking', 'Listening', 'Reading', 'Writing', 'Grammar', 'Vocabulary'].map((sk) => (
                <button
                  key={sk}
                  type="button"
                  onClick={() => setSelectedSkillFilter(sk)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedSkillFilter === sk
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {sk === 'ALL' ? 'All Skills' : sk}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Format:</span>
              {['ALL', 'UPLOADED', 'EXTERNAL', 'WORKSHEET', 'VIDEO'].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setSelectedTypeFilter(tf)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedTypeFilter === tf
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {tf === 'ALL' ? 'All Formats' : tf === 'UPLOADED' ? 'Uploaded' : tf === 'EXTERNAL' ? 'External OER' : tf === 'WORKSHEET' ? 'Worksheets' : 'Videos'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MATERIALS CARDS LIST (RESPONSIVE)
        ───────────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">Retrieving Grounded Vault Assets...</p>
          </div>
        ) : displayedResources.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-black text-slate-900">No Matching Materials Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No syllabus documents matching your search or filters exist in the Knowledge Vault for {selectedLanguage} ({selectedLevel}).
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSkillFilter('ALL');
                  setSelectedTypeFilter('ALL');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
              <Link
                href="/vault"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                Upload to Knowledge Vault ↗
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {displayedResources.map((res: Resource, idx: number) => {
              const isExpanded = expandedCardId === res.id;
              const levelLabel = res.academicContext?.level || res.cefrLevel || selectedLevel;
              const skillLabel = res.academicContext?.skill || 'General';
              const formatLabel = res.academicContext?.resourceType || res.sourceType || 'Document';
              const wordCount = res.wordCount ? `${res.wordCount.toLocaleString()} words` : null;
              const pageCount = res.pageCount ? `${res.pageCount} pages` : null;
              const rawBody = typeof res.content === 'string'
                ? res.content
                : (res.content?.body || res.content?.overview || '');
              const dialogueScript = res.content?.dialogueScript || [];
              const questions = res.content?.questions || [];
              const vocabularyList = res.content?.vocabularyList || [];
              const grammarNotes = res.content?.grammarNotes;

              return (
                <article
                  key={res.id || idx}
                  className="bg-white border-2 border-slate-200/90 hover:border-blue-400 rounded-2xl p-5 sm:p-6 transition-all shadow-xs space-y-4"
                >
                  {/* Card Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="space-y-1.5 min-w-0">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                          {selectedLanguage} • {levelLabel}
                        </span>

                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                          {res.academicContext?.resourceType === 'Video' || res.originalUrl?.includes('youtube') ? (
                            <Video className="w-3 h-3 text-rose-500" />
                          ) : (
                            <FileText className="w-3 h-3 text-blue-600" />
                          )}
                          <span>{formatLabel}</span>
                        </span>

                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {skillLabel}
                        </span>

                        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                          {res.sourceType || 'Uploaded'}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                        {res.title}
                      </h2>
                    </div>

                    {/* Source Organization & ID */}
                    <div className="sm:text-right shrink-0">
                      <span className="text-xs font-bold text-slate-800 block">
                        {res.sourceName || 'Academic Publisher'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {res.id}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {res.description && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {res.description}
                    </p>
                  )}

                  {/* Metadata Chips Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                    {wordCount && (
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-semibold text-slate-700">
                        Volume: {wordCount}
                      </span>
                    )}
                    {pageCount && (
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-semibold text-slate-700">
                        Scope: {pageCount}
                      </span>
                    )}
                    {res.academicContext?.difficulty && (
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-semibold text-slate-700">
                        Band: {res.academicContext.difficulty}
                      </span>
                    )}
                    {res.copyright?.license && (
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-semibold text-slate-700 truncate max-w-xs">
                        License: {res.copyright.license}
                      </span>
                    )}
                  </div>

                  {/* Tags Array */}
                  {Array.isArray(res.tags) && res.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {res.tags.map((tag: any, tIdx: number) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-semibold bg-blue-50/70 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md"
                        >
                          #{String(tag)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────
                      CARD ACTION BUTTONS (VIEW CONTENT / EXPAND READER)
                  ───────────────────────────────────────────────────────── */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedCardId(isExpanded ? null : res.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 ${
                          isExpanded
                            ? 'bg-blue-600 text-white shadow-blue-500/20'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Hide Material Content' : 'View & Preview Material'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 ml-1" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 ml-1" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyContent(res)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95"
                        title="Copy syllabus content to clipboard"
                      >
                        {copiedId === res.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <Link
                        href={`/vault/${res.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        <span>Inspect in Vault</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      {res.sourceUrl && (
                        <a
                          href={res.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                        >
                          <span>Publisher Link ↗</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────
                      EXPANDED FULL CONTENT VIEWER & INSPECTOR
                  ───────────────────────────────────────────────────────── */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t-2 border-blue-100 bg-slate-50/80 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-5 sm:p-6 rounded-b-2xl space-y-6 animate-in fade-in duration-200">
                      {/* 1. Core Syllabus Body */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            1. Ground-Truth Curriculum Text & Syllabus Directives
                          </h3>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans shadow-2xs whitespace-pre-line">
                          {rawBody || 'Full curriculum text verified and indexed for neural RAG extraction.'}
                        </div>
                      </div>

                      {/* 2. Interactive Dialogue Script */}
                      {dialogueScript.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Headphones className="w-4 h-4 text-emerald-600" />
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                              2. Audio Immersion Script & Conversational Dialogue
                            </h3>
                          </div>
                          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
                            {dialogueScript.map((turn: any, dIdx: number) => (
                              <div
                                key={dIdx}
                                className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                              >
                                <span className="font-bold text-blue-700 shrink-0 w-24">
                                  {turn.speaker}:
                                </span>
                                <div className="space-y-1">
                                  <p className="font-semibold text-slate-900">{turn.text}</p>
                                  {turn.translation && (
                                    <p className="text-[11px] text-slate-500 italic">
                                      {turn.translation}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. Vocabulary List */}
                      {vocabularyList.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-purple-600" />
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                              3. Target Key Vocabulary & Phrasal Structures
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {vocabularyList.map((v: any, vIdx: number) => (
                              <div
                                key={vIdx}
                                className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-xs text-blue-900">{v.word}</span>
                                  {v.partOfSpeech && (
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                      {v.partOfSpeech}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-600">{v.translation}</p>
                                {v.example && (
                                  <p className="text-[10px] text-slate-400 italic">
                                    Example: &quot;{v.example}&quot;
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. Comprehension Questions & Drills */}
                      {questions.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <PenTool className="w-4 h-4 text-amber-600" />
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                              4. Verified Practice Drills & Comprehension Questions ({questions.length} Questions)
                            </h3>
                          </div>
                          <div className="space-y-2.5">
                            {questions.map((q: any, qIdx: number) => (
                              <div
                                key={q.id || qIdx}
                                className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs text-xs"
                              >
                                <p className="font-bold text-slate-900">
                                  Q{qIdx + 1}: {q.question}
                                </p>
                                {Array.isArray(q.options) && q.options.length > 0 && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2">
                                    {q.options.map((opt: string, oIdx: number) => {
                                      const isCorrect = opt === q.answer;
                                      return (
                                        <div
                                          key={oIdx}
                                          className={`p-2 rounded-lg border text-xs font-semibold ${
                                            isCorrect
                                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                              : 'bg-slate-50 border-slate-200 text-slate-600'
                                          }`}
                                        >
                                          <span className="font-mono font-bold mr-1.5">
                                            {String.fromCharCode(65 + oIdx)}.
                                          </span>
                                          {opt}
                                          {isCorrect && (
                                            <span className="ml-1.5 text-[10px] font-bold text-emerald-600">
                                              (Correct Answer)
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                {q.explanation && (
                                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <strong>Pedagogical Explanation:</strong> {q.explanation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 5. Grammar Notes */}
                      {grammarNotes && (
                        <div className="space-y-1.5">
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            5. Syntactic Grammar Rules & Error Prevention
                          </h3>
                          <div className="bg-white border border-slate-200 p-3.5 rounded-xl text-xs text-slate-700 leading-relaxed shadow-2xs">
                            {typeof grammarNotes === 'string'
                              ? grammarNotes
                              : Array.isArray(grammarNotes)
                              ? grammarNotes.join('\n')
                              : JSON.stringify(grammarNotes)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            BOTTOM CALL-TO-ACTION BAR
        ───────────────────────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Ready to structure your lesson timetable?
            </h3>
            <p className="text-xs text-slate-400">
              All {matchingResources.length} verified materials are actively connected to the Autonomous Lesson Planner Agent.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => router.push('/faculty/studio')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-600/30 cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <span>Back to Studio Timetable</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GroundedMaterialsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-300">Loading Grounded Materials...</p>
          </div>
        </div>
      }
    >
      <GroundedMaterialsContent />
    </Suspense>
  );
}

