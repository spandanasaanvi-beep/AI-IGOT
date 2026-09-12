import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Route as RouteIcon, ExternalLink, Play, ArrowRight, BookOpen } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { EmptyState, SectionTitle } from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { ClipboardCheck } from 'lucide-react';

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border border-red-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  low: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const LearningPath: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateResourceProgress } = useAppContext();
  const { notify } = useToast();

  const resources = state.resources;

  if (!state.competencies.length) {
    return (
      <EmptyState
        icon={<ClipboardCheck size={44} />}
        title="No competency data yet"
        description="Complete the initial assessment so recommendations can be mapped to your actual gaps."
        action={<button className="btn-primary" onClick={() => navigate('/initial-assessment')}>Take Initial Assessment</button>}
      />
    );
  }

  const openResource = (id: string, igotUrl: string) => {
    updateResourceProgress(id, 5); // opening counts as starting
    notify('info', 'Learning started — resource opened on iGOT Karmayogi.');
    window.open(igotUrl, '_blank', 'noopener');
  };

  const markProgress = (id: string, progress: number) => {
    updateResourceProgress(id, progress);
    notify('success', progress >= 100 ? 'Learning completed! Take a quiz to measure improvement.' : `Progress updated to ${progress}%.`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="card p-6">
        <SectionTitle sub={`Generated from your ${state.user?.role} competency gaps — largest gaps get highest priority`}>
          <span className="flex items-center gap-2"><RouteIcon size={20} className="text-primary-800" /> Your Personalized Learning Path</span>
        </SectionTitle>
        {resources.length === 0 ? (
          <p className="text-sm text-slate-500">
            All competencies achieved — no further learning is required. Reassess anytime to keep your profile current.
          </p>
        ) : (
          <div className="space-y-4">
            {resources.map((r, i) => {
              const comp = state.competencies.find((c) => c.name === r.competency);
              return (
                <div key={r.id} className="border border-slate-200 rounded-md p-5 hover:shadow-card-hover transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                        <h3 className="font-bold text-slate-900">{r.title}</h3>
                        <span className={`badge ${PRIORITY_STYLES[r.priority]}`}>{r.priority.toUpperCase()} PRIORITY</span>
                        {r.module && <span className="badge bg-slate-100 text-slate-600">{r.module}</span>}
                      </div>
                      <p className="text-sm text-slate-600 mt-1.5">{r.description}</p>
                      <p className="text-xs text-slate-500 mt-1.5">
                        <strong>Mapped competency:</strong> {r.competency}
                        {comp && <> · current {comp.currentScore}% → required {comp.requiredScore}%</>}
                        {` · ${r.duration} · ${r.type}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">Reason: your current competency is below the required level.</p>
                    </div>
                    <span className={`badge shrink-0 ${
                      r.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : r.status === 'in-progress' ? 'bg-primary-50 text-primary-800 border border-primary-200'
                      : 'bg-slate-100 text-slate-600'
                    }`}>
                      {r.status === 'completed' ? '✓ Completed' : r.status === 'in-progress' ? 'In Progress' : 'Recommended'}
                    </span>
                  </div>

                  {r.progress > 0 && (
                    <div className="mt-3">
                      <div className="progress-bar !h-1.5">
                        <div className="progress-fill bg-primary-700" style={{ width: `${r.progress}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{r.progress}% complete</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5 mt-4">
                    <button
                      className={r.status === 'in-progress' ? 'btn-primary !py-2' : 'btn-primary !py-2'}
                      onClick={() => openResource(r.id, r.igotUrl)}
                    >
                      {r.status === 'in-progress' ? <><Play size={14} /> Continue Learning</> : <><BookOpen size={14} /> Start Learning</>}
                    </button>
                    {r.status === 'in-progress' && (
                      <>
                        <button className="btn-secondary !py-2" onClick={() => markProgress(r.id, r.progress + 25)}>
                          +25% Progress
                        </button>
                        <button className="btn-secondary !py-2" onClick={() => markProgress(r.id, 100)}>
                          Mark Complete
                        </button>
                      </>
                    )}
                    <a className="btn-secondary !py-2" href={r.igotUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} /> iGOT Resource
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button className="btn-secondary" onClick={() => navigate('/igot')}>
          Browse iGOT Karmayogi
        </button>
        <button className="btn-primary" onClick={() => navigate('/quiz')}>
          Test Your Knowledge <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default LearningPath;
