import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Wand2, Layers, Target, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { generateQuiz } from '../services/aiService';
import QuizRunner from '../components/QuizRunner';
import CameraMonitor from '../components/CameraMonitor';
import { EmptyState, SectionTitle } from '../components/EmptyState';
import { Question } from '../types';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, submitQuiz, setGeneratedQuiz } = useAppContext();
  const { notify } = useToast();
  const [params] = useSearchParams();

  const [config, setConfig] = useState<{ count: 5 | 10 | 15; difficulty: 'easy' | 'medium' | 'hard' | 'mixed'; source: 'gaps' | 'material' }>({
    count: 10, difficulty: 'mixed', source: 'gaps',
  });
  const [phase, setPhase] = useState<'config' | 'loading' | 'test'>('config');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [, setDemoEvents] = useState<string[]>([]);
  const [cameraActive, setCameraActive] = useState(false);

  const readyMaterials = state.materials.filter((m) => m.status === 'ready');

  // Material quiz requested from the upload page
  useEffect(() => {
    if (params.get('autostart') && state.generatedQuiz) {
      setQuestions(state.generatedQuiz.questions);
      setPhase('test');
      window.history.replaceState(null, '', '/quiz');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gapCompetencies = useMemo(
    () => state.competencies.filter((c) => c.currentScore < c.requiredScore).map((c) => c.name),
    [state.competencies]
  );

  const startGeneration = async () => {
    if (config.source === 'material' && !readyMaterials.length) {
      notify('error', 'Upload learning material first to generate a quiz from it.');
      return;
    }
    setPhase('loading');
    const qs = await generateQuiz({
      count: config.count,
      difficulty: config.difficulty,
      source: config.source,
      targetCompetencies: config.source === 'gaps' ? gapCompetencies : undefined,
      materialTopics: config.source === 'material' ? readyMaterials[0]?.topics : undefined,
    });
    setQuestions(qs);
    setGeneratedQuiz({
      questions: qs,
      source: config.source === 'gaps' ? 'Role & Competency Gaps' : `Material: ${readyMaterials[0]?.fileName}`,
      difficulty: config.difficulty,
    });
    setPhase('test');
  };

  const handleDemoEvent = (_msg: string) => setDemoEvents((d) => [...d.slice(-4), _msg]);

  const handleCameraStatusChange = (status: 'idle' | 'requesting' | 'active' | 'denied' | 'unavailable') => {
    setCameraActive(status === 'active');
  };

  const handleSubmit = (answers: (number | null)[], violations: number) => {
    const sourceLabel = config.source === 'gaps' ? 'Role & Competency Gaps' : 'Uploaded Material';
    submitQuiz(questions, answers, violations, `AI Quiz (${sourceLabel})`, config.source, config.difficulty);
    notify('success', 'Quiz submitted — result ready.');
    navigate('/quiz-result', { replace: true });
  };

  if (phase === 'config') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card p-7">
          <SectionTitle sub="Questions adapt to your current competency gaps or your uploaded material">
            <span className="flex items-center gap-2"><Sparkles size={20} className="text-primary-800" /> AI Quiz / MCQ Generator</span>
          </SectionTitle>

          {/* Source */}
          <label className="label mt-2 flex items-center gap-1.5"><Layers size={14} /> Quiz Source</label>
          <div className="grid sm:grid-cols-2 gap-3">
            {([
              { key: 'gaps', title: 'Role & Competency Gaps', desc: gapCompetencies.length ? `Focus: ${gapCompetencies.slice(0, 2).join(', ')}` : 'Targets your lowest competencies', icon: Target },
              { key: 'material', title: 'Uploaded Learning Material', desc: readyMaterials.length ? readyMaterials[0].fileName : 'Upload a document first', icon: FileText },
            ] as const).map(({ key, title, desc, icon: Icon }) => (
              <button key={key}
                onClick={() => setConfig((c) => ({ ...c, source: key }))}
                className={`text-left p-4 rounded-md border-2 transition-colors ${
                  config.source === key ? 'border-primary-700 bg-primary-50/60' : 'border-slate-200 hover:border-primary-300'
                }`}>
                <span className="flex items-center gap-2 font-bold text-sm text-slate-800"><Icon size={16} className="text-primary-800" /> {title}</span>
                <span className="block text-xs text-slate-500 mt-1 truncate">{desc}</span>
              </button>
            ))}
          </div>

          {/* Count */}
          <label className="label mt-6">Number of Questions</label>
          <div className="grid grid-cols-3 gap-3">
            {([5, 10, 15] as const).map((n) => (
              <button key={n}
                onClick={() => setConfig((c) => ({ ...c, count: n }))}
                className={`py-2.5 rounded-md border-2 text-sm font-bold transition-colors ${
                  config.count === n ? 'border-primary-700 bg-primary-50/60 text-primary-900' : 'border-slate-200 hover:border-primary-300 text-slate-600'
                }`}>
                {n} questions
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <label className="label mt-6">Difficulty</label>
          <div className="grid grid-cols-4 gap-3">
            {(['easy', 'medium', 'hard', 'mixed'] as const).map((d) => (
              <button key={d}
                onClick={() => setConfig((c) => ({ ...c, difficulty: d }))}
                className={`py-2.5 rounded-md border-2 text-sm font-semibold capitalize transition-colors ${
                  config.difficulty === d ? 'border-primary-700 bg-primary-50/60 text-primary-900' : 'border-slate-200 hover:border-primary-300 text-slate-600'
                }`}>
                {d}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-md border border-primary-200 bg-primary-50/40 p-4 text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-primary-800">Mandatory camera requirement</p>
            <p className="text-sm text-slate-600 mt-1">
              Camera access is required before this assessment can begin. Please allow access to continue.
            </p>
          </div>

          <CameraMonitor required onStatusChange={handleCameraStatusChange} onDemoEvent={handleDemoEvent} />

          <button className="btn-primary w-full mt-7 disabled:opacity-50 disabled:cursor-not-allowed" onClick={startGeneration} disabled={!cameraActive}>
            {cameraActive ? <><Wand2 size={16} /> Generate Quiz</> : 'Camera access required to continue'}
          </button>

          <p className="text-[11px] text-slate-400 mt-3 text-center leading-relaxed">
            Prototype: questions come from a curated local bank via the AI service abstraction.
            When an LLM API is configured, the same interface serves model-generated questions.
          </p>
        </div>

        {state.generatedQuiz && !state.generatedQuiz.questions.length && (
          <p className="text-xs text-slate-400 text-center">Generating…</p>
        )}
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <EmptyState
        icon={<Wand2 size={44} />}
        title="Generating your quiz…"
        description="The AI service is selecting questions matched to your configuration."
      />
    );
  }

  return (
    <QuizRunner
      questions={questions}
      title="AI-Generated Quiz"
      subtitle={`Source: ${config.source === 'gaps' ? 'Role & Competency Gaps' : 'Uploaded Material'} · Difficulty: ${config.difficulty}`}
      onAlert={(msg) => { notify('info', msg); handleDemoEvent(msg); }}
      securitySlot={<CameraMonitor required onStatusChange={handleCameraStatusChange} onDemoEvent={handleDemoEvent} />}
      onSubmit={handleSubmit}
      cameraAvailable={cameraActive}
    />
  );
};

export default QuizPage;
