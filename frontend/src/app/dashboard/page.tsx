"use client";

import React from 'react';
import Link from 'next/link';
import { useResources } from '@/context/ResourceContext';
import { useMasterData } from '@/context/MasterDataContext';
import ResourceCard from '@/components/resource/ResourceCard';
import StatusBadge from '@/components/common/StatusBadge';
import { 
  Sparkles, 
  Search, 
  PlusCircle, 
  Library,
  ArrowRight, 
  BookOpen,
  Globe,
  FolderTree,
  CheckSquare,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Zap
} from 'lucide-react';

// Helper Component for Animated Smooth Number Count-Up (Hydration-Safe)
function AnimatedStatNumber({ value, isLoading }: { value: number; isLoading: boolean }) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted || isLoading) return;
    const duration = 650;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * value);
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, isLoading, isMounted]);

  if (!isMounted) {
    return (
      <span className="text-2xl sm:text-3xl font-black text-[#0B2447] tracking-tight transition-all">
        {value}
      </span>
    );
  }

  if (isLoading) {
    return (
      <span className="inline-block h-8 w-16 bg-slate-200/80 animate-pulse rounded-lg my-1" />
    );
  }

  return (
    <span className="text-2xl sm:text-3xl font-black text-[#0B2447] tracking-tight transition-all">
      {displayValue}
    </span>
  );
}

export default function DashboardPage() {
  const { resources, stats, isLoading, error } = useResources();
  const { languages, categories } = useMasterData();

  const recentResources = resources.slice(0, 4);
  const pendingResources = resources.filter(r => 
    r.status === 'PENDING_REVIEW' || r.status === 'CHANGES_REQUIRED' || r.status === 'Pending Review'
  ).slice(0, 4);

  return (
    <div className="space-y-6 font-sans pb-24 max-w-7xl mx-auto">

      {/* 1. Platform Hero Banner (Vibrant Navy & Red Accent) */}
      <div className="bg-gradient-to-r from-[#0B2447] via-[#071730] to-[#092C74] text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden border border-[#1E3A8A]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse shadow-xs">
                <span className="w-2 h-2 rounded-full bg-white animate-ping block" />
                LIVE PLATFORM
              </span>
              <span className="text-xs font-bold text-cyan-300">
                ISML AI Language Resource Agent
              </span>
            </div>

            <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white leading-snug">
              Academic Language Resource Management
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Discover, organize, analyze, enrich, and maintain foreign-language learning resources with automated AI intelligence & human review.
            </p>
          </div>

          <Link
            href="/resources/generate"
            className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg hover:shadow-rose-900/40 transition-all flex items-center justify-center gap-2 shrink-0 group border border-rose-400/30"
          >
            <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            <span>Generate AI Resource</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Platform Statistics Cards (4 Cards - Styled like the reference design) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Stat 1: Total Resources */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2 hover:border-[#0052CC] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">TOTAL RESOURCES</span>
            <BookOpen className="w-4 h-4 text-[#0052CC]" />
          </div>
          <p className="text-2xl font-black text-[#0B2447]">
            <AnimatedStatNumber value={stats.totalResources} isLoading={isLoading} />
          </p>
          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-600">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Verified Catalog
            </span>
            <span className="text-slate-400 font-mono">100%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#0052CC] rounded-full w-full" />
          </div>
        </div>

        {/* Stat 2: Active Published */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2 hover:border-emerald-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">ACTIVE PUBLISHED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-[#0B2447]">
            <AnimatedStatNumber value={stats.publishedCount} isLoading={isLoading} />
          </p>
          <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Verified Catalog
          </p>
        </div>

        {/* Stat 3: Domain Languages */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2 hover:border-blue-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">DOMAIN LANGUAGES</span>
            <Globe className="w-4 h-4 text-[#0052CC]" />
          </div>
          <p className="text-2xl font-black text-[#0B2447]">
            <AnimatedStatNumber value={languages.length || 5} isLoading={isLoading} />
          </p>
          <p className="text-[10px] font-medium text-slate-500">CEFR A1-C1 Support</p>
        </div>

        {/* Stat 4: Needs Review */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2 hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">NEEDS REVIEW</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">
            <AnimatedStatNumber value={stats.needsReviewCount} isLoading={isLoading} />
          </p>
          <p className="text-[10px] font-medium text-amber-700">Awaiting Curator Action</p>
        </div>

      </div>

      {/* 3. Quick AI & Management Hub */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            Quick AI Tools & Management Hub
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/resources/find"
            className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-[#0052CC] transition-all flex flex-col items-start gap-2.5 group shadow-2xs hover:shadow-xs"
          >
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700 group-hover:scale-110 transition-transform border border-cyan-100">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#0B2447] group-hover:text-[#0052CC]">Find Resources</h4>
              <p className="text-[10px] text-slate-500">Discover OER content</p>
            </div>
          </Link>

          <Link
            href="/resources/generate"
            className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-purple-400 transition-all flex flex-col items-start gap-2.5 group shadow-2xs hover:shadow-xs"
          >
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 group-hover:scale-110 transition-transform border border-purple-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#0B2447] group-hover:text-purple-700">Generate AI</h4>
              <p className="text-[10px] text-slate-500">Create study guides</p>
            </div>
          </Link>

          <Link
            href="/resources/add"
            className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-blue-400 transition-all flex flex-col items-start gap-2.5 group shadow-2xs hover:shadow-xs"
          >
            <div className="p-2.5 rounded-xl bg-blue-50 text-[#0052CC] group-hover:scale-110 transition-transform border border-blue-100">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#0B2447] group-hover:text-[#0052CC]">Add Resource</h4>
              <p className="text-[10px] text-slate-500">Manual upload hub</p>
            </div>
          </Link>

          <Link
            href="/resources"
            className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-slate-400 transition-all flex flex-col items-start gap-2.5 group shadow-2xs hover:shadow-xs"
          >
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 group-hover:scale-110 transition-transform border border-slate-200">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#0B2447]">Resource Library</h4>
              <p className="text-[10px] text-slate-500">{stats.totalResources} cataloged</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Platform Main Content Grid (Recent Resources + Needs Attention) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Recent Platform Resources */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-[#0B2447]">Recent Platform Resources</h3>
            <Link href="/resources" className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-2xl">
              Loading recent platform resources...
            </div>
          ) : recentResources.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-slate-500 border border-dashed border-slate-300 rounded-2xl bg-white">
              No resources stored in database yet. Click &quot;Add Resource&quot; or &quot;Generate AI&quot; to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentResources.map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 col): Needs Attention Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-amber-600" />
              Needs Attention Queue
            </h3>
            {stats.needsReviewCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500 text-slate-950 rounded-full">
                {stats.needsReviewCount}
              </span>
            )}
          </div>

          {pendingResources.length === 0 ? (
            <div className="p-5 text-center text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-2xl">
              ✅ All resources are reviewed and published!
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="space-y-2">
                {pendingResources.map((p) => (
                  <div 
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:border-amber-300 transition-all"
                  >
                    <div className="space-y-0.5 truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {p.title}
                      </p>
                      <p className="text-[10px] font-medium text-slate-500">
                        {p.academicContext?.language || 'German'} • {p.academicContext?.level || 'A1'}
                      </p>
                    </div>
                    <StatusBadge status={p.status} size="sm" />
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <span className="text-[11px] font-medium text-slate-500">
                  {stats.needsReviewCount} items awaiting curator decision
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
