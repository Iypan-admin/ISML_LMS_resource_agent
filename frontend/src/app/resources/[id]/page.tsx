"use client";

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResources } from '@/context/ResourceContext';
import { ErrorState } from '@/components/common/States';
import { 
  ArrowLeft, 
  ExternalLink, 
  User, 
  Tag, 
  BookOpen, 
  Globe, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Download,
  Calendar,
  Layers,
  Sparkles,
  List,
  MessageSquare,
  HelpCircle,
  CheckSquare
} from 'lucide-react';

export default function ResourceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { getResourceById } = useResources();
  const [isCopied, setIsCopied] = useState(false);

  let resource = getResourceById(resolvedParams.id);
  if (!resource && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('isml_saved_external_resources');
      if (raw) {
        const items = JSON.parse(raw);
        resource = items.find((i: any) => i.id === resolvedParams.id);
      }
    } catch (e) {}
  }

  if (!resource) {
    return (
      <ErrorState
        title="Resource Not Found"
        description={`No resource exists with ID "${resolvedParams.id}". It may have been deleted or archived.`}
        onRetry={() => router.push('/resources')}
      />
    );
  }

  const tutorName = resource.tutorName || 'ISML Academic Tutor';
  const category = resource.category || resource.academicContext?.topic || 'General Material';
  const purpose = resource.purpose || resource.description || 'Verified course study notes and practice materials.';
  const linkUrl = resource.sourceUrl || resource.originalUrl || '';
  const language = resource.academicContext?.language || 'Language';
  const level = resource.academicContext?.level || 'A1';
  const skill = resource.academicContext?.skill || '';
  
  // Real DB content arrays if present
  const content = resource.content || {};
  const hasVocab = Array.isArray(content.vocabularyList) && content.vocabularyList.length > 0;
  const hasDialogue = Array.isArray(content.dialogueScript) && content.dialogueScript.length > 0;
  const hasGrammar = Boolean(content.grammarNotes);
  const hasQuestions = Array.isArray(content.questions) && content.questions.length > 0;

  // Handle Copy details
  const handleCopy = () => {
    let text = `Tutor Name: ${tutorName}\n`;
    text += `Resource Category: ${category}\n`;
    text += `Resource Name: ${resource.title}\n`;
    text += `Language: ${language}\n`;
    text += `Level: ${level}\n`;
    text += `Purpose: ${purpose}\n`;
    if (linkUrl) text += `Link: ${linkUrl}\n`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Export clean CSV
  const handleExportCSV = () => {
    let csv = `"Tutor Name","Resource Category","Resource Name","Language","Level","Purpose","Link"\n`;
    csv += `"${tutorName.replace(/"/g, '""')}","${category.replace(/"/g, '""')}","${resource.title.replace(/"/g, '""')}","${language}","${level}","${purpose.replace(/"/g, '""')}","${linkUrl}"\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${resource.title.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="font-sans max-w-5xl mx-auto space-y-6 pb-24 animate-fade-in">
      
      {/* EXCEL-STYLE WORKBOOK HEADER */}
      <div className="bg-[#107C41] text-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/resources')}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Resources</span>
          </button>
          
          <div className="h-5 w-px bg-white/20 hidden sm:block" />

          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-100" />
            <h1 className="text-base sm:text-lg font-black truncate max-w-md">
              {resource.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* FORMULA BAR */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs shadow-2xs">
        <span className="font-mono font-black text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-300">
          fx
        </span>
        <span className="font-mono text-slate-700 truncate text-[11px] flex-1">
          =CATALOG_RECORD(Tutor="{tutorName}", Category="{category}", Name="{resource.title}", Level="{level}")
        </span>
        <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
          Status: <strong className="text-emerald-700 font-extrabold">{resource.status || 'Published'}</strong>
        </span>
      </div>

      {/* CLEAN EXCEL SPREADSHEET TABLE: EXACT DB FIELDS ONLY */}
      <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-100/80 border-b border-slate-300 px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Resource Catalog Sheet
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-500">
            Row ID: {resource.id}
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <tbody className="divide-y divide-slate-200 font-sans">
            
            {/* 1. Tutor Name */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="w-1/4 p-4 font-extrabold bg-slate-50/70 text-slate-600 border-r border-slate-200">
                Tutor Name
              </td>
              <td className="w-3/4 p-4 font-black text-slate-900 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>{tutorName}</span>
              </td>
            </tr>

            {/* 2. Resource Category */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-extrabold bg-slate-50/70 text-slate-600 border-r border-slate-200">
                Resource Category
              </td>
              <td className="p-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 font-bold text-xs">
                  <Tag className="w-3.5 h-3.5 text-purple-600" />
                  {category}
                </span>
              </td>
            </tr>

            {/* 3. Resource Name / Title */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-extrabold bg-slate-50/70 text-slate-600 border-r border-slate-200">
                Resource Name
              </td>
              <td className="p-4 font-black text-slate-900 text-base">
                {resource.title}
              </td>
            </tr>

            {/* 4. Language & Level */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-extrabold bg-slate-50/70 text-slate-600 border-r border-slate-200">
                Language & Level
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-blue-900 text-white font-extrabold text-xs">
                    {language}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 font-black text-xs">
                    {level}
                  </span>
                  {skill && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-xs">
                      {skill}
                    </span>
                  )}
                </div>
              </td>
            </tr>

            {/* 5. Purpose */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-extrabold bg-slate-50/70 text-slate-600 border-r border-slate-200 align-top">
                Purpose
              </td>
              <td className="p-4 text-slate-800 leading-relaxed font-normal text-xs sm:text-sm">
                {purpose}
              </td>
            </tr>

            {/* 6. Link */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-extrabold bg-slate-50/70 text-slate-600 border-r border-slate-200">
                Link
              </td>
              <td className="p-4">
                {linkUrl ? (
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-700 font-bold text-xs transition-all"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="truncate max-w-md">{linkUrl}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                ) : (
                  <span className="text-slate-400 font-medium italic">Internal Document (No external link)</span>
                )}
              </td>
            </tr>

            {/* 7. Created Date */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-extrabold bg-slate-50/70 text-slate-600 border-r border-slate-200">
                Last Updated
              </td>
              <td className="p-4 text-slate-500 font-mono text-[11px]">
                {resource.updatedAt ? new Date(resource.updatedAt).toLocaleString() : 'N/A'}
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* ONLY IF REAL VOCABULARY IS RECORDED IN DB */}
      {hasVocab && (
        <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-300 px-5 py-3">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <List className="w-4 h-4 text-purple-600" /> Vocabulary Data ({content.vocabularyList!.length} items)
            </h3>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">Word</th>
                <th className="p-3">Part of Speech</th>
                <th className="p-3">Translation</th>
                <th className="p-3">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {content.vocabularyList!.map((v, i) => (
                <tr key={i} className="hover:bg-purple-50/40">
                  <td className="p-3 text-center text-slate-400 font-bold">{i + 1}</td>
                  <td className="p-3 font-bold text-slate-900">{v.word}</td>
                  <td className="p-3 text-slate-500">{v.partOfSpeech || '—'}</td>
                  <td className="p-3 font-bold text-purple-700">{v.translation}</td>
                  <td className="p-3 text-slate-600 italic">{v.example || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ONLY IF REAL DIALOGUE SCRIPT IS RECORDED IN DB */}
      {hasDialogue && (
        <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-300 px-5 py-3">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" /> Dialogue Script ({content.dialogueScript!.length} turns)
            </h3>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3 w-14 text-center">Turn</th>
                <th className="p-3 w-32">Speaker</th>
                <th className="p-3">Dialogue Text</th>
                <th className="p-3">Translation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {content.dialogueScript!.map((d, i) => (
                <tr key={i} className="hover:bg-blue-50/40">
                  <td className="p-3 text-center text-slate-400 font-bold">{i + 1}</td>
                  <td className="p-3 font-bold text-blue-900">{d.speaker}</td>
                  <td className="p-3 font-semibold text-slate-900">{d.text}</td>
                  <td className="p-3 text-slate-600 italic">{d.translation || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ONLY IF REAL GRAMMAR NOTES EXIST IN DB */}
      {hasGrammar && (
        <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-amber-100/70 border-b border-amber-300 px-5 py-3">
            <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-700" /> Grammar Notes
            </h3>
          </div>
          <div className="p-5 font-mono text-xs text-slate-800 whitespace-pre-line bg-amber-50/30">
            {Array.isArray(content.grammarNotes) ? content.grammarNotes.join('\n') : content.grammarNotes}
          </div>
        </div>
      )}

      {/* ONLY IF REAL QUESTIONS EXIST IN DB */}
      {hasQuestions && (
        <div className="bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-300 px-5 py-3">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" /> Practice Questions ({content.questions!.length})
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {content.questions!.map((q, i) => (
              <div key={q.id || i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-900">Q{i + 1}: {q.question}</p>
                {q.options && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => (
                      <span key={oIdx} className="p-2 bg-white rounded border border-slate-200 text-slate-700">
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </span>
                    ))}
                  </div>
                )}
                {q.answer && (
                  <p className="text-xs text-emerald-700 font-bold">Answer: {q.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
