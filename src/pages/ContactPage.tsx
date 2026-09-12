import React, { useState } from 'react';
import { Mail, Phone, Send, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SectionTitle } from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { CONTACT_EMAIL, CONTACT_PHONE } from '../mockData';

const ContactPage: React.FC = () => {
  const { addContactMessage, state } = useAppContext();
  const { notify } = useToast();

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email address.';
    if (!form.subject.trim()) errs.subject = 'Please enter a subject.';
    if (form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    addContactMessage(form);
    setSent(true);
    notify('success', 'Message sent successfully — the team will respond by email.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <span className="w-11 h-11 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
            <Mail size={20} className="text-primary-800" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm font-semibold text-primary-800 hover:underline break-all">
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <span className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <Phone size={20} className="text-emerald-700" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mobile</p>
            <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="text-sm font-semibold text-slate-800 hover:underline">
              {CONTACT_PHONE}
            </a>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <SectionTitle sub="Questions about the platform, partnerships or feedback — write to us">
          Contact Team
        </SectionTitle>

        {sent && (
          <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-md p-4 flex items-start gap-3 animate-fadeIn">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-800">Message sent successfully</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Thank you for reaching out. Your message has been recorded locally in this prototype
                ({state.contactMessages.length} message{state.contactMessages.length === 1 ? '' : 's'} stored).
              </p>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4" noValidate>
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your full name" />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="label">Subject</label>
            <input className="input" value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="What is this about?" />
            {errors.subject && <p className="text-xs text-red-600 mt-1">{errors.subject}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="label">Message</label>
            <textarea className="input min-h-28" value={form.message} onChange={(e) => set('message', e.target.value)}
              placeholder="Write your message here…" />
            {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message}</p>}
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" className="btn-primary">
              <Send size={15} /> Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
