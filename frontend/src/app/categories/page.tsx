"use client";

import React from 'react';
import { useMasterData } from '@/context/MasterDataContext';
import { useResources } from '@/context/ResourceContext';
import { FolderTree, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
  const router = useRouter();
  const { categories, skills, isLoading, error } = useMasterData();
  const { setFilters, resources } = useResources();

  const items = categories.length > 0 ? categories.map(c => c.name) : (skills.length > 0 ? skills.map(s => s.name) : ['Reading', 'Listening', 'Speaking', 'Writing', 'Grammar', 'Vocabulary']);

  const handleSelectCategory = (name: string) => {
    setFilters(prev => ({ ...prev, skill: name }));
    router.push('/resources');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-[#0B2447]">Academic Categories</h1>
        <p className="text-xs text-slate-500 font-medium">
          Skill categories and learning material formats across all language courses.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* Grid of Categories */}
      {isLoading ? (
        <div className="p-8 text-center text-xs font-bold text-slate-500">
          Loading categories...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((cat) => {
            const count = resources.filter(r => r.academicContext.skill === cat).length;
            return (
              <div
                key={cat}
                onClick={() => handleSelectCategory(cat)}
                className="isml-card p-5 bg-white border border-slate-200 hover:border-purple-500 hover:shadow-lg transition-all rounded-2xl space-y-3 cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-50 text-purple-700 font-bold group-hover:scale-110 transition-transform">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0B2447] group-hover:text-purple-700">
                      {cat}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{count} items in repository</p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
