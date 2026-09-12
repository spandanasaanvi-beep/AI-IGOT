import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, RefreshCw, Play, ArrowRight, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { EmptyState, SectionTitle } from '../components/EmptyState';
import { useToast } from '../components/Toast';

const AdaptiveRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const { state, refreshRecommendations, updateResourceProgress, isReady } = useAppContext();
  const { notify } = useToast();

  useEffect(() => {
    refreshRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.competencies]);

  const gaps = state.competencies
    .filter((c) => c.currentScore < c.requiredScore)
    .sort((a, b) => b.gap - a.gap);

  if (!state.competencies.length) {
    return (
      <EmptyState
        icon={<ClipboardCheck size={44} />}
        title="Nothing to adapt yet"
        description="Adaptive recommendations are recalculated after every assessment and quiz. Take the initial assessment first."
        action={<button className="btn-primary" onClick={() => navigate('/initial-assessment')}>Take Initial Assessment</button>}
      />
    );
  }

  const start = (id: string, url: string) => {
    updateResourceProgress(id, 5);
    notify('info', 'Continuing on iGOT Karmayogi.');
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle sub="Recalculated after every assessment and quiz — always based on your latest scores">
            <span className="flex items-center gap-2"><Compass size={20} className="text-primary-800" /> Adaptive Recommendations</span>
          </SectionTitle>
          <button className="btn-secondary !py-2" onClick={refreshRecommendations}>
            <RefreshCw size={14} /> Recalculate Now
          </button>
        </div>

        {isReady ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-md p-5 text-center">
            <CheckCircle2 size={26} className="text-emerald-600 mx-auto" />
            <p className="font-bold text-emerald-800 mt-2">All required competencies achieved</p>
            <p className="text-sm text-emerald-700 mt-1">No further learning is required — proceed to your report and certificate.</p>
            <div className="flex justify-center gap-3 mt-4">
              <button className="btn-secondary !py-2" onClick={() => navigate('/reports')}>View Report</button>
              <button className="btn-primary !py-2" onClick={() => navigate('/certificate')}>Get Certificate</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {gaps.map((c) => {
              const rec = state.resources.find((r) => r.competency === c.name && r.status !== 'completed');
              return (
                <div key={c.competencyId} className="border border-slate-200 rounded-md p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        {c.name}
                        <span className="badge bg-amber-50 text-amber-700 border border-amber-200">⚠ Below required level</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Current {c.currentScore}% · Required {c.requiredScore}% · Remaining gap {c.gap} pts
                      </p>
                    </div>
                    <span className="progress-bar w-32 !h-2 self-center">
                      <span className="progress-fill bg-amber-500 block" style={{ width: `${Math.min(100, c.currentScore)}%` }} />
                    </span>
                  </div>
                  {rec ? (
                    <div className="mt-4 bg-slate-50 border border-slate-200 rounded-md p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Recommended next</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">{rec.title} {rec.module ? `— ${rec.module}` : ''}</p>
                      <p className="text-xs text-slate-500 mt-1">{rec.duration} · {rec.type} · {rec.provider}</p>
                      <div className="flex flex-wrap gap-2.5 mt-3">
                        <button className="btn-primary !py-2" onClick={() => start(rec.id, rec.igotUrl)}>
                          <Play size={14} /> {rec.status === 'in-progress' ? 'Continue Learning' : 'Start Learning'}
                        </button>
                        <button className="btn-secondary !py-2" onClick={() => navigate('/quiz')}>
                          Test This Competency <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-3">Complete your current recommended learning to unlock the next module.</p>
                  )}
                </div>
              );
            })}
            {!gaps.length && null}
          </div>
        )}
      </div>

      {/* Loop explainer */}
      <div className="card p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-3">The continuous improvement loop</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-primary-800">
          {['Assess', 'Identify Gaps', 'Recommend', 'Learn', 'Test', 'Measure', 'Improve', 'Reassess', 'Certify'].map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <ArrowRight size={12} className="text-slate-300" />}
              <span className="px-2.5 py-1 rounded-full bg-primary-50 border border-primary-100">{s}</span>
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          PragatiAI transforms competency development from a one-time assessment into a continuous personalized learning journey.
        </p>
      </div>
    </div>
  );
};

export default AdaptiveRecommendations;
