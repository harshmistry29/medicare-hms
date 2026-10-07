import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Stethoscope, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Filter,
  ArrowRight
} from 'lucide-react';
import { doctorsApi, departmentsApi, appointmentsApi } from '../../services/api';
import { IDoctor, IDepartment, IAppointment } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { AppointmentBookingModal } from '../../components/forms/AppointmentBookingModal';

export const DoctorScheduleCalendarPage: React.FC = () => {
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  const fetchCalendarData = async () => {
    setIsLoading(true);
    try {
      const [docRes, deptRes, appRes] = await Promise.all([
        doctorsApi.getAll(),
        departmentsApi.getAll(),
        appointmentsApi.getAll({ limit: 100 }),
      ]);
      if (docRes.data.success) {
        setDoctors(docRes.data.data);
        if (docRes.data.data.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(docRes.data.data[0].id);
        }
      }
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (appRes.data.success) setAppointments(appRes.data.data);
    } catch (err) {
      console.error('Failed to load schedule data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const nextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  // Generate 7 days for the active week
  const getDaysOfWeek = (startDate: Date) => {
    const start = new Date(startDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    start.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDays = getDaysOfWeek(currentDate);
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  const filteredDoctors = selectedDeptId
    ? doctors.filter(d => d.departmentId === selectedDeptId)
    : doctors;

  const currentDoctor = doctors.find(d => d.id === selectedDoctorId);

  const getInitials = (name?: string) => {
    if (!name) return 'DR';
    return name.replace(/^Dr\.\s*/i, '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Doctor Schedule & OPD Calendar
            </h1>
            <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
              Weekly View
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time outpatient consultation slots, physician schedules, and appointment availability
          </p>
        </div>

        <button
          onClick={() => setIsBookingOpen(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter & Doctor Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDeptId}
              onChange={e => {
                setSelectedDeptId(e.target.value);
                const first = doctors.find(d => !e.target.value || d.departmentId === e.target.value);
                if (first) setSelectedDoctorId(first.id);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Doctor Switcher */}
          <select
            value={selectedDoctorId}
            onChange={e => setSelectedDoctorId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50/50 border-teal-200"
          >
            {filteredDoctors.map(doc => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.specialization}) — Fee: ₹{doc.consultationFee}
              </option>
            ))}
          </select>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/80">
          <button
            onClick={prevWeek}
            className="p-1.5 hover:bg-white text-slate-600 rounded-lg transition"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 px-3">
            {weekDays[0].toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} –{' '}
            {weekDays[6].toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button
            onClick={nextWeek}
            className="p-1.5 hover:bg-white text-slate-600 rounded-lg transition"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Doctor Summary Card */}
      {currentDoctor && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
              {getInitials(currentDoctor.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">{currentDoctor.name}</h3>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {currentDoctor.departmentName || currentDoctor.specialization}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {currentDoctor.qualification} • Room: <strong className="text-slate-700">{currentDoctor.roomNumber || 'OPD-102'}</strong> • Fee: <strong className="text-teal-700 font-mono">₹{currentDoctor.consultationFee}</strong>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Slot duration: <strong className="text-slate-800">15 Minutes</strong> • Auto-synced with OPD Queue
          </div>
        </div>
      )}

      {/* Interactive Week Calendar Grid */}
      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-600 text-xs">
                  <th className="py-3.5 px-4 w-24 font-bold uppercase text-[10px] text-slate-400">Time</th>
                  {weekDays.map((date, idx) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    return (
                      <th
                        key={idx}
                        className={`py-3.5 px-3 font-semibold text-center border-l border-slate-100 ${
                          isToday ? 'bg-teal-50/80 text-teal-900 font-bold' : ''
                        }`}
                      >
                        <div className="text-[11px] uppercase tracking-wider text-slate-400">
                          {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                        </div>
                        <div className={`text-sm font-extrabold ${isToday ? 'text-teal-700' : 'text-slate-800'}`}>
                          {date.getDate()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {timeSlots.map(time => (
                  <tr key={time} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400 text-[11px] bg-slate-50/30">
                      {time}
                    </td>
                    {weekDays.map((date, dayIdx) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const dayOfWeek = date.getDay();
                      const isDoctorWorking = currentDoctor?.schedules?.some(s => s.dayOfWeek === dayOfWeek);

                      // Check if appointment booked in this slot
                      const bookedApp = appointments.find(
                        a =>
                          (a.doctorId === selectedDoctorId || (typeof a.doctorId === 'object' && ((a.doctorId as any)?.id === selectedDoctorId || (a.doctorId as any)?._id === selectedDoctorId))) &&
                          a.date?.startsWith(dateStr) &&
                          a.startTime?.startsWith(time)
                      );

                      return (
                        <td key={dayIdx} className="py-2.5 px-2 border-l border-slate-100 text-center">
                          {bookedApp ? (
                            <div className="p-2 rounded-xl bg-teal-50 border border-teal-200/80 text-left shadow-2xs">
                              <div className="font-bold text-teal-950 text-[11px] truncate">
                                {bookedApp.patientName || 'Reserved Patient'}
                              </div>
                              <div className="text-[10px] text-teal-700 flex items-center justify-between mt-0.5">
                                <span className="font-mono">{bookedApp.appointmentNumber || 'APP'}</span>
                                <span className="font-semibold capitalize">{bookedApp.status?.toLowerCase()}</span>
                              </div>
                            </div>
                          ) : isDoctorWorking ? (
                            <button
                              onClick={() => setIsBookingOpen(true)}
                              className="w-full py-2 px-1.5 rounded-lg border border-dashed border-slate-200 text-slate-400 hover:text-teal-700 hover:border-teal-400 hover:bg-teal-50/40 text-[11px] font-medium transition"
                            >
                              Available
                            </button>
                          ) : (
                            <span className="text-slate-300 text-[10px]">Off Duty</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <AppointmentBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preselectedDoctorId={selectedDoctorId}
        onSuccess={() => {
          setIsBookingOpen(false);
          fetchCalendarData();
        }}
      />
    </div>
  );
};

export default DoctorScheduleCalendarPage;
