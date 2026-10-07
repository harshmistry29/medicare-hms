import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
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
  ChevronDown,
  Sparkles,
  Search,
  Bell,
  Plus,
  UserPlus,
  Menu,
  X,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { GlobalSearchModal } from './GlobalSearchModal';

const DEMO_PERSONAS = [
  { name: 'Dr. Arvind Rao', role: 'ADMIN', email: 'admin@medicare.local', desc: 'Hospital Super Admin' },
  { name: 'Dr. Rajesh Patel', role: 'DOCTOR', email: 'dr.patel@medicare.local', desc: 'Consultant Cardiologist' },
  { name: 'Dr. Ananya Shah', role: 'DOCTOR', email: 'dr.shah@medicare.local', desc: 'Consultant Neurologist' },
  { name: 'Sister Mary D\'Souza', role: 'NURSE', email: 'nurse.mary@medicare.local', desc: 'Inpatient & Vitals Care' },
  { name: 'Priya Nair', role: 'RECEPTIONIST', email: 'reception@medicare.local', desc: 'Front Desk & Intake' },
  { name: 'Amit Deshmukh', role: 'PHARMACIST', email: 'pharmacy@medicare.local', desc: 'Central Pharmacy' },
  { name: 'Suresh Kumar', role: 'LAB_TECHNICIAN', email: 'lab@medicare.local', desc: 'Pathology Diagnostics' },
  { name: 'Neha Joshi', role: 'ACCOUNTANT', email: 'billing@medicare.local', desc: 'Accounts & Invoicing' },
  { name: 'Rahul Patel', role: 'PATIENT', email: 'patient.rahul@medicare.local', desc: 'Patient Portal' },
];

interface NavSubItem {
  label: string;
  desc: string;
  path: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: NavSubItem[];
}

export const FloatingNavbar: React.FC = () => {
  const { user, logout, switchDemoAccount } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || 'PATIENT';

  // State for popups
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navContainerRef = useRef<HTMLDivElement>(null);

  // Grouped Navigation Structure: Clean 4 Pillars
  const navSections: NavSection[] = [
    {
      id: 'clinical',
      title: 'Clinical Care',
      icon: Stethoscope,
      items: [
        {
          label: 'Patients Directory',
          desc: 'Comprehensive patient medical records & charts',
          path: '/patients',
          icon: Users,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
        },
        {
          label: 'Appointments & Queue',
          desc: 'OPD scheduling, token desk & doctor check-in',
          path: '/appointments',
          icon: Calendar,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT', 'NURSE'],
        },
        {
          label: 'Doctor OPD Suite',
          desc: 'Live consultation workstation & diagnosis',
          path: '/consultations/room',
          icon: Stethoscope,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR'],
          badge: 'Doctor',
          badgeColor: 'bg-blue-100 text-blue-700'
        },
        {
          label: 'Prescriptions',
          desc: 'Digital Rx orders, dosage & medicine plans',
          path: '/prescriptions',
          icon: FileText,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PHARMACIST', 'PATIENT'],
        },
        {
          label: 'Doctor Schedule & Roster',
          desc: 'Specialist shifts, on-call slots & duty roster',
          path: '/schedule',
          icon: Calendar,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE'],
        },
      ],
    },
    {
      id: 'inpatient',
      title: 'Wards & ER',
      icon: AlertOctagon,
      items: [
        {
          label: 'Emergency Triage',
          desc: 'Priority trauma intake & Red/Yellow/Green queue',
          path: '/emergency',
          icon: AlertOctagon,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
          badge: 'Live ER',
          badgeColor: 'bg-rose-100 text-rose-700'
        },
        {
          label: 'Beds & Ward Map',
          desc: 'ICU, General & Deluxe ward visual bed occupancy',
          path: '/beds',
          icon: BedDouble,
          roles: ['SUPER_ADMIN', 'ADMIN', 'NURSE', 'DOCTOR', 'RECEPTIONIST'],
        },
        {
          label: 'Inpatient (IPD) Admissions',
          desc: 'Patient admission, daily vitals & discharge planning',
          path: '/admissions',
          icon: Building2,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'ACCOUNTANT'],
        },
      ],
    },
    {
      id: 'diagnostics',
      title: 'Labs & Pharmacy',
      icon: FlaskConical,
      items: [
        {
          label: 'Diagnostic Lab Orders',
          desc: 'Biochemistry, hematology test requisitions & status',
          path: '/laboratory',
          icon: FlaskConical,
          roles: ['SUPER_ADMIN', 'ADMIN', 'LAB_TECHNICIAN', 'DOCTOR', 'PATIENT'],
        },
        {
          label: 'Lab Workbench',
          desc: 'Diagnostic analyzer workstation & auto-reports',
          path: '/laboratory/workbench',
          icon: Sparkles,
          roles: ['SUPER_ADMIN', 'ADMIN', 'LAB_TECHNICIAN', 'DOCTOR'],
          badge: 'Analyzer',
          badgeColor: 'bg-teal-100 text-teal-700'
        },
        {
          label: 'Central Pharmacy',
          desc: 'Inventory catalog, batches, expiry & stock tracking',
          path: '/pharmacy',
          icon: Pill,
          roles: ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'DOCTOR', 'NURSE'],
        },
        {
          label: 'Dispense Counter',
          desc: 'Fast checkout & medicine dispenser for active Rx',
          path: '/pharmacy/dispense',
          icon: Sparkles,
          roles: ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'NURSE'],
          badge: 'Counter',
          badgeColor: 'bg-amber-100 text-amber-700'
        },
      ],
    },
    {
      id: 'operations',
      title: 'Hospital Ops',
      icon: Building2,
      items: [
        {
          label: 'Billing & Invoices',
          desc: 'Itemized hospital bills, insurance & payment receipts',
          path: '/billing',
          icon: Receipt,
          roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'RECEPTIONIST', 'PATIENT'],
        },
        {
          label: 'Analytics & Reports',
          desc: 'Executive KPIs, revenue metrics & occupancy charts',
          path: '/reports',
          icon: BarChart3,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'ACCOUNTANT'],
        },
        {
          label: 'Doctors & Faculty',
          desc: 'Consultants, qualifications, specialties & fees',
          path: '/doctors',
          icon: HeartPulse,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],
        },
        {
          label: 'Departments',
          desc: 'Cardiology, Ortho, Neurology, Pediatrics units',
          path: '/departments',
          icon: Building2,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],
        },
        {
          label: 'AI Clinical Suite',
          desc: 'Clinical decision support & medical intelligence',
          path: '/ai-assistant',
          icon: BrainCircuit,
          roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE'],
          badge: 'AI',
          badgeColor: 'bg-indigo-100 text-indigo-700'
        },
        {
          label: 'Compliance Audit Logs',
          desc: 'HIPAA system events & audit trail verification',
          path: '/audit-logs',
          icon: ShieldCheck,
          roles: ['SUPER_ADMIN', 'ADMIN'],
        },
        {
          label: 'Hospital Settings',
          desc: 'Hospital profile, fee defaults & system settings',
          path: '/settings',
          icon: Settings,
          roles: ['SUPER_ADMIN', 'ADMIN'],
        },
      ],
    },
  ];

  // Filter sections by user's role
  const visibleSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(role)),
    }))
    .filter(section => section.items.length > 0);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setIsNotifOpen(false);
        setIsPersonaOpen(false);
        setIsQuickActionOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setIsNotifOpen(false);
        setIsPersonaOpen(false);
        setIsQuickActionOpen(false);
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  const handlePersonaSwitch = async (email: string) => {
    setIsPersonaOpen(false);
    await switchDemoAccount(email);
    navigate('/dashboard');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const isSectionActive = (section: NavSection) => {
    return section.items.some(item => location.pathname.startsWith(item.path));
  };

  return (
    <>
      {/* Floating Navbar Container */}
      <div ref={navContainerRef} className="sticky top-2.5 z-40 px-3 sm:px-6 w-full max-w-[1520px] mx-auto">
        <nav className="floating-glass rounded-2xl shadow-floating px-3.5 sm:px-5 py-2.5 flex items-center justify-between transition-all">
          
          {/* Left Brand & Logo */}
          <div className="flex items-center gap-3 lg:gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5 group select-none">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-sm tracking-tight">MediCare</span>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.2 rounded-md uppercase">
                    HMS
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-beacon" />
                  <span>Live Health Network</span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {/* Direct Dashboard Link */}
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </NavLink>

              {/* Main Pillars Dropdowns */}
              {visibleSections.map(section => {
                const isActive = isSectionActive(section);
                const isOpen = openDropdown === section.id;
                const Icon = section.icon;

                return (
                  <div key={section.id} className="relative">
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : section.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                          : isOpen
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 opacity-80" />
                      <span>{section.title}</span>
                      <ChevronDown
                        className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-blue-600' : ''
                        }`}
                      />
                    </button>

                    {/* Section Dropdown Mega/Flyout Menu */}
                    {isOpen && (
                      <div className="absolute left-0 mt-2.5 w-80 glass-dropdown rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 border border-slate-200/90">
                        <div className="px-3 py-2 mb-1 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {section.title}
                          </span>
                          <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                            {section.items.length} Modules
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          {section.items.map(item => {
                            const ItemIcon = item.icon;
                            const isCurrent = location.pathname === item.path;

                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setOpenDropdown(null)}
                                className={`flex items-start gap-3 p-2.5 rounded-xl transition text-left group ${
                                  isCurrent
                                    ? 'bg-blue-50 text-blue-900'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
                                    isCurrent
                                      ? 'bg-blue-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                                  }`}
                                >
                                  <ItemIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <div
                                      className={`text-xs font-semibold truncate ${
                                        isCurrent ? 'text-blue-700 font-bold' : 'text-slate-800'
                                      }`}
                                    >
                                      {item.label}
                                    </div>
                                    {item.badge && (
                                      <span
                                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase flex-shrink-0 ${item.badgeColor}`}
                                      >
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-normal">
                                    {item.desc}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Direct Patient Health Portal Link if applicable */}
              {['PATIENT', 'RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN'].includes(role) && (
                <NavLink
                  to="/my-health"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`
                  }
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Patient Portal</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">
                    EHR
                  </span>
                </NavLink>
              )}
            </div>
          </div>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search Trigger Pill */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/80 rounded-xl text-xs text-slate-500 font-medium transition shadow-xs group"
              title="Global Search (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
              <span className="hidden xl:inline text-[11px]">Search (Ctrl+K)</span>
              <kbd className="hidden sm:inline-block text-[9px] font-mono text-slate-400 bg-white px-1 py-0.2 rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>

            {/* Quick Action "+ New" Button */}
            {['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE'].includes(role) && (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsQuickActionOpen(!isQuickActionOpen);
                    setOpenDropdown(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/25 transition"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">New</span>
                  <ChevronDown className="w-3 h-3 opacity-80" />
                </button>

                {isQuickActionOpen && (
                  <div className="absolute right-0 mt-2.5 w-60 glass-dropdown rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 border border-slate-200/90">
                    <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Quick Intake & Care
                    </div>
                    <button
                      onClick={() => {
                        setIsQuickActionOpen(false);
                        navigate('/patients');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition"
                    >
                      <UserPlus className="w-4 h-4 text-blue-600" />
                      <span>Register New Patient</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsQuickActionOpen(false);
                        navigate('/appointments');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition"
                    >
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span>Book OPD Appointment</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsQuickActionOpen(false);
                        navigate('/emergency');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2.5 transition"
                    >
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      <span>Emergency ER Intake</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsQuickActionOpen(false);
                        navigate('/prescriptions');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2.5 transition"
                    >
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span>Write E-Prescription</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsQuickActionOpen(false);
                        navigate('/billing');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition"
                    >
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      <span>Generate Bill & Receipt</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Role Persona Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsPersonaOpen(!isPersonaOpen);
                  setOpenDropdown(null);
                }}
                className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-medium text-slate-700 transition border border-slate-200/70"
                title="Switch Demo Role Persona"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="font-bold text-slate-800 truncate max-w-[100px] text-[11px]">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60 uppercase">
                  {user?.role?.slice(0, 5)}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isPersonaOpen && (
                <div className="absolute right-0 mt-2.5 w-76 glass-dropdown rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 border border-slate-200/90">
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Switch Demo Persona</div>
                      <div className="text-[10px] text-slate-400">Instantly test roles & permissions</div>
                    </div>
                    <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.5 rounded font-bold uppercase">
                      1-Click
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1 divide-y divide-slate-50">
                    {DEMO_PERSONAS.map(p => {
                      const isCurrent = user?.email === p.email;
                      return (
                        <button
                          key={p.email}
                          onClick={() => handlePersonaSwitch(p.email)}
                          className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition ${
                            isCurrent ? 'bg-blue-50/90 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                              isCurrent ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {getInitials(p.name)}
                          </div>
                          <div className="flex-1 truncate">
                            <div className="text-xs font-semibold truncate flex items-center justify-between">
                              <span>{p.name}</span>
                              <span className="text-[9px] font-mono text-blue-600">{p.role}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{p.desc}</div>
                          </div>
                          {isCurrent && <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Center */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setOpenDropdown(null);
                }}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 rounded-xl transition relative"
                title="Notifications & Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2.5 w-80 glass-dropdown rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 border border-slate-200/90">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="font-bold text-xs text-slate-900">Hospital Alerts</div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No active alerts</div>
                    ) : (
                      notifications.slice(0, 6).map((notif: any) => (
                        <div
                          key={notif._id}
                          onClick={() => markAsRead(notif._id)}
                          className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 ${
                            !notif.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="font-semibold text-slate-800">{notif.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{notif.message}</div>
                          <div className="text-[9px] text-slate-400 mt-1">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Quick Logout */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setOpenDropdown(null);
                }}
                className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 transition"
                title="Account Menu"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {getInitials(user?.name)}
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2.5 w-56 glass-dropdown rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 border border-slate-200/90">
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <div className="font-bold text-xs text-slate-900 truncate">{user?.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                    <div className="mt-1 text-[9px] font-bold text-blue-700 bg-blue-50 inline-block px-1.5 py-0.2 rounded border border-blue-200/60 uppercase">
                      {user?.role}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>System Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer / Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-2 glass-dropdown rounded-2xl p-3 border border-slate-200/90 shadow-elevated animate-in fade-in slide-in-from-top-2 max-h-[80vh] overflow-y-auto">
            {/* Quick Links */}
            <div className="pb-2 mb-2 border-b border-slate-100 flex items-center gap-2">
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Dashboard
              </Link>
              <Link
                to="/my-health"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold"
              >
                Patient Portal
              </Link>
            </div>

            {/* Categorized Sections */}
            <div className="space-y-4">
              {visibleSections.map(section => {
                const Icon = section.icon;
                return (
                  <div key={section.id}>
                    <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <Icon className="w-3.5 h-3.5 text-blue-600" />
                      <span>{section.title}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1 mt-1">
                      {section.items.map(item => {
                        const ItemIcon = item.icon;
                        const isCurrent = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs transition ${
                              isCurrent ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <ItemIcon className="w-4 h-4 text-slate-500" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${item.badgeColor}`}>
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Footer & Logout */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-600 font-medium">
                Signed in as <strong className="text-slate-900">{user?.name}</strong>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global Search Modal Trigger */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default FloatingNavbar;
