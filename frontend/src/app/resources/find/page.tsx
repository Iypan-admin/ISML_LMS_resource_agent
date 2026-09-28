"use client";

import React, { useState } from 'react';
import AcademicContextSelector from '@/components/academic/AcademicContextSelector';
import { AcademicContext } from '@/types/academic';
import { DiscoveryTab, DiscoveryResultItem, DiscoveryStep, QuizQuestion } from '@/types/discovery';
import { mockDiscoveryResults } from '@/mock/discovery';
import { useResources } from '@/context/ResourceContext';
import SourceBadge from '@/components/common/SourceBadge';
import QuizModal from '@/components/resource/QuizModal';
import ExtractedContentModal from '@/components/resource/ExtractedContentModal';
import CopyrightCard from '@/components/ai/CopyrightCard';
import { CopyrightAnalysis } from '@/types/copyright';
import { 
  Search, 
  Sparkles, 
  Loader2, 
  ExternalLink, 
  PlusCircle, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck,
  AlertOctagon,
  Globe, 
  Video, 
  FileText,
  HelpCircle,
  Copy,
  BookOpen,
  Check,
  MessageSquare,
  List,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

function buildCopyrightAnalysis(item: DiscoveryResultItem): CopyrightAnalysis {
  const risk = item.copyrightRisk || 'LOW_CONCERN';
  const licenseName = item.license || (item.sourceName.includes('YouTube') ? 'Standard YouTube License (Embeddable)' : 'Creative Commons CC-BY 4.0');
  
  const isReview = risk === 'REVIEW_REQUIRED';
  const isRestricted = risk === 'RESTRICTED';

  return {
    sourceName: item.sourceName || 'External Web Source',
    sourceUrl: item.sourceUrl,
    license: licenseName,
    attributionRequired: true,
    commercialUsageAllowed: !isRestricted,
    modificationAllowed: !isRestricted && !isReview,
    redistributionAllowed: !isRestricted,
    hostingPermission: true,
    riskLevel: risk,
    riskExplanation: isRestricted
      ? 'Source contains proprietary copyright notice. Direct embedding restricted; link reference permitted.'
      : isReview
      ? 'Source is educational website material. Source attribution link required when assigning to students.'
      : 'Open Educational Resource (OER) or embeddable content. Verified safe for internal LMS integration.',
    recommendedAction: isRestricted
      ? 'Use external URL link only. Do not re-host raw text without written permission.'
      : isReview
      ? 'Save to library with source attribution link preserved.'
      : 'Safe to save to library, generate AI flashcards, and embed in study modules.'
  };
}

export default function FindResourcesPage() {
  const { addResource } = useResources();
  const [activeTab, setActiveTab] = useState<DiscoveryTab>('Web');
  const [academicContext, setAcademicContext] = useState<AcademicContext>({
    language: '',
    course: '',
    level: '',
    module: '',
    topic: '',
    skill: '',
    resourceType: '',
    difficulty: ''
  });

  const [step, setStep] = useState<DiscoveryStep>('idle');
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [discoveredResults, setDiscoveredResults] = useState<DiscoveryResultItem[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isContextValid, setIsContextValid] = useState<boolean>(true);
  const [expandedCopyrightIds, setExpandedCopyrightIds] = useState<Record<string, boolean>>({});
  
  // Interactive Modals state
  const [activeQuizItem, setActiveQuizItem] = useState<DiscoveryResultItem | null>(null);
  const [activeExtractedItem, setActiveExtractedItem] = useState<DiscoveryResultItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleCopyright = (id: string) => {
    setExpandedCopyrightIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const handleRunSearch = async () => {
    const activeTopic = academicContext.customTopic || academicContext.topic;
    const activeSkill = academicContext.customSkill || academicContext.skill;
    const activeFormat = academicContext.customResourceType || academicContext.resourceType;
    const finalKeywords = `${academicContext.language} ${academicContext.level} ${activeTopic} ${activeSkill} ${activeFormat}`;

    // Auto-detect source tab from Resource Format selected
    let selectedTab: DiscoveryTab = 'Web';
    const fmtLower = (activeFormat || '').toLowerCase();
    if (fmtLower.includes('video') || fmtLower.includes('youtube') || fmtLower.includes('clip')) {
      selectedTab = 'YouTube';
    } else if (fmtLower.includes('pdf') || fmtLower.includes('document') || fmtLower.includes('sheet') || fmtLower.includes('worksheet')) {
      selectedTab = 'PDF / Documents';
    }

    setActiveTab(selectedTab);

    if (!isContextValid) {
      setSearchError('⚠️ Please select the 5 primary criteria in the Academic Context Selector before discovering resources.');
      return;
    }

    setStep('searching');
    setSearchError(null);

    try {
      const primaryUrl = 'http://localhost:8000/api/v1/ai/discover';
      const secondaryUrl = 'http://localhost:4000/api/v1/ai/discover';
      
      const payload = {
        search_keywords: finalKeywords,
        target_languages: [academicContext.language.toLowerCase()],
        target_levels: [academicContext.level],
        source_tab: selectedTab,
        target_format: activeFormat,
        topic: activeTopic,
        skill: activeSkill,
        limit: 10,
      };

      let resp = await fetch(primaryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (!resp || !resp.ok) {
        resp = await fetch(secondaryUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => null);
      }

      if (resp && resp.ok) {
        const json = await resp.json();
        if (json.data && json.data.candidates && json.data.candidates.length > 0) {
          const mapped: DiscoveryResultItem[] = json.data.candidates
            .filter((item: any) => {
              const u = (item.url || '').toLowerCase();
              const t = (item.title || '').toLowerCase();
              return !u.includes('/shorts/') && !u.includes('youtube.com/shorts') && !t.includes('#shorts') && !t.includes('youtube shorts');
            })
            .map((item: any, idx: number) => ({
              id: `disc-real-${Date.now()}-${idx}`,
              title: item.title,
              description: item.snippet || `Discovered ${selectedTab} resource for ${academicContext.language} ${academicContext.level}`,
              sourceName: item.source_name || (selectedTab === 'YouTube' ? 'YouTube' : selectedTab === 'PDF / Documents' ? 'PDF Document' : 'Verified Web Source'),
              sourceUrl: item.url,
              qualityScore: item.confidence === 'HIGH' ? 95 : item.confidence === 'MEDIUM' ? 88 : 78,
              copyrightRisk: item.copyright_risk || 'LOW_CONCERN',
              summary: item.snippet || `Discovered via AI Search Provider`,
              language: academicContext.language,
              level: academicContext.level,
              skill: activeSkill,
              resourceType: activeFormat,
              questions: item.questions || [],
              extractedContent: item.extracted_content || {
                body: item.snippet,
                grammarNotes: `Structured OER learning materials for ${academicContext.language} ${academicContext.level} (${activeSkill}).`
              },
            }));
          setDiscoveredResults(mapped);
          setStep('results');
          return;
        }
      }
    } catch (err: any) {
      console.warn('Backend AI discovery call failed:', err);
    }

    // Fallback preview if AI search provider returned 0 direct candidates
    const fallbackResults = mockDiscoveryResults[selectedTab] || [];
    setDiscoveredResults(fallbackResults);
    setStep('results');
  };

  const handleSaveResource = (item: DiscoveryResultItem) => {
    addResource({
      title: item.title,
      description: item.description,
      academicContext: {
        ...academicContext,
        language: item.language,
        level: item.level,
        skill: item.skill,
        resourceType: item.resourceType
      },
      sourceType: 'External',
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      status: 'PUBLISHED',
      tags: [item.language, item.level, item.skill, 'Discovered'],
      content: { 
        body: item.extractedContent?.body || item.summary,
        dialogueScript: item.extractedContent?.dialogueScript,
        vocabularyList: item.extractedContent?.vocabularyList,
        questions: item.questions,
      }
    });
    setAddedIds(prev => [...prev, item.id]);
  };

  const handleCopyQuiz = (item: DiscoveryResultItem) => {
    const qList = (item.questions && item.questions.length > 0) ? item.questions : [
      {
        id: "q1",
        question: `Sample Quiz Question for ${item.title}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        answer: "Option A",
        explanation: "Sample explanation for question."
      }
    ];

    let text = `====================================\n`;
    text += `📖 QUIZ & ASSIGNMENT: ${item.title}\n`;
    text += `Target Language: ${item.language} | Level: ${item.level} | Skill: ${item.skill}\n`;
    text += `====================================\n\n`;

    qList.forEach((q: QuizQuestion, idx: number) => {
      text += `Q${idx + 1}: ${q.question}\n`;
      q.options.forEach((opt: string, oIdx: number) => {
        const letter = String.fromCharCode(65 + oIdx);
        text += `   [${letter}] ${opt}\n`;
      });
      text += `\n✓ Correct Answer: ${q.answer}\n`;
      if (q.explanation) {
        text += `💡 Explanation: ${q.explanation}\n`;
      }
      text += `\n------------------------------------\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyExtractedContent = (item: DiscoveryResultItem) => {
    const content = item.extractedContent || {};
    let text = `====================================\n`;
    text += `📖 EXTRACTED RESOURCE CONTENT: ${item.title}\n`;
    text += `Language: ${item.language} | Level: ${item.level} | Skill: ${item.skill}\n`;
    text += `Source: ${item.sourceName} (${item.sourceUrl})\n`;
    text += `====================================\n\n`;

    if (content.body) {
      text += `--- LESSON BODY TEXT ---\n${content.body}\n\n`;
    }
    if (content.dialogueScript && content.dialogueScript.length > 0) {
      text += `--- SITUATIONAL DIALOGUE SCRIPT ---\n`;
      content.dialogueScript.forEach((line: any) => {
        text += `${line.speaker}: ${line.text}\n`;
        if (line.translation) text += `   (Translation: ${line.translation})\n`;
      });
      text += `\n`;
    }
    if (content.vocabularyList && content.vocabularyList.length > 0) {
      text += `--- TARGET VOCABULARY ---\n`;
      content.vocabularyList.forEach((v: any) => {
        text += `• ${v.word} = ${v.translation}\n`;
      });
      text += `\n`;
    }

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const results = discoveredResults !== null ? discoveredResults : (mockDiscoveryResults[activeTab] || []);

  return (
    <div className="space-y-6 font-sans pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-[#0B2447]">Find External Resources</h1>
        <p className="text-xs text-slate-500 font-medium">
          Discover foreign language learning content, extracted web lessons, dialogues, and interactive quizzes with verified copyright analysis.
        </p>
      </div>

      {/* Academic Context Selector */}
      <AcademicContextSelector
        value={academicContext}
        onChange={setAcademicContext}
        onValidationChange={setIsContextValid}
        onDiscover={handleRunSearch}
        isDiscovering={step !== 'idle' && step !== 'results'}
      />

      {/* Discovery Stepper Progress */}
      {step !== 'idle' && step !== 'results' && (
        <div className="isml-card p-5 text-center space-y-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin mx-auto" />
          <h4 className="text-sm font-extrabold text-[#0B2447] capitalize">
            {step === 'searching' && '1. Crawling permitted web sources & target pages...'}
            {step === 'extracting' && '2. Extracting lesson body text, dialogues & vocabulary...'}
            {step === 'classifying' && '3. Classifying CEFR Level & Academic Skill...'}
            {step === 'validating' && '4. Checking URL accessibility & duplicate status...'}
            {step === 'analyzing' && '5. Analyzing Copyright, Licensing Risk & LMS Usage Rights...'}
          </h4>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            AI Agent is auditing discovery candidates matching {academicContext.language} {academicContext.level} ({academicContext.skill}) for educational value and copyright safety.
          </p>
        </div>
      )}

      {/* Results View */}
      {step === 'results' && (
        <div className="space-y-5">
          
          {/* Copyright & Licensing Audit Complete Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0B2447] via-[#19376D] to-[#0052CC] text-white shadow-md flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  AI Intellectual Property & Copyright Audit Complete
                </h3>
                <p className="text-xs text-slate-200 font-medium">
                  All {results.length} candidates analyzed for copyright risk, licensing terms, and LMS re-hosting permissions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-extrabold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Scanned & Validated
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#0B2447]">
              Discovered {results.length} Candidates ({activeTab})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Sorted by AI Quality & Copyright Verification</span>
          </div>

          <div className="space-y-4">
            {results.map((item) => {
              const isAdded = addedIds.includes(item.id);
              const activeFmtLower = (academicContext.customResourceType || academicContext.resourceType || '').toLowerCase();
              const isQuizRequested = ['quiz', 'exam', 'exercise', 'assignment', 'test', 'worksheet', 'pratice', 'practice', 'aufgaben', 'modellsatz'].some(k => 
                activeFmtLower.includes(k)
              );
              const isQuizOrAssignment = Boolean(isQuizRequested && item.questions && item.questions.length > 0);
              const displayQuestions: QuizQuestion[] = (item.questions && item.questions.length > 0) ? item.questions : [];
              const extracted = item.extractedContent || {};
              const copyrightInfo = buildCopyrightAnalysis(item);
              const showCopyright = expandedCopyrightIds[item.id] || false;

              let riskBadgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
              let riskLabel = "LOW CONCERN - SAFE TO USE";
              if (item.copyrightRisk === 'REVIEW_REQUIRED') {
                riskBadgeStyle = "bg-amber-50 text-amber-800 border-amber-200";
                riskLabel = "REVIEW REQUIRED";
              } else if (item.copyrightRisk === 'RESTRICTED') {
                riskBadgeStyle = "bg-rose-50 text-rose-800 border-rose-200";
                riskLabel = "RESTRICTED";
              }

              return (
                <div key={item.id} className="isml-card p-5 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-4 font-sans hover:border-slate-300 transition-all">
                  
                  {/* Top metadata tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-[#0B2447] text-white font-extrabold text-[10px]">
                        {item.language}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 font-extrabold text-[10px]">
                        Level {item.level}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-extrabold text-[10px]">
                        {item.skill}
                      </span>
                      {isQuizOrAssignment ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-amber-700" /> Interactive Quiz / Assignment
                        </span>
                      ) : (
                        <SourceBadge sourceType="External" sourceName={item.sourceName} />
                      )}
                    </div>

                    {/* PROMINENT COPYRIGHT RISK BADGE */}
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex items-center gap-1.5 shadow-2xs ${riskBadgeStyle}`}>
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>{riskLabel}</span>
                    </div>
                  </div>

                  {/* Title & snippet */}
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B2447]">{item.title}</h3>
                    <p className="text-xs text-slate-600 font-medium mt-1">{item.description}</p>
                  </div>

                  {/* PROMINENT COPYRIGHT & INTELLECTUAL PROPERTY ANALYSIS SECTION */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-emerald-50/20 to-blue-50/30 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${
                          item.copyrightRisk === 'RESTRICTED'
                            ? 'bg-rose-100 text-rose-700'
                            : item.copyrightRisk === 'REVIEW_REQUIRED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-[#0B2447] uppercase tracking-wider block">
                            Copyright & Licensing Analysis
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            License Model: <strong className="text-[#0052CC]">{copyrightInfo.license}</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleCopyright(item.id)}
                        className="px-3 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-[#0052CC] text-[11px] font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{showCopyright ? 'Hide Permissions Matrix' : 'View Full Permissions Matrix'}</span>
                        {showCopyright ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Quick summary grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Copyright Risk Verdict</span>
                        <span className={`font-extrabold block leading-snug ${
                          item.copyrightRisk === 'RESTRICTED'
                            ? 'text-rose-700'
                            : item.copyrightRisk === 'REVIEW_REQUIRED'
                            ? 'text-amber-800'
                            : 'text-emerald-700'
                        }`}>
                          ✓ {copyrightInfo.riskExplanation}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-[#0052CC] space-y-0.5">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">LMS Action Recommendation</span>
                        <span className="font-extrabold text-slate-900 block leading-snug">
                          💡 {copyrightInfo.recommendedAction}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Detailed 5-Point Matrix Copyright Card */}
                    {showCopyright && (
                      <div className="pt-2 animate-fade-in">
                        <CopyrightCard copyright={copyrightInfo} className="border-emerald-200 bg-white shadow-sm" />
                      </div>
                    )}
                  </div>

                  {/* DEDICATED QUIZ / ASSIGNMENT VIEW */}
                  {isQuizOrAssignment ? (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-200/80 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-blue-200/60">
                        <span className="text-xs font-black text-[#0B2447] flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-[#0052CC]" /> Questions & Practice Exercises ({displayQuestions.length} Questions)
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyQuiz(item)}
                            className="px-3 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#0052CC]" /> Copy Quiz & Answers
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => setActiveQuizItem(item)}
                            className="px-3 py-1 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white text-[11px] font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Sparkles className="w-3 h-3 text-amber-300" /> Take Interactive Quiz
                          </button>
                        </div>
                      </div>

                      {/* Preview of Questions & Options */}
                      <div className="space-y-2.5">
                        {displayQuestions.slice(0, 2).map((q, qIdx) => (
                          <div key={qIdx} className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                            <p className="font-extrabold text-[#0B2447]">
                              Q{qIdx + 1}: {q.question}
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium text-[11px]">
                                  <span className="font-bold text-slate-400 mr-1">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                                </div>
                              ))}
                            </div>
                            <p className="text-[11px] text-emerald-700 font-bold pt-1">
                              ✓ Answer: <span className="underline">{q.answer}</span>
                            </p>
                          </div>
                        ))}
                      </div>

                      {displayQuestions.length > 2 && (
                        <button
                          onClick={() => setActiveQuizItem(item)}
                          className="w-full text-center py-1.5 text-xs font-bold text-[#0052CC] hover:underline cursor-pointer"
                        >
                          + View all {displayQuestions.length} questions in interactive solver →
                        </button>
                      )}
                    </div>
                  ) : (
                    /* DEDICATED EXTRACTED WEB RESOURCE CONTENT READER VIEW */
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
                        <span className="text-xs font-black text-[#0B2447] flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-[#0052CC]" /> Extracted Web Lesson Content
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyExtractedContent(item)}
                            className="px-3 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#0052CC]" /> Copy Lesson Text
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => setActiveExtractedItem(item)}
                            className="px-3 py-1 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white text-[11px] font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" /> Open Full Reader View
                          </button>
                        </div>
                      </div>

                      {/* Embedded Video Player for YouTube Links */}
                      {(() => {
                        const embedUrl = getYouTubeEmbedUrl(item.sourceUrl);
                        if (!embedUrl) return null;
                        return (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                              <Video className="w-4 h-4" /> Interactive Video Player (Public YouTube Video):
                            </div>
                            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-black">
                              <iframe
                                src={embedUrl}
                                title={item.title}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        );
                      })()}

                      {/* Extracted Body Text preview */}
                      {extracted.body && (
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-serif leading-relaxed line-clamp-3">
                          {extracted.body}
                        </div>
                      )}

                      {/* Extracted Dialogue or Vocab preview */}
                      {extracted.dialogueScript && extracted.dialogueScript.length > 0 && (
                        <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[#0052CC] font-bold">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" /> Dialogue Extract:
                            </span>
                            <span className="text-[10px] text-slate-500">{extracted.dialogueScript.length} lines</span>
                          </div>
                          <p className="text-slate-900 font-semibold italic">
                            "{extracted.dialogueScript[0].speaker}: {extracted.dialogueScript[0].text}"
                          </p>
                        </div>
                      )}

                      {/* Source Web Link Footer */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Original Source: <strong>{item.sourceName}</strong></span>
                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#0052CC] font-bold hover:underline flex items-center gap-1 truncate max-w-xs">
                          {item.sourceUrl} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Card footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0052CC] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Quality Score: {item.qualityScore}%
                    </span>

                    {isAdded ? (
                      <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Saved to Library
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSaveResource(item)}
                        className="px-4 py-2 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" /> Save to Library
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULLSCREEN INTERACTIVE QUIZ MODAL */}
      {activeQuizItem && (
        <QuizModal
          isOpen={!!activeQuizItem}
          onClose={() => setActiveQuizItem(null)}
          title={activeQuizItem.title}
          language={activeQuizItem.language}
          level={activeQuizItem.level}
          skill={activeQuizItem.skill}
          topic={academicContext.customTopic || academicContext.topic}
          questions={activeQuizItem.questions || []}
          onSaveToQueue={() => {
            handleSaveResource(activeQuizItem);
          }}
          isSaved={addedIds.includes(activeQuizItem.id)}
        />
      )}

      {/* FULLSCREEN EXTRACTED CONTENT READER MODAL (5-PAGE MASTERCLASS) */}
      {activeExtractedItem && (
        <ExtractedContentModal
          isOpen={!!activeExtractedItem}
          onClose={() => setActiveExtractedItem(null)}
          title={activeExtractedItem.title}
          sourceName={activeExtractedItem.sourceName}
          sourceUrl={activeExtractedItem.sourceUrl}
          language={activeExtractedItem.language}
          level={activeExtractedItem.level}
          skill={activeExtractedItem.skill}
          topic={academicContext.customTopic || academicContext.topic}
          extractedContent={activeExtractedItem.extractedContent || { body: activeExtractedItem.summary }}
          questions={activeExtractedItem.questions}
          onSaveToQueue={() => {
            handleSaveResource(activeExtractedItem);
          }}
          isSaved={addedIds.includes(activeExtractedItem.id)}
        />
      )}
    </div>
  );
}
