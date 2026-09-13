import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserRound, Briefcase } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { QUALIFICATIONS, ROLES, ORGANIZATIONS, PLATFORM_SUBNAME } from '../mockData';
import { ChakraMark } from '../components/Sidebar';

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { state, completeProfile } = useAppContext();
  const user = state.user;

  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    gender: '',
    dateOfBirth: '',
    age: 0,
    qualification: '',
    role: '',
    accountType: user?.accountType ?? 'Learner',
    organization: '',
    currentAssignment: '',
    experienceYears: 0,
    experienceMonths: 0,
    previousTraining: '',
    technicalSkills: '',
    statisticalSkills: '',
  });
  const [error, setError] = useState('');

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleDob = (dob: string) => {
    const age = dob ? Math.max(0, new Date().getFullYear() - new Date(dob).getFullYear()) : 0;
    setForm((f) => ({ ...f, dateOfBirth: dob, age }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role) return setError('Please select your role — the competency model is role-specific.');
    if (!form.dateOfBirth) return setError('Please provide your date of birth.');
    completeProfile(form);
    navigate('/initial-assessment', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="gov-strap" />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-card mb-3">
              <ChakraMark size={30} />
            </div>
            <h1 className="text-2xl font-extrabold text-primary-900">Pragati<span className="text-accent-500">AI</span></h1>
            <p className="text-xs text-slate-500 mt-1">{PLATFORM_SUBNAME}</p>
          </div>

          <form onSubmit={submit} className="card p-7 animate-fadeIn space-y-7">
            {/* Personal */}
            <fieldset>
              <legend className="flex items-center gap-2 text-sm font-bold text-primary-800 uppercase tracking-wide mb-4">
                <UserRound size={16} /> Personal Information
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Full Name</label>
                  <input className="input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select className="input" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Date of Birth</label>
                  <input type="date" className="input" value={form.dateOfBirth} onChange={(e) => handleDob(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Age (auto from DOB)</label>
                  <input type="number" className="input bg-slate-50" value={form.age || ''} readOnly placeholder="—" />
                </div>
              </div>
            </fieldset>

            {/* Professional */}
            <fieldset>
              <legend className="flex items-center gap-2 text-sm font-bold text-primary-800 uppercase tracking-wide mb-4">
                <Briefcase size={16} /> Professional Information
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Qualification</label>
                  <select className="input" value={form.qualification} onChange={(e) => set('qualification', e.target.value)}>
                    <option value="">Select</option>
                    {QUALIFICATIONS.map((q) => <option key={q}>{q}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Role in Statistical Department *</label>
                  <select className="input" value={form.role} onChange={(e) => set('role', e.target.value)} required>
                    <option value="">Select role</option>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Access Type</label>
                  <select
                    className="input"
                    value={form.accountType}
                    onChange={(e) => set('accountType', e.target.value as 'Learner' | 'Administrator')}
                  >
                    <option value="Learner">Learner</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="label">Organization Name</label>
                  <select className="input" value={form.organization} onChange={(e) => set('organization', e.target.value)}>
                    <option value="">Select</option>
                    {ORGANIZATIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Current Assignment / Department</label>
                  <input className="input" value={form.currentAssignment} onChange={(e) => set('currentAssignment', e.target.value)} placeholder="e.g. Survey Design Unit, State Statistical Bureau" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Experience (Years)</label>
                    <input type="number" min={0} max={40} className="input" value={form.experienceYears || ''}
                      onChange={(e) => set('experienceYears', parseInt(e.target.value, 10) || 0)} />
                  </div>
                  <div>
                    <label className="label">Months</label>
                    <input type="number" min={0} max={11} className="input" value={form.experienceMonths || ''}
                      onChange={(e) => set('experienceMonths', parseInt(e.target.value, 10) || 0)} />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Previous Training / Capacity Building</label>
                  <textarea className="input min-h-24" value={form.previousTraining} onChange={(e) => set('previousTraining', e.target.value)} placeholder="e.g. Survey methodology workshop, Python for data analysis, NSSTA training" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Existing Technical Skills</label>
                  <textarea className="input min-h-24" value={form.technicalSkills} onChange={(e) => set('technicalSkills', e.target.value)} placeholder="e.g. Excel, Python, SQL, GIS, data visualization" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Existing Statistical Skills</label>
                  <textarea className="input min-h-24" value={form.statisticalSkills} onChange={(e) => set('statisticalSkills', e.target.value)} placeholder="e.g. sampling, price statistics, national accounts, metadata standards" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Your role determines the required competency model used throughout the platform. You can edit all of this later from the sidebar.
              </p>
            </fieldset>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

            <button type="submit" className="btn-primary w-full">
              Save Profile &amp; Begin Assessment <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
