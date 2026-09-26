"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useResources } from '@/context/ResourceContext';
import ExtractedContentModal from '@/components/resource/ExtractedContentModal';
import { ErrorState } from '@/components/common/States';

export default function ResourceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { getResourceById } = useResources();

  let resource = getResourceById(resolvedParams.id);
  if (!resource && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('isml_saved_external_resources');
      if (raw) {
        const items = JSON.parse(raw);
        resource = items.find((i: any) => i.id === resolvedParams.id);
      }
    } catch (e) {}
  }

  if (!resource) {
    return (
      <ErrorState
        title="Resource Not Found"
        description={`No resource exists with ID "${resolvedParams.id}". It may have been deleted or archived.`}
        onRetry={() => router.push('/resources')}
      />
    );
  }

  const extractedPayload = {
    overview: resource.content?.overview || `Masterclass Study Module: ${resource.academicContext?.topic || resource.title}`,
    body: resource.content?.body || resource.description,
    dialogueScript: resource.content?.dialogueScript || [],
    vocabularyList: resource.content?.vocabularyList || [],
    grammarNotes: Array.isArray(resource.content?.grammarNotes) 
      ? resource.content?.grammarNotes.join('\n') 
      : (resource.content?.grammarNotes || '')
  };

  const questionsPayload: any[] = (resource.content?.questions || []).map((q: any) => ({
    id: q.id || 'q1',
    question: q.question,
    options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
    answer: q.answer || 'Option A',
    explanation: q.explanation || ''
  }));

  return (
    <ExtractedContentModal
      isOpen={true}
      onClose={() => router.push('/resources')}
      title={resource.title}
      sourceName={resource.sourceName || 'ISML AI Studio'}
      sourceUrl={resource.sourceUrl || resource.originalUrl || ''}
      language={resource.academicContext?.language || 'German'}
      level={resource.academicContext?.level || 'A1'}
      skill={resource.academicContext?.skill || 'Speaking'}
      topic={resource.academicContext?.topic || resource.title}
      extractedContent={extractedPayload}
      questions={questionsPayload}
      isSaved={true}
    />
  );
}
