import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { emergencyApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AlertOctagon, HeartPulse, Activity } from 'lucide-react';

interface EmergencyTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  doctors?: any[];
  patients?: any[];
}

export const EmergencyTriageModal: React.FC<EmergencyTriageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('MALE');
  const [emergencyType, setEmergencyType] = useState('CHEST_PAIN');
  const [priority, setPriority] = useState<'CRITICAL' | 'URGENT' | 'NORMAL'>('CRITICAL');
  const [triageNotes, setTriageNotes] = useState('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [spO2, setSpO2] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !triageNotes) {
      error('Incomplete Triage', 'Patient name and clinical triage notes are required');
      return;
    }

    setIsLoading(true);
    try {
      await emergencyApi.create({
        patientName,
        age: age ? parseInt(age, 10) : undefined,
        gender,
        emergencyType,
        priority,
        triageNotes,
        vitals: {
          bloodPressureSystolic: bpSystolic ? parseInt(bpSystolic, 10) : undefined,
          bloodPressureDiastolic: bpDiastolic ? parseInt(bpDiastolic, 10) : undefined,
          heartRate: heartRate ? parseInt(heartRate, 10) : undefined,
          spO2: spO2 ? parseInt(spO2, 10) : undefined,
        },
      });

      success('Emergency Intake Registered', `${patientName} triaged with ${priority} priority in Emergency Bay.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Triage Error', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🚨 Emergency Triage Registration"
      subtitle="Rapid intake for acute cardiac, trauma, stroke, or respiratory distress emergencies"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Priority Level Selector */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">Triage Severity Priority *</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'CRITICAL', label: '🔴 CRITICAL (Immediate Resus)', bg: 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-200' },
              { id: 'URGENT', label: '🟠 URGENT (< 15 mins)', bg: 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-200' },
              { id: 'NORMAL', label: '🟢 STANDARD (< 60 mins)', bg: 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-200' },
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id as any)}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                  priority === p.id ? p.bg : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Patient Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Patient Name / Unknown John Doe *</label>
            <input
              type="text"
              required
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              placeholder="e.g. Kishore Kumar / Unknown Male"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none font-semibold text-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Estimated Age</label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="e.g. 45"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Emergency Category</label>
            <select
              value={emergencyType}
              onChange={e => setEmergencyType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white text-slate-800 font-semibold"
            >
              <option value="CHEST_PAIN">Chest Pain / Suspected STEMI</option>
              <option value="ACCIDENT">Road Accident / Polytrauma</option>
              <option value="BREATHING_PROBLEM">Acute Respiratory Distress</option>
              <option value="STROKE">Acute Stroke / Neurological</option>
              <option value="TRAUMA">Severe Burn / Orthopedic Trauma</option>
              <option value="POISONING">Poisoning / Drug Overdose</option>
              <option value="OTHER">Other Emergency Condition</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Gender</label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white text-slate-800"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Rapid Vitals */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-rose-600" /> Rapid Triage Vital Signs
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="text-[10px] text-slate-500">BP Systolic</label>
              <input
                type="number"
                value={bpSystolic}
                onChange={e => setBpSystolic(e.target.value)}
                placeholder="120"
                className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500">BP Diastolic</label>
              <input
                type="number"
                value={bpDiastolic}
                onChange={e => setBpDiastolic(e.target.value)}
                placeholder="80"
                className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500">Pulse (BPM)</label>
              <input
                type="number"
                value={heartRate}
                onChange={e => setHeartRate(e.target.value)}
                placeholder="75"
                className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500">SpO2 (%)</label>
              <input
                type="number"
                value={spO2}
                onChange={e => setSpO2(e.target.value)}
                placeholder="98"
                className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Clinical Triage Notes & Presenting Symptoms *</label>
          <textarea
            rows={3}
            required
            value={triageNotes}
            onChange={e => setTriageNotes(e.target.value)}
            placeholder="e.g. Sudden severe retrosternal chest pain with diaphoresis, dyspnea. Initial ECG showing ST elevation in V1-V4."
            className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
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
            disabled={isLoading}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <AlertOctagon className="w-4 h-4" />
            {isLoading ? 'Registering...' : 'Initiate Emergency Triage'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmergencyTriageModal;
