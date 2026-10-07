import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  UserCheck, 
  Calendar, 
  Clock, 
  FileText, 
  Printer, 
  ChevronRight,
  Activity,
  HeartPulse,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Admission, Patient, Bed, Doctor } from '../../types';
import AdmissionModal from '../../components/forms/AdmissionModal';
import PrintableDischargeSummary from '../../components/printable/PrintableDischargeSummary';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const InpatientListPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState<boolean>(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState<boolean>(false);
  const [isPrintSummaryOpen, setIsPrintSummaryOpen] = useState<boolean>(false);
  const [isNursingNotesModalOpen, setIsNursingNotesModalOpen] = useState<boolean>(false);

  // Nursing note form state
  const [nursingNote, setNursingNote] = useState({
    note: '',
    bloodPressure: '120/80',
    heartRate: '72',
    temperature: '98.6',
    spo2: '99'
  });

  // Discharge summary form state
  const [dischargeForm, setDischargeForm] = useState({
    diagnosis: '',
    treatmentGiven: '',
    conditionAtDischarge: 'Stable and recovered',
    followUpInstructions: 'Follow-up consultation after 7 days with routine BP log.',
    medicinesAdvised: 'Tab. Paracetamol 500mg SOS, Tab. Pantoprazole 40mg OD before breakfast'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [admRes, patRes, bedRes, docRes] = await Promise.all([
        api.get('/admissions'),
        api.get('/patients'),
        api.get('/beds'),
        api.get('/doctors')
      ]);

      if (admRes.data.success) setAdmissions(admRes.data.data);
      if (patRes.data.success) setPatients(patRes.data.data);
      if (bedRes.data.success) setBeds(bedRes.data.data);
      if (docRes.data.success) setDoctors(docRes.data.data);
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to load admissions data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddNursingNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission || !nursingNote.note) return;

    try {
      const res = await api.post(`/admissions/${selectedAdmission._id}/notes`, {
        note: nursingNote.note,
        vitals: {
          bloodPressure: nursingNote.bloodPressure,
          heartRate: Number(nursingNote.heartRate),
          temperature: Number(nursingNote.temperature),
          spo2: Number(nursingNote.spo2)
        }
      });

      if (res.data.success) {
        addToast('Nursing progress note recorded', 'success');
        setIsNursingNotesModalOpen(false);
        setNursingNote({
          note: '',
          bloodPressure: '120/80',
          heartRate: '72',
          temperature: '98.6',
          spo2: '99'
        });
        fetchData();
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to add progress note', 'error');
    }
  };

  const handleDischargePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    try {
      const res = await api.post(`/admissions/${selectedAdmission._id}/discharge`, {
        dischargeDate: new Date().toISOString().split('T')[0],
        dischargeSummary: dischargeForm
      });

      if (res.data.success) {
        addToast('Patient successfully discharged and bed released', 'success');
        setIsDischargeModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to complete discharge', 'error');
    }
  };

  const filteredAdmissions = admissions.filter(adm => {
    const patName = typeof adm.patientId === 'object' ? `${adm.patientId.firstName} ${adm.patientId.lastName}` : '';
    const patId = typeof adm.patientId === 'object' ? adm.patientId.patientId : '';
    const admId = adm.admissionId || '';
    
    const matchesSearch = 
      patName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || adm.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-teal-600" />
            Inpatient (IPD) Admissions
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage hospital admissions, inpatient bed tracking, nursing observations, and discharge summaries
          </p>
        </div>

        {['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'].includes(user?.role || '') && (
          <button
            onClick={() => setIsAdmissionModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            New Admission
          </button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {admissions.filter(a => a.status === 'ADMITTED').length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Currently Admitted</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {admissions.filter(a => a.status === 'DISCHARGED').length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Total Discharged</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {admissions.filter(a => a.status === 'PLANNED').length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Planned Admissions</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Patient Name, ID, or Admission #..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {['ALL', 'ADMITTED', 'DISCHARGED', 'PLANNED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === status 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Inpatient Admissions */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredAdmissions.length === 0 ? (
        <EmptyState
          title="No Inpatient Records Found"
          description="There are currently no hospital admissions matching your search criteria."
          icon={Building2}
          actionLabel="Admit a Patient"
          onAction={() => setIsAdmissionModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Admission ID</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Attending Doctor</th>
                  <th className="py-3.5 px-4">Room / Bed</th>
                  <th className="py-3.5 px-4">Admitted On</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredAdmissions.map((adm) => {
                  const patient = typeof adm.patientId === 'object' ? adm.patientId : null;
                  const doctor = typeof adm.doctorId === 'object' ? adm.doctorId : null;
                  const bed = typeof adm.bedId === 'object' ? adm.bedId : null;
                  const room = bed && typeof bed.roomId === 'object' ? bed.roomId : null;

                  return (
                    <tr key={adm._id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-teal-600">
                        {adm.admissionId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {patient?.patientId} • {patient?.gender}, {patient?.bloodGroup}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-medium">{doctor?.name || 'Dr. Assigned'}</div>
                        <div className="text-xs text-slate-400">{doctor?.specialization}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {bed ? `Bed ${bed.bedNumber}` : 'Bed Assigned'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {room ? `Room ${room.roomNumber} (${room.type})` : 'Ward'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(adm.admissionDate).toLocaleDateString('en-IN')}
                        </div>
                        <div className="text-xs text-slate-400">
                          Reason: {adm.reasonForAdmission}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={adm.status === 'ADMITTED' ? 'error' : adm.status === 'DISCHARGED' ? 'success' : 'warning'}>
                          {adm.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {adm.status === 'ADMITTED' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedAdmission(adm);
                                  setIsNursingNotesModalOpen(true);
                                }}
                                title="Add Nursing Note & Vitals"
                                className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition"
                              >
                                <Activity className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAdmission(adm);
                                  setDischargeForm({
                                    diagnosis: adm.initialDiagnosis || '',
                                    treatmentGiven: 'Supportive therapy, continuous vitals monitoring, medication administered as prescribed.',
                                    conditionAtDischarge: 'Stable, ambulatory and afebrile.',
                                    followUpInstructions: 'Review with OPD in 7 days. Maintain low sodium diet and take prescribed medication.',
                                    medicinesAdvised: 'Tab. Paracetamol 500mg SOS, Tab. Pantoprazole 40mg OD'
                                  });
                                  setIsDischargeModalOpen(true);
                                }}
                                title="Process Discharge"
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-md shadow-sm transition"
                              >
                                Discharge
                              </button>
                            </>
                          )}

                          {adm.status === 'DISCHARGED' && (
                            <button
                              onClick={() => {
                                setSelectedAdmission(adm);
                                setIsPrintSummaryOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Summary
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admission Booking Modal */}
      <AdmissionModal
        isOpen={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
        onSuccess={() => {
          setIsAdmissionModalOpen(false);
          fetchData();
        }}
        patients={patients}
        doctors={doctors}
        availableBeds={beds.filter(b => b.status === 'AVAILABLE')}
      />

      {/* Nursing Progress Note Modal */}
      <Modal
        isOpen={isNursingNotesModalOpen}
        onClose={() => setIsNursingNotesModalOpen(false)}
        title="Record Nursing Progress Note & Vitals"
      >
        <form onSubmit={handleAddNursingNote} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">BP (mmHg)</label>
              <input
                type="text"
                value={nursingNote.bloodPressure}
                onChange={(e) => setNursingNote({ ...nursingNote, bloodPressure: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500"
                placeholder="120/80"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pulse (bpm)</label>
              <input
                type="number"
                value={nursingNote.heartRate}
                onChange={(e) => setNursingNote({ ...nursingNote, heartRate: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500"
                placeholder="72"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Temp (°F)</label>
              <input
                type="number"
                step="0.1"
                value={nursingNote.temperature}
                onChange={(e) => setNursingNote({ ...nursingNote, temperature: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500"
                placeholder="98.6"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">SpO2 (%)</label>
              <input
                type="number"
                value={nursingNote.spo2}
                onChange={(e) => setNursingNote({ ...nursingNote, spo2: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500"
                placeholder="99"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Clinical Progress Observation & Medication Log *
            </label>
            <textarea
              required
              rows={4}
              value={nursingNote.note}
              onChange={(e) => setNursingNote({ ...nursingNote, note: e.target.value })}
              placeholder="Record patient complaints, IV fluids administered, doctor rounds instructions..."
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNursingNotesModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg shadow-sm"
            >
              Save Note
            </button>
          </div>
        </form>
      </Modal>

      {/* Discharge Summary Form Modal */}
      <Modal
        isOpen={isDischargeModalOpen}
        onClose={() => setIsDischargeModalOpen(false)}
        title="Complete Inpatient Discharge & Bed Release"
      >
        <form onSubmit={handleDischargePatient} className="space-y-4">
          <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Discharging will mark bed as available and generate formal discharge documentation.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Final Clinical Diagnosis</label>
            <input
              type="text"
              required
              value={dischargeForm.diagnosis}
              onChange={(e) => setDischargeForm({ ...dischargeForm, diagnosis: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Summary of Treatment Given</label>
            <textarea
              rows={2}
              required
              value={dischargeForm.treatmentGiven}
              onChange={(e) => setDischargeForm({ ...dischargeForm, treatmentGiven: e.target.value })}
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Condition at Discharge</label>
            <input
              type="text"
              required
              value={dischargeForm.conditionAtDischarge}
              onChange={(e) => setDischargeForm({ ...dischargeForm, conditionAtDischarge: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Discharge Medications Advised</label>
            <textarea
              rows={2}
              required
              value={dischargeForm.medicinesAdvised}
              onChange={(e) => setDischargeForm({ ...dischargeForm, medicinesAdvised: e.target.value })}
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Instructions & Dietary Advice</label>
            <textarea
              rows={2}
              required
              value={dischargeForm.followUpInstructions}
              onChange={(e) => setDischargeForm({ ...dischargeForm, followUpInstructions: e.target.value })}
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDischargeModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              Confirm Discharge
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Discharge Summary */}
      {selectedAdmission && (
        <PrintableDischargeSummary
          isOpen={isPrintSummaryOpen}
          onClose={() => setIsPrintSummaryOpen(false)}
          admission={selectedAdmission}
        />
      )}
    </div>
  );
};

export default InpatientListPage;
