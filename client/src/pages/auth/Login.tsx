import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HeartPulse,
  Shield,
  Stethoscope,
  User,
  FileText,
  Pill,
  FlaskConical,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Building2,
  Calendar,
  AlertOctagon,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DemoAccount {
  name: string;
  role: string;
  department: string;
  email: string;
  category: 'clinical' | 'ops' | 'diagnostics' | 'patient';
  desc: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Dr. Arvind Rao',
    role: 'ADMIN',
    department: 'Hospital Administration',
    email: 'admin@medicare.local',
    category: 'ops',
    desc: 'Full system oversight, billing, staff, bed management & audit trails'
  },
  {
    name: 'Dr. Rajesh Patel',
    role: 'DOCTOR',
    department: 'Cardiology OPD',
    email: 'dr.patel@medicare.local',
    category: 'clinical',
    desc: 'OPD consultations, clinical diagnosis, vitals review & e-prescriptions'
  },
  {
    name: 'Dr. Ananya Shah',
    role: 'DOCTOR',
    department: 'Neurology Department',
    email: 'dr.shah@medicare.local',
    category: 'clinical',
    desc: 'Consultant neurologist with specialty patient appointments & lab orders'
  },
  {
    name: 'Sister Mary D\'Souza',
    role: 'NURSE',
    department: 'Wards & Inpatient (IPD)',
    email: 'nurse.mary@medicare.local',
    category: 'clinical',
    desc: 'Bed occupancy, daily vitals recording & medication administration'
  },
  {
    name: 'Priya Nair',
    role: 'RECEPTIONIST',
    department: 'Front Desk & Intake',
    email: 'reception@medicare.local',
    category: 'ops',
    desc: 'Patient check-in, OPD token allocation & appointment booking'
  },
  {
    name: 'Amit Deshmukh',
    role: 'PHARMACIST',
    department: 'Central Pharmacy',
    email: 'pharmacy@medicare.local',
    category: 'diagnostics',
    desc: 'Prescription dispensing counter, medicine inventory & stock alerts'
  },
  {
    name: 'Suresh Kumar',
    role: 'LAB_TECHNICIAN',
    department: 'Pathology Diagnostics',
    email: 'lab@medicare.local',
    category: 'diagnostics',
    desc: 'Hematology analyzer workbench, test reports & pathology validation'
  },
  {
    name: 'Neha Joshi',
    role: 'ACCOUNTANT',
    department: 'Finance & Invoicing',
    email: 'billing@medicare.local',
    category: 'ops',
    desc: 'Hospital invoices, insurance claims & patient payment processing'
  },
  {
    name: 'Rahul Patel',
    role: 'PATIENT',
    department: 'Patient Health Portal',
    email: 'patient.rahul@medicare.local',
    category: 'patient',
    desc: 'Personal medical records, lab reports, doctor prescriptions & bills'
  },
];

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@medicare.local');
  const [password, setPassword] = useState('Medicare@123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'clinical' | 'ops' | 'diagnostics' | 'patient'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);
    if (success) {
      navigate('/dashboard');
    } else {
      setErrorMsg('Invalid email or password. Please verify credentials or use a 1-click persona.');
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setErrorMsg('');
    setEmail(demoEmail);
    setPassword('Medicare@123');
    setIsSubmitting(true);
    const success = await login(demoEmail, 'Medicare@123');
    setIsSubmitting(false);
    if (success) {
      navigate('/dashboard');
    } else {
      setErrorMsg('Failed to authenticate demo account. Please try again.');
    }
  };

  const filteredAccounts = selectedCategory === 'all'
    ? DEMO_ACCOUNTS
    : DEMO_ACCOUNTS.filter(acc => acc.category === selectedCategory);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight">MediCare</span>
              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.2 rounded uppercase">
                HMS
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Hospital Information & Clinical System</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/services"
            className="hidden sm:inline-flex text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            Hospital Services
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>
        </div>
      </header>

      {/* Main Login Interface Grid */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Panel: 1-Click Role Fast-Track Selector (Solves the clutter!) */}
          <div className="lg:col-span-7 bg-slate-800/70 backdrop-blur-xl border border-slate-700/70 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-base font-bold text-white tracking-tight">1-Click Demo Personas</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select any role to test full workflows, permissions, and dashboards instantly:
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 self-start sm:self-center text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  No Password Needed
                </span>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 mb-5 p-1 bg-slate-900/60 rounded-xl border border-slate-700/60">
                {[
                  { id: 'all', label: 'All Roles (9)' },
                  { id: 'clinical', label: 'Doctors & Care' },
                  { id: 'ops', label: 'Admins & Reception' },
                  { id: 'diagnostics', label: 'Lab & Pharmacy' },
                  { id: 'patient', label: 'Patient Portal' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedCategory === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Persona Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredAccounts.map(acc => {
                  const isSelected = email === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleQuickLogin(acc.email)}
                      disabled={isSubmitting}
                      className={`text-left p-3.5 rounded-2xl border transition group flex items-start gap-3 ${
                        isSelected
                          ? 'bg-blue-900/40 border-blue-500 shadow-md ring-1 ring-blue-500'
                          : 'bg-slate-850/70 border-slate-700/60 hover:bg-slate-750 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400 flex-shrink-0 group-hover:scale-105 transition">
                        {getInitials(acc.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-xs font-bold text-white truncate group-hover:text-blue-300 transition">
                            {acc.name}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-950/80 border border-blue-800/80 px-1.5 py-0.2 rounded uppercase">
                            {acc.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-medium truncate">{acc.department}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{acc.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Role-Based Access Control (RBAC) Enforced
              </span>
              <span className="text-slate-300 font-mono">Demo Password: Medicare@123</span>
            </div>
          </div>

          {/* Right Panel: Clean Professional Login Form */}
          <div className="lg:col-span-5 bg-white text-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl border border-slate-100">
            <div>
              <div className="mb-6">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full">
                  Staff & Patient Gateway
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">Sign in to MediCare</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your assigned credentials to access clinical tools.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@medicare.local"
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-medium text-slate-800 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('admin@medicare.local');
                        setPassword('Medicare@123');
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-bold"
                    >
                      Fill Admin Demo
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-medium text-slate-800 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span>Remember terminal</span>
                  </label>
                  <span className="text-[11px] text-slate-400">HIPAA Protected</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md shadow-blue-500/25 transition duration-150 disabled:opacity-50 text-xs mt-2 flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>New patient to the hospital?</span>
              <Link
                to="/register"
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Register Patient EHR →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span>MediCare HMS v2.5</span>
          <span>•</span>
          <span>Integrated Healthcare Information System</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-slate-300 transition">Landing Page</Link>
          <Link to="/services" className="hover:text-slate-300 transition">Hospital Services</Link>
          <span className="text-slate-400">24/7 Support: 1800-MEDICARE</span>
        </div>
      </footer>
    </div>
  );
};

export default Login;
