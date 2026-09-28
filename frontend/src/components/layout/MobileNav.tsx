"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Library, 
  Search, 
  Sparkles, 
  Globe,
  PlusCircle 
} from 'lucide-react';

const isRouteActive = (pathname: string, href: string): boolean => {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  if (href === '/resources') {
    if (pathname === '/resources') return true;
    if (pathname.startsWith('/resources/')) {
      const subToolRoutes = ['/resources/find', '/resources/generate', '/resources/internal-ai', '/resources/add'];
      return !subToolRoutes.some(sub => pathname.startsWith(sub));
    }
    return false;
  }
  return pathname === href || pathname.startsWith(href + '/');
};

const mobileNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Library', href: '/resources', icon: Library },
  { name: 'Find', href: '/resources/find', icon: Search },
  { name: 'Internal AI', href: '/resources/internal-ai', icon: Globe },
  { name: 'Generate', href: '/resources/generate', icon: Sparkles },
  { name: 'Add', href: '/resources/add', icon: PlusCircle },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 bg-[#0B2447] border-t border-[#1E3A8A] z-40 lg:hidden flex items-center justify-around px-1 py-1 shadow-2xl font-sans backdrop-blur-md">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = isRouteActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all flex-1 text-center ${
              isActive ? 'text-cyan-300 font-extrabold bg-[#1E3A8A]/60 border border-cyan-500/20 shadow-xs' : 'text-slate-400 hover:text-white font-medium'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300 scale-110' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight truncate w-full">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
