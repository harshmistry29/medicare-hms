import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  Plus,
  UserPlus,
  Calendar,
  AlertOctagon,
  Receipt,
  LogOut,
  ChevronDown,
  User,
  Shield,
  Stethoscope,
  Pill,
  FlaskConical,
  HeartPulse,
  Calculator,
  FileText,
  Sparkles,
  CheckCircle2
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

export const Header: React.FC = () => {
  const { user, logout, switchDemoAccount } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const personaRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setIsPersonaOpen(false);
      }
      if (quickActionRef.current && !quickActionRef.current.contains(e.target as Node)) {
        setIsQuickActionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePersonaSwitch = async (email: string) => {
    setIsPersonaOpen(false);
    await switchDemoAccount(email);
    navigate('/dashboard');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="h-16 px-6 bg-white border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Left: Global Search trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs text-slate-500 font-medium transition w-64 lg:w-96 group shadow-xs"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
            <span className="truncate">Search patients, doctors, invoices (Ctrl + K)...</span>
            <kbd className="hidden sm:inline-block ml-auto text-[10px] font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Actions & Account Management */}
        <div className="flex items-center gap-3">
          {/* Quick Actions Menu */}
          {['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE'].includes(user?.role || '') && (
            <div className="relative" ref={quickActionRef}>
              <button
                onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Quick Action</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {isQuickActionOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Hospital Shortcuts
                  </div>
                  <button
                    onClick={() => {
                      setIsQuickActionOpen(false);
                      navigate('/patients');
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                  >
                    <UserPlus className="w-4 h-4 text-teal-600" />
                    <span>Register New Patient</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickActionOpen(false);
                      navigate('/appointments');
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                  >
                    <Calendar className="w-4 h-4 text-sky-600" />
                    <span>Book OPD Slot</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickActionOpen(false);
                      navigate('/emergency');
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                  >
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                    <span>Emergency Intake (ER)</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickActionOpen(false);
                      navigate('/billing');
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                  >
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Generate Bill / Invoice</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Persona Switcher Dropdown (Highlighted for easy testing) */}
          <div className="relative" ref={personaRef}>
            <button
              onClick={() => setIsPersonaOpen(!isPersonaOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-medium text-slate-700 transition border border-slate-200/60"
            >
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="font-semibold text-slate-900 truncate max-w-[120px]">
                {user?.name?.split(' ')[0] || 'Persona'}
              </span>
              <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                {user?.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isPersonaOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-900">Switch Role Persona</div>
                  <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-semibold">
                    1-Click Demo
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {DEMO_PERSONAS.map(p => {
                    const isCurrent = user?.email === p.email;
                    return (
                      <button
                        key={p.email}
                        onClick={() => handlePersonaSwitch(p.email)}
                        className={`w-full text-left px-3.5 py-2 flex items-center gap-2.5 transition ${
                          isCurrent ? 'bg-teal-50/80 text-teal-900' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isCurrent ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {getInitials(p.name)}
                        </div>
                        <div className="flex-1 truncate">
                          <div className="text-xs font-semibold truncate flex items-center justify-between">
                            <span>{p.name}</span>
                            {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{p.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition relative"
              title="Hospital Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-800">Hospital Alerts</div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] text-teal-600 hover:text-teal-700 font-semibold"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto py-1 divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3 text-xs cursor-pointer transition ${n.isRead ? 'bg-white opacity-70' : 'bg-teal-50/40 font-medium'}`}
                      >
                        <div className="font-semibold text-slate-800">{n.title}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
