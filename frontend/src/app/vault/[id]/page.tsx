"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  GraduationCap,
  FileText,
  Image as ImageIcon,
  Video,
  Globe,
  RotateCw,
  BookOpen
} from 'lucide-react';
import { useResources } from '@/context/ResourceContext';

export default function VaultDocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { resources, getResourceById } = useResources();

  const [resource, setResource] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // In-browser / On-demand document rendering states
  const [docHtml, setDocHtml] = useState<string | null>(null);
  const [liveText, setLiveText] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    // 1. Check in-memory context and local storage immediately
    let localItem = getResourceById ? getResourceById(id) : resources.find(r => r.id === id);
    if (!localItem && typeof window !== 'undefined') {
      try {
        const rawCachedCloud = localStorage.getItem('isml_cached_cloud_materials');
        if (rawCachedCloud) {
          const cloudItems = JSON.parse(rawCachedCloud);
          localItem = cloudItems.find((x: any) => x.id === id || x.title === id || x.originalUrl === id);
        }
        if (!localItem) {
          const rawSaved = localStorage.getItem('isml_saved_external_resources');
          if (rawSaved) {
            const items = JSON.parse(rawSaved);
            localItem = items.find((x: any) => x.id === id || x.originalUrl === id || x.title === id);
          }
        }
        if (!localItem) {
          const rawCached = sessionStorage.getItem('isml_cached_backend_resources');
          if (rawCached) {
            const items = JSON.parse(rawCached);
            localItem = items.find((x: any) => x.id === id);
          }
        }
      } catch (e) {
        console.warn('Cache lookup notice:', e);
      }
    }

    if (localItem) {
      setResource(localItem);
      setIsLoading(false);
    }

    // 2. Fetch full resource details from same-origin API
    const fetchDoc = async () => {
      if (!localItem) {
        setIsLoading(true);
      }
      setError(null);

      const endpoints = [
        `/api/resources/vault/${id}`,
        `https://isml-resource-backend-production.up.railway.app/api/v1/resources/${id}`,
        '/api/resources'
      ];

      let fetchedData: any = null;
      let lastErrMsg = '';

      for (const url of endpoints) {
        try {
          const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
          const contentType = resp.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) continue;

          if (resp.ok) {
            const json = await resp.json();
            if (url === '/api/resources') {
              const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
              const match = list.find((item: any) => item.id === id || item.slug === id || item.title === id);
              if (match) {
                fetchedData = match;
                break;
              }
            } else if (json && (json.data || json.id)) {
              fetchedData = json.data || json;
              break;
            }
          } else {
            lastErrMsg = `Server returned HTTP ${resp.status}`;
          }
        } catch (netErr: any) {
          lastErrMsg = netErr.message || 'Network error';
        }
      }

      if (isMounted) {
        if (fetchedData) {
          setResource((prev: any) => ({
            ...fetchedData,
            fileData: prev?.fileData || fetchedData.fileData,
            fileUrl: prev?.fileUrl || fetchedData.fileUrl || fetchedData.canonicalUrl,
          }));
          setError(null);
        } else if (localItem) {
          setResource(localItem);
          setError(null);
        } else {
          setError(lastErrMsg || 'Document not found in Knowledge Vault.');
        }
        setIsLoading(false);
      }
    };

    fetchDoc();
    return () => { isMounted = false; };
  }, [id, resources, getResourceById]);

  // 1. Resolve real file name from all possible metadata sources
  const descFileNameMatch = resource?.description?.match(/Uploaded file ([^\s)]+)/i);
  const descFileName = descFileNameMatch ? descFileNameMatch[1] : '';

  // Extract base64 payload if available from any property
  const base64Data =
    (resource?.fileData && resource.fileData.startsWith('data:')) ? resource.fileData :
    (resource?.originalUrl && resource.originalUrl.startsWith('data:')) ? resource.originalUrl :
    (resource?.sourceUrl && resource.sourceUrl.startsWith('data:')) ? resource.sourceUrl :
    (resource?.fileUrl && resource.fileUrl.startsWith('data:')) ? resource.fileUrl :
    (resource?.canonicalUrl && resource.canonicalUrl.startsWith('data:')) ? resource.canonicalUrl :
    null;

  const base64Mime = base64Data?.match(/^data:([^;]+);base64,/)?.[1]?.toLowerCase() || '';

  const rawFileName =
    (resource?.originalUrl && !resource.originalUrl.startsWith('data:') ? resource.originalUrl : null) ||
    descFileName ||
    (resource?.sourceUrl && !resource.sourceUrl.startsWith('data:') && resource.sourceUrl.includes('/') ? resource.sourceUrl.split('/').pop() : null) ||
    (resource?.fileUrl && !resource.fileUrl.startsWith('data:') && resource.fileUrl.includes('/') ? resource.fileUrl.split('/').pop() : null) ||
    resource?.title ||
    '';

  // Determine file extension
  let ext = (rawFileName.includes('.') ? rawFileName.split('.').pop() || '' : '').toLowerCase();
  if (!ext && base64Mime) {
    if (base64Mime.includes('wordprocessingml') || base64Mime.includes('msword')) ext = 'docx';
    else if (base64Mime.includes('pdf')) ext = 'pdf';
    else if (base64Mime.includes('image/')) ext = base64Mime.split('/')[1] || 'png';
    else if (base64Mime.includes('presentationml')) ext = 'pptx';
  }
  if (!ext && descFileName.includes('.')) {
    ext = (descFileName.split('.').pop() || '').toLowerCase();
  }

  const isDocx = ['docx', 'doc'].includes(ext) || base64Mime.includes('wordprocessingml') || Boolean(descFileName.match(/\.docx?$/i));

  const cleanDisplayFileName =
    rawFileName && rawFileName.includes('.')
      ? rawFileName
      : descFileName || `${resource?.title || 'Material Document'}.${ext || 'docx'}`;

  const fileName = cleanDisplayFileName;

  // Automatic high-fidelity text & HTML extraction for documents
  useEffect(() => {
    if (!resource) return;

    if (resource.docHtml && !docHtml) {
      setDocHtml(resource.docHtml);
    }

    const currentText = liveText || resource.content?.body || (resource as any).extractedText || '';
    const isPlaceholder = !currentText || currentText.trim().startsWith('Uploaded file ') || currentText.trim().length < 80;

    const payloadBase64 = base64Data || resource.fileData || (resource.originalUrl?.startsWith('data:') ? resource.originalUrl : null) || (resource.sourceUrl?.startsWith('data:') ? resource.sourceUrl : null);
    const payloadFileUrl = resource.fileUrl && !resource.fileUrl.startsWith('data:') ? resource.fileUrl : null;

    if (isDocx || isPlaceholder || ext === 'docx' || ext === 'doc') {
      if (payloadBase64 || payloadFileUrl || resource.id) {
        setIsExtracting(true);
        fetch('/api/resources/extract-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: resource.id,
            base64: payloadBase64,
            fileUrl: payloadFileUrl,
            fileName: cleanDisplayFileName,
          }),
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.success) {
              if (data.html) setDocHtml(data.html);
              if (data.text) setLiveText(data.text);
            }
          })
          .catch(err => console.warn('Document render extraction notice:', err))
          .finally(() => setIsExtracting(false));
      }
    }
  }, [resource, isDocx, cleanDisplayFileName, base64Data, ext]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 font-sans">
        <RotateCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading document from Knowledge Vault...</p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center font-sans space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
          <BookOpen className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-900">Document Unavailable</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {error ? error : 'This study material could not be loaded.'}
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/vault"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2447] text-white text-xs font-bold hover:bg-black transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Knowledge Vault</span>
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
          >
            <RotateCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const lang = resource.academicContext?.language || resource.language?.name || 'General';
  const level = resource.academicContext?.level || resource.cefrLevel || 'A1';

  // Identify file types
  const isImage =
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico'].includes(ext) ||
    Boolean(resource.fileType?.startsWith('image/')) ||
    Boolean(resource.fileData?.startsWith('data:image/')) ||
    Boolean(resource.fileUrl && /\.(png|jpe?g|webp|gif|svg)$/i.test(resource.fileUrl));

  const isPdf =
    ext === 'pdf' ||
    resource.resourceType === 'PDF' ||
    Boolean(resource.fileType?.includes('pdf')) ||
    Boolean(resource.fileUrl && /\.pdf$/i.test(resource.fileUrl)) ||
    Boolean(resource.fileData && resource.fileData.includes('application/pdf'));

  const isYouTube =
    resource.resourceType === 'YOUTUBE_VIDEO' ||
    (resource.originalUrl && (resource.originalUrl.includes('youtube.com') || resource.originalUrl.includes('youtu.be'))) ||
    (resource.sourceUrl && (resource.sourceUrl.includes('youtube.com') || resource.sourceUrl.includes('youtu.be')));

  const isWeb =
    !isYouTube &&
    (resource.resourceType === 'WEBSITE' ||
      (resource.originalUrl && /^https?:\/\//i.test(resource.originalUrl) && !resource.fileUrl) ||
      (resource.sourceUrl && /^https?:\/\//i.test(resource.sourceUrl) && !resource.fileUrl));

  const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext);
  const isVideo = ['mp4', 'webm', 'mov', 'mkv'].includes(ext);
  const isPptx = ['pptx', 'ppt'].includes(ext);

  // Direct file URL for viewing and downloading
  const directUrl =
    base64Data ||
    resource.fileData ||
    resource.fileUrl ||
    resource.canonicalUrl ||
    (resource.originalUrl && !resource.originalUrl.includes('://') && !resource.originalUrl.startsWith('data:') ? `/uploads/${resource.originalUrl}` : null) ||
    resource.sourceUrl ||
    resource.originalUrl;

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };
  const youtubeId = isYouTube ? getYouTubeId(resource.originalUrl || resource.sourceUrl || '') : '';

  // Text content for document viewing
  const extractedText =
    liveText ||
    resource.content?.body ||
    (resource as any).extractedText ||
    resource.description ||
    '';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 font-sans space-y-6 pb-24">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <Link
          href="/vault"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Knowledge Vault</span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {directUrl && (
            <a
              href={directUrl}
              download={cleanDisplayFileName || 'material'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </a>
          )}

          {directUrl && !directUrl.startsWith('data:') && (
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Open in New Tab</span>
            </a>
          )}

          <Link
            href={`/faculty/studio?language=${encodeURIComponent(lang)}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Plan Lesson with this Resource</span>
          </Link>
        </div>
      </div>

      {/* Document Information Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-[#0B2447] text-white text-[11px] font-black uppercase tracking-wider">
              {lang}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-black border border-blue-200">
              {level}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 uppercase">
              {isImage ? 'Image Asset' : isPdf ? 'PDF Document' : isDocx ? 'Word Document' : isPptx ? 'Slides Presentation' : isYouTube ? 'YouTube Video' : isWeb ? 'Web Reference' : 'Document File'}
            </span>
          </div>

          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
            {resource.title}
          </h1>
        </div>

        {cleanDisplayFileName && (
          <span className="text-[11px] font-mono text-slate-500 truncate max-w-[280px]">
            {cleanDisplayFileName}
          </span>
        )}
      </div>

      {/* -------------------- DIRECT MATERIAL VIEWER -------------------- */}
      <div className="space-y-4">
        {/* CASE 1: IMAGE (PNG / JPG / WEBP / SVG / GIF) */}
        {isImage && directUrl && (
          <div className="bg-slate-900/5 rounded-3xl border border-slate-200 p-4 sm:p-8 flex flex-col items-center justify-center min-h-[450px] shadow-xs">
            <img
              src={directUrl}
              alt={resource.title}
              className="max-w-full max-h-[82vh] rounded-2xl shadow-sm object-contain mx-auto"
            />
          </div>
        )}

        {/* CASE 2: PDF DOCUMENT */}
        {isPdf && directUrl && (
          <div className="w-full bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <iframe
              src={directUrl}
              title={resource.title}
              className="w-full h-[85vh] rounded-3xl border-0"
            />
          </div>
        )}

        {/* CASE 3: YOUTUBE VIDEO */}
        {isYouTube && youtubeId && (
          <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
              title={resource.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* CASE 4: AUDIO / VIDEO FILE */}
        {isVideo && directUrl && (
          <div className="w-full rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-black flex items-center justify-center">
            <video controls src={directUrl} className="w-full max-h-[75vh]" />
          </div>
        )}

        {isAudio && directUrl && (
          <div className="p-10 rounded-3xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col items-center justify-center gap-4">
            <Video className="w-10 h-10 text-slate-400" />
            <audio controls src={directUrl} className="w-full max-w-md" />
          </div>
        )}

        {/* CASE 5: WEB SITE / ONLINE LINK */}
        {isWeb && directUrl && (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4 shadow-xs">
            <Globe className="w-12 h-12 text-blue-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">{resource.title}</h3>
              <p className="text-xs text-slate-500 font-mono break-all max-w-xl mx-auto">{directUrl}</p>
            </div>
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>Open Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* CASE 6: WORD DOCUMENT (DOCX) / POWERPOINT (PPTX) / TEXT / DOCUMENT CONTENT */}
        {(!isImage && !isPdf && !isYouTube && !isVideo && !isAudio && !isWeb) && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6 max-h-[85vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{isDocx ? 'Word Document (.docx) Preview' : isPptx ? 'Presentation Slides (.pptx) Preview' : 'Document Content'}</span>
                {isExtracting && (
                  <span className="flex items-center gap-1 text-[11px] text-blue-600 font-bold ml-2">
                    <RotateCw className="w-3 h-3 animate-spin" />
                    <span>Extracting formatted text...</span>
                  </span>
                )}
              </div>

              {directUrl && (
                <a
                  href={directUrl}
                  download={cleanDisplayFileName || 'document'}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Original Document</span>
                </a>
              )}
            </div>

            {/* Document Render: High-Fidelity Formatted HTML View or Raw Text */}
            {docHtml ? (
              <div
                className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans text-sm sm:text-base [&_table]:border-collapse [&_table]:w-full [&_table]:my-4 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2.5 [&_th]:border [&_th]:border-slate-300 [&_th]:p-2.5 [&_th]:bg-slate-100 [&_h1]:text-xl [&_h1]:font-black [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-bold [&_p]:my-2.5 [&_strong]:text-slate-900"
                dangerouslySetInnerHTML={{ __html: docHtml }}
              />
            ) : (
              <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap select-text text-sm sm:text-base">
                {extractedText && !extractedText.trim().startsWith('Uploaded file ') ? (
                  extractedText
                ) : (
                  <div className="py-12 text-center text-slate-500 space-y-3">
                    <RotateCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                    <p className="font-bold text-slate-700 text-sm">Rendering document preview...</p>
                    <p className="text-xs text-slate-400">Extracting high-fidelity content from {cleanDisplayFileName}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
