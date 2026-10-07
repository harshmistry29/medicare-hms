import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { IPatient, IDoctor, IBed } from '../../types';
import { admissionsApi, patientsApi, doctorsApi, bedsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Hotel, BedDouble } from 'lucide-react';

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patients?: any[];
  doctors?: any[];
  availableBeds?: any[];
}

export const AdmissionModal: React.FC<AdmissionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { success, error } = useToast();
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [availableBeds, setAvailableBeds] = useState<IBed[]>([]);

  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [bedId, setBedId] = useState('');
  const [reasonForAdmission, setReasonForAdmission] = useState('');
  const [initialDiagnosis, setInitialDiagnosis] = useState('');
  const [expectedDischargeDate, setExpectedDischargeDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const loadData = async () => {
      try {
        const [patRes, docRes, bedRes] = await Promise.all([
          patientsApi.getAll({ limit: 100 }),
          doctorsApi.getAll(),
          bedsApi.getBeds({ status: 'AVAILABLE' }),
        ]);

        if (patRes.data.success) {
          setPatients(patRes.data.data);
          if (patRes.data.data.length > 0) setPatientId(patRes.data.data[0].id);
        }
        if (docRes.data.success) {
          setDoctors(docRes.data.data);
          if (docRes.data.data.length > 0) setDoctorId(docRes.data.data[0].id);
        }
        if (bedRes.data.success) {
          setAvailableBeds(bedRes.data.data);
          if (bedRes.data.data.length > 0) setBedId(bedRes.data.data[0].id);
        }
      } catch (err) {
        console.error('Error loading admission prerequisites:', err);
      }
    };
    loadData();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId || !bedId || !reasonForAdmission || !initialDiagnosis) {
      error('Incomplete Details', 'Please fill in all mandatory admission fields and select an available bed');
      return;
    }

    setIsLoading(true);
    try {
      await admissionsApi.create({
        patientId,
        doctorId,
        bedId,
        reasonForAdmission,
        initialDiagnosis,
        expectedDischargeDate: expectedDischargeDate || undefined,
      });
      success('Patient Admitted', 'Inpatient admission created and hospital bed assigned');
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Admission Failed', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inpatient Hospital Admission"
      subtitle="Admit patient into General Ward, Semi-Private, Private Suite, or ICU"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
            <select
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-white text-slate-800"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.patientId}) — Age: {p.age} • Blood: {p.bloodGroup}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Attending Physician / Surgeon *</label>
            <select
              value={doctorId}
              onChange={e => setDoctorId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-white text-slate-800"
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Select Available Bed *</label>
          {availableBeds.length === 0 ? (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              No beds currently available. Please check Bed Management.
            </div>
          ) : (
            <select
              value={bedId}
              onChange={e => setBedId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-white text-slate-800 font-medium"
            >
              {availableBeds.map(b => (
                <option key={b.id} value={b.id}>
                  Room {b.roomNumber} ({b.roomType}) — Bed {b.bedNumber} (₹{b.dailyRate}/day)
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Admission *</label>
            <input
              type="text"
              required
              value={reasonForAdmission}
              onChange={e => setReasonForAdmission(e.target.value)}
              placeholder="e.g. Unstable angina monitoring / Post-op recovery"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Admitting Diagnosis *</label>
            <input
              type="text"
              required
              value={initialDiagnosis}
              onChange={e => setInitialDiagnosis(e.target.value)}
              placeholder="e.g. Acute Coronary Syndrome"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Expected Discharge Date (Optional)</label>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={expectedDischargeDate}
            onChange={e => setExpectedDischargeDate(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || availableBeds.length === 0}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {isLoading ? 'Processing Admission...' : 'Confirm Inpatient Admission'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AdmissionModal;
