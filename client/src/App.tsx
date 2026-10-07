import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public Landing Page
import LandingPage from './pages/public/LandingPage';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Main Hospital Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PatientListPage } from './pages/patients/PatientListPage';
import { PatientDetailPage } from './pages/patients/PatientDetailPage';
import { DoctorListPage } from './pages/doctors/DoctorListPage';
import { DepartmentListPage } from './pages/departments/DepartmentListPage';
import { AppointmentListPage } from './pages/appointments/AppointmentListPage';
import { ConsultationRoomPage } from './pages/consultations/ConsultationRoomPage';
import { PrescriptionListPage } from './pages/prescriptions/PrescriptionListPage';
import { PharmacyInventoryPage } from './pages/pharmacy/PharmacyInventoryPage';
import { LabOrdersPage } from './pages/laboratory/LabOrdersPage';
import { BedManagementPage } from './pages/beds/BedManagementPage';
import InpatientListPage from './pages/admissions/InpatientListPage';
import EmergencyTriagePage from './pages/emergency/EmergencyTriagePage';
import InvoiceListPage from './pages/billing/InvoiceListPage';
import AnalyticsDashboardPage from './pages/reports/AnalyticsDashboardPage';
import AuditLogsPage from './pages/audit/AuditLogsPage';
import HospitalSettingsPage from './pages/settings/HospitalSettingsPage';
import AiClinicalAssistantPage from './pages/ai-assistant/AiClinicalAssistantPage';

// Additional Experience & Specialized Hub Pages
import DoctorScheduleCalendarPage from './pages/appointments/DoctorScheduleCalendarPage';
import PatientPortalDashboardPage from './pages/patients/PatientPortalDashboardPage';
import PharmacyDispenseDetailPage from './pages/pharmacy/PharmacyDispenseDetailPage';
import LaboratoryWorkbenchPage from './pages/laboratory/LaboratoryWorkbenchPage';
import HospitalServicesDirectoryPage from './pages/public/HospitalServicesDirectoryPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          <div className="text-sm font-semibold text-slate-600">Loading MediCare HMS...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ✕
          </div>
          <h2 className="text-lg font-bold text-slate-800">Access Restricted</h2>
          <p className="text-sm text-slate-500">
            Your role (<span className="font-semibold text-slate-700">{user.role}</span>) does not have authorization to access this module.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Directory Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<HospitalServicesDirectoryPage />} />

        {/* Public Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Application Layout & Pages */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Main Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Patient Portal & Health Records */}
          <Route path="/my-health" element={<PatientPortalDashboardPage />} />
          <Route path="/patient-portal" element={<PatientPortalDashboardPage />} />

          {/* Patients Module */}
          <Route path="patients" element={<PatientListPage />} />
          <Route path="patients/:id" element={<PatientDetailPage />} />

          {/* Doctors & Clinical Staff */}
          <Route path="doctors" element={<DoctorListPage />} />

          {/* Departments */}
          <Route path="departments" element={<DepartmentListPage />} />

          {/* Appointments & OPD Queue */}
          <Route path="appointments" element={<AppointmentListPage />} />
          <Route path="appointments/calendar" element={<DoctorScheduleCalendarPage />} />
          <Route path="schedule" element={<DoctorScheduleCalendarPage />} />

          {/* Doctor OPD Consultation Suite */}
          <Route 
            path="consultations/room" 
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'DOCTOR']}>
                <ConsultationRoomPage />
              </ProtectedRoute>
            } 
          />

          {/* Electronic Prescriptions */}
          <Route path="prescriptions" element={<PrescriptionListPage />} />

          {/* Pharmacy Management & Dispensing Counter */}
          <Route 
            path="pharmacy" 
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'DOCTOR', 'NURSE', 'ACCOUNTANT']}>
                <PharmacyInventoryPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="pharmacy/dispense" 
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'DOCTOR', 'NURSE', 'ACCOUNTANT']}>
                <PharmacyDispenseDetailPage />
              </ProtectedRoute>
            } 
          />

          {/* Diagnostic Laboratory & Workbench */}
          <Route 
            path="laboratory" 
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'LAB_TECHNICIAN', 'DOCTOR', 'NURSE']}>
                <LabOrdersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="laboratory/workbench" 
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'LAB_TECHNICIAN', 'DOCTOR', 'NURSE']}>
                <LaboratoryWorkbenchPage />
              </ProtectedRoute>
            } 
          />

          {/* Bed & Ward Management */}
          <Route path="beds" element={<BedManagementPage />} />

          {/* Inpatient (IPD) Admissions */}
          <Route 
            path="admissions" 
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'ACCOUNTANT']}>
                <InpatientListPage />
              </ProtectedRoute>
            } 
          />

          {/* Emergency & Trauma Triage */}
          <Route path="emergency" element={<EmergencyTriagePage />} />

          {/* Billing & Invoices */}
          <Route 
            path="billing" 
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'RECEPTIONIST', 'PATIENT']}>
                <InvoiceListPage />
              </ProtectedRoute>
            } 
          />

          {/* Reports & Analytics */}
          <Route 
            path="reports" 
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'ACCOUNTANT']}>
                <AnalyticsDashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* AI Clinical Suite */}
          <Route 
            path="ai-assistant" 
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE']}>
                <AiClinicalAssistantPage />
              </ProtectedRoute>
            } 
          />

          {/* Security Audit Logs */}
          <Route 
            path="audit-logs" 
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                <AuditLogsPage />
              </ProtectedRoute>
            } 
          />

          {/* Hospital Settings */}
          <Route 
            path="settings" 
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                <HospitalSettingsPage />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
