import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Stethoscope,
  User,
  HeartPulse,
  Activity,
  Pill,
  FlaskConical,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
} from 'lucide-react';
import { patientsApi, pharmacyApi, labApi, consultationsApi, appointmentsApi } from '../../services/api';
import { IPatient, IMedicine, ILabTest, IAppointment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const ConsultationRoomPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [patients, setPatients] = useState<IPatient[]>([]);
  const [medicines, setMedicines] = useState<IMedicine[]>([]);
  const [labTests, setLabTests] = useState<ILabTest[]>([]);
  const [checkedInAppointments, setCheckedInAppointments] = useState<IAppointment[]>([]);

  // Selected Patient
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');

  // Clinical Consultation State
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [clinicalObservations, setClinicalObservations] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Vitals
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('36.8');
  const [respiratoryRate, setRespiratoryRate] = useState('16');
  const [spO2, setSpO2] = useState('98');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');

  // Prescriptions List
  const [prescriptionItems, setPrescriptionItems] = useState<
    {
      medicineId: string;
      medicineName: string;
      dosage: string;
      frequency: string;
      route: 'ORAL' | 'IV' | 'IM' | 'TOPICAL' | 'INHALATION';
      duration: string;
      quantity: number;
      instructions: string;
    }[]
  >([
    {
      medicineId: '',
      medicineName: '',
      dosage: '500 mg',
      frequency: 'Twice daily after food (1-0-1)',
      route: 'ORAL',
      duration: '5 days',
      quantity: 10,
      instructions: 'Take after meals with plenty of water',
    },
  ]);

  // Lab Tests Selected
  const [selectedLabTestIds, setSelectedLabTestIds] = useState<string[]>([]);
  const [labPriority, setLabPriority] = useState<'NORMAL' | 'URGENT' | 'STAT'>('NORMAL');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [patRes, medRes, testRes, appRes] = await Promise.all([
          patientsApi.getAll({ limit: 100 }),
          pharmacyApi.getMedicines(),
          labApi.getTests(),
          appointmentsApi.getAll({ date: today }),
        ]);

        if (patRes.data.success) {
          setPatients(patRes.data.data);
          if (patRes.data.data.length > 0) setSelectedPatientId(patRes.data.data[0].id);
        }
        if (medRes.data.success) {
          setMedicines(medRes.data.data);
          if (medRes.data.data.length > 0) {
            setPrescriptionItems([
              {
                medicineId: medRes.data.data[0].id,
                medicineName: medRes.data.data[0].name,
                dosage: '500 mg',
                frequency: 'Twice daily after food (1-0-1)',
                route: 'ORAL',
                duration: '5 days',
                quantity: 10,
                instructions: 'Take with water after meals',
              },
            ]);
          }
        }
        if (testRes.data.success) setLabTests(testRes.data.data);
        if (appRes.data.success) {
          const checkedIn = appRes.data.data.filter((a: any) => a.status === 'CHECKED_IN');
          setCheckedInAppointments(checkedIn);
          if (checkedIn.length > 0) {
            setSelectedPatientId(checkedIn[0].patientId);
            setSelectedAppointmentId(checkedIn[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading consultation prerequisites:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrerequisites();
  }, []);

  const selectedPatientObj = patients.find(p => p.id === selectedPatientId);

  // Auto calculate BMI
  const bmi =
    heightCm && weightKg
      ? (parseFloat(weightKg) / Math.pow(parseFloat(heightCm) / 100, 2)).toFixed(1)
      : null;

  const addPrescriptionRow = () => {
    const firstMed = medicines[0];
    setPrescriptionItems(prev => [
      ...prev,
      {
        medicineId: firstMed?.id || '',
        medicineName: firstMed?.name || '',
        dosage: '1 Tablet',
        frequency: 'Once daily (1-0-0)',
        route: 'ORAL',
        duration: '7 days',
        quantity: 7,
        instructions: 'Take after food',
      },
    ]);
  };

  const removePrescriptionRow = (index: number) => {
    setPrescriptionItems(prev => prev.filter((_, i) => i !== index));
  };

  const updatePrescriptionItem = (index: number, field: string, value: any) => {
    setPrescriptionItems(prev => {
      const updated = [...prev];
      if (field === 'medicineId') {
        const med = medicines.find(m => m.id === value);
        updated[index] = {
          ...updated[index],
          medicineId: value,
          medicineName: med ? med.name : updated[index].medicineName,
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const toggleLabTest = (testId: string) => {
    setSelectedLabTestIds(prev =>
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !chiefComplaint || !diagnosis) {
      error('Incomplete Clinical Data', 'Patient, Chief Complaint, and Diagnosis are mandatory.');
      return;
    }

    setIsSaving(true);
    try {
      const validPrescriptionItems = prescriptionItems.filter(p => p.medicineName.trim().length > 0);

      const payload = {
        appointmentId: selectedAppointmentId || undefined,
        patientId: selectedPatientId,
        chiefComplaint,
        symptoms: symptoms ? symptoms.split(',').map(s => s.trim()).filter(Boolean) : [chiefComplaint],
        vitals: {
          bloodPressureSystolic: bpSystolic ? parseInt(bpSystolic, 10) : undefined,
          bloodPressureDiastolic: bpDiastolic ? parseInt(bpDiastolic, 10) : undefined,
          heartRate: heartRate ? parseInt(heartRate, 10) : undefined,
          temperature: temperature ? parseFloat(temperature) : undefined,
          respiratoryRate: respiratoryRate ? parseInt(respiratoryRate, 10) : undefined,
          spO2: spO2 ? parseInt(spO2, 10) : undefined,
          heightCm: heightCm ? parseFloat(heightCm) : undefined,
          weightKg: weightKg ? parseFloat(weightKg) : undefined,
        },
        clinicalObservations,
        diagnosis,
        treatmentPlan,
        doctorNotes,
        followUpDate: followUpDate || undefined,
        prescriptionItems: validPrescriptionItems,
        labTestIds: selectedLabTestIds,
        labPriority,
      };

      const res = await consultationsApi.create(payload);
      if (res.data.success) {
        success(
          'Consultation Completed!',
          `Record saved, prescription sent to Pharmacy, lab orders routed, and billing generated.`
        );
        navigate(`/patients/${selectedPatientId}`);
      }
    } catch (err: any) {
      error('Failed to Save Consultation', err.response?.data?.message || 'Server error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-600" /> Outpatient Doctor Consultation Suite
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record clinical examination, vitals, diagnosis, pharmacotherapy prescriptions, and laboratory orders
          </p>
        </div>
      </div>

      {/* Waiting Queue Shortcut Bar if patients waiting */}
      {checkedInAppointments.length > 0 && (
        <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-teal-900">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
            <strong className="font-bold">{checkedInAppointments.length} Patient(s) Waiting in Queue:</strong>
          </div>
          <div className="flex flex-wrap gap-2">
            {checkedInAppointments.map(app => (
              <button
                key={app.id}
                type="button"
                onClick={() => {
                  setSelectedPatientId(app.patientId);
                  setSelectedAppointmentId(app.id);
                  setChiefComplaint(app.reason || '');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
                  selectedAppointmentId === app.id
                    ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                    : 'bg-white hover:bg-teal-100 text-teal-800 border-teal-200'
                }`}
              >
                #{app.queueNumber} {app.patientName} ({app.startTime})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Consultation Form */}
      <form onSubmit={handleCompleteConsultation} className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Left Column: Patient Profile & Clinical Assessment */}
        <div className="lg:col-span-4 space-y-6">
          {/* Patient Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Consulting Patient *</label>
              <select
                value={selectedPatientId}
                onChange={e => {
                  setSelectedPatientId(e.target.value);
                  setSelectedAppointmentId('');
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-white text-slate-900 font-bold"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.patientId}) — Age: {p.age} • Blood: {p.bloodGroup}
                  </option>
                ))}
              </select>
            </div>

            {selectedPatientObj && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{selectedPatientObj.fullName}</span>
                  <span className="font-mono text-[10px] text-slate-500 font-bold">{selectedPatientObj.patientId}</span>
                </div>
                <p className="text-slate-600">
                  Age: {selectedPatientObj.age} yrs • Gender: {selectedPatientObj.gender} • Blood: <strong className="text-rose-700">{selectedPatientObj.bloodGroup}</strong>
                </p>

                {/* Allergies Warning */}
                {selectedPatientObj.allergies?.length > 0 && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-medium flex items-start gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Allergies: </strong> {selectedPatientObj.allergies.join(', ')}
                    </div>
                  </div>
                )}

                {/* Existing conditions */}
                {selectedPatientObj.existingConditions?.length > 0 && (
                  <p className="text-[11px] text-amber-800 font-medium">
                    <strong>Conditions: </strong> {selectedPatientObj.existingConditions.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Vitals Input Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-600" /> Patient Vital Signs
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 font-medium">BP Systolic (mmHg)</label>
                <input
                  type="number"
                  placeholder="120"
                  value={bpSystolic}
                  onChange={e => setBpSystolic(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium">BP Diastolic (mmHg)</label>
                <input
                  type="number"
                  placeholder="80"
                  value={bpDiastolic}
                  onChange={e => setBpDiastolic(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium">Heart Rate (bpm)</label>
                <input
                  type="number"
                  placeholder="72"
                  value={heartRate}
                  onChange={e => setHeartRate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium">Oxygen SpO2 (%)</label>
                <input
                  type="number"
                  placeholder="98"
                  value={spO2}
                  onChange={e => setSpO2(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={e => setTemperature(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium">Respiratory Rate</label>
                <input
                  type="number"
                  value={respiratoryRate}
                  onChange={e => setRespiratoryRate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium">Height (cm)</label>
                <input
                  type="number"
                  placeholder="175"
                  value={heightCm}
                  onChange={e => setHeightCm(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="70"
                  value={weightKg}
                  onChange={e => setWeightKg(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>

            {bmi && (
              <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200 flex justify-between items-center text-xs">
                <span className="text-sky-900 font-semibold">Calculated BMI:</span>
                <span className="font-bold font-mono text-sky-950 text-sm">
                  {bmi} kg/m² ({parseFloat(bmi) < 18.5 ? 'Underweight' : parseFloat(bmi) < 25 ? 'Normal' : parseFloat(bmi) < 30 ? 'Overweight' : 'Obese'})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Diagnosis, Prescription & Lab Orders */}
        <div className="lg:col-span-8 space-y-6">
          {/* Clinical Findings Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-sky-600" /> Clinical Assessment & Diagnosis
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chief Complaint *</label>
                <input
                  type="text"
                  required
                  value={chiefComplaint}
                  onChange={e => setChiefComplaint(e.target.value)}
                  placeholder="e.g. Occasional dizziness, morning headaches, fatigue since 2 weeks"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Symptoms (Comma separated)</label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  placeholder="e.g. Headache, Dizziness, Fatigue"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Doctor's Clinical Diagnosis *</label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="e.g. Stage 1 Essential Hypertension with Dyslipidemia risk"
                className="w-full p-2.5 rounded-xl border border-sky-300 focus:ring-2 focus:ring-sky-500 outline-none font-bold text-slate-900 bg-sky-50/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Observations</label>
                <textarea
                  rows={2}
                  value={clinicalObservations}
                  onChange={e => setClinicalObservations(e.target.value)}
                  placeholder="e.g. S1 S2 normal, chest clear, no pedal edema..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Treatment Plan & Advice</label>
                <textarea
                  rows={2}
                  value={treatmentPlan}
                  onChange={e => setTreatmentPlan(e.target.value)}
                  placeholder="e.g. Low sodium DASH diet, 30 min daily walking, medication adherence..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Next Follow-Up Date (Optional)</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
                className="w-full sm:w-60 p-2 rounded-xl border border-slate-200 outline-none text-xs"
              />
            </div>
          </div>

          {/* Pharmacotherapy Prescription Builder */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif italic font-black text-sky-800">℞</span>
                <h3 className="font-bold text-sm text-slate-900">Prescription Medications</h3>
              </div>
              <button
                type="button"
                onClick={addPrescriptionRow}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {prescriptionItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-5">
                      <select
                        value={item.medicineId}
                        onChange={e => updatePrescriptionItem(idx, 'medicineId', e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 text-xs"
                      >
                        <option value="">-- Choose Medicine from Pharmacy --</option>
                        {medicines.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.genericName}) — Stock: {m.currentStock}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 500mg)"
                        value={item.dosage}
                        onChange={e => updatePrescriptionItem(idx, 'dosage', e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Frequency (1-0-1)"
                        value={item.frequency}
                        onChange={e => updatePrescriptionItem(idx, 'frequency', e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                    </div>
                    <div className="sm:col-span-1 text-right">
                      {prescriptionItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrescriptionRow(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <input
                      type="text"
                      placeholder="Duration (e.g. 5 days / 30 days)"
                      value={item.duration}
                      onChange={e => updatePrescriptionItem(idx, 'duration', e.target.value)}
                      className="p-2 rounded-xl border border-slate-200 bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Quantity (e.g. 10)"
                      value={item.quantity}
                      onChange={e => updatePrescriptionItem(idx, 'quantity', parseInt(e.target.value || '1', 10))}
                      className="p-2 rounded-xl border border-slate-200 bg-white font-mono font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Food instructions (e.g. After food)"
                      value={item.instructions}
                      onChange={e => updatePrescriptionItem(idx, 'instructions', e.target.value)}
                      className="p-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Lab Tests Request */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-indigo-600" /> Order Diagnostic Pathology / Lab Tests
              </h3>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-semibold">Priority:</span>
                <select
                  value={labPriority}
                  onChange={e => setLabPriority(e.target.value as any)}
                  className="p-1.5 rounded-lg border border-slate-200 text-xs font-bold text-indigo-900"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgent</option>
                  <option value="STAT">STAT (Critical)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {labTests.map(t => {
                const isSelected = selectedLabTestIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition ${
                      isSelected ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleLabTest(t.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{t.name}</span>
                    </div>
                    <span className="font-mono text-slate-500 font-semibold">₹{t.price}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm text-white">Save & Finalize Clinical Consultation</p>
              <p className="text-[11px] text-slate-400">
                Dispatches prescription to pharmacy, orders tests to lab, updates EHR timeline, and bills consultation.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold rounded-2xl shadow-lg transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {isSaving ? 'Processing Workflow...' : 'Save & Complete Consultation'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
