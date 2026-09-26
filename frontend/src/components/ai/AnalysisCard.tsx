import React from 'react';
import { AIAnalysis } from '@/types/analysis';
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, Info, Tag } from 'lucide-react';

interface AnalysisCardProps {
  analysis: AIAnalysis;
  className?: string;
}

export function AnalysisCard({ analysis, className = '' }: AnalysisCardProps) {
  const metrics = [
    { label: 'Academic Relevance', score: analysis.relevanceScore, color: 'bg-[#0052CC]' },
    { label: 'Level Suitability (CEFR)', score: analysis.levelMatchScore, color: 'bg-cyan-500' },
    { label: 'Language Correctness', score: analysis.languageCorrectness, color: 'bg-emerald-500' },
    { label: 'Skill Mapping Alignment', score: analysis.skillMatchScore, color: 'bg-purple-500' },
    { label: 'Content Completeness', score: analysis.completenessScore, color: 'bg-amber-500' },
  ];

  return (
    <div className={`isml-card p-5 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-4 font-sans ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#0B2447] uppercase tracking-wider">AI Resource Analysis</h4>
            <p className="text-[10px] text-slate-500 font-medium">Automated educational suitability breakdown</p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-extrabold">
          CEFR {analysis.detectedCEFR}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">{m.label}</span>
              <span className="font-extrabold text-[#0B2447]">{m.score}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className={`h-full rounded-full ${m.color} transition-all duration-500`}
                style={{ width: `${m.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* AI Summary */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">AI Evaluation Summary</span>
        <p className="text-xs text-slate-700 font-medium leading-relaxed">{analysis.aiSummary}</p>
      </div>

      {/* Key Vocabulary Chips */}
      {analysis.keyVocabulary && analysis.keyVocabulary.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <Tag className="w-3 h-3 text-cyan-600" /> Extracted Vocabulary ({analysis.keyVocabulary.length}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {analysis.keyVocabulary.map((vocab) => (
              <span key={vocab} className="px-2 py-0.5 rounded-md bg-cyan-50 border border-cyan-200 text-cyan-900 text-[11px] font-bold">
                {vocab}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function QualityCard({ analysis, className = '' }: AnalysisCardProps) {
  let recBadge = { label: 'Approved & Recommended', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2 };
  
  if (analysis.aiRecommendation === 'NEEDS_HUMAN_REVIEW') {
    recBadge = { label: 'Needs Human Review', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: Info };
  } else if (analysis.aiRecommendation === 'CHANGES_REQUIRED') {
    recBadge = { label: 'Changes Required', bg: 'bg-orange-50 text-orange-800 border-orange-200', icon: AlertTriangle };
  } else if (analysis.aiRecommendation === 'REJECT_NOT_SUITABLE') {
    recBadge = { label: 'Reject / Not Suitable', bg: 'bg-rose-50 text-rose-800 border-rose-200', icon: XCircle };
  }

  const RecIcon = recBadge.icon;

  return (
    <div className={`isml-card p-5 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-3 font-sans ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">AI Quality Recommendation</span>
        <span className="text-[10px] text-slate-400 italic">Human Review Final</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-3xl font-black text-[#0052CC] font-mono leading-none">
            {analysis.overallQualityScore}%
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Quality Index</span>
        </div>

        <div className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 shadow-2xs ${recBadge.bg}`}>
          <RecIcon className="w-4 h-4 shrink-0" />
          <span>{recBadge.label}</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
        <strong className="text-slate-800">Reasoning: </strong>{analysis.recommendationReason}
      </p>
    </div>
  );
}
