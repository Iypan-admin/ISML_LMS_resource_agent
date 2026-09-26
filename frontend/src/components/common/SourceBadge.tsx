import React from 'react';
import { SourceType } from '@/types/resource';
import { Sparkles, Globe, Upload, Database } from 'lucide-react';

interface SourceBadgeProps {
  sourceType: SourceType;
  sourceName?: string;
}

export default function SourceBadge({ sourceType, sourceName }: SourceBadgeProps) {
  if (sourceType === 'AI Generated') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold">
        <Sparkles className="w-3 h-3 text-purple-500" />
        <span>{sourceName && sourceName !== 'Internal Workspace' ? sourceName : 'AI Generated'}</span>
      </span>
    );
  }

  if (sourceType === 'Uploaded') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-extrabold">
        <Upload className="w-3 h-3 text-teal-500" />
        <span className="truncate max-w-[120px]">{sourceName || 'Uploaded File'}</span>
      </span>
    );
  }

  if (sourceType === 'External') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-extrabold">
        <Globe className="w-3 h-3 text-sky-500" />
        <span className="truncate max-w-[120px]">{sourceName || 'External OER'}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-extrabold">
      <Database className="w-3 h-3 text-indigo-600" />
      <span className="truncate max-w-[130px]">{sourceName || 'Internal DB'}</span>
    </span>
  );
}
