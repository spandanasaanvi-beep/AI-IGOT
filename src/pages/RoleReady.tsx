import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PartyPopper, FileBarChart, Award, LayoutDashboard } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { StatCard } from '../components/EmptyState';

const RoleReady: React.FC = () => {
  const navigate = useNavigate();
  const { state, roleReadiness } = useAppContext();

  const achieved = state.competencies.filter((c) => c.currentScore >= c.requiredScore).length;
  const completedLearning = state.resources.length
    ? Math.round((state.resources.filter((r) => r.status === 'completed').length / state.resources.length) * 100)
    : 0;
  const quizzes = state.assessments.filter((a) => a.type !== 'initial');
  const avgQuiz = quizzes.length ? Math.round(quizzes.reduce((s, a) => s + a.percentage, 0) / quizzes.length) : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card p-10 text-center border-b-4 !border-b-emerald-600">
        <span className="inline-flex w-20 h-20 rounded-full bg-emerald-50 items-center justify-center mb-5">
          <PartyPopper size={38} className="text-emerald-600" />
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">🎉 YOU ARE ALL GOOD FOR THE ROLE</h1>
        <p className="text-lg text-slate-600 font-semibold mt-3">All required competencies have been achieved.</p>
        <p className="text-sm text-slate-500 mt-2">
          {state.user?.fullName} · {state.user?.role} · {state.user?.organization}
        </p>

        <div className="grid sm:grid-cols-4 gap-4 mt-8 text-left">
          <StatCard icon={<PartyPopper size={20} />} label="Overall Readiness" value={`${roleReadiness}%`} tone="green" />
          <StatCard icon={<PartyPopper size={20} />} label="Competencies" value={`${achieved} / ${state.competencies.length}`} tone="green" />
          <StatCard icon={<PartyPopper size={20} />} label="Learning Done" value={`${completedLearning}%`} tone="green" />
          <StatCard icon={<PartyPopper size={20} />} label="Assessment Avg" value={`${avgQuiz}%`} tone="green" />
        </div>

        <div className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-md bg-emerald-700 text-white font-bold">
          <Award size={18} /> CERTIFICATE UNLOCKED
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            <LayoutDashboard size={16} /> Back to Dashboard
          </button>
          <button className="btn-secondary" onClick={() => navigate('/reports')}>
            <FileBarChart size={16} /> Download Report
          </button>
          <button className="btn-primary" onClick={() => navigate('/certificate')}>
            <Award size={16} /> View Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleReady;
