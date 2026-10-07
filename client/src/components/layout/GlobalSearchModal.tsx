import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Stethoscope, Calendar, FileText, Pill, CreditCard, X, ChevronRight } from 'lucide-react';
import { searchApi } from '../../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await searchApi.globalSearch(query);
        if (res.data.success) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  const hasAnyResults = results && (
    results.patients?.length > 0 ||
    results.doctors?.length > 0 ||
    results.appointments?.length > 0 ||
    results.prescriptions?.length > 0 ||
    results.invoices?.length > 0 ||
    results.medicines?.length > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />

      {/* Search Box */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients, doctors, appointments, invoices, prescriptions, medicines..."
            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-sm sm:text-base font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-4">
          {isLoading && (
            <div className="py-8 text-center text-sm text-slate-400 animate-pulse">
              Searching hospital records...
            </div>
          )}

          {!isLoading && query.length >= 2 && !hasAnyResults && (
            <div className="py-8 text-center text-sm text-slate-500">
              No hospital records matching <span className="font-semibold text-slate-700">"{query}"</span>
            </div>
          )}

          {!isLoading && !query && (
            <div className="py-8 text-center text-xs text-slate-400">
              Type at least 2 characters to search across all MediCare hospital data.
            </div>
          )}

          {/* Patients */}
          {results?.patients?.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-600" /> Patients ({results.patients.length})
              </p>
              <div className="space-y-1">
                {results.patients.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(`/patients/${p.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50 text-left transition group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-sky-700">
                        {p.fullName}{' '}
                        <span className="text-xs font-normal text-slate-400">({p.patientId})</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Age {p.age} • Blood Group: {p.bloodGroup} • Phone: {p.phone}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Doctors */}
          {results?.doctors?.length > 0 && (
            <div className="pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" /> Doctors ({results.doctors.length})
              </p>
              <div className="space-y-1">
                {results.doctors.map((d: any) => (
                  <button
                    key={d.id}
                    onClick={() => handleSelect(`/doctors/${d.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-teal-50 text-left transition group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-700">
                        {d.name}{' '}
                        <span className="text-xs font-normal text-teal-600">({d.specialization})</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {d.departmentName} • Room: {d.roomNumber || 'OPD'} • Fee: ₹{d.consultationFee}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {results?.invoices?.length > 0 && (
            <div className="pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-rose-600" /> Invoices & Bills ({results.invoices.length})
              </p>
              <div className="space-y-1">
                {results.invoices.map((inv: any) => (
                  <button
                    key={inv.id}
                    onClick={() => handleSelect(`/billing/invoices/${inv.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-rose-50 text-left transition group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-rose-700">
                        Invoice #{inv.invoiceNumber} — {inv.patientName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Total: ₹{inv.totalAmount.toLocaleString('en-IN')} • Status: {inv.status}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Medicines */}
          {results?.medicines?.length > 0 && (
            <div className="pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-amber-600" /> Pharmacy Medicines ({results.medicines.length})
              </p>
              <div className="space-y-1">
                {results.medicines.map((m: any) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelect(`/pharmacy`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 text-left transition group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-amber-700">
                        {m.name}{' '}
                        <span className="text-xs font-normal text-slate-400">({m.medicineCode})</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Stock: {m.currentStock} {m.unit}s • Price: ₹{m.sellingPrice} • Batch: {m.batchNumber}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
