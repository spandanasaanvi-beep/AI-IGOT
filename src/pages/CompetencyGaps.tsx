import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { ArrowRight, CheckCircle2, BrainCircuit } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { generateInsight } from '../services/competencyEngine';
import { EmptyState, SectionTitle } from '../components/EmptyState';
import { ClipboardList } from 'lucide-react';

const CompetencyGaps: React.FC = () => {
  const navigate = useNavigate();
  const { state, roleReadiness, refreshRecommendations } = useAppContext();

  // Build recommendations once scores exist
  useEffect(() => {
    if (state.competencies.length && !state.resources.length) refreshRecommendations();
  }, [state.competencies.length, state.resources.length, refreshRecommendations]);

  const insight = useMemo(
    () => generateInsight(state.competencies),
    [state.competencies]
  );

  if (!state.competencies.length) {
    return (
      <EmptyState
        icon={<ClipboardList size={44} />}
        title="No assessment data yet"
        description="Complete your initial competency assessment to unlock the gap analysis."
        action={<button className="btn-primary" onClick={() => navigate('/initial-assessment')}>Take Initial Assessment</button>}
      />
    );
  }

  const chartData = state.competencies.map((c) => ({
    name: c.name.length > 14 ? c.name.split(' ').map((w) => w[0]).join('') : c.name,
    full: c.name,
    current: c.currentScore,
    required: c.requiredScore,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="card p-6">
        <SectionTitle sub={`Role: ${state.user?.role} · Overall readiness ${roleReadiness}%`}>
          Your Competency Analysis
        </SectionTitle>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v}%`} labelFormatter={(_, p) => (p?.[0]?.payload?.full as string) ?? ''} />
              <Legend />
              <ReferenceLine y={state.competencies[0].requiredScore} stroke="#f97d0c" strokeDasharray="4 4"
                label={{ value: 'Required', position: 'insideTopRight', fontSize: 10, fill: '#ea6002' }} />
              <Bar dataKey="current" name="Your score" fill="#274fd6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="required" name="Required" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-competency table */}
      <div className="card p-6">
        <SectionTitle sub="Status against the required level for your role">Competency Status</SectionTitle>
        <div className="space-y-4">
          {state.competencies.map((c) => {
            const achieved = c.currentScore >= c.requiredScore;
            return (
              <div key={c.competencyId} className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="sm:w-56 shrink-0">
                  <p className="text-sm font-bold text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {c.currentScore}% · required {c.requiredScore}% · gap {c.gap} pts
                  </p>
                </div>
                <div className="flex-1 progress-bar">
                  <div className={`progress-fill ${achieved ? 'bg-emerald-600' : c.gap > 20 ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, c.currentScore)}%` }} />
                </div>
                <span className={`badge shrink-0 ${
                  achieved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {achieved ? <>✓ Achieved</> : <>⚠ Needs Improvement</>}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI insight — generated from real stored scores */}
      <div className="card p-6 border-l-4 !border-l-primary-800">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
          <BrainCircuit size={17} className="text-primary-800" /> AI Learning Insight
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">{insight}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
          <CheckCircle2 size={16} /> Go to Dashboard
        </button>
        <button className="btn-primary" onClick={() => navigate('/learning-path')}>
          View Personalized Learning Path <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default CompetencyGaps;
