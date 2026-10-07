import React from 'react';
import { UserRole } from '../../types';
import { Shield, Stethoscope, User, HeartPulse, Pill, FlaskConical, Calculator, FileText } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '', showIcon = true }) => {
  const roleConfig: Record<UserRole, { label: string; bg: string; text: string; border: string; icon: React.FC<{ className?: string }> }> = {
    SUPER_ADMIN: { label: 'Super Admin', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: Shield },
    ADMIN: { label: 'Admin', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: Shield },
    DOCTOR: { label: 'Doctor', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', icon: Stethoscope },
    NURSE: { label: 'Nurse', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: HeartPulse },
    RECEPTIONIST: { label: 'Reception', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: FileText },
    PHARMACIST: { label: 'Pharmacist', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', icon: Pill },
    LAB_TECHNICIAN: { label: 'Lab Tech', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: FlaskConical },
    ACCOUNTANT: { label: 'Accountant', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: Calculator },
    PATIENT: { label: 'Patient', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', icon: User },
  };

  const config = roleConfig[role] || { label: role, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: User };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
};
