import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { IMedicine } from '../../types';
import { pharmacyApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface MedicineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine?: IMedicine | null;
  onSuccess: () => void;
}

export const MedicineFormModal: React.FC<MedicineFormModalProps> = ({
  isOpen,
  onClose,
  medicine,
  onSuccess,
}) => {
  const isEditing = !!medicine;
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: medicine?.name || '',
    genericName: medicine?.genericName || '',
    brand: medicine?.brand || '',
    category: medicine?.category || 'ANTIBIOTIC',
    manufacturer: medicine?.manufacturer || '',
    batchNumber: medicine?.batchNumber || '',
    expiryDate: medicine?.expiryDate || '2027-12-31',
    purchasePrice: medicine?.purchasePrice?.toString() || '',
    sellingPrice: medicine?.sellingPrice?.toString() || '',
    currentStock: medicine?.currentStock?.toString() || '',
    reorderLevel: medicine?.reorderLevel?.toString() || '30',
    unit: medicine?.unit || 'TABLET',
    locationShelf: medicine?.locationShelf || 'Rack A-1',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.batchNumber || !formData.sellingPrice || !formData.currentStock) {
      error('Validation Error', 'Name, batch number, selling price, and stock are required');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && medicine) {
        await pharmacyApi.updateMedicine(medicine.id, {
          ...formData,
          purchasePrice: parseFloat(formData.purchasePrice || '0'),
          sellingPrice: parseFloat(formData.sellingPrice),
          currentStock: parseInt(formData.currentStock, 10),
          reorderLevel: parseInt(formData.reorderLevel || '30', 10),
        });
        success('Medicine Updated', `${formData.name} updated successfully`);
      } else {
        await pharmacyApi.addMedicine({
          ...formData,
          purchasePrice: parseFloat(formData.purchasePrice || '0'),
          sellingPrice: parseFloat(formData.sellingPrice),
          currentStock: parseInt(formData.currentStock, 10),
          reorderLevel: parseInt(formData.reorderLevel || '30', 10),
        });
        success('Medicine Added', `${formData.name} added to pharmacy inventory`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Error Saving Medicine', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Medicine Stock' : 'Add Medicine to Pharmacy'}
      subtitle="Track pharmaceutical batches, expiry dates, and inventory thresholds"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Medicine Name & Strength *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Paracetamol 500mg"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Generic Name / Composition</label>
            <input
              type="text"
              value={formData.genericName}
              onChange={e => setFormData({ ...formData, genericName: e.target.value })}
              placeholder="e.g. Acetaminophen"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-white"
            >
              <option value="ANTIBIOTIC">Antibiotic</option>
              <option value="ANALGESIC">Analgesic / Pain Relief</option>
              <option value="ANTIDIABETIC">Antidiabetic</option>
              <option value="ANTIHYPERTENSIVE">Antihypertensive</option>
              <option value="ANTACID">Antacid / PPI</option>
              <option value="ANTIVIRAL">Antiviral</option>
              <option value="VITAMIN">Vitamin & Supplement</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Unit Type</label>
            <select
              value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value as any })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-white"
            >
              <option value="TABLET">Tablet</option>
              <option value="CAPSULE">Capsule</option>
              <option value="SYRUP">Syrup Bottle</option>
              <option value="INJECTION">Injection / Vial</option>
              <option value="OINTMENT">Ointment Tube</option>
              <option value="DROPS">Drops</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Manufacturer</label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
              placeholder="e.g. Cipla / Sun Pharma"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Batch Number *</label>
            <input
              type="text"
              required
              value={formData.batchNumber}
              onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
              placeholder="e.g. BATCH-99210"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Expiry Date *</label>
            <input
              type="date"
              required
              value={formData.expiryDate}
              onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Purchase Price (₹)</label>
            <input
              type="number"
              step="0.1"
              value={formData.purchasePrice}
              onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
              placeholder="0.0"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.sellingPrice}
              onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
              placeholder="0.0"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Current Stock *</label>
            <input
              type="number"
              required
              value={formData.currentStock}
              onChange={e => setFormData({ ...formData, currentStock: e.target.value })}
              placeholder="500"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-mono font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reorder Level</label>
            <input
              type="number"
              value={formData.reorderLevel}
              onChange={e => setFormData({ ...formData, reorderLevel: e.target.value })}
              placeholder="30"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Storage Location Shelf</label>
          <input
            type="text"
            value={formData.locationShelf}
            onChange={e => setFormData({ ...formData, locationShelf: e.target.value })}
            placeholder="e.g. Rack B-3, Shelf 2"
            className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
          />
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
            disabled={isLoading}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Medicine' : 'Add to Inventory'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
