import React from 'react';
import { ILabOrder, IPatient, IDoctor } from '../../types';
import { Printer, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PrintableLabReportProps {
  order: ILabOrder;
  patient?: IPatient | null;
  doctor?: IDoctor | null;
}

export const PrintableLabReport: React.FC<PrintableLabReportProps> = ({ order, patient, doctor }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-lg print:border-none print:shadow-none print:p-0 max-w-3xl mx-auto text-slate-800">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 print:hidden">
        <div>
          <h4 className="text-base font-bold text-slate-900">Diagnostic Laboratory Report</h4>
          <p className="text-xs text-slate-500">NABL Accredited Clinical Pathology & Biochemistry</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Printer className="w-4 h-4" />
          Print Lab Report
        </button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">MediCare Diagnostic Pathology Laboratories</h2>
            <p className="text-xs text-slate-500">Department of Clinical Laboratory Sciences & Molecular Diagnostics</p>
            <p className="text-xs text-slate-500 font-mono">NABL Accredited Lab #MC-LAB-9920 • ISO 15189:2022</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-800 text-xs font-bold rounded-lg border border-indigo-200">
            DIAGNOSTIC REPORT
          </span>
          <p className="text-xs font-mono font-bold text-slate-700 mt-1">Order #{order.orderNumber}</p>
          <p className="text-xs text-slate-500">Collected: {order.sampleCollectedAt ? new Date(order.sampleCollectedAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>

      {/* Patient and Order Header */}
      <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
        <div>
          <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Patient Information</p>
          <p className="font-bold text-slate-900 text-sm mt-0.5">{patient?.fullName || order.patientName}</p>
          <p className="text-slate-600">Patient ID: <span className="font-mono">{patient?.patientId || 'N/A'}</span></p>
          <p className="text-slate-600">Age: {order.patientAge || patient?.age} yrs • Gender: {order.patientGender || patient?.gender}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Ordering Physician</p>
          <p className="font-bold text-slate-900 text-sm mt-0.5">{doctor?.name || order.doctorName}</p>
          <p className="text-slate-600">Priority: <span className="font-bold text-indigo-700">{order.priority}</span></p>
          <p className="text-slate-600">Status: <span className="font-bold text-emerald-700">{order.status}</span></p>
        </div>
      </div>

      {/* Test Results Sections */}
      <div className="my-6 space-y-6">
        {order.results && order.results.length > 0 ? (
          order.results.map((resItem, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide">{resItem.testName}</h5>
                <span className="text-[10px] text-slate-500">Method: Fully Automated Photometric & Impedance</span>
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[10px] uppercase bg-slate-50/50">
                    <th className="py-2 px-3">Test Parameter</th>
                    <th className="py-2 px-3">Result</th>
                    <th className="py-2 px-3">Unit</th>
                    <th className="py-2 px-3">Biological Reference Range</th>
                    <th className="py-2 px-3 text-right">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resItem.parameters.map((p, pIdx) => {
                    const isAbnormal = p.status === 'HIGH' || p.status === 'LOW' || p.status === 'ABNORMAL';
                    return (
                      <tr key={pIdx} className={isAbnormal ? 'bg-amber-50/40 font-medium' : ''}>
                        <td className="py-2 px-3 font-semibold text-slate-800">{p.name}</td>
                        <td className={`py-2 px-3 font-mono font-bold ${isAbnormal ? 'text-rose-600' : 'text-slate-900'}`}>
                          {p.value}
                        </td>
                        <td className="py-2 px-3 text-slate-500 font-mono">{p.unit}</td>
                        <td className="py-2 px-3 text-slate-600">{p.referenceRange}</td>
                        <td className="py-2 px-3 text-right">
                          {p.status === 'NORMAL' ? (
                            <span className="text-emerald-600 font-semibold text-[10px]">Normal</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                              <AlertTriangle className="w-3 h-3" /> {p.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {resItem.remarks && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Remarks: </span>
                  {resItem.remarks}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-slate-400 text-sm border border-dashed rounded-xl">
            Sample collected. Results under technical verification.
          </div>
        )}
      </div>

      {/* End of Report Signatures */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
        <div>
          <p className="text-[11px] font-semibold text-slate-700">Technician: {order.sampleCollectedBy || 'Ravi Shastri (DMLT)'}</p>
          <p className="text-[10px] text-slate-400">Sample verified with internal calibration controls.</p>
        </div>
        <div className="text-center">
          <div className="w-36 border-b border-slate-400 mb-1" />
          <p className="font-bold text-slate-800 text-xs">Dr. K. S. Murthy, MD</p>
          <p className="text-[10px] text-slate-500">Chief Pathologist & Lab Director</p>
        </div>
      </div>
    </div>
  );
};
