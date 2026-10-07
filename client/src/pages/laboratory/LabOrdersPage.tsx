import React, { useState, useEffect } from 'react';
import { FlaskConical, Search, Plus, Printer, CheckCircle2, Clock, TestTube2, AlertCircle } from 'lucide-react';
import { labApi } from '../../services/api';
import { ILabOrder } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { LabOrderModal } from '../../components/forms/LabOrderModal';
import { PrintableLabReport } from '../../components/printable/PrintableLabReport';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LabOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [orders, setOrders] = useState<ILabOrder[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReportOrder, setSelectedReportOrder] = useState<ILabOrder | null>(null);

  // Result Entry Modal State
  const [resultEntryOrder, setResultEntryOrder] = useState<ILabOrder | null>(null);
  const [resultParams, setResultParams] = useState<{ testId: string; name: string; value: string; unit: string; referenceRange: string }[]>([]);
  const [remarks, setRemarks] = useState('Biological test parameters calibrated and verified.');
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await labApi.getOrders({
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      if (res.data.success) setOrders(res.data.data);
    } catch (err) {
      console.error('Failed to load lab orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadOrders, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter, priorityFilter]);

  const handleCollectSample = async (orderId: string) => {
    try {
      await labApi.collectSample(orderId);
      success('Sample Collected', 'Status updated to Sample Collected. Ready for test processing.');
      loadOrders();
    } catch (err: any) {
      error('Error', err.response?.data?.message || 'Server error');
    }
  };

  const openResultEntry = async (order: ILabOrder) => {
    setResultEntryOrder(order);
    try {
      const testDefsRes = await labApi.getTests();
      const allTestDefs = testDefsRes.data.data;

      const initialParams: any[] = [];
      order.tests.forEach(t => {
        const testDef = allTestDefs.find((td: any) => td.id === t.testId || td.name === t.testName);
        if (testDef?.parameters) {
          testDef.parameters.forEach((p: any) => {
            initialParams.push({
              testId: t.testId,
              name: p.name,
              value: '',
              unit: p.unit,
              referenceRange: p.referenceRangeText || `${p.referenceRangeMin} - ${p.referenceRangeMax} ${p.unit}`,
            });
          });
        } else {
          initialParams.push({
            testId: t.testId,
            name: `${t.testName} Result`,
            value: '',
            unit: 'N/A',
            referenceRange: 'Normal',
          });
        }
      });

      setResultParams(initialParams);
    } catch (err) {
      console.error('Error preparing result entry:', err);
    }
  };

  const handleSaveResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultEntryOrder) return;

    setIsSubmittingResult(true);
    try {
      // Group parameters by testId
      const groupedResults = resultEntryOrder.tests.map(t => ({
        testId: t.testId,
        testName: t.testName,
        parameters: resultParams.filter(p => p.testId === t.testId),
        remarks,
      }));

      await labApi.enterResults(resultEntryOrder.id, { results: groupedResults });
      success('Lab Results Saved', 'Diagnostic report generated and verified successfully.');
      setResultEntryOrder(null);
      loadOrders();
    } catch (err: any) {
      error('Error Saving Results', err.response?.data?.message || 'Server error');
    } finally {
      setIsSubmittingResult(false);
    }
  };

  const isStaff = user?.role !== 'PATIENT';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-indigo-600" /> Diagnostic Pathology & Laboratory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnostic test orders, sample collection tracking, parameter entry, and verified reports
          </p>
        </div>
        {isStaff && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Order Diagnostic Tests
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patient, order #, or test name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ORDERED">Ordered</option>
            <option value="SAMPLE_COLLECTED">Sample Collected</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none"
          >
            <option value="">All Priorities</option>
            <option value="STAT">STAT (Critical)</option>
            <option value="URGENT">Urgent</option>
            <option value="NORMAL">Normal</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No diagnostic orders found"
          description="Lab orders requested by doctors will appear here."
          actionText={isStaff ? 'Order Diagnostic Tests' : undefined}
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Order # & Date</th>
                  <th className="py-3 px-4">Patient Details</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Tests Ordered</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(order => {
                  const isOrdered = order.status === 'ORDERED';
                  const isSampleCollected = order.status === 'SAMPLE_COLLECTED';
                  const isCompleted = order.status === 'COMPLETED';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                          {order.orderNumber}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {new Date(order.requestedDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{order.patientName}</p>
                        <p className="text-[10px] text-slate-500">
                          {order.patientAge} yrs • {order.patientGender}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{order.doctorName}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {order.tests.map((t, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-medium text-[10px] mr-1"
                            >
                              {t.testName}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Total: ₹{order.totalPrice}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                            order.priority === 'STAT'
                              ? 'bg-rose-100 text-rose-800'
                              : order.priority === 'URGENT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-50 text-indigo-800'
                          }`}
                        >
                          {order.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isOrdered && isStaff && (
                            <button
                              onClick={() => handleCollectSample(order.id)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold rounded-lg text-[11px] transition flex items-center gap-1"
                            >
                              <TestTube2 className="w-3.5 h-3.5" /> Collect Sample
                            </button>
                          )}

                          {isSampleCollected && isStaff && (
                            <button
                              onClick={() => openResultEntry(order)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] shadow-sm transition"
                            >
                              Enter Results
                            </button>
                          )}

                          {isCompleted && (
                            <button
                              onClick={() => setSelectedReportOrder(order)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5"
                            >
                              <Printer className="w-3.5 h-3.5" /> View Report
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

      {/* Result Entry Modal */}
      {resultEntryOrder && (
        <Modal
          isOpen={!!resultEntryOrder}
          onClose={() => setResultEntryOrder(null)}
          title={`Enter Diagnostic Results — ${resultEntryOrder.orderNumber}`}
          subtitle={`Patient: ${resultEntryOrder.patientName} (${resultEntryOrder.tests.map(t => t.testName).join(', ')})`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveResults} className="space-y-4 text-xs">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-900 border border-indigo-200">
              <p className="font-bold">Automated Biological Evaluation</p>
              <p className="text-[11px] opacity-80">
                Enter numerical / text results. The system will automatically compare against biological reference ranges and flag Normal / High / Low.
              </p>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto p-1">
              {resultParams.map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-5">
                    <p className="font-bold text-slate-900 text-xs">{p.name}</p>
                    <p className="text-[10px] text-slate-400">Range: {p.referenceRange}</p>
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      required
                      placeholder={`e.g. 14.2`}
                      value={p.value}
                      onChange={e => {
                        const val = e.target.value;
                        setResultParams(prev => {
                          const updated = [...prev];
                          updated[idx] = { ...updated[idx], value: val };
                          return updated;
                        });
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono font-bold text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3 text-slate-600 font-mono text-[11px]">
                    Unit: {p.unit || 'N/A'}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pathologist / Technician Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 outline-none text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResultEntryOrder(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingResult}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {isSubmittingResult ? 'Verifying & Saving...' : 'Verify & Complete Report'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Report Modal */}
      {selectedReportOrder && (
        <Modal
          isOpen={!!selectedReportOrder}
          onClose={() => setSelectedReportOrder(null)}
          title="Diagnostic Pathology Report"
          maxWidth="3xl"
        >
          <PrintableLabReport order={selectedReportOrder} />
        </Modal>
      )}

      {/* Create Lab Order Modal */}
      <LabOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadOrders}
      />
    </div>
  );
};
