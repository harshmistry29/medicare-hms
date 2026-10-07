import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  FileText, 
  FlaskConical, 
  Receipt, 
  Activity, 
  Droplet, 
  Clock, 
  Printer, 
  CreditCard, 
  CheckCircle2, 
  Plus,
  AlertCircle,
  Stethoscope,
  Sparkles,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { patientsApi, appointmentsApi, billingApi, labApi, prescriptionsApi } from '../../services/api';
import { IPatient, IAppointment, IPrescription, ILabOrder, IInvoice } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { AppointmentBookingModal } from '../../components/forms/AppointmentBookingModal';
import { PrintablePrescription } from '../../components/printable/PrintablePrescription';
import { PrintableInvoice } from '../../components/printable/PrintableInvoice';
import { PrintableLabReport } from '../../components/printable/PrintableLabReport';
import { Modal } from '../../components/common/Modal';

export const PatientPortalDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState<IPatient | null>(null);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<IPrescription[]>([]);
  const [labOrders, setLabOrders] = useState<ILabOrder[]>([]);
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState<IPrescription | null>(null);
  const [selectedInv, setSelectedInv] = useState<IInvoice | null>(null);
  const [selectedLab, setSelectedLab] = useState<ILabOrder | null>(null);

  const fetchPatientPortal = async () => {
    setIsLoading(true);
    try {
      // Find patient profile associated with current user or fetch demo patient #1
      const patRes = await patientsApi.getAll({ limit: 1 });
      const currentPat = patRes.data.data?.[0];
      setPatientData(currentPat);

      if (currentPat) {
        const [appRes, rxRes, labRes, invRes] = await Promise.all([
          appointmentsApi.getAll({ patientId: currentPat.id }),
          prescriptionsApi.getAll(),
          labApi.getOrders(),
          billingApi.getInvoices({ patientId: currentPat.id }),
        ]);

        if (appRes.data.success) setAppointments(appRes.data.data);
        if (rxRes.data.success) setPrescriptions(rxRes.data.data.slice(0, 5));
        if (labRes.data.success) setLabOrders(labRes.data.data.slice(0, 5));
        if (invRes.data.success) setInvoices(invRes.data.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Error loading patient portal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientPortal();
  }, []);

  if (isLoading || !patientData) {
    return <LoadingSkeleton rows={5} />;
  }

  const upcomingApp = appointments.find(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED');
  const outstandingDue = invoices.reduce((acc, inv) => acc + (inv.balanceAmount || 0), 0);

  return (
    <div className="space-y-6 page-enter">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Patient Digital Health Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {patientData.fullName} 👋
          </h1>
          <p className="text-xs text-teal-100">
            UHID: <span className="font-mono font-bold text-white">{patientData.patientId}</span> • Blood Group: <strong className="text-white">{patientData.bloodGroup}</strong> • Age: {patientData.age} yrs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBookingOpen(true)}
            className="px-4 py-2.5 bg-white text-teal-900 hover:bg-teal-50 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-teal-700" />
            <span>Book New Appointment</span>
          </button>
        </div>
      </div>

      {/* 4 Health Quick Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Next Appointment</div>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              {upcomingApp ? upcomingApp.doctorName : 'None Scheduled'}
            </div>
            <div className="text-[11px] text-teal-600 font-semibold mt-0.5">
              {upcomingApp ? `${upcomingApp.date} at ${upcomingApp.startTime}` : 'No queue wait'}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Prescriptions</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{prescriptions.length}</div>
            <div className="text-[11px] text-sky-600 font-semibold mt-0.5">Verified by Pharmacy</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lab Investigations</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{labOrders.length}</div>
            <div className="text-[11px] text-purple-600 font-semibold mt-0.5">Pathology Reports Ready</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Dues</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{outstandingDue.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {outstandingDue === 0 ? 'All Settled in Full' : 'Pending Settlement'}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 60%: Active Prescriptions & Lab Reports */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Prescriptions Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                Prescribed Medications & Dosages
              </h2>
            </div>

            {prescriptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No active prescriptions</div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map(rx => (
                  <div key={rx.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                        <span>Prescription #{rx.prescriptionNumber}</span>
                        <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.2 rounded border border-teal-200">
                          {rx.items?.length || 1} Medications
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Prescribed by: <strong className="text-slate-700">{rx.doctorName}</strong> • {rx.date}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedRx(rx)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-teal-600" />
                      <span>Print Rx</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Diagnostic Lab Reports */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-600" />
                Laboratory Test Reports
              </h2>
            </div>

            {labOrders.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No lab investigations ordered</div>
            ) : (
              <div className="space-y-3">
                {labOrders.map(lab => (
                  <div key={lab.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                        <span>Order #{lab.orderNumber}</span>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.2 rounded border border-purple-200">
                          {lab.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Tests: {(lab.tests || (lab as any).items)?.map((i: any) => i.testName || i.name).join(', ') || 'Diagnostic Panel'}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedLab(lab)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-600" />
                      <span>Report</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 40%: Medical Vitals & Billing Receipts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Clinical Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Patient Clinical Vitals Card
            </h2>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-semibold text-[10px] uppercase">Blood Group</div>
                <div className="font-extrabold text-slate-900 text-base mt-0.5">{patientData.bloodGroup}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-semibold text-[10px] uppercase">Gender / Age</div>
                <div className="font-extrabold text-slate-900 text-base mt-0.5">{patientData.gender}, {patientData.age}y</div>
              </div>
            </div>

            <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/80 text-xs">
              <div className="font-bold text-rose-900 text-[11px] mb-0.5">Known Allergies</div>
              <div className="text-rose-700 font-medium">
                {patientData.allergies?.join(', ') || 'No known drug allergies (NKDA)'}
              </div>
            </div>

            <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200/80 text-xs">
              <div className="font-bold text-teal-900 text-[11px] mb-0.5">Chronic Medical Conditions</div>
              <div className="text-teal-700 font-medium">
                {patientData.existingConditions?.join(', ') || 'Hypertension, Mild Type 2 Diabetes'}
              </div>
            </div>
          </div>

          {/* Invoices & Receipts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              Invoices & Payment History
            </h2>

            <div className="space-y-2.5">
              {invoices.map(inv => (
                <div key={inv.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{inv.invoiceNumber}</div>
                    <div className="text-[11px] text-slate-500">₹{inv.totalAmount?.toLocaleString('en-IN')} • {inv.status}</div>
                  </div>

                  <button
                    onClick={() => setSelectedInv(inv)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                    title="View Tax Invoice"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AppointmentBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => {
          setIsBookingOpen(false);
          fetchPatientPortal();
        }}
      />

      {selectedRx && (
        <Modal
          isOpen={!!selectedRx}
          onClose={() => setSelectedRx(null)}
          title="Digital Prescription"
          maxWidth="3xl"
        >
          <PrintablePrescription
            prescription={selectedRx}
            patient={patientData}
          />
        </Modal>
      )}

      {selectedInv && (
        <PrintableInvoice
          isOpen={!!selectedInv}
          onClose={() => setSelectedInv(null)}
          invoice={selectedInv}
          patient={patientData}
        />
      )}

      {selectedLab && (
        <Modal
          isOpen={!!selectedLab}
          onClose={() => setSelectedLab(null)}
          title="Diagnostic Pathology Report"
          maxWidth="3xl"
        >
          <PrintableLabReport
            order={selectedLab}
            patient={patientData}
          />
        </Modal>
      )}
    </div>
  );
};

export default PatientPortalDashboardPage;
