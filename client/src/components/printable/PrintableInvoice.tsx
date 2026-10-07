import React from 'react';
import { IInvoice, IPatient } from '../../types';
import { Printer, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

interface PrintableInvoiceProps {
  invoice: IInvoice;
  patient?: IPatient | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ 
  invoice, 
  patient,
  isOpen = true,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  if (isOpen === false) return null;

  const isPaid = invoice.status === 'PAID';

  const content = (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-lg print:border-none print:shadow-none print:p-0 max-w-3xl mx-auto text-slate-800">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 print:hidden">
        <div>
          <h4 className="text-base font-bold text-slate-900">Hospital Tax Invoice Preview</h4>
          <p className="text-xs text-slate-500">Official GST compliant hospital invoice</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
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
          <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-md">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">MediCare Multi-Speciality Hospital</h2>
            <p className="text-xs text-slate-500">Health City, Outer Ring Road, Whitefield, Bengaluru - 560066</p>
            <p className="text-xs text-slate-500 font-mono">GSTIN: 29AABCM1234F1Z8 • Reg: HOSP-MH-2026-8874</p>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-3 py-1 text-xs font-extrabold rounded-lg uppercase tracking-wider border ${
              isPaid
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {invoice.status}
          </span>
          <p className="text-sm font-mono font-bold text-slate-900 mt-1.5">Invoice #{invoice.invoiceNumber}</p>
          <p className="text-xs text-slate-500">Date: {invoice.issueDate}</p>
        </div>
      </div>

      {/* Bill To Info */}
      <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
        <div>
          <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Patient Billed To</p>
          <p className="font-bold text-slate-900 text-sm mt-0.5">{patient?.fullName || invoice.patientName}</p>
          <p className="text-slate-600">
            Patient ID: <span className="font-mono font-semibold">{patient?.patientId || 'N/A'}</span>
          </p>
          <p className="text-slate-600">Phone: {invoice.patientPhone || patient?.phone || 'N/A'}</p>
          <p className="text-slate-500">{patient?.address}, {patient?.city}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Hospital Service Details</p>
          <p className="text-slate-700 font-medium mt-0.5">Billing Currency: INR (₹)</p>
          <p className="text-slate-600">Payment Status: <span className="font-bold">{invoice.status}</span></p>
          {patient?.insuranceProvider && (
            <p className="text-sky-700 font-medium">Insurance: {patient.insuranceProvider}</p>
          )}
        </div>
      </div>

      {/* Itemized Charges Table */}
      <div className="my-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-50">
              <th className="py-2.5 px-2">#</th>
              <th className="py-2.5 px-2">Category</th>
              <th className="py-2.5 px-2">Description</th>
              <th className="py-2.5 px-2 text-right">Unit Price</th>
              <th className="py-2.5 px-2 text-right">Qty</th>
              <th className="py-2.5 px-2 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="py-2.5 px-2 font-bold text-slate-400">{idx + 1}</td>
                <td className="py-2.5 px-2">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                    {item.category}
                  </span>
                </td>
                <td className="py-2.5 px-2 font-medium text-slate-900">{item.description}</td>
                <td className="py-2.5 px-2 text-right font-mono text-slate-600">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                <td className="py-2.5 px-2 text-right font-mono text-slate-600">{item.quantity}</td>
                <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Calculation */}
      <div className="flex justify-end pt-4 border-t border-slate-200 text-xs">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Hospital Discount:</span>
              <span className="font-mono">- ₹{invoice.discountAmount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>GST ({invoice.taxPercentage}%):</span>
            <span className="font-mono">₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
            <span>Total Amount:</span>
            <span className="font-mono text-base text-sky-800">₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs text-emerald-700 font-semibold">
            <span>Paid Amount:</span>
            <span className="font-mono">₹{invoice.paidAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-200">
            <span className={invoice.balanceAmount > 0 ? 'text-rose-600' : 'text-slate-700'}>
              Balance Due:
            </span>
            <span className={`font-mono ${invoice.balanceAmount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              ₹{invoice.balanceAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {invoice.payments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200 text-xs">
          <p className="font-bold text-slate-800 mb-2 uppercase tracking-wider text-[10px]">Payment Receipts Log</p>
          <div className="space-y-1.5">
            {invoice.payments.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <div>
                  <span className="font-mono font-bold text-slate-800">{p.receiptNumber}</span> • Method:{' '}
                  <span className="font-semibold text-sky-700">{p.paymentMethod}</span>
                  {p.transactionReference && (
                    <span className="text-slate-400 font-mono text-[10px] ml-2">({p.transactionReference})</span>
                  )}
                </div>
                <div className="font-mono font-bold text-emerald-700">₹{p.amount.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-400">
        <div>
          <p>Thank you for choosing MediCare Hospital.</p>
          <p className="text-[10px]">Tax invoice issued under Section 31 of CGST Act.</p>
        </div>
        <div className="text-center">
          <div className="w-32 border-b border-slate-400 mb-1" />
          <p className="font-bold text-slate-800 text-[11px]">Accounts Department</p>
          <p className="text-[10px]">Authorized Signatory</p>
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

export default PrintableInvoice;
