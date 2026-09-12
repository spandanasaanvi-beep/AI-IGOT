import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import {
  Gauge, Target, AlertTriangle, BookOpen, GraduationCap, ClipboardCheck,
  Route, Upload, Sparkles, Trophy, ArrowRight, Activity, PartyPopper,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { StatCard, SectionTitle, EmptyState } from '../components/EmptyState';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state, roleReadiness, isReady } = useAppContext();
  const user = state.user;

  const achieved = state.competencies.filter((c) => c.currentScore >= c.requiredScore).length;
  const gaps = state.competencies.filter((c) => c.currentScore < c.requiredScore);
  const total = state.competencies.length;

  const learningProgress = useMemo(() => {
    if (!state.resources.length) return 0;
    return Math.round(state.resources.reduce((s, r) => s + r.progress, 0) / state.resources.length);
  }, [state.resources]);

  const quizPerformance = useMemo(() => {
    const quizzes = state.assessments.filter((a) => a.type !== 'initial');
    if (!quizzes.length) return null;
    return Math.round(quizzes.reduce((s, a) => s + a.percentage, 0) / quizzes.length);
  }, [state.assessments]);

  // Segments partition ALL competencies exactly once (they sum to `total`):
  // green = achieved, orange = below required but within 20 pts, red = larger gaps.
  const donutData = [
    { name: 'Achieved', value: achieved, color: '#138808' },
    { name: 'Gap closing (≤20 pts)', value: gaps.filter((g) => g.gap <= 20).length, color: '#f97d0c' },
    { name: 'Gaps', value: gaps.filter((g) => g.gap > 20).length, color: '#dc2626' },
  ].filter((d) => d.value > 0);

  const radarData = state.competencies.map((c) => ({
    name: c.name.split(' ')[0],
    current: c.currentScore,
    required: c.requiredScore,
  }));

  const recommendedCount = state.resources.filter((r) => r.status !== 'completed').length;

  if (!user?.profileCompleted) {
    return (
      <EmptyState
        title="Finish setting up your profile"
        description="Complete your professional profile to unlock the dashboard."
        action={<button className="btn-primary" onClick={() => navigate('/profile-setup')}>Complete Profile</button>}
      />
    );
  }

  const nextStep = !state.assessments.length
    ? { label: 'Take Initial Assessment', to: '/initial-assessment', icon: ClipboardCheck }
    : gaps.length
    ? { label: 'Continue Learning', to: '/learning-path', icon: BookOpen }
    : { label: 'View Certificate', to: '/certificate', icon: Trophy };

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Welcome to PragatiAI, {user.fullName.split(' ')[0]}</h1>
        <p className="text-sm text-slate-500 mt-1">Your personalized competency development dashboard</p>
      </div>

      {isReady && (
        <button className="w-full text-left bg-emerald-700 text-white rounded-lg p-5 flex items-center justify-between gap-4 hover:bg-emerald-600 transition-colors animate-fadeIn"
          onClick={() => navigate('/role-ready')}>
          <div className="flex items-center gap-4">
            <PartyPopper size={32} />
            <div>
              <p className="font-bold text-lg">You are all good for the role! 🎉</p>
              <p className="text-sm text-emerald-100">All required competencies achieved — certificate unlocked.</p>
            </div>
          </div>
          <ArrowRight size={20} className="shrink-0" />
        </button>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={<Gauge size={22} />} label="Role Readiness" value={`${roleReadiness}%`} tone="blue" />
        <StatCard icon={<Target size={22} />} label="Competencies" value={`${achieved} / ${total}`} hint="achieved" tone="green" />
        <StatCard icon={<AlertTriangle size={22} />} label="Competency Gaps" value={gaps.length} hint="to close" tone={gaps.length ? 'amber' : 'green'} />
        <StatCard icon={<Route size={22} />} label="Recommended" value={`${recommendedCount} course${recommendedCount === 1 ? '' : 's'}`} tone="blue" />
        <StatCard icon={<GraduationCap size={22} />} label="Learning Progress" value={`${learningProgress}%`} tone="blue" />
        <StatCard icon={<ClipboardCheck size={22} />} label="Quiz Performance" value={quizPerformance !== null ? `${quizPerformance}%` : '—'} tone={quizPerformance !== null && quizPerformance >= 70 ? 'green' : 'slate'} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <SectionTitle sub="Competencies achieved vs required vs gaps">Role Readiness Overview</SectionTitle>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" cx="50%" cy="50%" innerRadius={62} outerRadius={92} paddingAngle={3} startAngle={90} endAngle={-270}>
                  {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={28} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center -mt-6">
                <p className="text-3xl font-extrabold text-primary-900">{roleReadiness}%</p>
                <p className="text-[11px] text-slate-500 font-medium">readiness</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <SectionTitle sub="Your profile against the role benchmark">Competency Radar</SectionTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} angle={90} />
                <Radar name="Your score" dataKey="current" stroke="#274fd6" fill="#274fd6" fillOpacity={0.35} />
                <Radar name="Required" dataKey="required" stroke="#138808" fill="#138808" fillOpacity={0.08} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Competency list */}
        <div className="lg:col-span-2 card p-6">
          <SectionTitle sub={`Required levels for ${user.role}`}>Your Competencies</SectionTitle>
          <div className="space-y-4">
            {state.competencies.map((c) => {
              const ok = c.currentScore >= c.requiredScore;
              return (
                <div key={c.competencyId}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      {c.name}
                      {ok ? <span className="text-emerald-600">✓</span> : <span className="text-amber-600">⚠</span>}
                    </span>
                    <span className="text-slate-500">{c.currentScore}% / {c.requiredScore}%</span>
                  </div>
                  <div className="progress-bar !h-2">
                    <div className={`progress-fill ${ok ? 'bg-emerald-600' : c.gap > 20 ? 'bg-red-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, c.currentScore)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {!state.competencies.length && (
            <p className="text-sm text-slate-500 mt-4">Take your initial assessment to populate your competency profile.</p>
          )}
        </div>

        {/* Activity + next steps */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
              <Activity size={15} className="text-primary-800" /> Recent Activity
            </h3>
            {state.activities.length ? (
              <ul className="space-y-3">
                {state.activities.slice(0, 5).map((a) => (
                  <li key={a.id} className="text-xs">
                    <p className="text-slate-700 font-medium leading-snug">{a.message}</p>
                    <p className="text-slate-400 mt-0.5">{new Date(a.timestamp).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">No activity yet — begin your assessment to get started.</p>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Learning Path', to: '/learning-path', icon: Route },
                { label: 'iGOT Karmayogi', to: '/igot', icon: BookOpen },
                { label: 'Upload Material', to: '/upload', icon: Upload },
                { label: 'Generate AI Quiz', to: '/quiz', icon: Sparkles },
              ].map(({ label, to, icon: Icon }) => (
                <button key={to} onClick={() => navigate(to)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-md border border-slate-200 text-sm font-medium text-slate-700 hover:border-primary-300 hover:bg-primary-50/50 transition-colors">
                  <span className="flex items-center gap-2.5"><Icon size={16} className="text-primary-800" /> {label}</span>
                  <ArrowRight size={14} className="text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Primary next step */}
      <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 !border-l-primary-800">
        <div>
          <p className="text-sm font-bold text-slate-800">Recommended next step</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {gaps.length
              ? `${gaps.length} competenc${gaps.length === 1 ? 'y' : 'ies'} still below the required level — focused learning is available.`
              : 'All competencies achieved — download your report and certificate.'}
          </p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => navigate(nextStep.to)}>
          {nextStep.label} <ArrowRight size={15} />
        </button>
      </div>

      {/* Core value proposition */}
      <p className="text-center text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
        PragatiAI transforms competency development from a one-time assessment into a continuous personalized learning journey —
        assess → identify gaps → recommend → learn → test → measure → improve → reassess → certify.
      </p>
    </div>
  );
};

export default Dashboard;
