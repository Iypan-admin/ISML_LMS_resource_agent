"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Video,
  Globe,
  FileText,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  RotateCw,
  Clock,
  Layers,
  ChevronRight,
  GraduationCap,
  AlertCircle
} from 'lucide-react';
import { useResources } from '@/context/ResourceContext';

export default function VaultDocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { resources, getResourceById } = useResources();

  const [resource, setResource] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    // 1. Instant 0ms memory check from ResourceContext
    const contextItem = getResourceById ? getResourceById(id) : resources.find(r => r.id === id);
    if (contextItem) {
      setResource(contextItem);
      setIsLoading(false);
      return;
    }

    // 2. Check localStorage & sessionStorage caches
    if (typeof window !== 'undefined') {
      try {
        const rawCached = sessionStorage.getItem('isml_cached_backend_resources');
        if (rawCached) {
          const items = JSON.parse(rawCached);
          const found = items.find((x: any) => x.id === id);
          if (found) {
            setResource(found);
            setIsLoading(false);
            return;
          }
        }

        const rawSaved = localStorage.getItem('isml_saved_external_resources');
        if (rawSaved) {
          const items = JSON.parse(rawSaved);
          const found = items.find((x: any) => x.id === id);
          if (found) {
            setResource(found);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Cache lookup notice:', e);
      }
    }

    // 3. Network Fetch: Query valid API endpoints directly (never relative HTML paths)
    const fetchDoc = async () => {
      setIsLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const endpoints = [
        `${apiUrl}/resources/${id}`,
        `http://localhost:4000/api/v1/resources/${id}`,
        `https://isml-resource-backend-production.up.railway.app/api/v1/resources/${id}`
      ];

      let fetchedData: any = null;
      let lastErrMsg = '';

      for (const url of endpoints) {
        try {
          const resp = await fetch(url);
          const contentType = resp.headers.get('content-type') || '';
          
          // Guard: If response is an HTML page (like Next.js 404 or page shell), do NOT parse as JSON
          if (!contentType.includes('application/json')) {
            lastErrMsg = `Endpoint returned non-JSON response (${contentType})`;
            continue;
          }

          if (resp.ok) {
            const json = await resp.json();
            if (json && (json.data || json.id)) {
              fetchedData = json.data || json;
              break;
            }
          } else {
            lastErrMsg = `Server returned HTTP ${resp.status}`;
          }
        } catch (netErr: any) {
          lastErrMsg = netErr.message || 'Network error';
        }
      }

      if (isMounted) {
        if (fetchedData) {
          setResource(fetchedData);
        } else {
          setError(lastErrMsg || 'Document not found in Knowledge Vault.');
        }
        setIsLoading(false);
      }
    };

    fetchDoc();
    return () => { isMounted = false; };
  }, [id, resources, getResourceById]);

  const formatLevelBadge = (item: any) => {
    if (!item) return { framework: 'CEFR', level: 'A1' };
    const lang = item.academicContext?.language || item.language?.name || 'General';
    const rawLvl = item.academicContext?.level || item.cefrLevel || 'A1';
    if (lang === 'Korean') {
      if (item.title?.includes('L1') || rawLvl === 'A1' || rawLvl === 'L1') return { framework: 'Korean Standard', level: 'Level L1' };
      if (item.title?.includes('L2') || rawLvl === 'A2' || rawLvl === 'L2') return { framework: 'Korean Standard', level: 'Level L2' };
      if (item.title?.includes('L3') || rawLvl === 'B1' || rawLvl === 'L3') return { framework: 'Korean Standard', level: 'Level L3' };
      if (item.title?.includes('L4') || rawLvl === 'B2' || rawLvl === 'L4') return { framework: 'Korean Standard', level: 'Level L4' };
      return { framework: 'Korean Standard', level: 'Level L1' };
    }
    if (lang === 'Japanese') {
      if (item.title?.includes('N5') || rawLvl === 'A1' || rawLvl === 'N5') return { framework: 'JLPT', level: 'JLPT N5' };
      if (item.title?.includes('N4') || rawLvl === 'A2' || rawLvl === 'N4') return { framework: 'JLPT', level: 'JLPT N4' };
      if (item.title?.includes('N3') || rawLvl === 'B1' || rawLvl === 'N3') return { framework: 'JLPT', level: 'JLPT N3' };
      if (item.title?.includes('N2') || rawLvl === 'B2' || rawLvl === 'N2') return { framework: 'JLPT', level: 'JLPT N2' };
      if (item.title?.includes('N1') || rawLvl === 'C1' || rawLvl === 'C2' || rawLvl === 'N1') return { framework: 'JLPT', level: 'JLPT N1' };
      return { framework: 'JLPT', level: 'JLPT N5' };
    }
    return { framework: item.framework || 'CEFR', level: rawLvl };
  };

  const handleCopyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 font-sans">
        <RotateCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading document from Knowledge Vault...</p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center font-sans space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
          <BookOpen className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-900">Document Currently Unavailable</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {error ? error : 'This study material could not be loaded from the Knowledge Vault library.'}
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/vault"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2447] text-white text-xs font-bold hover:bg-black transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Knowledge Vault</span>
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
          >
            <RotateCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const badge = formatLevelBadge(resource);
  const lang = resource.academicContext?.language || resource.language?.name || 'General';
  const latestAnalysis = resource.aiAnalyses?.[0] || resource.analysis;
  const payload = latestAnalysis?.rawOutputPayload || {};
  const extractedText = payload.text || resource.content?.body || resource.description || 'No extended lesson text recorded.';
  const keyVocab: string[] = latestAnalysis?.keyVocabulary || payload.key_vocabulary || [];
  const primarySkills: string[] = payload.primary_skills || (resource.academicContext?.skill ? [resource.academicContext.skill] : ['Reading', 'Vocabulary']);
  const wordCount = resource.wordCount || (extractedText ? extractedText.split(/\s+/).filter(Boolean).length : 0);
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  const isYouTube = resource.resourceType === 'YOUTUBE_VIDEO' || (resource.originalUrl && (resource.originalUrl.includes('youtube.com') || resource.originalUrl.includes('youtu.be')));
  const isWeb = resource.resourceType === 'WEBSITE' || (resource.originalUrl && !resource.fileStorage);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 font-sans space-y-6 pb-24">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <Link
          href="/vault"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Knowledge Vault</span>
        </Link>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 overflow-x-auto">
          <span>Learning Library</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <Link href="/vault" className="hover:text-slate-600">Knowledge Vault</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-700 truncate max-w-[220px]">{resource.title}</span>
        </div>
      </div>

      {/* Main Document Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="space-y-3">
          {/* Metadata Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-lg bg-[#0B2447] text-white text-[11px] font-black uppercase tracking-wider">
              {lang}
            </span>

            <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-black border border-blue-200">
              {badge.framework} {badge.level}
            </span>

            {isYouTube ? (
              <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 text-[11px] font-black flex items-center gap-1.5 border border-rose-200">
                <Video className="w-3.5 h-3.5 text-rose-600" /> YouTube Video Lesson
              </span>
            ) : isWeb ? (
              <span className="px-3 py-1 rounded-lg bg-sky-50 text-sky-700 text-[11px] font-black flex items-center gap-1.5 border border-sky-200">
                <Globe className="w-3.5 h-3.5 text-sky-600" /> Web Article
              </span>
            ) : (
              <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-black flex items-center gap-1.5 border border-slate-200">
                <FileText className="w-3.5 h-3.5 text-slate-500" /> Document Asset
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            {resource.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            {resource.description || latestAnalysis?.aiSummary || 'Verified curriculum resource available for language studio planning.'}
          </p>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Words: <strong className="text-slate-800">{wordCount}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Estimated Study Time: <strong className="text-slate-800">~{readingTime} mins</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Pages: <strong className="text-slate-800">{resource.pageCount || 1}</strong></span>
          </div>

          <span className="font-mono text-[10px] text-slate-400 ml-auto">
            ID: {resource.id?.slice(0, 12)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {resource.originalUrl && (
            <a
              href={resource.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <span>{isYouTube ? 'Watch Video on YouTube' : 'Open Live Website'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={() => handleCopyText(extractedText)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Study Text</span>
              </>
            )}
          </button>

          <Link
            href={`/faculty/studio?language=${encodeURIComponent(lang)}`}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 sm:ml-auto"
          >
            <GraduationCap className="w-4 h-4 text-[#0B2447]" />
            <span>Plan Lesson with this Resource</span>
          </Link>
        </div>
      </div>

      {/* AI Pedagogical Analysis Box */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-black uppercase tracking-wider text-blue-950">
            AI Pedagogical Analysis & Curriculum Summary
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
          {latestAnalysis?.aiSummary || resource.description || 'Verified and indexed into Knowledge Vault for AI smart retrieval.'}
        </p>

        {/* Key Vocabulary Pills */}
        {keyVocab && keyVocab.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-blue-100/60">
            <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
              Core Vocabulary & Terminology Identified:
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {keyVocab.map((vocab, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-white text-blue-900 font-bold font-mono text-xs rounded-lg border border-blue-200 shadow-2xs"
                >
                  {vocab}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Primary Language Skills */}
        {primarySkills && primarySkills.length > 0 && (
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="font-bold text-slate-500">Target Skills:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {primarySkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-indigo-100/70 text-indigo-900 font-bold text-[10px]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Study Content / Full Text Reader */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              {isYouTube ? 'Video Spoken Transcript & Key Dialogues' : 'Extracted Study Material & Lesson Text'}
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Full Content View
          </span>
        </div>

        {/* Content Body */}
        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed space-y-4 font-sans whitespace-pre-wrap select-text bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
          {extractedText}
        </div>
      </div>
    </div>
  );
}
