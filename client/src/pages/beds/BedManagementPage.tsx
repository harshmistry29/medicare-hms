import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BedDouble, Hotel, Plus, Users, ShieldAlert, CheckCircle2, AlertCircle, Wrench, ArrowRight } from 'lucide-react';
import { bedsApi } from '../../services/api';
import { IBed, IRoom } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { AdmissionModal } from '../../components/forms/AdmissionModal';
import { useToast } from '../../context/ToastContext';

export const BedManagementPage: React.FC = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [bedMapData, setBedMapData] = useState<any>(null);
  const [selectedBedForAction, setSelectedBedForAction] = useState<IBed | null>(null);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadBedMap = async () => {
    setIsLoading(true);
    try {
      const res = await bedsApi.getBedMap();
      if (res.data.success) {
        setBedMapData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load bed map:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBedMap();
  }, []);

  const handleToggleMaintenance = async (bed: IBed) => {
    const newStatus = bed.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    try {
      await bedsApi.updateStatus(bed.id, newStatus);
      success('Bed Status Updated', `${bed.bedNumber} marked as ${newStatus}`);
      loadBedMap();
    } catch (err: any) {
      error('Update failed', err.response?.data?.message || 'Server error');
    }
  };

  if (isLoading || !bedMapData) {
    return <LoadingSkeleton rows={5} />;
  }

  const { bedMap, summary } = bedMapData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-blue-600" /> Hospital Ward & Bed Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time visual bed map, inpatient ward occupancy, ICU monitoring, and admission allocation
          </p>
        </div>
        <button
          onClick={() => setIsAdmissionModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-sm shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Admit Inpatient to Bed
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Hospital Beds</p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">{summary.totalBeds}</p>
          <p className="text-[11px] text-slate-500 mt-1">Across all floors & wards</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">🟢 Available Beds</p>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1">{summary.availableCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Ready for new admissions</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
          <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">🔴 Occupied Beds</p>
          <p className="text-2xl font-black text-rose-700 font-mono mt-1">{summary.occupiedCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active admitted inpatients</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Occupancy Rate</p>
          <p className="text-2xl font-black text-indigo-700 font-mono mt-1">{summary.occupancyPercentage}%</p>
          <p className="text-[11px] text-slate-500 mt-1">{summary.maintenanceCount} in maintenance</p>
        </div>
      </div>

      {/* Visual Ward Bed Map */}
      <div className="space-y-6">
        {bedMap.map((roomGroup: any) => {
          const room = roomGroup.room;
          const beds = roomGroup.beds;

          return (
            <div
              key={room.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4"
            >
              {/* Room Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm">
                    {room.roomNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">Room {room.roomNumber}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {room.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {room.floor} • Capacity: {room.capacity} Beds • Rate: <strong className="font-mono text-slate-800">₹{room.dailyRate}/day</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono font-semibold text-slate-500">
                    Occupancy: {roomGroup.occupancyRate}%
                  </span>
                  <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        roomGroup.occupancyRate > 75
                          ? 'bg-rose-500'
                          : roomGroup.occupancyRate > 0
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${roomGroup.occupancyRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Beds Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {beds.map((bed: IBed) => {
                  const isAvailable = bed.status === 'AVAILABLE';
                  const isOccupied = bed.status === 'OCCUPIED';
                  const isMaintenance = bed.status === 'MAINTENANCE';

                  return (
                    <div
                      key={bed.id}
                      className={`rounded-2xl p-4 border transition-all relative overflow-hidden flex flex-col justify-between ${
                        isAvailable
                          ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400 hover:shadow-md'
                          : isOccupied
                          ? 'bg-rose-50/40 border-rose-200 hover:border-rose-400 hover:shadow-md'
                          : 'bg-slate-100/60 border-slate-200'
                      }`}
                    >
                      <div>
                        {/* Bed Number & Status */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-sm text-slate-900">{bed.bedNumber}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : isOccupied
                                ? 'bg-rose-100 text-rose-800 animate-pulse'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {bed.status}
                          </span>
                        </div>

                        {/* Occupancy Info if occupied */}
                        {isOccupied && (
                          <div className="space-y-1 text-xs py-2">
                            <p className="font-bold text-slate-900">{bed.currentPatientName}</p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              Since: {bed.occupiedSince ? new Date(bed.occupiedSince).toLocaleDateString() : 'Active'}
                            </p>
                          </div>
                        )}

                        {isAvailable && (
                          <div className="py-2 text-xs text-emerald-800">
                            <p className="font-medium">Ready for Patient Admission</p>
                            <p className="text-[11px] opacity-80 font-mono">₹{bed.dailyRate} / day</p>
                          </div>
                        )}

                        {isMaintenance && (
                          <div className="py-2 text-xs text-slate-500 flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5" /> Under cleaning / maintenance
                          </div>
                        )}
                      </div>

                      {/* Action Links */}
                      <div className="pt-3 border-t border-slate-200/60 mt-2 flex items-center justify-between text-xs">
                        {isAvailable && (
                          <button
                            onClick={() => setIsAdmissionModalOpen(true)}
                            className="font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                          >
                            Admit <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {isOccupied && (
                          <button
                            onClick={() => navigate('/admissions')}
                            className="font-bold text-rose-700 hover:text-rose-900 inline-flex items-center gap-1"
                          >
                            View IPD <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleMaintenance(bed)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 font-medium ml-auto"
                        >
                          {isMaintenance ? 'Mark Available' : 'Maintenance'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admission Modal */}
      <AdmissionModal
        isOpen={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
        onSuccess={loadBedMap}
      />
    </div>
  );
};
