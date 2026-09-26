"use client";

import React, { useState } from 'react';
import { Settings, Sparkles, ShieldCheck, Bell, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [autoApproveScore, setAutoApproveScore] = useState('95');
  const [copyrightStrictness, setCopyrightStrictness] = useState('High');
  const [discoveryInterval, setDiscoveryInterval] = useState('Weekly');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-[#0B2447]">Platform & AI Agent Settings</h1>
        <p className="text-xs text-slate-500 font-medium">
          Configure resource curation rules, AI quality thresholds, and scheduled web discovery parameters.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Platform preferences saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. General Preferences */}
        <div className="isml-card p-5 border border-slate-200 bg-white rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Settings className="w-4 h-4 text-[#0052CC]" />
            <h3 className="text-sm font-extrabold text-[#0B2447]">General Resource Preferences</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Default Platform Language</label>
              <select className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium outline-none">
                <option value="German">German</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Default CEFR Level Focus</label>
              <select className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium outline-none">
                <option value="A1">A1 (Beginner)</option>
                <option value="A2">A2 (Elementary)</option>
                <option value="B1">B1 (Intermediate)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. AI Preferences */}
        <div className="isml-card p-5 border border-slate-200 bg-white rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-extrabold text-[#0B2447]">AI Curation & Quality Rules</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">AI Recommendation Threshold (% Quality)</label>
              <input
                type="number"
                value={autoApproveScore}
                onChange={e => setAutoApproveScore(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Scores above this threshold receive "APPROVED_RECOMMENDED" status.</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Copyright Risk Strictness</label>
              <select
                value={copyrightStrictness}
                onChange={e => setCopyrightStrictness(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium outline-none"
              >
                <option value="Strict">Strict (Flag any unverified license)</option>
                <option value="High">High Concern Only (Default)</option>
                <option value="Moderate">Moderate</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Scheduled AI Discovery Interval</label>
              <select
                value={discoveryInterval}
                onChange={e => setDiscoveryInterval(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium outline-none"
              >
                <option value="Daily">Daily Background Sweep</option>
                <option value="Weekly">Weekly Scheduled Discovery</option>
                <option value="Manual">Manual Trigger Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Preferences
        </button>
      </form>
    </div>
  );
}
