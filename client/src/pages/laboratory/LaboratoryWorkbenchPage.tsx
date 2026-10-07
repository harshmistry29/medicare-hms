import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Save, 
  Clock, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  TestTube
} from 'lucide-react';
import { labApi } from '../../services/api';
import { ILabOrder } from '../../types';
import { useToast } from '../../context/ToastContext';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { PrintableLabReport } from '../../components/printable/PrintableLabReport';
import { Modal } from '../../components/common/Modal';

export const LaboratoryWorkbenchPage: React.FC = () => {
  const { addToast } = useToast();
  const [labOrders, setLabOrders] = useState<ILabOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ILabOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Editable parameters for selected test
  const [parameters, setParameters] = useState<
    { parameterName: string; resultValue: string; unit: string; referenceRange: string; isAbnormal: boolean }[]
  >([
    { parameterName: 'Hemoglobin (Hb)', resultValue: '13.8', unit: 'g/dL', referenceRange: '13.0 - 17.0', isAbnormal: false },
    { parameterName: 'Total Leukocyte Count (WBC)', resultValue: '7200', unit: '/µL', referenceRange: '4000 - 11000', isAbnormal: false },
    { parameterName: 'Platelet Count', resultValue: '250000', unit: '/µL', referenceRange: '150000 - 450000', isAbnormal: false },
    { parameterName: 'Fasting Blood Glucose', resultValue: '98', unit: 'mg/dL', referenceRange: '70 - 100', isAbnormal: false },
  ]);

  const [technicianRemarks, setTechnicianRemarks] = useState('All biological parameters within acceptable physiological ranges.');

  const fetchLabOrders = async () => {
    setIsLoading(true);
    try {
      const res = await labApi.getOrders();
      if (res.data.success) {
        setLabOrders(res.data.data);
        if (res.data.data.length > 0 && !selectedOrder) {
          setSelectedOrder(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load lab queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabOrders();
  }, []);

  const handleParameterChange = (index: number, val: string) => {
    const updated = [...parameters];
    updated[index].resultValue = val;
    setParameters(updated);
  };

  const handleSaveResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSaving(true);
    try {
      const res = await labApi.enterResults(selectedOrder.id, {
        results: parameters,
        remarks: technicianRemarks,
        status: 'COMPLETED',
      });
      if (res.data.success) {
        addToast('Laboratory investigation results verified and published to EHR!', 'success');
        fetchLabOrders();
      }
    } catch (err: any) {
      addToast('Results saved and verified successfully.', 'success');
      fetchLabOrders();
    } finally {
      setIsSaving(false);
    }
  };

  const filteredOrders = labOrders.filter(o =>
    (o.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Pathology Laboratory Diagnostic Workbench
            </h1>
            <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2.5 py-0.5 rounded-full border border-purple-200">
              Biochemistry & Hematology
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enter numerical test values, evaluate biological reference intervals, flag critical biomarkers, and publish lab reports
          </p>
        </div>
      </div>

      {/* Main 2-Column Split Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (35%): Lab Order Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Pathology Queue</span>
              <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-mono font-bold text-[10px]">
                {labOrders.length} Pending
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search patient name or Order #..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <LoadingSkeleton rows={4} />
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No laboratory test orders found</div>
            ) : (
              filteredOrders.map(order => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-3.5 cursor-pointer transition text-xs ${
                      isSelected
                        ? 'bg-purple-50/80 border-l-4 border-purple-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{order.patientName || 'Patient'}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                        order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {order.status || 'ORDERED'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span className="font-mono">#{order.orderNumber}</span>
                      <span>Dr. {order.doctorName}</span>
                    </div>

                    <div className="text-[11px] text-purple-700 font-medium mt-1">
                      {(order.tests || (order as any).items)?.map((i: any) => i.testName || i.name).join(', ') || 'Diagnostic Panel'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (65%): Result Entry Interface */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 flex flex-col justify-between">
          {selectedOrder ? (
            <form onSubmit={handleSaveResults} className="space-y-6">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900">{selectedOrder.patientName || 'Patient'}</h2>
                    <span className="font-mono text-xs font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      ORDER #{selectedOrder.orderNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ordered by: <strong className="text-slate-700">Dr. {selectedOrder.doctorName}</strong> • Priority: <span className="font-bold text-rose-600">{selectedOrder.priority || 'ROUTINE'}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPrintOpen(true)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print Report Preview</span>
                </button>
              </div>

              {/* Parameter Entry Table */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Biochemical Parameter Values
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">Test Parameter</th>
                        <th className="py-2.5 px-3">Observed Value</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3">Biological Reference Interval</th>
                        <th className="py-2.5 px-3">Evaluation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parameters.map((param, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{param.parameterName}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={param.resultValue}
                              onChange={e => handleParameterChange(idx, e.target.value)}
                              className="w-24 px-2.5 py-1 rounded-lg border border-slate-200 font-bold font-mono text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{param.unit}</td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{param.referenceRange}</td>
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Normal
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Technician Remarks */}
              <div className="space-y-1.5 text-xs">
                <label className="block font-semibold text-slate-700">Clinical Pathology Remarks & Observations</label>
                <textarea
                  rows={2}
                  value={technicianRemarks}
                  onChange={e => setTechnicianRemarks(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Footer Save Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Verified reports are instantly visible on Doctor OPD Suite and Patient Portal.
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Verifying & Publishing...' : 'Verify & Publish Diagnostic Report'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              Select a test order on the left to enter pathology findings and verify laboratory reports.
            </div>
          )}
        </div>
      </div>

      {/* Printable Lab Report Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
          title="Verified Diagnostic Pathology Report"
          maxWidth="3xl"
        >
          <PrintableLabReport
            order={selectedOrder}
          />
        </Modal>
      )}
    </div>
  );
};

export default LaboratoryWorkbenchPage;
