import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Camera, Eye, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import QuizRunner from '../components/QuizRunner';
import CameraMonitor from '../components/CameraMonitor';
import { QUESTION_BANK, COMPETENCIES_BY_ROLE } from '../mockData';

/**
 * Initial Competency Assessment.
 * Questions are sampled from the bank for the user's role competencies so
 * the test is always relevant. Scoring happens in AppContext via the
 * competency engine — answers drive everything.
 */
const SkillAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { state, submitInitialAssessment } = useAppContext();
  const { notify } = useToast();
  const [phase, setPhase] = useState<'intro' | 'test'>('intro');
  const [demoEvents, setDemoEvents] = useState<string[]>([]);

  const role = state.user?.role || 'Statistical Investigator';

  // Sample questions covering the role's competencies (2 per competency).
  const questions = useMemo(() => {
    const defs = COMPETENCIES_BY_ROLE[role] ?? COMPETENCIES_BY_ROLE['Statistical Investigator'];
    const picked: typeof QUESTION_BANK = [];
    defs.forEach((def) => {
      const pool = QUESTION_BANK.filter((q) => q.competency === def.name);
      picked.push(...pool.slice(0, 2));
    });
    // Fallback if bank is thin for a custom role
    if (picked.length < 6) picked.push(...QUESTION_BANK.slice(0, 6));
    return picked.slice(0, 12);
  }, [role]);

  const initialAssessment = state.assessments.find((a) => a.type === 'initial');
  const isReassessment = Boolean(initialAssessment);

  const handleDemoEvent = (msg: string) => setDemoEvents((d) => [...d.slice(-4), msg]);

  const handleSubmit = (answers: (number | null)[], violations: number) => {
    submitInitialAssessment(
      questions, answers, violations,
      isReassessment ? 'Reassessment (Full Competency)' : 'Initial Skill Assessment',
      isReassessment ? 'reassessment' : 'initial'
    );
    notify('success', 'Assessment submitted — competency analysis ready.');
    navigate('/competency-gaps', { replace: true });
  };

  if (phase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="card p-8 text-center">
          <span className="inline-flex w-14 h-14 rounded-full bg-primary-50 items-center justify-center mb-4">
            <ClipboardList size={26} className="text-primary-800" />
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {isReassessment ? 'Reassessment' : 'Initial Competency Assessment'}
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto leading-relaxed">
            This assessment identifies your current competency level for the
            <strong> {role} </strong> role. Your answers directly determine your competency scores,
            gap analysis and personalized learning path — there are no pre-set results.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mt-6 text-left">
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5">
              <p className="text-xs font-bold text-slate-700">{questions.length} questions</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Across {Math.min(6, questions.length)} role competencies</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5">
              <p className="text-xs font-bold text-slate-700">~10 minutes</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Untimed · you can review answers</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5">
              <p className="text-xs font-bold text-slate-700">Monitored environment</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Camera + tab-switch integrity checks</p>
            </div>
          </div>
          <button className="btn-primary mt-7" onClick={() => setPhase('test')}>
            Start Assessment <ArrowRight size={16} />
          </button>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Assessment guidelines</h3>
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li className="flex gap-2.5"><Camera size={16} className="text-primary-700 shrink-0 mt-0.5" />
              Camera monitoring is optional but recommended; the preview stays on your device.</li>
            <li className="flex gap-2.5"><Eye size={16} className="text-primary-700 shrink-0 mt-0.5" />
              Tab switching is detected via the browser Page Visibility API and recorded as integrity violations.</li>
            <li className="flex gap-2.5"><ShieldCheck size={16} className="text-primary-700 shrink-0 mt-0.5" />
              Answer honestly — the system adapts your learning path to your real results.</li>
          </ul>
          {demoEvents.length > 0 && (
            <div className="mt-4 bg-accent-50 border border-accent-200 rounded-md p-3">
              {demoEvents.map((e, i) => <p key={i} className="text-[11px] text-accent-700">{e}</p>)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <QuizRunner
      questions={questions}
      title={isReassessment ? 'Reassessment — Full Competency' : 'Initial Skill Assessment'}
      subtitle={`Role: ${role} · Answer all questions to complete the analysis`}
      onAlert={(msg) => { notify('info', msg); handleDemoEvent(msg); }}
      securitySlot={<CameraMonitor onDemoEvent={handleDemoEvent} />}
      onSubmit={handleSubmit}
    />
  );
};

export default SkillAssessment;
