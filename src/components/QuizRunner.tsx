import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Timer, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Question } from '../types';

interface Props {
  questions: Question[];
  title: string;
  subtitle?: string;
  onAlert?: (msg: string) => void;
  onSubmit: (answers: (number | null)[], violations: number) => void;
  /** Extra header slot, e.g. camera monitor */
  securitySlot?: React.ReactNode;
  /** If true, disables answer navigation controls (used for intro screens) */
  timeLimitMinutes?: number;
  cameraAvailable?: boolean;
}

const QuizRunner: React.FC<Props> = ({
  questions, title, subtitle, onAlert, onSubmit, securitySlot, timeLimitMinutes, cameraAvailable = true,
}) => {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [violations, setViolations] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(timeLimitMinutes ? timeLimitMinutes * 60 : null);

  /* ------- Browser-level integrity monitoring (Page Visibility API) ------- */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        setViolations((v) => {
          const next = v + 1;
          onAlert?.(
            next >= 3
              ? 'Warning: Please remain on the assessment page. Continued switching may affect assessment integrity.'
              : `Tab switching detected (${next}). Please remain on the assessment page.`
          );
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------- Timer -------------------------------- */
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      onSubmit(answers, violations);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, answers, violations, onSubmit]);

  const answeredCount = useMemo(() => answers.filter((a) => a !== null).length, [answers]);
  const progress = Math.round(((idx + 1) / questions.length) * 100);

  const mm = secondsLeft !== null ? String(Math.floor(secondsLeft / 60)).padStart(2, '0') : null;
  const ss = secondsLeft !== null ? String(secondsLeft % 60).padStart(2, '0') : null;

  const integrity = violations === 0
    ? { label: 'Secure', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: '🟢' }
    : violations <= 2
    ? { label: `Warning: ${violations} tab switch${violations > 1 ? 'es' : ''} detected`, cls: 'text-amber-700 bg-amber-50 border-amber-200', dot: '🟡' }
    : { label: `At risk: ${violations} violations`, cls: 'text-red-700 bg-red-50 border-red-200', dot: '🔴' };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header + integrity */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className={`badge border ${integrity.cls}`}>{integrity.dot} Assessment Integrity: {integrity.label}</div>
        </div>

        {securitySlot && <div className="mt-4">{securitySlot}</div>}

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Question {idx + 1} of {questions.length} · {answeredCount} answered</span>
          <span className="flex items-center gap-2">
            {mm !== null && (
              <span className={`flex items-center gap-1 font-semibold ${secondsLeft !== null && secondsLeft < 60 ? 'text-red-600' : 'text-slate-700'}`}>
                <Timer size={14} /> {mm}:{ss}
              </span>
            )}
            {violations > 0 && (
              <span className="flex items-center gap-1 text-amber-600"><AlertTriangle size={13} /> {violations}</span>
            )}
            {violations === 0 && <span className="flex items-center gap-1 text-emerald-600"><ShieldCheck size={13} /> Clean</span>}
          </span>
        </div>
        <div className="progress-bar mt-2">
          <div className="progress-fill bg-primary-700" style={{ width: `${progress}%` }} />
        </div>

        {/* Question dots */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-7 h-7 rounded text-[11px] font-semibold transition-colors ${
                i === idx ? 'bg-primary-800 text-white'
                : answers[i] !== null ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {cameraAvailable ? (
        <>
          {/* Question card */}
          <div className="card p-6 animate-fadeIn" key={questions[idx].id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="badge bg-primary-50 text-primary-800 border border-primary-100">{questions[idx].competency}</span>
              <span className="badge bg-slate-100 text-slate-600 capitalize">{questions[idx].difficulty}</span>
            </div>
            <p className="text-base font-semibold text-slate-900 leading-relaxed">{idx + 1}. {questions[idx].question}</p>
            <div className="mt-5 space-y-2.5">
              {questions[idx].options.map((opt, oi) => {
                const selected = answers[idx] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => setAnswers((a) => a.map((v, i) => (i === idx ? oi : v)))}
                    className={`w-full text-left px-4 py-3 rounded-md border text-sm transition-colors ${
                      selected
                        ? 'border-primary-700 bg-primary-50 text-primary-900 font-semibold'
                        : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/40 text-slate-700'
                    }`}
                  >
                    <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full mr-3 text-xs font-bold ${
                      selected ? 'bg-primary-800 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button className="btn-secondary" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
              <ChevronLeft size={16} /> Previous
            </button>
            {idx < questions.length - 1 ? (
              <button className="btn-primary" onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn-success" onClick={() => setShowSubmitConfirm(true)}>
                Submit Assessment
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="card border-amber-200 bg-amber-50 p-6">
          <h3 className="text-lg font-bold text-amber-900">Assessment paused</h3>
          <p className="text-sm text-amber-800 mt-2">
            Camera access is required for this assessment. Please allow camera permission so the session can continue.
          </p>
        </div>
      )}

      {/* Submit confirm modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowSubmitConfirm(false)}>
          <div className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">Submit assessment?</h3>
            <p className="text-sm text-slate-600 mt-2">
              You answered <strong>{answeredCount} of {questions.length}</strong> questions.
              {answeredCount < questions.length && ' Unanswered questions are scored as incorrect.'}
              {violations > 0 && ` ${violations} integrity violation(s) will be recorded.`}
            </p>
            <div className="flex justify-end gap-3 mt-5">
              <button className="btn-secondary" onClick={() => setShowSubmitConfirm(false)}>Keep Reviewing</button>
              <button className="btn-success" onClick={() => onSubmit(answers, violations)}>Submit Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizRunner;
