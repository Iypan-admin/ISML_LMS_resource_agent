import * as crypto from 'crypto';
import { CEFRLevel, ResourceType } from '@prisma/client';

export function calculateUrlHash(url?: string): string | undefined {
  if (!url) return undefined;
  return crypto.createHash('sha256').update(url.trim().toLowerCase()).digest('hex');
}

export function extractDomain(urlStr: string): { domain: string; name: string } {
  try {
    const parsed = new URL(urlStr);
    let hostname = parsed.hostname.toLowerCase();
    hostname = hostname.replace(/^www\./, '');
    
    // Friendly name resolution for major sources
    let name = hostname;
    if (hostname.includes('dw.com')) name = 'Deutsche Welle';
    else if (hostname.includes('goethe.de')) name = 'Goethe-Institut';
    else if (hostname.includes('schubert-verlag.de')) name = 'Schubert Verlag';
    else if (hostname.includes('easygerman.org')) name = 'Easy German';
    else if (hostname.includes('slowgerman.com')) name = 'Slow German';
    else if (hostname.includes('vhs-lernportal.de')) name = 'VHS-Lernportal';
    else if (hostname.includes('lingolia.com')) name = 'Lingolia';
    else if (hostname.includes('nthuleen.com')) name = 'Nancy Thuleen Worksheets';
    else if (hostname.includes('jlptsensei.com')) name = 'JLPT Sensei';
    else if (hostname.includes('kanshudo.com')) name = 'Kanshudo';
    else if (hostname.includes('share.google')) name = 'Google Drive Shared Content';
    else if (hostname.includes('elearningfrench.com')) name = 'eLearning French';
    else if (hostname.includes('tv5monde.com')) name = 'TV5MONDE';

    return { domain: hostname, name };
  } catch {
    return { domain: 'unknown-domain', name: 'External Web Resource' };
  }
}

export function mapCEFRLevels(levelStr: string): CEFRLevel[] {
  if (!levelStr) return [];
  const normalized = levelStr.trim();

  if (normalized === 'A1–B2' || normalized === 'A1-B2') {
    return [CEFRLevel.A1, CEFRLevel.A2, CEFRLevel.B1, CEFRLevel.B2];
  }
  if (normalized === 'A1–C1' || normalized === 'A1-C1') {
    return [CEFRLevel.A1, CEFRLevel.A2, CEFRLevel.B1, CEFRLevel.B2, CEFRLevel.C1];
  }
  if (normalized === 'A1–C2' || normalized === 'A1-C2') {
    return [CEFRLevel.A1, CEFRLevel.A2, CEFRLevel.B1, CEFRLevel.B2, CEFRLevel.C1, CEFRLevel.C2];
  }
  if (normalized === 'A2–B2' || normalized === 'A2-B2') {
    return [CEFRLevel.A2, CEFRLevel.B1, CEFRLevel.B2];
  }
  if (normalized === 'A1–B1' || normalized === 'A1-B1') {
    return [CEFRLevel.A1, CEFRLevel.A2, CEFRLevel.B1];
  }
  if (normalized === 'B1–B2' || normalized === 'B1-B2') {
    return [CEFRLevel.B1, CEFRLevel.B2];
  }
  if (normalized === 'A2/B1') {
    return [CEFRLevel.A2, CEFRLevel.B1];
  }
  if (normalized === 'A1' || normalized === 'A1+') {
    return [CEFRLevel.A1];
  }
  if (normalized.startsWith('B1')) {
    return [CEFRLevel.B1];
  }

  // Non-CEFR strings (JLPT N5-N1, Beginner, Beginner-Intermediate, All Levels, Not Specified)
  return [];
}

export function mapResourceType(category: string, title: string): ResourceType {
  const catLower = category.toLowerCase();
  const titleLower = title.toLowerCase();

  if (catLower.includes('worksheet')) return ResourceType.WORKSHEET;
  if (catLower.includes('listening') || catLower.includes('podcast')) return ResourceType.PODCAST;
  if (catLower.includes('video') || titleLower.includes('video') || titleLower.includes('youtube')) return ResourceType.VIDEO;
  if (catLower.includes('test') || catLower.includes('exam') || catLower.includes('practice test')) return ResourceType.QUIZ;
  if (catLower.includes('pdf')) return ResourceType.PDF;
  if (catLower.includes('interactive')) return ResourceType.INTERACTIVE_EXERCISE;
  if (catLower.includes('grammar') && catLower.includes('reference')) return ResourceType.GRAMMAR_REFERENCE;
  if (catLower.includes('grammar') || catLower.includes('exercise')) return ResourceType.EXERCISE;
  if (catLower.includes('course')) return ResourceType.COURSE;

  return ResourceType.WEBSITE;
}

export function generateCategorySlug(categoryName: string): string {
  return categoryName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${base || 'resource'}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}
