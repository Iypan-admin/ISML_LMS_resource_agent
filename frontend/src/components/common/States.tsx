import React from 'react';
import { SearchX, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No resources found',
  description = 'No language learning resources match your current search terms or filters.',
  actionLabel = 'Clear Filters',
  onAction
}: EmptyStateProps) {
  return (
    <div className="isml-card p-8 text-center flex flex-col items-center justify-center space-y-3 my-4 font-sans">
      <div className="p-3.5 rounded-full bg-slate-100 text-slate-500">
        <SearchX className="w-8 h-8" />
      </div>
      <h3 className="text-base font-extrabold text-[#0B2447]">{title}</h3>
      <p className="text-xs text-slate-500 max-w-md font-medium">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading AI Resource Platform data...' }: LoadingStateProps) {
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 font-sans">
      <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin" />
      <p className="text-xs font-bold text-slate-600">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Unable to Load Resources',
  description = 'A temporary error occurred while retrieving platform data.',
  onRetry
}: ErrorStateProps) {
  return (
    <div className="isml-card p-6 border-rose-200 bg-rose-50/50 text-center flex flex-col items-center justify-center space-y-3 font-sans">
      <div className="p-3 rounded-full bg-rose-100 text-rose-600">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-extrabold text-rose-900">{title}</h3>
      <p className="text-xs text-rose-700 max-w-md">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      )}
    </div>
  );
}
