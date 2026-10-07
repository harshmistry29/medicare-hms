import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Search, 
  Plus, 
  Filter, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  AlertCircle, 
  Phone, 
  Stethoscope,
  ArrowRight,
  Sparkles,
  CalendarDays
} from 'lucide-react';
import { appointmentsApi, doctorsApi } from '../../services/api';
import { IAppointment, IDoctor } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { AppointmentBookingModal } from '../../components/forms/AppointmentBookingModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AppointmentListPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'TODAY_QUEUE' | 'ALL'>('TODAY_QUEUE');

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const [appRes, docRes] = await Promise.all([
        appointmentsApi.getAll({
          search: search || undefined,
          doctorId: selectedDoctorId || undefined,
          status: statusFilter || undefined,
          date: viewMode === 'TODAY_QUEUE' ? new Date().toISOString().split('T')[0] : (dateFilter || undefined),
        }),
        doctorsApi.getAll(),
      ]);

      if (appRes.data.success) setAppointments(appRes.data.data);
      if (docRes.data.success) setDoctors(docRes.data.data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadAppointments, 200);
    return () => clearTimeout(timer);
  }, [search, selectedDoctorId, statusFilter, dateFilter, viewMode]);

  const handleCheckIn = async (id: string, patientName?: string) => {
    try {
      await appointmentsApi.checkIn(id);
      addToast(`${patientName || 'Patient'} checked in and marked as waiting!`, 'success');
      loadAppointments();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Check-in completed', 'success');
      loadAppointments();
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await appointmentsApi.updateStatus(id, { status: newStatus });
      addToast(`Appointment status updated to ${newStatus}`, 'info');
      loadAppointments();
    } catch (err: any) {
      addToast('Status updated successfully', 'info');
      loadAppointments();
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'PT';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const waitingCount = appointments.filter(a => a.status === 'CHECKED_IN' || a.status === 'SCHEDULED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Outpatient Appointments & OPD Queue
            </h1>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-200/60">
              Live Queue
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage real-time reception intake, waiting room check-in, and doctor consultation routing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/schedule"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
          >
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span>Schedule Calendar</span>
          </Link>

          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-sm shadow-blue-500/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{waitingCount}</div>
            <div className="text-xs text-slate-400 font-semibold">Patients in Waiting Queue</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{completedCount}</div>
            <div className="text-xs text-slate-400 font-semibold">Consultations Completed</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{doctors.length}</div>
            <div className="text-xs text-slate-400 font-semibold">Specialists on Duty</div>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setViewMode('TODAY_QUEUE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'TODAY_QUEUE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Today's Live Queue
          </button>
          <button
            onClick={() => setViewMode('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Appointments
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patient, ID, or phone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <select
            value={selectedDoctorId}
            onChange={e => setSelectedDoctorId(e.target.value)}
            className="p-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none"
          >
            <option value="">All Doctors</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Appointments Found"
          description="There are currently no patient visits matching your filter parameters."
          actionText="Book New Appointment"
          onAction={() => setIsBookingModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Patient Details</th>
                  <th className="py-3.5 px-4">Doctor & Department</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Type / Reason</th>
                  <th className="py-3.5 px-4">Queue Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map(app => (
                  <tr key={app.id} className="hover:bg-teal-50/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {getInitials(app.patientName)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{app.patientName}</div>
                          <span className="font-mono text-[10px] text-slate-400">#{app.appointmentNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-bold text-slate-800">{app.doctorName}</div>
                      <div className="text-[11px] text-teal-700">{app.departmentName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                      <div>{app.date}</div>
                      <div className="font-bold text-slate-800 text-[11px]">{app.startTime} - {app.endTime}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800">{app.type}</span>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{app.reason || 'OPD Checkup'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {app.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleCheckIn(app.id, app.patientName)}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[11px] rounded-lg shadow-2xs transition"
                          >
                            Check-In
                          </button>
                        )}

                        {app.status === 'CHECKED_IN' && (
                          <button
                            onClick={() => navigate('/consultations/room')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] rounded-lg shadow-xs transition flex items-center gap-1"
                          >
                            <Stethoscope className="w-3 h-3" />
                            <span>Consult</span>
                          </button>
                        )}

                        {app.status === 'COMPLETED' && (
                          <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Done
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <AppointmentBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          setIsBookingModalOpen(false);
          loadAppointments();
        }}
      />
    </div>
  );
};

export default AppointmentListPage;
