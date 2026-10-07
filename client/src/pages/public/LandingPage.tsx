import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  Stethoscope,
  Heart,
  Brain,
  Bone,
  Baby,
  FlaskConical,
  Pill,
  ShieldCheck,
  Calendar,
  Clock,
  PhoneCall,
  MapPin,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Building2,
  AlertOctagon,
  FileText,
  ChevronRight,
  Shield,
  Star,
  Award,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppointmentBookingModal } from '../../components/forms/AppointmentBookingModal';

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated, switchDemoAccount } = useAuth();
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const specialties = [
    {
      name: 'Cardiology & Cardiac Care',
      desc: 'Comprehensive coronary care, 2D echocardiography, cath lab, and cardiac rehabilitation.',
      icon: Heart,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      doctors: 'Dr. Rajesh Patel, MD, DM',
      badge: 'Advanced CathLab'
    },
    {
      name: 'Neurology & Stroke Unit',
      desc: 'Specialized management for stroke, epilepsy, neurodegenerative disorders, and neuro-ICU care.',
      icon: Brain,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      doctors: 'Dr. Ananya Shah, MD, DM',
      badge: '24/7 Stroke Protocol'
    },
    {
      name: 'Orthopedics & Joint Surgery',
      desc: 'Minimally invasive joint replacements, sports injury arthroscopy, and complex trauma fixation.',
      icon: Bone,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      doctors: 'Dr. Kavita Sharma, MS',
      badge: 'Robotic Surgery'
    },
    {
      name: 'Pediatrics & Neonatology',
      desc: 'Compassionate pediatric healthcare, Level-3 NICU/PICU, immunizations, and child wellness.',
      icon: Baby,
      color: 'bg-pink-50 text-pink-600 border-pink-100',
      doctors: 'Dr. Siddharth Mehta, MD',
      badge: 'Level 3 NICU'
    },
    {
      name: 'Diagnostic Pathology & Lab',
      desc: 'Fully automated hematology, biochemistry, infectious disease panels, and digital reports.',
      icon: FlaskConical,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-100',
      doctors: 'Suresh Kumar, Lab Chief',
      badge: 'NABL Certified'
    },
    {
      name: 'Emergency & Trauma (24/7)',
      desc: 'Immediate resuscitation, Level-1 trauma surgical theatre, crash cart, and ICU ambulance dispatch.',
      icon: AlertOctagon,
      color: 'bg-red-50 text-red-600 border-red-100',
      doctors: 'Emergency Physician Team',
      badge: 'Immediate Triage'
    },
  ];

  const demoRoles = [
    { name: 'Dr. Arvind Rao', role: 'ADMIN', email: 'admin@medicare.local', label: 'Super Admin', desc: 'Hospital executive BI, bed control, staff & audit trail' },
    { name: 'Dr. Rajesh Patel', role: 'DOCTOR', email: 'dr.patel@medicare.local', label: 'Cardiologist', desc: 'OPD queue, patient vitals, diagnosis, e-prescription & lab orders' },
    { name: 'Priya Nair', role: 'RECEPTIONIST', email: 'reception@medicare.local', label: 'Reception Desk', desc: 'Patient intake, check-in waiting room, and OPD booking' },
    { name: 'Amit Deshmukh', role: 'PHARMACIST', email: 'pharmacy@medicare.local', label: 'Pharmacy', desc: 'Prescription dispensing queue & live inventory deduction' },
    { name: 'Suresh Kumar', role: 'LAB_TECH', email: 'lab@medicare.local', label: 'Pathology Lab', desc: 'Diagnostic testing workbench, reference ranges & verified reports' },
    { name: 'Rahul Patel', role: 'PATIENT', email: 'patient.rahul@medicare.local', label: 'Patient Portal', desc: 'Appointment history, digital prescriptions, lab reports & invoices' },
  ];

  const handleRoleQuickLaunch = async (email: string) => {
    await switchDemoAccount(email);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-blue-500 selection:text-white relative">
      {/* 1. Floating Horizontal Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 max-w-6xl w-[92%] z-50 floating-glass rounded-2xl px-5 py-2.5 flex items-center justify-between transition-all shadow-floating">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="font-extrabold text-slate-900 text-sm tracking-tight leading-none flex items-center gap-1.5">
              <span>MediCare</span>
              <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.2 rounded-md uppercase">
                Hospital
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Healthcare & Clinical Network</span>
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a href="#specialties" className="hover:text-blue-600 transition">Clinical Specialties</a>
          <a href="#workflow" className="hover:text-blue-600 transition">Hospital Journey</a>
          <a href="#demo-roles" className="hover:text-blue-600 transition flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Demo</span>
          </a>
          <a href="#emergency" className="hover:text-rose-600 transition flex items-center gap-1 text-rose-600">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>24/7 ER Trauma</span>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 rounded-xl transition shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Book Appointment</span>
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-500/20 transition"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Portal Login</span>
            </Link>
          )}
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center relative overflow-hidden">
        {/* Soft Background Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-blue-100/40 via-cyan-100/30 to-indigo-100/40 blur-3xl -z-10 rounded-full pointer-events-none" />

        {/* Accreditations Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700 mb-6 animate-fade-in">
          <Award className="w-3.5 h-3.5 text-blue-600" />
          <span>NABH & JCI Accredited Multi-Speciality Medical Center</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-blue-700 font-bold">Mumbai, India</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Advanced Healthcare Systems,{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
            Designed for Life.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          MediCare connects patient intake, doctor OPD consultations, automated electronic prescriptions, pathology laboratories, central pharmacy dispensing, and smart inpatient bed management in one seamless ecosystem.
        </p>

        {/* Hero Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-500/25 transition flex items-center gap-2"
          >
            <span>Launch Hospital System</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs sm:text-sm font-semibold rounded-full shadow-2xs transition flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>Book Doctor Consultation</span>
          </button>

          <a
            href="tel:18002091088"
            className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs sm:text-sm font-bold rounded-full transition flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>24/7 ER: 1800-209-1088</span>
          </a>
        </div>

        {/* Live Trust Metrics Bar */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">50+</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Specialist Physicians</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-teal-600">10,000+</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Patients Managed</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">24/7</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">ICU & Trauma Unit</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-cyan-600">100%</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Paperless EHR Records</div>
          </div>
        </div>
      </section>

      {/* 3. Interactive 1-Click Role Sandbox Section */}
      <section id="demo-roles" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold border border-teal-500/30 mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Instant Live Exploration
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Test the Hospital from Any Role
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                  Click any role persona below to immediately log in and explore specialized permissions, clinical workflows, and live dashboards:
                </p>
              </div>

              <Link
                to="/login"
                className="self-start sm:self-auto px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <span>Full Login Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {demoRoles.map((dr, idx) => (
                <div
                  key={idx}
                  onClick={() => handleRoleQuickLaunch(dr.email)}
                  className="cursor-pointer group p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 hover:border-teal-400 hover:bg-slate-800 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                        {dr.role}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 group-hover:text-teal-300 transition flex items-center gap-1">
                        <span>Launch</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white group-hover:text-teal-300 transition">
                      {dr.name}
                    </div>
                    <div className="text-xs text-teal-400 font-medium mt-0.5">
                      {dr.label}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      {dr.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Clinical Specialties Section */}
      <section id="specialties" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1.5">
            Centre of Excellence
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Specialized Departments & Clinical Units
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Equipped with state-of-the-art medical technology, ICU beds, and board-certified consultants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((spec, i) => {
            const Icon = spec.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${spec.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {spec.badge}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900">{spec.name}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{spec.desc}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Lead Consultant</div>
                    <div className="font-semibold text-slate-800">{spec.doctors}</div>
                  </div>
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition font-semibold text-xs flex items-center gap-1"
                  >
                    <span>Consult</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Hospital Digital Journey (Workflow Stepper) */}
      <section id="workflow" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xs my-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1.5">
            Paperless Clinical Flow
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How the MediCare Ecosystem Works
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            A single patient encounter connects clinical notes, pharmacy stock deduction, and billing seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-left">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              1
            </div>
            <div className="font-bold text-sm text-slate-900">Digital Appointment</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Patient selects department and doctor time slot. Reception confirms & check-in waiting room live.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-left">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              2
            </div>
            <div className="font-bold text-sm text-slate-900">Doctor OPD Suite</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Physician logs vitals (BP, Pulse, SpO2), diagnostic findings, and issues e-prescriptions with one click.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-left">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              3
            </div>
            <div className="font-bold text-sm text-slate-900">Pharmacy & Lab Routing</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Prescription appears in Central Pharmacy queue with automatic inventory deduction and lab test tracking.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-left">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              4
            </div>
            <div className="font-bold text-sm text-slate-900">Billing & Medical History</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated GST itemized invoice, UPI/cash payment receipts, and permanent longitudinal EHR timeline.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Emergency 24/7 Hotline Banner */}
      <section id="emergency" className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-rose-900 via-red-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-rose-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs font-bold border border-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              CODE RED TRAUMA & CRITICAL CARE
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              24-Hour Emergency Medical Assistance
            </h3>
            <p className="text-xs sm:text-sm text-rose-200">
              Cardiac emergencies, road traffic trauma, severe respiratory distress, acute stroke care, and pediatric resuscitation with on-call emergency consultants.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href="tel:18002091088"
              className="w-full sm:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2 text-center"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Emergency: 1800-209-1088</span>
            </a>
          </div>
        </div>
      </section>

      {/* 7. Clean Modern Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">MediCare Multi-Speciality Hospital</div>
              <div className="text-[11px] text-slate-400">Health City, Bandra-Kurla Complex, Mumbai - 400051</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link to="/dashboard" className="hover:text-teal-600 font-medium">Hospital System</Link>
            <Link to="/login" className="hover:text-teal-600 font-medium">Portal Login</Link>
            <Link to="/register" className="hover:text-teal-600 font-medium">Register Patient</Link>
            <a href="tel:02228904400" className="hover:text-teal-600 font-medium">+91 (022) 2890-4400</a>
          </div>

          <div className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} MediCare HMS. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          setIsBookingModalOpen(false);
          navigate('/dashboard');
        }}
      />
    </div>
  );
};

export default LandingPage;
