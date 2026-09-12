import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { GitCompareArrows, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { EmptyState, SectionTitle, StatCard } from '../components/EmptyState';
import { ClipboardList } from 'lucide-react';

const BeforeVsAfter: React.FC = () => {
  const navigate = useNavigate();
  const { state, roleReadiness } = useAppContext();

  if (!state.competencies.length || state.assessments.length < 1) {
    return (
      <EmptyState
        icon={<ClipboardList size={44} />}
        title="No comparison data yet"
        description="The before/after view appears once an initial assessment and subsequent quizzes are recorded."
        action={<button className="btn-primary" onClick={() => navigate('/initial-assessment')}>Take Initial Assessment</button>}
      />
    );
  }

  const comparisons = state.competencies.map((c) => ({
    name: c.name,
    short: c.name.length > 12 ? c.name.split(' ').map((w) => w[0]).join('') : c.name,
    before: c.initialScore,
    after: c.latestScore,
    required: c.requiredScore,
    delta: c.latestScore - c.initialScore,
  }));

  const improved = comparisons.filter((c) => c.delta > 0);
  const declined = comparisons.filter((c) => c.delta < 0);
  const flat = comparisons.filter((c) => c.delta === 0);
  const avgDelta = Math.round(comparisons.reduce((s, c) => s + c.delta, 0) / comparisons.length);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp size={20} />} label="Improved" value={improved.length} tone="green" />
        <StatCard icon={<Minus size={20} />} label="Unchanged" value={flat.length} tone="slate" />
        <StatCard icon={<TrendingDown size={20} />} label="Declined" value={declined.length} tone={declined.length ? 'amber' : 'green'} />
        <StatCard icon={<GitCompareArrows size={20} />} label="Avg. Change" value={`${avgDelta >= 0 ? '+' : ''}${avgDelta} pts`} tone={avgDelta >= 0 ? 'green' : 'amber'} />
      </div>

      {/* Grouped bar chart */}
      <div className="card p-6">
        <SectionTitle sub={`Initial assessment vs latest measured score · role readiness ${roleReadiness}%`}>
          Competency Journey
        </SectionTitle>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisons} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="short" tick={{ fontSize: 11 }} interval={0} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v}%`} labelFormatter={(_, p) => (p?.[0]?.payload?.name as string) ?? ''} />
              <Legend />
              <ReferenceLine y={comparisons[0].required} stroke="#f97d0c" strokeDasharray="4 4"
                label={{ value: 'Required', position: 'insideTopRight', fontSize: 10, fill: '#ea6002' }} />
              <Bar dataKey="before" name="Before (initial)" fill="#94a3b8" radius={[3, 3, 0, 0]} />
              <Bar dataKey="after" name="After (latest)" fill="#274fd6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-competency deltas — honest about declines */}
      <div className="card p-6">
        <SectionTitle sub="Deltas are computed from stored assessments — decreases are shown honestly">
          Detailed Comparison
        </SectionTitle>
        <div className="space-y-4">
          {comparisons.map((c) => {
            const up = c.delta > 0;
            const down = c.delta < 0;
            const achieved = c.after >= c.required;
            return (
              <div key={c.name} className="flex flex-col sm:flex-row sm:items-center gap-3 py-1">
                <div className="sm:w-52 shrink-0">
                  <p className="text-sm font-bold text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {c.before}% → {c.after}% · required {c.required}%
                  </p>
                </div>
                <div className="flex-1">
                  <div className="progress-bar !h-2">
                    <div className="progress-fill bg-slate-300" style={{ width: `${Math.min(100, c.before)}%` }} />
                  </div>
                  <div className="progress-bar !h-2 -mt-2">
                    <div className={`progress-fill ${achieved ? 'bg-emerald-600' : 'bg-primary-700'}`}
                      style={{ width: `${Math.min(100, c.after)}%`, opacity: 0.85 }} />
                  </div>
                </div>
                <span className={`badge shrink-0 ${
                  down ? 'bg-red-50 text-red-700 border border-red-200'
                  : up ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
                }`}>
                  {down ? <><TrendingDown size={12} /> Performance decreased ({c.delta})</>
                    : up ? <><TrendingUp size={12} /> +{c.delta} pts</>
                    : <>No change</>}
                </span>
              </div>
            );
          })}
        </div>
        {state.assessments.length < 2 && (
          <p className="text-xs text-slate-400 mt-4">
            Tip: complete a generated quiz after learning — new measurements appear here automatically.
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button className="btn-primary" onClick={() => navigate('/adaptive')}>
          View Adaptive Recommendations
        </button>
      </div>
    </div>
  );
};

export default BeforeVsAfter;
