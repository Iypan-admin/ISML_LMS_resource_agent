"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Sparkles, Database, CheckSquare, Globe, Plus } from 'lucide-react';
import { useResources } from '@/context/ResourceContext';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { filters, setFilters, stats } = useResources();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
    if (pathname !== '/resources' && e.target.value.trim().length > 0) {
      router.push('/resources');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between shadow-2xs font-sans">
      {/* Brand & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
            <img src="/logo.png" alt="ISML Logo" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-sm text-[#0B2447] block leading-tight">ISML AI Resource</span>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Language Platform</span>
          </div>
        </Link>

        {/* Global Search Input */}
        <div className="flex-1 items-center bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-[#0052CC] focus-within:bg-white transition-all flex">
          <Search className="w-4 h-4 text-slate-400 mr-1.5 shrink-0" />
          <input
            id="global-resource-search"
            name="search"
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search language resources, topics..."
            className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full font-medium"
            suppressHydrationWarning
          />
          {filters.search && (
            <button 
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right Stats & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 ml-1.5">
        {/* Pending Review Badge */}
        <Link
          href="/review"
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-all shadow-2xs shrink-0"
        >
          <CheckSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="hidden sm:inline">Needs Review</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
            {stats.needsReviewCount}
          </span>
        </Link>

        {/* Add Resource Quick Button */}
        <Link
          href="/resources/add"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Resource</span>
        </Link>

        {/* Manager User Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#0B2447] text-cyan-300 border border-cyan-400/40 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
          AM
        </div>
      </div>
    </header>
  );
}
