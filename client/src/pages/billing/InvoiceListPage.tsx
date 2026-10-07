import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  DollarSign, 
  CreditCard, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  Download
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Invoice, Patient } from '../../types';
import PaymentModal from '../../components/forms/PaymentModal';
import PrintableInvoice from '../../components/printable/PrintableInvoice';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const InvoiceListPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Payment & Print Modal state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState<boolean>(false);

  // Manual Invoice Creation State
  const [newInvoice, setNewInvoice] = useState({
    patientId: '',
    items: [
      { description: 'OPD Doctor Consultation Fee', category: 'CONSULTATION', quantity: 1, unitPrice: 500, amount: 500 }
    ],
    discount: 0,
    taxRate: 5,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, patRes] = await Promise.all([
        api.get('/billing/invoices'),
        api.get('/patients')
      ]);

      if (invRes.data.success) setInvoices(invRes.data.data);
      if (patRes.data.success) setPatients(patRes.data.data);
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [
        ...newInvoice.items,
        { description: 'Hospital Service / Medicine / Diagnostic', category: 'SERVICE', quantity: 1, unitPrice: 200, amount: 200 }
      ]
    });
  };

  const handleRemoveItem = (index: number) => {
    const updated = newInvoice.items.filter((_, i) => i !== index);
    setNewInvoice({ ...newInvoice, items: updated });
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...newInvoice.items];
    const item = { ...updated[index], [field]: val };
    if (field === 'quantity' || field === 'unitPrice') {
      item.amount = (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
    }
    updated[index] = item;
    setNewInvoice({ ...newInvoice, items: updated });
  };

  const calculateSubtotal = () => {
    return newInvoice.items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.patientId) {
      addToast('Please select a patient', 'warning');
      return;
    }

    try {
      const res = await api.post('/billing/invoices', newInvoice);
      if (res.data.success) {
        addToast('Invoice generated successfully', 'success');
        setIsCreateInvoiceOpen(false);
        fetchData();
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to generate invoice', 'error');
    }
  };

  // Aggregated totals
  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
  const totalPending = invoices.reduce((acc, inv) => acc + (inv.balanceAmount || (inv.totalAmount - (inv.paidAmount || 0))), 0);
  const paidCount = invoices.filter(i => i.status === 'PAID').length;

  const filteredInvoices = invoices.filter(inv => {
    const patientName = typeof inv.patientId === 'object' && inv.patientId ? `${inv.patientId.firstName} ${inv.patientId.lastName}` : '';
    const invoiceNum = inv.invoiceNumber || '';
    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoiceNum.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" />
            Billing & Invoices Management
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Automated hospital billing engine, GST tax invoicing, payment settlements, and receipts
          </p>
        </div>

        {['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'].includes(user?.role || '') && (
          <button
            onClick={() => setIsCreateInvoiceOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Generate Invoice
          </button>
        )}
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue Collected</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{paidCount} Invoices Settled</span>
            </div>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl shadow-xs">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Dues</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">₹{totalPending.toLocaleString('en-IN')}</div>
            <div className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{invoices.filter(i => i.status === 'PENDING' || i.status === 'PARTIALLY_PAID').length} Pending Invoices</span>
            </div>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invoices Billed</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{invoices.length}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Average ticket: ₹{invoices.length ? Math.round((totalRevenue + totalPending) / invoices.length).toLocaleString('en-IN') : 0}
            </div>
          </div>
          <div className="p-3.5 bg-slate-100 text-slate-600 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Patient Name, Invoice # (e.g. INV-)..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['ALL', 'PAID', 'PENDING', 'PARTIALLY_PAID'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === status 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          title="No Invoices Found"
          description="There are currently no billing invoices matching your search parameters."
          icon={Receipt}
          actionLabel="Generate New Invoice"
          onAction={() => setIsCreateInvoiceOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Paid / Due</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredInvoices.map((inv) => {
                  const patient = typeof inv.patientId === 'object' && inv.patientId ? inv.patientId : null;
                  const balance = inv.balanceAmount !== undefined ? inv.balanceAmount : (inv.totalAmount - (inv.paidAmount || 0));

                  return (
                    <tr key={inv._id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-semibold text-teal-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Direct Hospital Billing'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {patient?.patientId || 'Walk-in Patient'} • {patient?.phone || ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                        {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{inv.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-medium text-emerald-600">Paid: ₹{(inv.paidAmount || 0).toLocaleString('en-IN')}</div>
                        {balance > 0 ? (
                          <div className="font-semibold text-amber-600">Due: ₹{balance.toLocaleString('en-IN')}</div>
                        ) : (
                          <div className="text-slate-400">Settled in Full</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'PARTIALLY_PAID' ? 'warning' : 'error'}>
                          {inv.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status !== 'PAID' && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setIsPaymentModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-md shadow-sm transition"
                            >
                              Collect Payment
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsPrintModalOpen(true);
                            }}
                            title="Print Hospital Invoice"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {selectedInvoice && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            fetchData();
          }}
          invoice={selectedInvoice}
        />
      )}

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <PrintableInvoice
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          invoice={selectedInvoice}
        />
      )}

      {/* Generate Manual Invoice Modal */}
      <Modal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        title="Generate New Hospital Invoice"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
            <select
              required
              value={newInvoice.patientId}
              onChange={(e) => setNewInvoice({ ...newInvoice, patientId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} ({p.patientId}) - {p.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">Line Items & Services *</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {newInvoice.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 items-center text-xs">
                  <div className="col-span-5">
                    <input
                      type="text"
                      required
                      placeholder="Service / Medicine description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded"
                    />
                  </div>
                  <div className="col-span-3">
                    <select
                      value={item.category}
                      onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                      className="w-full px-1.5 py-1 border border-slate-200 rounded"
                    >
                      <option value="CONSULTATION">Consultation</option>
                      <option value="PHARMACY">Pharmacy</option>
                      <option value="LABORATORY">Lab Test</option>
                      <option value="ROOM">Room / Bed</option>
                      <option value="PROCEDURE">Procedure / Surgery</option>
                      <option value="SERVICE">Service</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      className="w-full px-1 py-1 border border-slate-200 rounded text-center"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                      className="w-full px-1.5 py-1 border border-slate-200 rounded"
                      placeholder="Rate"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    {newInvoice.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-rose-500 font-bold hover:text-rose-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Discount (₹)</label>
              <input
                type="number"
                min="0"
                value={newInvoice.discount}
                onChange={(e) => setNewInvoice({ ...newInvoice, discount: Number(e.target.value) })}
                className="w-full px-2 py-1 border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                value={newInvoice.taxRate}
                onChange={(e) => setNewInvoice({ ...newInvoice, taxRate: Number(e.target.value) })}
                className="w-full px-2 py-1 border border-slate-200 rounded"
              />
            </div>
            <div className="text-right flex flex-col justify-end">
              <div className="text-slate-500 font-semibold">Estimated Total:</div>
              <div className="text-base font-bold text-teal-600">
                ₹{Math.max(0, (calculateSubtotal() - newInvoice.discount) * (1 + newInvoice.taxRate / 100)).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateInvoiceOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InvoiceListPage;
