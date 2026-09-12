import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ExternalLink, BookOpen, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { EmptyState, SectionTitle } from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { IGOT_PORTAL_URL, IGOT_REFERENCE_URL } from '../mockData';
import { ClipboardCheck } from 'lucide-react';

const IGOTPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateResourceProgress } = useAppContext();
  const { notify } = useToast();

  const gapCompetencies = state.competencies
    .filter((c) => c.currentScore < c.requiredScore)
    .sort((a, b) => b.gap - a.gap);

  const resourcesFor = (competency: string) =>
    state.resources.filter((r) => r.competency === competency);

  const start = (id: string, url: string) => {
    updateResourceProgress(id, 5);
    notify('info', 'Opening on iGOT Karmayogi (official portal).');
    window.open(url, '_blank', 'noopener');
  };

  if (!state.competencies.length) {
    return (
      <EmptyState
        icon={<ClipboardCheck size={44} />}
        title="No recommendations yet"
        description="Your iGOT recommendations are mapped to competency gaps — take the initial assessment first."
        action={<button className="btn-primary" onClick={() => navigate('/initial-assessment')}>Take Initial Assessment</button>}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Portal banner */}
      <div className="card p-6 bg-primary-800 !border-primary-800 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Globe size={24} />
            </span>
            <div>
              <h2 className="text-lg font-bold">iGOT Karmayogi Learning Resources</h2>
              <p className="text-sm text-primary-100">
                Recommended for you, mapped to your competency gaps on the national capacity-building platform.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <a className="btn !bg-white !text-primary-800 hover:!bg-primary-50 !py-2" href={IGOT_PORTAL_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} /> Official Portal
            </a>
            <a className="btn !bg-white/10 hover:!bg-white/20 !text-white border !border-white/30 !py-2" href={IGOT_REFERENCE_URL} target="_blank" rel="noopener noreferrer">
              Reference
            </a>
          </div>
        </div>
      </div>

      {/* Integration honesty notice */}
      <div className="card p-4 flex items-start gap-3 bg-accent-50 !border-accent-200">
        <Info size={16} className="text-accent-700 shrink-0 mt-0.5" />
        <p className="text-xs text-accent-800 leading-relaxed">
          <strong>Prototype integration:</strong> this catalogue is realistic demo data architected behind the
          iGOT service layer (<code>src/services/igotService.ts</code>). Links open the official iGOT Karmayogi portal;
          the demo is not connected to a live iGOT API. When real APIs are available, only the service layer changes.
        </p>
      </div>

      {/* Gap-mapped groups */}
      {gapCompetencies.map((c) => {
        const resources = resourcesFor(c.name);
        return (
          <div key={c.competencyId} className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <SectionTitle sub={`Current ${c.currentScore}% · required ${c.requiredScore}% · gap ${c.gap} pts`}>
                Recommended for {c.name}
              </SectionTitle>
              <span className="badge bg-red-50 text-red-700 border border-red-200">GAP: {c.gap} pts</span>
            </div>
            {resources.length ? (
              <div className="grid md:grid-cols-2 gap-4">
                {resources.map((r) => (
                  <div key={r.id} className="border border-slate-200 rounded-md p-4 flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm">{r.title}</h4>
                        <span className={`badge ${r.priority === 'high' ? 'bg-red-50 text-red-700' : r.priority === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {r.priority} priority
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5">{r.description}</p>
                      <p className="text-[11px] text-slate-500 mt-2">
                        <strong>Mapped competency:</strong> {r.competency} · {r.duration} · {r.provider}
                      </p>
                      {r.progress > 0 && (
                        <div className="mt-2.5">
                          <div className="progress-bar !h-1.5">
                            <div className="progress-fill bg-primary-700" style={{ width: `${r.progress}%` }} />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{r.progress}% complete</p>
                        </div>
                      )}
                    </div>
                    <button className="btn-primary !py-2 mt-4" onClick={() => start(r.id, r.igotUrl)}>
                      <BookOpen size={14} /> {r.status === 'in-progress' ? 'Continue Learning' : 'Start Learning'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Learning recommendations appear here as soon as they are generated for this competency.</p>
            )}
          </div>
        );
      })}

      {gapCompetencies.length === 0 && (
        <EmptyState
          icon={<Globe size={44} />}
          title="No gaps — nothing to learn right now"
          description="All required competencies are achieved. Explore the iGOT catalogue anyway, or take a reassessment to keep your profile fresh."
          action={<a className="btn-primary" href={IGOT_PORTAL_URL} target="_blank" rel="noopener noreferrer">Visit iGOT Karmayogi</a>}
        />
      )}
    </div>
  );
};

export default IGOTPage;
