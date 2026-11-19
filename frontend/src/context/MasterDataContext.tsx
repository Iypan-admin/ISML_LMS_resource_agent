"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface LanguageItem {
  id: string;
  code: string;
  name: string;
  nativeName?: string;
  flagEmoji?: string;
}

export interface LevelItem {
  id: string;
  code: string;
  name: string;
  rank: number;
}

export interface CourseItem {
  id: string;
  code: string;
  title: string;
  description?: string;
  languageId?: string;
}

export interface CategoryItem {
  id: string;
  code: string;
  name: string;
  slug: string;
}

export interface SkillItem {
  id: string;
  code: string;
  name: string;
  slug: string;
}

export interface TopicItem {
  id: string;
  code: string;
  name: string;
  slug: string;
  languageId?: string;
}

export interface ResourceTypeItem {
  type: string;
  label: string;
  description: string;
}

export interface SourceItem {
  id: string;
  name: string;
  originType: string;
  homepageUrl?: string;
}

interface MasterDataContextType {
  languages: LanguageItem[];
  courses: CourseItem[];
  levels: LevelItem[];
  categories: CategoryItem[];
  skills: SkillItem[];
  topics: TopicItem[];
  resourceTypes: ResourceTypeItem[];
  sources: SourceItem[];
  isLoading: boolean;
  error: string | null;
  refetchMasterData: () => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

const DEFAULT_LANGUAGES: LanguageItem[] = [
  { id: 'lang-1', code: 'de', name: 'German', nativeName: 'Deutsch', flagEmoji: 'German' },
  { id: 'lang-2', code: 'fr', name: 'French', nativeName: 'Français', flagEmoji: 'French' },
  { id: 'lang-3', code: 'es', name: 'Spanish', nativeName: 'Español', flagEmoji: 'Spanish' },
  { id: 'lang-4', code: 'ja', name: 'Japanese', nativeName: 'Japanese', flagEmoji: 'Japanese' },
  { id: 'lang-5', code: 'ko', name: 'Korean', nativeName: 'Korean', flagEmoji: 'Korean' },
  { id: 'lang-6', code: 'en', name: 'English', nativeName: 'English', flagEmoji: 'English' },
];

const DEFAULT_LEVELS: LevelItem[] = [
  { id: 'lvl-1', code: 'A1', name: 'Beginner (A1)', rank: 1 },
  { id: 'lvl-2', code: 'A2', name: 'Elementary (A2)', rank: 2 },
  { id: 'lvl-3', code: 'B1', name: 'Intermediate (B1)', rank: 3 },
  { id: 'lvl-4', code: 'B2', name: 'Upper Intermediate (B2)', rank: 4 },
  { id: 'lvl-5', code: 'C1', name: 'Advanced (C1)', rank: 5 },
  { id: 'lvl-6', code: 'C2', name: 'Mastery (C2)', rank: 6 },
];

const DEFAULT_SKILLS: SkillItem[] = [
  { id: 'sk-1', code: 'Speaking', name: 'Speaking', slug: 'speaking' },
  { id: 'sk-2', code: 'Listening', name: 'Listening', slug: 'listening' },
  { id: 'sk-3', code: 'Reading', name: 'Reading', slug: 'reading' },
  { id: 'sk-4', code: 'Writing', name: 'Writing', slug: 'writing' },
  { id: 'sk-5', code: 'Grammar', name: 'Grammar', slug: 'grammar' },
  { id: 'sk-6', code: 'Vocabulary', name: 'Vocabulary', slug: 'vocabulary' },
];

export function MasterDataProvider({ children }: { children: React.ReactNode }) {
  const readCache = <T,>(key: string): T[] => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {}
    }
    return [];
  };

  const [languages, setLanguages] = useState<LanguageItem[]>(() => {
    const cached = readCache<LanguageItem>('isml_cache_languages');
    return cached.length > 0 ? cached : DEFAULT_LANGUAGES;
  });
  const [courses, setCourses] = useState<CourseItem[]>(() => readCache('isml_cache_courses'));
  const [levels, setLevels] = useState<LevelItem[]>(() => {
    const cached = readCache<LevelItem>('isml_cache_levels');
    return cached.length > 0 ? cached : DEFAULT_LEVELS;
  });
  const [categories, setCategories] = useState<CategoryItem[]>(() => readCache('isml_cache_categories'));
  const [skills, setSkills] = useState<SkillItem[]>(() => {
    const cached = readCache<SkillItem>('isml_cache_skills');
    return cached.length > 0 ? cached : DEFAULT_SKILLS;
  });
  const [topics, setTopics] = useState<TopicItem[]>(() => readCache('isml_cache_topics'));
  const [resourceTypes, setResourceTypes] = useState<ResourceTypeItem[]>(() => readCache('isml_cache_resource_types'));
  const [sources, setSources] = useState<SourceItem[]>(() => readCache('isml_cache_sources'));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMasterData = useCallback(async () => {
    setError(null);
    const prodUrl = 'https://isml-resource-backend-production.up.railway.app/api/v1';
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || prodUrl;
    if (apiUrl.includes('localhost:4000')) apiUrl = prodUrl;

    try {
      const fetchWithTimeout = (url: string) => fetch(url, { signal: AbortSignal.timeout(2000) });
      let responses = await Promise.all([
        fetchWithTimeout(`${apiUrl}/languages`),
        fetchWithTimeout(`${apiUrl}/courses`),
        fetchWithTimeout(`${apiUrl}/levels`),
        fetchWithTimeout(`${apiUrl}/categories`),
        fetchWithTimeout(`${apiUrl}/skills`),
        fetchWithTimeout(`${apiUrl}/topics`),
        fetchWithTimeout(`${apiUrl}/resource-types`),
        fetchWithTimeout(`${apiUrl}/sources`),
      ]).catch(() => null);

      if (!responses && apiUrl !== prodUrl) {
        apiUrl = prodUrl;
        responses = await Promise.all([
          fetchWithTimeout(`${apiUrl}/languages`),
          fetchWithTimeout(`${apiUrl}/courses`),
          fetchWithTimeout(`${apiUrl}/levels`),
          fetchWithTimeout(`${apiUrl}/categories`),
          fetchWithTimeout(`${apiUrl}/skills`),
          fetchWithTimeout(`${apiUrl}/topics`),
          fetchWithTimeout(`${apiUrl}/resource-types`),
          fetchWithTimeout(`${apiUrl}/sources`),
        ]).catch(() => null);
      }

      if (!responses) {
        setIsLoading(false);
        return;
      }

      const [
        langRes,
        courseRes,
        levelRes,
        catRes,
        skillRes,
        topicRes,
        typeRes,
        sourceRes,
      ] = responses;

      const [
        langJson,
        courseJson,
        levelJson,
        catJson,
        skillJson,
        topicJson,
        typeJson,
        sourceJson,
      ] = await Promise.all([
        langRes.ok ? langRes.json() : { data: [] },
        courseRes.ok ? courseRes.json() : { data: [] },
        levelRes.ok ? levelRes.json() : { data: [] },
        catRes.ok ? catRes.json() : { data: [] },
        skillRes.ok ? skillRes.json() : { data: [] },
        topicRes.ok ? topicRes.json() : { data: [] },
        typeRes.ok ? typeRes.json() : { data: [] },
        sourceRes.ok ? sourceRes.json() : { data: [] },
      ]);

      const lData = Array.isArray(langJson.data) ? langJson.data : [];
      const cData = Array.isArray(courseJson.data) ? courseJson.data : [];
      const lvlData = Array.isArray(levelJson.data) ? levelJson.data : [];
      const catData = Array.isArray(catJson.data) ? catJson.data : [];
      const sData = Array.isArray(skillJson.data) ? skillJson.data : [];
      const tData = Array.isArray(topicJson.data) ? topicJson.data : [];
      const rTypeData = Array.isArray(typeJson.data) ? typeJson.data : [];
      const srcData = Array.isArray(sourceJson.data) ? sourceJson.data : [];

      setLanguages(lData);
      setCourses(cData);
      setLevels(lvlData);
      setCategories(catData);
      setSkills(sData);
      setTopics(tData);
      setResourceTypes(rTypeData);
      setSources(srcData);

      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('isml_cache_languages', JSON.stringify(lData));
          sessionStorage.setItem('isml_cache_courses', JSON.stringify(cData));
          sessionStorage.setItem('isml_cache_levels', JSON.stringify(lvlData));
          sessionStorage.setItem('isml_cache_categories', JSON.stringify(catData));
          sessionStorage.setItem('isml_cache_skills', JSON.stringify(sData));
          sessionStorage.setItem('isml_cache_topics', JSON.stringify(tData));
          sessionStorage.setItem('isml_cache_resource_types', JSON.stringify(rTypeData));
          sessionStorage.setItem('isml_cache_sources', JSON.stringify(srcData));
        } catch (e) {}
      }
    } catch (err: any) {
      console.error('Failed to load NestJS master data:', err);
      setError('Could not connect to service to load master domain lists.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  return (
    <MasterDataContext.Provider
      value={{
        languages,
        courses,
        levels,
        categories,
        skills,
        topics,
        resourceTypes,
        sources,
        isLoading,
        error,
        refetchMasterData: fetchMasterData,
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
}

export function useMasterData() {
  const context = useContext(MasterDataContext);
  if (!context) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return context;
}
