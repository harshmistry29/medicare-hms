import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FloatingNavbar } from './FloatingNavbar';
import { Shield, HeartPulse, CheckCircle2 } from 'lucide-react';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Horizontal Floating Glassmorphic Navbar */}
      <FloatingNavbar />

      {/* Main Page Content Body */}
      <main className="flex-1 w-full max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8 py-5 page-enter">
        <Outlet />
      </main>

      {/* Minimalist Hospital Status Footer */}
      <footer className="w-full border-t border-slate-200/60 bg-white/60 backdrop-blur-md py-4 px-4 sm:px-8 text-xs text-slate-500 mt-auto no-print">
        <div className="max-w-[1520px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">MediCare Health System</span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-400">Enterprise Hospital Clinical Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              HIPAA & HL7 Compliant
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>256-Bit SSL Encrypted</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <Link to="/services" className="hover:text-blue-600 transition">Services Directory</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
