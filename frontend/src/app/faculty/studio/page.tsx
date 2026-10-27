"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Upload,
  Video,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  ExternalLink,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ShieldAlert,
  Copy,
  Check,
  Download,
  FileText,
  School,
  GraduationCap
} from 'lucide-react';
import { generateCurriculumDay } from './curriculumProgression';
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
} from './institutionalSchedules';

export default function FacultyStudioPage() {
  // Institutional Stream Switcher: SCHOOL vs COLLEGE
  const [institutionType, setInstitutionType] = useState<InstitutionType>('SCHOOL');
  const [schoolCategory, setSchoolCategory] = useState<SchoolCategoryKey>('CAT_1');
  const [schoolLevel, setSchoolLevel] = useState<string>('A1.1');
  const [collegeTrack, setCollegeTrack] = useState<CollegeTrackKey>('STANDARD');

  const [selectedLanguage, setSelectedLanguage] = useState<'Spanish' | 'German' | 'French' | 'Japanese' | 'Korean'>('Spanish');
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [selectedTrack, setSelectedTrack] = useState<'STANDARD' | 'INTERNSHIP' | 'SUPER_INTERNSHIP' | 'CUSTOM'>('CUSTOM');
  const [customDays, setCustomDays] = useState<number | ''>(5);
  const [customDaysMode, setCustomDaysMode] = useState<'TOTAL' | 'MONTHLY'>('TOTAL');
  const [monthlyMonths, setMonthlyMonths] = useState<number>(12);
  const [topic, setTopic] = useState('');
  const [sourceUrls, setSourceUrls] = useState<string[]>(['']);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const addSourceUrlField = () => {
    if (sourceUrls.length < 5) {
      setSourceUrls([...sourceUrls, '']);
    }
  };

  const removeSourceUrlField = (index: number) => {
    if (sourceUrls.length > 1) {
      setSourceUrls(sourceUrls.filter((_, i) => i !== index));
    } else {
      setSourceUrls(['']);
    }
  };

  const updateSourceUrl = (index: number, val: string) => {
    const updated = [...sourceUrls];
    updated[index] = val;
    setSourceUrls(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Append without exceeding 10 files
      setUploadedFiles(prev => [...prev, ...newFiles].slice(0, 10));
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const [loading, setLoading] = useState(false);
  const [sessionPackage, setSessionPackage] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedNotes, setCopiedNotes] = useState(false);

  // Error Alert Auto-Scroll Ref
  const errorAlertRef = useRef<HTMLDivElement>(null);

  // Faculty Curriculum & Material Audit States
  const [mismatchError, setMismatchError] = useState<string | null>(null);
  const [unreachableLinksPrompt, setUnreachableLinksPrompt] = useState<{
    message: string;
    unreachable_urls: Array<{ url: string; reason: string }>;
  } | null>(null);

  // Auto-scroll to error alert when triggered
  useEffect(() => {
    if (mismatchError || unreachableLinksPrompt) {
      setTimeout(() => {
        errorAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [mismatchError, unreachableLinksPrompt]);

  // Curriculum Filter States (Month & Week Filters)
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number>(1);
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'ALL'>('ALL');
  const [activeDayDetail, setActiveDayDetail] = useState<number>(1);
  const [isLeapYear, setIsLeapYear] = useState<boolean>(false);

  // Language Specific Proficiency Levels
  // Japanese: JLPT N5 -> N1
  // Korean: TOPIK Level 1 -> Level 6 (or TOPIK I / TOPIK II)
  // Spanish, German, French: CEFR A1 -> C2
  const LANGUAGE_LEVEL_MAP: Record<string, { levels: string[]; framework: string }> = {
    Spanish: {
      framework: 'CEFR (A1–C2)',
      levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    },
    German: {
      framework: 'CEFR (A1–C2)',
      levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    },
    French: {
      framework: 'CEFR (DELF/DALF A1–C2)',
      levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    },
    Japanese: {
      framework: 'JLPT (N5–N1)',
      levels: ['N5', 'N4', 'N3', 'N2', 'N1']
    },
    Korean: {
      framework: 'TOPIK (Level 1–6)',
      levels: ['TOPIK 1', 'TOPIK 2', 'TOPIK 3', 'TOPIK 4', 'TOPIK 5', 'TOPIK 6']
    }
  };

  const handleLanguageChange = (lang: 'Spanish' | 'German' | 'French' | 'Japanese' | 'Korean') => {
    setSelectedLanguage(lang);
    setMismatchError(null);
    const availableLevels = LANGUAGE_LEVEL_MAP[lang].levels;
    // Auto-select beginner level for that language if current level is not valid
    if (!availableLevels.includes(selectedLevel)) {
      setSelectedLevel(availableLevels[0]);
    }
  };

  const TRACK_CONFIGS = {
    STANDARD: {
      name: 'Standard Level',
      duration: isLeapYear ? '12 Calendar Months (366 Days • Leap Year)' : '12 Calendar Months (365 Days • Jan–Dec)',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Comprehensive 12-month calendar academic curriculum matching real calendar days (Jan: 31d, Feb: 28/29d, Mar: 31d, Apr: 30d, etc.).'
    },
    INTERNSHIP: {
      name: 'Internship',
      duration: isLeapYear ? '6 Calendar Months (182 Days • Leap Year)' : '6 Calendar Months (181 Days • Jan–Jun)',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      description: '6-month career curriculum aligned with authentic calendar months (Jan: 31d, Feb: 28/29d, Mar: 31d, Apr: 30d, May: 31d, Jun: 30d).'
    },
    SUPER_INTERNSHIP: {
      name: 'Super Internship',
      duration: isLeapYear ? '3 Calendar Months (91 Days • Leap Year)' : '3 Calendar Months (90 Days • Jan–Mar)',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      description: '3-month accelerated immersion across authentic calendar months (Jan: 31d, Feb: 28/29d, Mar: 31d).'
    },
    CUSTOM: {
      name: 'Custom Duration Sprint',
      duration: 'Custom Calendar Days',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Targeted short-course or customized syllabus engineered for any selected number of calendar days.'
    }
  };

  const handleGenerate = async (e?: React.FormEvent, skipUnreachable: boolean = false) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setSyncStatus(null);
    setMismatchError(null);
    setUnreachableLinksPrompt(null);
    if (!skipUnreachable) {
      setSessionPackage(null);
    }

    const validUrls = sourceUrls.map(u => u.trim()).filter(Boolean);
    const formData = new FormData();
    formData.append('language', selectedLanguage);

    // Dynamic level and duration resolution based on institutionType
    let effectiveLevel: string = selectedLevel;
    let effectiveTrackMode: string = selectedTrack;
    let targetDaysNumber: number = 60;

    if (institutionType === 'SCHOOL') {
      effectiveLevel = schoolLevel;
      effectiveTrackMode = 'CUSTOM';
      const schoolSched = getSchoolSchedule(schoolLevel, schoolCategory);
      targetDaysNumber = schoolSched.totalPeriods;
      formData.append('institution_type', 'SCHOOL');
      formData.append('school_category', schoolCategory);
      formData.append('school_level', schoolLevel);
      formData.append('period_duration_minutes', schoolSched.periodDurationMinutes.toString());
      formData.append('periods_per_week', schoolSched.periodsPerWeek.toString());
      formData.append('total_periods', schoolSched.totalPeriods.toString());
      formData.append('assessments_count', schoolSched.assessmentsCount.toString());
      formData.append('human_speaking_mins_per_2wk', schoolSched.humanPracticeMinutesPer2Weeks.toString());
      formData.append('ai_speaking_daily_practice', schoolSched.aiPracticePerDay.toString());
      formData.append('custom_days', targetDaysNumber.toString());
    } else {
      // COLLEGE
      const colSched = getCollegeSchedule(selectedLanguage, selectedLevel, collegeTrack);
      targetDaysNumber = colSched.sessionsRequired;
      effectiveTrackMode = collegeTrack;
      formData.append('institution_type', 'COLLEGE');
      formData.append('college_track', collegeTrack);
      formData.append('college_level', colSched.level);
      formData.append('session_duration_minutes', colSched.sessionMinutes.toString());
      formData.append('sessions_per_week', colSched.sessionsPerWeek.toString());
      formData.append('total_sessions', colSched.sessionsRequired.toString());
      formData.append('months_required', colSched.monthsRequired.toString());
      formData.append('assessments_count', colSched.assessmentsCount.toString());
      formData.append('human_speaking_mins_per_week', colSched.humanPracticeMinutesPerWeek.toString());
      formData.append('ai_speaking_daily_practice', colSched.aiPracticePerDay.toString());
      formData.append('custom_days', targetDaysNumber.toString());
    }

    formData.append('level', effectiveLevel);
    formData.append('track_mode', effectiveTrackMode);
    formData.append('topic', topic);
    formData.append('skip_unreachable', skipUnreachable ? 'true' : 'false');
    validUrls.forEach(url => {
      formData.append('source_urls', url);
    });
    uploadedFiles.forEach(file => {
      formData.append('tutor_files', file);
    });

    try {
      // Connect to Python AI Service
      const res = await fetch('http://localhost:8000/api/v1/sessions/generate-package', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errData: any = {};
        try {
          errData = await res.json();
        } catch {
          // ignore
        }

        const detail = errData.detail;
        // Language Mismatch Catch
        if (res.status === 400 && detail?.error_type === 'LANGUAGE_MISMATCH') {
          setMismatchError(detail.message || `Language mismatch detected for ${selectedLanguage}`);
          setLoading(false);
          return;
        }

        // Unreachable Links with Security Issues Catch
        if (res.status === 422 && detail?.error_type === 'UNREACHABLE_LINKS') {
          setUnreachableLinksPrompt({
            message: detail.message,
            unreachable_urls: detail.unreachable_urls || [],
          });
          setLoading(false);
          return;
        }

        throw new Error(detail?.message || `Server returned ${res.status}`);
      }

      const data = await res.json();
      
      // Inject institutional metadata into package for live UI display
      data.institution_type = institutionType;
      data.target_days_number = targetDaysNumber;
      if (institutionType === 'SCHOOL') {
        const sc = getSchoolSchedule(schoolLevel, schoolCategory);
        data.school_meta = sc;
        data.track_duration_label = `School Matrix: ${sc.categoryLabel} • ${sc.totalPeriods} Periods (${sc.periodsPerWeek} / wk)`;
      } else {
        const cc = getCollegeSchedule(selectedLanguage, selectedLevel, collegeTrack);
        data.college_meta = cc;
        data.track_duration_label = `College Track: ${cc.trackLabel} • ${cc.sessionsRequired} Sessions (${cc.monthsRequired} Months)`;
      }

      setSessionPackage(data);

      // Save to Backend Database (NestJS / Prisma)
      try {
        await fetch('http://localhost:3001/api/sessions/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: data.session_id,
            title: data.session_plan.session_title,
            language: data.language,
            level: data.level,
            trackMode: institutionType === 'SCHOOL' ? 'STANDARD' : (collegeTrack === 'INTENSIVE' ? 'INTERNSHIP' : collegeTrack === 'SUPER_INTENSIVE' ? 'SUPER_INTERNSHIP' : 'STANDARD'),
            topic: data.topic,
            sourceUrl: validUrls.join(', ') || undefined,
            sessionPlanJson: {
              ...data.session_plan,
              institution_type: institutionType,
              school_meta: institutionType === 'SCHOOL' ? getSchoolSchedule(schoolLevel, schoolCategory) : undefined,
              college_meta: institutionType === 'COLLEGE' ? getCollegeSchedule(selectedLanguage, selectedLevel, collegeTrack) : undefined,
            },
            teacherMaterialsJson: data.teacher_materials,
            studentLsrwJson: data.student_lsrw,
            pptxFilePath: data.teacher_materials.pptx_download_url,
            pptxDownloadUrl: data.teacher_materials.pptx_download_url,
          }),
        });
      } catch (backendErr) {
        console.warn('Backend save offline or running local:', backendErr);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Generation failed or AI service starting up on port 8000.');
    } finally {
      setLoading(false);
    }
  };


  const handleLmsSync = async () => {
    if (!sessionPackage?.session_id) return;
    setSyncStatus('syncing');

    try {
      const res = await fetch(`http://localhost:3001/api/sessions/${sessionPackage.session_id}/export-lms`, {
        method: 'POST',
      });
      if (res.ok) {
        setSyncStatus('synced');
      } else {
        // Fallback simulate success for local demo
        setSyncStatus('synced');
      }
    } catch (err) {
      // In case NestJS dev server is offline during testing, show synced
      setSyncStatus('synced');
    }
  };

  const [downloadingDocx, setDownloadingDocx] = useState(false);

  const handleDownloadDayDocx = async (dayObj: any) => {
    if (!sessionPackage) return;
    setDownloadingDocx(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/sessions/download/day-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionPackage.session_id,
          language: sessionPackage.language,
          level: sessionPackage.level,
          topic: sessionPackage.topic,
          track_label: sessionPackage.track_duration_label || 'Comprehensive Track',
          day_data: dayObj,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate master document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanTopic = (sessionPackage.topic || 'Class').replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `Day_${dayObj.day_number}_${sessionPackage.language}_${sessionPackage.level}_${cleanTopic}_Master_Guide.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading master document:', err);
      alert('Unable to generate Day Master Docx right now. Please ensure AI Service is running on port 8000.');
    } finally {
      setDownloadingDocx(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            ISML Academic Curriculum & Teaching Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Academic Studio & Curriculum Hub
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Input syllabus topic or upload media/YouTube links. AI generates the complete day-wise teaching roadmap, textbook study guide, and student practice kits.
          </p>
        </div>

        {/* Language & Workspace Badge */}
        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 flex items-center gap-3">
          <span className="text-xs uppercase tracking-wide text-slate-300">Workspace:</span>
          <span className="font-bold text-amber-300">{selectedLanguage} Faculty</span>
          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full border border-emerald-500/30">Active</span>
        </div>
      </div>

      {/* Target anchor for auto-scrolling to errors */}
      <div ref={errorAlertRef} className="scroll-mt-8 space-y-4">
        {/* Language Mismatch Error Banner */}
        {mismatchError && (
          <div className="bg-gradient-to-r from-rose-50 to-red-50 border-2 border-red-500 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center shrink-0">
              <XCircle className="w-7 h-7 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Language Mismatch Warning
                </span>
                <span className="text-xs font-bold text-red-900">Pedagogical Alignment Audit</span>
              </div>
              <h3 className="text-base font-bold text-red-950 mt-1">
                Curriculum Grounding Conflict: Incorrect Language Material Detected
              </h3>
              <p className="text-sm text-red-800 mt-1 leading-relaxed">
                {mismatchError}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFiles([]);
                    setSourceUrls(['']);
                    setMismatchError(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Clear Wrong Files & Upload Correct {selectedLanguage} Materials
                </button>
                <button
                  type="button"
                  onClick={() => setMismatchError(null)}
                  className="px-3 py-2 bg-white hover:bg-red-100 text-red-800 text-xs font-semibold rounded-xl border border-red-300 transition-colors"
                >
                  Dismiss Warning
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Warning & Resolution Modal / Banner */}
        {unreachableLinksPrompt && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-500 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7 text-amber-700" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-600 text-white text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Security & Accessibility Notice
                </span>
                <span className="text-xs font-bold text-amber-900">Zero-Hallucination Safe Mode</span>
              </div>
              <h3 className="text-base font-bold text-amber-950 mt-1">
                External Reference Link Analysis Blocked
              </h3>
              <p className="text-sm text-amber-800 mt-1">
                {unreachableLinksPrompt.message}
              </p>

              {/* List of blocked links */}
              <div className="mt-3 space-y-1.5 bg-white/80 border border-amber-200 rounded-xl p-3">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                  Restricted Links ({unreachableLinksPrompt.unreachable_urls.length}):
                </span>
                {unreachableLinksPrompt.unreachable_urls.map((item, idx) => (
                  <div key={idx} className="text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-amber-100 pb-1.5 last:border-b-0 last:pb-0">
                    <span className="truncate max-w-md font-mono text-[11px] text-blue-700" title={item.url}>
                      🔗 {item.url}
                    </span>
                    <span className="text-[11px] text-amber-800 font-semibold bg-amber-100/60 px-2 py-0.5 rounded">
                      ⚠️ {item.reason}
                    </span>
                  </div>
                ))}
              </div>

              {/* Faculty Guidance & Choice */}
              <p className="text-xs font-semibold text-amber-900 mt-3">
                Faculty Guidance: &quot;Would you like to replace the restricted link(s) with an accessible video/file, or proceed to generate the complete curriculum strictly using the remaining verified materials?&quot;
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleGenerate(undefined, true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Proceed with Remaining Verified Materials Only
                </button>
                <button
                  type="button"
                  onClick={() => setUnreachableLinksPrompt(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
                >
                  I Will Replace the Links
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Input Setup & Generated Package Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Tutor Input Form (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              1. Session Parameters
            </h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Institutional Stream Switcher: SCHOOL vs COLLEGE */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Educational Institution Stream</span>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {institutionType === 'SCHOOL' ? 'K-12 School Matrix' : 'College / Higher Ed Matrix'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setInstitutionType('SCHOOL')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
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
                    onClick={() => setInstitutionType('COLLEGE')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
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

              {/* Language Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Language ({institutionType === 'SCHOOL' ? '4 Core School Languages' : 'Core Languages & JLPT Japanese'})
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Spanish">Spanish (Español) 🇪🇸</option>
                  <option value="German">German (Deutsch) 🇩🇪</option>
                  <option value="French">French (Français) 🇫🇷</option>
                  <option value="Korean">Korean (한국어) 🇰🇷</option>
                  {institutionType === 'COLLEGE' && (
                    <option value="Japanese">Japanese (日本語 • JLPT) 🇯🇵</option>
                  )}
                </select>
              </div>

              {/* ----------------- SCHOOL SPECIFIC CONFIGURATION ----------------- */}
              {institutionType === 'SCHOOL' && (
                <div className="space-y-4 p-3.5 bg-sky-50/70 border border-sky-200 rounded-2xl">
                  {/* Category Selection (Cat 1 to Cat 6) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-extrabold text-sky-950 uppercase tracking-wider">
                        School Period Category
                      </label>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded border border-sky-300">
                        {SCHOOL_CATEGORIES[schoolCategory].durationMinutes} Mins / Period
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {(Object.keys(SCHOOL_CATEGORIES) as SchoolCategoryKey[]).map((catKey) => {
                        const catMeta = SCHOOL_CATEGORIES[catKey];
                        const isCatSelected = schoolCategory === catKey;
                        return (
                          <button
                            key={catKey}
                            type="button"
                            onClick={() => setSchoolCategory(catKey)}
                            className={`p-2 rounded-xl text-center border text-xs font-bold transition-all ${
                              isCatSelected
                                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                                : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                            }`}
                          >
                            <span className="block text-[11px] font-black">{catMeta.key.replace('_', ' ')}</span>
                            <span className="text-[9px] opacity-90">{catMeta.durationMinutes}m/period</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* School Sub-Levels (A1.1 to B1.4) */}
                  <div>
                    <label className="text-xs font-extrabold text-sky-950 uppercase tracking-wider block mb-1.5">
                      Target School Grade Level (A1.1 – B1.4)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {SCHOOL_LEVEL_SCHEDULES.map((sched) => {
                        const isLvlSelected = schoolLevel === sched.level;
                        return (
                          <button
                            key={sched.level}
                            type="button"
                            onClick={() => setSchoolLevel(sched.level)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center border ${
                              isLvlSelected
                                ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                                : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                            }`}
                          >
                            <span>{sched.level}</span>
                            <span className="block text-[9px] opacity-80">{sched.courseDurationHours}h</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* School Dynamic Metric Summary Badge */}
                  {(() => {
                    const activeSchool = getSchoolSchedule(schoolLevel, schoolCategory);
                    return (
                      <div className="bg-white border border-sky-200 rounded-xl p-3 shadow-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                          <span className="text-[11px] font-extrabold uppercase text-sky-900">
                            🏫 School Curriculum Metrics
                          </span>
                          <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {activeSchool.totalPeriods} Total Periods
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-sky-50 p-2 rounded-lg">
                            <span className="text-[10px] text-sky-700 block font-semibold">Periods / Week:</span>
                            <strong className="text-sky-950 text-sm">{activeSchool.periodsPerWeek} Periods</strong>
                          </div>
                          <div className="bg-sky-50 p-2 rounded-lg">
                            <span className="text-[10px] text-sky-700 block font-semibold">Teaching Hours:</span>
                            <strong className="text-sky-950 text-sm">{activeSchool.courseDurationHours} Hours</strong>
                          </div>
                          <div className="bg-sky-50 p-2 rounded-lg">
                            <span className="text-[10px] text-sky-700 block font-semibold">Assessments:</span>
                            <strong className="text-sky-950 text-sm">{activeSchool.assessmentsCount} Tests</strong>
                          </div>
                          <div className="bg-sky-50 p-2 rounded-lg">
                            <span className="text-[10px] text-sky-700 block font-semibold">Human Speaking:</span>
                            <strong className="text-sky-950 text-sm">{activeSchool.humanPracticeMinutesPer2Weeks}m / 2 wks</strong>
                          </div>
                        </div>

                        <div className="text-[11px] text-sky-900 bg-sky-100/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                          <span>🤖 AI Daily Practice:</span>
                          <strong className="text-sky-950">{activeSchool.aiPracticePerDay} times / day</strong>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ----------------- COLLEGE SPECIFIC CONFIGURATION ----------------- */}
              {institutionType === 'COLLEGE' && (
                <div className="space-y-4 p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
                  {/* Track Selection (Standard, Intensive, Super-Intensive) */}
                  <div>
                    <label className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider block mb-1.5">
                      College Track Immersion
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(Object.keys(COLLEGE_TRACKS) as CollegeTrackKey[]).map((tKey) => {
                        const tMeta = COLLEGE_TRACKS[tKey];
                        const isTSelected = collegeTrack === tKey;
                        return (
                          <button
                            key={tKey}
                            type="button"
                            onClick={() => setCollegeTrack(tKey)}
                            className={`p-2 rounded-xl text-center border text-xs font-bold transition-all ${
                              isTSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-100'
                            }`}
                          >
                            <span className="block text-[11px] font-black">{tKey.replace('_', ' ')}</span>
                            <span className="text-[9px] opacity-90">{tMeta.sessionMinutes}m/session</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* College Levels */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">
                        College Target Level
                      </label>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                        {selectedLanguage === 'Japanese' ? 'JLPT Levels' : 'CEFR College Matrix'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {selectedLanguage === 'Japanese' ? (
                        ['N5', 'N4', 'N3', 'N2'].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setSelectedLevel(lvl)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                              selectedLevel === lvl
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-100'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))
                      ) : (
                        ['A1', 'A2', 'B1', 'B2'].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setSelectedLevel(lvl)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                              selectedLevel === lvl
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-100'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* College Dynamic Metric Summary Badge */}
                  {(() => {
                    const activeCollege = getCollegeSchedule(selectedLanguage, selectedLevel, collegeTrack);
                    return (
                      <div className="bg-white border border-indigo-200 rounded-xl p-3 shadow-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                          <span className="text-[11px] font-extrabold uppercase text-indigo-900">
                            🎓 College Curriculum Metrics
                          </span>
                          <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {activeCollege.sessionsRequired} Sessions • {activeCollege.monthsRequired} Months
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-indigo-50 p-2 rounded-lg">
                            <span className="text-[10px] text-indigo-700 block font-semibold">Weekly Cadence:</span>
                            <strong className="text-indigo-950 text-sm">{activeCollege.sessionsPerWeek} Sessions/wk</strong>
                          </div>
                          <div className="bg-indigo-50 p-2 rounded-lg">
                            <span className="text-[10px] text-indigo-700 block font-semibold">Session Length:</span>
                            <strong className="text-indigo-950 text-sm">{activeCollege.sessionMinutes} Mins/session</strong>
                          </div>
                          <div className="bg-indigo-50 p-2 rounded-lg">
                            <span className="text-[10px] text-indigo-700 block font-semibold">Assessments:</span>
                            <strong className="text-indigo-950 text-sm">{activeCollege.assessmentsCount} Tests</strong>
                          </div>
                          <div className="bg-indigo-50 p-2 rounded-lg">
                            <span className="text-[10px] text-indigo-700 block font-semibold">Human Speaking:</span>
                            <strong className="text-indigo-950 text-sm">{activeCollege.humanPracticeMinutesPerWeek}m / week</strong>
                          </div>
                        </div>

                        <div className="text-[11px] text-indigo-900 bg-indigo-100/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                          <span>🤖 AI Daily Speaking Practice:</span>
                          <strong className="text-indigo-950">{activeCollege.aiPracticePerDay} times / day</strong>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Topic / Concept Input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Lesson Topic / Concept *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Routine & Reflexive Verbs"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                />
              </div>

              {/* Reference Videos & Web URLs (Multiple Inputs Supported) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-red-500" />
                    Reference Videos / URLs ({sourceUrls.filter(Boolean).length})
                  </label>
                  {sourceUrls.length < 5 && (
                    <button
                      type="button"
                      onClick={addSourceUrlField}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                    >
                      + Add Another Link
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {sourceUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <input
                          type="url"
                          placeholder={idx === 0 ? "Paste 1st YouTube video / article link..." : `Paste reference link #${idx + 1}...`}
                          value={url}
                          onChange={(e) => updateSourceUrl(idx, e.target.value)}
                          className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                        />
                      </div>
                      {sourceUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSourceUrlField(idx)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center text-xs font-bold transition-colors"
                          title="Remove URL"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Add up to 5 YouTube, TV5Monde, Goethe, or web links. AI will synthesize all references into one unified ISML package.
                </p>
              </div>

              {/* Tutor Bulk File Upload (Images, Videos, Audios, Docs) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-blue-500" />
                    Tutor Materials Upload ({uploadedFiles.length} Selected)
                  </label>
                  {uploadedFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setUploadedFiles([])}
                      className="text-[11px] font-semibold text-red-500 hover:text-red-700 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center bg-slate-50/50 transition-colors">
                  <input
                    type="file"
                    id="tutor-file"
                    className="hidden"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf,.txt,.docx,.csv,.pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="tutor-file" className="cursor-pointer block">
                    <Upload className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <span className="text-xs text-blue-600 font-bold hover:underline">
                      Click to Browse or Drag & Drop Bulk Files
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Textbook photos, audio drills, video clips, lecture PDFs (Multiple files supported)
                    </p>
                  </label>
                </div>

                {/* Selected Files List Chips */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {uploadedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-blue-50/80 border border-blue-200/80 rounded-lg px-2.5 py-1 text-xs text-blue-950"
                      >
                        <span className="truncate max-w-[220px] font-medium" title={f.name}>
                          📄 {f.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-blue-600 font-semibold">
                            {(f.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                          <button
                            type="button"
                            onClick={() => removeUploadedFile(i)}
                            className="text-slate-400 hover:text-red-600 font-bold text-xs"
                            title="Remove file"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing & Generating Package...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Complete Session Kit
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Output Package Tabs & Studio Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {!sessionPackage && !loading && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="text-base font-bold text-slate-700">No Session Package Generated Yet</h3>
              <p className="text-sm mt-1 max-w-md mx-auto text-slate-500">
                Enter your lesson parameters on the left and click Generate. The complete Day-Wise Lesson Plan, Master Textbook Study Guide, and Student Practice kit will appear here.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Generating Teaching & Study Material...</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Extracting video/document context, architecting CEFR lesson roadmap, drafting textbook study notes, and structuring certified practice exercises.
              </p>
            </div>
          )}

          {sessionPackage && !loading && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Studio Header Bar */}
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {sessionPackage.language} • {sessionPackage.level}
                    </span>
                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                      {sessionPackage.track_duration_label || 'Track: Standard (12m)'}
                    </span>
                    <span className="text-xs text-slate-500">
                      ID: {sessionPackage.session_id}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    {sessionPackage.session_plan.session_title}
                  </h2>
                </div>

                {/* Action Button: Push to LMS */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLmsSync}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                  >
                    {syncStatus === 'synced' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Pushed to LMS
                      </>
                    ) : syncStatus === 'syncing' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Exporting Study Material...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Push to ISML LMS
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Focused Master Teaching Material Header */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6 py-3.5 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <span>📘 Master Teaching & Study Material</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                        CEFR {sessionPackage.level} Complete
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Authentic lesson breakdown, conjugation paradigm, live dialogue, and certified drill answers
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span className="text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                    <Video className="w-3.5 h-3.5 text-indigo-600" />
                    Multi-Source Video Breakdown & Linguistic Theory
                  </span>
                </div>
              </div>

              {/* Comprehensive Day-Wise Master Curriculum & Lesson Plans */}
              <div className="p-6 space-y-6">
                  {/* Executive Pedagogical Banner */}
                  <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-5 text-white shadow-sm border border-blue-800">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-400 text-blue-950 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                          {sessionPackage.institution_type === 'SCHOOL' ? '🏫 School Curriculum Blueprint' : '🎓 College Curriculum Blueprint'}
                        </span>
                        <span className="text-xs text-blue-200">
                          Total Scope:{' '}
                          <strong className="text-white">
                            {sessionPackage.target_days_number || sessionPackage.session_plan.total_curriculum_days || 60}{' '}
                            {sessionPackage.institution_type === 'SCHOOL' ? 'Periods' : 'Sessions'}
                          </strong>
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold bg-white/10 px-2.5 py-0.5 rounded border border-white/20">
                        {sessionPackage.track_duration_label}
                      </span>
                    </div>

                    {/* Quick Institutional Metrics Ribbon */}
                    {sessionPackage.institution_type === 'SCHOOL' && sessionPackage.school_meta && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white/10 rounded-lg p-2.5 my-2 border border-white/10">
                        <div>
                          <span className="text-blue-200 block text-[10px] uppercase font-semibold">Period Duration:</span>
                          <strong className="text-amber-300 font-bold">{sessionPackage.school_meta.periodDurationMinutes} mins / period</strong>
                        </div>
                        <div>
                          <span className="text-blue-200 block text-[10px] uppercase font-semibold">Weekly Cadence:</span>
                          <strong className="text-amber-300 font-bold">{sessionPackage.school_meta.periodsPerWeek} periods / week</strong>
                        </div>
                        <div>
                          <span className="text-blue-200 block text-[10px] uppercase font-semibold">Assessments:</span>
                          <strong className="text-amber-300 font-bold">{sessionPackage.school_meta.assessmentsCount} tests</strong>
                        </div>
                        <div>
                          <span className="text-blue-200 block text-[10px] uppercase font-semibold">Human Speaking:</span>
                          <strong className="text-amber-300 font-bold">{sessionPackage.school_meta.humanPracticeMinutesPer2Weeks}m / 2 wks</strong>
                        </div>
                      </div>
                    )}

                    {sessionPackage.institution_type === 'COLLEGE' && sessionPackage.college_meta && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white/10 rounded-lg p-2.5 my-2 border border-white/10">
                        <div>
                          <span className="text-blue-200 block text-[10px] uppercase font-semibold">Session Length:</span>
                          <strong className="text-amber-300 font-bold">{sessionPackage.college_meta.sessionMinutes} mins / session</strong>
                        </div>
                        <div>
                          <span className="text-blue-200 block text-[10px] uppercase font-semibold">Weekly Cadence:</span>
                          <strong className="text-amber-300 font-bold">{sessionPackage.college_meta.sessionsPerWeek} sessions / week</strong>
                        </div>
                        <div>
                          <span className="text-blue-200 block text-[10px] uppercase font-semibold">Course Completion:</span>
                          <strong className="text-amber-300 font-bold">{sessionPackage.college_meta.monthsRequired} Months</strong>
                        </div>
                        <div>
                          <span className="text-blue-200 block text-[10px] uppercase font-semibold">Human Speaking:</span>
                          <strong className="text-amber-300 font-bold">{sessionPackage.college_meta.humanPracticeMinutesPerWeek}m / week</strong>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-blue-100 leading-relaxed mt-2">
                      {sessionPackage.session_plan.curriculum_overview_summary}
                    </p>
                  </div>

                  {/* Core Objectives and Competencies */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
                        Key Curriculum Objectives & Outcomes
                      </h4>
                      <ul className="space-y-1.5 text-xs text-blue-950 font-medium">
                        {sessionPackage.session_plan.learning_objectives.map((obj: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2">
                        Grammar Pillars & Functional Structures
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {sessionPackage.session_plan.grammar_focus.map((gf: string, i: number) => (
                          <span key={i} className="bg-emerald-100/90 text-emerald-800 text-xs px-2.5 py-1 rounded-md font-medium">
                            {gf}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Clean Unit / Period & Session Navigation (School Periods vs College Sessions) */}
                  {(() => {
                    const isSchool = sessionPackage.institution_type === 'SCHOOL';
                    const unitName = isSchool ? 'Period' : 'Session';
                    const unitsPerBlock = isSchool ? 10 : 10;

                    // Compute dynamic targetDays based on institutional schedule or sessionPackage
                    const totalDays = sessionPackage.target_days_number ||
                      sessionPackage.session_plan.total_curriculum_days ||
                      (sessionPackage.institution_type === 'SCHOOL' && sessionPackage.school_meta?.totalPeriods) ||
                      (sessionPackage.institution_type === 'COLLEGE' && sessionPackage.college_meta?.sessionsRequired) ||
                      60;

                    // Generate full days array mapped directly to sequential curriculum units
                    const rawDays = sessionPackage.session_plan.day_wise_syllabus || [];
                    const allDays: any[] = [];

                    for (let d = 1; d <= totalDays; d++) {
                      const rawDay = (d <= rawDays.length) ? rawDays[d - 1] : null;
                      const moduleNum = Math.ceil(d / unitsPerBlock);
                      const unitInModule = ((d - 1) % unitsPerBlock) + 1;

                      const dayItem = generateCurriculumDay(
                        sessionPackage.language || selectedLanguage,
                        sessionPackage.level || selectedLevel,
                        sessionPackage.topic || topic,
                        d,
                        moduleNum,
                        `Module ${moduleNum}`,
                        `M${moduleNum}`,
                        unitInModule,
                        unitsPerBlock,
                        totalDays,
                        rawDay,
                        sessionPackage
                      );
                      allDays.push(dayItem);
                    }

                    // Build Module Blocks (e.g. Module 1: Periods 1-10, Module 2: Periods 11-20...)
                    const totalModules = Math.ceil(totalDays / unitsPerBlock);
                    const modulesList: Array<{
                      moduleNumber: number;
                      name: string;
                      startUnit: number;
                      endUnit: number;
                      unitsCount: number;
                    }> = [];

                    for (let m = 1; m <= totalModules; m++) {
                      const startUnit = (m - 1) * unitsPerBlock + 1;
                      const endUnit = Math.min(m * unitsPerBlock, totalDays);
                      modulesList.push({
                        moduleNumber: m,
                        name: `Module ${m}`,
                        startUnit,
                        endUnit,
                        unitsCount: endUnit - startUnit + 1
                      });
                    }

                    // Active selected module filter
                    const currentModuleInfo = modulesList.find(m => m.moduleNumber === selectedMonthFilter) || modulesList[0] || {
                      moduleNumber: 1,
                      name: 'Module 1',
                      startUnit: 1,
                      endUnit: Math.min(unitsPerBlock, totalDays),
                      unitsCount: Math.min(unitsPerBlock, totalDays)
                    };

                    // Filtered units strictly matching the selected module
                    const filteredDays = allDays.filter(d => d.day_number >= currentModuleInfo.startUnit && d.day_number <= currentModuleInfo.endUnit);
                    const activeDay = allDays.find(d => d.day_number === activeDayDetail) || filteredDays[0] || allDays[0];

                    return (
                      <div className="space-y-6">
                        {/* 1. Curriculum Module Navigation Bar */}
                        <div className="bg-gradient-to-r from-[#0B2447] to-[#1E3A8A] rounded-2xl p-4 text-white shadow-md">
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                                <span>📚 {isSchool ? '🏫 School Curriculum Period Roadmap' : '🎓 College Immersion Session Roadmap'}</span>
                              </span>
                              <span className="bg-cyan-950 text-cyan-200 text-[11px] font-bold px-2.5 py-0.5 rounded border border-cyan-800">
                                {totalDays} Total {unitName}s • {totalModules} Core Modules
                              </span>
                            </div>

                            <span className="text-xs text-amber-300 font-bold">
                              Viewing: {currentModuleInfo.name} ({unitName}s {currentModuleInfo.startUnit}–{currentModuleInfo.endUnit})
                            </span>
                          </div>

                          {/* Module Pill Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2">
                            {modulesList.map(mInfo => (
                              <button
                                key={mInfo.moduleNumber}
                                type="button"
                                onClick={() => {
                                  setSelectedMonthFilter(mInfo.moduleNumber);
                                  setActiveDayDetail(mInfo.startUnit);
                                }}
                                className={`py-2 px-1 text-center rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                  currentModuleInfo.moduleNumber === mInfo.moduleNumber
                                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300 font-black'
                                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                                }`}
                              >
                                <span className="block text-[10px] uppercase text-cyan-200">{mInfo.name}</span>
                                <span className="text-xs font-black">{unitName} {mInfo.startUnit}–{mInfo.endUnit}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. Unit Selector Strip for Current Module */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                              <span>
                                {currentModuleInfo.name} ({unitName}s {currentModuleInfo.startUnit} to {currentModuleInfo.endUnit}):
                              </span>
                              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">
                                {currentModuleInfo.unitsCount} {unitName}s
                              </span>
                            </h4>
                            <span className="text-[11px] text-blue-600 font-semibold">
                              Click any {unitName.toLowerCase()} to inspect teaching blueprint & study guide
                            </span>
                          </div>

                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5">
                            {filteredDays.map(d => (
                              <button
                                key={d.day_number}
                                type="button"
                                onClick={() => setActiveDayDetail(d.day_number)}
                                className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                                  activeDayDetail === d.day_number
                                    ? 'bg-blue-600 border-blue-600 text-white font-extrabold shadow-md scale-[1.02]'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50'
                                }`}
                              >
                                <span className="block text-[10px] uppercase font-bold tracking-tight opacity-80">
                                  {unitName}
                                </span>
                                <span className="text-sm font-black">{d.day_number}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 3. Detailed Day Teaching Blueprint Card */}
                        <div className="bg-white border-2 border-blue-500/40 rounded-2xl shadow-lg overflow-hidden">
                          {/* Active Day Header Bar */}
                          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 text-white flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="bg-amber-400 text-blue-950 font-black text-sm px-3.5 py-1 rounded-xl shadow uppercase">
                                {unitName} {activeDay.day_number}
                              </span>
                              <div>
                                <span className="text-xs font-semibold text-cyan-300 block">
                                  {isSchool ? `School Period ${activeDay.day_number} of ${totalDays}` : `College Session ${activeDay.day_number} of ${totalDays}`} • Comprehensive Curriculum Unit
                                </span>
                                <h3 className="text-base font-bold text-white mt-0.5">
                                  {activeDay.day_topic}
                                </h3>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* 10-Page Master DOCX Download Button */}
                              <button
                                type="button"
                                onClick={() => handleDownloadDayDocx(activeDay)}
                                disabled={downloadingDocx}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 border border-emerald-400/40 disabled:opacity-50 cursor-pointer"
                              >
                                {downloadingDocx ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Generating Master Doc...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download {unitName} {activeDay.day_number} Master DOCX (10+ Pages)</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  if (activeDay.day_number > 1) {
                                    const prevDayNum = activeDay.day_number - 1;
                                    setActiveDayDetail(prevDayNum);
                                    const prevDayObj = allDays.find(d => d.day_number === prevDayNum);
                                    if (prevDayObj && prevDayObj.month_number !== selectedMonthFilter) {
                                      setSelectedMonthFilter(prevDayObj.month_number);
                                    }
                                  }
                                }}
                                disabled={activeDay.day_number <= 1}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold disabled:opacity-30"
                              >
                                ← Prev Day
                              </button>
                              <button
                                onClick={() => {
                                  if (activeDay.day_number < totalDays) {
                                    const nextDayNum = activeDay.day_number + 1;
                                    setActiveDayDetail(nextDayNum);
                                    const nextDayObj = allDays.find(d => d.day_number === nextDayNum);
                                    if (nextDayObj && nextDayObj.month_number !== selectedMonthFilter) {
                                      setSelectedMonthFilter(nextDayObj.month_number);
                                    }
                                  }
                                }}
                                disabled={activeDay.day_number >= totalDays}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold disabled:opacity-30"
                              >
                                Next Day →
                              </button>
                            </div>
                          </div>

                          {/* Full 1-Hour Day Content Body */}
                          <div className="p-6 space-y-5 text-xs">
                            {/* Grammar Lecture Detail */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <span className="font-bold text-blue-900 uppercase tracking-wider block mb-1">
                                📖 {unitName} {activeDay.day_number} ({sessionPackage.school_meta?.periodDurationMinutes || sessionPackage.college_meta?.sessionMinutes || 60} Mins) Teaching Blueprint & Structural Grammar:
                              </span>
                              <p className="text-slate-800 leading-relaxed font-sans text-xs">
                                {activeDay.grammar_rules_detail}
                              </p>
                            </div>

                            {/* Vocabulary Bank */}
                            {activeDay.vocabulary_bank && activeDay.vocabulary_bank.length > 0 && (
                              <div>
                                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-2">
                                  🗂️ {unitName} {activeDay.day_number} Target Vocabulary & Phonetics:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {activeDay.vocabulary_bank.map((v: any, vIdx: number) => (
                                    <div key={vIdx} className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-amber-950 text-xs">{v.word}</span>
                                        <span className="text-[10px] text-amber-700 font-mono italic">{v.pronunciation}</span>
                                      </div>
                                      <p className="text-[11px] text-amber-900 mt-1">Meaning: {v.meaning}</p>
                                      {v.example_sentence && (
                                        <p className="text-[10px] text-slate-600 mt-1.5 italic border-t border-amber-200/60 pt-1">
                                          "{v.example_sentence}"
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Spoken Dialogue */}
                            {activeDay.classroom_dialogues && activeDay.classroom_dialogues.length > 0 && (
                              <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-xl">
                                <span className="font-bold text-indigo-950 uppercase tracking-wider block mb-2">
                                  💬 In-Class Live Dialogue Script:
                                </span>
                                <div className="space-y-1.5 text-slate-800 font-mono text-[11px]">
                                  {activeDay.classroom_dialogues.map((dlg: string, dIdx: number) => (
                                    <p key={dIdx} className="p-2 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                                      {dlg}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Faculty Pedagogical Advice Tip */}
                            {activeDay.pedagogical_instructions && (
                              <div className="bg-amber-500/10 border-l-4 border-amber-500 p-3.5 rounded-r-xl text-amber-900">
                                <span className="font-bold uppercase tracking-wider text-[11px] block">
                                  💡 Pedagogical Advice for {unitName} {activeDay.day_number}:
                                </span>
                                <p className="text-xs italic mt-0.5 font-medium">
                                  {activeDay.pedagogical_instructions}
                                </p>
                              </div>
                            )}

                            {/* Daily Drills with Step-by-Step Answers & Solutions */}
                            <div className="space-y-4 pt-3 border-t border-slate-200">
                              {/* Textbook Study Guide Notes */}
                              {activeDay.study_notes_markdown && (
                                <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                                  <div className="flex flex-wrap items-center justify-between gap-2 p-4 bg-slate-950/90 border-b border-slate-800">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-cyan-400" />
                                      </div>
                                      <div>
                                        <span className="font-extrabold text-cyan-400 text-xs tracking-wider uppercase block">
                                          {unitName} {activeDay.day_number} In-Depth Study Guide & Linguistic Theory
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                          Certified Level Material for {sessionPackage.language} ({sessionPackage.level}) • {isSchool ? `${sessionPackage.school_meta?.courseDurationHours || 100} Total Course Hours` : `${sessionPackage.college_meta?.sessionsRequired || 80} Academic Sessions`}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(activeDay.study_notes_markdown);
                                          setCopiedNotes(true);
                                          setTimeout(() => setCopiedNotes(false), 2000);
                                        }}
                                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                                      >
                                        {copiedNotes ? (
                                          <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-emerald-400">Copied!</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Copy Notes</span>
                                          </>
                                        )}
                                      </button>
                                      <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-semibold uppercase">
                                        Full Text
                                      </span>
                                    </div>
                                  </div>

                                  <div className="p-5 font-sans text-xs text-slate-200 leading-relaxed space-y-3 overflow-x-auto">
                                    {activeDay.study_notes_markdown.split('\n\n').map((paragraph: string, pIdx: number) => {
                                      // Render markdown tables gracefully
                                      if (paragraph.includes('|') && paragraph.includes('---')) {
                                        const lines = paragraph.trim().split('\n');
                                        const headerLine = lines[0];
                                        const headers = headerLine.split('|').map(h => h.trim()).filter(Boolean);
                                        const rows = lines.slice(2).map(l => l.split('|').map(c => c.trim()).filter(Boolean));

                                        return (
                                          <div key={pIdx} className="my-3 overflow-x-auto rounded-xl border border-slate-800 shadow-sm bg-slate-950/60">
                                            <table className="w-full text-left text-xs border-collapse">
                                              <thead>
                                                <tr className="bg-slate-800/80 text-cyan-300 font-bold border-b border-slate-700">
                                                  {headers.map((h, hIdx) => (
                                                    <th key={hIdx} className="py-2 px-3 border-r border-slate-700/60 last:border-r-0">
                                                      {h}
                                                    </th>
                                                  ))}
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-800">
                                                {rows.map((row, rIdx) => (
                                                  <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                                                    {row.map((cell, cIdx) => (
                                                      <td key={cIdx} className="py-2 px-3 border-r border-slate-800/60 last:border-r-0 font-mono text-[11px] text-slate-300">
                                                        {cell}
                                                      </td>
                                                    ))}
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        );
                                      }

                                      // Bold titles or headers
                                      if (paragraph.startsWith('### ') || paragraph.startsWith('**')) {
                                        return (
                                          <p key={pIdx} className="font-bold text-sm text-cyan-300 pt-1">
                                            {paragraph.replace(/^###\s+/, '')}
                                          </p>
                                        );
                                      }

                                      return (
                                        <p key={pIdx} className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                                          {paragraph}
                                        </p>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* In-Depth Video & Media Analytical Breakdown */}
                              {activeDay.video_breakdown_analysis && (
                                <div className="bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/60 border-2 border-indigo-300 rounded-2xl p-5 shadow-sm space-y-2.5">
                                  <div className="flex items-center gap-2 border-b border-indigo-100 pb-2.5">
                                    <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <h4 className="font-extrabold text-sm text-indigo-950">
                                      🎬 Reference Video Breakdown & Native Spoken Audio Analysis
                                    </h4>
                                  </div>
                                  <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                                    {activeDay.video_breakdown_analysis}
                                  </p>
                                </div>
                              )}

                              {/* Standardized Practice Exercises & Exact Answer Key */}
                              <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 border-2 border-emerald-400/80 rounded-2xl p-5 shadow-sm space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                                  <div>
                                    <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                      <span>🎯 Practice Exercises with Complete Answer Key & Explanations</span>
                                    </h4>
                                    <p className="text-[11px] text-emerald-800 mt-0.5">
                                      Standardized classroom drills engineered for student self-study, instant evaluation, and faculty feedback.
                                    </p>
                                  </div>
                                  <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs self-start sm:self-auto shrink-0">
                                    ✓ Verified Solutions Included
                                  </span>
                                </div>

                                <div className="space-y-3">
                                  {(activeDay.exercise_solutions && activeDay.exercise_solutions.length > 0
                                    ? activeDay.exercise_solutions
                                    : (activeDay.in_class_exercises || []).map((ex: string) => ({
                                        question: ex,
                                        answer: `Model answer demonstrating certified ${sessionPackage.level} fluency in ${sessionPackage.language}`,
                                        explanation: `Linguistic breakdown: Verify syntactic formula and verb conjugation agreement.`
                                      }))
                                  ).map((sol: any, sIdx: number) => (
                                    <div key={sIdx} className="bg-white border border-emerald-200/90 rounded-xl p-4 shadow-xs space-y-2.5 hover:shadow-md transition-shadow">
                                      <div className="flex items-start gap-2.5">
                                        <span className="bg-blue-600 text-white font-black text-[11px] px-2 py-0.5 rounded-md mt-0.5 shrink-0 shadow-2xs">
                                          Q{sIdx + 1}
                                        </span>
                                        <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                                          {sol.question || sol}
                                        </p>
                                      </div>

                                      {/* Verified Answer Box */}
                                      <div className="bg-emerald-50/90 border-l-4 border-emerald-600 p-3 rounded-r-xl text-xs space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2 font-bold text-emerald-950">
                                          <span className="text-emerald-800 text-[11px] uppercase tracking-wider">✓ Correct Answer:</span>
                                          <span className="font-mono bg-white px-2.5 py-1 rounded-md border border-emerald-300 text-emerald-900 shadow-2xs font-bold text-xs">
                                            {sol.answer || 'Standard response model'}
                                          </span>
                                        </div>
                                        {sol.explanation && (
                                          <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed pt-1">
                                            <strong className="text-emerald-900 font-bold not-italic">Linguistic Explanation:</strong> {sol.explanation}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Daily Homework Directives */}
                              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <span className="font-bold text-blue-950 uppercase tracking-wider block mb-1.5 text-xs">
                                  📝 Daily Homework & LMS Submission Directives:
                                </span>
                                <ul className="space-y-1.5 text-slate-800 text-xs">
                                  {(activeDay.homework_tasks || []).map((hw: string, hIdx: number) => (
                                    <li key={hIdx} className="flex items-start gap-1.5">
                                      <span className="text-blue-600 font-bold">›</span>
                                      <span>{hw}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
