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

  const [languages, setLanguages] = useState<LanguageItem[]>(() => readCache('isml_cache_languages'));
  const [courses, setCourses] = useState<CourseItem[]>(() => readCache('isml_cache_courses'));
  const [levels, setLevels] = useState<LevelItem[]>(() => readCache('isml_cache_levels'));
  const [categories, setCategories] = useState<CategoryItem[]>(() => readCache('isml_cache_categories'));
  const [skills, setSkills] = useState<SkillItem[]>(() => readCache('isml_cache_skills'));
  const [topics, setTopics] = useState<TopicItem[]>(() => readCache('isml_cache_topics'));
  const [resourceTypes, setResourceTypes] = useState<ResourceTypeItem[]>(() => readCache('isml_cache_resource_types'));
  const [sources, setSources] = useState<SourceItem[]>(() => readCache('isml_cache_sources'));
  const [isLoading, setIsLoading] = useState<boolean>(() => languages.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchMasterData = useCallback(async () => {
    if (languages.length === 0) setIsLoading(true);
    setError(null);
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    try {
      let responses: Response[] | null = null;
      try {
        responses = await Promise.all([
          fetch(`${apiUrl}/languages`),
          fetch(`${apiUrl}/courses`),
          fetch(`${apiUrl}/levels`),
          fetch(`${apiUrl}/categories`),
          fetch(`${apiUrl}/skills`),
          fetch(`${apiUrl}/topics`),
          fetch(`${apiUrl}/resource-types`),
          fetch(`${apiUrl}/sources`),
        ]);
      } catch (primaryErr) {
        const prodUrl = 'https://isml-resource-backend-production.up.railway.app/api/v1';
        if (apiUrl !== prodUrl) {
          apiUrl = prodUrl;
          responses = await Promise.all([
            fetch(`${apiUrl}/languages`),
            fetch(`${apiUrl}/courses`),
            fetch(`${apiUrl}/levels`),
            fetch(`${apiUrl}/categories`),
            fetch(`${apiUrl}/skills`),
            fetch(`${apiUrl}/topics`),
            fetch(`${apiUrl}/resource-types`),
            fetch(`${apiUrl}/sources`),
          ]).catch(() => null);
        }
      }

      if (!responses) {
        console.warn('Backend master data service unreachable, applying default domain fallback.');
        setLanguages([
          { id: 'lang-1', code: 'de', name: 'German', nativeName: 'Deutsch', flagEmoji: '🇩🇪' },
          { id: 'lang-2', code: 'fr', name: 'French', nativeName: 'Français', flagEmoji: '🇫🇷' },
          { id: 'lang-3', code: 'ja', name: 'Japanese', nativeName: '日本語', flagEmoji: '🇯🇵' },
          { id: 'lang-4', code: 'es', name: 'Spanish', nativeName: 'Español', flagEmoji: '🇪🇸' },
          { id: 'lang-5', code: 'en', name: 'English', nativeName: 'English', flagEmoji: '🇬🇧' },
        ]);
        setLevels([
          { id: 'lvl-1', code: 'A1', name: 'Beginner (A1)', rank: 1 },
          { id: 'lvl-2', code: 'A2', name: 'Elementary (A2)', rank: 2 },
          { id: 'lvl-3', code: 'B1', name: 'Intermediate (B1)', rank: 3 },
          { id: 'lvl-4', code: 'B2', name: 'Upper Intermediate (B2)', rank: 4 },
        ]);
        setSkills([
          { id: 'sk-1', code: 'Speaking', name: 'Speaking', slug: 'speaking' },
          { id: 'sk-2', code: 'Listening', name: 'Listening', slug: 'listening' },
          { id: 'sk-3', code: 'Reading', name: 'Reading', slug: 'reading' },
          { id: 'sk-4', code: 'Grammar', name: 'Grammar', slug: 'grammar' },
        ]);
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
