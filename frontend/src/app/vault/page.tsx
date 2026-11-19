"use client";
// Knowledge Vault & Ingestion Studio (ISML v1.0 Compliant)

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  Database, 
  Search, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sliders, 
  Sparkles, 
  Filter, 
  Eye, 
  Layers, 
  Check, 
  X, 
  RotateCw, 
  FileText, 
  BookOpen, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Tag,
  Lock,
  Unlock,
  Globe,
  Video,
  Link2,
  ChevronDown,
  ArrowLeft,
  Trash2,
  Plus,
  Home
} from 'lucide-react';
import { useResources } from '@/context/ResourceContext';
import { fetchBackendWithFallback } from '@/utils/apiConfig';

export default function KnowledgeVaultPage() {
  const { resources, fetchResources, addResource, deleteResource, isLoading } = useResources();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'UPLOAD'>('CATALOG');

  // Vault Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedMediaType, setSelectedMediaType] = useState<'ALL' | 'VIDEO' | 'WEBSITE' | 'LINK' | 'DOCUMENT'>('ALL');

  // Section refs for smooth automated scrolling
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const catalogSectionRef = useRef<HTMLDivElement>(null);

  // Tab switch handler with instant smooth auto-scroll
  const handleSwitchTab = (tab: 'CATALOG' | 'UPLOAD') => {
    setActiveTab(tab);
    setTimeout(() => {
      if (tab === 'UPLOAD' && uploadSectionRef.current) {
        uploadSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tab === 'CATALOG' && catalogSectionRef.current) {
        catalogSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  // Auto-scroll when tab state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'UPLOAD' && uploadSectionRef.current) {
        uploadSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (activeTab === 'CATALOG' && catalogSectionRef.current) {
        catalogSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Auto-scroll down to the study materials table once language & level are chosen
  useEffect(() => {
    if (activeTab === 'CATALOG' && selectedLanguage && selectedLevel) {
      const timer = setTimeout(() => {
        const tableElement = document.getElementById('catalog-table-matrix');
        if (tableElement) {
          tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [selectedLanguage, selectedLevel, activeTab]);

  // Helper to format level badge matching Studio frameworks
  const formatLevelBadge = (item: any) => {
    const lang = item.academicContext?.language || item.language?.name || 'General';
    const rawLvl = item.academicContext?.level || item.cefrLevel || 'A1';
    if (lang === 'Korean') {
      if (item.title?.includes('L1') || rawLvl === 'A1' || rawLvl === 'L1') return { framework: 'Korean Standard', level: 'Level L1' };
      if (item.title?.includes('L2') || rawLvl === 'A2' || rawLvl === 'L2') return { framework: 'Korean Standard', level: 'Level L2' };
      if (item.title?.includes('L3') || rawLvl === 'B1' || rawLvl === 'L3') return { framework: 'Korean Standard', level: 'Level L3' };
      if (item.title?.includes('L4') || rawLvl === 'B2' || rawLvl === 'L4') return { framework: 'Korean Standard', level: 'Level L4' };
      return { framework: 'Korean Standard', level: 'Level L1' };
    }
    if (lang === 'Japanese') {
      if (item.title?.includes('N5') || rawLvl === 'A1' || rawLvl === 'N5') return { framework: 'JLPT', level: 'JLPT N5' };
      if (item.title?.includes('N4') || rawLvl === 'A2' || rawLvl === 'N4') return { framework: 'JLPT', level: 'JLPT N4' };
      if (item.title?.includes('N3') || rawLvl === 'B1' || rawLvl === 'N3') return { framework: 'JLPT', level: 'JLPT N3' };
      if (item.title?.includes('N2') || rawLvl === 'B2' || rawLvl === 'N2') return { framework: 'JLPT', level: 'JLPT N2' };
      if (item.title?.includes('N1') || rawLvl === 'C1' || rawLvl === 'C2' || rawLvl === 'N1') return { framework: 'JLPT', level: 'JLPT N1' };
      return { framework: 'JLPT', level: 'JLPT N5' };
    }
    return { framework: item.framework || 'CEFR', level: rawLvl };
  };

  const getLanguageFlag = (lang: string) => {
    switch (lang) {
      case 'German': return '🇩🇪';
      case 'French': return '🇫🇷';
      case 'Spanish': return '🇪🇸';
      case 'Japanese': return '🇯🇵';
      case 'Korean': return '🇰🇷';
      case 'English': return '🇬🇧';
      default: return '🌐';
    }
  };

  const getLanguageFramework = (lang: string) => {
    switch (lang) {
      case 'Korean': return 'Korean Standard / TOPIK Proficiency';
      case 'Japanese': return 'JLPT (Japanese Language Proficiency Test)';
      case 'French': return 'DELF / DALF (CEFR Cadre Européen)';
      case 'Spanish': return 'DELE / Instituto Cervantes (CEFR)';
      case 'German': return 'Goethe-Zertifikat / CEFR Standards';
      case 'English': return 'Cambridge / CEFR Global Standards';
      default: return 'CEFR Educational Matrix';
    }
  };

  // Professional Bulk Upload State
  const [uploadMode, setUploadMode] = useState<'FILE' | 'LINK'>('FILE');
  const [uploadLang, setUploadLang] = useState('');
  const [uploadMasterIndex, setUploadMasterIndex] = useState('AUTO_DETECT');
  const [uploadLevel, setUploadLevel] = useState('AUTO_DETECT');

  // Staged Files Queue Interface & State
  interface StagedFileItem {
    id: string;
    file: File;
    name: string;
    sizeFormatted: string;
    title: string;
    status: 'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR';
    errorMessage?: string;
  }
  const [stagedFiles, setStagedFiles] = useState<StagedFileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Staged Links Queue Interface & State
  interface StagedLinkItem {
    id: string;
    url: string;
    title?: string;
    isYouTube: boolean;
    status: 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR';
    errorMessage?: string;
  }
  const [stagedLinks, setStagedLinks] = useState<StagedLinkItem[]>([]);
  const [singleLinkInput, setSingleLinkInput] = useState('');
  const [singleLinkTitle, setSingleLinkTitle] = useState('');
  const [bulkUrlTextArea, setBulkUrlTextArea] = useState('');
  const [showBulkPasteModal, setShowBulkPasteModal] = useState(false);

  // Material Deletion State & Confirmation Modal
  const [resourcePendingDelete, setResourcePendingDelete] = useState<any | null>(null);
  const [isDeletingResource, setIsDeletingResource] = useState<boolean>(false);

  const handleConfirmDeleteResource = async () => {
    if (!resourcePendingDelete) return;
    setIsDeletingResource(true);
    try {
      const id = resourcePendingDelete.id;
      await deleteResource(id);
    } catch (err) {
      console.warn('Failed deleting resource:', err);
    } finally {
      setIsDeletingResource(false);
      setResourcePendingDelete(null);
    }
  };

  // Batch Processing Progress & Feedback
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; percentage: number } | null>(null);
  const [batchSummary, setBatchSummary] = useState<{ successCount: number; failCount: number; message: string } | null>(null);

  // File size format helper
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleAddFilesToQueue = (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    const newItems: StagedFileItem[] = list.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file: f,
      name: f.name,
      sizeFormatted: formatBytes(f.size),
      title: f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      status: 'IDLE',
    }));
    setStagedFiles((prev) => [...prev, ...newItems]);
    setBatchSummary(null);
    setTimeout(() => {
      document.getElementById('staged-files-queue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleAddSingleLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = singleLinkInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      alert('Please enter a valid URL (starting with http:// or https://)');
      return;
    }
    const isYouTube = trimmed.includes('youtube.com') || trimmed.includes('youtu.be');
    const newItem: StagedLinkItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      url: trimmed,
      title: singleLinkTitle.trim() || undefined,
      isYouTube,
      status: 'IDLE',
    };
    setStagedLinks((prev) => [...prev, newItem]);
    setSingleLinkInput('');
    setSingleLinkTitle('');
    setBatchSummary(null);
    setTimeout(() => {
      document.getElementById('staged-links-queue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleAddBulkUrls = () => {
    const lines = bulkUrlTextArea
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => Boolean(l));

    if (lines.length === 0) {
      alert('Please paste at least one valid URL.');
      return;
    }

    const validItems: StagedLinkItem[] = [];
    for (const line of lines) {
      try {
        new URL(line);
        validItems.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          url: line,
          isYouTube: line.includes('youtube.com') || line.includes('youtu.be'),
          status: 'IDLE',
        });
      } catch {
        // skip invalid line
      }
    }

    if (validItems.length === 0) {
      alert('No valid URLs found. Make sure each URL starts with http:// or https://');
      return;
    }

    setStagedLinks((prev) => [...prev, ...validItems]);
    setBulkUrlTextArea('');
    setShowBulkPasteModal(false);
    setBatchSummary(null);
    setTimeout(() => {
      document.getElementById('staged-links-queue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = resources.length;
    const videoCount = resources.filter(r => (r as any).resourceType === 'YOUTUBE_VIDEO' || r.academicContext?.resourceType === 'Video' || (r.originalUrl && (r.originalUrl.includes('youtube.com') || r.originalUrl.includes('youtu.be')))).length;
    const webCount = resources.filter(r => (r as any).resourceType === 'WEBSITE' || r.academicContext?.resourceType === 'Website' || (r.originalUrl && !(r as any).fileStorage)).length;
    const docCount = total - videoCount - webCount;
    const activeLanguages = new Set(resources.map(r => r.academicContext?.language || (r as any).language?.name || 'German')).size;
    return { total, videoCount, webCount, docCount, activeLanguages };
  }, [resources]);

  // Media Type Counts for current language/level selection
  const typeCounts = useMemo(() => {
    const currentScope = resources.filter(r => {
      const lang = r.academicContext?.language || (r as any).language?.name || 'General';
      const matchesLang = !selectedLanguage || lang.toLowerCase() === selectedLanguage.toLowerCase();
      const badge = formatLevelBadge(r);
      const matchesLevel = !selectedLevel || (
        badge.level.toLowerCase().includes(selectedLevel.toLowerCase()) ||
        (r.cefrLevel && r.cefrLevel.toLowerCase() === selectedLevel.toLowerCase())
      );
      return matchesLang && matchesLevel;
    });

    let videos = 0;
    let websites = 0;
    let links = 0;
    let documents = 0;

    for (const r of currentScope) {
      const isVid = (r as any).resourceType === 'YOUTUBE_VIDEO' || r.academicContext?.resourceType === 'Video' || (r.originalUrl && (r.originalUrl.includes('youtube.com') || r.originalUrl.includes('youtu.be')));
      const isWeb = (r as any).resourceType === 'WEBSITE' || r.academicContext?.resourceType === 'Website' || (r.originalUrl && !(r as any).fileStorage && !isVid);
      const isLink = Boolean(r.originalUrl);
      const isDoc = !isVid && !isWeb;

      if (isVid) videos++;
      if (isWeb) websites++;
      if (isLink) links++;
      if (isDoc) documents++;
    }

    return {
      all: currentScope.length,
      videos,
      websites,
      links,
      documents,
    };
  }, [resources, selectedLanguage, selectedLevel]);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return resources.filter(r => {
      const matchesSearch = !searchQuery || 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const lang = r.academicContext?.language || (r as any).language?.name || 'General';
      const matchesLang = !selectedLanguage || lang.toLowerCase() === selectedLanguage.toLowerCase();
      
      const badge = formatLevelBadge(r);
      const matchesLevel = !selectedLevel || (
        badge.level.toLowerCase().includes(selectedLevel.toLowerCase()) ||
        (r.cefrLevel && r.cefrLevel.toLowerCase() === selectedLevel.toLowerCase())
      );

      const isVideo = (r as any).resourceType === 'YOUTUBE_VIDEO' || r.academicContext?.resourceType === 'Video' || (r.originalUrl && (r.originalUrl.includes('youtube.com') || r.originalUrl.includes('youtu.be')));
      const isWeb = (r as any).resourceType === 'WEBSITE' || r.academicContext?.resourceType === 'Website' || (r.originalUrl && !(r as any).fileStorage && !isVideo);
      const isLink = Boolean(r.originalUrl);
      const isDoc = !isVideo && !isWeb;

      let matchesMedia = true;
      if (selectedMediaType === 'VIDEO') {
        matchesMedia = Boolean(isVideo);
      } else if (selectedMediaType === 'WEBSITE') {
        matchesMedia = Boolean(isWeb);
      } else if (selectedMediaType === 'LINK') {
        matchesMedia = Boolean(isLink);
      } else if (selectedMediaType === 'DOCUMENT') {
        matchesMedia = Boolean(isDoc);
      }

      return matchesSearch && matchesLang && matchesLevel && matchesMedia;
    });
  }, [resources, searchQuery, selectedLanguage, selectedLevel, selectedMediaType]);

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadLang) {
      alert('Please select a Language in Step 1 before uploading.');
      return;
    }

    if (uploadMode === 'FILE') {
      if (stagedFiles.length === 0) {
        alert('Please choose or drag at least one document or media file to upload.');
        return;
      }

      setIsBatchProcessing(true);
      setBatchSummary(null);
      let successCount = 0;
      let failCount = 0;
      const framework = uploadLang === 'Japanese' ? 'JLPT' : (uploadLang === 'Korean' ? 'TOPIK' : 'CEFR');

      for (let i = 0; i < stagedFiles.length; i++) {
        const item = stagedFiles[i];
        setBatchProgress({
          current: i + 1,
          total: stagedFiles.length,
          percentage: Math.round(((i) / stagedFiles.length) * 100),
        });
        setStagedFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'UPLOADING' } : f));

        try {
          const formData = new FormData();
          formData.append('file', item.file);
          formData.append('title', item.title || item.name.replace(/\.[^/.]+$/, ''));
          formData.append('framework', framework);
          formData.append('masterIndex', uploadMasterIndex);
          formData.append('language', uploadLang);
          formData.append('languageId', uploadLang);
          formData.append('languageName', uploadLang);
          if (uploadLevel && uploadLevel !== 'AUTO_DETECT') {
            formData.append('cefrLevel', uploadLevel);
          }

          const resp = await fetchBackendWithFallback('/api/resources/vault/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await resp.json().catch(() => ({}));
          if ((resp.ok || resp.status === 409 || data.isDuplicate || data.error === 'DUPLICATE_RESOURCE') && (data.success || data.id || data.data || data.existingResourceId)) {
            successCount++;
            setStagedFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'SUCCESS' } : f));

            const serverItem = data.data || data.resource || data;
            const resId = serverItem.id || data.existingResourceId || `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            const fullBody = data.extractedText || serverItem.content?.body || '';
            const words = data.wordCount || serverItem.wordCount || (fullBody ? fullBody.split(/\s+/).filter(Boolean).length : 0);
            const pages = data.pageCount || serverItem.pageCount || Math.max(1, Math.ceil(words / 350));

            let clientDataUrl = '';
            try {
              if (item.file.size < 4000000) {
                clientDataUrl = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = () => resolve('');
                  reader.readAsDataURL(item.file);
                });
              }
            } catch (_) {}

            const fileUrl = data.fileUrl || serverItem.canonicalUrl || clientDataUrl || `/uploads/${item.name}`;
            const fileData = clientDataUrl || data.dataUrl || fileUrl;

            await addResource({
              id: resId,
              title: item.title || item.name.replace(/\.[^/.]+$/, ''),
              description: `Uploaded file ${item.name}`,
              academicContext: {
                language: uploadLang,
                level: uploadLevel !== 'AUTO_DETECT' ? uploadLevel : 'A1',
                resourceType: item.name.endsWith('.pdf') ? 'Worksheet' : 'Practice Exercise',
                course: `${uploadLang} Course`,
                module: 'General Module',
                topic: item.title || item.name,
                skill: 'Reading',
                difficulty: 'Beginner',
              },
              cefrLevel: uploadLevel !== 'AUTO_DETECT' ? uploadLevel : 'A1',
              framework: framework,
              status: 'Published' as any,
              sourceUrl: fileUrl,
              originalUrl: item.file.name,
              canonicalUrl: fileUrl,
              fileUrl: fileUrl,
              fileData: fileData,
              content: {
                body: fullBody,
              },
              wordCount: words,
              pageCount: pages,
            } as any);
          } else {
            failCount++;
            setStagedFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'ERROR', errorMessage: data.message || 'Upload failed' } : f));
          }
        } catch (err: any) {
          failCount++;
          setStagedFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'ERROR', errorMessage: err.message } : f));
        }
      }

      setBatchProgress({
        current: stagedFiles.length,
        total: stagedFiles.length,
        percentage: 100,
      });
      setIsBatchProcessing(false);
      await fetchResources();
      // Auto-focus the catalog on the uploaded language so the user immediately sees their file in the table
      setSelectedLanguage(uploadLang);
      if (uploadLevel && uploadLevel !== 'AUTO_DETECT') {
        setSelectedLevel(uploadLevel);
      }
      setActiveTab('CATALOG');
      setBatchSummary({
        successCount,
        failCount,
        message: failCount === 0
          ? `Successfully uploaded and auto-indexed all ${successCount} learning materials into your Knowledge Vault!`
          : `Processed ${successCount} successfully (${failCount} failed). Check the items below.`,
      });
      setTimeout(() => {
        document.getElementById('catalog-table-matrix')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } else {
      if (stagedLinks.length === 0) {
        alert('Please add at least one YouTube video URL or website link.');
        return;
      }

      setIsBatchProcessing(true);
      setBatchSummary(null);
      let successCount = 0;
      let failCount = 0;
      const framework = uploadLang === 'Japanese' ? 'JLPT' : (uploadLang === 'Korean' ? 'TOPIK' : 'CEFR');

      for (let i = 0; i < stagedLinks.length; i++) {
        const item = stagedLinks[i];
        setBatchProgress({
          current: i + 1,
          total: stagedLinks.length,
          percentage: Math.round(((i) / stagedLinks.length) * 100),
        });
        setStagedLinks((prev) => prev.map((l) => l.id === item.id ? { ...l, status: 'PROCESSING' } : l));

        try {
          const resp = await fetchBackendWithFallback('/api/resources/vault/link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: item.url,
              title: item.title || undefined,
              language: uploadLang,
              framework,
              masterIndex: uploadMasterIndex,
              cefrLevel: uploadLevel && uploadLevel !== 'AUTO_DETECT' ? uploadLevel : undefined,
            }),
          });

          const data = await resp.json().catch(() => ({}));
          if ((resp.ok || resp.status === 409 || data.isDuplicate || data.error === 'DUPLICATE_RESOURCE') && (data.success || data.id || data.data || data.existingResourceId)) {
            successCount++;
            setStagedLinks((prev) => prev.map((l) => l.id === item.id ? { ...l, status: 'SUCCESS' } : l));

            const serverItem = data.data || data.resource || data;
            const resId = serverItem.id || data.existingResourceId || `link-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            await addResource({
              id: resId,
              title: item.title || item.url,
              description: `External link: ${item.url}`,
              academicContext: {
                language: uploadLang,
                level: uploadLevel !== 'AUTO_DETECT' ? uploadLevel : 'A1',
                resourceType: item.url.includes('youtube') || item.url.includes('youtu.be') ? 'Video' : 'Website',
                course: `${uploadLang} Course`,
                module: 'General Module',
                topic: item.title || item.url,
                skill: 'Listening',
                difficulty: 'Beginner',
              },
              cefrLevel: uploadLevel !== 'AUTO_DETECT' ? uploadLevel : 'A1',
              framework: framework,
              status: 'Published' as any,
              originalUrl: item.url,
              sourceUrl: item.url,
            });
          } else {
            failCount++;
            setStagedLinks((prev) => prev.map((l) => l.id === item.id ? { ...l, status: 'ERROR', errorMessage: data.message || 'Ingestion failed' } : l));
          }
        } catch (err: any) {
          failCount++;
          setStagedLinks((prev) => prev.map((l) => l.id === item.id ? { ...l, status: 'ERROR', errorMessage: err.message } : l));
        }
      }

      setBatchProgress({
        current: stagedLinks.length,
        total: stagedLinks.length,
        percentage: 100,
      });
      setIsBatchProcessing(false);
      await fetchResources();
      setSelectedLanguage(uploadLang);
      if (uploadLevel && uploadLevel !== 'AUTO_DETECT') {
        setSelectedLevel(uploadLevel);
      }
      setActiveTab('CATALOG');
      setBatchSummary({
        successCount,
        failCount,
        message: failCount === 0
          ? `Successfully ingested and auto-transcribed all ${successCount} links into your Knowledge Vault!`
          : `Processed ${successCount} successfully (${failCount} failed). Check the items below.`,
      });
      setTimeout(() => {
        document.getElementById('catalog-table-matrix')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans pb-16">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
            <Database className="w-4 h-4" />
            <span>LEARNING LIBRARY</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-600">KNOWLEDGE VAULT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2447] tracking-tight">
            Knowledge Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Your central library of language textbooks, worksheets, slides, and study notes ready for curriculum planning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Return to Home Page"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Home Page</span>
          </Link>
          {activeTab === 'UPLOAD' ? (
            <button
              onClick={() => handleSwitchTab('CATALOG')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </button>
          ) : (
            <button
              onClick={() => handleSwitchTab('UPLOAD')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Add Material</span>
            </button>
          )}
          <button
            onClick={() => fetchResources()}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            title="Refresh Library"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top Statistical Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Materials</p>
            <p className="text-xl font-black text-slate-800">{stats.total}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Languages Available</p>
            <p className="text-xl font-black text-emerald-700">{stats.activeLanguages}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Video Lessons</p>
            <p className="text-xl font-black text-rose-700">{stats.videoCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Documents & Web</p>
            <p className="text-xl font-black text-purple-700">{stats.docCount + stats.webCount}</p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CATALOG MATRIX */}
      {/* ===================================================================== */}
      {activeTab === 'CATALOG' && (
        <div ref={catalogSectionRef} id="catalog-section" className="space-y-4 scroll-mt-24">
          {/* Studio Curriculum Selector Banner: User-Friendly & Mobile-Responsive Dropdowns */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#0B2447] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Studio Curriculum Matrix: Language & Target Level</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Select your language and target level to explore verified textbooks, worksheets, and video lessons.
            </p>
          </div>

          {(Boolean(selectedLanguage) || Boolean(selectedLevel)) && (
            <button
              onClick={() => { setSelectedLanguage(''); setSelectedLevel(''); }}
              className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Selection</span>
            </button>
          )}
        </div>

        {/* Dropdowns Row: Stacks vertically on mobile (grid-cols-1), 2 columns on tablet/desktop (sm:grid-cols-2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Language Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Language Selection</span>
                {!selectedLanguage && (
                  <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded text-[9px] font-black animate-pulse">
                    REQUIRED
                  </span>
                )}
              </span>
              {Boolean(selectedLanguage) && (
                <span className="text-[10px] text-blue-600 font-bold uppercase">
                  {selectedLanguage === 'Korean' ? 'Korean Standard' : selectedLanguage === 'Japanese' ? 'JLPT' : 'CEFR'}
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setSelectedLevel('');
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border shadow-2xs focus:outline-none focus:bg-white cursor-pointer appearance-none pr-10 transition-all ${
                  !selectedLanguage
                    ? 'bg-amber-50/70 border-amber-300 text-amber-900 focus:border-amber-500 ring-2 ring-amber-200/50'
                    : 'bg-slate-50 hover:bg-slate-100/80 text-slate-900 border-slate-200 focus:border-blue-500'
                }`}
              >
                <option value="" disabled>-- Select Language (Required) --</option>
                <option value="German">German (Deutsch - CEFR A1–C2)</option>
                <option value="French">French (Français - DELF A1–C2)</option>
                <option value="Spanish">Spanish (Español - DELE A1–C2)</option>
                <option value="Japanese">Japanese (日本語 - JLPT N5–N1)</option>
                <option value="Korean">Korean (한국어 - Standard L1–L4)</option>
                <option value="English">English (Global Cambridge CEFR)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 2. Level Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Target Level</span>
                {Boolean(selectedLanguage) && !selectedLevel && (
                  <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded text-[9px] font-black animate-pulse">
                    REQUIRED
                  </span>
                )}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {selectedLanguage === 'Korean' ? 'Schools & Colleges L1–L4' : selectedLanguage === 'Japanese' ? 'JLPT N5–N1' : selectedLanguage ? 'CEFR A1–C2' : 'Select language first'}
              </span>
            </label>
            <div className="relative">
              <select
                value={selectedLevel}
                disabled={!selectedLanguage}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border shadow-2xs focus:outline-none focus:bg-white appearance-none pr-10 transition-all ${
                  !selectedLanguage
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : !selectedLevel
                      ? 'bg-amber-50/70 border-amber-300 text-amber-900 focus:border-amber-500 ring-2 ring-amber-200/50 cursor-pointer'
                      : 'bg-slate-50 hover:bg-slate-100/80 text-slate-900 border-slate-200 focus:border-blue-500 cursor-pointer'
                }`}
              >
                <option value="" disabled>
                  {!selectedLanguage ? '-- Select Language First --' : `-- Select Target Level for ${selectedLanguage} (Required) --`}
                </option>
                {selectedLanguage === 'Korean' ? (
                  <>
                    <option value="L1">Level L1 (Beginner / Foundation)</option>
                    <option value="L2">Level L2 (Elementary)</option>
                    <option value="L3">Level L3 (Intermediate)</option>
                    <option value="L4">Level L4 (Upper Intermediate)</option>
                  </>
                ) : selectedLanguage === 'Japanese' ? (
                  <>
                    <option value="N5">JLPT N5 (Basic / Starter)</option>
                    <option value="N4">JLPT N4 (Elementary)</option>
                    <option value="N3">JLPT N3 (Intermediate)</option>
                    <option value="N2">JLPT N2 (Pre-Advanced)</option>
                    <option value="N1">JLPT N1 (Advanced)</option>
                  </>
                ) : selectedLanguage ? (
                  <>
                    <option value="A1">Level A1 (Beginner / Foundation)</option>
                    <option value="A2">Level A2 (Elementary)</option>
                    <option value="B1">Level B1 (Intermediate)</option>
                    <option value="B2">Level B2 (Upper Intermediate)</option>
                    <option value="C1">Level C1 (Advanced)</option>
                    <option value="C2">Level C2 (Mastery)</option>
                  </>
                ) : null}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar with Media Filter (Videos, Websites, Links, Documents) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${selectedLanguage ? selectedLanguage + ' ' : ''}materials by title, topic, or keyword...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Type Select Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Format:</span>
                <select
                  value={selectedMediaType}
                  onChange={(e) => setSelectedMediaType(e.target.value as any)}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Materials ({typeCounts.all})</option>
                  <option value="VIDEO">Video Lessons ({typeCounts.videos})</option>
                  <option value="WEBSITE">Websites ({typeCounts.websites})</option>
                  <option value="LINK">Links & URLs ({typeCounts.links})</option>
                  <option value="DOCUMENT">Documents & Files ({typeCounts.documents})</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Filter by:</span>
              <button
                type="button"
                onClick={() => setSelectedMediaType('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  selectedMediaType === 'ALL'
                    ? 'bg-[#0B2447] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>All Materials</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedMediaType === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {typeCounts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMediaType('VIDEO')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  selectedMediaType === 'VIDEO'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Videos</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedMediaType === 'VIDEO' ? 'bg-white/20 text-white' : 'bg-rose-200/70 text-rose-800'}`}>
                  {typeCounts.videos}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMediaType('WEBSITE')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  selectedMediaType === 'WEBSITE'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/60'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Websites</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedMediaType === 'WEBSITE' ? 'bg-white/20 text-white' : 'bg-sky-200/70 text-sky-800'}`}>
                  {typeCounts.websites}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMediaType('LINK')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  selectedMediaType === 'LINK'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Links</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedMediaType === 'LINK' ? 'bg-white/20 text-white' : 'bg-amber-200/70 text-amber-800'}`}>
                  {typeCounts.links}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMediaType('DOCUMENT')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  selectedMediaType === 'DOCUMENT'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Materials / Documents</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedMediaType === 'DOCUMENT' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {typeCounts.documents}
                </span>
              </button>
            </div>
          </div>

          {/* Catalog List */}
          {resources.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-sm font-black text-slate-900">
                  No Materials in Knowledge Vault Yet
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Click <strong>&quot;+ Upload Materials&quot;</strong> above to upload your PDF textbooks, lesson notes, and learning links. Once uploaded, they will be listed in this table immediately.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('UPLOAD')}
                    className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    + Upload Materials Now
                  </button>
                </div>
              </div>
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <Database className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No {selectedMediaType !== 'ALL' ? selectedMediaType.toLowerCase() + ' ' : ''}materials match your current filter{selectedLanguage ? ` for ${selectedLanguage}` : ''}{selectedLevel ? ` (${selectedLevel})` : ''}</p>
              <p className="text-xs text-slate-400">Try switching your format filter above or clear your search query to see all {resources.length} uploaded materials.</p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLanguage('');
                    setSelectedLevel('');
                    setSelectedMediaType('ALL');
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Show All {resources.length} Materials
                </button>
              </div>
            </div>
          ) : (
            <div id="catalog-table-matrix" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-24">
              {/* Table Top Bar */}
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {selectedLanguage ? `${selectedLanguage} ${selectedLevel || 'All Levels'}` : 'All Vault Materials'} Study Materials Matrix
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-black">
                    {filteredCatalog.length} {filteredCatalog.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="text-[11px] font-medium text-slate-500">
                  Tabular Catalog View • Click &apos;View Content&apos; to read
                </div>
              </div>

              {/* Responsive Table Wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4 w-14 text-center">Format</th>
                      <th className="py-3.5 px-4 min-w-[320px]">Material Title & Overview</th>
                      <th className="py-3.5 px-4 min-w-[150px]">Language / Level</th>
                      <th className="py-3.5 px-4 min-w-[130px] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredCatalog.map((item) => {
                      const lang = item.academicContext?.language || (item as any).language?.name || 'General';
                      const badge = formatLevelBadge(item);
                      const isVideo = (item as any).resourceType === 'YOUTUBE_VIDEO' || item.academicContext?.resourceType === 'Video' || (item.originalUrl && (item.originalUrl.includes('youtube.com') || item.originalUrl.includes('youtu.be')));
                      const isWeb = (item as any).resourceType === 'WEBSITE' || item.academicContext?.resourceType === 'Website' || (item.originalUrl && !(item as any).fileStorage && !isVideo);

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-blue-50/40 transition-colors group"
                        >
                          {/* 1. Format Icon Badge */}
                          <td className="py-3.5 px-4 text-center align-middle">
                            {isVideo ? (
                              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200" title="YouTube Video Lesson">
                                <Video className="w-4 h-4" />
                              </div>
                            ) : isWeb ? (
                              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-200" title="Web Article">
                                <Globe className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto border border-slate-200" title="Document File">
                                <FileText className="w-4 h-4" />
                              </div>
                            )}
                          </td>

                          {/* 2. Material Title & Overview */}
                          <td className="py-3.5 px-4 align-middle">
                            <div className="space-y-0.5 max-w-xl">
                              <Link
                                href={`/vault/${item.id}`}
                                className="font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 group-hover:text-blue-700 text-xs sm:text-sm"
                              >
                                {item.title}
                              </Link>
                              <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                                {item.description || item.analysis?.aiSummary || 'Document material available in library.'}
                              </p>
                            </div>
                          </td>

                          {/* 3. Language & Level */}
                          <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md bg-[#0B2447] text-white text-[10px] font-black uppercase">
                                {lang}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-200">
                                {badge.framework} {badge.level}
                              </span>
                            </div>
                          </td>

                          {/* 4. Action Buttons */}
                          <td className="py-3.5 px-4 text-right align-middle whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/vault/${item.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-700 text-xs font-bold transition-all shadow-2xs group/btn"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600 group-hover/btn:text-white transition-colors" />
                                <span>View Content</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => setResourcePendingDelete(item)}
                                className="inline-flex items-center justify-center p-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-all shadow-2xs cursor-pointer group/del"
                                title="Delete study material from Vault"
                              >
                                <Trash2 className="w-3.5 h-3.5 group-hover/del:text-white transition-colors" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: BULK LEARNING MATERIAL INGESTION (FILES & LINKS) */}
      {/* ===================================================================== */}
      {activeTab === 'UPLOAD' && (
        <div ref={uploadSectionRef} id="upload-section" className="w-full space-y-6 scroll-mt-24">
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-slate-900">
                  Add Learning Materials to Knowledge Vault
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Upload multiple documents, books, worksheets, or paste YouTube video and educational website links.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSwitchTab('CATALOG')}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Library Table</span>
            </button>
          </div>

          {/* Step 1: Target Curriculum Configuration (Language & Level) */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center">1</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0B2447]">
                Target Curriculum & Proficiency Setting
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Language Selection (Required) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>Language</span>
                    {!uploadLang && (
                      <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded text-[9px] font-black animate-pulse">
                        REQUIRED
                      </span>
                    )}
                  </span>
                  {Boolean(uploadLang) && (
                    <span className="text-[10px] text-blue-600 font-mono font-bold">
                      {uploadLang === 'Korean' ? 'TOPIK' : uploadLang === 'Japanese' ? 'JLPT' : 'CEFR'}
                    </span>
                  )}
                </label>
                <select
                  value={uploadLang}
                  onChange={(e) => setUploadLang(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none transition-all cursor-pointer ${
                    !uploadLang
                      ? 'bg-amber-50/70 border-amber-300 text-amber-900 focus:border-amber-500 ring-2 ring-amber-200/50'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500'
                  }`}
                >
                  <option value="" disabled>-- Select Language (Required) --</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="French">French (Français)</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="Japanese">Japanese (日本語)</option>
                  <option value="Korean">Korean (한국어)</option>
                  <option value="English">English (International)</option>
                  <option value="General">Other / General Multilingual</option>
                </select>
                <p className="text-[10px] text-slate-400 font-medium">Primary target language for curriculum planning.</p>
              </div>

              {/* 2. Master Knowledge Index (ISML Spec §3.1) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>Master Knowledge Index</span>
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-black">
                      SPEC §3.1
                    </span>
                  </span>
                  <span className={`text-[10px] font-bold ${uploadLang ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {uploadLang ? '6-INDEX TAXONOMY' : 'REQUIRES LANGUAGE'}
                  </span>
                </label>
                <select
                  value={uploadMasterIndex}
                  disabled={!uploadLang}
                  onChange={(e) => setUploadMasterIndex(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none transition-all ${
                    !uploadLang
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed select-none shadow-none'
                      : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-800 focus:border-blue-500 cursor-pointer shadow-2xs'
                  }`}
                >
                  {!uploadLang ? (
                    <option value="AUTO_DETECT">-- Select Target Language above to activate index --</option>
                  ) : (
                    <>
                      <option value="AUTO_DETECT">Auto-Detect by AI (Infer from Content)</option>
                      <option value="LANGUAGE_KNOWLEDGE">1. Language Knowledge (Structure, Grammar, Vocab, Pronunciation)</option>
                      <option value="PROFICIENCY_FRAMEWORKS">
                        {uploadLang === 'Japanese'
                          ? '2. Proficiency Frameworks (JLPT Standards & Descriptors)'
                          : uploadLang === 'Korean'
                          ? '2. Proficiency Frameworks (TOPIK Standards & Descriptors)'
                          : '2. Proficiency Frameworks (CEFR Standards & Can-Do Objectives)'}
                      </option>
                      <option value="CULTURE_SOCIETY">
                        {uploadLang === 'German'
                          ? '3. Culture & Society (DACH Region Customs, Du/Sie Formality & Etiquette)'
                          : uploadLang === 'French'
                          ? '3. Culture & Society (Francophone Culture, Tu/Vous Registers & Manners)'
                          : uploadLang === 'Spanish'
                          ? '3. Culture & Society (Hispanic Culture, Tú/Usted Registers & Traditions)'
                          : uploadLang === 'Japanese'
                          ? '3. Culture & Society (Japanese Keigo, Pragmatics & Social Etiquette)'
                          : uploadLang === 'Korean'
                          ? '3. Culture & Society (Korean Honorifics, Jondaenmal & Cultural Norms)'
                          : '3. Culture & Society (History, Traditions & Lifestyle)'}
                      </option>
                      <option value="LITERATURE_ARTS">4. Literature & Arts (Creative Works, Literature, Poetry, Drama)</option>
                      <option value="ACADEMIC_PROFESSIONAL">5. Academic & Professional Knowledge (Business, Science)</option>
                      <option value="TEACHING_PEDAGOGY">6. Teaching & Pedagogy (Instructional Methods, Strategies)</option>
                    </>
                  )}
                </select>
                <p className="text-[10px] text-slate-400 font-medium">
                  {!uploadLang
                    ? 'Please select a language above first.'
                    : `Configured for ${uploadLang}: AI performs multi-label mapping across this taxonomy.`}
                </p>
              </div>

              {/* 3. Target Proficiency Level (ISML Spec §3.2 - Optional / Auto-Inferred) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>Proficiency Level (Optional)</span>
                    <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[9px] font-black">
                      AUTO-INFERRED
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {uploadLang === 'Korean' ? 'L1–L4' : uploadLang === 'Japanese' ? 'N5–N1' : uploadLang ? 'CEFR A1–C2' : 'Requires Language'}
                  </span>
                </label>
                <select
                  value={uploadLevel}
                  disabled={!uploadLang}
                  onChange={(e) => setUploadLevel(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none transition-all ${
                    !uploadLang
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed select-none shadow-none'
                      : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-800 focus:border-blue-500 cursor-pointer shadow-2xs'
                  }`}
                >
                  {!uploadLang ? (
                    <option value="AUTO_DETECT">-- Select Target Language above to activate level --</option>
                  ) : (
                    <>
                      <option value="AUTO_DETECT">Auto-Detect Level by AI (Evidence-Based Ingestion)</option>
                      {uploadLang === 'Korean' ? (
                        <>
                          <option value="L1">Level L1 (Beginner / Foundation)</option>
                          <option value="L2">Level L2 (Elementary)</option>
                          <option value="L3">Level L3 (Intermediate)</option>
                          <option value="L4">Level L4 (Upper Intermediate)</option>
                        </>
                      ) : uploadLang === 'Japanese' ? (
                        <>
                          <option value="N5">JLPT N5 (Basic)</option>
                          <option value="N4">JLPT N4 (Elementary)</option>
                          <option value="N3">JLPT N3 (Intermediate)</option>
                          <option value="N2">JLPT N2 (Pre-Advanced)</option>
                          <option value="N1">JLPT N1 (Advanced)</option>
                        </>
                      ) : (
                        <>
                          <option value="A1">CEFR A1 (Beginner / Foundation)</option>
                          <option value="A2">CEFR A2 (Elementary)</option>
                          <option value="B1">CEFR B1 (Intermediate)</option>
                          <option value="B2">CEFR B2 (Upper Intermediate)</option>
                          <option value="C1">CEFR C1 (Advanced)</option>
                          <option value="C2">CEFR C2 (Mastery)</option>
                        </>
                      )}
                    </>
                  )}
                </select>
                <p className="text-[10px] text-slate-400 font-medium">
                  {!uploadLang
                    ? 'Please select a language above first.'
                    : 'Leave on Auto-Detect; AI validates content against framework.'}
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Format Choice (Bulk Files vs Bulk Links) */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center">2</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0B2447]">
                Choose Material Type & Queue Files or Links
              </h3>
            </div>

            {/* Mode Selector Toggle */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setUploadMode('FILE')}
                className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  uploadMode === 'FILE'
                    ? 'bg-white text-[#0B2447] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-blue-600" />
                <span>Bulk Document Files ({stagedFiles.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadMode('LINK')}
                className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  uploadMode === 'LINK'
                    ? 'bg-white text-[#0B2447] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Video className="w-4 h-4 text-rose-600" />
                <span>Bulk YouTube & Web Links ({stagedLinks.length})</span>
              </button>
            </div>

            {/* Sub-View A: Bulk Files */}
            {uploadMode === 'FILE' && (
              <div className="space-y-4">
                {/* Drag and Drop Box */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files) {
                      handleAddFilesToQueue(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
                      : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.mp3,.mp4,.wav,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleAddFilesToQueue(e.target.files);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-2xs">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Drop multiple files here, or <span className="text-blue-600 underline">browse your device</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Select multiple files at once • Supports PDF, Word (DOCX), PPTX, MP3 audio, and images (Max 50MB per file)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Staged Files Queue Table */}
                {stagedFiles.length > 0 && (
                  <div id="staged-files-queue" className="rounded-2xl border border-slate-200 overflow-hidden bg-white scroll-mt-24">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Staged Files Queue ({stagedFiles.length})</span>
                      <button
                        type="button"
                        onClick={() => setStagedFiles([])}
                        disabled={isBatchProcessing}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-bold cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                      {stagedFiles.map((sf) => (
                        <div key={sf.id} className="p-3 flex items-center gap-3 hover:bg-slate-50/70 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={sf.title}
                              disabled={isBatchProcessing}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setStagedFiles((prev) => prev.map((f) => f.id === sf.id ? { ...f, title: newTitle } : f));
                              }}
                              placeholder="Title in Knowledge Vault"
                              className="w-full text-xs font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              {sf.name} • {sf.sizeFormatted}
                            </p>
                          </div>

                          {/* Status Pill */}
                          <div className="shrink-0 flex items-center gap-2">
                            {sf.status === 'IDLE' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                Ready
                              </span>
                            )}
                            {sf.status === 'UPLOADING' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 animate-pulse">
                                <RotateCw className="w-3 h-3 animate-spin text-blue-600" /> Uploading...
                              </span>
                            )}
                            {sf.status === 'SUCCESS' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" /> Done
                              </span>
                            )}
                            {sf.status === 'ERROR' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200" title={sf.errorMessage}>
                                Failed
                              </span>
                            )}

                            {!isBatchProcessing && (
                              <button
                                type="button"
                                onClick={() => setStagedFiles((prev) => prev.filter((f) => f.id !== sf.id))}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sub-View B: Bulk Links */}
            {uploadMode === 'LINK' && (
              <div className="space-y-4">
                {/* Single Link Input Row */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Video className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder="Paste YouTube Video URL or Educational Website Link (https://...)"
                        value={singleLinkInput}
                        onChange={(e) => setSingleLinkInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSingleLink();
                          }
                        }}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Title / Label (Optional)"
                      value={singleLinkTitle}
                      onChange={(e) => setSingleLinkTitle(e.target.value)}
                      className="w-full sm:w-52 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:border-rose-500"
                    />

                    <button
                      type="button"
                      onClick={handleAddSingleLink}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add URL</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                    <span className="text-[11px] text-slate-500 font-medium">
                      YouTube videos will be transcribed and indexed with dialogues and vocabulary.
                    </span>

                    <button
                      type="button"
                      onClick={() => setShowBulkPasteModal(!showBulkPasteModal)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Paste Multiple URLs at Once</span>
                    </button>
                  </div>

                  {/* Bulk URLs Paste Textarea Drawer */}
                  {showBulkPasteModal && (
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <label className="text-[11px] font-bold text-slate-700">
                        Paste Multiple URLs (One URL per line):
                      </label>
                      <textarea
                        rows={4}
                        placeholder={`https://www.youtube.com/watch?v=...\nhttps://www.youtube.com/watch?v=...\nhttps://french.kwiziq.com/grammar/`}
                        value={bulkUrlTextArea}
                        onChange={(e) => setBulkUrlTextArea(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:outline-none focus:border-rose-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setBulkUrlTextArea(''); setShowBulkPasteModal(false); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddBulkUrls}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                        >
                          Add All Lines to Queue
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Staged Links Queue Table */}
                {stagedLinks.length > 0 && (
                  <div id="staged-links-queue" className="rounded-2xl border border-slate-200 overflow-hidden bg-white scroll-mt-24">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Staged Links Queue ({stagedLinks.length})</span>
                      <button
                        type="button"
                        onClick={() => setStagedLinks([])}
                        disabled={isBatchProcessing}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-bold cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                      {stagedLinks.map((sl) => (
                        <div key={sl.id} className="p-3 flex items-center gap-3 hover:bg-slate-50/70 transition-colors">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            sl.isYouTube ? 'bg-rose-50 text-rose-600' : 'bg-sky-50 text-sky-600'
                          }`}>
                            {sl.isYouTube ? <Video className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={sl.title || ''}
                              disabled={isBatchProcessing}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setStagedLinks((prev) => prev.map((l) => l.id === sl.id ? { ...l, title: newTitle } : l));
                              }}
                              placeholder="Title in Knowledge Vault (leave blank for video title)"
                              className="w-full text-xs font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              {sl.url}
                            </p>
                          </div>

                          {/* Status Pill */}
                          <div className="shrink-0 flex items-center gap-2">
                            {sl.status === 'IDLE' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                Ready
                              </span>
                            )}
                            {sl.status === 'PROCESSING' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 animate-pulse">
                                <RotateCw className="w-3 h-3 animate-spin text-rose-600" /> Transcribing...
                              </span>
                            )}
                            {sl.status === 'SUCCESS' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" /> Ingested
                              </span>
                            )}
                            {sl.status === 'ERROR' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200" title={sl.errorMessage}>
                                Failed
                              </span>
                            )}

                            {!isBatchProcessing && (
                              <button
                                type="button"
                                onClick={() => setStagedLinks((prev) => prev.filter((l) => l.id !== sl.id))}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Batch Progress Bar (While processing) */}
          {isBatchProcessing && batchProgress && (
            <div className="p-5 rounded-2xl bg-white border border-blue-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>Processing {batchProgress.current} of {batchProgress.total} materials...</span>
                </span>
                <span className="text-blue-600">{batchProgress.percentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${batchProgress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Summary Banner after completion */}
          {batchSummary && (
            <div className={`p-5 rounded-2xl text-xs font-bold border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              batchSummary.failCount === 0
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              <div className="flex items-center gap-2.5">
                {batchSummary.failCount === 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <span>{batchSummary.message}</span>
              </div>

              <button
                type="button"
                onClick={() => handleSwitchTab('CATALOG')}
                className="px-4 py-2 rounded-xl bg-[#0B2447] text-white hover:bg-black font-bold text-xs shrink-0 cursor-pointer shadow-xs"
              >
                View in Materials Table
              </button>
            </div>
          )}

          {/* Step 4: Master Action Submission Button */}
          <button
            type="button"
            onClick={handleBatchSubmit}
            disabled={isBatchProcessing || !uploadLang || (uploadMode === 'FILE' ? stagedFiles.length === 0 : stagedLinks.length === 0)}
            className={`w-full py-4 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              isBatchProcessing || !uploadLang || (uploadMode === 'FILE' ? stagedFiles.length === 0 : stagedLinks.length === 0)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#0B2447] hover:bg-black text-white cursor-pointer'
            }`}
          >
            {isBatchProcessing ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Processing Bulk Upload & AI Auto-Indexing...</span>
              </>
            ) : !uploadLang ? (
              <span>Please Select Language in Step 1 Above</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {uploadMode === 'FILE'
                    ? stagedFiles.length === 0
                      ? 'Add Files Above to Start Upload'
                      : `Start Uploading & Auto-Indexing ${stagedFiles.length} ${stagedFiles.length === 1 ? 'File' : 'Files'}`
                    : stagedLinks.length === 0
                      ? 'Add Links Above to Start Ingestion'
                      : `Start Ingesting & Transcribing ${stagedLinks.length} ${stagedLinks.length === 1 ? 'Link' : 'Links'}`
                  }
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Delete Confirmation Warning Modal */}
      {resourcePendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Delete Study Material
                </h3>
                <p className="text-xs font-bold text-slate-500 line-clamp-1">
                  {resourcePendingDelete.title}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 text-xs space-y-1">
              <p className="font-extrabold text-amber-900">
                Warning: Permanent Data Erasure
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                This action will completely erase this study material, its extracted lesson content, and all associated vector embeddings from the Knowledge Vault and memory. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResourcePendingDelete(null)}
                disabled={isDeletingResource}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteResource}
                disabled={isDeletingResource}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeletingResource ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Erasing from Memory...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

