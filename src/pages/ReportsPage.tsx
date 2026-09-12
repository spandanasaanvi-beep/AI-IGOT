import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileBarChart, Download, User, Target, ClipboardCheck, GitCompareArrows } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { generateReport } from '../services/reportService';
import { EmptyState, SectionTitle, StatCard } from '../components/EmptyState';
import { useToast } from '../components/Toast';

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, roleReadiness } = useAppContext();
  const { notify } = useToast();

  if (!state.competencies.length) {
    return (
      <EmptyState
        icon={<FileBarChart size={44} />}
        title="Report not ready yet"
        description="Your competency report is generated from assessment data. Take the initial assessment first."
        action={<button className="btn-primary" onClick={() => navigate('/initial-assessment')}>Take Initial Assessment</button>}
      />
    );
  }

  const user = state.user!;
  const achieved = state.competencies.filter((c) => c.currentScore >= c.requiredScore).length;
  const quizzes = state.assessments.filter((a) => a.type !== 'initial');
  const avgQuiz = quizzes.length ? Math.round(quizzes.reduce((s, a) => s + a.percentage, 0) / quizzes.length) : 0;

  const handleDownload = () => {
    try {
      generateReport(state, roleReadiness);
      notify('success', 'Report downloaded as PDF.');
    } catch {
      notify('error', 'Report generation failed. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <SectionTitle sub="A professional PDF record of your complete competency development journey">
              <span className="flex items-center gap-2"><FileBarChart size={20} className="text-primary-800" /> Competency Development Report</span>
            </SectionTitle>
            <ul className="text-sm text-slate-600 space-y-1.5 mt-2">
              {[
                'User details & role information',
                'Initial assessment and competency scores',
                'Competency gaps and recommended learning',
                'Learning completion status',
                'Quiz results and integrity record',
                'Before vs after comparison',
                'Final competency status & role readiness',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-700 inline-block" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="shrink-0">
            <button className="btn-primary" onClick={handleDownload}>
              <Download size={16} /> Download Your Report
            </button>
            <p className="text-[11px] text-slate-400 mt-2 text-center">PDF · generated locally</p>
          </div>
        </div>
      </div>

      {/* Preview of what the report contains */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<User size={20} />} label="Participant" value={<span className="text-base">{user.fullName.split(' ')[0]}</span>} hint={user.organization} tone="blue" />
        <StatCard icon={<Target size={20} />} label="Role Readiness" value={`${roleReadiness}%`} tone="blue" />
        <StatCard icon={<Target size={20} />} label="Competencies" value={`${achieved}/${state.competencies.length}`} tone="green" />
        <StatCard icon={<ClipboardCheck size={20} />} label="Avg Quiz Score" value={quizzes.length ? `${avgQuiz}%` : '—'} tone="slate" />
      </div>

      <div className="card p-6">
        <SectionTitle sub="As it will appear in the PDF">Report Snapshot</SectionTitle>

        <div className="border border-slate-200 rounded-md overflow-hidden">
          <div className="bg-primary-800 text-white px-5 py-4">
            <p className="font-extrabold text-lg">PragatiAI</p>
            <p className="text-[11px] text-primary-100">Personalized Competency &amp; Learning Platform for iGOT Karmayogi</p>
          </div>
          <div className="p-5 space-y-4 text-sm">
            <div>
              <p className="font-bold text-slate-800">Competency Development Report</p>
              <p className="text-xs text-slate-500 mt-1">{user.fullName} · {user.role} · {user.organization} · {new Date().toLocaleDateString('en-IN')}</p>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-500">
                  <th className="py-2 px-3 font-semibold">Competency</th>
                  <th className="py-2 px-3 font-semibold">Initial</th>
                  <th className="py-2 px-3 font-semibold">Current</th>
                  <th className="py-2 px-3 font-semibold">Required</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {state.competencies.map((c) => {
                  const ok = c.currentScore >= c.requiredScore;
                  return (
                    <tr key={c.competencyId} className="border-t border-slate-100">
                      <td className="py-2 px-3 font-medium text-slate-700">{c.name}</td>
                      <td className="py-2 px-3 text-slate-600">{c.initialScore}%</td>
                      <td className="py-2 px-3 text-slate-800 font-semibold">{c.currentScore}%</td>
                      <td className="py-2 px-3 text-slate-600">{c.requiredScore}%</td>
                      <td className={`py-2 px-3 font-semibold ${ok ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {ok ? 'Achieved' : 'Needs Improvement'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <GitCompareArrows size={14} />
              Before → After: {state.competencies.map((c) => `${c.name} ${c.initialScore}%→${c.latestScore}%`).join(' · ')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
