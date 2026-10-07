import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  DollarSign, 
  Clock, 
  Save, 
  CheckCircle2,
  Shield,
  Bell
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const HospitalSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [settings, setSettings] = useState({
    hospitalName: 'MediCare Multi-Speciality Hospital & Research Institute',
    hospitalTagline: 'Excellence in Healthcare, Compassion in Healing',
    registrationNumber: 'MED-MH-2024-9921',
    gstinNumber: '27AAAAA0000A1Z5',
    address: 'Plot 42, Health City Boulevard, Bandra-Kurla Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400051',
    country: 'India',
    phone: '+91 (022) 2890-4400',
    emergencyPhone: '+91 1800-209-1088',
    email: 'info@medicare-hospital.org',
    billingEmail: 'accounts@medicare-hospital.org',
    currency: 'INR',
    currencySymbol: '₹',
    defaultTaxRate: 5,
    appointmentSlotDurationMinutes: 15,
    maxAdvanceBookingDays: 30,
    opdStartTime: '09:00',
    opdEndTime: '18:00',
    autoReleaseExpiredBeds: true,
    pharmacyLowStockThreshold: 15,
    enableSmsAlerts: false,
    enableEmailAlerts: true
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.success && res.data.data) {
        setSettings(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (err: any) {
      // If no settings exist yet, keep the defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/settings', settings);
      if (res.data.success) {
        addToast('Hospital settings saved successfully', 'success');
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-7 h-7 text-teal-600" />
            Hospital Organization & System Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure hospital identification, GST tax rules, OPD consultation schedules, and inventory policies
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hospital Identity Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-teal-600" />
            <h2 className="font-bold text-slate-800 text-base">Hospital Identification & Legal Entity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Hospital Name *</label>
              <input
                type="text"
                required
                value={settings.hospitalName}
                onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Tagline</label>
              <input
                type="text"
                value={settings.hospitalTagline}
                onChange={(e) => setSettings({ ...settings, hospitalTagline: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NABH / Medical Reg. No.</label>
              <input
                type="text"
                value={settings.registrationNumber}
                onChange={(e) => setSettings({ ...settings, registrationNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number (for Invoicing)</label>
              <input
                type="text"
                value={settings.gstinNumber}
                onChange={(e) => setSettings({ ...settings, gstinNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Contact & Location Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-teal-600" />
            <h2 className="font-bold text-slate-800 text-base">Contact & Physical Location</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={settings.state}
                onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PIN / Postal Code</label>
              <input
                type="text"
                value={settings.postalCode}
                onChange={(e) => setSettings({ ...settings, postalCode: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">General Reception Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency 24x7 Helpline</label>
              <input
                type="text"
                value={settings.emergencyPhone}
                onChange={(e) => setSettings({ ...settings, emergencyPhone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-bold text-rose-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Inquiry Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* OPD & Financial Policies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Billing & Tax */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <DollarSign className="w-5 h-5 text-teal-600" />
              <h2 className="font-bold text-slate-800 text-base">Billing & Taxation</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default GST Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="28"
                  value={settings.defaultTaxRate}
                  onChange={(e) => setSettings({ ...settings, defaultTaxRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pharmacy Low Stock Alert (Units)</label>
                <input
                  type="number"
                  min="1"
                  value={settings.pharmacyLowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, pharmacyLowStockThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* OPD Schedule */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Clock className="w-5 h-5 text-teal-600" />
              <h2 className="font-bold text-slate-800 text-base">OPD Scheduling Rules</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Consultation Slot Duration (Mins)</label>
                <select
                  value={settings.appointmentSlotDurationMinutes}
                  onChange={(e) => setSettings({ ...settings, appointmentSlotDurationMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="10">10 Minutes</option>
                  <option value="15">15 Minutes (Standard)</option>
                  <option value="20">20 Minutes</option>
                  <option value="30">30 Minutes</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">OPD Starts</label>
                  <input
                    type="time"
                    value={settings.opdStartTime}
                    onChange={(e) => setSettings({ ...settings, opdStartTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">OPD Ends</label>
                  <input
                    type="time"
                    value={settings.opdEndTime}
                    onChange={(e) => setSettings({ ...settings, opdEndTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Advance Booking Window (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={settings.maxAdvanceBookingDays}
                  onChange={(e) => setSettings({ ...settings, maxAdvanceBookingDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Footer */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HospitalSettingsPage;
