import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { QUALIFICATIONS, ROLES, ORGANIZATIONS } from '../mockData';

interface Props { onClose: () => void; }

const ProfileEditModal: React.FC<Props> = ({ onClose }) => {
  const { state, updateProfile } = useAppContext();
  const user = state.user!;
  const [form, setForm] = useState({
    fullName: user.fullName,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    age: user.age,
    qualification: user.qualification,
    role: user.role,
    organization: user.organization,
    currentAssignment: user.currentAssignment ?? '',
    experienceYears: user.experienceYears,
    experienceMonths: user.experienceMonths,
    previousTraining: user.previousTraining ?? '',
    technicalSkills: user.technicalSkills ?? '',
    statisticalSkills: user.statisticalSkills ?? '',
  });

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100" aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <input type="date" className="input" value={form.dateOfBirth}
              onChange={(e) => {
                const dob = e.target.value;
                const age = dob ? Math.max(0, new Date().getFullYear() - new Date(dob).getFullYear()) : 0;
                setForm((f) => ({ ...f, dateOfBirth: dob, age }));
              }} />
          </div>
          <div>
            <label className="label">Age</label>
            <input type="number" min={0} max={80} className="input" value={form.age}
              onChange={(e) => set('age', parseInt(e.target.value, 10) || 0)} />
          </div>
          <div>
            <label className="label">Qualification</label>
            <select className="input" value={form.qualification} onChange={(e) => set('qualification', e.target.value)}>
              <option value="">Select</option>
              {QUALIFICATIONS.map((q) => <option key={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Role in Statistical Department</label>
            <select className="input" value={form.role} onChange={(e) => set('role', e.target.value)} required>
              <option value="">Select role</option>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Organization</label>
            <select className="input" value={form.organization} onChange={(e) => set('organization', e.target.value)}>
              <option value="">Select</option>
              {ORGANIZATIONS.map((o) => <option key={o}>{o}</option>)}
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Current Assignment</label>
            <input className="input" value={form.currentAssignment} onChange={(e) => set('currentAssignment', e.target.value)} />
          </div>
          <div>
            <label className="label">Experience — Years</label>
            <input type="number" min={0} max={40} className="input" value={form.experienceYears}
              onChange={(e) => set('experienceYears', parseInt(e.target.value, 10) || 0)} />
          </div>
          <div>
            <label className="label">Experience — Months</label>
            <input type="number" min={0} max={11} className="input" value={form.experienceMonths}
              onChange={(e) => set('experienceMonths', parseInt(e.target.value, 10) || 0)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Previous Training / Capacity Building</label>
            <textarea className="input min-h-24" value={form.previousTraining} onChange={(e) => set('previousTraining', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Existing Technical Skills</label>
            <textarea className="input min-h-24" value={form.technicalSkills} onChange={(e) => set('technicalSkills', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Existing Statistical Skills</label>
            <textarea className="input min-h-24" value={form.statisticalSkills} onChange={(e) => set('statisticalSkills', e.target.value)} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
