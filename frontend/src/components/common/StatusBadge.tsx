import React from 'react';
import { ResourceStatus } from '@/types/resource';

interface StatusBadgeProps {
  status: ResourceStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const rawStatus = (status as string) || 'Published';
  const isPendingOrDraft = rawStatus === 'PENDING_REVIEW' || rawStatus === 'Pending Review' || rawStatus === 'DRAFT' || rawStatus === 'Draft';
  const displayStatus = isPendingOrDraft ? 'Published' : rawStatus;

  let styleClasses = 'bg-blue-50 text-blue-800 border-blue-200';
  let dotColor = 'bg-[#0052CC]';

  switch (displayStatus) {
    case 'Approved':
    case 'APPROVED':
      styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case 'Published':
    case 'PUBLISHED':
      styleClasses = 'bg-blue-50 text-blue-800 border-blue-200';
      dotColor = 'bg-[#0052CC]';
      break;
    case 'Changes Required':
    case 'CHANGES_REQUIRED':
      styleClasses = 'bg-orange-50 text-orange-800 border-orange-200';
      dotColor = 'bg-orange-500';
      break;
    case 'Rejected':
    case 'REJECTED':
      styleClasses = 'bg-rose-50 text-rose-800 border-rose-200';
      dotColor = 'bg-rose-500';
      break;
    case 'Archived':
    case 'ARCHIVED':
      styleClasses = 'bg-slate-200 text-slate-600 border-slate-300';
      dotColor = 'bg-slate-500';
      break;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-2xs ${padding} ${styleClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{displayStatus}</span>
    </span>
  );
}


