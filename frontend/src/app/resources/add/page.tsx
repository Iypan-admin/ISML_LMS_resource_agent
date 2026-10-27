"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResources } from '@/context/ResourceContext';
import { 
  PlusCircle, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Tag, 
  BookOpen, 
  Globe, 
  Layers, 
  Loader2, 
  Trash2,
  Database,
  ArrowRight,
  School,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import {
  InstitutionType,
  SchoolCategoryKey,
  CollegeTrackKey,
  SCHOOL_CATEGORIES,
  SCHOOL_LEVEL_SCHEDULES,
  COLLEGE_TRACKS,
  COLLEGE_LEVEL_SCHEDULES,
  getSchoolSchedule,
  getCollegeSchedule
} from '@/app/faculty/studio/institutionalSchedules';

const CATEGORY_PRESETS = [
  'Grammar & Vocab',
  'Exam Preparation',
  'Comprehensive',
  'Study Notes',
  'Dictionary',
  'Video Lessons',
  'Practice Tests',
  'Flashcards',
  'Kanji',
  'Study Materials'
];

interface BulkRowItem {
  tutorName: string;
  category: string;
  title: string;
  level: string;
  purpose: string;
  link: string;
  language: string;
}

export default function AddResourcePage() {
  const router = useRouter();
  const { addResource } = useResources();

  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Institution Stream: SCHOOL vs COLLEGE
  const [institutionType, setInstitutionType] = useState<InstitutionType>('SCHOOL');
  const [schoolCategory, setSchoolCategory] = useState<SchoolCategoryKey>('CAT_1');
  const [collegeTrack, setCollegeTrack] = useState<CollegeTrackKey>('STANDARD');

  // Single Form State
  const [singleForm, setSingleForm] = useState({
    tutorName: '',
    category: '',
    title: '',
    language: 'Spanish',
    level: 'A1.1',
    purpose: '',
    link: '',
  });

  // Bulk Upload State
  const [bulkRows, setBulkRows] = useState<BulkRowItem[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Parse CSV/TSV/JSON Helper
  const parseBulkContent = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return [];

    // 1. JSON Array parse check
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const jsonArr = JSON.parse(trimmed);
        if (Array.isArray(jsonArr)) {
          return jsonArr.map((item: any) => ({
            tutorName: item['Tutor Name'] || item.tutorName || item.tutor || 'ISML Academic Tutor',
            category: item['Resource Category'] || item.category || 'General Material',
            title: item['Resource Name'] || item.title || item.name || 'Untitled Resource',
            level: item['Level'] || item.level || (institutionType === 'SCHOOL' ? 'A1.1' : 'A1'),
            purpose: item['Purpose'] || item.purpose || item.description || '',
            link: item['Link'] || item.link || item.sourceUrl || item.url || '',
            language: item['Language'] || item.language || (item.title?.toLowerCase().includes('japanese') || (item['Resource Category'] || '').toLowerCase().includes('jlpt') ? 'Japanese' : 'German'),
          }));
        }
      } catch (e) {}
    }

    // 2. CSV / TSV Parsing
    const lines = trimmed.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];

    const delimiter = lines[0].includes('\t') ? '\t' : ',';

    const parseRow = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const allRows = lines.map(parseRow);
    if (allRows.length === 0) return [];

    const firstRow = allRows[0].map(c => c.toLowerCase());
    const hasHeader = firstRow.some(c => c.includes('tutor') || c.includes('resource') || c.includes('level') || c.includes('purpose') || c.includes('link'));

    const dataRows = hasHeader ? allRows.slice(1) : allRows;

    return dataRows.map(row => {
      const colA = row[0] || '';
      const colB = row[1] || '';
      const colC = row[2] || '';
      const colD = row[3] || '';
      const colE = row[4] || '';
      const colF = row[5] || '';

      const isUrlInA = colA.startsWith('http');
      const title = isUrlInA ? colB || colA : (colC || colA || 'Untitled Resource');
      const tutorName = isUrlInA ? 'ISML Academic Tutor' : colA;
      const category = colB || 'General Material';
      const level = colD || (institutionType === 'SCHOOL' ? 'A1.1' : 'A1');
      const purpose = colE || '';
      const link = colF || (colA.startsWith('http') ? colA : colC.startsWith('http') ? colC : '');

      const isJp = title.toLowerCase().includes('jlpt') || title.toLowerCase().includes('kanji') || category.toLowerCase().includes('jlpt') || level.toLowerCase().includes('n5');

      return {
        tutorName: tutorName || 'ISML Academic Tutor',
        category: category || 'Grammar & Vocab',
        title,
        level: level || (institutionType === 'SCHOOL' ? 'A1.1' : 'A1'),
        purpose: purpose || 'Learning resource catalog entry.',
        link,
        language: isJp ? 'Japanese' : 'German',
      };
    }).filter(r => r.title.length > 0 && r.title.toLowerCase() !== 'resource name');
  };

  // Download Sample Template CSV
  const handleDownloadSampleCSV = () => {
    const csvContent = `Tutor Name,Resource Category,Resource Name,Level,Purpose,Link
Bhmika Jain,Grammar & Vocab,JLPT Sensei,N5–N1,"Grammar lessons, vocabulary, kanji, and JLPT study materials",https://jlptsensei.com/
Bhmika Jain,Grammar & Vocab,Tae Kim's Guide to Japanese,Beginner-Interm,"Comprehensive guide to Japanese grammar and vocabulary",https://guidetojapanese.org/learn/tag/vocabulary/
Geetha(Trichy),Exam Preparation,Official JLPT Sample Questions,N5–N1,"Official sample questions for JLPT exam practice.",https://www.jlpt.jp/e/samples/sampleindex.html
Geetha(Trichy),Kanji,Kanshudo - Kanji Detail,N5–N1,"Detailed kanji explanations, meanings, readings, and examples.",https://www.kanshudo.com/
Hhmika Jain,Study Notes,JP Notes,Beginner-Interm,"Japanese grammar notes, vocabulary, and study materials.",https://jpnotes.app/en`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'isml_language_resources_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const parsed = parseBulkContent(content);
      if (parsed.length === 0) {
        setErrorMsg('Could not find valid rows in file. Please ensure it has Tutor Name, Category, Resource Name, Level, Purpose, Link columns.');
        setBulkRows([]);
      } else {
        setBulkRows(parsed);
        setSuccessMsg(`Successfully parsed ${parsed.length} catalog items from ${file.name}. Review below and click Save to Catalog.`);
      }
    };
    reader.readAsText(file);
  };

  // Single Form Submit
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.title.trim() || !singleForm.category || !singleForm.language || !singleForm.level) {
      setErrorMsg('Please select Category, Target Language, Level, and enter Resource Name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await addResource({
        title: singleForm.title,
        description: singleForm.purpose || `Learning resource catalog entry for ${singleForm.title}`,
        tutorName: singleForm.tutorName || 'ISML Academic Tutor',
        category: singleForm.category,
        purpose: singleForm.purpose,
        academicContext: {
          language: singleForm.language,
          course: `${singleForm.language} ${institutionType === 'SCHOOL' ? 'School Curriculum' : 'College Track'}`,
          level: singleForm.level,
          module: 'Module 1',
          topic: singleForm.category || 'General',
          skill: 'Speaking',
          resourceType: 'Web Portal / Page',
          difficulty: 'Beginner',
        },
        sourceType: 'Internal',
        sourceName: singleForm.tutorName ? `${singleForm.tutorName} (Tutor)` : 'Internal Catalog',
        sourceUrl: singleForm.link,
        status: 'Published',
        tags: [singleForm.language, singleForm.level, singleForm.category, institutionType],
      });

      setSuccessMsg(`✅ Successfully uploaded "${singleForm.title}" directly to database catalog!`);
      setSingleForm({
        tutorName: '',
        category: '',
        title: '',
        language: institutionType === 'SCHOOL' ? 'Spanish' : 'French',
        level: institutionType === 'SCHOOL' ? 'A1.1' : 'A1',
        purpose: '',
        link: '',
      });

      setTimeout(() => {
        router.push('/resources');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(`Failed to save resource: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Submit to Database
  const handleBulkSubmit = async () => {
    if (bulkRows.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let savedCount = 0;
    try {
      for (const row of bulkRows) {
        await addResource({
          title: row.title,
          description: row.purpose || `Bulk uploaded resource for ${row.language}`,
          tutorName: row.tutorName,
          category: row.category,
          purpose: row.purpose,
          academicContext: {
            language: row.language,
            course: `${row.language} Institutional Program`,
            level: row.level,
            module: 'Module 1',
            topic: row.category,
            skill: 'Speaking',
            resourceType: 'Web Portal / Page',
            difficulty: 'Beginner',
          },
          sourceType: 'Internal',
          sourceName: `${row.tutorName} (Tutor)`,
          sourceUrl: row.link,
          status: 'Published',
          tags: [row.language, row.level, row.category, institutionType, 'BulkImport'],
        });
        savedCount++;
      }

      setSuccessMsg(`🎉 Successfully saved all ${savedCount} items directly to the resource library! Redirecting to catalog...`);
      setBulkRows([]);
      setUploadedFileName(null);

      setTimeout(() => {
        router.push('/resources');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(`Bulk upload failed after saving ${savedCount} items: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto pb-24 animate-fade-in">
      
      {/* HEADER BANNER */}
      <div className="bg-[#0B2447] text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-[#1E3A8A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
              CURRICULUM RESOURCE MANAGER
            </span>
            <span className="text-xs font-bold text-cyan-300">
              Institutional Alignment
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Add Curriculum Resource</h1>
          <p className="text-xs text-slate-300 font-medium">
            Enter resource details aligned with School K-12 periods or College immersion tracks.
          </p>
        </div>

        {/* Tab Switcher: Single vs Bulk */}
        <div className="flex items-center bg-[#071730] p-1 rounded-2xl border border-[#1E3A8A] shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'single'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Single Entry Form</span>
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'bulk'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bulk Upload (CSV)</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* INSTITUTION STREAM SELECTOR (SCHOOLS VS COLLEGES) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Institutional Target Matrix</span>
            </div>
            <h3 className="text-base font-extrabold text-[#0B2447]">
              {institutionType === 'SCHOOL' ? '🏫 School Curriculum Schedule (Cat 1–6 Periods)' : '🎓 College Immersion Track (Higher Ed)'}
            </h3>
          </div>

          {/* School / College Switcher Toggle */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setInstitutionType('SCHOOL');
                setSingleForm(prev => ({
                  ...prev,
                  language: prev.language === 'Japanese' ? 'Spanish' : prev.language,
                  level: 'A1.1'
                }));
              }}
              className={`py-2 px-4 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                institutionType === 'SCHOOL'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <School className="w-4 h-4" />
              <span>Schools</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setInstitutionType('COLLEGE');
                setSingleForm(prev => ({ ...prev, level: 'A1' }));
              }}
              className={`py-2 px-4 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                institutionType === 'COLLEGE'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Colleges</span>
            </button>
          </div>
        </div>

        {/* ----------------- SCHOOL MATRIX CONTROLS ----------------- */}
        {institutionType === 'SCHOOL' && (
          <div className="space-y-4 p-4 bg-sky-50/70 border border-sky-200 rounded-2xl">
            {/* Category Selection (Cat 1 to Cat 6) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-sky-950 uppercase tracking-wider">
                  Select Period Category:
                </label>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded border border-sky-300">
                  {SCHOOL_CATEGORIES[schoolCategory].durationMinutes} Mins / Period
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {(Object.keys(SCHOOL_CATEGORIES) as SchoolCategoryKey[]).map((catKey) => {
                  const catMeta = SCHOOL_CATEGORIES[catKey];
                  const isCatSelected = schoolCategory === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setSchoolCategory(catKey)}
                      className={`p-2.5 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                        isCatSelected
                          ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                          : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                      }`}
                    >
                      <span className="block text-[11px] font-black">{catMeta.key.replace('_', ' ')}</span>
                      <span className="text-[10px] opacity-90">{catMeta.durationMinutes}m / period</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* School Grade Levels (A1.1 to B1.4) */}
            <div>
              <label className="text-xs font-extrabold text-sky-950 uppercase tracking-wider block mb-1.5">
                Target School Level (A1.1 – B1.4):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
                {SCHOOL_LEVEL_SCHEDULES.map((sched: any) => {
                  const isLvlSelected = singleForm.level === sched.level;
                  return (
                    <button
                      key={sched.level}
                      type="button"
                      onClick={() => setSingleForm(prev => ({ ...prev, level: sched.level }))}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                        isLvlSelected
                          ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                          : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                      }`}
                    >
                      <span className="block font-black">{sched.level}</span>
                      <span className="text-[9px] opacity-80">{sched.courseDurationHours}h</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Metric Summary Ribbon */}
            {(() => {
              const activeSchool = getSchoolSchedule(singleForm.level || 'A1.1', schoolCategory);
              return (
                <div className="bg-white border border-sky-200 rounded-xl p-3 shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                    <span className="text-[11px] font-extrabold uppercase text-sky-900 flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-sky-600" />
                      <span>Aligned School Schedule</span>
                    </span>
                    <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {activeSchool.totalPeriods} Total Periods • {activeSchool.periodsPerWeek} Periods / Week
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-sky-50 p-2 rounded-lg">
                      <span className="text-[10px] text-sky-700 block font-semibold">Period Duration:</span>
                      <strong className="text-sky-950">{activeSchool.periodDurationMinutes} Minutes</strong>
                    </div>
                    <div className="bg-sky-50 p-2 rounded-lg">
                      <span className="text-[10px] text-sky-700 block font-semibold">Course Hours:</span>
                      <strong className="text-sky-950">{activeSchool.courseDurationHours} Hours</strong>
                    </div>
                    <div className="bg-sky-50 p-2 rounded-lg">
                      <span className="text-[10px] text-sky-700 block font-semibold">Assessments:</span>
                      <strong className="text-sky-950">{activeSchool.assessmentsCount} Tests</strong>
                    </div>
                    <div className="bg-sky-50 p-2 rounded-lg">
                      <span className="text-[10px] text-sky-700 block font-semibold">Human Speaking:</span>
                      <strong className="text-sky-950">{activeSchool.humanPracticeMinutesPer2Weeks}m / 2 wks</strong>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ----------------- COLLEGE MATRIX CONTROLS ----------------- */}
        {institutionType === 'COLLEGE' && (
          <div className="space-y-4 p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
            {/* Track Selection */}
            <div>
              <label className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider block mb-1.5">
                Select Immersion Track:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(Object.keys(COLLEGE_TRACKS) as CollegeTrackKey[]).map((tKey) => {
                  const tMeta = COLLEGE_TRACKS[tKey];
                  const isTSelected = collegeTrack === tKey;
                  return (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setCollegeTrack(tKey)}
                      className={`p-3 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                        isTSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-100'
                      }`}
                    >
                      <span className="block text-xs font-black">{tKey.replace('_', ' ')}</span>
                      <span className="text-[10px] opacity-90">{tMeta.sessionMinutes} mins / session</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* College Target Levels */}
            <div>
              <label className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider block mb-1.5">
                Target Proficiency Level ({singleForm.language === 'Japanese' ? 'JLPT' : 'CEFR'}):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(singleForm.language === 'Japanese'
                  ? ['N5', 'N4', 'N3', 'N2']
                  : ['A1', 'A2', 'B1', 'B2']
                ).map((lvl) => {
                  const isLvlSelected = singleForm.level === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSingleForm(prev => ({ ...prev, level: lvl }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isLvlSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic College Summary Ribbon */}
            {(() => {
              const activeCollege = getCollegeSchedule(singleForm.language || 'French', singleForm.level || 'A1', collegeTrack);
              return (
                <div className="bg-white border border-indigo-200 rounded-xl p-3 shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                    <span className="text-[11px] font-extrabold uppercase text-indigo-900 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Higher Ed Academic Track Specifications</span>
                    </span>
                    <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {activeCollege.sessionsRequired} Sessions • {activeCollege.monthsRequired} Months Completion
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <span className="text-[10px] text-indigo-700 block font-semibold">Weekly Cadence:</span>
                      <strong className="text-indigo-950">{activeCollege.sessionsPerWeek} Sessions/wk</strong>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <span className="text-[10px] text-indigo-700 block font-semibold">Session Length:</span>
                      <strong className="text-indigo-950">{activeCollege.sessionMinutes} Minutes</strong>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <span className="text-[10px] text-indigo-700 block font-semibold">Assessments:</span>
                      <strong className="text-indigo-950">{activeCollege.assessmentsCount} Tests</strong>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <span className="text-[10px] text-indigo-700 block font-semibold">Human Speaking:</span>
                      <strong className="text-indigo-950">{activeCollege.humanPracticeMinutesPerWeek}m / week</strong>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* MODE 1: SINGLE RESOURCE FORM */}
      {activeTab === 'single' && (
        <form onSubmit={handleSingleSubmit} className="isml-card p-5 sm:p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-[#0B2447] flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              Resource Information Details
            </h3>
            <span className="text-[11px] font-bold text-slate-400">* Required Fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Language Selector */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-600" /> Target Language *
              </label>
              <select
                value={singleForm.language}
                onChange={e => {
                  const newLang = e.target.value;
                  setSingleForm(prev => ({
                    ...prev,
                    language: newLang,
                    level: institutionType === 'SCHOOL' ? 'A1.1' : (newLang === 'Japanese' ? 'N5' : 'A1')
                  }));
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                {institutionType === 'COLLEGE' && <option value="Japanese">Japanese (日本語)</option>}
                <option value="German">German (Deutsch)</option>
                <option value="French">French (Français)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="Korean">Korean (한국어)</option>
                <option value="English">English</option>
              </select>
            </div>

            {/* Resource Category */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-purple-600" /> Resource Category *
              </label>
              <select
                value={singleForm.category}
                required
                onChange={e => setSingleForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="">-- Select Category --</option>
                {CATEGORY_PRESETS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tutor Name */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" /> Tutor Name
              </label>
              <input
                type="text"
                value={singleForm.tutorName}
                onChange={e => setSingleForm(prev => ({ ...prev, tutorName: e.target.value }))}
                placeholder="e.g. Bhmika Jain, Geetha(Trichy), Academic Tutor"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Link URL */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-600" /> Resource Link (URL)
              </label>
              <input
                type="url"
                value={singleForm.link}
                onChange={e => setSingleForm(prev => ({ ...prev, link: e.target.value }))}
                placeholder="https://..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Resource Name / Title */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Resource Name (Title) *
              </label>
              <input
                type="text"
                required
                value={singleForm.title}
                onChange={e => setSingleForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Tae Kim's Grammar Guide, JLPT Sensei Practice Sheets"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Purpose */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                Curriculum Purpose / Description
              </label>
              <textarea
                rows={3}
                value={singleForm.purpose}
                onChange={e => setSingleForm(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="Describe how this resource is utilized in classroom periods or homework drills..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
            </div>

          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Resource...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" /> Save Resource to Library
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* MODE 2: BULK DATA UPLOAD */}
      {activeTab === 'bulk' && (
        <div className="space-y-6">
          <div className="isml-card p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-[#0B2447] flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  Bulk Upload Catalog Data (CSV / TSV / JSON)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Upload multiple rows formatted with columns: Tutor Name, Resource Category, Resource Name, Level, Purpose, Link.
                </p>
              </div>

              {/* Sample Download Button */}
              <button
                type="button"
                onClick={handleDownloadSampleCSV}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-300 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample CSV Template</span>
              </button>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all relative cursor-pointer group">
              <input
                type="file"
                accept=".csv,.tsv,.json,.txt"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
              <div className="space-y-2 pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-[#0B2447]">
                  {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Click or Drag & Drop CSV / JSON File Here'}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Supports standard Google Sheets CSV export with Tutor Name, Category, Title, Level, Purpose, Link
                </p>
              </div>
            </div>
          </div>

          {/* PARSED LIVE PREVIEW TABLE */}
          {bulkRows.length > 0 && (
            <div className="isml-card overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-md space-y-4 p-5">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-black text-xs">
                    {bulkRows.length} Items Ready
                  </span>
                  <h3 className="text-sm font-black text-[#0B2447]">
                    Import Preview List
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBulkRows([])}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>

                  <button
                    onClick={handleBulkSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving to Catalog...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" /> Save All {bulkRows.length} Resources to Library
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-[#071730] text-white text-[11px] uppercase tracking-wider font-extrabold">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Tutor Name</th>
                      <th className="py-2.5 px-3">Resource Category</th>
                      <th className="py-2.5 px-3">Resource Name</th>
                      <th className="py-2.5 px-3">Level</th>
                      <th className="py-2.5 px-3">Purpose</th>
                      <th className="py-2.5 px-3">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {bulkRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.tutorName}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-bold text-[10px]">
                            {row.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#0B2447]">{row.title}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 font-bold text-[10px]">
                            {row.level}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 line-clamp-2" title={row.purpose}>
                          {row.purpose}
                        </td>
                        <td className="py-2.5 px-3">
                          {row.link ? (
                            <a href={row.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline truncate block max-w-[150px]">
                              {row.link}
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
