import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { PartyPopper, BrainCircuit, Compass, GitCompareArrows, RotateCcw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { EmptyState, SectionTitle, StatCard } from '../components/EmptyState';
import { generateInsight } from '../services/competencyEngine';
import { ClipboardCheck } from 'lucide-react';

const QuizResult: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();

  const result = useMemo(
    () => state.assessments.find((a) => a.id === state.lastQuizResultId) ?? state.assessments[state.assessments.length - 1],
    [state.assessments, state.lastQuizResultId]
  );

  // Hooks must run unconditionally — this sits above any early return.
  const insight = useMemo(
    () => generateInsight(state.competencies, result?.competencyPerformance),
    [state.competencies, result]
  );

  if (!result) {
    return (
      <EmptyState
        icon={<ClipboardCheck size={44} />}
        title="No quiz result yet"
        description="Generate and complete an AI quiz to see your result and competency-wise performance here."
        action={<button className="btn-primary" onClick={() => navigate('/quiz')}>Generate a Quiz</button>}
      />
    );
  }

  const chartData = Object.entries(result.competencyPerformance).map(([name, t]) => ({
    name: name.length > 14 ? name.split(' ').map((w) => w[0]).join('') : name,
    full: name,
    pct: t.percentage,
  }));

  const requiredFor = (competency: string) =>
    state.competencies.find((c) => c.name === competency)?.requiredScore ?? 75;


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Score hero */}
      <div className="card p-8 text-center">
        <span className="inline-flex w-14 h-14 rounded-full bg-emerald-50 items-center justify-center mb-3">
          <PartyPopper size={26} className="text-emerald-600" />
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900">Quiz Complete</h2>
        <p className="text-sm text-slate-500 mt-1">{result.title} · {new Date(result.date).toLocaleString()}</p>
        <div className="flex items-center justify-center gap-8 mt-6">
          <div>
            <p className="text-4xl font-extrabold text-primary-900">{result.score} / {result.questions.length}</p>
            <p className="text-xs text-slate-500 mt-1">Score</p>
          </div>
          <div className="h-12 w-px bg-slate-200" />
          <div>
            <p className={`text-4xl font-extrabold ${result.percentage >= 70 ? 'text-emerald-600' : result.percentage >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
              {result.percentage}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Percentage</p>
          </div>
        </div>
        {result.integrityViolations > 0 && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-5 inline-block">
            {result.integrityViolations} integrity violation(s) recorded during this attempt.
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<ClipboardCheck size={20} />} label="Questions" value={result.questions.length} tone="blue" />
        <StatCard icon={<ClipboardCheck size={20} />} label="Correct" value={result.score} tone="green" />
        <StatCard icon={<ClipboardCheck size={20} />} label="Incorrect" value={result.questions.length - result.score} tone="amber" />
        <StatCard icon={<ClipboardCheck size={20} />} label="Type" value={<span className="text-base">{result.type}</span>} tone="slate" />
      </div>

      {/* Competency-wise performance */}
      <div className="card p-6">
        <SectionTitle sub="Percentage correct per competency in this quiz">Competency-wise Performance</SectionTitle>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v}%`} labelFormatter={(_, p) => (p?.[0]?.payload?.full as string) ?? ''} />
              <ReferenceLine y={75} stroke="#f97d0c" strokeDasharray="4 4" />
              <Bar dataKey="pct" name="Accuracy" radius={[3, 3, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.pct >= requiredFor(d.full) ? '#138808' : d.pct >= 50 ? '#f59e0b' : '#dc2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {Object.entries(result.competencyPerformance).map(([name, t]) => {
            const required = requiredFor(name);
            const ok = t.percentage >= required;
            return (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{name}</span>
                <span className="text-slate-500">{t.percentage}% · {t.correct}/{t.total}
                  <span className={`ml-2 font-semibold ${ok ? 'text-emerald-600' : 'text-amber-600'}`}>{ok ? '✓' : '⚠'}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Answer review */}
      <div className="card p-6">
        <SectionTitle sub="Correct answers and explanations">Review Your Answers</SectionTitle>
        <div className="space-y-4">
          {result.questions.map((q, i) => {
            const userAns = result.answers[i];
            const correct = userAns === q.correctAnswer;
            return (
              <details key={q.id} className="border border-slate-200 rounded-md p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <span className={correct ? 'text-emerald-600' : 'text-red-500'}>{correct ? '✓' : '✗'}</span>
                  Q{i + 1}. {q.question}
                </summary>
                <div className="mt-3 space-y-1.5 text-sm">
                  <p className="text-slate-600">Your answer: <span className={correct ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
                    {userAns !== null ? q.options[userAns] : 'Not answered'}</span></p>
                  {!correct && <p className="text-slate-600">Correct answer: <span className="text-emerald-700 font-semibold">{q.options[q.correctAnswer]}</span></p>}
                  <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 mt-2">{q.explanation}</p>
                </div>
              </details>
            );
          })}
        </div>
      </div>

      {/* AI insight */}
      <div className="card p-6 border-l-4 !border-l-primary-800">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
          <BrainCircuit size={17} className="text-primary-800" /> AI Learning Insight
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">{insight}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button className="btn-secondary" onClick={() => navigate('/quiz')}><RotateCcw size={15} /> Take Another Quiz</button>
        <button className="btn-secondary" onClick={() => navigate('/before-after')}><GitCompareArrows size={15} /> Before vs After</button>
        <button className="btn-primary" onClick={() => navigate('/adaptive')}>Adaptive Recommendations <Compass size={15} /></button>
      </div>
    </div>
  );
};

export default QuizResult;
