import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, Filter, ChevronRight, Phone, Mail, Droplet, User, ArrowUpRight } from 'lucide-react';
import { patientsApi } from '../../services/api';
import { IPatient } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { PatientFormModal } from '../../components/forms/PatientFormModal';

export const PatientListPage: React.FC = () => {
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [gender, setGender] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const res = await patientsApi.getAll({
        search: search || undefined,
        bloodGroup: bloodGroup || undefined,
        gender: gender || undefined,
        limit: 50,
      });
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, bloodGroup, gender]);

  const getInitials = (name?: string) => {
    if (!name) return 'P';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Patient Master Directory (MPI)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Longitudinal electronic health records, emergency contacts, allergy profiles, and medical histories
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-sm shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Register New Patient
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient name, ID, or phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={bloodGroup}
            onChange={e => setBloodGroup(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none w-full sm:w-auto font-medium"
          >
            <option value="">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>

          <select
            value={gender}
            onChange={e => setGender(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none w-full sm:w-auto font-medium"
          >
            <option value="">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Patient Table */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients found"
          description="Try adjusting your search criteria or register a new patient."
          actionText="Register Patient"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Patient Name & ID</th>
                  <th className="py-3.5 px-4">Age / Gender</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Emergency Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="hover:bg-blue-50/40 cursor-pointer transition group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {getInitials(p.fullName)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                            {p.fullName}
                          </p>
                          <span className="font-mono text-[10px] text-slate-400">{p.patientId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {p.age} yrs • <span className="capitalize">{p.gender.toLowerCase()}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 text-[11px]">
                        <Droplet className="w-3 h-3" /> {p.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="font-semibold text-slate-800">{p.phone}</p>
                      {p.email && <p className="text-[10px] text-slate-400 truncate max-w-xs">{p.email}</p>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="font-semibold text-slate-800">{p.emergencyContactName}</p>
                      <p className="text-[10px] text-slate-500">
                        {p.emergencyContactRelation} ({p.emergencyContactPhone})
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/patients/${p.id}`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                        title="View Patient Record"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Modal */}
      <PatientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadPatients();
        }}
      />
    </div>
  );
};

export default PatientListPage;
