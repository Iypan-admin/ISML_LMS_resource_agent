"use client";

import React from 'react';
import Link from 'next/link';
import { Resource } from '@/types/resource';
import { Eye, ExternalLink, Archive, User, Globe, Tag } from 'lucide-react';
import { useResources } from '@/context/ResourceContext';

interface ResourceTableProps {
  resources: Resource[];
}

export default function ResourceTable({ resources }: ResourceTableProps) {
  const { archiveResource } = useResources();

  return (
    <div className="isml-card overflow-hidden font-sans border border-slate-200/90 rounded-2xl shadow-xs bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#071730] text-white text-[11px] uppercase tracking-wider font-extrabold border-b border-[#1E3A8A]">
              <th className="py-3 px-4 w-36">Tutor Name</th>
              <th className="py-3 px-4 min-w-[260px] max-w-[320px]">Resource Details</th>
              <th className="py-3 px-4 max-w-[280px]">Purpose</th>
              <th className="py-3 px-4 w-44 text-right">Link & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
            {resources.map((res) => {
              const isExt = res.sourceType === 'External' || (res.tags && (res.tags.includes('Discovered') || res.tags.includes('UserSavedExternal')));
              const tutorName = isExt ? null : (res.tutorName || 'ISML Academic Tutor');
              const category = res.category || res.academicContext.topic || 'General Material';
              const purpose = res.purpose || res.description || 'Learning material for course curriculum.';
              const linkUrl = res.sourceUrl || res.originalUrl || '';

              return (
                <tr key={res.id} className="hover:bg-blue-50/40 transition-colors">
                  {/* Tutor Name */}
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 align-top">
                    {isExt || !tutorName ? (
                      <span className="text-slate-400 font-normal">—</span>
                    ) : (
                      <span className="flex items-center gap-1.5 truncate pt-0.5">
                        <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{tutorName}</span>
                      </span>
                    )}
                  </td>

                  {/* Resource Name with embedded Category & Level badges + Word Wrap */}
                  <td className="py-3.5 px-4 align-top space-y-1.5 max-w-[280px]">
                    <Link 
                      href={`/resources/${res.id}`} 
                      className="hover:text-[#0052CC] font-black text-[#0B2447] text-xs transition-colors block break-words whitespace-normal leading-snug"
                    >
                      {res.title}
                    </Link>

                    {/* Compact Category & Level Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200/80 text-purple-800 font-bold text-[10px] flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-purple-600" />
                        {category}
                      </span>

                      <span className="px-1.5 py-0.5 rounded bg-[#0B2447] text-white text-[9px] font-extrabold">
                        {res.academicContext.language}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-900 text-[9px] font-extrabold">
                        {res.academicContext.level}
                      </span>
                    </div>
                  </td>

                  {/* Purpose (with Width Reduced & Line-Clamp) */}
                  <td className="py-3.5 px-4 text-slate-600 align-top max-w-[280px]">
                    <p className="text-[11px] leading-relaxed font-medium break-words whitespace-normal line-clamp-2" title={purpose}>
                      {purpose}
                    </p>
                  </td>

                  {/* Link & Actions combined column */}
                  <td className="py-3.5 px-4 text-right align-top">
                    <div className="flex flex-col items-end gap-1.5">
                      {linkUrl ? (
                        <a
                          href={linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-[#0052CC] hover:text-white border border-blue-200 text-[#0052CC] text-[11px] font-bold transition-all truncate max-w-[140px]"
                          title={linkUrl}
                        >
                          <Globe className="w-3 h-3 shrink-0" />
                          <span>Open Link</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0 ml-0.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">Internal Doc</span>
                      )}

                      <div className="flex items-center gap-1">
                        <Link
                          href={`/resources/${res.id}`}
                          className="px-2.5 py-1 rounded-lg bg-[#0052CC] hover:bg-blue-700 text-white text-[10px] font-extrabold transition-all shadow-2xs flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye className="w-3 h-3" /> Details
                        </Link>

                        <button
                          onClick={() => {
                            if (confirm(`Archive "${res.title}"?`)) {
                              archiveResource(res.id);
                            }
                          }}
                          className="p-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
