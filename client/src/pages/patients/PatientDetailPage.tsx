import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ClipboardList,
  FileText,
  FlaskConical,
  Hotel,
  CreditCard,
  History,
  Shield,
  AlertTriangle,
  Droplet,
  Edit,
  ArrowLeft,
  Printer,
  Sparkles,
  Bot,
} from 'lucide-react';
import { patientsApi, aiApi } from '../../services/api';
import { IPatient, IAppointment, IConsultation, IPrescription, ILabOrder, IAdmission, IInvoice } from '../../types';
import { StatusBadge, Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { PatientFormModal } from '../../components/forms/PatientFormModal';
import { PrintablePrescription } from '../../components/printable/PrintablePrescription';
import { PrintableInvoice } from '../../components/printable/PrintableInvoice';
import { PrintableLabReport } from '../../components/printable/PrintableLabReport';
import { PrintableDischargeSummary } from '../../components/printable/PrintableDischargeSummary';
import { Modal } from '../../components/common/Modal';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'consultations' | 'appointments' | 'prescriptions' | 'lab' | 'admissions' | 'billing'>('timeline');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Printable Modals state
  const [selectedRx, setSelectedRx] = useState<IPrescription | null>(null);
  const [selectedInv, setSelectedInv] = useState<IInvoice | null>(null);
  const [selectedLab, setSelectedLab] = useState<ILabOrder | null>(null);
  const [selectedAdm, setSelectedAdm] = useState<IAdmission | null>(null);

  const fetchPatientData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        patientsApi.getById(id),
        patientsApi.getTimeline(id),
      ]);
      if (pRes.data.success) setPatient(pRes.data.data);
      if (tRes.data.success) setTimeline(tRes.data.data);
    } catch (err) {
      console.error('Error loading patient detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const handleGenerateAiSummary = async () => {
    if (!id) return;
    setIsGeneratingAi(true);
    try {
      const res = await aiApi.getClinicalSummary(id);
      if (res.data.success) {
        setAiSummary(res.data.data);
      }
    } catch (err) {
      console.error('AI Summary failed:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (isLoading || !patient) {
    return <LoadingSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/patients')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Patient Directory
      </button>

      {/* Patient Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {patient.firstName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{patient.fullName}</h1>
                <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                  {patient.patientId}
                </span>
                <StatusBadge status={patient.status} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span>Age: <strong className="text-slate-800">{patient.age} yrs</strong></span>
                <span>Gender: <strong className="text-slate-800 capitalize">{patient.gender.toLowerCase()}</strong></span>
                <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <Droplet className="w-3 h-3" /> {patient.bloodGroup}
                </span>
                <span>Phone: <strong className="text-slate-800">{patient.phone}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={handleGenerateAiSummary}
              disabled={isGeneratingAi}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
            >
              <Bot className="w-4 h-4" />
              {isGeneratingAi ? 'Analyzing Clinical Timeline...' : 'AI Clinical Summary'}
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition"
            >
              <Edit className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        </div>

        {/* Clinical Flags Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/80">
            <p className="font-bold text-rose-900 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600" /> Drug & Food Allergies
            </p>
            {patient.allergies?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {patient.allergies.map((a: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded text-[10px]">
                    {a}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">No known drug allergies reported.</p>
            )}
          </div>

          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80">
            <p className="font-bold text-amber-900 text-[10px] uppercase tracking-wider mb-1">Existing Conditions</p>
            {patient.existingConditions?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {patient.existingConditions.map((c: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold rounded text-[10px]">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">None documented.</p>
            )}
          </div>

          <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200/80">
            <p className="font-bold text-sky-900 text-[10px] uppercase tracking-wider mb-1">Insurance & Emergency</p>
            <p className="text-slate-700 font-medium">
              {patient.insuranceProvider || 'Self-Pay'} {patient.insurancePolicyNumber && `(${patient.insurancePolicyNumber})`}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Emergency: {patient.emergencyContactName} ({patient.emergencyContactPhone})
            </p>
          </div>
        </div>
      </div>

      {/* AI Clinical Summary Banner if Generated */}
      {aiSummary && (
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 border border-purple-800/60 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400 animate-spin" />
              <h3 className="text-base font-bold text-white tracking-tight">AI Clinical Assistive Summary</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
              Generated in real-time
            </span>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-4 border border-purple-900/50 text-xs text-slate-200 whitespace-pre-line leading-relaxed">
            {aiSummary.clinicalSummaryText}
          </div>

          <p className="text-[10px] text-purple-300/80 italic">{aiSummary.disclaimer}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {[
          { id: 'timeline', label: 'Medical Timeline', icon: History, count: timeline.length },
          { id: 'appointments', label: 'Appointments', icon: Calendar, count: patient.appointments?.length },
          { id: 'consultations', label: 'Consultations', icon: ClipboardList, count: patient.consultations?.length },
          { id: 'prescriptions', label: 'Prescriptions', icon: FileText, count: patient.prescriptions?.length },
          { id: 'lab', label: 'Lab Reports', icon: FlaskConical, count: patient.labOrders?.length },
          { id: 'admissions', label: 'Inpatient Stay', icon: Hotel, count: patient.admissions?.length },
          { id: 'billing', label: 'Invoices & Bills', icon: CreditCard, count: patient.invoices?.length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. Medical Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-900">Interactive Medical History Timeline</h3>
            <p className="text-xs text-slate-500">Chronological aggregated records of consultations, lab tests, prescriptions, admissions, and payments</p>
          </div>

          {timeline.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No medical timeline events recorded yet.</div>
          ) : (
            <div className="relative pl-6 sm:pl-8 border-l-2 border-sky-100 space-y-8 my-4">
              {timeline.map((event: any) => (
                <div key={event.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full bg-white border-2 border-sky-600 flex items-center justify-center shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-sky-600" />
                  </div>

                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 hover:shadow-md transition">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded-full">
                        {event.badge}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{new Date(event.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                    {event.doctorName && (
                      <p className="text-xs text-sky-700 font-semibold mt-0.5">{event.doctorName}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-1">{event.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 2. Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <h3 className="text-base font-bold text-slate-900 mb-4">Appointment Schedule History</h3>
          <div className="divide-y divide-slate-100">
            {patient.appointments?.map((a: IAppointment) => (
              <div key={a.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-900">
                    {a.date} at {a.startTime} — {a.doctorName}
                  </p>
                  <p className="text-[11px] text-slate-500">{a.departmentName} • {a.reason}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. Consultations */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          {patient.consultations?.map((c: IConsultation) => (
            <div key={c.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card space-y-3 text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{c.consultationNumber} — {c.doctorName}</p>
                  <p className="text-slate-500">{c.date} • {c.departmentName}</p>
                </div>
                <Badge variant="success">Completed</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-slate-500">Chief Complaint:</span>
                  <p className="text-slate-800 mt-0.5">{c.chiefComplaint}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Clinical Diagnosis:</span>
                  <p className="text-sky-900 font-bold mt-0.5">{c.diagnosis}</p>
                </div>
              </div>
              {c.vitals && (
                <div className="p-2.5 bg-slate-50 rounded-xl flex flex-wrap gap-4 text-[11px] font-mono">
                  <span>BP: <strong>{c.vitals.bloodPressureSystolic}/{c.vitals.bloodPressureDiastolic}</strong></span>
                  <span>HR: <strong>{c.vitals.heartRate} bpm</strong></span>
                  <span>SpO2: <strong>{c.vitals.spO2}%</strong></span>
                  <span>BMI: <strong>{c.vitals.bmi}</strong></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: 4. Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {patient.prescriptions?.map((rx: IPrescription) => (
            <div key={rx.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">Prescription #{rx.prescriptionNumber}</p>
                <p className="text-slate-500">{rx.date} • By {rx.doctorName}</p>
                <p className="text-sky-800 font-medium mt-1">{rx.items.length} Medicines Prescribed</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={rx.status} />
                <button
                  onClick={() => setSelectedRx(rx)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl font-bold transition"
                >
                  <Printer className="w-3.5 h-3.5" /> View / Print
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: 5. Laboratory */}
      {activeTab === 'lab' && (
        <div className="space-y-4">
          {patient.labOrders?.map((lab: ILabOrder) => (
            <div key={lab.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">Lab Order #{lab.orderNumber}</p>
                <p className="text-slate-500">{lab.tests.map(t => t.testName).join(', ')}</p>
                <p className="text-indigo-700 font-medium mt-1">Priority: {lab.priority} • Total: ₹{lab.totalPrice}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={lab.status} />
                <button
                  onClick={() => setSelectedLab(lab)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold transition"
                >
                  <Printer className="w-3.5 h-3.5" /> View Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: 6. Admissions */}
      {activeTab === 'admissions' && (
        <div className="space-y-4">
          {patient.admissions?.map((adm: IAdmission) => (
            <div key={adm.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">Admission #{adm.admissionNumber} — Room {adm.roomNumber} (Bed {adm.bedNumber})</p>
                <p className="text-slate-500">Admitted: {new Date(adm.admissionDate).toLocaleDateString()} • Attending: {adm.doctorName}</p>
                <p className="text-teal-800 font-medium mt-1">Diagnosis: {adm.initialDiagnosis}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={adm.status} />
                {adm.dischargeSummary && (
                  <button
                    onClick={() => setSelectedAdm(adm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl font-bold transition"
                  >
                    <Printer className="w-3.5 h-3.5" /> Discharge Summary
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: 7. Invoices & Billing */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          {patient.invoices?.map((inv: IInvoice) => (
            <div key={inv.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">Invoice #{inv.invoiceNumber}</p>
                <p className="text-slate-500">Issued: {inv.issueDate} • Total: ₹{inv.totalAmount.toLocaleString('en-IN')}</p>
                <p className="text-rose-700 font-bold mt-1">
                  Paid: ₹{inv.paidAmount.toLocaleString('en-IN')} | Due: ₹{inv.balanceAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={inv.status} />
                <button
                  onClick={() => setSelectedInv(inv)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl font-bold transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Tax Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals for Printable Views */}
      {selectedRx && (
        <Modal isOpen={!!selectedRx} onClose={() => setSelectedRx(null)} title="Print Prescription" maxWidth="3xl">
          <PrintablePrescription prescription={selectedRx} patient={patient} />
        </Modal>
      )}

      {selectedInv && (
        <Modal isOpen={!!selectedInv} onClose={() => setSelectedInv(null)} title="Print Tax Invoice" maxWidth="3xl">
          <PrintableInvoice invoice={selectedInv} patient={patient} />
        </Modal>
      )}

      {selectedLab && (
        <Modal isOpen={!!selectedLab} onClose={() => setSelectedLab(null)} title="Diagnostic Report" maxWidth="3xl">
          <PrintableLabReport order={selectedLab} patient={patient} />
        </Modal>
      )}

      {selectedAdm && (
        <Modal isOpen={!!selectedAdm} onClose={() => setSelectedAdm(null)} title="Discharge Summary" maxWidth="3xl">
          <PrintableDischargeSummary admission={selectedAdm} patient={patient} />
        </Modal>
      )}

      {/* Edit Profile Modal */}
      <PatientFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        patient={patient}
        onSuccess={fetchPatientData}
      />
    </div>
  );
};
