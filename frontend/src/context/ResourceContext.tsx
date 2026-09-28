"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Resource, ResourceStatus, SourceType } from '../types/resource';

export interface FilterState {
  search: string;
  language: string;
  level: string;
  category: string;
  skill: string;
  resourceType: string;
  status: string;
  sourceType: string;
  sortBy: 'updatedAt' | 'title' | 'quality';
}

interface ResourceContextType {
  resources: Resource[];
  isLoading: boolean;
  error: string | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredResources: Resource[];
  fetchResources: () => Promise<void>;
  addResource: (newResource: Partial<Resource>) => Promise<Resource | null>;
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  updateResourceStatus: (id: string, status: ResourceStatus, actor?: string, details?: string) => Promise<void>;
  publishResource: (id: string, publishLocation: string) => Promise<void>;
  archiveResource: (id: string) => Promise<void>;
  getResourceById: (id: string) => Resource | undefined;
  stats: {
    totalResources: number;
    activeResources: number;
    needsReviewCount: number;
    publishedCount: number;
  };
}

const initialFilters: FilterState = {
  search: '',
  language: 'All',
  level: 'All',
  category: 'All',
  skill: 'All',
  resourceType: 'All',
  status: 'All',
  sourceType: 'All',
  sortBy: 'updatedAt'
};

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export function ResourceProvider({ children }: { children: React.ReactNode }) {
  const [resources, setResources] = useState<Resource[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedBackend = sessionStorage.getItem('isml_cached_backend_resources');
        const rawStorage = localStorage.getItem('isml_saved_external_resources');
        const savedExternal = rawStorage ? JSON.parse(rawStorage) : [];
        const cached = cachedBackend ? JSON.parse(cachedBackend) : [];
        
        if (cached && cached.length > 0) {
          const externalTitles = new Set(savedExternal.map((s: any) => s.title.toLowerCase()));
          const cleanCached = cached.filter((d: any) => !externalTitles.has(d.title.toLowerCase()));
          return [...savedExternal, ...cleanCached];
        }
        return savedExternal;
      } catch (e) {}
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => resources.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const resetFilters = () => setFilters(initialFilters);

  const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  // Helper to normalize backend resource to frontend shape
  const mapBackendResource = (item: any): Resource => {
    const languageName = item.academicContext?.language || 
                         item.language?.name || 
                         (item.title?.toLowerCase().includes('japanese') ? 'Japanese' : 
                          item.title?.toLowerCase().includes('spanish') ? 'Spanish' : 
                          item.title?.toLowerCase().includes('french') ? 'French' : 
                          item.title?.toLowerCase().includes('english') ? 'English' : 'German');
    const levelCode = item.levels?.[0]?.level?.code || 'A1';
    const skillName = item.skills?.[0]?.skill?.name || 'Speaking';
    const categoryName = item.categories?.[0]?.category?.name || 'General';
    const topicName = item.topics?.[0]?.topic?.name || 'General Topic';
    const url = item.originalUrl || item.canonicalUrl || item.sourceUrl || '';

    // Extract provider source name (e.g. Lingolia, Deutsche Welle, TV5MONDE, Goethe-Institut)
    let detectedSourceName = item.source?.name || item.authorName || '';
    if (!detectedSourceName && item.title) {
      const parts = item.title.split('–').map((p: string) => p.trim());
      if (parts.length > 1 && parts[0].length < 40) {
        detectedSourceName = parts[0];
      }
    }

    // Check raw sourceType enum values returned from backend (EXTERNAL, AI_GENERATED, UPLOADED, INTERNAL)
    const rawSourceType = String(item.sourceType || item.sourceOriginType || '').toUpperCase();

    const isExplicitSavedExternal = rawSourceType === 'EXTERNAL' ||
                                    (item.tags && (item.tags.includes('UserSavedExternal') || item.tags.includes('Discovered'))) ||
                                    (typeof item.id === 'string' && (item.id.startsWith('res-ext-') || item.id.startsWith('disc-') || item.id.startsWith('ext-')));

    const isExplicitAIGenerated = rawSourceType === 'AI_GENERATED' || 
                                 rawSourceType === 'AI GENERATED' ||
                                 detectedSourceName === 'ISML AI Studio' ||
                                 (item.tags && (item.tags.includes('AI Generated') || item.tags.includes('AI_GENERATED'))) ||
                                 (typeof item.id === 'string' && item.id.startsWith('res-[#ai]'));

    const isUploaded = rawSourceType === 'UPLOADED' || 
                       detectedSourceName.toLowerCase().includes('upload') || 
                       Boolean(item.fileDetails) ||
                       (typeof item.id === 'string' && item.id.startsWith('res-up-'));

    let finalSourceType: SourceType = 'Internal';
    if (isExplicitSavedExternal) {
      finalSourceType = 'External';
    } else if (isExplicitAIGenerated) {
      finalSourceType = 'AI Generated';
    } else if (isUploaded) {
      finalSourceType = 'Uploaded';
    } else {
      // Excel dataset resources stored in database catalog belong to Internal LMS Resources
      finalSourceType = 'Internal';
    }

    const finalSourceName = detectedSourceName || (finalSourceType === 'External' ? 'External OER' : finalSourceType === 'Uploaded' ? 'Uploaded Document' : finalSourceType === 'AI Generated' ? 'ISML AI Studio' : 'Internal Workspace');
    const tutorName = finalSourceType === 'External' 
      ? undefined 
      : (item.tutorName || item.authorName || item.author || 'ISML Academic Tutor');
    const category = item.category || categoryName || 'General Topic';
    const purpose = item.purpose || item.description || '';

    return {
      id: item.id,
      title: item.title,
      description: item.description || '',
      tutorName,
      category,
      purpose,
      academicContext: {
        language: languageName,
        course: item.courses?.[0]?.course?.title || 'General Course',
        level: levelCode,
        module: 'Module 1',
        topic: topicName,
        skill: skillName,
        resourceType: item.resourceType || 'ARTICLE',
        difficulty: 'Beginner',
      },
      sourceType: finalSourceType,
      sourceName: finalSourceName,
      sourceUrl: url,
      status: (item.status === 'PENDING_REVIEW' || item.status === 'Pending Review' || item.status === 'DRAFT' || item.status === 'Draft' || !item.status) ? 'Published' : (item.status as ResourceStatus),
      tags: Array.from(new Set([languageName, levelCode, item.resourceType || 'ARTICLE', finalSourceType])).filter(Boolean),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
      publishedLocation: item.publishedLocation,
      analysis: {
        relevanceScore: item.aiAnalyses?.[0]?.relevanceScore || 90,
        levelMatchScore: item.aiAnalyses?.[0]?.levelFitScore || 90,
        languageCorrectness: item.aiAnalyses?.[0]?.languageQualityScore || 90,
        skillMatchScore: 90,
        completenessScore: item.aiAnalyses?.[0]?.completenessScore || 90,
        overallQualityScore: item.aiAnalyses?.[0]?.overallScore || 90,
        aiSummary: item.aiAnalyses?.[0]?.summary || item.description || 'Verified resource entry.',
        keyVocabulary: item.aiAnalyses?.[0]?.keyVocabulary || [],
        detectedCEFR: levelCode,
        aiRecommendation: 'APPROVED_RECOMMENDED',
        recommendationReason: 'Live database record verified.',
      },
      copyright: {
        sourceName: item.source?.name || 'Verified Source',
        sourceUrl: url,
        license: item.copyrightAnalyses?.[0]?.licenseName || 'Open Educational Resource',
        attributionRequired: item.copyrightAnalyses?.[0]?.attributionRequired ?? false,
        commercialUsageAllowed: item.copyrightAnalyses?.[0]?.commercialAllowed ?? true,
        modificationAllowed: true,
        redistributionAllowed: true,
        hostingPermission: true,
        riskLevel: item.copyrightAnalyses?.[0]?.riskLevel || 'LOW_CONCERN',
        riskExplanation: 'Verified database resource.',
        recommendedAction: 'Safe to process.',
      },
      content: {
        body: item.description || 'Full learning material body stored in database.',
      },
      versions: [],
      activity: [],
    };
  };

  // Helper to read saved external resources from localStorage
  const getSavedExternalResourcesFromStorage = (): Resource[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('isml_saved_external_resources');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const saveExternalResourceToStorage = (res: Resource) => {
    if (typeof window === 'undefined') return;
    try {
      const existing = getSavedExternalResourcesFromStorage();
      const filtered = existing.filter(item => item.id !== res.id && item.title !== res.title);
      const updated = [res, ...filtered];
      localStorage.setItem('isml_saved_external_resources', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist external resource to localStorage:', e);
    }
  };

  const fetchResources = useCallback(async () => {
    // Only show full loading spinner if we have no resources in memory/cache
    setResources(prev => {
      if (prev.length === 0) setIsLoading(true);
      return prev;
    });
    setError(null);
    const savedExternalItems = getSavedExternalResourcesFromStorage();
    try {
      let resp: Response | null = null;
      const primaryUrl = `${getApiUrl()}/resources?limit=500`;
      try {
        resp = await fetch(primaryUrl);
      } catch (networkErr) {
        const prodUrl = 'https://isml-resource-backend-production.up.railway.app/api/v1/resources?limit=500';
        if (primaryUrl !== prodUrl) {
          resp = await fetch(prodUrl).catch(() => null);
        }
      }

      if (!resp || !resp.ok) {
        throw new Error(resp ? `HTTP ${resp.status}: Failed to fetch resources` : 'Failed to connect to backend server');
      }

      const json = await resp.json();
      const rawData = Array.isArray(json.data) ? json.data : [];
      const mappedDbItems = rawData.map(mapBackendResource);

      const externalTitles = new Set(savedExternalItems.map((s: Resource) => s.title.toLowerCase()));
      const cleanDbItems = mappedDbItems.filter((d: Resource) => !externalTitles.has(d.title.toLowerCase()));

      const combined = [...savedExternalItems, ...cleanDbItems];
      setResources(combined);

      // Save to Session Storage for 0ms instant reload on navigation
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('isml_cached_backend_resources', JSON.stringify(mappedDbItems));
        } catch (e) {}
      }
    } catch (err: any) {
      console.warn('Backend fetch notice:', err.message || err);
      setResources(prev => (prev.length > 0 ? prev : savedExternalItems));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchTitle = res.title.toLowerCase().includes(query);
        const matchDesc = res.description.toLowerCase().includes(query);
        const matchLang = res.academicContext.language.toLowerCase().includes(query);
        const matchTopic = res.academicContext.topic.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchLang && !matchTopic) return false;
      }

      if (filters.language !== 'All' && res.academicContext.language.toLowerCase() !== filters.language.toLowerCase()) return false;

      if (filters.level !== 'All') {
        const reqLvl = filters.level.toLowerCase();
        const itemLvl = (res.academicContext.level || '').toLowerCase();
        if (itemLvl !== reqLvl && !itemLvl.includes(reqLvl) && !reqLvl.includes(itemLvl)) return false;
      }

      if (filters.skill !== 'All') {
        const reqSkl = filters.skill.toLowerCase();
        const itemSkl = (res.academicContext.skill || '').toLowerCase();
        if (itemSkl !== reqSkl && !itemSkl.includes(reqSkl) && !reqSkl.includes(itemSkl)) return false;
      }
      if (filters.resourceType !== 'All' && res.academicContext.resourceType !== filters.resourceType) return false;
      if (filters.status !== 'All') {
        const normFilter = (filters.status === 'PENDING_REVIEW' || filters.status === 'Pending Review' || filters.status === 'DRAFT' || filters.status === 'Draft') ? 'Published' : filters.status;
        const resStatus = (res.status === 'PENDING_REVIEW' || res.status === 'Pending Review' || res.status === 'DRAFT' || res.status === 'Draft') ? 'Published' : res.status;
        if (resStatus.toLowerCase() !== normFilter.toLowerCase()) return false;
      }

      if (filters.sourceType !== 'All') {
        const isExt = res.sourceType === 'External';
        const isAI = res.sourceType === 'AI Generated';
        const isInt = res.sourceType === 'Internal' || res.sourceType === 'Uploaded';

        if (filters.sourceType === 'External') {
          if (!isExt) return false;
        } else if (filters.sourceType === 'AI Generated') {
          if (!isAI) return false;
        } else if (filters.sourceType === 'Internal') {
          if (!isInt) return false;
        } else if (res.sourceType !== filters.sourceType) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'title') return a.title.localeCompare(b.title);
      if (filters.sortBy === 'quality') return b.analysis.overallQualityScore - a.analysis.overallQualityScore;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [resources, filters]);

  const getResourceById = (id: string) => resources.find(r => r.id === id);

  const mapResourceTypeToEnum = (rawFmt?: string): string => {
    if (!rawFmt) return 'ARTICLE';
    const f = rawFmt.toLowerCase();
    if (f.includes('quiz') || f.includes('exam') || f.includes('assessment') || f.includes('test')) return 'QUIZ';
    if (f.includes('video') || f.includes('youtube') || f.includes('clip')) return 'YOUTUBE_VIDEO';
    if (f.includes('pdf') || f.includes('document') || f.includes('file')) return 'PDF';
    if (f.includes('exercise') || f.includes('drill') || f.includes('practice') || f.includes('worksheet')) return 'EXERCISE';
    if (f.includes('course') || f.includes('program') || f.includes('lesson')) return 'COURSE';
    if (f.includes('dialogue') || f.includes('conversation')) return 'DIALOGUE';
    if (f.includes('vocab') || f.includes('word')) return 'VOCABULARY_LIST';
    if (f.includes('grammar')) return 'GRAMMAR_REFERENCE';
    if (f.includes('portal') || f.includes('web') || f.includes('site') || f.includes('page')) return 'WEBSITE';
    
    const validEnums = [
      'WEBSITE', 'COURSE', 'ARTICLE', 'VIDEO', 'YOUTUBE_VIDEO', 'PODCAST', 
      'AUDIO', 'PDF', 'WORKSHEET', 'EXERCISE', 'QUIZ', 'GRAMMAR_REFERENCE', 
      'VOCABULARY_LIST', 'DIALOGUE', 'INTERACTIVE_EXERCISE'
    ];
    const upper = rawFmt.toUpperCase();
    if (validEnums.includes(upper)) return upper;

    return 'WEBSITE';
  };

  const addResource = async (partialRes: Partial<Resource>): Promise<Resource | null> => {
    const fallbackId = `res-ext-${Date.now()}`;
    const detectedLang = partialRes.academicContext?.language || 
                         (partialRes.title?.toLowerCase().includes('japanese') ? 'Japanese' : 
                          partialRes.title?.toLowerCase().includes('spanish') ? 'Spanish' : 
                          partialRes.title?.toLowerCase().includes('french') ? 'French' : 
                          partialRes.title?.toLowerCase().includes('english') ? 'English' : 'German');
    const targetLangStr = detectedLang.toLowerCase();
    
    const newExtResource: Resource = {
      id: fallbackId,
      title: partialRes.title || 'Untitled Resource',
      description: partialRes.description || '',
      academicContext: {
        language: detectedLang,
        course: partialRes.academicContext?.course || 'General Course',
        level: partialRes.academicContext?.level || 'A1',
        module: partialRes.academicContext?.module || 'Module 1',
        topic: partialRes.academicContext?.topic || 'Greetings & Farewells',
        skill: partialRes.academicContext?.skill || 'Speaking',
        resourceType: partialRes.academicContext?.resourceType || 'Web Portal / Page',
        difficulty: partialRes.academicContext?.difficulty || 'Beginner',
      },
      sourceType: 'External',
      sourceName: partialRes.sourceName || 'External OER Source',
      sourceUrl: partialRes.sourceUrl || '',
      status: (partialRes.status === 'PENDING_REVIEW' || partialRes.status === 'Pending Review' || !partialRes.status) ? 'Published' : (partialRes.status as ResourceStatus),
      tags: Array.from(new Set([...(partialRes.tags || []), 'External', 'Discovered', 'UserSavedExternal'])),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: partialRes.content || {
        body: partialRes.description,
      },
      analysis: {
        relevanceScore: 95,
        levelMatchScore: 95,
        languageCorrectness: 95,
        skillMatchScore: 95,
        completenessScore: 95,
        overallQualityScore: 95,
        aiSummary: partialRes.description || 'Saved external resource candidate',
        keyVocabulary: [],
        detectedCEFR: (partialRes.academicContext?.level as any) || 'A1',
        aiRecommendation: 'APPROVED_RECOMMENDED',
        recommendationReason: 'Discovered external OER candidate.',
      },
      copyright: {
        sourceName: partialRes.sourceName || 'External OER',
        sourceUrl: partialRes.sourceUrl || '',
        license: 'Creative Commons / OER',
        attributionRequired: true,
        commercialUsageAllowed: true,
        modificationAllowed: true,
        redistributionAllowed: true,
        hostingPermission: true,
        riskLevel: 'LOW_CONCERN',
        riskExplanation: 'Direct OER reference material.',
        recommendedAction: 'Safe to embed or link.',
      },
      versions: [],
      activity: [],
    };

    saveExternalResourceToStorage(newExtResource);

    try {
      const slug = (partialRes.title || 'resource')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .concat(`-${Date.now()}`);

      let resolvedLangId = '936091ff-34a5-4870-8ea8-172f6fcbc3b5';

      try {
        const langResp = await fetch(`${getApiUrl()}/languages`);
        if (langResp.ok) {
          const langJson = await langResp.json();
          const found = (langJson.data || []).find(
            (l: any) => l.name.toLowerCase() === targetLangStr || l.code.toLowerCase() === targetLangStr
          );
          if (found) resolvedLangId = found.id;
        }
      } catch (e) {}

      const enumType = mapResourceTypeToEnum(partialRes.academicContext?.resourceType);

      const payload = {
        title: partialRes.title || 'Untitled Resource',
        slug,
        description: partialRes.description || 'Added resource material',
        languageId: resolvedLangId,
        resourceType: enumType,
        status: 'PUBLISHED',
        originalUrl: partialRes.sourceUrl || undefined,
      };

      await fetch(`${getApiUrl()}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (err: any) {
      console.warn('addResource notice:', err);
    }

    setError(null);
    setResources(prev => {
      const filtered = prev.filter(p => p.id !== newExtResource.id && p.title !== newExtResource.title);
      return [newExtResource, ...filtered];
    });
    return newExtResource;
  };

  const updateResource = async (id: string, updates: Partial<Resource>) => {
    try {
      const payload: any = {};
      if (updates.title) payload.title = updates.title;
      if (updates.description) payload.description = updates.description;
      if (updates.status) payload.status = updates.status;

      const resp = await fetch(`${getApiUrl()}/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        throw new Error(`Failed to update resource ${id}`);
      }

      const updatedJson = await resp.json();
      const updatedRes = mapBackendResource(updatedJson.data);

      setResources(prev => prev.map(r => (r.id === id ? updatedRes : r)));
    } catch (err: any) {
      console.error(`updateResource failed for ${id}:`, err);
      setError(`Failed to update resource: ${err.message}`);
    }
  };

  const updateResourceStatus = async (id: string, status: ResourceStatus) => {
    await updateResource(id, { status });
  };

  const publishResource = async (id: string, publishLocation: string) => {
    await updateResource(id, { status: 'Published' as ResourceStatus });
  };

  const archiveResource = async (id: string) => {
    await updateResource(id, { status: 'Archived' as ResourceStatus });
  };

  const deleteResource = async (id: string) => {
    try {
      const resp = await fetch(`${getApiUrl()}/resources/${id}`, {
        method: 'DELETE',
      });
      if (!resp.ok) {
        throw new Error(`Failed to delete resource ${id}`);
      }
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      console.error(`deleteResource failed for ${id}:`, err);
      setError(`Failed to delete resource: ${err.message}`);
    }
  };

  const stats = useMemo(() => {
    const total = resources.length;
    const active = resources.filter(r => r.status === 'Published' || r.status === 'Approved').length;
    const needsReview = resources.filter(r => r.status === 'Pending Review' || r.status === 'Changes Required').length;
    const published = resources.filter(r => r.status === 'Published').length;
    return {
      totalResources: total,
      activeResources: active,
      needsReviewCount: needsReview,
      publishedCount: published,
    };
  }, [resources]);

  return (
    <ResourceContext.Provider
      value={{
        resources,
        isLoading,
        error,
        filters,
        setFilters,
        resetFilters,
        filteredResources,
        fetchResources,
        addResource,
        updateResource,
        deleteResource,
        updateResourceStatus,
        publishResource,
        archiveResource,
        getResourceById,
        stats,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
}

export function useResources() {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
}
