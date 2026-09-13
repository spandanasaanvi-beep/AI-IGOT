import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ShieldCheck, Users, TrendingUp, Target, BookOpen, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { EmptyState, SectionTitle, StatCard } from '../components/EmptyState';

const ADMIN_DEPARTMENT_DATA = [
  { department: 'Statistics', learners: 150, readiness: 78 },
  { department: 'IT & Data', learners: 92, readiness: 81 },
  { department: 'Planning', learners: 65, readiness: 71 },
  { department: 'Administration', learners: 48, readiness: 64 },
];

const ADMIN_SKILL_DISTRIBUTION = [
  { name: 'Statistical', value: 36 },
  { name: 'Technical', value: 31 },
  { name: 'Digital Governance', value: 19 },
  { name: 'Behavioural', value: 14 },
];

const AdminDashboard: React.FC = () => {
  const { state, roleReadiness } = useAppContext();

  const avgCompetency = useMemo(() => {
    if (!state.competencies.length) return 0;
    return Math.round(state.competencies.reduce((sum, c) => sum + c.currentScore, 0) / state.competencies.length);
  }, [state.competencies]);

  const completionRate = useMemo(() => {
    if (!state.resources.length) return 0;
    return Math.round((state.resources.filter((r) => r.status === 'completed').length / state.resources.length) * 100);
  }, [state.resources]);

  const topGaps = useMemo(() => {
    return [...state.competencies]
      .filter((c) => c.currentScore < c.requiredScore)
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 4);
  }, [state.competencies]);

  const quizAverage = useMemo(() => {
    const quizzes = state.assessments.filter((a) => a.type !== 'initial');
    if (!quizzes.length) return 0;
    return Math.round(quizzes.reduce((sum, a) => sum + a.percentage, 0) / quizzes.length);
  }, [state.assessments]);

  if (!state.user?.profileCompleted) {
    return (
      <EmptyState
        icon={<ShieldCheck size={44} />}
        title="Admin dashboard preview"
        description="This dashboard demonstrates organization-level insights and will populate as learners complete assessments and training journeys."
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="card p-6 border-l-4 !border-l-primary-800">
        <SectionTitle sub="Prototype organization-level analytics for SIH 26101 demo" >
          <span className="flex items-center gap-2"><ShieldCheck size={20} className="text-primary-800" /> Administrator Dashboard</span>
        </SectionTitle>
        <p className="text-sm text-slate-600">
          Demo analytics layer showing how learner performance, skill gaps, and training effectiveness can be monitored at an organizational level.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard icon={<Users size={20} />} label="Total Learners" value="1,284" tone="blue" />
        <StatCard icon={<TrendingUp size={20} />} label="Avg Competency" value={`${avgCompetency}%`} tone="green" />
        <StatCard icon={<Target size={20} />} label="High Priority Gaps" value={String(topGaps.length)} tone="amber" />
        <StatCard icon={<BookOpen size={20} />} label="Training Completion" value={`${completionRate}%`} tone="blue" />
        <StatCard icon={<Sparkles size={20} />} label="Quiz Performance" value={`${quizAverage}%`} tone="green" />
        <StatCard icon={<ShieldCheck size={20} />} label="Readiness" value={`${roleReadiness}%`} tone="slate" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <SectionTitle sub="Department-wise readiness and learner count">Department Competency Overview</SectionTitle>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ADMIN_DEPARTMENT_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="learners" fill="#274fd6" name="Learners" radius={[3, 3, 0, 0]} />
                <Bar dataKey="readiness" fill="#138808" name="Readiness %" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <SectionTitle sub="Current distribution of competency categories">Skill Distribution</SectionTitle>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ADMIN_SKILL_DISTRIBUTION} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {ADMIN_SKILL_DISTRIBUTION.map((entry, index) => (
                    <Cell key={entry.name} fill={['#274fd6', '#138808', '#f97d0c', '#8b5cf6'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <SectionTitle sub="High-impact gaps requiring intervention">Priority Skill Gaps</SectionTitle>
          <div className="space-y-4">
            {topGaps.length ? topGaps.map((gap) => (
              <div key={gap.competencyId} className="border border-slate-200 rounded-md p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-slate-800">{gap.name}</p>
                  <span className={`badge ${gap.gap > 20 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {gap.gap} pts gap
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Current {gap.currentScore}% · Required {gap.requiredScore}%</p>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No active gaps detected in the current demo profile.</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <SectionTitle sub="Prototype AI-driven workforce insight — not an official government forecast.">Emerging Skill Requirements</SectionTitle>
          <div className="space-y-3">
            {[
              'AI/ML',
              'Data Science',
              'GIS',
              'Cloud Computing',
              'Cybersecurity',
              'Big Data Analytics',
              'Data Visualization',
            ].map((skill) => (
              <div key={skill} className="flex items-center justify-between border border-slate-200 rounded-md p-3">
                <span className="text-sm font-medium text-slate-700">{skill}</span>
                <span className="badge bg-primary-50 text-primary-800 border border-primary-100">Emerging</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
