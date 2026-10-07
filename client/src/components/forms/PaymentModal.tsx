import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { IInvoice, PaymentMethod } from '../../types';
import { billingApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CreditCard, QrCode, Banknote, ShieldCheck } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: IInvoice;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [amount, setAmount] = useState<string>(invoice.balanceAmount.toString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionReference, setTransactionReference] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payVal = parseFloat(amount);
    if (!payVal || payVal <= 0) {
      error('Invalid Amount', 'Please enter a valid payment amount');
      return;
    }

    if (payVal > invoice.balanceAmount + 0.01) {
      error('Amount Exceeded', `Amount cannot exceed outstanding balance of ₹${invoice.balanceAmount}`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await billingApi.recordPayment({
        invoiceId: invoice.id,
        amount: payVal,
        paymentMethod,
        transactionReference: transactionReference || undefined,
      });

      if (res.data.success) {
        success('Payment Received!', `Receipt #${res.data.data.payment.receiptNumber} generated for ₹${payVal.toLocaleString('en-IN')}`);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      error('Payment Failed', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settle Invoice Payment"
      subtitle={`Receive payment for Invoice #${invoice.invoiceNumber} (${invoice.patientName})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Balance Overview */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
          <div>
            <p className="text-slate-500">Outstanding Balance Due</p>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              ₹{invoice.balanceAmount.toLocaleString('en-IN')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAmount(invoice.balanceAmount.toString())}
            className="px-2.5 py-1 bg-sky-100 text-sky-800 text-[11px] font-bold rounded-lg hover:bg-sky-200 transition"
          >
            Pay Full Balance
          </button>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Payment Amount (₹) *</label>
          <input
            type="number"
            step="0.01"
            required
            max={invoice.balanceAmount}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-base font-bold font-mono text-slate-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">Payment Method</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'UPI', label: 'UPI / QR Code', icon: QrCode },
              { id: 'CARD', label: 'Debit / Credit Card', icon: CreditCard },
              { id: 'CASH', label: 'Cash at Counter', icon: Banknote },
              { id: 'INSURANCE', label: 'Insurance TPA Claim', icon: ShieldCheck },
            ].map(m => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border font-semibold text-left transition ${
                    paymentMethod === m.id
                      ? 'bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-200'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-sky-600" />
                  <span className="text-xs">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Cheque / Card Auth No (Optional)</label>
          <input
            type="text"
            value={transactionReference}
            onChange={e => setTransactionReference(e.target.value)}
            placeholder="e.g. UPI/628190019283 / POS-AUTH-991204"
            className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-mono"
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
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {isLoading ? 'Processing Payment...' : 'Record Payment & Print Receipt'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;
