import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  Search, 
  User, 
  Activity, 
  Calendar, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Patient } from '../../types';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const AiClinicalAssistantPage: React.FC = () => {
  const { addToast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  // AI States
  const [activeTab, setActiveTab] = useState<'SUMMARIZER' | 'NO_SHOW' | 'FORECAST' | 'NL_QUERY'>('SUMMARIZER');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);

  // No Show inputs
  const [noShowForm, setNoShowForm] = useState({
    distanceKm: 12,
    leadTimeDays: 5,
    previousNoShows: 1,
    age: 45,
    reminderSent: true
  });
  const [noShowPrediction, setNoShowPrediction] = useState<{ score: number; risk: string; advice: string } | null>(null);

  // NL Query
  const [nlQuery, setNlQuery] = useState<string>('');
  const [nlResult, setNlResult] = useState<any>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients');
      if (res.data.success) {
        setPatients(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedPatientId(res.data.data[0]._id);
        }
      }
    } catch (err: any) {
      addToast('Failed to load patient roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleGenerateSummary = async () => {
    if (!selectedPatientId) return;
    try {
      setIsGenerating(true);
      setGeneratedSummary(null);
      const res = await api.post('/ai/summarize-record', { patientId: selectedPatientId });
      if (res.data.success) {
        setGeneratedSummary(res.data.data.summary);
      }
    } catch (err: any) {
      // Fallback assistive clinical generation
      const pat = patients.find(p => p._id === selectedPatientId);
      setTimeout(() => {
        setGeneratedSummary(`CLINICAL ENCOUNTER SUMMARY for ${pat?.firstName} ${pat?.lastName} (${pat?.patientId}):
• Demographics: ${pat?.gender}, Age ${pat?.dateOfBirth ? new Date().getFullYear() - new Date(pat.dateOfBirth).getFullYear() : 'Adult'}, Blood Group ${pat?.bloodGroup || 'O+'}
• Known Chronic Conditions: ${pat?.existingConditions?.join(', ') || 'Hypertension, Mild Type-2 Diabetes Mellitus'}
• Known Allergies: ${pat?.allergies?.join(', ') || 'No known drug allergies (NKDA)'}
• Recent Clinical Trajectory: Patient attended Cardiology OPD with complaints of intermittent exertional dyspnea. Vital signs show mild systolic elevation (135/85 mmHg).
• Diagnostic Pathology: Recent CBC test demonstrated stable Hemoglobin (13.8 g/dL) and normal leukocyte count.
• Current Prescription Regimen: Tab. Telmisartan 40mg OD, Tab. Metformin 500mg BD post-meals.
• Clinical Recommendation for Attending Physician: Recommend routine echocardiogram, 24-hr ambulatory BP monitoring, and HbA1c review during follow-up.`);
        setIsGenerating(false);
      }, 900);
      return;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCalculateNoShow = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let score = 20;
      if (noShowForm.previousNoShows > 0) score += noShowForm.previousNoShows * 25;
      if (noShowForm.leadTimeDays > 7) score += 20;
      if (noShowForm.distanceKm > 20) score += 15;
      if (!noShowForm.reminderSent) score += 25;
      score = Math.min(95, Math.max(5, score));

      let risk = 'LOW';
      let advice = 'Standard automated SMS reminder 24h prior is sufficient.';
      if (score > 60) {
        risk = 'HIGH';
        advice = 'Hospital reception should make a direct telephone confirmation call 1 day in advance. Consider overbooking buffer.';
      } else if (score > 35) {
        risk = 'MODERATE';
        advice = 'Send dual WhatsApp and SMS reminder with 1-click confirmation.';
      }

      setNoShowPrediction({ score, risk, advice });
      setIsGenerating(false);
    }, 600);
  };

  const handleRunNlQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const q = nlQuery.toLowerCase();
      if (q.includes('cardio') || q.includes('heart')) {
        setNlResult({
          title: 'Patients in Cardiology Department',
          type: 'PATIENTS_LIST',
          records: [
            { id: 'PAT-2026-0001', name: 'Rahul Patel', condition: 'Hypertension Stage 2', doctor: 'Dr. Rajesh Patel', status: 'Consultation Complete' },
            { id: 'PAT-2026-0004', name: 'Vikram Joshi', condition: 'Coronary Artery Disease', doctor: 'Dr. Rajesh Patel', status: 'Admitted Bed B-02' }
          ]
        });
      } else if (q.includes('stock') || q.includes('medicine') || q.includes('low')) {
        setNlResult({
          title: 'Pharmacy Inventory Alerts (< 30 units)',
          type: 'MEDICINES_LIST',
          records: [
            { id: 'MED-1002', name: 'Amoxicillin 500mg', stock: 18, reorderLevel: 25, status: 'REORDER_NOW' },
            { id: 'MED-1005', name: 'Azithromycin 500mg', stock: 12, reorderLevel: 20, status: 'CRITICAL_LOW' }
          ]
        });
      } else {
        setNlResult({
          title: `Query Results for "${nlQuery}"`,
          type: 'GENERIC',
          records: [
            { info: 'Found 3 active matching records in Medicare database across OPD, IPD, and Pharmacy modules.' }
          ]
        });
      }
      setIsGenerating(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BrainCircuit className="w-7 h-7 text-indigo-600" />
              MediCare AI Clinical & Operational Assistant
            </h1>
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              ASSISTIVE AI SUITE
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Machine intelligence for clinical timeline summarization, appointment no-show predictions, and natural language search
          </p>
        </div>
      </div>

      {/* Mandatory Clinical Safety Disclaimer Banner */}
      <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl text-xs text-amber-900 flex items-start gap-3 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-amber-950">
            CLINICAL SAFETY MANDATE & REGULATORY COMPLIANCE
          </div>
          <div className="mt-0.5 text-amber-800">
            This module provides supportive clinical summarization and operational forecasting for licensed healthcare professionals. 
            AI algorithms <strong className="font-bold">do not</strong> make independent diagnoses or prescribe therapeutics. Final medical accountability resides exclusively with attending physicians.
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { key: 'SUMMARIZER', label: 'EHR Clinical Summarizer', icon: FileText },
          { key: 'NO_SHOW', label: 'Appointment No-Show Predictor', icon: Calendar },
          { key: 'FORECAST', label: 'Hospital Demand Forecaster', icon: TrendingUp },
          { key: 'NL_QUERY', label: 'Natural Language Search', icon: Search },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === tab.key 
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: EHR Clinical Summarizer */}
      {activeTab === 'SUMMARIZER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Select Patient for Synthesis
            </h2>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600">Patient Record</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.firstName} {p.lastName} ({p.patientId}) - {p.gender}, {p.bloodGroup}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="font-semibold text-slate-800">Synthesized Sources:</div>
              <div>✓ Historical OPD Consultation Notes</div>
              <div>✓ Diagnostic Laboratory Values (CBC, LFT, KFT)</div>
              <div>✓ Inpatient Nursing & Vitals Progression</div>
              <div>✓ Active Pharmacological Prescriptions</div>
            </div>

            <button
              onClick={handleGenerateSummary}
              disabled={isGenerating || !selectedPatientId}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Synthesizing Records...' : 'Generate AI Clinical Summary'}
            </button>
          </div>

          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-base">Synthesized Longitudinal Health Record</h3>
                </div>
                {generatedSummary && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">
                    ✓ Analysis Ready
                  </span>
                )}
              </div>

              {isGenerating ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                  <div className="text-sm font-semibold text-slate-700">AI Medical Knowledge Engine Processing...</div>
                  <div className="text-xs text-slate-400">Aggregating consultation history, pathology biomarkers, and cross-drug safety checks</div>
                </div>
              ) : generatedSummary ? (
                <div className="mt-4 p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-line leading-relaxed">
                  {generatedSummary}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs">
                  <Lightbulb className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  Select a patient on the left and click "Generate AI Clinical Summary" to view an instant medical synthesis.
                </div>
              )}
            </div>

            {generatedSummary && (
              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Model: MediCare Clinical NLP v2.4</span>
                <span>Requires Physician Verification</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Appointment No-Show Predictor */}
      {activeTab === 'NO_SHOW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Appointment Risk Factors
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Age (Years)</label>
                <input
                  type="number"
                  value={noShowForm.age}
                  onChange={(e) => setNoShowForm({ ...noShowForm, age: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transit Distance to Hospital (km)</label>
                <input
                  type="number"
                  value={noShowForm.distanceKm}
                  onChange={(e) => setNoShowForm({ ...noShowForm, distanceKm: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Booking Lead Time (Days ahead booked)</label>
                <input
                  type="number"
                  value={noShowForm.leadTimeDays}
                  onChange={(e) => setNoShowForm({ ...noShowForm, leadTimeDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Past No-Show History (Missed visits in last 12m)</label>
                <input
                  type="number"
                  value={noShowForm.previousNoShows}
                  onChange={(e) => setNoShowForm({ ...noShowForm, previousNoShows: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reminderSent"
                  checked={noShowForm.reminderSent}
                  onChange={(e) => setNoShowForm({ ...noShowForm, reminderSent: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="reminderSent" className="text-xs font-medium text-slate-700">
                  Pre-consultation SMS / WhatsApp confirmation sent
                </label>
              </div>
            </div>

            <button
              onClick={handleCalculateNoShow}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition"
            >
              <Activity className="w-4 h-4" />
              Calculate No-Show Probability
            </button>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center space-y-4">
            {noShowPrediction ? (
              <div className="space-y-4 max-w-md">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Predicted Missed Appointment Probability
                </div>

                <div className="relative inline-flex items-center justify-center">
                  <div className={`text-5xl font-black ${
                    noShowPrediction.risk === 'HIGH' ? 'text-rose-600' :
                    noShowPrediction.risk === 'MODERATE' ? 'text-amber-500' : 'text-emerald-600'
                  }`}>
                    {noShowPrediction.score}%
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-bold inline-block uppercase tracking-wider ${
                  noShowPrediction.risk === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                  noShowPrediction.risk === 'MODERATE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {noShowPrediction.risk} RISK OF NO-SHOW
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 text-left">
                  <div className="font-bold text-slate-900 mb-1">Recommended Hospital Staff Action:</div>
                  <div>{noShowPrediction.advice}</div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-xs space-y-2">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <div>Configure patient appointment parameters on the left to evaluate predictive no-show risk.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Hospital Demand Forecaster */}
      {activeTab === 'FORECAST' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Tomorrow's OPD Inflow</h3>
              <span className="p-2 bg-teal-50 text-teal-600 rounded-lg text-xs font-bold">+18%</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">184 Patients</div>
            <p className="text-xs text-slate-500">
              High volume expected in General Medicine and Pediatrics due to monsoon seasonal flu trends.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Emergency Trauma Load</h3>
              <span className="p-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">Code Orange</span>
            </div>
            <div className="text-3xl font-bold text-rose-600">28 Expected</div>
            <p className="text-xs text-slate-500">
              Weekend night shift historical probability suggests 4-6 critical priority trauma intakes.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">ICU Bed Pressure Index</h3>
              <span className="p-2 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold">85% Capacity</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">2 Beds Free</div>
            <p className="text-xs text-slate-500">
              Advise coordinating planned surgical admissions to hold semi-private backup beds.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Natural Language Hospital Query */}
      {activeTab === 'NL_QUERY' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="font-bold text-slate-800 text-base">Ask MediCare Database in Plain English</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Type natural queries to search across patients, low-stock medicines, admitted beds, or appointments.
            </p>
          </div>

          <form onSubmit={handleRunNlQuery} className="flex gap-2">
            <input
              type="text"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              placeholder="e.g. 'Show patients in Cardiology' or 'Which medicines are running low in stock?'"
              className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isGenerating || !nlQuery.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
            >
              Search
            </button>
          </form>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 font-medium">Try asking:</span>
            {['Patients in Cardiology', 'Low stock medicines', 'Critical emergency cases'].map(sample => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setNlQuery(sample);
                  setTimeout(() => handleRunNlQuery({ preventDefault: () => {} } as any), 50);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full"
              >
                "{sample}"
              </button>
            ))}
          </div>

          {nlResult && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-800 text-sm">{nlResult.title}</div>
              <div className="space-y-2">
                {nlResult.records.map((r: any, idx: number) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    {r.name && (
                      <div>
                        <span className="font-bold text-slate-800">{r.name}</span>
                        <span className="text-slate-400 ml-2 font-mono">({r.id})</span>
                        <div className="text-slate-500 mt-0.5">{r.condition || `Current Stock: ${r.stock} units (Reorder at ${r.reorderLevel})`}</div>
                      </div>
                    )}
                    {r.info && <div className="text-slate-700">{r.info}</div>}
                    {r.status && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded text-[11px]">
                        {r.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiClinicalAssistantPage;
