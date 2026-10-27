"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Resource } from '@/types/resource';
import { 
  Eye, 
  ExternalLink, 
  Archive, 
  User, 
  Globe, 
  Tag, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter
} from 'lucide-react';
import { useResources } from '@/context/ResourceContext';

interface ResourceTableProps {
  resources: Resource[];
  initialPageSize?: number;
}

export default function ResourceTable({ resources, initialPageSize = 10 }: ResourceTableProps) {
  const { archiveResource, filters, setFilters } = useResources();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');

  // Extract distinct available languages from current resources
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    resources.forEach(r => {
      if (r.academicContext?.language) {
        langs.add(r.academicContext.language);
      }
    });
    return ['All', ...Array.from(langs).sort()];
  }, [resources]);

  // Apply language dropdown filter
  const displayedResources = useMemo(() => {
    if (selectedLanguage === 'All') return resources;
    return resources.filter(r => 
      r.academicContext?.language?.toLowerCase() === selectedLanguage.toLowerCase()
    );
  }, [resources, selectedLanguage]);

  // Total pages calculation
  const totalPages = Math.max(1, Math.ceil(displayedResources.length / pageSize));

  // Reset to page 1 if current page exceeds total pages
  const validCurrentPage = Math.min(currentPage, totalPages);

  // Paginated resources slice
  const paginatedResources = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return displayedResources.slice(startIndex, startIndex + pageSize);
  }, [displayedResources, validCurrentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const startRecord = displayedResources.length === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(validCurrentPage * pageSize, displayedResources.length);

  return (
    <div className="overflow-hidden font-sans border border-slate-200 rounded-2xl shadow-sm bg-white space-y-0">
      
      {/* TABLE TOP BAR: LANGUAGE DROPDOWN FILTER & RECORD STATS */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <label htmlFor="table-lang-filter" className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Language:</span>
          </label>

          {/* Simple Clean Language Dropdown */}
          <div className="relative">
            <select
              id="table-lang-filter"
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-2xs pr-8"
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'All' ? '🌐 All Languages' : lang}
                </option>
              ))}
            </select>
          </div>

          {selectedLanguage !== 'All' && (
            <button
              onClick={() => {
                setSelectedLanguage('All');
                setCurrentPage(1);
              }}
              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        <div className="text-xs font-medium text-slate-500">
          Total: <strong className="text-slate-900 font-extrabold">{displayedResources.length}</strong> resources found
        </div>
      </div>

      {/* FIXED HEIGHT SCROLLABLE TABLE CONTAINER */}
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead className="sticky top-0 z-10 shadow-xs">
            <tr className="bg-gradient-to-r from-[#0B2447] to-[#1E3A8A] text-white text-[11px] uppercase tracking-wider font-extrabold border-b border-blue-900">
              <th className="py-3 px-4 w-[16%]">Tutor & Source</th>
              <th className="py-3 px-4 w-[38%]">Resource Title & Category</th>
              <th className="py-3 px-4 w-[30%]">Curriculum Purpose</th>
              <th className="py-3 px-4 w-[16%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
            {paginatedResources.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-500 text-xs font-bold">
                  No resources found for {selectedLanguage}.
                </td>
              </tr>
            ) : (
              paginatedResources.map((res) => {
                const isExt = res.sourceType === 'External' || (res.tags && (res.tags.includes('Discovered') || res.tags.includes('UserSavedExternal')));
                const tutorName = isExt ? null : (res.tutorName || 'ISML Academic Tutor');
                const category = res.category || res.academicContext.topic || 'General Material';
                const purpose = res.purpose || res.description || 'Verified course study notes and practice materials.';
                const linkUrl = res.sourceUrl || res.originalUrl || '';

                return (
                  <tr key={res.id} className="hover:bg-blue-50/60 transition-colors group">
                    {/* Tutor & Source Column */}
                    <td className="py-3.5 px-4 align-top">
                      {isExt || !tutorName ? (
                        <span className="text-slate-400 font-semibold italic text-[11px]">External OER</span>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold truncate">
                          <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{tutorName}</span>
                        </div>
                      )}
                      <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                        {res.sourceName || (isExt ? 'Web Reference' : 'ISML Catalog')}
                      </span>
                    </td>

                    {/* Resource Title & Multi-Pill Metadata */}
                    <td className="py-3.5 px-4 align-top space-y-1.5">
                      <Link
                        href={`/resources/${res.id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors block text-xs leading-snug"
                      >
                        {res.title}
                      </Link>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700 font-bold text-[10px] flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-purple-600" />
                          {category}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-900 text-white font-extrabold text-[10px]">
                          {res.academicContext.language}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-900 font-bold text-[10px]">
                          {res.academicContext.level}
                        </span>
                        {res.academicContext.skill && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px]">
                            {res.academicContext.skill}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Purpose Column */}
                    <td className="py-3.5 px-4 text-slate-600 align-top">
                      <p className="text-[11px] leading-relaxed line-clamp-2" title={purpose}>
                        {purpose}
                      </p>
                    </td>

                    {/* Link & Action Column */}
                    <td className="py-3.5 px-4 text-right align-top">
                      <div className="flex flex-col items-end gap-1.5">
                        {linkUrl ? (
                          <a
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-700 text-[11px] font-bold transition-all truncate max-w-[140px]"
                            title={linkUrl}
                          >
                            <Globe className="w-3 h-3 shrink-0" />
                            <span>Link</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 ml-0.5" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Internal</span>
                        )}

                        <div className="flex items-center gap-1">
                          <Link
                            href={`/resources/${res.id}`}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold transition-all shadow-xs flex items-center gap-1"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3" /> View
                          </Link>

                          <button
                            onClick={() => {
                              if (confirm(`Archive "${res.title}"?`)) {
                                archiveResource(res.id);
                              }
                            }}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Archive"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION TOOLBAR */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Record count info */}
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <span>
            Showing <strong className="text-slate-900 font-black">{startRecord}</strong> to <strong className="text-slate-900 font-black">{endRecord}</strong> of <strong className="text-slate-900 font-black">{displayedResources.length}</strong> resources
          </span>

          {/* Rows per page selector */}
          <div className="flex items-center gap-1.5 border-l border-slate-300 pl-3">
            <span className="text-[11px] text-slate-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-1 focus:ring-blue-600"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Page navigation buttons */}
        <div className="flex items-center gap-1">
          {/* First page */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={validCurrentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous page */}
          <button
            onClick={() => handlePageChange(validCurrentPage - 1)}
            disabled={validCurrentPage === 1}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page indicator pills */}
          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (validCurrentPage <= 3) {
                pageNum = i + 1;
              } else if (validCurrentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = validCurrentPage - 2 + i;
              }

              const isCurrent = pageNum === validCurrentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next page */}
          <button
            onClick={() => handlePageChange(validCurrentPage + 1)}
            disabled={validCurrentPage === totalPages}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last page */}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={validCurrentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
