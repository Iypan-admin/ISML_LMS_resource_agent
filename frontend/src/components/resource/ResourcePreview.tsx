"use client";

import React, { useState } from 'react';
import { ResourceContentPayload } from '@/types/resource';
import { MessageSquare, BookOpen, HelpCircle, List, FileText, CheckCircle2, Volume2, Eye } from 'lucide-react';

interface ResourcePreviewProps {
  content: ResourceContentPayload;
  title: string;
}

function renderFormattedBody(bodyText?: string) {
  if (!bodyText) return null;

  // Split lines and clean markdown symbols like #, ##, **, etc.
  const lines = bodyText.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Strip markdown headers
        if (trimmed.startsWith('# ')) {
          return (
            <h3 key={idx} className="text-base font-black text-[#0B2447] pb-1 border-b border-slate-200">
              {trimmed.replace(/^#\s+/, '')}
            </h3>
          );
        }
        if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-xs font-black text-slate-800 uppercase tracking-wider mt-3">
              {trimmed.replace(/^#{2,3}\s+/, '')}
            </h4>
          );
        }

        // Clean bold indicators **
        const cleanText = trimmed.replace(/\*\*(.*?)\*\*/g, '$1');

        // Skip known boilerplate lines that the backend should have already stripped
        const boilerplatePatterns = [
          /^\*?Special Instructions Applied:/i,
          /^This learning text is specifically crafted for/i,
          /^In this lesson on ['"]?.*['"]?, you will practice/i,
          /^Example Reading:$/i,
          /^Wir sprechen heute über/i,
          /^Das ist sehr wichtig für/i,
          /^Ein gutes Verständnis hilft/i,
          /^\*\*Target Level:\*\*/i,
        ];
        if (boilerplatePatterns.some(p => p.test(cleanText))) {
          return null;
        }

        return (
          <p key={idx} className="text-xs text-slate-700 leading-relaxed font-sans">
            {cleanText}
          </p>
        );
      })}
    </div>
  );
}

export default function ResourcePreview({ content, title }: ResourcePreviewProps) {
  const [showTranslations, setShowTranslations] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <div className="isml-card p-5 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-6 font-sans">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-[#0052CC]">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-black text-[#0B2447] uppercase tracking-wider">Resource Content Preview</h4>
        </div>

        <div className="flex items-center gap-2">
          {content.dialogueScript && content.dialogueScript.length > 0 && (
            <button
              onClick={() => setShowTranslations(!showTranslations)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
            >
              {showTranslations ? 'Hide Translations' : 'Show Translations'}
            </button>
          )}

          {content.questions && content.questions.length > 0 && (
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0052CC] text-[11px] font-bold transition-colors cursor-pointer"
            >
              {showAnswers ? 'Hide Answer Key' : 'Show Answer Key'}
            </button>
          )}
        </div>
      </div>

      {/* 1. Body Text / Passage */}
      {content.body && (
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#0052CC]" /> Lesson Guide & Text Overview
          </h5>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            {renderFormattedBody(content.body)}
          </div>
        </div>
      )}

      {/* 2. Situational Dialogue Script */}
      {content.dialogueScript && content.dialogueScript.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-600" /> Situational Roleplay Dialogue
          </h5>
          <div className="space-y-2.5">
            {content.dialogueScript.map((line, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl border transition-all ${
                  idx % 2 === 0 ? 'bg-blue-50/60 border-blue-100' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-[#0B2447] flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-[#0052CC]" /> {line.speaker}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{line.text}</p>
                {showTranslations && line.translation && (
                  <p className="text-xs text-slate-500 italic mt-1 font-sans">{line.translation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Vocabulary Table */}
      {content.vocabularyList && content.vocabularyList.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <List className="w-3.5 h-3.5 text-purple-600" /> Target Vocabulary
          </h5>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <th className="p-2.5">Word / Phrase</th>
                  <th className="p-2.5">Part of Speech</th>
                  <th className="p-2.5">Translation</th>
                  <th className="p-2.5">Example Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {content.vocabularyList.map((item, i) => {
                  const pos = item.partOfSpeech && item.partOfSpeech !== 'N/A' ? item.partOfSpeech : 'Vocabulary';
                  const ex = item.example && item.example !== '-' ? item.example : `${item.word} (${item.translation})`;
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-[#0B2447]">{item.word}</td>
                      <td className="p-2.5 text-slate-500 font-semibold">{pos}</td>
                      <td className="p-2.5 text-[#0052CC] font-semibold">{item.translation}</td>
                      <td className="p-2.5 text-slate-600 italic">{ex}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Comprehension Questions & Quiz Items */}
      {content.questions && content.questions.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Comprehension Questions & Assessment ({content.questions.length})
          </h5>
          <div className="space-y-3">
            {content.questions.map((q, idx) => {
              const questionKey = q.id || `q-${idx}-${Date.now()}`;
              return (
                <div key={questionKey} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-900">
                    {idx + 1}. {q.question}
                  </p>
                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={`${opt}-${optIdx}`}
                          className={`p-2 rounded-lg text-xs border font-medium ${
                            showAnswers && opt === q.answer 
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold' 
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          {opt} {showAnswers && opt === q.answer && ' ✓ (Correct)'}
                        </div>
                      ))}
                    </div>
                  )}
                  {showAnswers && q.explanation && (
                    <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-medium">
                      <strong>Pedagogical Explanation: </strong>{q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Uploaded File Details */}
      {content.fileDetails && (
        <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-600 text-white font-bold text-xs uppercase">
              {content.fileDetails.fileName.split('.').pop() || 'FILE'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{content.fileDetails.fileName}</p>
              <p className="text-[10px] text-slate-500 font-mono">{content.fileDetails.fileSize} • {content.fileDetails.mimeType}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-teal-600 text-white text-xs font-bold shadow-2xs">
            Parsed by AI
          </span>
        </div>
      )}
    </div>
  );
}
