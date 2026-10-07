import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Search, 
  Calendar, 
  Clock, 
  Award, 
  Building2, 
  Phone, 
  Mail, 
  Plus,
  CheckCircle2,
  Filter,
  DollarSign
} from 'lucide-react';
import { doctorsApi, departmentsApi } from '../../services/api';
import { IDoctor, IDepartment } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { AppointmentBookingModal } from '../../components/forms/AppointmentBookingModal';

export const DoctorListPage: React.FC = () => {
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [bookingDoctorId, setBookingDoctorId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [docRes, deptRes] = await Promise.all([
        doctorsApi.getAll({
          search: search || undefined,
          departmentId: selectedDeptId || undefined,
        }),
        departmentsApi.getAll(),
      ]);

      if (docRes.data.success) setDoctors(docRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadData, 200);
    return () => clearTimeout(timer);
  }, [search, selectedDeptId]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getInitials = (name: string) => {
    return name
      .replace(/^Dr\.\s*/i, '')
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Color generator based on department
  const getDeptColor = (deptName?: string) => {
    const d = (deptName || '').toLowerCase();
    if (d.includes('cardio')) return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', avatarBg: 'bg-rose-600' };
    if (d.includes('neuro')) return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', avatarBg: 'bg-purple-600' };
    if (d.includes('ortho')) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', avatarBg: 'bg-amber-600' };
    if (d.includes('pedia')) return { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', avatarBg: 'bg-pink-600' };
    return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', avatarBg: 'bg-teal-600' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-600" /> Specialist Medical Officers & Consultants
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified physicians, department specializations, OPD schedules, and consultation fees
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by doctor name or specialization..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-xs text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDeptId}
            onChange={e => setSelectedDeptId(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none w-full sm:w-auto font-medium"
          >
            <option value="">All Hospital Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors Cards Grid - Clean Initials Avatar (No stock images) */}
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : doctors.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
          No medical doctors found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map(doc => {
            const colors = getDeptColor(doc.departmentName || doc.specialization);
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Doctor Profile Header */}
                  <div className="flex items-start gap-3.5 mb-4">
                    {/* Clean Initials Badge */}
                    <div className={`w-12 h-12 rounded-xl ${colors.avatarBg} text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-xs`}>
                      {getInitials(doc.name)}
                    </div>

                    <div className="flex-1 truncate">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{doc.name}</h3>
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      </div>
                      <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {doc.specialization}
                      </div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
                        {doc.departmentName || 'General Medicine'}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Clinical Meta */}
                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Qualifications:
                      </span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">{doc.qualification}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" /> Consultation Fee:
                      </span>
                      <span className="font-bold text-teal-700">₹{doc.consultationFee?.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Room / OPD:
                      </span>
                      <span className="font-semibold text-slate-800">{doc.roomNumber || 'OPD-102'}</span>
                    </div>
                  </div>

                  {/* Active OPD Days */}
                  <div className="mt-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Weekly OPD Availability
                    </div>
                    <div className="flex gap-1">
                      {daysOfWeek.map((day, idx) => {
                        const isAvailable = doc.schedules?.some(s => s.dayOfWeek === idx);
                        return (
                          <span
                            key={day}
                            className={`flex-1 text-center py-1 text-[10px] font-bold rounded-lg ${
                              isAvailable
                                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                : 'bg-slate-50 text-slate-300'
                            }`}
                          >
                            {day[0]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setBookingDoctorId(doc.id)}
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Appointment Booking Modal */}
      {bookingDoctorId && (
        <AppointmentBookingModal
          isOpen={!!bookingDoctorId}
          onClose={() => setBookingDoctorId(null)}
          preselectedDoctorId={bookingDoctorId}
          onSuccess={() => {
            setBookingDoctorId(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default DoctorListPage;
