import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { IDepartment, IDoctor, IPatient } from '../../types';
import { departmentsApi, doctorsApi, patientsApi, appointmentsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, Stethoscope, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedDoctorId?: string;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedDoctorId,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [patients, setPatients] = useState<IPatient[]>([]);

  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(preselectedDoctorId || '');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<{ startTime: string; endTime: string; isAvailable: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('OPD');
  const [reason, setReason] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial departments, doctors, and patients
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        const [deptRes, docRes] = await Promise.all([
          departmentsApi.getAll(),
          doctorsApi.getAll(),
        ]);
        if (deptRes.data.success) setDepartments(deptRes.data.data);
        if (docRes.data.success) setDoctors(docRes.data.data);

        // Load patients if staff role
        if (user?.role !== 'PATIENT') {
          const patRes = await patientsApi.getAll({ limit: 100 });
          if (patRes.data.success) {
            setPatients(patRes.data.data);
            if (patRes.data.data.length > 0) {
              setSelectedPatientId(patRes.data.data[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    };

    loadData();
  }, [isOpen, user]);

  // If preselected doctor, set department
  useEffect(() => {
    if (preselectedDoctorId && doctors.length > 0) {
      const doc = doctors.find(d => d.id === preselectedDoctorId);
      if (doc) {
        setSelectedDoctorId(doc.id);
        setSelectedDeptId(doc.departmentId);
      }
    }
  }, [preselectedDoctorId, doctors]);

  // Fetch slots whenever doctor and date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setSelectedSlot('');
      try {
        const res = await appointmentsApi.getAvailableSlots(selectedDoctorId, selectedDate);
        if (res.data.success) {
          setAvailableSlots(res.data.data);
          // Pick first available slot by default
          const firstAvail = res.data.data.find((s: any) => s.isAvailable);
          if (firstAvail) setSelectedSlot(firstAvail.startTime);
        }
      } catch (err) {
        console.error('Failed to fetch slots:', err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  const filteredDoctors = selectedDeptId
    ? doctors.filter(d => d.departmentId === selectedDeptId)
    : doctors;

  const selectedDoctorObj = doctors.find(d => d.id === selectedDoctorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedDate || !selectedSlot) {
      error('Incomplete Booking', 'Please choose a doctor, appointment date, and available time slot');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patientId: user?.role === 'PATIENT' ? (user.patientProfileId || user.id) : selectedPatientId,
        doctorId: selectedDoctorId,
        departmentId: selectedDoctorObj?.departmentId,
        date: selectedDate,
        startTime: selectedSlot,
        type: appointmentType,
        reason: reason || 'Specialist OPD Consultation',
      };

      const res = await appointmentsApi.create(payload);
      if (res.data.success) {
        success('Appointment Confirmed!', `Booked for ${selectedDate} at ${selectedSlot} (${res.data.data.appointmentNumber})`);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      error('Booking Failed', err.response?.data?.message || 'Slot conflict or server error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Doctor Appointment"
      subtitle="Select specialist, view real-time availability slots, and confirm booking"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Patient Selection (for staff) */}
        {user?.role !== 'PATIENT' && (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-white text-slate-800"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.patientId}) — {p.phone}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Department & Doctor Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department</label>
            <select
              value={selectedDeptId}
              onChange={e => {
                setSelectedDeptId(e.target.value);
                setSelectedDoctorId('');
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-white text-slate-800"
            >
              <option value="">All Hospital Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Doctor *</label>
            <select
              required
              value={selectedDoctorId}
              onChange={e => setSelectedDoctorId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-white text-slate-800"
            >
              <option value="">-- Choose Specialist Doctor --</option>
              {filteredDoctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} — {doc.specialization} (Fee: ₹{doc.consultationFee})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctor Summary Banner if selected */}
        {selectedDoctorObj && (
          <div className="flex items-center gap-3 p-3 bg-teal-50/70 rounded-xl border border-teal-200/80">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
              {selectedDoctorObj.name.replace(/^Dr\.\s*/i, '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="font-bold text-teal-950 text-xs">{selectedDoctorObj.name}</p>
                <span className="font-bold font-mono text-teal-900">₹{selectedDoctorObj.consultationFee} Consultation Fee</span>
              </div>
              <p className="text-[11px] text-teal-800">
                {selectedDoctorObj.qualification} • {selectedDoctorObj.specialization} ({selectedDoctorObj.experienceYears} yrs exp)
              </p>
            </div>
          </div>
        )}

        {/* Date & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Appointment Date *</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Appointment Type</label>
            <select
              value={appointmentType}
              onChange={e => setAppointmentType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-white text-slate-800"
            >
              <option value="OPD">Outpatient (OPD) Consultation</option>
              <option value="FOLLOW_UP">Follow-up Review</option>
              <option value="ROUTINE_CHECKUP">Routine Health Checkup</option>
              <option value="TELECONSULTATION">Tele-consultation</option>
            </select>
          </div>
        </div>

        {/* Live Slot Grid */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-600" /> Available Time Slots
            </label>
            {isLoadingSlots && <span className="text-[10px] text-sky-600 animate-pulse">Calculating doctor slots...</span>}
          </div>

          {!selectedDoctorId ? (
            <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
              Select a doctor and date to view live availability slots
            </div>
          ) : availableSlots.length === 0 && !isLoadingSlots ? (
            <div className="p-4 text-center text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
              Doctor has no scheduled OPD sessions on this selected date. Please choose another weekday.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
              {availableSlots.map((slot, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={!slot.isAvailable}
                  onClick={() => setSelectedSlot(slot.startTime)}
                  className={`py-2 px-1 text-center rounded-xl font-mono text-xs font-semibold transition border ${
                    !slot.isAvailable
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                      : selectedSlot === slot.startTime
                      ? 'bg-sky-600 text-white border-sky-700 shadow-md ring-2 ring-sky-300 font-bold'
                      : 'bg-white hover:bg-sky-50 text-slate-800 border-slate-200'
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chief Reason for Visit */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Chief Reason for Visit / Symptoms</label>
          <textarea
            rows={2}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Mild chest tightness, shortness of breath on climbing stairs, morning headache..."
            className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-[11px] text-slate-500">
            {selectedSlot ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Slot {selectedSlot} Selected
              </span>
            ) : (
              <span>Please pick a time slot</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedSlot}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
