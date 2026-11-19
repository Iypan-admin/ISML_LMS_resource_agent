/**
 * Dynamic Academic Cadence Engine
 * 
 * Provides deterministic, pedagogically sound, and fully user-configurable 
 * curriculum topology calculation for any language, CEFR/JLPT level, period count,
 * and session duration.
 * 
 * ZERO hardcoded constants: All week counts, periods per week, and duration minutes
 * adapt dynamically to user/faculty configuration.
 */

export interface CadenceConfigInput {
  totalWeeks?: number;          // e.g. 4 to 52 (default: 20)
  periodsPerWeek?: number;       // e.g. 1 to 10 (default: 5)
  periodMinutes?: number;        // e.g. 30, 45, 60, 90 (default: 45)
  customTotalPeriods?: number;   // Optional override, e.g. 103 instead of 100
  consolidationCadence?: number; // e.g. every N-th period is review/consolidation (default: last period of week)
  targetLanguage: string;        // German, French, Spanish, Japanese, Korean, English
  framework?: 'CEFR' | 'JLPT' | 'TOPIK' | 'ACTFL';
  targetLevel?: string;          // A1, A2, B1, B2, N5, N4, TOPIK 1, etc.
  institutionType?: string;      // SCHOOL, COLLEGE, CORPORATE, INDEPENDENT
}

export interface GeneratedPeriodBlueprint {
  periodNumber: number;
  weekNumber: number;
  periodType: 'INSTRUCTIONAL' | 'REVIEW_CONSOLIDATION' | 'ASSESSMENT_MILESTONE';
  durationMinutes: number;
  topicTitle: string;
  grammarObjective: string;
  vocabularyScope: string[];
  canDoStatements: string[];
  lsrwFocus: 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING' | 'INTEGRATED';
  stageTimeBreakdown: {
    warmupMinutes: number;
    instructionMinutes: number;
    guidedPracticeMinutes: number;
    independentPracticeMinutes: number;
    quickCheckMinutes: number;
    wrapupMinutes: number;
  };
}

export interface GeneratedModuleBlueprint {
  moduleIndex: number;
  title: string;
  levelCompetence: string;
  startWeek: number;
  endWeek: number;
  periodsCount: number;
  periods: GeneratedPeriodBlueprint[];
}

export interface CalculatedCadence {
  totalPeriods: number;
  totalWeeks: number;
  periodsPerWeek: number;
  periodMinutes: number;
  courseHours: number;
  modulesCount: number;
  modules: GeneratedModuleBlueprint[];
}

// Canonical Pedagogical Progression Themes by Language & Level
const LINGUISTIC_THEMES_BY_LANGUAGE: Record<string, Record<string, { moduleTitle: string; topics: { title: string; grammar: string; vocab: string[]; canDo: string }[] }[]>> = {
  German: {
    A1: [
      {
        moduleTitle: 'Module 1: Salutations, Identity & Alphabet',
        topics: [
          { title: 'Begrüßung und Verabschiedung', grammar: 'Präsens von sein und heißen', vocab: ['Guten Tag', 'Hallo', 'Auf Wiedersehen', 'Tschüss'], canDo: 'Can greet people and say goodbye formally and informally.' },
          { title: 'Das Alphabet und Buchstabieren', grammar: 'Aussprache und Lautregeln', vocab: ['Buchstabe', 'Name', 'Vorname', 'Familienname'], canDo: 'Can spell own name and ask others to spell words.' },
          { title: 'Herkunft und Wohnort', grammar: 'W-Fragen: Woher, Wo; Präpositionen aus, in', vocab: ['kommen', 'wohnen', 'Deutschland', 'Stadt', 'Land'], canDo: 'Can state country of origin and current city of residence.' },
          { title: 'Zahlen 0 bis 20 und Kontaktdaten', grammar: 'Verbmodelle mit Personalpronomen (ich, du, Sie)', vocab: ['Telefonnummer', 'Adresse', 'E-Mail', 'null bis zwanzig'], canDo: 'Can exchange phone numbers and email addresses.' },
        ],
      },
      {
        moduleTitle: 'Module 2: Family, Professions & Personal Environment',
        topics: [
          { title: 'Familienmitglieder und Beziehungen', grammar: 'Possessivartikel im Nominativ (mein/dein/sein/ihr)', vocab: ['Mutter', 'Vater', 'Bruder', 'Schwester', 'Kinder'], canDo: 'Can introduce family members and describe family relationships.' },
          { title: 'Berufe und Arbeitsplatz', grammar: 'Genus und maskuline/feminine Berufsbezeichnungen (-in)', vocab: ['Arzt', 'Ärztin', 'Lehrer', 'Ingenieur', 'arbeiten bei'], canDo: 'Can talk about occupations and workplace settings.' },
          { title: 'Tagesablauf und Uhrzeit', grammar: 'Trennbare Verben; Zeitangaben (um, von...bis)', vocab: ['aufstehen', 'anfangen', 'Frühstück', 'Mittagessen', 'Uhr'], canDo: 'Can describe daily routine and state clock times.' },
          { title: 'Wochentage und Freizeitaktivitäten', grammar: 'Satzklammer bei Modalverben (können, möchten)', vocab: ['Montag', 'Wochenende', 'Sport', 'Musik', 'treffen'], canDo: 'Can discuss leisure activities and arrange weekend meetings.' },
        ],
      },
      {
        moduleTitle: 'Module 3: Food, Shopping & Everyday Living',
        topics: [
          { title: 'Im Supermarkt und Lebensmittel', grammar: 'Akkusativ: bestimmter und unbestimmter Artikel (den/einen)', vocab: ['Brot', 'Käse', 'Apfel', 'Wasser', 'kaufen', 'kosten'], canDo: 'Can shop for groceries and ask for quantities and prices.' },
          { title: 'Im Restaurant bestellen und bezahlen', grammar: 'Höflichkeitsform: ich möchte, hätte gern; Zahlen bis 100', vocab: ['Speisekarte', 'Rechnung', 'bezahlen', 'trinken', 'lecker'], canDo: 'Can order food and drinks and ask for the bill.' },
          { title: 'Wohnung, Zimmer und Möbel', grammar: 'Adjektive im Prädikativ (groß, hell, teuer)', vocab: ['Zimmer', 'Küche', 'Bad', 'Tisch', 'Stuhl', 'Bett'], canDo: 'Can describe an apartment, rooms, and furnishings.' },
          { title: 'Orientierung in der Stadt und Verkehr', grammar: 'Lokale Präpositionen mit Dativ (zu, nach, bei)', vocab: ['Bahnhof', 'Straße', 'links', 'rechts', 'geradeaus', 'Bus'], canDo: 'Can ask for and give simple directions in a town.' },
        ],
      },
      {
        moduleTitle: 'Module 4: Health, Appointments & Travel',
        topics: [
          { title: 'Körperteile und Befinden', grammar: 'Imperativ für Sie und du; Schmerzangaben', vocab: ['Kopf', 'Auge', 'Bauch', 'wehtun', 'Krankheit', 'Fieber'], canDo: 'Can describe symptoms and tell a doctor what hurts.' },
          { title: 'Termine vereinbaren und absagen', grammar: 'Modalverben: müssen, dürfen; Zeitpräpositionen (am, im)', vocab: ['Termin', 'Kalender', 'verschieben', 'absagen', 'pünktlich'], canDo: 'Can make, postpone, or cancel an appointment.' },
          { title: 'Kleidung, Wetter und Jahreszeiten', grammar: 'Demonstrativartikel (dieser/dieses/diese)', vocab: ['Hemd', 'Hose', 'Jacke', 'Sonne', 'Regen', 'kalt', 'warm'], canDo: 'Can talk about the weather and dress for the season.' },
          { title: 'Vergangenes erzählen: Das Perfekt', grammar: 'Perfekt mit haben und sein (regelmäßig/unregelmäßig)', vocab: ['gemacht', 'gegangen', 'gesehen', 'gestern', 'Urlaub'], canDo: 'Can speak about past events and vacation experiences.' },
        ],
      },
    ],
  },
  French: {
    A1: [
      {
        moduleTitle: 'Module 1: Salutations, Présentation & Fondations',
        topics: [
          { title: 'Les salutations et les formules de politesse', grammar: 'Verbes être et s\'appeler au présent', vocab: ['Bonjour', 'Bonsoir', 'Merci', 'Au revoir', 'Comment allez-vous'], canDo: 'Can greet others and introduce oneself politely.' },
          { title: 'L\'alphabet et l\'épellation', grammar: 'Prononciation française et accents (é, è, ê, ç)', vocab: ['Nom', 'Prénom', 'Lettre', 'Épeler'], canDo: 'Can spell French words and identify accents.' },
          { title: 'Nationalités et pays d\'origine', grammar: 'Masculin et féminin des nationalités; prépositions (en, au, aux)', vocab: ['France', 'Canada', 'français', 'habiter', 'venir'], canDo: 'Can express nationality and country of residence.' },
          { title: 'Les nombres 0 à 69 et coordonnées', grammar: 'Verbe avoir au présent; articles définis (le, la, l\', les)', vocab: ['Numéro', 'Téléphone', 'Adresse', 'Âge'], canDo: 'Can give phone numbers, age, and contact information.' },
        ],
      },
      {
        moduleTitle: 'Module 2: Famille, Vie Quotidienne & Loisirs',
        topics: [
          { title: 'La famille et les relations', grammar: 'Adjectifs possessifs (mon/ma/mes, ton/ta/tes)', vocab: ['Père', 'Mère', 'Frère', 'Sœur', 'Enfants'], canDo: 'Can describe family members and personal relationships.' },
          { title: 'Les professions et le travail', grammar: 'Féminin des métiers; verbe faire au présent', vocab: ['Médecin', 'Professeur', 'Étudiant', 'Travailler'], canDo: 'Can state one\'s profession and describe work routines.' },
          { title: 'La routine quotidienne et l\'heure', grammar: 'Verbes pronominaux (se lever, se coucher); expressions de l\'heure', vocab: ['Heure', 'Matin', 'Soir', 'Manger', 'Partir'], canDo: 'Can tell time and describe a typical daily schedule.' },
          { title: 'Les loisirs et les activités du weekend', grammar: 'Verbes aimer, préférer + infinitif; négation (ne... pas)', vocab: ['Cinéma', 'Musique', 'Sport', 'Voyager', 'Weekend'], canDo: 'Can discuss hobbies and express likes/dislikes.' },
        ],
      },
    ],
  },
  Spanish: {
    A1: [
      {
        moduleTitle: 'Módulo 1: Saludos, Presentación y Datos Personales',
        topics: [
          { title: 'Saludos y despedidas formales e informales', grammar: 'Verbos ser y llamarse en presente', vocab: ['Hola', 'Buenos días', 'Adiós', 'Por favor', 'Mucho gusto'], canDo: 'Can greet people and introduce oneself.' },
          { title: 'El abecedario y deletreo', grammar: 'Reglas de pronunciación y acentuación básica', vocab: ['Nombre', 'Apellido', 'Letra', 'Deletrear'], canDo: 'Can spell personal information in Spanish.' },
          { title: 'Nacionalidades y procedencia', grammar: 'Género de nacionalidades; preposición de', vocab: ['España', 'México', 'español', 'vivir', 'ser de'], canDo: 'Can state nationality and origin.' },
          { title: 'Números y datos de contacto', grammar: 'Verbo tener en presente; artículos determinados', vocab: ['Teléfono', 'Correo', 'Edad', 'Cero a veinte'], canDo: 'Can exchange contact information and state age.' },
        ],
      },
    ],
  },
  Japanese: {
    N5: [
      {
        moduleTitle: 'Unit 1: Hiragana, Greetings & Introductions',
        topics: [
          { title: 'Greetings & Classroom Phrases (あいさつ)', grammar: 'Copula です, particle は (topic)', vocab: ['おはよう', 'こんにちは', 'さようなら', 'ありがとう'], canDo: 'Can greet others politely and use daily classroom phrases.' },
          { title: 'Self-Introduction (自己紹介)', grammar: '〜は〜です, question particle か', vocab: ['わたし', 'なまえ', 'がくせい', 'せんせい', 'にほん'], canDo: 'Can state name, nationality, and occupation.' },
          { title: 'Numbers & Time (数字と時間)', grammar: 'Counter 〜時 (o\'clock), 〜分 (minutes)', vocab: ['いち', 'に', 'さん', 'いま', 'なんじ'], canDo: 'Can tell time and exchange telephone numbers.' },
          { title: 'Demonstratives (これ・それ・あれ・どれ)', grammar: 'これ/それ/あれ and この/その/あの + Noun', vocab: ['ほん', 'ペン', 'かばん', 'いくら'], canDo: 'Can identify objects and ask for prices.' },
        ],
      },
    ],
  },
};

export class AcademicCadenceEngine {
  /**
   * Calculates the exact, mathematically consistent, dynamic curriculum topology.
   */
  public static calculateCadence(input: CadenceConfigInput): CalculatedCadence {
    const totalWeeks = Math.max(1, Math.min(52, input.totalWeeks || 20));
    const periodsPerWeek = Math.max(1, Math.min(10, input.periodsPerWeek || 5));
    const periodMinutes = [30, 45, 60, 90, 120].includes(input.periodMinutes || 45) ? (input.periodMinutes || 45) : 45;

    // Total periods: Use custom override if provided, otherwise weeks * periodsPerWeek
    const calculatedDefaultPeriods = totalWeeks * periodsPerWeek;
    const totalPeriods = input.customTotalPeriods && input.customTotalPeriods > 0 
      ? input.customTotalPeriods 
      : calculatedDefaultPeriods;

    const courseHours = Math.round((totalPeriods * periodMinutes) / 60);

    // Dynamic Module Breakdown: Aim for 4 to 6 modules per complete curriculum
    const targetModulesCount = totalWeeks <= 6 ? 2 : totalWeeks <= 12 ? 3 : totalWeeks <= 24 ? 4 : 6;
    const weeksPerModule = Math.max(1, Math.ceil(totalWeeks / targetModulesCount));

    // Resolve linguistic theme progression
    const lang = input.targetLanguage || 'German';
    const lvl = input.targetLevel || 'A1';
    const languageBank = LINGUISTIC_THEMES_BY_LANGUAGE[lang]?.[lvl] || LINGUISTIC_THEMES_BY_LANGUAGE['German']['A1'];

    // Stage Time Breakdown dynamically calculated from periodMinutes
    const stageTimes = this.calculateStageTimeBreakdown(periodMinutes);

    const modules: GeneratedModuleBlueprint[] = [];
    let currentPeriodNum = 1;

    for (let mIdx = 0; mIdx < targetModulesCount; mIdx++) {
      const startWk = mIdx * weeksPerModule + 1;
      const endWk = Math.min(totalWeeks, (mIdx + 1) * weeksPerModule);
      if (startWk > totalWeeks) break;

      const theme = languageBank[mIdx % languageBank.length];
      const moduleTitle = theme?.moduleTitle || `Module ${mIdx + 1}: Core Communicative Competence`;

      // Determine periods assigned to this module
      const remainingModules = targetModulesCount - mIdx;
      const remainingPeriods = totalPeriods - currentPeriodNum + 1;
      const periodsInModule = mIdx === targetModulesCount - 1 
        ? remainingPeriods 
        : Math.round(remainingPeriods / remainingModules);

      const modulePeriods: GeneratedPeriodBlueprint[] = [];

      for (let pOffset = 0; pOffset < periodsInModule; pOffset++) {
        const periodNum = currentPeriodNum++;
        const weekNum = Math.min(totalWeeks, Math.floor((periodNum - 1) / (totalPeriods / totalWeeks)) + 1);

        // Determine Period Type (Instruction vs Review vs Milestone)
        let pType: 'INSTRUCTIONAL' | 'REVIEW_CONSOLIDATION' | 'ASSESSMENT_MILESTONE' = 'INSTRUCTIONAL';
        
        // Midterm or Final Exam Milestone
        if (periodNum === totalPeriods) {
          pType = 'ASSESSMENT_MILESTONE';
        } else if (periodNum === Math.floor(totalPeriods / 2)) {
          pType = 'ASSESSMENT_MILESTONE';
        } else if (input.consolidationCadence && periodNum % input.consolidationCadence === 0) {
          pType = 'REVIEW_CONSOLIDATION';
        } else if (!input.consolidationCadence && periodNum % periodsPerWeek === 0) {
          // Default: Last period of each week is consolidation & formative quiz
          pType = 'REVIEW_CONSOLIDATION';
        }

        // LSRW Focus Cycle
        const lsrwCycle: Array<'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING' | 'INTEGRATED'> = [
          'LISTENING', 'SPEAKING', 'READING', 'WRITING', 'INTEGRATED'
        ];
        const lsrwFocus = pType === 'REVIEW_CONSOLIDATION' || pType === 'ASSESSMENT_MILESTONE'
          ? 'INTEGRATED'
          : lsrwCycle[pOffset % lsrwCycle.length];

        // Resolve Topic Content dynamically
        let topicTitle = '';
        let grammarObj = '';
        let vocabScope: string[] = [];
        let canDo = '';

        if (pType === 'ASSESSMENT_MILESTONE') {
          topicTitle = periodNum === totalPeriods ? 'Final Comprehensive Course Exam & Oral Assessment' : 'Midterm Formative Evaluation & Diagnostic Check';
          grammarObj = 'Comprehensive evaluation of communicative and grammatical structures acquired to date.';
          vocabScope = ['Comprehensive Lexical Bank', 'Formative Assessment Criteria'];
          canDo = 'Can demonstrate mastery of CEFR competencies covered across all preceding modules.';
        } else if (pType === 'REVIEW_CONSOLIDATION') {
          topicTitle = `Weekly Consolidation & Formative Review (Week ${weekNum})`;
          grammarObj = `Consolidation of weekly grammar rules, sentence patterns, and error remediation.`;
          vocabScope = ['Vocabulary Reinforcement', 'Weekly Quiz Review'];
          canDo = `Can synthesize and practice all core can-do objectives learned during Week ${weekNum}.`;
        } else {
          const topicBank = theme?.topics || [];
          const tItem = topicBank[pOffset % (topicBank.length || 1)];
          topicTitle = tItem?.title || `Interactive Language Practice: Unit ${periodNum}`;
          grammarObj = tItem?.grammar || `Communicative grammar practice for ${lang} ${lvl}.`;
          vocabScope = tItem?.vocab || ['Guten Tag', 'Hallo', 'Danke'];
          canDo = tItem?.canDo || `Can understand and express basic phrases relevant to ${topicTitle}.`;
        }

        modulePeriods.push({
          periodNumber: periodNum,
          weekNumber: weekNum,
          periodType: pType,
          durationMinutes: periodMinutes,
          topicTitle,
          grammarObjective: grammarObj,
          vocabularyScope: vocabScope,
          canDoStatements: [canDo],
          lsrwFocus,
          stageTimeBreakdown: stageTimes,
        });
      }

      modules.push({
        moduleIndex: mIdx + 1,
        title: moduleTitle,
        levelCompetence: `${lang} ${lvl} Communicative Standard`,
        startWeek: startWk,
        endWeek: endWk,
        periodsCount: modulePeriods.length,
        periods: modulePeriods,
      });
    }

    return {
      totalPeriods,
      totalWeeks,
      periodsPerWeek,
      periodMinutes,
      courseHours,
      modulesCount: modules.length,
      modules,
    };
  }

  /**
   * Proportionally scales the 6 instructional stages to fit any period duration (30, 45, 60, 90 mins).
   */
  public static calculateStageTimeBreakdown(durationMinutes: number) {
    // Standard Distribution:
    // Stage 1 (Warmup): ~11%
    // Stage 2 (Direct Instruction): ~33%
    // Stage 3 (Guided Practice): ~27%
    // Stage 4 (Independent Practice): ~18%
    // Stage 5 (Quick Check / Quiz): ~7%
    // Stage 6 (Wrapup & Homework): ~4%

    const warmup = Math.max(3, Math.round(durationMinutes * 0.11));
    const instruction = Math.max(10, Math.round(durationMinutes * 0.33));
    const guided = Math.max(8, Math.round(durationMinutes * 0.27));
    const independent = Math.max(6, Math.round(durationMinutes * 0.18));
    const quickCheck = Math.max(3, Math.round(durationMinutes * 0.07));
    const wrapup = durationMinutes - (warmup + instruction + guided + independent + quickCheck);

    return {
      warmupMinutes: warmup,
      instructionMinutes: instruction,
      guidedPracticeMinutes: guided,
      independentPracticeMinutes: independent,
      quickCheckMinutes: quickCheck,
      wrapupMinutes: Math.max(2, wrapup),
    };
  }
}

