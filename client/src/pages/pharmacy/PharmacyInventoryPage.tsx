import React, { useState, useEffect } from 'react';
import { Pill, Search, Plus, AlertTriangle, CheckCircle2, Clock, PackageCheck, AlertCircle, ShoppingCart } from 'lucide-react';
import { pharmacyApi, prescriptionsApi } from '../../services/api';
import { IMedicine, IPrescription } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { MedicineFormModal } from '../../components/forms/MedicineFormModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const PharmacyInventoryPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'inventory' | 'dispense'>('inventory');
  const [medicines, setMedicines] = useState<IMedicine[]>([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState<IPrescription[]>([]);
  const [alerts, setAlerts] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Add/Edit Medicine Modal
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<IMedicine | null>(null);
  const [dispensingId, setDispensingId] = useState<string | null>(null);

  const loadPharmacyData = async () => {
    setIsLoading(true);
    try {
      const [medRes, rxRes, alertRes] = await Promise.all([
        pharmacyApi.getMedicines({
          search: search || undefined,
          category: categoryFilter || undefined,
          lowStock: lowStockOnly ? 'true' : undefined,
        }),
        prescriptionsApi.getAll({ status: 'PENDING' }),
        pharmacyApi.getAlerts(),
      ]);

      if (medRes.data.success) setMedicines(medRes.data.data);
      if (rxRes.data.success) setPendingPrescriptions(rxRes.data.data);
      if (alertRes.data.success) setAlerts(alertRes.data.data);
    } catch (err) {
      console.error('Failed to load pharmacy data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadPharmacyData, 200);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, lowStockOnly]);

  const handleDispense = async (prescriptionId: string) => {
    setDispensingId(prescriptionId);
    try {
      const res = await pharmacyApi.dispense(prescriptionId);
      if (res.data.success) {
        success('Medicines Dispensed!', 'Pharmacy inventory updated and patient invoice charges appended.');
        loadPharmacyData();
      }
    } catch (err: any) {
      error('Dispense Failed', err.response?.data?.message || 'Insufficient stock or error');
    } finally {
      setDispensingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Pill className="w-6 h-6 text-teal-600" /> Pharmacy & Drug Dispensing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pharmaceutical inventory management, batch expiry tracking, and prescription dispensing queue
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedMedicine(null);
            setIsMedicineModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Medicine
        </button>
      </div>

      {/* Stock Alert Banners if any */}
      {alerts && (alerts.lowStockCount > 0 || alerts.expiringSoonCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alerts.lowStockCount > 0 && (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">{alerts.lowStockCount} Medicine(s) Below Safety Reorder Level</p>
                  <p className="text-[11px] text-amber-700">Immediate re-stocking advised for pharmacy safety stock.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setLowStockOnly(true);
                  setActiveTab('inventory');
                }}
                className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-lg text-xs"
              >
                View
              </button>
            </div>
          )}

          {alerts.expiringSoonCount > 0 && (
            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between text-xs text-rose-900">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">{alerts.expiringSoonCount} Medicine(s) Expiring Within 45 Days</p>
                  <p className="text-[11px] text-rose-700">Verify batch numbers and rotate stock.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'inventory'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Medicine Inventory</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
            {medicines.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dispense')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'dispense'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Prescription Dispensing Queue</span>
          {pendingPrescriptions.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
              {pendingPrescriptions.length} Pending
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search medicine brand, generic name, or code..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-xs text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none"
              >
                <option value="">All Categories</option>
                <option value="ANTIBIOTIC">Antibiotic</option>
                <option value="ANALGESIC">Analgesic</option>
                <option value="ANTIDIABETIC">Antidiabetic</option>
                <option value="ANTIHYPERTENSIVE">Antihypertensive</option>
                <option value="ANTACID">Antacid</option>
              </select>

              <button
                type="button"
                onClick={() => setLowStockOnly(!lowStockOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                  lowStockOnly
                    ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ⚠️ Low Stock Only
              </button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <LoadingSkeleton rows={5} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Medicine Name & Code</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Batch #</th>
                      <th className="py-3 px-4">Expiry Date</th>
                      <th className="py-3 px-4 text-right">Price (₹)</th>
                      <th className="py-3 px-4 text-right">Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicines.map(m => {
                      const isLow = m.currentStock <= m.reorderLevel;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{m.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {m.medicineCode} • {m.genericName}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">
                              {m.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-700">{m.batchNumber}</td>
                          <td className="py-3 px-4 text-slate-600 font-mono">{m.expiryDate}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            ₹{m.sellingPrice} / {m.unit.toLowerCase()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                                isLow
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {m.currentStock} {m.unit.toLowerCase()}s {isLow && '⚠️'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedMedicine(m);
                                setIsMedicineModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition"
                            >
                              Edit Stock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Dispensing Queue */}
      {activeTab === 'dispense' && (
        <div className="space-y-4">
          {pendingPrescriptions.length === 0 ? (
            <EmptyState
              icon={PackageCheck}
              title="Dispensing Queue Clear"
              description="No pending prescriptions in the pharmacy queue."
            />
          ) : (
            <div className="space-y-4">
              {pendingPrescriptions.map(rx => (
                <div
                  key={rx.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-sky-50 text-sky-800 px-2.5 py-0.5 rounded-lg border border-sky-200">
                        #{rx.prescriptionNumber}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{rx.patientName}</h4>
                      <StatusBadge status={rx.status} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Prescribed by <strong className="text-slate-800">{rx.doctorName}</strong> on {rx.date}
                    </p>
                    <p className="text-xs text-slate-700 font-semibold">
                      Diagnosis: {rx.diagnosis}
                    </p>

                    {/* Prescribed Items Pill List */}
                    <div className="pt-2 flex flex-wrap gap-2">
                      {rx.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800"
                        >
                          <span className="font-bold text-slate-900">{item.medicineName}</span> •{' '}
                          <span className="text-sky-700 font-semibold">{item.dosage}</span> ({item.frequency}) •{' '}
                          <span className="font-mono font-bold">{item.quantity} units</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dispense Action Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleDispense(rx.id)}
                      disabled={dispensingId === rx.id}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold rounded-2xl shadow-lg transition text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <PackageCheck className="w-4 h-4" />
                      {dispensingId === rx.id ? 'Dispensing Stock...' : 'Dispense & Deduct Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Medicine Modal */}
      <MedicineFormModal
        isOpen={isMedicineModalOpen}
        onClose={() => setIsMedicineModalOpen(false)}
        medicine={selectedMedicine}
        onSuccess={loadPharmacyData}
      />
    </div>
  );
};
