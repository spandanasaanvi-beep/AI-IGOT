import React from 'react';
import { Loader2 } from 'lucide-react';

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="card p-10 text-center">
    {icon && <div className="flex justify-center mb-4 text-slate-300">{icon}</div>}
    <h3 className="font-bold text-slate-800">{title}</h3>
    {description && <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto">{description}</p>}
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
);

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="card p-10 text-center">
    <Loader2 size={30} className="mx-auto animate-spin text-primary-700" />
    <p className="text-sm text-slate-500 mt-3">{label}</p>
  </div>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; sub?: string }> = ({ children, sub }) => (
  <div className="mb-4">
    <h2 className="text-xl font-bold text-slate-900">{children}</h2>
    {sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}
  </div>
);

export const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: 'blue' | 'green' | 'amber' | 'slate';
}> = ({ icon, label, value, hint, tone = 'blue' }) => {
  const tones: Record<string, string> = {
    blue: 'bg-primary-50 text-primary-800',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-accent-50 text-accent-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <div className="card card-hover p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{value}</p>
          {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
        </div>
        <div className={`w-11 h-11 rounded-md flex items-center justify-center ${tones[tone]}`}>{icon}</div>
      </div>
    </div>
  );
};
