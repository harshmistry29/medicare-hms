import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  Plus, 
  Search, 
  Clock, 
  Activity, 
  ShieldAlert, 
  UserPlus, 
  Stethoscope, 
  CheckCircle2, 
  ArrowRightCircle, 
  PhoneCall,
  Flame,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { EmergencyCase, Doctor, Patient } from '../../types';
import EmergencyTriageModal from '../../components/forms/EmergencyTriageModal';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const EmergencyTriagePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const [isTriageModalOpen, setIsTriageModalOpen] = useState<boolean>(false);
  const [selectedCase, setSelectedCase] = useState<EmergencyCase | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>('IN_TREATMENT');
  const [treatmentNotes, setTreatmentNotes] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [emRes, docRes, patRes] = await Promise.all([
        api.get('/emergency'),
        api.get('/doctors'),
        api.get('/patients')
      ]);

      if (emRes.data.success) setEmergencyCases(emRes.data.data);
      if (docRes.data.success) setDoctors(docRes.data.data);
      if (patRes.data.success) setPatients(patRes.data.data);
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to load emergency triage queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh emergency triage queue every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      const res = await api.put(`/emergency/${selectedCase._id}/status`, {
        status: newStatus,
        treatmentNotes
      });

      if (res.data.success) {
        addToast('Emergency case updated successfully', 'success');
        setIsStatusModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update emergency case', 'error');
    }
  };

  const handlePriorityUpgrade = async (caseId: string, priority: 'CRITICAL' | 'URGENT' | 'NORMAL') => {
    try {
      const res = await api.put(`/emergency/${caseId}/priority`, { priority });
      if (res.data.success) {
        addToast(`Triage priority updated to ${priority}`, 'info');
        fetchData();
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to change triage priority', 'error');
    }
  };

  // Sort queue by priority: CRITICAL first, then URGENT, then NORMAL, then by arrival time
  const priorityOrder: { [key: string]: number } = { CRITICAL: 1, URGENT: 2, NORMAL: 3 };

  const filteredCases = emergencyCases
    .filter(c => {
      const name = c.patientName || (typeof c.patientId === 'object' && c.patientId ? `${c.patientId.firstName} ${c.patientId.lastName}` : '');
      const code = c.caseCode || '';
      const complaint = c.chiefComplaint || '';
      const matchesSearch = 
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = priorityFilter === 'ALL' || c.triagePriority === priorityFilter;
      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      const pDiff = (priorityOrder[a.triagePriority] || 99) - (priorityOrder[b.triagePriority] || 99);
      if (pDiff !== 0) return pDiff;
      return new Date(b.arrivalTime).getTime() - new Date(a.arrivalTime).getTime();
    });

  const criticalCount = emergencyCases.filter(c => c.triagePriority === 'CRITICAL' && c.status !== 'DISCHARGED').length;
  const urgentCount = emergencyCases.filter(c => c.triagePriority === 'URGENT' && c.status !== 'DISCHARGED').length;
  const activeCount = emergencyCases.filter(c => !['DISCHARGED', 'TRANSFERRED'].includes(c.status)).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <AlertOctagon className="w-7 h-7 text-rose-600 animate-pulse" />
              Emergency & Trauma Triage Unit
            </h1>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full uppercase tracking-wider animate-pulse">
              LIVE TRIAGE
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Real-time emergency admission queue sorted by clinical severity (Critical ➔ Urgent ➔ Non-Urgent)
          </p>
        </div>

        <button
          onClick={() => setIsTriageModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-lg shadow-sm shadow-rose-200 transition"
        >
          <UserPlus className="w-4 h-4" />
          Quick Emergency Intake
        </button>
      </div>

      {/* Emergency Alert Banner if Critical */}
      {criticalCount > 0 && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl flex items-center justify-between text-rose-800 shadow-sm">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-rose-600 animate-bounce" />
            <div>
              <div className="font-bold text-sm">
                CRITICAL ALERT: {criticalCount} Patient{criticalCount > 1 ? 's' : ''} Require Immediate Resuscitation / Trauma Care
              </div>
              <div className="text-xs text-rose-700">
                Crash cart, Emergency Physicians, and OT on standby.
              </div>
            </div>
          </div>
          <span className="text-xs font-bold bg-rose-600 text-white px-2.5 py-1 rounded-full uppercase">
            Code Red
          </span>
        </div>
      )}

      {/* Quick KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-600">{criticalCount}</div>
            <div className="text-xs text-slate-500 font-medium">Critical (Immediate)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{urgentCount}</div>
            <div className="text-xs text-slate-500 font-medium">Urgent (Within 15m)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-teal-600">{activeCount}</div>
            <div className="text-xs text-slate-500 font-medium">Active In Emergency</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{doctors.length}</div>
            <div className="text-xs text-slate-500 font-medium">Duty Doctors On Call</div>
          </div>
        </div>
      </div>

      {/* Triage Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Emergency Cases by Name, Code, or Symptoms..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['ALL', 'CRITICAL', 'URGENT', 'NORMAL'].map(pri => (
            <button
              key={pri}
              onClick={() => setPriorityFilter(pri)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition whitespace-nowrap ${
                priorityFilter === pri
                  ? pri === 'CRITICAL' ? 'bg-rose-600 text-white' : pri === 'URGENT' ? 'bg-amber-600 text-white' : 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pri}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Triage Cards / Queue */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredCases.length === 0 ? (
        <EmptyState
          title="No Active Emergency Cases"
          description="The ER triage queue is currently clear. Use 'Quick Emergency Intake' to register an incoming patient."
          icon={AlertOctagon}
          actionLabel="Register Emergency Patient"
          onAction={() => setIsTriageModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCases.map((ec) => {
            const isCritical = ec.triagePriority === 'CRITICAL';
            const isUrgent = ec.triagePriority === 'URGENT';
            const patient = typeof ec.patientId === 'object' && ec.patientId ? ec.patientId : null;
            const doctor = typeof ec.attendingDoctorId === 'object' && ec.attendingDoctorId ? ec.attendingDoctorId : null;

            return (
              <div 
                key={ec._id} 
                className={`bg-white rounded-xl border-2 transition shadow-sm overflow-hidden flex flex-col justify-between ${
                  isCritical 
                    ? 'border-rose-400 ring-2 ring-rose-200' 
                    : isUrgent 
                    ? 'border-amber-300' 
                    : 'border-slate-200'
                }`}
              >
                {/* Header Banner */}
                <div className={`p-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
                  isCritical 
                    ? 'bg-rose-600 text-white' 
                    : isUrgent 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-teal-600 text-white'
                }`}>
                  <div className="flex items-center gap-2">
                    {isCritical ? <Flame className="w-4 h-4 animate-bounce" /> : <Activity className="w-4 h-4" />}
                    <span>{ec.triagePriority} PRIORITY</span>
                  </div>
                  <span className="font-mono bg-black/20 px-2 py-0.5 rounded">
                    {ec.caseCode || 'EMG-CASE'}
                  </span>
                </div>

                {/* Patient Body */}
                <div className="p-4 space-y-3 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">
                        {ec.patientName || (patient ? `${patient.firstName} ${patient.lastName}` : 'Unidentified Patient')}
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{ec.age ? `${ec.age} yrs` : (patient ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} yrs` : '')}</span>
                        <span>•</span>
                        <span className="capitalize">{ec.gender || patient?.gender || 'Unknown'}</span>
                        <span>•</span>
                        <span className="font-semibold text-rose-600">{patient?.bloodGroup || 'Blood Type Pending'}</span>
                      </div>
                    </div>
                    <Badge variant={
                      ec.status === 'UNDER_TRIAGE' ? 'warning' :
                      ec.status === 'IN_TREATMENT' ? 'info' :
                      ec.status === 'STABILIZED' ? 'success' : 'default'
                    }>
                      {ec.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                    <div className="text-slate-400 font-semibold mb-0.5">CHIEF COMPLAINT</div>
                    <div className="font-medium text-slate-800">{ec.chiefComplaint}</div>
                    {ec.emergencyType && (
                      <div className="text-slate-500 mt-1">Type: <span className="font-semibold">{ec.emergencyType}</span></div>
                    )}
                  </div>

                  {/* Vitals Snapshot */}
                  {ec.vitals && (
                    <div className="grid grid-cols-4 gap-1.5 text-center bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px]">
                      <div>
                        <div className="text-slate-400">BP</div>
                        <div className="font-bold text-slate-700">{ec.vitals.bloodPressure || '--'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Pulse</div>
                        <div className="font-bold text-slate-700">{ec.vitals.heartRate ? `${ec.vitals.heartRate} bpm` : '--'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Temp</div>
                        <div className="font-bold text-slate-700">{ec.vitals.temperature ? `${ec.vitals.temperature}°F` : '--'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">SpO2</div>
                        <div className="font-bold text-slate-700">{ec.vitals.spo2 ? `${ec.vitals.spo2}%` : '--'}</div>
                      </div>
                    </div>
                  )}

                  {/* Attending Doctor */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doctor ? doctor.name : (ec.assignedDoctorName || 'Duty Resident')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(ec.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* Priority Adjustment buttons */}
                    {ec.triagePriority !== 'CRITICAL' && (
                      <button
                        onClick={() => handlePriorityUpgrade(ec._id, 'CRITICAL')}
                        title="Escalate to CRITICAL"
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded text-xs font-bold"
                      >
                        🔴 Escalate
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCase(ec);
                      setNewStatus(ec.status);
                      setTreatmentNotes(ec.notes || '');
                      setIsStatusModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                  >
                    <span>Update Case</span>
                    <ArrowRightCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Intake Modal */}
      <EmergencyTriageModal
        isOpen={isTriageModalOpen}
        onClose={() => setIsTriageModalOpen(false)}
        onSuccess={() => {
          setIsTriageModalOpen(false);
          fetchData();
        }}
        doctors={doctors}
        patients={patients}
      />

      {/* Case Status & Treatment Notes Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Update Emergency Case — ${selectedCase?.patientName || 'Patient'}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ER Stage / Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500"
            >
              <option value="ARRIVED">Arrived / Triage Queue</option>
              <option value="UNDER_TRIAGE">Under Triage Assessment</option>
              <option value="IN_TREATMENT">Active In Resuscitation / Treatment</option>
              <option value="STABILIZED">Patient Stabilized</option>
              <option value="TRANSFERRED_TO_IPD">Admit & Transfer to IPD / ICU</option>
              <option value="DISCHARGED">Discharged from Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physician Treatment & Interventions Log
            </label>
            <textarea
              rows={4}
              value={treatmentNotes}
              onChange={(e) => setTreatmentNotes(e.target.value)}
              placeholder="Administered IV fluids, Defibrillation, Oxygen inhalation, Wound suturing..."
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              Save Emergency Updates
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmergencyTriagePage;
