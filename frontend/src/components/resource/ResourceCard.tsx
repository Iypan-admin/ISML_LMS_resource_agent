"use client";

import React from 'react';
import Link from 'next/link';
import { Resource } from '@/types/resource';
import StatusBadge from '../common/StatusBadge';
import SourceBadge from '../common/SourceBadge';
import { ExternalLink, Eye, Edit3, Archive, Layers, Sparkles, BookOpen } from 'lucide-react';
import { useResources } from '@/context/ResourceContext';

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const { archiveResource } = useResources();

  const handleArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm(`Archive "${resource.title}"?`)) {
      archiveResource(resource.id);
    }
  };

  return (
    <div className="isml-card p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all font-sans relative group">
      {/* Top Header & Badges */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-[#0B2447] text-white font-extrabold text-[10px]">
              {resource.academicContext.language}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-900 font-extrabold text-[10px]">
              {resource.academicContext.level}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-extrabold text-[10px]">
              {resource.academicContext.skill}
            </span>
            <SourceBadge sourceType={resource.sourceType} sourceName={resource.sourceName} />
          </div>
          <StatusBadge status={resource.status} size="sm" />
        </div>

        {/* Title */}
        <Link href={`/resources/${resource.id}`} className="block">
          <h3 className="text-sm sm:text-base font-extrabold text-[#0B2447] group-hover:text-[#0052CC] transition-colors line-clamp-2 leading-snug">
            {resource.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 font-medium leading-relaxed">
          {resource.description}
        </p>
      </div>

      {/* Metadata Context Summary */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between text-slate-600">
          <span className="font-semibold truncate max-w-[200px] text-slate-700">
            {resource.academicContext.topic}
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            {resource.academicContext.resourceType}
          </span>
        </div>

        {/* Quality Score Indicator */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-[10px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-500" /> AI Score:
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-[#0052CC]"
                style={{ width: `${resource.analysis.overallQualityScore}%` }}
              />
            </div>
            <span className="font-extrabold text-[#0052CC] text-[10px]">
              {resource.analysis.overallQualityScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          href={`/resources/${resource.id}`}
          className="flex-1 min-h-[38px] px-3 py-1.5 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Details</span>
        </Link>

        {resource.sourceUrl && (
          <a
            href={resource.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="Open Original Source"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        <button
          onClick={handleArchive}
          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
          title="Archive Resource"
        >
          <Archive className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
