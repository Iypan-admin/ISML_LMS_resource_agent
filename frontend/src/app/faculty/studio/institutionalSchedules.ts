// =============================================================================
// ISML INSTITUTIONAL CURRICULUM MATRICES
// Official Specifications for Schools (K-12 Periods) & Colleges (Tracks)
// =============================================================================

export type InstitutionType = 'SCHOOL' | 'COLLEGE';

// -----------------------------------------------------------------------------
// 1. SCHOOL SPECIFICATION (K-12 PERIOD MATRIX)
// Categories 1 to 6 (35 min to 60 min per period)
// -----------------------------------------------------------------------------
export type SchoolCategoryKey = 'CAT_1' | 'CAT_2' | 'CAT_3' | 'CAT_4' | 'CAT_5' | 'CAT_6';

export interface SchoolCategoryMeta {
  key: SchoolCategoryKey;
  label: string;
  durationMinutes: number; // e.g. 35, 40, 45, 50, 55, 60
  badgeColor: string;
  description: string;
}

export const SCHOOL_CATEGORIES: Record<SchoolCategoryKey, SchoolCategoryMeta> = {
  CAT_1: {
    key: 'CAT_1',
    label: 'Cat 1 - 35 mins / period',
    durationMinutes: 35,
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    description: '35 minutes per period standard school slot.'
  },
  CAT_2: {
    key: 'CAT_2',
    label: 'Cat 2 - 40 mins / period',
    durationMinutes: 40,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: '40 minutes per period primary/middle school slot.'
  },
  CAT_3: {
    key: 'CAT_3',
    label: 'Cat 3 - 45 mins / period',
    durationMinutes: 45,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: '45 minutes per period standard secondary school block.'
  },
  CAT_4: {
    key: 'CAT_4',
    label: 'Cat 4 - 50 mins / period',
    durationMinutes: 50,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: '50 minutes per period high school block.'
  },
  CAT_5: {
    key: 'CAT_5',
    label: 'Cat 5 - 55 mins / period',
    durationMinutes: 55,
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
    description: '55 minutes per period senior high block.'
  },
  CAT_6: {
    key: 'CAT_6',
    label: 'Cat 6 - 60 mins / period',
    durationMinutes: 60,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: '60 minutes per period full hour school block.'
  }
};

export interface SchoolLevelSchedule {
  level: string; // A1.1, A1.2, A2.1, A2.2, A2.3, B1.1, B1.2, B1.3, B1.4
  courseDurationHours: number; // 60, 80, 100
  assessmentsCount: number; // 4, 5, 6
  humanPracticeMinutesPer2Weeks: number; // 10, 15, 20
  aiPracticePerDay: number; // 2, 3, 4
  categoryPeriods: Record<SchoolCategoryKey, {
    periodsPerWeek: number;
    totalPeriods: number;
  }>;
}

export const SCHOOL_LEVEL_SCHEDULES: SchoolLevelSchedule[] = [
  {
    level: 'A1.1',
    courseDurationHours: 60,
    assessmentsCount: 4,
    humanPracticeMinutesPer2Weeks: 10,
    aiPracticePerDay: 2,
    categoryPeriods: {
      CAT_1: { periodsPerWeek: 3, totalPeriods: 103 },
      CAT_2: { periodsPerWeek: 3, totalPeriods: 90 },
      CAT_3: { periodsPerWeek: 3, totalPeriods: 80 },
      CAT_4: { periodsPerWeek: 3, totalPeriods: 72 },
      CAT_5: { periodsPerWeek: 2, totalPeriods: 70 },
      CAT_6: { periodsPerWeek: 2, totalPeriods: 70 },
    }
  },
  {
    level: 'A1.2',
    courseDurationHours: 60,
    assessmentsCount: 4,
    humanPracticeMinutesPer2Weeks: 10,
    aiPracticePerDay: 2,
    categoryPeriods: {
      CAT_1: { periodsPerWeek: 3, totalPeriods: 103 },
      CAT_2: { periodsPerWeek: 3, totalPeriods: 90 },
      CAT_3: { periodsPerWeek: 3, totalPeriods: 80 },
      CAT_4: { periodsPerWeek: 3, totalPeriods: 72 },
      CAT_5: { periodsPerWeek: 2, totalPeriods: 70 },
      CAT_6: { periodsPerWeek: 2, totalPeriods: 70 },
    }
  },
  {
    level: 'A2.1',
    courseDurationHours: 80,
    assessmentsCount: 5,
    humanPracticeMinutesPer2Weeks: 15,
    aiPracticePerDay: 3,
    categoryPeriods: {
      CAT_1: { periodsPerWeek: 4, totalPeriods: 138 },
      CAT_2: { periodsPerWeek: 4, totalPeriods: 120 },
      CAT_3: { periodsPerWeek: 3, totalPeriods: 107 },
      CAT_4: { periodsPerWeek: 3, totalPeriods: 96 },
      CAT_5: { periodsPerWeek: 3, totalPeriods: 105 },
      CAT_6: { periodsPerWeek: 3, totalPeriods: 105 },
    }
  },
  {
    level: 'A2.2',
    courseDurationHours: 80,
    assessmentsCount: 5,
    humanPracticeMinutesPer2Weeks: 15,
    aiPracticePerDay: 3,
    categoryPeriods: {
      CAT_1: { periodsPerWeek: 4, totalPeriods: 138 },
      CAT_2: { periodsPerWeek: 4, totalPeriods: 120 },
      CAT_3: { periodsPerWeek: 3, totalPeriods: 107 },
      CAT_4: { periodsPerWeek: 3, totalPeriods: 96 },
      CAT_5: { periodsPerWeek: 3, totalPeriods: 105 },
      CAT_6: { periodsPerWeek: 3, totalPeriods: 105 },
    }
  },
  {
    level: 'A2.3',
    courseDurationHours: 80,
    assessmentsCount: 5,
    humanPracticeMinutesPer2Weeks: 15,
    aiPracticePerDay: 3,
    categoryPeriods: {
      CAT_1: { periodsPerWeek: 4, totalPeriods: 138 },
      CAT_2: { periodsPerWeek: 4, totalPeriods: 120 },
      CAT_3: { periodsPerWeek: 3, totalPeriods: 107 },
      CAT_4: { periodsPerWeek: 3, totalPeriods: 96 },
      CAT_5: { periodsPerWeek: 3, totalPeriods: 105 },
      CAT_6: { periodsPerWeek: 3, totalPeriods: 105 },
    }
  },
  {
    level: 'B1.1',
    courseDurationHours: 100,
    assessmentsCount: 6,
    humanPracticeMinutesPer2Weeks: 20,
    aiPracticePerDay: 4,
    categoryPeriods: {
      CAT_1: { periodsPerWeek: 5, totalPeriods: 172 },
      CAT_2: { periodsPerWeek: 4, totalPeriods: 150 },
      CAT_3: { periodsPerWeek: 4, totalPeriods: 134 },
      CAT_4: { periodsPerWeek: 4, totalPeriods: 120 },
      CAT_5: { periodsPerWeek: 4, totalPeriods: 140 },
      CAT_6: { periodsPerWeek: 3, totalPeriods: 105 },
    }
  },
  {
    level: 'B1.2',
    courseDurationHours: 100,
    assessmentsCount: 6,
    humanPracticeMinutesPer2Weeks: 20,
    aiPracticePerDay: 4,
    categoryPeriods: {
      CAT_1: { periodsPerWeek: 5, totalPeriods: 172 },
      CAT_2: { periodsPerWeek: 4, totalPeriods: 150 },
      CAT_3: { periodsPerWeek: 4, totalPeriods: 134 },
      CAT_4: { periodsPerWeek: 4, totalPeriods: 120 },
      CAT_5: { periodsPerWeek: 4, totalPeriods: 140 },
      CAT_6: { periodsPerWeek: 3, totalPeriods: 105 },
    }
  },
  {
    level: 'B1.3',
    courseDurationHours: 100,
    assessmentsCount: 6,
    humanPracticeMinutesPer2Weeks: 20,
    aiPracticePerDay: 4,
    categoryPeriods: {
      CAT_1: { periodsPerWeek: 5, totalPeriods: 172 },
      CAT_2: { periodsPerWeek: 4, totalPeriods: 150 },
      CAT_3: { periodsPerWeek: 4, totalPeriods: 134 },
      CAT_4: { periodsPerWeek: 4, totalPeriods: 120 },
      CAT_5: { periodsPerWeek: 4, totalPeriods: 140 },
      CAT_6: { periodsPerWeek: 3, totalPeriods: 105 },
    }
  },
  {
    level: 'B1.4',
    courseDurationHours: 100,
    assessmentsCount: 6,
    humanPracticeMinutesPer2Weeks: 20,
    aiPracticePerDay: 4,
    categoryPeriods: {
      CAT_1: { periodsPerWeek: 5, totalPeriods: 172 },
      CAT_2: { periodsPerWeek: 4, totalPeriods: 150 },
      CAT_3: { periodsPerWeek: 4, totalPeriods: 134 },
      CAT_4: { periodsPerWeek: 4, totalPeriods: 120 },
      CAT_5: { periodsPerWeek: 4, totalPeriods: 140 },
      CAT_6: { periodsPerWeek: 3, totalPeriods: 105 },
    }
  }
];

// Helper to lookup School schedule
export function getSchoolSchedule(level: string, category: SchoolCategoryKey) {
  const match = SCHOOL_LEVEL_SCHEDULES.find(s => s.level.toLowerCase() === level.toLowerCase()) || SCHOOL_LEVEL_SCHEDULES[0];
  const cat = match.categoryPeriods[category] || match.categoryPeriods.CAT_1;
  const catMeta = SCHOOL_CATEGORIES[category] || SCHOOL_CATEGORIES.CAT_1;

  return {
    level: match.level,
    courseDurationHours: match.courseDurationHours,
    assessmentsCount: match.assessmentsCount,
    humanPracticeMinutesPer2Weeks: match.humanPracticeMinutesPer2Weeks,
    aiPracticePerDay: match.aiPracticePerDay,
    categoryKey: category,
    categoryLabel: catMeta.label,
    periodDurationMinutes: catMeta.durationMinutes,
    periodsPerWeek: cat.periodsPerWeek,
    totalPeriods: cat.totalPeriods,
  };
}

// -----------------------------------------------------------------------------
// 2. COLLEGE SPECIFICATION (STANDARD, INTENSIVE, SUPER-INTENSIVE)
// Languages: French / German / Spanish / Korean & Japanese
// -----------------------------------------------------------------------------
export type CollegeTrackKey = 'STANDARD' | 'INTENSIVE' | 'SUPER_INTENSIVE';

export interface CollegeTrackMeta {
  key: CollegeTrackKey;
  label: string;
  sessionMinutes: number; // Standard = 60, Intensive = 90, Super-Intensive = 120
  badgeColor: string;
  description: string;
}

export const COLLEGE_TRACKS: Record<CollegeTrackKey, CollegeTrackMeta> = {
  STANDARD: {
    key: 'STANDARD',
    label: 'Standard (60 min/session)',
    sessionMinutes: 60,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Comprehensive college semester track with 60-minute teaching sessions.'
  },
  INTENSIVE: {
    key: 'INTENSIVE',
    label: 'Intensive (90 min/session)',
    sessionMinutes: 90,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Accelerated immersion track with 90-minute intensive sessions.'
  },
  SUPER_INTENSIVE: {
    key: 'SUPER_INTENSIVE',
    label: 'Super-Intensive (120 min/session)',
    sessionMinutes: 120,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Fast-track immersion with 120-minute master lecture blocks.'
  }
};

export interface CollegeTrackDetail {
  sessionMinutes: number;
  sessionsRequired: number;
  sessionsPerWeek: number;
  monthsRequired: number;
}

export interface CollegeLevelSchedule {
  languages: string[]; // ['French', 'German', 'Spanish', 'Korean'] or ['Japanese']
  level: string; // A1 / L1, A2 / L2, B1 / L3, B2 / L4, N5, N4, N3, N2
  courseDurationHours: number; // 80, 100, 140, 180, 100, 120, 160, 200
  assessmentsCount: number; // 4, 4, 5, 5, 5, 5, 6, 6
  humanPracticeMinutesPerWeek: number; // 10, 20, 30, 40
  aiPracticePerDay: number; // 3, 5, 7, 10
  tracks: Record<CollegeTrackKey, CollegeTrackDetail>;
}

export const COLLEGE_LEVEL_SCHEDULES: CollegeLevelSchedule[] = [
  // European & Korean (French / German / Spanish / Korean)
  {
    languages: ['French', 'German', 'Spanish', 'Korean'],
    level: 'A1 / L1',
    courseDurationHours: 80,
    assessmentsCount: 4,
    humanPracticeMinutesPerWeek: 10,
    aiPracticePerDay: 3,
    tracks: {
      STANDARD: { sessionMinutes: 60, sessionsRequired: 80, sessionsPerWeek: 2, monthsRequired: 11 },
      INTENSIVE: { sessionMinutes: 90, sessionsRequired: 54, sessionsPerWeek: 2, monthsRequired: 7 },
      SUPER_INTENSIVE: { sessionMinutes: 120, sessionsRequired: 40, sessionsPerWeek: 3, monthsRequired: 4 }, // derived from 80h / 2h = 40 sessions
    }
  },
  {
    languages: ['French', 'German', 'Spanish', 'Korean'],
    level: 'A2 / L2',
    courseDurationHours: 100,
    assessmentsCount: 4,
    humanPracticeMinutesPerWeek: 20,
    aiPracticePerDay: 5,
    tracks: {
      STANDARD: { sessionMinutes: 60, sessionsRequired: 100, sessionsPerWeek: 3, monthsRequired: 8 },
      INTENSIVE: { sessionMinutes: 90, sessionsRequired: 67, sessionsPerWeek: 3, monthsRequired: 6 },
      SUPER_INTENSIVE: { sessionMinutes: 120, sessionsRequired: 50, sessionsPerWeek: 3, monthsRequired: 4 },
    }
  },
  {
    languages: ['French', 'German', 'Spanish', 'Korean'],
    level: 'B1 / L3',
    courseDurationHours: 140,
    assessmentsCount: 5,
    humanPracticeMinutesPerWeek: 30,
    aiPracticePerDay: 7,
    tracks: {
      STANDARD: { sessionMinutes: 60, sessionsRequired: 140, sessionsPerWeek: 4, monthsRequired: 8 },
      INTENSIVE: { sessionMinutes: 90, sessionsRequired: 94, sessionsPerWeek: 4, monthsRequired: 6 },
      SUPER_INTENSIVE: { sessionMinutes: 120, sessionsRequired: 70, sessionsPerWeek: 4, monthsRequired: 4 },
    }
  },
  {
    languages: ['French', 'German', 'Spanish', 'Korean'],
    level: 'B2 / L4',
    courseDurationHours: 180,
    assessmentsCount: 5,
    humanPracticeMinutesPerWeek: 40,
    aiPracticePerDay: 10,
    tracks: {
      STANDARD: { sessionMinutes: 60, sessionsRequired: 180, sessionsPerWeek: 5, monthsRequired: 9 },
      INTENSIVE: { sessionMinutes: 90, sessionsRequired: 120, sessionsPerWeek: 5, monthsRequired: 6 },
      SUPER_INTENSIVE: { sessionMinutes: 120, sessionsRequired: 90, sessionsPerWeek: 5, monthsRequired: 5 },
    }
  },

  // Japanese (JLPT N5 -> N2)
  {
    languages: ['Japanese'],
    level: 'N5',
    courseDurationHours: 100,
    assessmentsCount: 5,
    humanPracticeMinutesPerWeek: 10,
    aiPracticePerDay: 3,
    tracks: {
      STANDARD: { sessionMinutes: 60, sessionsRequired: 100, sessionsPerWeek: 3, monthsRequired: 8 },
      INTENSIVE: { sessionMinutes: 90, sessionsRequired: 67, sessionsPerWeek: 2, monthsRequired: 8 },
      SUPER_INTENSIVE: { sessionMinutes: 120, sessionsRequired: 50, sessionsPerWeek: 3, monthsRequired: 4 },
    }
  },
  {
    languages: ['Japanese'],
    level: 'N4',
    courseDurationHours: 120,
    assessmentsCount: 5,
    humanPracticeMinutesPerWeek: 20,
    aiPracticePerDay: 5,
    tracks: {
      STANDARD: { sessionMinutes: 60, sessionsRequired: 120, sessionsPerWeek: 3, monthsRequired: 10 },
      INTENSIVE: { sessionMinutes: 90, sessionsRequired: 80, sessionsPerWeek: 3, monthsRequired: 7 },
      SUPER_INTENSIVE: { sessionMinutes: 120, sessionsRequired: 60, sessionsPerWeek: 3, monthsRequired: 5 },
    }
  },
  {
    languages: ['Japanese'],
    level: 'N3',
    courseDurationHours: 160,
    assessmentsCount: 6,
    humanPracticeMinutesPerWeek: 30,
    aiPracticePerDay: 7,
    tracks: {
      STANDARD: { sessionMinutes: 60, sessionsRequired: 160, sessionsPerWeek: 4, monthsRequired: 10 },
      INTENSIVE: { sessionMinutes: 90, sessionsRequired: 107, sessionsPerWeek: 4, monthsRequired: 7 },
      SUPER_INTENSIVE: { sessionMinutes: 120, sessionsRequired: 80, sessionsPerWeek: 4, monthsRequired: 5 },
    }
  },
  {
    languages: ['Japanese'],
    level: 'N2',
    courseDurationHours: 200,
    assessmentsCount: 6,
    humanPracticeMinutesPerWeek: 40,
    aiPracticePerDay: 10,
    tracks: {
      STANDARD: { sessionMinutes: 60, sessionsRequired: 200, sessionsPerWeek: 5, monthsRequired: 10 },
      INTENSIVE: { sessionMinutes: 90, sessionsRequired: 134, sessionsPerWeek: 5, monthsRequired: 7 },
      SUPER_INTENSIVE: { sessionMinutes: 120, sessionsRequired: 100, sessionsPerWeek: 5, monthsRequired: 5 },
    }
  }
];

// Helper to lookup College schedule
export function getCollegeSchedule(language: string, level: string, track: CollegeTrackKey) {
  const isJapanese = language.toLowerCase() === 'japanese';
  const filtered = COLLEGE_LEVEL_SCHEDULES.filter(s =>
    isJapanese ? s.languages.includes('Japanese') : s.languages.includes('French')
  );

  // Normalize match
  const match = filtered.find(s => {
    const cleanLvl = level.toUpperCase().replace(/\s+/g, '');
    const candidateLvl = s.level.toUpperCase().replace(/\s+/g, '');
    return candidateLvl.includes(cleanLvl) || cleanLvl.includes(candidateLvl.split('/')[0]);
  }) || filtered[0];

  const trackData = match.tracks[track] || match.tracks.STANDARD;
  const trackMeta = COLLEGE_TRACKS[track] || COLLEGE_TRACKS.STANDARD;

  return {
    level: match.level,
    courseDurationHours: match.courseDurationHours,
    assessmentsCount: match.assessmentsCount,
    humanPracticeMinutesPerWeek: match.humanPracticeMinutesPerWeek,
    aiPracticePerDay: match.aiPracticePerDay,
    trackKey: track,
    trackLabel: trackMeta.label,
    sessionMinutes: trackData.sessionMinutes,
    sessionsRequired: trackData.sessionsRequired,
    sessionsPerWeek: trackData.sessionsPerWeek,
    monthsRequired: trackData.monthsRequired,
  };
}
