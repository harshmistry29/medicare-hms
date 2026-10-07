import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Stethoscope, 
  Heart, 
  Brain, 
  Bone, 
  Baby, 
  FlaskConical, 
  Pill, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  BedDouble,
  DollarSign
} from 'lucide-react';
import { AppointmentBookingModal } from '../../components/forms/AppointmentBookingModal';

export const HospitalServicesDirectoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const services = [
    {
      id: 'SERV-01',
      name: 'Comprehensive Cardiac Health Package',
      category: 'PACKAGES',
      dept: 'Cardiology',
      desc: 'Includes 2D Echo, TMT stress test, Lipid profile, ECG, and Senior Cardiologist consultation.',
      cost: 4500,
      duration: 'Half Day',
      icon: Heart,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
    {
      id: 'SERV-02',
      name: 'Advanced Stroke & Neuro-Rehab Care',
      category: 'SPECIALTY',
      dept: 'Neurology',
      desc: '24/7 acute stroke thrombolysis protocol, digital EEG telemetry, and specialized physiotherapy.',
      cost: 8500,
      duration: 'Clinical Stay',
      icon: Brain,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      id: 'SERV-03',
      name: 'Minimally Invasive Joint Arthroscopy',
      category: 'SURGERY',
      dept: 'Orthopedics',
      desc: 'Advanced arthroscopic knee/shoulder ligament repair with rapid post-op rehabilitation.',
      cost: 45000,
      duration: 'Day Care',
      icon: Bone,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      id: 'SERV-04',
      name: 'Neonatal & Pediatric Intensive Care (NICU)',
      category: 'INPATIENT',
      dept: 'Pediatrics',
      desc: 'Level-3 NICU equipped with high-frequency ventilators, phototherapy, and dedicated neonatologists.',
      cost: 6500,
      duration: 'Per Day',
      icon: Baby,
      color: 'text-pink-600 bg-pink-50 border-pink-100',
    },
    {
      id: 'SERV-05',
      name: 'Executive Whole Body Diagnostic Health Screen',
      category: 'PACKAGES',
      dept: 'Pathology & Radiology',
      desc: '64-parameter blood panel (CBC, LFT, KFT, HbA1c), Chest X-Ray, Ultrasound Abdomen, and Physician review.',
      cost: 3200,
      duration: '2 Hours',
      icon: FlaskConical,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
    },
    {
      id: 'SERV-06',
      name: '24/7 Critical Trauma Resuscitation & ICU',
      category: 'EMERGENCY',
      dept: 'Emergency & Critical Care',
      desc: 'Level-1 emergency triage, surgical trauma team on-call, blood bank access, and crash cart facilities.',
      cost: 12000,
      duration: 'Immediate',
      icon: Stethoscope,
      color: 'text-red-600 bg-red-50 border-red-100',
    },
  ];

  const categories = ['ALL', 'PACKAGES', 'SPECIALTY', 'SURGERY', 'INPATIENT', 'EMERGENCY'];

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.dept.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'ALL' || s.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Hospital Services & Health Packages Directory
            </h1>
            <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
              NABH Accredited
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explore outpatient clinics, clinical diagnostic packages, surgical procedures, and inpatient wards
          </p>
        </div>

        <button
          onClick={() => setIsBookingOpen(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Consultation</span>
        </button>
      </div>

      {/* Filter and Category Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search service, package, or department..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-xs text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${service.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {service.category}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900">{service.name}</h3>
                <div className="text-xs font-semibold text-teal-700 mt-1">{service.dept}</div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{service.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Standard Tariff</div>
                  <div className="text-base font-extrabold text-slate-900 font-mono">
                    ₹{service.cost.toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] text-slate-400 font-sans font-normal">({service.duration})</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5"
                >
                  <span>Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      <AppointmentBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => setIsBookingOpen(false)}
      />
    </div>
  );
};

export default HospitalServicesDirectoryPage;
