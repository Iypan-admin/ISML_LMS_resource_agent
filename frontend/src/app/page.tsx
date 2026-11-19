"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, 
  Sparkles, 
  ArrowRight, 
  Search, 
  FileText, 
  Volume2,
  Video,
  BookOpen,
  Cpu,
  History,
  ArrowUpRight,
  Layers
} from 'lucide-react';

export default function HomePage() {
  const [savedCount, setSavedCount] = useState<number>(0);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('isml_saved_sessions_archive');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setSavedCount(parsed.length);
      }
    } catch (_) {}
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-[#0052CC] selection:text-white font-sans antialiased">
      {/* ----------------- COMPACT TOP INSTITUTIONAL HEADER BAR ----------------- */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-2.5 sm:px-6 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#0B2447] p-1 flex items-center justify-center shadow-xs shrink-0">
              <img src="/logo.png" alt="ISML Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-black text-[#0B2447] tracking-tight uppercase truncate">
                  ISML AI Platform
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.2 rounded-full bg-blue-50 border border-blue-200/80 text-[#0052CC] font-bold text-[9px] uppercase tracking-wider shrink-0">
                  Academic Suite
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate hidden sm:block">
                Language Resource & Autonomous Curriculum Architecture
              </p>
            </div>
          </div>

          {/* Right Header Status & Quick Jump */}
          <div className="flex items-center gap-2 shrink-0">
            {savedCount > 0 && (
              <Link
                href="/faculty/studio"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-[#0052CC] text-xs font-bold transition-all shadow-2xs"
                title="Open Saved Curriculum Sessions"
              >
                <History className="w-3.5 h-3.5 text-indigo-600" />
                <span>Saved Sessions</span>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                  {savedCount}
                </span>
              </Link>
            )}

            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* ----------------- COMPACT MAIN WORKSPACE SELECTION ----------------- */}
      <main className="flex-1 flex flex-col justify-center px-4 py-5 sm:py-8 max-w-4xl mx-auto w-full">
        {/* Compact Hero Framing */}
        <div className="text-center max-w-lg mx-auto mb-5 sm:mb-7 space-y-1 sm:space-y-1.5">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#0052CC] text-[10px] font-bold uppercase tracking-wider shadow-2xs">
            <Cpu className="w-3 h-3" />
            <span>Select Workspace</span>
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-[#0B2447] tracking-tight">
            Select Your Workspace
          </h2>

          <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed">
            Choose whether you want to store study materials in your library or create new course lesson plans.
          </p>
        </div>

        {/* ----------------- 2 SLEEK, COMPACT, PROPORTIONED CARDS ----------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5 max-w-2xl sm:max-w-3xl mx-auto w-full items-stretch">
          
          {/* ========================================================================= */}
          {/* CARD 1: STUDY MATERIALS LIBRARY (Vault Card) */}
          {/* ========================================================================= */}
          <Link
            href="/vault"
            className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-[#0052CC] shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.99]"
          >
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#0052CC] group-hover:h-1.5 transition-all" />

            <div className="space-y-3">
              {/* Header Row: Icon + Badge + Arrow */}
              <div className="flex items-center justify-between pt-0.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052CC] to-blue-700 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#0052CC] font-bold text-[9px] uppercase tracking-wider">
                    Materials Library
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#0052CC] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>

              {/* Title & Short Description */}
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-[#0B2447] group-hover:text-[#0052CC] transition-colors">
                  Knowledge Vault
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                  Upload, store, and organize all your language textbooks, PDF guides, study links, and video resources.
                </p>
              </div>

              {/* Compact Quick Feature Tags */}
              <div className="flex flex-wrap items-center gap-1 pt-0.5 text-[10px] text-slate-600 font-bold">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80">
                  <BookOpen className="w-3 h-3 text-blue-600" />
                  <span>PDFs & Books</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80">
                  <Video className="w-3 h-3 text-red-600" />
                  <span>Videos & Links</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80">
                  <Search className="w-3 h-3 text-emerald-600" />
                  <span>Store & View</span>
                </span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">
                Study Files & Media
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 group-hover:bg-[#0052CC] text-white font-extrabold text-xs transition-colors shadow-2xs">
                <span>Open Library</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* ========================================================================= */}
          {/* CARD 2: COURSE & LESSON CREATOR (Studio Card) */}
          {/* ========================================================================= */}
          <Link
            href="/faculty/studio"
            className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-500 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.99]"
          >
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:h-1.5 transition-all" />

            <div className="space-y-3">
              {/* Header Row: Icon + Badge + Arrow */}
              <div className="flex items-center justify-between pt-0.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[9px] uppercase tracking-wider">
                    Lesson Creator
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>

              {/* Title & Short Description */}
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-[#0B2447] group-hover:text-indigo-600 transition-colors">
                  Curriculum Studio
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                  Generate complete course timetables, daily lesson plans, classroom teaching slides, and activities.
                </p>
              </div>

              {/* Compact Quick Feature Tags */}
              <div className="flex flex-wrap items-center gap-1 pt-0.5 text-[10px] text-slate-600 font-bold">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80">
                  <Layers className="w-3 h-3 text-indigo-600" />
                  <span>Timetables</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80">
                  <FileText className="w-3 h-3 text-blue-600" />
                  <span>Daily Lessons</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80">
                  <Volume2 className="w-3 h-3 text-teal-600" />
                  <span>Slides & Voice</span>
                </span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">
                Course & Lesson Plans
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-blue-700 group-hover:to-indigo-700 text-white font-extrabold text-xs transition-all shadow-2xs">
                <span>Create Courses</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

        </div>
      </main>

      {/* ----------------- COMPACT MINIMALIST FOOTER ----------------- */}
      <footer className="border-t border-slate-200/80 bg-white py-2.5 px-4 text-center text-[10px] text-slate-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>ISML Academic AI Platform • Autonomous Language Agent & Knowledge Vault</span>
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <span>CEFR Aligned</span>
            <span>•</span>
            <span>Zero Hallucination Grounding</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
