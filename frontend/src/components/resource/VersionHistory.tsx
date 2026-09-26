import React from 'react';
import { ResourceVersion, ResourceActivity } from '@/types/resource';
import { History, Clock, User, ChevronRight } from 'lucide-react';

interface VersionHistoryProps {
  versions: ResourceVersion[];
}

export function VersionHistory({ versions }: VersionHistoryProps) {
  return (
    <div className="isml-card p-5 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-3 font-sans">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div className="p-1.5 rounded-lg bg-blue-50 text-[#0052CC]">
          <History className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-black text-[#0B2447] uppercase tracking-wider">Version History ({versions.length})</h4>
      </div>

      <div className="space-y-2.5">
        {versions.map((ver) => (
          <div key={ver.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
            <div className="flex items-center justify-between font-bold text-[#0B2447]">
              <span className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-[#0052CC] text-[10px]">v{ver.versionNumber}</span>
                <span>{ver.title}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">
                {new Date(ver.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-slate-600 font-medium text-[11px]">{ver.changeSummary}</p>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
              <User className="w-3 h-3 text-slate-400" /> {ver.updatedBy}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ActivityTimelineProps {
  activities: ResourceActivity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="isml-card p-5 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-3 font-sans">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
          <Clock className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-black text-[#0B2447] uppercase tracking-wider">Activity Audit Log</h4>
      </div>

      <div className="relative pl-4 space-y-3 border-l-2 border-slate-200 ml-2">
        {activities.map((act) => (
          <div key={act.id} className="relative group text-xs space-y-0.5">
            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#0052CC] ring-4 ring-white" />
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>{act.action}</span>
              <span className="text-[10px] text-slate-400 font-mono">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">{act.details}</p>
            <p className="text-[10px] text-slate-400">By {act.actor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
