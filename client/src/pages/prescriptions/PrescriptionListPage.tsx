import React, { useState, useEffect } from 'react';
import { FileText, Search, Printer, CheckCircle2, Clock, ArrowRight, Pill, User } from 'lucide-react';
import { prescriptionsApi } from '../../services/api';
import { IPrescription } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { PrintablePrescription } from '../../components/printable/PrintablePrescription';

export const PrescriptionListPage: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<IPrescription[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState<IPrescription | null>(null);

  const loadPrescriptions = async () => {
    setIsLoading(true);
    try {
      const res = await prescriptionsApi.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      if (res.data.success) setPrescriptions(res.data.data);
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadPrescriptions, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const getInitials = (name?: string) => {
    if (!name) return 'RX';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Electronic Prescriptions & Pharmacotherapy
            </h1>
            <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
              Rx Registry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official digital medical prescriptions generated during OPD consultations with dosage, instructions, and pharmacy dispensing state
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patient, prescription #, or diagnosis..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-xs text-slate-800"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="p-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none w-full sm:w-auto font-medium"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending Dispensation</option>
          <option value="DISPENSED">Dispensed from Pharmacy</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : prescriptions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Prescriptions Found"
          description="Prescriptions will appear here once doctors create them in consultations."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Rx Number</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Consultant Doctor</th>
                  <th className="py-3.5 px-4">Diagnosis</th>
                  <th className="py-3.5 px-4">Medications</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prescriptions.map(rx => (
                  <tr key={rx.id} className="hover:bg-teal-50/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700 text-xs">
                      #{rx.prescriptionNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {getInitials(rx.patientName)}
                        </div>
                        <span className="font-bold text-slate-900">{rx.patientName || 'Patient'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      Dr. {rx.doctorName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {rx.diagnosis || 'Clinical OPD Assessment'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200 text-[11px]">
                        <Pill className="w-3 h-3" /> {rx.items?.length || 1} Meds
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={rx.status || 'PENDING'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedRx(rx)}
                        className="px-2.5 py-1 text-teal-700 bg-teal-50 hover:bg-teal-100 font-semibold text-xs rounded-lg border border-teal-200 transition inline-flex items-center gap-1"
                        title="Print Prescription"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Prescription Modal */}
      {selectedRx && (
        <PrintablePrescription
          prescription={selectedRx}
        />
      )}
    </div>
  );
};

export default PrescriptionListPage;
