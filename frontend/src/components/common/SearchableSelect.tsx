"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X, Sparkles } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  sublabel?: string;
  icon?: string;
}

interface SearchableSelectProps {
  label: string;
  options: (Option | string)[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  disabled = false,
  className = ''
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: Option[] = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const filteredOptions = normalizedOptions.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedOption = normalizedOptions.find(opt => 
    opt.value === value || 
    opt.value.toLowerCase() === (value || '').toLowerCase() ||
    opt.label.toLowerCase() === (value || '').toLowerCase()
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`flex flex-col gap-1.5 w-full font-sans relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center justify-between px-0.5">
          <span>{label}</span>
          {selectedOption && (
            <span className="text-[10px] text-[#0052CC] font-extrabold flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full">
              <Sparkles className="w-2.5 h-2.5" /> Selected
            </span>
          )}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
          disabled 
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
            : open 
              ? 'bg-white border-[#0052CC] ring-4 ring-blue-500/10 shadow-md scale-[1.005]' 
              : 'bg-white border-slate-200/90 text-slate-800 hover:border-blue-400 hover:bg-slate-50/50 shadow-2xs'
        }`}
      >
        <span className="truncate">
          {selectedOption ? (
            <span className="flex items-center gap-2 font-bold text-slate-900">
              {selectedOption.icon && <span className="text-base">{selectedOption.icon}</span>}
              <span className="truncate">{selectedOption.label}</span>
            </span>
          ) : (
            <span className="text-slate-400 font-medium">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${open ? 'rotate-180 text-[#0052CC]' : ''}`} />
      </button>

      {/* Selector Dropdown Overlay */}
      {open && (
        <>
          {/* Mobile Overlay */}
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-150" onClick={() => setOpen(false)} />

          <div className={`
            fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md rounded-t-3xl p-4 shadow-2xl border-t border-slate-200/80 max-h-[75vh] flex flex-col
            md:absolute md:top-full md:bottom-auto md:left-0 md:right-0 md:z-50 md:rounded-2xl md:p-2.5 md:shadow-xl md:border md:border-slate-200/90 md:max-h-64 md:mt-1.5 animate-in fade-in zoom-in-95 duration-150
          `}>
            {/* Header for Mobile */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 md:hidden">
              <span className="text-sm font-black text-[#0B2447]">Select {label}</span>
              <button type="button" onClick={() => setOpen(false)} className="p-1 rounded-xl text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input inside Selector */}
            <div className="flex items-center bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-2 mb-2 focus-within:ring-2 focus-within:ring-[#0052CC] focus-within:bg-white transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={`Search ${label.replace(/\*|\d+\./g, '').trim().toLowerCase()}...`}
                className="bg-transparent text-xs outline-none w-full text-slate-800 placeholder-slate-400 font-medium"
                autoFocus
              />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-600 px-1 font-bold">×</button>
              )}
            </div>

            {/* Option List */}
            <div className="overflow-y-auto flex-1 space-y-1 pr-0.5 custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-xs font-semibold text-slate-400">No matching options</div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value || (selectedOption && selectedOption.value === opt.value);
                  const isCustomOpt = opt.value.startsWith('Other / Custom');

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                        setSearchTerm('');
                      }}
                      className={`w-full min-h-[42px] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-gradient-to-r from-[#0052CC] to-blue-600 text-white font-bold shadow-xs' 
                          : isCustomOpt
                            ? 'text-[#0052CC] bg-blue-50/60 hover:bg-blue-100/80 font-bold border border-blue-200/60'
                            : 'text-slate-700 hover:bg-blue-50/70 hover:text-[#0052CC]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {opt.icon && <span className="text-base shrink-0">{opt.icon}</span>}
                        <div className="truncate">
                          <p className="truncate">{opt.label}</p>
                          {opt.sublabel && (
                            <p className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400 font-medium'}`}>
                              {opt.sublabel}
                            </p>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
