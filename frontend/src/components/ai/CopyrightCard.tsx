import React from 'react';
import { CopyrightAnalysis } from '@/types/copyright';
import { ShieldCheck, ShieldAlert, AlertOctagon, HelpCircle, Check, X, ExternalLink } from 'lucide-react';

interface CopyrightCardProps {
  copyright: CopyrightAnalysis;
  className?: string;
}

export default function CopyrightCard({ copyright, className = '' }: CopyrightCardProps) {
  let riskBadge = { label: 'LOW CONCERN', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', icon: ShieldCheck };
  
  if (copyright.riskLevel === 'REVIEW_REQUIRED') {
    riskBadge = { label: 'REVIEW REQUIRED', bg: 'bg-amber-50 text-amber-800 border-amber-300', icon: ShieldAlert };
  } else if (copyright.riskLevel === 'RESTRICTED') {
    riskBadge = { label: 'RESTRICTED', bg: 'bg-rose-50 text-rose-800 border-rose-300', icon: AlertOctagon };
  } else if (copyright.riskLevel === 'UNKNOWN') {
    riskBadge = { label: 'UNKNOWN RISK', bg: 'bg-slate-100 text-slate-700 border-slate-300', icon: HelpCircle };
  }

  const RiskIcon = riskBadge.icon;

  const permissions = [
    { label: 'Attribution Required', allowed: copyright.attributionRequired },
    { label: 'Commercial Usage', allowed: copyright.commercialUsageAllowed },
    { label: 'Content Modification', allowed: copyright.modificationAllowed },
    { label: 'Redistribution Rights', allowed: copyright.redistributionAllowed },
    { label: 'Internal LMS Hosting', allowed: copyright.hostingPermission },
  ];

  return (
    <div className={`isml-card p-5 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-4 font-sans ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-xs font-black text-[#0B2447] uppercase tracking-wider">Copyright & Usage Rights</h4>
          <p className="text-[10px] text-slate-500 font-medium">Intellectual property & licensing verification</p>
        </div>
        <div className={`px-2.5 py-1 rounded-full border text-[10px] font-black flex items-center gap-1.5 shadow-2xs ${riskBadge.bg}`}>
          <RiskIcon className="w-3.5 h-3.5" />
          <span>{riskBadge.label}</span>
        </div>
      </div>

      {/* License & Source Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Source Name</span>
          <span className="font-extrabold text-slate-900 truncate block">{copyright.sourceName}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">License Model</span>
          <span className="font-extrabold text-[#0052CC] truncate block">{copyright.license}</span>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Permissions Matrix</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {permissions.map((p) => (
            <div key={p.label} className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
              {p.allowed ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 font-bold" />
              ) : (
                <X className="w-3.5 h-3.5 text-rose-500 shrink-0 font-bold" />
              )}
              <span className={`font-semibold truncate ${p.allowed ? 'text-slate-800' : 'text-slate-500 line-through'}`}>
                {p.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation & Recommended Action */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        <div>
          <strong className="text-slate-800">Risk Analysis: </strong>
          <span className="text-slate-600 font-medium">{copyright.riskExplanation}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[#0052CC]">
          <strong className="font-extrabold">Recommended Action: </strong>
          <span className="font-medium text-slate-800">{copyright.recommendedAction}</span>
        </div>
      </div>
    </div>
  );
}
