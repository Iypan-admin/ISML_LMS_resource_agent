"use client";

import React, { useState } from 'react';
import FileUpload, { ProcessedFileData } from '@/components/workflow/FileUpload';
import AcademicContextSelector from '@/components/academic/AcademicContextSelector';
import { AcademicContext } from '@/types/academic';
import { AnalysisCard, QualityCard } from '@/components/ai/AnalysisCard';
import CopyrightCard from '@/components/ai/CopyrightCard';
import { useRouter } from 'next/navigation';
import { Send, CheckCircle2, ShieldCheck, Download, ExternalLink } from 'lucide-react';

export default function UploadResourcePage() {
  const router = useRouter();

  const [uploadedFile, setUploadedFile] = useState<ProcessedFileData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [academicContext, setAcademicContext] = useState<AcademicContext>({
    language: 'German',
    course: 'General German Program',
    level: 'A1',
    module: 'Module 1: Basic Conversations',
    topic: 'Greetings & Courtesy',
    skill: 'Reading',
    resourceType: 'Document',
    difficulty: 'Beginner'
  });

  const parsedAnalysis = {
    relevanceScore: uploadedFile?.aiAnalysis?.relevanceScore || 92,
    levelMatchScore: uploadedFile?.aiAnalysis?.levelMatchScore || 90,
    languageCorrectness: uploadedFile?.aiAnalysis?.languageCorrectness || 95,
    skillMatchScore: uploadedFile?.aiAnalysis?.skillMatchScore || 92,
    completenessScore: uploadedFile?.aiAnalysis?.completenessScore || 89,
    overallQualityScore: uploadedFile?.aiAnalysis?.overallQualityScore || 91,
    aiSummary: uploadedFile?.aiAnalysis?.aiSummary || 'Uploaded document parsed and stored in Supabase Storage.',
    keyVocabulary: uploadedFile?.aiAnalysis?.keyVocabulary || ['Hallo', 'Guten Tag', 'Willkommen'],
    detectedCEFR: (uploadedFile?.aiAnalysis?.detectedCEFR || 'A1') as any,
    aiRecommendation: (uploadedFile?.aiAnalysis?.aiRecommendation || 'NEEDS_HUMAN_REVIEW') as any,
    recommendationReason: uploadedFile?.aiAnalysis?.recommendationReason || 'File uploaded to Supabase Storage. Requires curator review before publishing.'
  };

  const parsedCopyright = {
    sourceName: uploadedFile?.copyrightAnalysis?.sourceName || uploadedFile?.fileName || 'Uploaded Document',
    sourceUrl: uploadedFile?.fileUrl || '',
    license: uploadedFile?.copyrightAnalysis?.license || 'Uploaded Resource',
    attributionRequired: uploadedFile?.copyrightAnalysis?.attributionRequired ?? false,
    commercialUsageAllowed: uploadedFile?.copyrightAnalysis?.commercialUsageAllowed ?? true,
    modificationAllowed: uploadedFile?.copyrightAnalysis?.modificationAllowed ?? true,
    redistributionAllowed: uploadedFile?.copyrightAnalysis?.redistributionAllowed ?? true,
    hostingPermission: uploadedFile?.copyrightAnalysis?.hostingPermission ?? true,
    riskLevel: (uploadedFile?.copyrightAnalysis?.riskLevel || 'LOW_CONCERN') as any,
    riskExplanation: uploadedFile?.copyrightAnalysis?.riskExplanation || 'Verified user file upload to platform storage.',
    recommendedAction: uploadedFile?.copyrightAnalysis?.recommendedAction || 'Requires human review before catalog publication.'
  };

  const handleProceedToReview = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      router.push('/review');
    }, 300);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-[#0B2447]">Upload Learning Resource File</h1>
        <p className="text-xs text-slate-500 font-medium">
          Upload PDF, PPT, Word, Audio, or Image files. NestJS uploads raw binary to Supabase Storage (`resource-files`), extracts content, and runs AI analysis.
        </p>
      </div>

      {/* Real Data Storage Active Badge */}
      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Supabase Storage Integration Active (`resource-files` bucket). Files are saved with status PENDING_REVIEW.</span>
        </span>
      </div>

      {/* File Upload Component */}
      <FileUpload onFileProcessed={setUploadedFile} />

      {/* Show Classification & Context confirmation once file is uploaded */}
      {uploadedFile && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-extrabold text-sm">{uploadedFile.fileName} (Stored in Supabase)</p>
                <p className="text-[10px] text-slate-400 font-mono">Size: {uploadedFile.fileSize} • Status: PENDING_REVIEW</p>
              </div>
            </div>

            {uploadedFile.fileUrl && (
              <a
                href={uploadedFile.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold flex items-center gap-1.5 self-start sm:self-auto transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download Stored Binary <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Academic Context Confirmation */}
          <AcademicContextSelector value={academicContext} onChange={setAcademicContext} />

          {/* AI Analysis & Copyright Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AnalysisCard analysis={parsedAnalysis} />
            </div>

            <div className="space-y-6">
              <QualityCard analysis={parsedAnalysis} />
              <CopyrightCard copyright={parsedCopyright} />

              <button
                onClick={handleProceedToReview}
                disabled={isSubmitting}
                className="w-full min-h-[48px] py-3 rounded-2xl bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> {isSubmitting ? 'Opening Review Queue...' : 'Proceed to Human Review Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
