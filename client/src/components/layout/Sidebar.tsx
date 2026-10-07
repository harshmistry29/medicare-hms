import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  FileText,
  FlaskConical,
  AlertOctagon,
  BedDouble,
  Building2,
  Pill,
  Receipt,
  BarChart3,
  BrainCircuit,
  ShieldCheck,
  Settings,
  Activity,
  HeartPulse,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from './RoleBadge';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const role = user?.role || 'PATIENT';

  // Navigation Groups with Role-Based Access Control
  const navSections = [
    {
      group: 'Overview',
      items: [
        {
          label: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'PHARMACIST', 'ACCOUNTANT', 'PATIENT'],
        },
        {
          label: 'Patient Health Portal',
          path: '/my-health',
          icon: Activity,
          roles: ['PATIENT', 'RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN'],
          badge: 'Portal',
          badgeColor: 'bg-emerald-100 text-emerald-700'
        },
        {
          label: 'Hospital Services',
          path: '/services',
          icon: Building2,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'],
        },
      ]
    },
    {
      group: 'Clinical Workflow',
      items: [
        {
          label: 'Patients',
          path: '/patients',
          icon: Users,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
        },
        {
          label: 'Appointments & Queue',
          path: '/appointments',
          icon: Calendar,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT', 'NURSE'],
        },
        {
          label: 'Doctor Schedule & Roster',
          path: '/schedule',
          icon: Calendar,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE'],
          badge: 'Roster',
          badgeColor: 'bg-sky-100 text-sky-700'
        },
        {
          label: 'Doctor OPD Suite',
          path: '/consultations/room',
          icon: Stethoscope,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR'],
        },
        {
          label: 'Prescriptions',
          path: '/prescriptions',
          icon: FileText,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PHARMACIST', 'PATIENT'],
        },
        {
          label: 'Diagnostic Lab Orders',
          path: '/laboratory',
          icon: FlaskConical,
          roles: ['SUPER_ADMIN', 'ADMIN', 'LAB_TECHNICIAN', 'DOCTOR', 'PATIENT'],
        },
        {
          label: 'Lab Workbench',
          path: '/laboratory/workbench',
          icon: Sparkles,
          roles: ['SUPER_ADMIN', 'ADMIN', 'LAB_TECHNICIAN', 'DOCTOR'],
          badge: 'Analyzer',
          badgeColor: 'bg-teal-100 text-teal-700'
        },
      ]
    },
    {
      group: 'Wards & Emergency',
      items: [
        {
          label: 'Emergency Triage',
          path: '/emergency',
          icon: AlertOctagon,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
          badge: 'Live ER',
          badgeColor: 'bg-rose-100 text-rose-700'
        },
        {
          label: 'Beds & Ward Map',
          path: '/beds',
          icon: BedDouble,
          roles: ['SUPER_ADMIN', 'ADMIN', 'NURSE', 'DOCTOR', 'RECEPTIONIST'],
        },
        {
          label: 'Inpatient (IPD)',
          path: '/admissions',
          icon: Building2,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'ACCOUNTANT'],
        },
      ]
    },
    {
      group: 'Pharmacy & Finance',
      items: [
        {
          label: 'Central Pharmacy',
          path: '/pharmacy',
          icon: Pill,
          roles: ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'DOCTOR', 'NURSE'],
        },
        {
          label: 'Dispense Prescriptions',
          path: '/pharmacy/dispense',
          icon: Sparkles,
          roles: ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'NURSE'],
          badge: 'Dispense',
          badgeColor: 'bg-amber-100 text-amber-700'
        },
        {
          label: 'Billing & Invoices',
          path: '/billing',
          icon: Receipt,
          roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'RECEPTIONIST', 'PATIENT'],
        },
        {
          label: 'Analytics & Reports',
          path: '/reports',
          icon: BarChart3,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'ACCOUNTANT'],
        },
      ]
    },
    {
      group: 'Hospital Administration',
      items: [
        {
          label: 'Doctors & Specialists',
          path: '/doctors',
          icon: HeartPulse,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],
        },
        {
          label: 'Departments',
          path: '/departments',
          icon: Building2,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],
        },
        {
          label: 'AI Clinical Suite',
          path: '/ai-assistant',
          icon: BrainCircuit,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'],
          badge: 'AI',
          badgeColor: 'bg-indigo-100 text-indigo-700'
        },
        {
          label: 'Compliance Audit Logs',
          path: '/audit-logs',
          icon: ShieldCheck,
          roles: ['SUPER_ADMIN', 'ADMIN'],
        },
        {
          label: 'Hospital Settings',
          path: '/settings',
          icon: Settings,
          roles: ['SUPER_ADMIN', 'ADMIN'],
        },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-screen select-none z-20 shadow-sm">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-base leading-tight tracking-tight flex items-center gap-1.5">
              <span>MediCare</span>
              <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200/80 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
                HMS
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Hospital Information System</div>
          </div>
        </Link>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => {
          // Filter items based on current role
          const visibleItems = section.items.filter(item => item.roles.includes(role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {section.group}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            {/* Initials Avatar */}
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <div className="font-semibold text-xs text-slate-800 truncate">{user?.name || 'Logged User'}</div>
              <div className="text-[10px] text-teal-600 font-medium capitalize">{user?.role?.replace(/_/g, ' ').toLowerCase()}</div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
