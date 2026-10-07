import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ILabTest, IPatient } from '../../types';
import { labApi, patientsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FlaskConical, CheckSquare, Square } from 'lucide-react';

interface LabOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPatientId?: string;
  onSuccess: () => void;
}

export const LabOrderModal: React.FC<LabOrderModalProps> = ({
  isOpen,
  onClose,
  preselectedPatientId,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [labTests, setLabTests] = useState<ILabTest[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(preselectedPatientId || '');
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT' | 'STAT'>('NORMAL');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const loadData = async () => {
      try {
        const [patRes, testRes] = await Promise.all([
          patientsApi.getAll({ limit: 100 }),
          labApi.getTests(),
        ]);
        if (patRes.data.success) {
          setPatients(patRes.data.data);
          if (!selectedPatientId && patRes.data.data.length > 0) {
            setSelectedPatientId(patRes.data.data[0].id);
          }
        }
        if (testRes.data.success) setLabTests(testRes.data.data);
      } catch (err) {
        console.error('Error loading lab metadata:', err);
      }
    };
    loadData();
  }, [isOpen, preselectedPatientId, selectedPatientId]);

  const toggleTest = (id: string) => {
    setSelectedTestIds(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const totalPrice = selectedTestIds.reduce((sum, tid) => {
    const t = labTests.find(item => item.id === tid);
    return sum + (t?.price || 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || selectedTestIds.length === 0) {
      error('Incomplete Order', 'Please select a patient and at least one diagnostic test');
      return;
    }

    setIsLoading(true);
    try {
      await labApi.createOrder({
        patientId: selectedPatientId,
        testIds: selectedTestIds,
        priority,
      });
      success('Lab Order Created', 'Diagnostic test request sent to pathology queue');
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Order Failed', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Order Diagnostic Lab Tests"
      subtitle="Select pathology, biochemistry, or hematology tests for patient"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
          <select
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-white text-slate-800"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.patientId}) — Age: {p.age} • Phone: {p.phone}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Order Priority Level</label>
          <div className="grid grid-cols-3 gap-2">
            {(['NORMAL', 'URGENT', 'STAT'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition ${
                  priority === p
                    ? p === 'STAT'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-200'
                      : p === 'URGENT'
                      ? 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-200'
                      : 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p === 'STAT' ? '🔴 STAT (Critical)' : p === 'URGENT' ? '🟠 URGENT' : '🟢 Routine Normal'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-2">Select Diagnostic Lab Tests *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
            {labTests.map(t => {
              const isSelected = selectedTestIds.includes(t.id);
              return (
                <div
                  key={t.id}
                  onClick={() => toggleTest(t.id)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition select-none ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-medium'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="mt-0.5 text-indigo-600">
                    {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold">{t.name}</p>
                      <span className="font-mono font-bold text-indigo-800 text-xs">₹{t.price}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{t.category} • Turnaround: ~{t.turnaroundHours}h</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-slate-600 font-medium">Selected Tests: {selectedTestIds.length}</span>
          <span className="font-bold text-sm text-indigo-900 font-mono">Total Estimated Fee: ₹{totalPrice.toLocaleString('en-IN')}</span>
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
            disabled={isLoading || selectedTestIds.length === 0}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {isLoading ? 'Creating Order...' : 'Send Lab Order'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
