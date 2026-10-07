import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    error: 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-sky-50 text-sky-700 border-sky-200/80',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    neutral: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const dotColors = {
    default: 'bg-slate-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    info: 'bg-sky-500',
    purple: 'bg-indigo-500',
    neutral: 'bg-gray-400',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 font-medium rounded-full',
    md: 'text-xs px-3 py-1 font-medium rounded-full',
    lg: 'text-sm px-3.5 py-1.5 font-medium rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'COMPLETED':
    case 'CONFIRMED':
    case 'AVAILABLE':
    case 'PAID':
    case 'DISPENSED':
    case 'ACTIVE':
    case 'NORMAL':
    case 'DISCHARGED':
      return <Badge variant="success" dot className={className}>{status.replace(/_/g, ' ')}</Badge>;

    case 'SCHEDULED':
    case 'CHECKED_IN':
    case 'IN_PROGRESS':
    case 'PROCESSING':
    case 'SAMPLE_COLLECTED':
    case 'TRIAGED':
    case 'ATTENDED':
    case 'ADMITTED':
      return <Badge variant="info" dot className={className}>{status.replace(/_/g, ' ')}</Badge>;

    case 'PENDING':
    case 'PARTIALLY_PAID':
    case 'PARTIALLY_DISPENSED':
    case 'RESERVED':
    case 'URGENT':
    case 'HIGH':
    case 'LOW':
    case 'UNDER_OBSERVATION':
      return <Badge variant="warning" dot className={className}>{status.replace(/_/g, ' ')}</Badge>;

    case 'CANCELLED':
    case 'NO_SHOW':
    case 'OCCUPIED':
    case 'MAINTENANCE':
    case 'CRITICAL':
    case 'STAT':
    case 'ABNORMAL':
    case 'INACTIVE':
      return <Badge variant="error" dot className={className}>{status.replace(/_/g, ' ')}</Badge>;

    default:
      return <Badge variant="neutral" className={className}>{status.replace(/_/g, ' ')}</Badge>;
  }
};

export default Badge;
