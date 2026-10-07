import React from 'react';
import { IPrescription, IPatient, IDoctor } from '../../types';
import { Printer, Activity } from 'lucide-react';

interface PrintablePrescriptionProps {
  prescription: IPrescription;
  patient?: IPatient | null;
  doctor?: IDoctor | null;
  onClose?: () => void;
}

export const PrintablePrescription: React.FC<PrintablePrescriptionProps> = ({
  prescription,
  patient,
  doctor,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-lg print:border-none print:shadow-none print:p-0 max-w-3xl mx-auto">
      {/* Top Action Bar (hidden on print) */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 print:hidden">
        <div>
          <h4 className="text-base font-bold text-slate-800">Medical Prescription Preview</h4>
          <p className="text-xs text-slate-500">Official prescription generated for pharmacy & patient</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Printer className="w-4 h-4" />
          Print Prescription
        </button>
      </div>

      {/* Hospital Letterhead */}
      <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-md">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">MediCare Multi-Speciality Hospital</h2>
            <p className="text-xs text-slate-500">Health City, Outer Ring Road, Whitefield, Bengaluru - 560066</p>
            <p className="text-xs text-slate-500 font-mono">Reg: HOSP-MH-2026-8874 • Ph: +91 80 4912 3456</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-sky-50 text-sky-800 text-xs font-bold rounded-lg border border-sky-200">
            PRESCRIPTION
          </span>
          <p className="text-xs font-mono font-bold text-slate-700 mt-1">#{prescription.prescriptionNumber}</p>
          <p className="text-xs text-slate-500">Date: {prescription.date}</p>
        </div>
      </div>

      {/* Doctor & Patient Info Bar */}
      <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
        <div>
          <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Attending Physician</p>
          <p className="font-bold text-slate-900 text-sm mt-0.5">{doctor?.name || prescription.doctorName}</p>
          <p className="text-slate-600">{doctor?.qualification || 'MBBS, MD'}</p>
          <p className="text-sky-700 font-medium">{doctor?.specialization || 'Consultant Specialist'}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Patient Details</p>
          <p className="font-bold text-slate-900 text-sm mt-0.5">{patient?.fullName || prescription.patientName}</p>
          <p className="text-slate-600">
            Patient ID: <span className="font-mono">{patient?.patientId || 'N/A'}</span>
          </p>
          <p className="text-slate-600">
            Age: {patient?.age || '42'} yrs • Gender: {patient?.gender || 'Male'} • Blood: {patient?.bloodGroup || 'B+'}
          </p>
        </div>
      </div>

      {/* Clinical Diagnosis */}
      <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
        <span className="font-bold text-slate-700">Diagnosis: </span>
        <span className="text-slate-900 font-semibold">{prescription.diagnosis}</span>
      </div>

      {/* Rx Section */}
      <div className="my-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl font-serif font-black text-sky-800 italic">℞</span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Medications Prescribed</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-300 text-slate-500 font-semibold uppercase text-[10px]">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-4">Medicine & Strength</th>
              <th className="py-2 pr-4">Dosage / Frequency</th>
              <th className="py-2 pr-4">Duration</th>
              <th className="py-2 text-right">Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {prescription.items.map((item, idx) => (
              <tr key={idx} className="py-2">
                <td className="py-2.5 font-bold text-slate-400">{idx + 1}</td>
                <td className="py-2.5 pr-4">
                  <p className="font-bold text-slate-900">{item.medicineName}</p>
                  {item.instructions && (
                    <p className="text-[11px] text-sky-700 italic mt-0.5">{item.instructions}</p>
                  )}
                </td>
                <td className="py-2.5 pr-4 text-slate-700">
                  <span className="font-semibold text-slate-900">{item.dosage}</span> • {item.frequency}
                </td>
                <td className="py-2.5 pr-4 text-slate-600">{item.duration}</td>
                <td className="py-2.5 text-right font-mono font-bold text-slate-900">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* General Instructions */}
      {prescription.generalInstructions && (
        <div className="my-4 p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900">
          <p className="font-bold mb-0.5">Instructions / Lifestyle Advice:</p>
          <p>{prescription.generalInstructions}</p>
        </div>
      )}

      {/* Footer Signatures */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
        <div className="text-slate-400 text-[10px]">
          <p>Generated electronically via MediCare Hospital Information System.</p>
          <p>Valid without physical stamp if verified online at medicare.health/verify</p>
        </div>
        <div className="text-center">
          <div className="w-36 border-b border-slate-400 mb-1" />
          <p className="font-bold text-slate-800 text-xs">{doctor?.name || prescription.doctorName}</p>
          <p className="text-[10px] text-slate-500">Authorized Medical Practitioner</p>
        </div>
      </div>
    </div>
  );
};
