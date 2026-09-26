"use client";

import React from 'react';
import { useMasterData } from '@/context/MasterDataContext';
import { useResources } from '@/context/ResourceContext';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LanguagesPage() {
  const router = useRouter();
  const { languages, isLoading, error } = useMasterData();
  const { setFilters, resources } = useResources();

  const handleSelectLanguage = (langName: string) => {
    setFilters(prev => ({ ...prev, language: langName }));
    router.push('/resources');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-[#0B2447]">Language Catalogs</h1>
        <p className="text-xs text-slate-500 font-medium">
          Supported foreign languages in the ISML curriculum repository with real-time resource statistics from NestJS backend.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* Languages Cards Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-xs font-bold text-slate-500">
          Loading language catalogs from NestJS Backend...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {languages.map((lang) => {
            const count = resources.filter(r => r.academicContext.language.toLowerCase() === lang.name.toLowerCase()).length;
            return (
              <div
                key={lang.id}
                onClick={() => handleSelectLanguage(lang.name)}
                className="isml-card p-5 bg-white border border-slate-200 hover:border-[#0052CC] hover:shadow-lg transition-all rounded-2xl space-y-4 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{lang.flagEmoji || '🌐'}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0052CC] text-[10px] font-black uppercase">
                      {lang.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#0B2447] group-hover:text-[#0052CC]">
                      {lang.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">{lang.nativeName || lang.code.toUpperCase()}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#0052CC]" /> Total Resources:
                    </span>
                    <span className="font-extrabold text-slate-900">{count}</span>
                  </div>
                </div>

                <div className="pt-2 text-xs font-bold text-[#0052CC] flex items-center justify-between">
                  <span>View Resources</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
