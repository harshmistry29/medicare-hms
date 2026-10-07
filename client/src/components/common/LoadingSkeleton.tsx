import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  rows = 5,
  className = ''
}) => {
  return (
    <div className={`w-full bg-white rounded-xl border border-slate-200 p-6 space-y-4 animate-pulse shadow-sm ${className}`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="h-6 bg-slate-200 rounded-md w-1/4"></div>
        <div className="h-8 bg-slate-200 rounded-lg w-28"></div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <div className="h-4 bg-slate-200 rounded w-16"></div>
            <div className="h-4 bg-slate-200 rounded flex-1"></div>
            <div className="h-4 bg-slate-200 rounded w-24"></div>
            <div className="h-4 bg-slate-200 rounded w-20"></div>
            <div className="h-4 bg-slate-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
