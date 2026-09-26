"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Library, 
  Sparkles, 
  Search, 
  PlusCircle, 
  LogOut, 
  AlertTriangle,
  Database
} from 'lucide-react';

const navSections = [
  {
    title: 'MAIN MENU',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Resource Library', href: '/resources', icon: Library }
    ]
  },
  {
    title: 'AI & CONTENT TOOLS',
    items: [
      { name: 'Find Resources', href: '/resources/find', icon: Search, badge: 'AI' },
      { name: 'Generate Resource', href: '/resources/generate', icon: Sparkles, badge: 'AI' },
      { name: 'Add Resource', href: '/resources/add', icon: PlusCircle }
    ]
  }
];

const isRouteActive = (pathname: string, href: string): boolean => {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  if (href === '/resources') {
    if (pathname === '/resources') return true;
    if (pathname.startsWith('/resources/')) {
      const subToolRoutes = ['/resources/find', '/resources/generate', '/resources/add'];
      return !subToolRoutes.some(sub => pathname.startsWith(sub));
    }
    return false;
  }
  return pathname === href || pathname.startsWith(href + '/');
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showSignOutPopover, setShowSignOutPopover] = useState(false);

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-[#0B2447] text-white border-r border-[#1E3A8A] h-screen sticky top-0 z-40 transition-all duration-300 shadow-xl overflow-hidden shrink-0 font-sans">
      {/* Platform Branding Header */}
      <div className="px-4 py-3 bg-[#071730] border-b border-[#1E3A8A] flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden group">
          <div className="w-9 h-9 rounded-xl bg-white p-1 shrink-0 shadow-md group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center">
            <img src="/logo.png" alt="ISML Logo" className="w-full h-full object-contain" />
          </div>
          <div className="truncate">
            <h1 className="text-xs font-black text-white tracking-wide uppercase">ISML AI Platform</h1>
            <p className="text-[10px] text-cyan-300 font-mono truncate">Language Resource Agent</p>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {navSections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
              {sec.title}
            </p>

            {sec.items.map((item) => {
              const isActive = isRouteActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0052CC] text-white shadow-md shadow-blue-900/50 border-l-4 border-cyan-400 font-bold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-300 scale-110' : 'text-slate-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black bg-cyan-500 text-slate-950 rounded-full uppercase tracking-wider shadow-2xs">
                      {item.badge}
                    </span>
                  )}

                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Curator User Profile Footer */}
      <div className="p-3 border-t border-[#1E3A8A] bg-[#071730] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-full bg-[#0052CC] text-cyan-300 border border-cyan-400/40 flex items-center justify-center font-bold text-xs shrink-0">
            AM
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-100 truncate">Academic Manager</p>
            <p className="text-[10px] text-cyan-300/80 truncate">Resource Curator</p>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowSignOutPopover(!showSignOutPopover)}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer rounded-lg hover:bg-white/5"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {showSignOutPopover && (
            <div className="absolute bottom-full right-0 mb-2 w-60 p-3.5 bg-white text-slate-900 rounded-2xl border border-rose-200 shadow-2xl z-50 space-y-2.5 font-sans animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-extrabold text-[#0B2447]">Exit Workspace?</h4>
                  <p className="text-[10px] text-slate-500 font-medium">End your current curator session.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => setShowSignOutPopover(false)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
