"use client";

import React, { useState } from 'react';
import { Resource } from '@/types/resource';
import { useResources } from '@/context/ResourceContext';
import { X, CheckCircle2, Globe, ArrowRight, Library, Send } from 'lucide-react';
import Link from 'next/link';

interface PublishDialogProps {
  resource: Resource;
  isOpen: boolean;
  onClose: () => void;
}

export default function PublishDialog({ resource, isOpen, onClose }: PublishDialogProps) {
  const { publishResource } = useResources();
  const [session, setSession] = useState('Session 1');
  const [published, setPublished] = useState(false);

  if (!isOpen) return null;

  const targetPath = `${resource.academicContext.language} > ${resource.academicContext.course} > Level ${resource.academicContext.level} > ${resource.academicContext.module} > ${resource.academicContext.topic} > ${session}`;

  const handlePublish = () => {
    publishResource(resource.id, targetPath);
    setPublished(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden space-y-4 p-6 relative">
        
        {!published ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0052CC]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0B2447]">Publish Resource to LMS</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Curriculum mapping & catalog activation</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resource Info */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Target Resource</span>
              <p className="text-xs font-bold text-[#0B2447]">{resource.title}</p>
            </div>

            {/* Curriculum Mapping Breakdown */}
            <div className="space-y-2.5 text-xs">
              <label className="font-bold text-slate-700 block">Publication Mapping Breakdown</label>
              <div className="space-y-1.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-slate-800 font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Language:</span>
                  <span className="font-extrabold text-[#0052CC]">{resource.academicContext.language}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Level:</span>
                  <span className="font-extrabold text-[#0052CC]">Level {resource.academicContext.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Module:</span>
                  <span className="font-extrabold text-slate-900 truncate max-w-[220px]">{resource.academicContext.module}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Topic:</span>
                  <span className="font-extrabold text-slate-900 truncate max-w-[220px]">{resource.academicContext.topic}</span>
                </div>
              </div>

              {/* Optional Session Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Session Target (Optional)</label>
                <select
                  value={session}
                  onChange={e => setSession(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value="Session 1">Session 1 — Introduction & Core Dialogue</option>
                  <option value="Session 2">Session 2 — Practice Exercises & Worksheets</option>
                  <option value="Session 3">Session 3 — Assessment & Review</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="flex-1 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Publish Resource</span>
              </button>
            </div>
          </>
        ) : (
          /* SUCCESS STATE */
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-emerald-900">Resource Published Successfully!</h3>
              <p className="text-xs text-slate-600">The resource is now live in the active student learning stream.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1 font-mono">
              <div className="flex items-center justify-between text-slate-500">
                <span>Resource ID:</span>
                <span className="font-bold text-slate-800">{resource.id}</span>
              </div>
              <div className="text-slate-500">
                <span>Published Location:</span>
                <p className="font-bold text-[#0052CC] text-[11px] truncate mt-0.5">{targetPath}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Dialog
              </button>
              <Link
                href="/resources"
                onClick={onClose}
                className="flex-1 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors text-center flex items-center justify-center gap-1"
              >
                <Library className="w-4 h-4" /> Go to Library
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
