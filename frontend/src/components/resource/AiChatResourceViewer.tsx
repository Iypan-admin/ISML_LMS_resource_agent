"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Resource } from '@/types/resource';
import { 
  Bot, 
  User, 
  ArrowLeft, 
  Copy, 
  Check, 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  List, 
  HelpCircle, 
  CheckSquare, 
  Archive, 
  Tag, 
  Layers,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  FileText,
  Volume2
} from 'lucide-react';
import { useResources } from '@/context/ResourceContext';

interface AiChatResourceViewerProps {
  resource: Resource;
}

export default function AiChatResourceViewer({ resource }: AiChatResourceViewerProps) {
  const router = useRouter();
  const { archiveResource } = useResources();
  const [isCopied, setIsCopied] = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);
  const [showDrillAnswers, setShowDrillAnswers] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const topic = resource.academicContext.topic || resource.title;
  const language = resource.academicContext.language;
  const level = resource.academicContext.level;
  const skill = resource.academicContext.skill || 'General Fluency';
  const category = resource.category || resource.academicContext.topic || 'Masterclass Guide';

  // Extract content payload
  const bodyText = resource.content?.body || resource.description;
  const dialogueScript = resource.content?.dialogueScript || [];
  const vocabularyList = resource.content?.vocabularyList || [];
  const grammarNotes = Array.isArray(resource.content?.grammarNotes)
    ? resource.content?.grammarNotes.join('\n')
    : (resource.content?.grammarNotes || '');
  const questions = resource.content?.questions || [];

  const handleCopy = () => {
    let copyText = `======================================\n`;
    copyText += `🤖 ISML AI STUDY GUIDE: ${resource.title}\n`;
    copyText += `Language: ${language} | Level: ${level} | Skill: ${skill}\n`;
    copyText += `======================================\n\n`;
    copyText += `${bodyText}\n\n`;

    if (dialogueScript.length > 0) {
      copyText += `--- SITUATIONAL DIALOGUE SCRIPT ---\n`;
      dialogueScript.forEach((d: any) => {
        copyText += `${d.speaker}: ${d.text}\n`;
        if (d.translation) copyText += `   (English: ${d.translation})\n`;
      });
      copyText += `\n`;
    }

    if (vocabularyList.length > 0) {
      copyText += `--- TARGET VOCABULARY BANK ---\n`;
      vocabularyList.forEach((v: any, idx: number) => {
        copyText += `${idx + 1}. ${v.word} [${v.partOfSpeech || 'word'}] = ${v.translation}\n`;
        if (v.example) copyText += `   Example: ${v.example}\n`;
      });
      copyText += `\n`;
    }

    navigator.clipboard.writeText(copyText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Advanced Markdown Body Parser for ChatBot UI
  const renderMarkdownContent = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    let inTable = false;
    let tableRows: string[][] = [];
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];

    const renderedElements: React.ReactNode[] = [];

    const flushTable = (key: string) => {
      if (tableRows.length === 0) return;
      const headers = tableRows[0];
      const rows = tableRows.slice(1);

      renderedElements.push(
        <div key={`table-${key}`} className="my-4 overflow-x-auto border border-slate-700/80 rounded-2xl bg-slate-900/90 shadow-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1E293B] text-cyan-300 font-extrabold border-b border-slate-700">
                {headers.map((h, i) => (
                  <th key={i} className="p-3 border-r border-slate-700/60 last:border-r-0">
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/60 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 border-r border-slate-800/60 last:border-r-0">
                      {cell.trim().replace(/\*\*(.*?)\*\*/g, '$1')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    };

    const flushCodeBlock = (key: string) => {
      if (codeBlockLines.length === 0) return;
      renderedElements.push(
        <div key={`code-${key}`} className="my-4 p-4 rounded-2xl bg-slate-950 border border-purple-500/30 font-mono text-xs text-purple-200 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between text-[10px] text-purple-400 font-sans uppercase font-bold border-b border-purple-900/50 pb-2 mb-2">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-purple-400" /> Dialogue & Pronunciation Script
            </span>
          </div>
          {codeBlockLines.map((l, idx) => (
            <div key={idx} className="leading-relaxed">
              {l}
            </div>
          ))}
        </div>
      );
      codeBlockLines = [];
      inCodeBlock = false;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check code blocks
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock(`code-end-${idx}`);
        } else {
          if (inTable) flushTable(`tb-before-code-${idx}`);
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Check Markdown Tables (| col | col |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        // Skip separator lines like |---|---|
        if (/^\|[\s\-:|]+\|$/.test(trimmed)) return;
        const cells = trimmed.split('|').slice(1, -1);
        tableRows.push(cells);
        inTable = true;
        return;
      } else if (inTable) {
        flushTable(`tb-end-${idx}`);
      }

      if (!trimmed) {
        renderedElements.push(<div key={`space-${idx}`} className="h-2" />);
        return;
      }

      // Horizontal dividers
      if (trimmed === '---') {
        renderedElements.push(
          <div key={`hr-${idx}`} className="my-6 border-b border-slate-800" />
        );
        return;
      }

      // Headers # ## ###
      if (trimmed.startsWith('# ')) {
        renderedElements.push(
          <h1 key={idx} className="text-lg sm:text-xl font-black text-white pt-4 pb-2 border-b border-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            {trimmed.replace(/^#\s+/, '')}
          </h1>
        );
        return;
      }
      if (trimmed.startsWith('## ')) {
        renderedElements.push(
          <h2 key={idx} className="text-base sm:text-lg font-black text-cyan-300 pt-5 pb-1 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
            {trimmed.replace(/^##\s+/, '')}
          </h2>
        );
        return;
      }
      if (trimmed.startsWith('### ')) {
        renderedElements.push(
          <h3 key={idx} className="text-sm font-extrabold text-purple-300 pt-4 pb-1 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />
            {trimmed.replace(/^#{3}\s+/, '')}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('#### ')) {
        renderedElements.push(
          <h4 key={idx} className="text-xs font-bold text-amber-300 uppercase tracking-wider pt-3 pb-1">
            {trimmed.replace(/^#{4}\s+/, '')}
          </h4>
        );
        return;
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletText = trimmed.replace(/^[-*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1');
        renderedElements.push(
          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 font-medium pl-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-2" />
            <span className="leading-relaxed">{bulletText}</span>
          </div>
        );
        return;
      }

      // Ordered list (1. 2.)
      if (/^\d+\.\s/.test(trimmed)) {
        const numText = trimmed.replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '$1');
        const numMatch = trimmed.match(/^(\d+)\./);
        const num = numMatch ? numMatch[1] : '•';
        renderedElements.push(
          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 font-medium pl-2 py-1">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-extrabold text-[10px] shrink-0 mt-0.5">
              {num}
            </span>
            <span className="leading-relaxed">{numText}</span>
          </div>
        );
        return;
      }

      // Special Instruction or Alert callouts
      if (trimmed.includes('Special Instructions') || trimmed.includes('Custom Instructions')) {
        renderedElements.push(
          <div key={idx} className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs text-purple-200 font-sans italic">
            ✨ {trimmed.replace(/\*\*(.*?)\*\*/g, '$1')}
          </div>
        );
        return;
      }

      // General Paragraph text
      const cleanLine = trimmed.replace(/\*\*(.*?)\*\*/g, '$1');
      renderedElements.push(
        <p key={idx} className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          {cleanLine}
        </p>
      );
    });

    if (inTable) flushTable('end-doc');
    if (inCodeBlock) flushCodeBlock('end-doc');

    return renderedElements;
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto pb-12 animate-fade-in">
      
      {/* Top Bar Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <button
          onClick={() => router.push('/resources')}
          className="flex items-center gap-1.5 text-xs font-extrabold text-[#0052CC] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Resource Library
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied!' : 'Copy Study Material'}</span>
          </button>

          <button
            onClick={() => {
              if (confirm(`Archive "${resource.title}"?`)) {
                archiveResource(resource.id);
                router.push('/resources');
              }
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            title="Archive Resource"
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CHATBOT UI / UX CONTAINER */}
      <div className="rounded-3xl border border-slate-800 bg-[#071730] shadow-2xl overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-6 py-4 bg-[#0B2447] border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white">ISML AI Study Assistant</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Validated AI Resource
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Interactive Foreign Language Study Guide Viewer</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-black">
              {language}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs font-black">
              Level {level}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-black">
              {skill}
            </span>
          </div>
        </div>

        {/* Chat Messages Stream View */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* USER CHAT BUBBLE */}
          <div className="flex items-start justify-end gap-3">
            <div className="max-w-2xl bg-[#0052CC] text-white p-4 sm:p-5 rounded-2xl rounded-tr-xs shadow-md space-y-2">
              <div className="flex items-center justify-between text-[11px] text-blue-200 font-bold border-b border-white/20 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> User Topic Request
                </span>
                <span>{language} ({level})</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                Generate study material for: "{topic}"
              </p>
              <div className="flex items-center gap-2 pt-1 text-[10px] text-blue-100 font-mono">
                <span>Category: {category}</span>
                <span>•</span>
                <span>Target Skill: {skill}</span>
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm shrink-0 mt-1">
              U
            </div>
          </div>

          {/* AI ASSISTANT RESPONSE BUBBLE */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shrink-0 mt-1">
              <Bot className="w-5 h-5" />
            </div>

            <div className="flex-1 bg-[#0D1F3C] border border-slate-800 rounded-3xl rounded-tl-xs p-5 sm:p-7 shadow-xl space-y-6">
              
              {/* Material Header Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-slate-900 border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Study Guide Masterclass
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">ID: {resource.id}</span>
                </div>
                <h3 className="text-base sm:text-xl font-black text-white leading-snug">
                  {resource.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {resource.description}
                </p>
              </div>

              {/* DIRECT FULL ANSWER CONTENT */}
              <div className="space-y-4">
                {renderMarkdownContent(bodyText)}
              </div>

              {/* DIALOGUE SCRIPT (If structured separately) */}
              {dialogueScript.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-cyan-400" /> Situational Dialogue Script
                    </h4>
                    <button
                      onClick={() => setShowTranslations(!showTranslations)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      {showTranslations ? 'Hide Translations' : 'Show Translations'}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {dialogueScript.map((line: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <span className="text-xs font-extrabold text-cyan-400">{line.speaker}:</span>
                        <p className="text-xs sm:text-sm font-bold text-white">{line.text}</p>
                        {showTranslations && line.translation && (
                          <p className="text-xs text-slate-400 italic">🇬🇧 {line.translation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VOCABULARY BANK (If structured separately) */}
              {vocabularyList.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
                    <List className="w-4 h-4 text-purple-400" /> Target Vocabulary Bank ({vocabularyList.length} Terms)
                  </h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/80">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-800/80 text-cyan-300 font-extrabold border-b border-slate-700">
                          <th className="p-3">#</th>
                          <th className="p-3">Target Word</th>
                          <th className="p-3">Part of Speech</th>
                          <th className="p-3">English Translation</th>
                          <th className="p-3">Example Usage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
                        {vocabularyList.map((item: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-800/50">
                            <td className="p-3 text-slate-500 font-bold">{i + 1}</td>
                            <td className="p-3 font-extrabold text-white">{item.word}</td>
                            <td className="p-3 text-slate-400">{item.partOfSpeech || 'word'}</td>
                            <td className="p-3 text-cyan-300 font-bold">{item.translation}</td>
                            <td className="p-3 text-slate-400 italic">{item.example || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* GRAMMAR NOTES (If structured separately) */}
              {grammarNotes && (
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" /> Grammar Rules & Syntax
                  </h4>
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs sm:text-sm text-slate-200 font-medium leading-relaxed whitespace-pre-line">
                    {grammarNotes}
                  </div>
                </div>
              )}

              {/* PRACTICE QUESTIONS (If structured separately) */}
              {questions.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-400" /> Assessment & Practice Drills ({questions.length})
                    </h4>
                    <button
                      onClick={() => setShowDrillAnswers(!showDrillAnswers)}
                      className="text-xs font-bold text-emerald-400 hover:underline"
                    >
                      {showDrillAnswers ? 'Hide Solutions' : 'Reveal Solutions'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {questions.map((q: any, qIdx: number) => (
                      <div key={q.id || qIdx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                        <p className="text-xs sm:text-sm font-bold text-white">
                          Q{qIdx + 1}: {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(q.options || []).map((opt: string, oIdx: number) => {
                            const isSelected = selectedAnswers[q.id] === opt;
                            const isCorrect = q.answer === opt;
                            let style = "bg-slate-800/80 border-slate-700 text-slate-300";
                            if (showDrillAnswers) {
                              if (isCorrect) style = "bg-emerald-950 border-emerald-500 text-emerald-200 font-bold";
                              else if (isSelected && !isCorrect) style = "bg-rose-950 border-rose-500 text-rose-200 font-bold";
                            } else if (isSelected) {
                              style = "bg-blue-900 border-blue-500 text-white font-bold";
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                className={`p-2.5 rounded-xl border text-xs text-left font-medium transition-all cursor-pointer ${style}`}
                              >
                                {String.fromCharCode(65 + oIdx)}. {opt}
                              </button>
                            );
                          })}
                        </div>
                        {showDrillAnswers && (
                          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 font-medium">
                            ✓ Answer: {q.answer} {q.explanation && `— ${q.explanation}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Footer Callout */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Complete Masterclass Study Guide Ready
                </span>
                <button
                  onClick={handleCopy}
                  className="hover:text-cyan-300 font-bold cursor-pointer transition-colors"
                >
                  Copy Material to Clipboard
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
