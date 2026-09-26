"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ProcessedFileData {
  fileName: string;
  fileSize: string;
  mimeType: string;
  fileUrl?: string;
  resourceId?: string;
  aiAnalysis?: any;
  copyrightAnalysis?: any;
}

interface FileUploadProps {
  onFileProcessed: (fileData: ProcessedFileData) => void;
}

export default function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ fileName: string; fileSize: string; mimeType: string } | null>(null);
  const [uploadStep, setUploadStep] = useState<'idle' | 'uploading' | 'processing' | 'extracting' | 'analyzing' | 'classifying' | 'complete' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedTypes = ['PDF', 'PPT', 'PPTX', 'DOC', 'DOCX', 'Audio (MP3/WAV)', 'Image'];

  const processFile = async (file: File) => {
    // 1. Check extension
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'mp3', 'wav', 'png', 'jpg', 'jpeg'];
    
    if (!allowed.includes(ext)) {
      setErrorMessage(`Unsupported file format (.${ext}). Please upload PDF, DOC, PPT, Audio or Image files.`);
      setUploadStep('error');
      return;
    }

    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const initialPayload: ProcessedFileData = {
      fileName: file.name,
      fileSize: fileSizeMb,
      mimeType: file.type || ext.toUpperCase(),
    };

    setSelectedFile(initialPayload);
    setErrorMessage('');
    setUploadStep('uploading');

    try {
      // 2. Prepare FormData for NestJS backend endpoint
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

      setUploadStep('processing');

      // 3. Post to NestJS FilesController
      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        body: formData,
      });

      setUploadStep('extracting');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `File upload failed with status ${response.status}`);
      }

      setUploadStep('analyzing');

      const result = await response.json();
      const resData = result.data || {};
      const resource = resData.resource || {};

      setUploadStep('classifying');

      const completePayload: ProcessedFileData = {
        fileName: file.name,
        fileSize: fileSizeMb,
        mimeType: file.type || ext.toUpperCase(),
        fileUrl: resData.fileUrl || resource.publishedLocation || '',
        resourceId: resource.id,
        aiAnalysis: resource.aiAnalyses?.[0],
        copyrightAnalysis: resource.copyrightAnalyses?.[0],
      };

      setTimeout(() => {
        setUploadStep('complete');
        onFileProcessed(completePayload);
      }, 400);
    } catch (err: any) {
      console.error('File upload error:', err);
      setErrorMessage(err.message || 'Failed to upload binary file to backend storage');
      setUploadStep('error');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`isml-card p-8 border-2 border-dashed text-center rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
          dragActive 
            ? 'border-[#0052CC] bg-blue-50/70 scale-[1.01]' 
            : 'border-slate-300 bg-white hover:border-[#0052CC] hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept=".pdf,.ppt,.pptx,.doc,.docx,.mp3,.wav,.png,.jpg,.jpeg"
        />

        <div className="p-3.5 rounded-full bg-blue-50 text-[#0052CC] shadow-2xs">
          <Upload className="w-8 h-8" />
        </div>

        <div>
          <h4 className="text-sm font-extrabold text-[#0B2447]">Drag & Drop Academic File Here</h4>
          <p className="text-xs text-slate-500 font-medium">or click to browse your local directory</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          {supportedTypes.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {uploadStep === 'error' && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setUploadStep('idle')} className="text-rose-500 font-bold px-1 cursor-pointer">✕</button>
        </div>
      )}

      {/* Pipeline Execution Card */}
      {uploadStep !== 'idle' && uploadStep !== 'error' && selectedFile && (
        <div className="isml-card p-5 border border-slate-200 rounded-2xl bg-white space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#0052CC]" />
              <div>
                <p className="text-xs font-bold text-slate-900">{selectedFile.fileName}</p>
                <p className="text-[10px] text-slate-500 font-mono">{selectedFile.fileSize}</p>
              </div>
            </div>
            {uploadStep === 'complete' ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Storage Upload Complete
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-[#0052CC] text-[10px] font-extrabold flex items-center gap-1 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to Supabase Storage
              </span>
            )}
          </div>

          {/* Stepper progress */}
          <div className="grid grid-cols-5 gap-1 text-[10px] font-extrabold text-center">
            {[
              { id: 'uploading', label: '1. Uploading' },
              { id: 'processing', label: '2. Storage' },
              { id: 'extracting', label: '3. Extracting' },
              { id: 'analyzing', label: '4. AI Analysis' },
              { id: 'classifying', label: '5. Cataloging' }
            ].map((st, i) => {
              const stepOrder = ['uploading', 'processing', 'extracting', 'analyzing', 'classifying', 'complete'];
              const currentIdx = stepOrder.indexOf(uploadStep);
              const isPast = currentIdx >= i;
              const isCurrent = stepOrder[i] === uploadStep;

              return (
                <div
                  key={st.id}
                  className={`p-2 rounded-lg border transition-all ${
                    isCurrent 
                      ? 'bg-[#0052CC] text-white border-blue-600 scale-105 shadow-xs' 
                      : isPast 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}
                >
                  {st.label}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
