import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Clock, 
  User, 
  Terminal, 
  Filter, 
  Activity,
  Calendar,
  Lock,
  Eye
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AuditLog } from '../../types';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const AuditLogsPage: React.FC = () => {
  const { addToast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const action = log.action || '';
    const resource = log.resource || '';
    const userStr = typeof log.userId === 'object' && log.userId ? `${log.userId.firstName} ${log.userId.lastName} ${log.userId.email}` : '';
    const ip = log.ipAddress || '';

    const matchesSearch = 
      action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ip.includes(searchTerm);

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('DELETE') || action.includes('CANCEL') || action.includes('EMERGENCY')) return 'error';
    if (action.includes('CREATE') || action.includes('DISPENSE') || action.includes('PAID')) return 'success';
    if (action.includes('LOGIN') || action.includes('UPDATE')) return 'info';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-teal-600" />
            Hospital Compliance & Security Audit Logs
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Immutable trace of system events, authentication, clinical record access, and financial transactions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
            <Lock className="w-3.5 h-3.5" />
            Tamper-Proof Audit Trail Active
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Action, User, Resource, or IP..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['ALL', 'LOGIN', 'PATIENT_CREATED', 'CONSULTATION_COMPLETED', 'PRESCRIPTION_CREATED', 'PAYMENT_RECORDED'].map(act => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                actionFilter === act 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {act.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          title="No Audit Logs Found"
          description="There are currently no security or operational events matching your filter parameters."
          icon={ShieldCheck}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Timestamp (IST)</th>
                  <th className="py-3.5 px-4">Action Event</th>
                  <th className="py-3.5 px-4">User Identity</th>
                  <th className="py-3.5 px-4">Resource Target</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredLogs.map((log) => {
                  const userObj = typeof log.userId === 'object' && log.userId ? log.userId : null;

                  return (
                    <tr key={log._id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 text-slate-600 text-xs font-mono">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(log.createdAt).toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {userObj ? `${userObj.firstName} ${userObj.lastName}` : (log.userName || 'System / Service')}
                        </div>
                        <div className="text-xs text-slate-400">
                          {userObj?.role || log.userRole || 'Automated'} • {userObj?.email || ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-medium text-xs bg-slate-100 px-2 py-1 rounded inline-block font-mono">
                          {log.resource}
                        </div>
                        {log.resourceId && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            ID: {String(log.resourceId).slice(0, 16)}...
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-teal-600 hover:bg-teal-50 text-xs font-semibold rounded transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Detail & Metadata"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 font-medium">Event Action:</span>
                <div className="font-bold text-slate-800 mt-0.5">{selectedLog.action}</div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Timestamp:</span>
                <div className="font-bold text-slate-800 mt-0.5">{new Date(selectedLog.createdAt).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">IP Address:</span>
                <div className="font-mono text-slate-800 mt-0.5">{selectedLog.ipAddress || '127.0.0.1'}</div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Target Resource:</span>
                <div className="font-mono text-slate-800 mt-0.5">{selectedLog.resource}</div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                Raw Payload Metadata
              </div>
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs overflow-x-auto font-mono">
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogsPage;
