import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Stethoscope, 
  Calendar, 
  Phone, 
  MapPin, 
  Plus, 
  ArrowRight,
  Heart,
  Brain,
  Bone,
  Baby,
  FlaskConical,
  Pill,
  Sparkles
} from 'lucide-react';
import { departmentsApi } from '../../services/api';
import { IDepartment } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { AppointmentBookingModal } from '../../components/forms/AppointmentBookingModal';

export const DepartmentListPage: React.FC = () => {
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentsApi.getAll();
        if (res.data.success) setDepartments(res.data.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDepts();
  }, []);

  const getDeptIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('cardio')) return Heart;
    if (n.includes('neuro')) return Brain;
    if (n.includes('ortho')) return Bone;
    if (n.includes('pedia')) return Baby;
    if (n.includes('path') || n.includes('lab')) return FlaskConical;
    if (n.includes('pharm')) return Pill;
    return Stethoscope;
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Hospital Clinical Departments
            </h1>
            <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
              11 Active Wings
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Specialized clinical divisions, outpatient consultation wings, diagnostic labs, and critical care units
          </p>
        </div>

        <button
          onClick={() => setIsBookingOpen(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Department Visit</span>
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map(dept => {
            const Icon = getDeptIcon(dept.name);
            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                      {dept.code}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mb-1">{dept.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{dept.description || 'Specialized clinical outpatient & surgical care division.'}</p>

                  <div className="space-y-2 text-xs py-3 border-y border-slate-100 text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dept.locationFloor || 'Wing A, Level 2'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{dept.contactNumber || '+91 22 2890-4410'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold">
                  <span className="text-teal-700 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5" /> {dept.doctorCount || 3} Specialists
                  </span>
                  
                  <button
                    onClick={() => setIsBookingOpen(true)}
                    className="p-1.5 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition flex items-center gap-1 font-bold text-xs"
                  >
                    <span>Consult</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      <AppointmentBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => setIsBookingOpen(false)}
      />
    </div>
  );
};

export default DepartmentListPage;
