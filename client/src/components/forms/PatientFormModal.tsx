import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { IPatient } from '../../types';
import { patientsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: IPatient | null;
  onSuccess: () => void;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSuccess,
}) => {
  const isEditing = !!patient;
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    dob: patient?.dob || '1990-01-01',
    gender: patient?.gender || 'MALE',
    bloodGroup: patient?.bloodGroup || 'O+',
    phone: patient?.phone || '',
    email: patient?.email || '',
    address: patient?.address || '',
    city: patient?.city || 'Bengaluru',
    state: patient?.state || 'Karnataka',
    emergencyContactName: patient?.emergencyContactName || '',
    emergencyContactPhone: patient?.emergencyContactPhone || '',
    emergencyContactRelation: patient?.emergencyContactRelation || 'Spouse',
    allergies: patient?.allergies?.join(', ') || '',
    existingConditions: patient?.existingConditions?.join(', ') || '',
    insuranceProvider: patient?.insuranceProvider || '',
    insurancePolicyNumber: patient?.insurancePolicyNumber || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.phone) {
      error('Validation Error', 'First name and phone number are required');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        existingConditions: formData.existingConditions ? formData.existingConditions.split(',').map(s => s.trim()).filter(Boolean) : [],
      };

      if (isEditing && patient) {
        await patientsApi.update(patient.id, payload);
        success('Patient Updated', `${formData.firstName} profile updated successfully`);
      } else {
        await patientsApi.create(payload);
        success('Patient Registered', `${formData.firstName} registered successfully`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Failed to save patient', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Patient Profile' : 'Register New Patient'}
      subtitle="Enter patient demographic, emergency contact, and clinical background details"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="e.g. Rahul"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="e.g. Patel"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={formData.dob}
              onChange={e => setFormData({ ...formData, dob: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-white"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
            <select
              value={formData.bloodGroup}
              onChange={e => setFormData({ ...formData, bloodGroup: e.target.value as any })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-white"
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="patient@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            placeholder="Flat/House, Street, Area"
          />
        </div>

        {/* Emergency Contact */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
          <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">Emergency Contact Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={formData.emergencyContactName}
              onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
              placeholder="Contact Person Name"
              className="p-2 rounded-lg border border-slate-200 bg-white outline-none text-xs"
            />
            <input
              type="text"
              value={formData.emergencyContactPhone}
              onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
              placeholder="Contact Phone"
              className="p-2 rounded-lg border border-slate-200 bg-white outline-none text-xs"
            />
            <input
              type="text"
              value={formData.emergencyContactRelation}
              onChange={e => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
              placeholder="Relation (e.g. Spouse, Father)"
              className="p-2 rounded-lg border border-slate-200 bg-white outline-none text-xs"
            />
          </div>
        </div>

        {/* Medical Allergies & Conditions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Drug / Food Allergies (Comma separated)</label>
            <input
              type="text"
              value={formData.allergies}
              onChange={e => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="e.g. Penicillin, Sulfa, Aspirin"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Known Existing Conditions</label>
            <input
              type="text"
              value={formData.existingConditions}
              onChange={e => setFormData({ ...formData, existingConditions: e.target.value })}
              placeholder="e.g. Hypertension, Diabetes, Asthma"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        {/* Insurance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Insurance Provider</label>
            <input
              type="text"
              value={formData.insuranceProvider}
              onChange={e => setFormData({ ...formData, insuranceProvider: e.target.value })}
              placeholder="e.g. Star Health / HDFC ERGO"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Policy / Card Number</label>
            <input
              type="text"
              value={formData.insurancePolicyNumber}
              onChange={e => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
              placeholder="e.g. POL-99201"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        {/* Form Footer */}
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
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Patient'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
