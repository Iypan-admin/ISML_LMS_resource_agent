"use client";

import React, { useState } from 'react';
import { useResources } from '@/context/ResourceContext';
import StatusBadge from '@/components/common/StatusBadge';
import SourceBadge from '@/components/common/SourceBadge';
import { EmptyState } from '@/components/common/States';
import { AlertTriangle, CheckCircle2, XCircle, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ReviewWorkspacePage() {
  const { resources, updateResourceStatus, isLoading, error } = useResources();
  const [activeTab, setActiveTab] = useState<'PENDING_REVIEW' | 'CHANGES_REQUIRED' | 'APPROVED' | 'REJECTED'>('PENDING_REVIEW');

  const matchesStatus = (itemStatus: string, tabStatus: string) => {
    if (tabStatus === 'PENDING_REVIEW') {
      return itemStatus === 'PENDING_REVIEW' || itemStatus === 'Pending Review';
    }
    if (tabStatus === 'CHANGES_REQUIRED') {
      return itemStatus === 'CHANGES_REQUIRED' || itemStatus === 'Changes Required';
    }
    if (tabStatus === 'APPROVED') {
      return itemStatus === 'APPROVED' || itemStatus === 'Approved';
    }
    if (tabStatus === 'REJECTED') {
      return itemStatus === 'REJECTED' || itemStatus === 'Rejected';
    }
    return itemStatus === tabStatus;
  };

  const filteredItems = resources.filter(r => matchesStatus(r.status, activeTab));

  const pendingCount = resources.filter(r => matchesStatus(r.status, 'PENDING_REVIEW')).length;
  const changesCount = resources.filter(r => matchesStatus(r.status, 'CHANGES_REQUIRED')).length;
  const approvedCount = resources.filter(r => matchesStatus(r.status, 'APPROVED')).length;
  const rejectedCount = resources.filter(r => matchesStatus(r.status, 'REJECTED')).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-[#0B2447]">Resource Review Workspace</h1>
        <p className="text-xs text-slate-500 font-medium">
          Academic Manager quality evaluation & decision panel. Supervise AI recommendations before publication.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'PENDING_REVIEW', label: 'Pending Review', count: pendingCount, color: 'bg-amber-500 text-slate-950' },
          { id: 'CHANGES_REQUIRED', label: 'Changes Required', count: changesCount, color: 'bg-orange-500 text-white' },
          { id: 'APPROVED', label: 'Approved', count: approvedCount, color: 'bg-emerald-500 text-white' },
          { id: 'REJECTED', label: 'Rejected', count: rejectedCount, color: 'bg-rose-500 text-white' }
        ].map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{t.label}</span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${t.color}`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="p-8 text-center text-xs font-bold text-slate-500">
          Loading review workspace queue from database...
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={`No resources in ${activeTab.replace('_', ' ')}`}
          description={`There are currently no items matching the "${activeTab.replace('_', ' ')}" status in your review queue.`}
        />
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="isml-card p-5 border border-slate-200 rounded-2xl bg-white space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-[#0B2447] text-white text-[10px] font-bold">
                    {item.academicContext.language}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 text-[10px] font-bold">
                    Level {item.academicContext.level}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 text-[10px] font-bold">
                    {item.academicContext.skill}
                  </span>
                  <SourceBadge sourceType={item.sourceType} sourceName={item.sourceName} />
                </div>
                <StatusBadge status={item.status} size="sm" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-[#0B2447]">{item.title}</h3>
                <p className="text-xs text-slate-600 font-medium mt-1">{item.description}</p>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Topic</span>
                  <span className="font-extrabold text-slate-800 truncate block">{item.academicContext.topic}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">AI Quality Score</span>
                  <span className="font-extrabold text-[#0052CC]">{item.analysis.overallQualityScore}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Copyright Risk</span>
                  <span className="font-extrabold text-emerald-700">{item.copyright.riskLevel.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Decision Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/resources/${item.id}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-4 h-4" /> View Full Resource
                </Link>

                {matchesStatus(item.status, 'PENDING_REVIEW') && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => updateResourceStatus(item.id, 'APPROVED' as any)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => updateResourceStatus(item.id, 'CHANGES_REQUIRED' as any)}
                      className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4" /> Request Changes
                    </button>
                    <button
                      onClick={() => updateResourceStatus(item.id, 'REJECTED' as any)}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
