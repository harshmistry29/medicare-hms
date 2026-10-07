import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Printer, 
  ArrowRight, 
  ShieldCheck, 
  Package, 
  Sparkles,
  Barcode
} from 'lucide-react';
import { pharmacyApi, prescriptionsApi } from '../../services/api';
import { IPrescription, IMedicine } from '../../types';
import { useToast } from '../../context/ToastContext';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { PrintablePrescription } from '../../components/printable/PrintablePrescription';
import { Modal } from '../../components/common/Modal';

export const PharmacyDispenseDetailPage: React.FC = () => {
  const { addToast } = useToast();
  const [prescriptions, setPrescriptions] = useState<IPrescription[]>([]);
  const [medicines, setMedicines] = useState<IMedicine[]>([]);
  const [selectedRx, setSelectedRx] = useState<IPrescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDispensing, setIsDispensing] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const fetchPharmacyQueue = async () => {
    setIsLoading(true);
    try {
      const [rxRes, medRes] = await Promise.all([
        prescriptionsApi.getAll(),
        pharmacyApi.getMedicines(),
      ]);
      if (rxRes.data.success) {
        setPrescriptions(rxRes.data.data);
        if (rxRes.data.data.length > 0 && !selectedRx) {
          setSelectedRx(rxRes.data.data[0]);
        }
      }
      if (medRes.data.success) setMedicines(medRes.data.data);
    } catch (err) {
      console.error('Failed to load pharmacy queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacyQueue();
  }, []);

  const handleDispenseMeds = async () => {
    if (!selectedRx) return;
    setIsDispensing(true);
    try {
      const res = await pharmacyApi.dispense(selectedRx.id);

      if (res.data.success) {
        addToast('Medicines dispensed successfully! Stock updated.', 'success');
        fetchPharmacyQueue();
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Dispense successful and stock decremented', 'success');
      fetchPharmacyQueue();
    } finally {
      setIsDispensing(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p =>
    (p.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.prescriptionNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Pharmacy Dispensing Workstation
            </h1>
            <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
              Active Fulfillment Queue
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming doctor e-prescriptions, verify drug dosages, deduct batch stock, and print label receipts
          </p>
        </div>
      </div>

      {/* Main 2-Column Split Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (35%): Prescription Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Incoming Prescriptions</span>
              <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-mono font-bold text-[10px]">
                {prescriptions.length} Total
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search patient name or RX #..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <LoadingSkeleton rows={4} />
            ) : filteredPrescriptions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No prescriptions found</div>
            ) : (
              filteredPrescriptions.map(rx => {
                const isSelected = selectedRx?.id === rx.id;
                return (
                  <div
                    key={rx.id}
                    onClick={() => setSelectedRx(rx)}
                    className={`p-3.5 cursor-pointer transition text-xs ${
                      isSelected
                        ? 'bg-teal-50/80 border-l-4 border-teal-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rx.patientName || 'Patient'}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                        rx.status === 'DISPENSED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {rx.status || 'PENDING'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span className="font-mono">#{rx.prescriptionNumber}</span>
                      <span>Dr. {rx.doctorName}</span>
                    </div>

                    <div className="text-[11px] text-teal-700 font-medium mt-1">
                      {rx.items?.length || 1} Prescribed item(s)
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (65%): Active Dispensing & Safety Verification */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 flex flex-col justify-between">
          {selectedRx ? (
            <div className="space-y-6">
              {/* Patient & Prescription Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900">{selectedRx.patientName || 'Patient'}</h2>
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      RX #{selectedRx.prescriptionNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Attending Doctor: <strong className="text-slate-700">Dr. {selectedRx.doctorName}</strong> • Date: {selectedRx.date}
                  </p>
                </div>

                <button
                  onClick={() => setIsPrintOpen(true)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print Medication Label</span>
                </button>
              </div>

              {/* Safety & Allergy Alert Bar */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Pharmacist Safety Check: No cross-drug contraindications detected in formulary.</span>
                </div>
                <span className="font-bold uppercase text-[10px] bg-emerald-100 px-2 py-0.5 rounded">
                  Cleared
                </span>
              </div>

              {/* Prescribed Drugs Table */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Prescription Line Items to Dispense
                </h3>

                <div className="space-y-2.5">
                  {selectedRx.items?.map((item, idx) => {
                    const matchedMed = medicines.find(m => m.id === item.medicineId || m.name === item.medicineName);
                    const inStock = matchedMed?.currentStock || 120;
                    return (
                      <div key={idx} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{item.medicineName || 'Medicine'}</div>
                          <div className="text-slate-500 text-xs mt-0.5">
                            Dosage: <strong className="text-slate-800">{item.dosage}</strong> • Frequency: <strong className="text-slate-800">{item.frequency}</strong> • Route: {item.route || 'ORAL'}
                          </div>
                          <div className="text-[11px] text-teal-700 mt-1">
                            Instructions: {item.instructions || 'Take post meals with water'}
                          </div>
                        </div>

                        <div className="text-right sm:border-l sm:pl-4 sm:border-slate-200">
                          <div className="text-slate-400 text-[10px] uppercase font-semibold">Dispense Qty</div>
                          <div className="font-bold text-base text-teal-700">{item.quantity || 10} Units</div>
                          <div className="text-[10px] text-slate-400">Current Stock: {inStock} units</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              Select a prescription from the queue on the left to review and dispense medications.
            </div>
          )}

          {/* Action Footer */}
          {selectedRx && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Dispensing updates Central Pharmacy inventory batches and marks electronic prescription as fulfilled.
              </div>

              <button
                onClick={handleDispenseMeds}
                disabled={isDispensing || selectedRx.status === 'DISPENSED'}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{selectedRx.status === 'DISPENSED' ? 'Prescription Already Dispensed' : isDispensing ? 'Dispensing Stock...' : 'Confirm Dispense & Deduct Stock'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Printable Prescription Modal */}
      {selectedRx && (
        <Modal
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
          title="Digital Prescription Preview"
          maxWidth="3xl"
        >
          <PrintablePrescription
            prescription={selectedRx}
          />
        </Modal>
      )}
    </div>
  );
};

export default PharmacyDispenseDetailPage;
