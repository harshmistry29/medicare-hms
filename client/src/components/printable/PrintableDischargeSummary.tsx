import React from 'react';
import { IAdmission, IPatient, IDoctor } from '../../types';
import { Printer, Activity } from 'lucide-react';

interface PrintableDischargeSummaryProps {
  admission: IAdmission;
  patient?: IPatient | null;
  doctor?: IDoctor | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const PrintableDischargeSummary: React.FC<PrintableDischargeSummaryProps> = ({
  admission,
  patient,
  doctor,
  isOpen = true,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  if (isOpen === false) return null;

  const summary = admission.dischargeSummary;

  const content = (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-lg print:border-none print:shadow-none print:p-0 max-w-3xl mx-auto text-slate-800">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 print:hidden">
        <div>
          <h4 className="text-base font-bold text-slate-900">Inpatient Discharge Summary</h4>
          <p className="text-xs text-slate-500">Official clinical discharge certificate</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print Discharge Summary
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 text-slate-500 hover:bg-slate-100 text-xs font-semibold rounded-xl transition"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">MediCare Multi-Speciality Hospital</h2>
            <p className="text-xs text-slate-500">Department of Inpatient Clinical Services & Critical Care</p>
            <p className="text-xs text-slate-500 font-mono">Reg: HOSP-MH-2026-8874 • 24/7 Helpline: +91 80 4912 3456</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded-lg border border-teal-200">
            DISCHARGE SUMMARY
          </span>
          <p className="text-xs font-mono font-bold text-slate-700 mt-1">Admission #{admission.admissionNumber}</p>
        </div>
      </div>

      {/* Patient & Admission Meta Grid */}
      <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
        <div className="space-y-1">
          <p className="font-bold text-slate-900 text-sm">{patient?.fullName || admission.patientName}</p>
          <p className="text-slate-600">Patient ID: <span className="font-mono">{patient?.patientId || 'N/A'}</span></p>
          <p className="text-slate-600">Age/Gender: {patient?.age || '55'} yrs / {patient?.gender || 'Male'}</p>
          <p className="text-slate-600">Blood Group: {patient?.bloodGroup || 'A+'}</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-slate-600">Attending Doctor: <span className="font-bold text-slate-900">{doctor?.name || admission.doctorName}</span></p>
          <p className="text-slate-600">Room / Bed: <span className="font-semibold">{admission.roomNumber} / {admission.bedNumber}</span></p>
          <p className="text-slate-600">Date of Admission: <span className="font-semibold">{new Date(admission.admissionDate).toLocaleDateString()}</span></p>
          <p className="text-slate-600">Date of Discharge: <span className="font-semibold text-teal-700">{admission.actualDischargeDate ? new Date(admission.actualDischargeDate).toLocaleDateString() : 'Active'}</span></p>
          <p className="text-slate-600">Total Stay: <span className="font-bold">{admission.totalDays || 1} Day(s)</span></p>
        </div>
      </div>

      {/* Clinical Details */}
      <div className="my-6 space-y-4 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">Reason for Admission & Initial Diagnosis</p>
          <p className="text-slate-700">{admission.reasonForAdmission}</p>
          <p className="text-sky-800 font-semibold mt-1">Initial Diagnosis: {admission.initialDiagnosis}</p>
        </div>

        {summary ? (
          <>
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
              <p className="font-bold text-emerald-900 mb-1 uppercase tracking-wider text-[10px]">Final Clinical Diagnosis & Course</p>
              <p className="text-slate-900 font-semibold text-sm">{summary.finalDiagnosis}</p>
              <p className="text-slate-700 mt-2">{summary.treatmentGiven}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-slate-600">Condition at Discharge:</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                  {summary.conditionAtDischarge}
                </span>
              </div>
            </div>

            {summary.dischargeMedications && summary.dischargeMedications.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">Discharge Medications & Regimen</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 font-medium">
                  {summary.dischargeMedications.map((med, idx) => (
                    <li key={idx}>{med}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-900">
              <p className="font-bold mb-1 uppercase tracking-wider text-[10px]">Follow-Up Advice & Emergency Warning Signs</p>
              <p>{summary.followUpInstructions}</p>
              <p className="text-[11px] text-amber-800 mt-1 italic">In case of acute symptoms, immediately report to MediCare 24/7 Emergency Department (Ph: +91 80 4912 9999).</p>
            </div>
          </>
        ) : (
          <div className="py-6 text-center text-slate-400">
            Patient currently under inpatient observation. Discharge summary pending.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
        <div>
          <p className="text-slate-500 font-medium">Prepared by: Medical Records Department</p>
          <p className="text-[10px] text-slate-400">Electronically generated discharge summary.</p>
        </div>
        <div className="text-center">
          <div className="w-36 border-b border-slate-400 mb-1" />
          <p className="font-bold text-slate-800 text-xs">{summary?.dischargedByDoctorName || doctor?.name || admission.doctorName}</p>
          <p className="text-[10px] text-slate-500">Consultant In-Charge</p>
        </div>
      </div>
    </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-3xl my-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default PrintableDischargeSummary;
