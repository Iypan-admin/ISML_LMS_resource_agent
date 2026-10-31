"use client";

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import { MasterDataProvider } from '@/context/MasterDataContext';
import { ResourceProvider } from '@/context/ResourceContext';

import { usePathname } from 'next/navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAgentStudio = pathname?.startsWith('/faculty/studio');

  if (isAgentStudio) {
    return (
      <MasterDataProvider>
        <ResourceProvider>
          <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
            <main className="w-full min-h-screen">
              {children}
            </main>
          </div>
        </ResourceProvider>
      </MasterDataProvider>
    );
  }

  return (
    <MasterDataProvider>
      <ResourceProvider>
        <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans antialiased">
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Main Content Body */}
          <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
            <Header />
            <main className="flex-1 p-2.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </ResourceProvider>
    </MasterDataProvider>
  );
}
