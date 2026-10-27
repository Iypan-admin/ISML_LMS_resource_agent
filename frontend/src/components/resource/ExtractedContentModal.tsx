"use client";

import React, { useState } from 'react';
import { QuizQuestion } from '@/types/discovery';
import { 
  ArrowLeft, 
  FileSpreadsheet,
  Download,
  Copy, 
  Check, 
  ExternalLink, 
  PlusCircle, 
  CheckCircle2, 
  Search,
  Eye,
  EyeOff,
  BookOpen,
  MessageSquare,
  List,
  HelpCircle,
  CheckSquare,
  Sparkles,
  Table,
  Layers,
  ChevronRight
} from 'lucide-react';

export interface ExtractedPayload {
  overview?: string;
  body?: string;
  dialogueScript?: Array<{ speaker: string; text: string; translation?: string }>;
  vocabularyList?: Array<{ word: string; partOfSpeech?: string; translation: string; example?: string }>;
  grammarNotes?: string;
  videoUrl?: string;
  pdfUrl?: string;
}

interface ExtractedContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sourceName: string;
  sourceUrl: string;
  language: string;
  level: string;
  skill: string;
  topic?: string;
  extractedContent: ExtractedPayload;
  questions?: QuizQuestion[];
  onSaveToQueue?: () => void;
  isSaved?: boolean;
}

type ExcelSheetTab = 'overview' | 'vocab' | 'dialogue' | 'grammar' | 'exercises';

export default function ExtractedContentModal({
  isOpen,
  onClose,
  title,
  sourceName,
  sourceUrl,
  language,
  level,
  skill,
  topic,
  extractedContent,
  questions = [],
  onSaveToQueue,
  isSaved = false,
}: ExtractedContentModalProps) {
  const [activeSheet, setActiveSheet] = useState<ExcelSheetTab>('overview');
  const [showTranslations, setShowTranslations] = useState<boolean>(true);
  const [vocabSearch, setVocabSearch] = useState<string>('');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showSolutions, setShowSolutions] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const topicClean = topic || "Academic Resource";

  // Filter vocabulary by search query
  const filteredVocab = (extractedContent.vocabularyList || []).filter(item => 
    item.word.toLowerCase().includes(vocabSearch.toLowerCase()) ||
    item.translation.toLowerCase().includes(vocabSearch.toLowerCase()) ||
    (item.partOfSpeech && item.partOfSpeech.toLowerCase().includes(vocabSearch.toLowerCase()))
  );

  const sheets: Array<{ id: ExcelSheetTab; label: string; count?: number; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Sheet 1: Overview & Metadata', icon: BookOpen },
    { id: 'vocab', label: 'Sheet 2: Vocabulary Matrix', count: extractedContent.vocabularyList?.length || 0, icon: List },
    { id: 'dialogue', label: 'Sheet 3: Situational Dialogue', count: extractedContent.dialogueScript?.length || 0, icon: MessageSquare },
    { id: 'grammar', label: 'Sheet 4: Grammar Architecture', icon: HelpCircle },
    { id: 'exercises', label: 'Sheet 5: Practice Drills & Keys', count: questions.length, icon: CheckSquare },
  ];

  // Export structured CSV of active sheet or full workbook
  const handleExportCSV = () => {
    let csv = `RESOURCE: ${title}\nLANGUAGE: ${language}\nLEVEL: ${level}\nSKILL: ${skill}\nSOURCE: ${sourceName}\n\n`;

    if (activeSheet === 'vocab') {
      csv += `"Index","Target Word (${language})","Part of Speech","English Meaning","Example Sentence"\n`;
      (extractedContent.vocabularyList || []).forEach((v, i) => {
        csv += `"${i + 1}","${v.word.replace(/"/g, '""')}","${(v.partOfSpeech || '').replace(/"/g, '""')}","${v.translation.replace(/"/g, '""')}","${(v.example || '').replace(/"/g, '""')}"\n`;
      });
    } else if (activeSheet === 'dialogue') {
      csv += `"Turn","Speaker","Native Script (${language})","English Translation"\n`;
      (extractedContent.dialogueScript || []).forEach((d, i) => {
        csv += `"${i + 1}","${d.speaker.replace(/"/g, '""')}","${d.text.replace(/"/g, '""')}","${(d.translation || '').replace(/"/g, '""')}"\n`;
      });
    } else if (activeSheet === 'exercises') {
      csv += `"Question #","Question","Option A","Option B","Option C","Option D","Answer","Explanation"\n`;
      questions.forEach((q, i) => {
        csv += `"${i + 1}","${q.question.replace(/"/g, '""')}","${(q.options[0] || '').replace(/"/g, '""')}","${(q.options[1] || '').replace(/"/g, '""')}","${(q.options[2] || '').replace(/"/g, '""')}","${(q.options[3] || '').replace(/"/g, '""')}","${q.answer.replace(/"/g, '""')}","${(q.explanation || '').replace(/"/g, '""')}"\n`;
      });
    } else {
      csv += `"Property","Value"\n`;
      csv += `"Title","${title.replace(/"/g, '""')}"\n`;
      csv += `"Topic","${topicClean.replace(/"/g, '""')}"\n`;
      csv += `"Language","${language}"\n`;
      csv += `"Level","${level}"\n`;
      csv += `"Overview","${(extractedContent.overview || extractedContent.body || '').replace(/"/g, '""')}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}_${activeSheet}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyClipboard = () => {
    let text = `====================================================\n`;
    text += `📊 ISML SPREADSHEET MASTER MATRIX: ${title}\n`;
    text += `Language: ${language} | Level: ${level} | Skill: ${skill} | Topic: ${topicClean}\n`;
    text += `Source: ${sourceName} (${sourceUrl})\n`;
    text += `====================================================\n\n`;

    text += `[SHEET 1: OVERVIEW]\n${extractedContent.overview || extractedContent.body || 'No overview'}\n\n`;

    if (extractedContent.vocabularyList?.length) {
      text += `[SHEET 2: VOCABULARY MATRIX]\n`;
      extractedContent.vocabularyList.forEach((v, i) => {
        text += `${i + 1}\t${v.word}\t${v.partOfSpeech || ''}\t${v.translation}\t${v.example || ''}\n`;
      });
      text += `\n`;
    }

    if (extractedContent.dialogueScript?.length) {
      text += `[SHEET 3: DIALOGUE MATRIX]\n`;
      extractedContent.dialogueScript.forEach((d, i) => {
        text += `Turn ${i + 1}\t${d.speaker}\t${d.text}\t${d.translation || ''}\n`;
      });
      text += `\n`;
    }

    if (extractedContent.grammarNotes) {
      text += `[SHEET 4: GRAMMAR]\n${extractedContent.grammarNotes}\n\n`;
    }

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col font-sans animate-fade-in p-2 sm:p-4 md:p-6 overflow-hidden">
      
      {/* EXCEL WORKBOOK WINDOW FRAME */}
      <div className="flex-1 bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden max-w-7xl w-full mx-auto">
        
        {/* EXCEL TITLE BAR */}
        <div className="bg-[#107C41] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
              title="Close and return"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Close Sheet</span>
            </button>

            <div className="h-5 w-px bg-white/20 hidden sm:block" />

            <div className="flex items-center gap-2 min-w-0">
              <FileSpreadsheet className="w-5 h-5 text-emerald-100 shrink-0" />
              <span className="font-extrabold text-xs sm:text-sm truncate">
                {title} — Curriculum Workbook
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-800 text-emerald-100">
                {language} • {level}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Export Current Sheet as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handleCopyClipboard}
              className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCopied ? 'Copied Matrix' : 'Copy All'}</span>
            </button>

            {onSaveToQueue && (
              <button
                onClick={onSaveToQueue}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSaved 
                    ? 'bg-emerald-200 text-emerald-900 font-black' 
                    : 'bg-white text-[#107C41] hover:bg-emerald-50'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isSaved ? 'In Library' : 'Save'}</span>
              </button>
            )}
          </div>
        </div>

        {/* EXCEL FORMULA BAR */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-3 text-xs shrink-0">
          <div className="font-mono font-black text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-300 shadow-2xs">
            fx
          </div>
          <div className="font-mono text-slate-700 truncate flex-1 bg-white px-3 py-1 rounded border border-slate-300 shadow-2xs text-[11px]">
            =CURRICULUM_MATRIX(Language="{language}", Level="{level}", Skill="{skill}", Topic="{topicClean}")
          </div>
          <div className="text-[11px] font-bold text-slate-500 hidden sm:block">
            Source: <strong className="text-slate-800">{sourceName}</strong>
          </div>
        </div>

        {/* WORKBOOK CONTENT SHEET */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4 sm:p-6">
          
          {/* SHEET 1: OVERVIEW & METADATA */}
          {activeSheet === 'overview' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-slate-100 border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Table className="w-4 h-4 text-emerald-600" /> Sheet 1: Resource Metadata & Learning Scope
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Validated Entry
                  </span>
                </div>

                <table className="w-full text-xs text-left border-collapse">
                  <tbody className="divide-y divide-slate-200 font-sans">
                    <tr className="hover:bg-slate-50">
                      <td className="w-1/4 p-3 font-bold bg-slate-50/80 text-slate-600 border-r border-slate-200">Resource Name</td>
                      <td className="w-3/4 p-3 font-black text-slate-900">{title}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold bg-slate-50/80 text-slate-600 border-r border-slate-200">Target Language & Level</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-black mr-2">{language}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-black">{level}</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold bg-slate-50/80 text-slate-600 border-r border-slate-200">Curriculum Skill & Topic</td>
                      <td className="p-3 font-bold text-slate-800">{skill} • {topicClean}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold bg-slate-50/80 text-slate-600 border-r border-slate-200">Origin Source Provider</td>
                      <td className="p-3 text-slate-700 font-medium">
                        {sourceName} {sourceUrl && (
                          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline inline-flex items-center gap-1 font-bold">
                            Open Link <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold bg-slate-50/80 text-slate-600 border-r border-slate-200 align-top">Core Learning Overview</td>
                      <td className="p-3 text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                        {extractedContent.overview || extractedContent.body || `Comprehensive instructional content for ${topicClean} at ${level} proficiency.`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Learning Objectives Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-600 block">Objective 01</span>
                  <h4 className="text-xs font-black text-slate-900">Vocabulary Acquisition</h4>
                  <p className="text-[11px] text-slate-600">Master {extractedContent.vocabularyList?.length || 10}+ essential words for {topicClean}.</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-600 block">Objective 02</span>
                  <h4 className="text-xs font-black text-slate-900">Situational Fluency</h4>
                  <p className="text-[11px] text-slate-600">Practice dialogue turns with correct pronunciation and intonation.</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-600 block">Objective 03</span>
                  <h4 className="text-xs font-black text-slate-900">Syntax Accuracy</h4>
                  <p className="text-[11px] text-slate-600">Apply grammatical structures expected at {level} CEFR/JLPT benchmark.</p>
                </div>
              </div>
            </div>
          )}

          {/* SHEET 2: VOCABULARY MATRIX */}
          {activeSheet === 'vocab' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-300">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search word, translation, or part of speech..."
                    value={vocabSearch}
                    onChange={(e) => setVocabSearch(e.target.value)}
                    className="text-xs font-medium bg-transparent outline-none w-64 text-slate-800"
                  />
                </div>
                <span className="text-[11px] font-extrabold text-slate-500">
                  Showing {filteredVocab.length} of {extractedContent.vocabularyList?.length || 0} vocabulary entries
                </span>
              </div>

              {filteredVocab.length > 0 ? (
                <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse table-auto">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-black text-[11px] uppercase tracking-wider border-b border-slate-300">
                          <th className="p-3 w-12 text-center border-r border-slate-200">#</th>
                          <th className="p-3 w-1/4 border-r border-slate-200">Word ({language})</th>
                          <th className="p-3 w-28 border-r border-slate-200">Part of Speech</th>
                          <th className="p-3 w-1/4 border-r border-slate-200">English Meaning</th>
                          <th className="p-3">Example Usage Sentence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-sans">
                        {filteredVocab.map((item, i) => (
                          <tr key={i} className="hover:bg-emerald-50/50 transition-colors">
                            <td className="p-3 text-center font-bold text-slate-400 border-r border-slate-200 bg-slate-50/50">
                              {i + 1}
                            </td>
                            <td className="p-3 font-black text-slate-900 text-sm border-r border-slate-200">
                              {item.word}
                            </td>
                            <td className="p-3 text-slate-600 font-semibold border-r border-slate-200">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                                {item.partOfSpeech || 'Word'}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-emerald-800 border-r border-slate-200">
                              {item.translation}
                            </td>
                            <td className="p-3 text-slate-600 italic">
                              {item.example || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl border border-slate-300 text-center text-xs text-slate-500">
                  No vocabulary rows match your filter.
                </div>
              )}
            </div>
          )}

          {/* SHEET 3: SITUATIONAL DIALOGUE */}
          {activeSheet === 'dialogue' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800">
                    Dialogue Matrix ({extractedContent.dialogueScript?.length || 0} Turns)
                  </span>
                </div>
                <button
                  onClick={() => setShowTranslations(!showTranslations)}
                  className="px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {showTranslations ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{showTranslations ? 'Hide Translations' : 'Show Translations'}</span>
                </button>
              </div>

              {extractedContent.dialogueScript && extractedContent.dialogueScript.length > 0 ? (
                <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse table-auto">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-black text-[11px] uppercase tracking-wider border-b border-slate-300">
                          <th className="p-3 w-16 text-center border-r border-slate-200">Turn #</th>
                          <th className="p-3 w-36 border-r border-slate-200">Speaker</th>
                          <th className="p-3 border-r border-slate-200">Native Script ({language})</th>
                          {showTranslations && <th className="p-3 w-1/3">English Translation</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-sans">
                        {extractedContent.dialogueScript.map((line, i) => (
                          <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                            <td className="p-3 text-center font-bold text-slate-400 border-r border-slate-200 bg-slate-50/50">
                              {i + 1}
                            </td>
                            <td className="p-3 font-extrabold text-blue-900 border-r border-slate-200">
                              <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-[10px] text-center leading-6 font-black mr-2">
                                {line.speaker.charAt(0)}
                              </span>
                              {line.speaker}
                            </td>
                            <td className="p-3 font-bold text-slate-900 text-sm border-r border-slate-200 leading-relaxed">
                              {line.text}
                            </td>
                            {showTranslations && (
                              <td className="p-3 text-slate-600 italic bg-slate-50/30">
                                {line.translation || '—'}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl border border-slate-300 text-center text-xs text-slate-500">
                  No dialogue script rows found in this resource module.
                </div>
              )}
            </div>
          )}

          {/* SHEET 4: GRAMMAR ARCHITECTURE */}
          {activeSheet === 'grammar' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-amber-100/60 border-b border-amber-300/60 px-4 py-2.5">
                  <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-700" /> Syntactic Formulas & Usage Guidelines
                  </h3>
                </div>
                <div className="p-5 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-amber-50/30">
                  {extractedContent.grammarNotes || `Standard grammatical architecture for ${language} at ${level} level.`}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs space-y-2">
                  <h4 className="text-xs font-black text-emerald-800 flex items-center gap-1.5 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Core Rule Summary
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Always maintain proper verb conjugation and agreement rules tailored for {level} in {language}.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs space-y-2">
                  <h4 className="text-xs font-black text-rose-800 flex items-center gap-1.5 uppercase">
                    ⚠️ Syntactic Trap Avoidance
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Do not translate word-for-word from English; respect natural word-order sequences in {language}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SHEET 5: PRACTICE DRILLS & KEYS */}
          {activeSheet === 'exercises' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-300">
                <span className="text-xs font-black text-slate-800">
                  Practice Questions & Evaluation Key ({questions.length} Questions)
                </span>
                <button
                  onClick={() => setShowSolutions(!showSolutions)}
                  className="px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-emerald-700 font-extrabold text-xs transition-all cursor-pointer"
                >
                  {showSolutions ? 'Hide Answer Key' : 'Reveal Answer Key'}
                </button>
              </div>

              {questions.length > 0 ? (
                <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse table-auto">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-black text-[11px] uppercase tracking-wider border-b border-slate-300">
                          <th className="p-3 w-14 text-center border-r border-slate-200">Q #</th>
                          <th className="p-3 w-1/3 border-r border-slate-200">Question Prompt</th>
                          <th className="p-3 border-r border-slate-200">Multiple Choice Options</th>
                          {showSolutions && <th className="p-3 w-1/4">Answer & Explanation</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-sans">
                        {questions.map((q, i) => (
                          <tr key={q.id || i} className="hover:bg-emerald-50/40 transition-colors">
                            <td className="p-3 text-center font-bold text-slate-400 border-r border-slate-200 bg-slate-50/50">
                              Q{i + 1}
                            </td>
                            <td className="p-3 font-bold text-slate-900 border-r border-slate-200 leading-relaxed">
                              {q.question}
                            </td>
                            <td className="p-3 border-r border-slate-200">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {q.options.map((opt, oIdx) => {
                                  const isSel = selectedAnswers[q.id] === opt;
                                  const isCorrect = q.answer === opt;
                                  return (
                                    <button
                                      key={oIdx}
                                      onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                      className={`p-1.5 rounded text-[11px] text-left border transition-all ${
                                        showSolutions && isCorrect
                                          ? 'bg-emerald-600 text-white font-bold border-emerald-600'
                                          : isSel
                                          ? 'bg-blue-600 text-white font-bold border-blue-600'
                                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      <span className="font-mono mr-1.5 opacity-70">[{String.fromCharCode(65 + oIdx)}]</span>
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </td>
                            {showSolutions && (
                              <td className="p-3 text-slate-700 bg-emerald-50/50 font-medium space-y-1">
                                <span className="text-emerald-800 font-black block">✓ Correct: {q.answer}</span>
                                {q.explanation && <p className="text-[11px] text-slate-600">{q.explanation}</p>}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl border border-slate-300 text-center text-xs text-slate-500">
                  No practice questions recorded for this module.
                </div>
              )}
            </div>
          )}

        </div>

        {/* EXCEL BOTTOM SHEET TABS BAR */}
        <div className="bg-slate-200 border-t border-slate-300 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto shrink-0 select-none">
          <div className="flex items-center gap-1">
            {sheets.map((sheet) => {
              const Icon = sheet.icon;
              const isActive = activeSheet === sheet.id;
              return (
                <button
                  key={sheet.id}
                  onClick={() => setActiveSheet(sheet.id)}
                  className={`px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-2 border-t-2 rounded-t-md cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#107C41] border-[#107C41] shadow-2xs'
                      : 'bg-slate-300/80 hover:bg-slate-100 text-slate-600 border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#107C41]' : 'text-slate-500'}`} />
                  <span>{sheet.label}</span>
                  {typeof sheet.count === 'number' && sheet.count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-400/40 text-slate-700'
                    }`}>
                      {sheet.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-bold text-slate-500 hidden sm:block">
            ISML Academic Spreadsheet Engine
          </div>
        </div>

      </div>
    </div>
  );
}
