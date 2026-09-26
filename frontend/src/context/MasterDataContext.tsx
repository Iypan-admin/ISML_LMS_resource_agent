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
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [levels, setLevels] = useState<LevelItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceTypeItem[]>([]);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMasterData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    try {
      const [
        langRes,
        courseRes,
        levelRes,
        catRes,
        skillRes,
        topicRes,
        typeRes,
        sourceRes,
      ] = await Promise.all([
        fetch(`${apiUrl}/languages`),
        fetch(`${apiUrl}/courses`),
        fetch(`${apiUrl}/levels`),
        fetch(`${apiUrl}/categories`),
        fetch(`${apiUrl}/skills`),
        fetch(`${apiUrl}/topics`),
        fetch(`${apiUrl}/resource-types`),
        fetch(`${apiUrl}/sources`),
      ]);

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

      setLanguages(Array.isArray(langJson.data) ? langJson.data : []);
      setCourses(Array.isArray(courseJson.data) ? courseJson.data : []);
      setLevels(Array.isArray(levelJson.data) ? levelJson.data : []);
      setCategories(Array.isArray(catJson.data) ? catJson.data : []);
      setSkills(Array.isArray(skillJson.data) ? skillJson.data : []);
      setTopics(Array.isArray(topicJson.data) ? topicJson.data : []);
      setResourceTypes(Array.isArray(typeJson.data) ? typeJson.data : []);
      setSources(Array.isArray(sourceJson.data) ? sourceJson.data : []);
    } catch (err: any) {
      console.error('Failed to load NestJS master data:', err);
      setError('Could not connect to NestJS Backend API to load master domain lists.');
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
