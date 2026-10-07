import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
  className = '',
}) => {
  const btnLabel = actionLabel || actionText;
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 ${className}`}>
      <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl mb-4 border border-sky-100">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {btnLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          {btnLabel}
        </button>
      )}
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="w-full bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4 animate-pulse">
      <div className="h-6 bg-slate-200 rounded-lg w-1/4 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-slate-200 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-200 rounded w-5/6" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
          <div className="h-8 bg-slate-100 rounded-lg w-20" />
        </div>
      ))}
    </div>
  );
};

export default EmptyState;
