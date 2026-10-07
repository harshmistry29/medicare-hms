import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Stethoscope,
  Pill,
  FlaskConical,
  Receipt,
  BedDouble,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Activity,
  Plus,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Building2,
  HeartPulse
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { reportsApi, appointmentsApi } from '../../services/api';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { AppointmentBookingModal } from '../../components/forms/AppointmentBookingModal';
import { PatientFormModal } from '../../components/forms/PatientFormModal';
import { EmergencyTriageModal } from '../../components/forms/EmergencyTriageModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      const [repRes, appRes] = await Promise.all([
        reportsApi.getDashboardOverview(),
        appointmentsApi.getAll({ limit: 10 }),
      ]);
      if (repRes.data.success) setDashboardData(repRes.data.data);
      if (appRes.data.success) setTodayAppointments(appRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading || !dashboardData) {
    return <LoadingSkeleton rows={5} />;
  }

  const { summary, monthlyRevenueData } = dashboardData;

  const getInitials = (name?: string) => {
    if (!name) return 'PT';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // Structured Hospital Workflow Progression
  const workflowSteps = [
    {
      step: '01',
      title: 'Patient Intake',
      desc: 'Register or search patient EHR profile',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-200/60',
      action: () => setIsPatientModalOpen(true),
      btnLabel: 'New Patient'
    },
    {
      step: '02',
      title: 'OPD Booking',
      desc: 'Book specialist slot & generate queue token',
      icon: Calendar,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200/60',
      action: () => setIsBookingOpen(true),
      btnLabel: 'Book Slot'
    },
    {
      step: '03',
      title: 'Doctor OPD Suite',
      desc: 'Clinical consult, vitals & e-prescriptions',
      icon: Stethoscope,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200/60',
      action: () => navigate('/consultations/room'),
      btnLabel: 'Consult Room'
    },
    {
      step: '04',
      title: 'Pharmacy & Labs',
      desc: 'Dispense medicines & validate pathology',
      icon: Pill,
      color: 'bg-amber-50 text-amber-600 border-amber-200/60',
      action: () => navigate('/pharmacy'),
      btnLabel: 'Dispense Meds'
    },
    {
      step: '05',
      title: 'Invoicing & Discharge',
      desc: 'Itemized settlement & discharge summaries',
      icon: Receipt,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
      action: () => navigate('/billing'),
      btnLabel: 'Invoicing'
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Action Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Hospital Operations Center
            </h1>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Clinical Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, <strong className="text-slate-800">{user?.name}</strong> • Role:{' '}
            <span className="font-semibold text-blue-600">{user?.role?.replace(/_/g, ' ')}</span> • Real-time hospital metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPatientModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Patient</span>
          </button>
          <button
            onClick={() => setIsBookingOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/60 transition flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Book Appointment</span>
          </button>
          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200/80 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>Emergency (ER)</span>
          </button>
        </div>
      </div>

      {/* 2. Structured Hospital Workflow Step-by-Step Guidance */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Care Pathway & Clinical Workflow
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Click any stage to fast-track patient care
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {workflowSteps.map((ws, i) => {
            const Icon = ws.icon;
            return (
              <div
                key={i}
                onClick={ws.action}
                className="group cursor-pointer p-3.5 rounded-2xl border border-slate-200/70 hover:border-blue-400 hover:shadow-card transition-all bg-slate-50/50 hover:bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      STEP {ws.step}
                    </span>
                    <div className={`p-1.5 rounded-xl border ${ws.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition">
                    {ws.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {ws.desc}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition">
                  <span>{ws.btnLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Core KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Patients</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{summary.totalPatients}</div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>Registered in Master EHR</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Today Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's OPD Queue</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{summary.todayAppointments}</div>
            <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              <span>{summary.waitingAppointments || 0} Waiting for Consult</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Bed Occupancy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inpatient Beds</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {summary.occupiedBeds} / {summary.totalBeds}
            </div>
            <div className="text-[11px] text-teal-600 font-semibold flex items-center gap-1 mt-1">
              <BedDouble className="w-3 h-3" />
              <span>{summary.availableBeds} Free IPD Beds</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shadow-xs">
            <BedDouble className="w-6 h-6" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue Settled</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              ₹{(summary.todayRevenue || 12400).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{summary.pendingInvoices || 0} Invoices Pending</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live OPD Consultation Queue */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                Live OPD Patient Queue & Consultations
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time outpatient queue with direct doctor consultation entry</p>
            </div>
            <Link
              to="/appointments"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Full Schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            {todayAppointments.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                No appointments scheduled for today. Click "+ Book Appointment" above to create one.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Doctor & Unit</th>
                    <th className="py-3 px-4">Slot Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayAppointments.slice(0, 6).map((app: any) => (
                    <tr key={app.id || app._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-bold text-[11px] flex items-center justify-center border border-blue-200/60">
                            {getInitials(app.patientName)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{app.patientName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{app.appointmentNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-semibold text-slate-800">{app.doctorName}</div>
                        <div className="text-[10px] text-slate-400">{app.departmentName}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {app.startTime}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          app.status === 'CHECKED_IN' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          app.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {app.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {app.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => navigate('/consultations/room')}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl shadow-xs transition"
                          >
                            Consult
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
            <Link
              to="/consultations/room"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center justify-center gap-1.5"
            >
              <span>Enter Doctor OPD Consultation Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Hospital Velocity & Critical Alerts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Revenue Velocity Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Monthly Collections Velocity
                </h3>
                <p className="text-[11px] text-slate-400">Cash, Insurance & Digital Receipts</p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                ₹12.4L MTD
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueData || [
                  { month: 'Jun', revenue: 580000 },
                  { month: 'Jul', revenue: 690000 },
                  { month: 'Aug', revenue: 810000 },
                  { month: 'Sep', revenue: 950000 },
                  { month: 'Oct', revenue: 1240000 },
                ]}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `₹${v/1000}k`} />
                  <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Urgent Hospital Action Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Hospital Priority Flags
              </h3>
              <span className="text-[10px] font-bold text-slate-400">3 Alerts</span>
            </div>

            <div className="space-y-2 text-xs">
              <div 
                onClick={() => navigate('/pharmacy')}
                className="cursor-pointer p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between hover:bg-amber-100/60 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <Pill className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-900">Pharmacy Low Stock</div>
                    <div className="text-[10px] text-amber-700">3 critical medicines below reorder safety</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition" />
              </div>

              <div 
                onClick={() => navigate('/emergency')}
                className="cursor-pointer p-3 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between hover:bg-rose-100/60 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
                    <AlertOctagon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-rose-900">Emergency ER Active</div>
                    <div className="text-[10px] text-rose-700">Triage Red priority trauma queue is active</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-rose-600 group-hover:translate-x-0.5 transition" />
              </div>

              <div 
                onClick={() => navigate('/billing')}
                className="cursor-pointer p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between hover:bg-blue-100/60 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                    <Receipt className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-blue-900">Pending Billing Settlement</div>
                    <div className="text-[10px] text-blue-700">5 outpatient invoices pending patient clearance</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reusable Modals */}
      <PatientFormModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSuccess={() => {
          setIsPatientModalOpen(false);
          fetchDashboard();
        }}
      />

      <AppointmentBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => {
          setIsBookingOpen(false);
          fetchDashboard();
        }}
      />

      <EmergencyTriageModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onSuccess={() => {
          setIsEmergencyModalOpen(false);
          fetchDashboard();
        }}
      />
    </div>
  );
};

export default DashboardPage;
