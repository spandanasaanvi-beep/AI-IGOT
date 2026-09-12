import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAppContext } from '../context/AppContext';
import { BadgeCheck } from 'lucide-react';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/learning-path': 'Personalized Learning Path',
  '/igot': 'iGOT Karmayogi',
  '/upload': 'Upload Learning Material',
  '/quiz': 'AI Quiz / MCQ Generator',
  '/quiz-result': 'Quiz Result',
  '/before-after': 'Before vs After',
  '/adaptive': 'Adaptive Recommendations',
  '/reports': 'Report',
  '/certificate': 'Certificate',
  '/about': 'About Us',
  '/contact': 'Contact Team',
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { state, roleReadiness } = useAppContext();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const title = TITLES[location.pathname] ?? 'PragatiAI';

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:ml-72 flex flex-col min-h-screen">
        {/* Gov header */}
        <header className="sticky top-0 z-30">
          <div className="gov-strap" />
          <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 pl-16 lg:pl-8">
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-900 truncate">{title}</h1>
              <p className="text-xs text-slate-500 truncate">
                PragatiAI · Personalized Competency &amp; Learning Platform for iGOT Karmayogi
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <span className="badge bg-primary-50 text-primary-800 border border-primary-100">
                <BadgeCheck size={13} /> {state.user?.role || 'Officer'}
              </span>
              {state.competencies.length > 0 && (
                <span className={`badge ${
                  roleReadiness >= 100
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-accent-50 text-accent-700 border border-accent-200'
                }`}>
                  Role Readiness {roleReadiness}%
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-8 animate-fadeIn">{children}</main>

        <footer className="px-8 py-5 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap gap-x-6 gap-y-1 justify-between">
          <span>© {new Date().getFullYear()} PragatiAI — Team prototype for India's Official Statistical System</span>
          <span>Aligned with iGOT Karmayogi · igotkarmayogi.gov.in</span>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
