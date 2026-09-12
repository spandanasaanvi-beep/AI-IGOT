import React from 'react';
import { Users, Eye, ArrowRight } from 'lucide-react';
import { SectionTitle } from '../components/EmptyState';
import { ChakraMark } from '../components/Sidebar';

const APPROACH_STEPS = ['Assess', 'Identify', 'Learn', 'Test', 'Improve', 'Reassess', 'Certify'];

const AboutUs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Concept */}
      <div className="card p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-11 h-11 rounded-full bg-primary-50 flex items-center justify-center">
            <ChakraMark size={26} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-primary-900">Pragati<span className="text-accent-500">AI</span></h1>
            <p className="text-xs text-slate-500">Personalized Competency &amp; Learning Platform for iGOT Karmayogi</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          PragatiAI is created by a group of six students as a contribution toward strengthening the iGOT Karmayogi
          ecosystem and supporting employees of India's Official Statistical System. Our platform focuses on identifying
          competency gaps and providing personalized skill development pathways through learning resources integrated
          with iGOT Karmayogi. By combining competency assessment, personalized recommendations, adaptive quizzes,
          learning progress tracking, and role-readiness measurement, PragatiAI aims to make professional skill
          development more structured, measurable, and personalized.
        </p>
      </div>

      {/* Vision */}
      <div className="card p-6 border-l-4 !border-l-primary-800">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Eye size={16} className="text-primary-800" /> OUR VISION
        </h2>
        <p className="text-sm text-slate-600 italic mt-2">
          "To enable continuous, personalized, and measurable competency development for India's Official Statistical System."
        </p>
      </div>

      {/* Approach */}
      <div className="card p-6">
        <SectionTitle sub="Our methodology mirrors the platform journey">OUR APPROACH</SectionTitle>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-primary-800">
          {APPROACH_STEPS.map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <ArrowRight size={12} className="text-slate-300" />}
              <span className="px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100">{s}</span>
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          PragatiAI transforms competency development from a one-time assessment into a continuous personalized learning journey.
        </p>
      </div>

      {/* Team */}
      <div className="card p-6">
        <SectionTitle sub="Built by a team of six contributors">THE TEAM</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="border border-slate-200 rounded-md p-5 text-center bg-slate-50/60">
              <span className="inline-flex w-12 h-12 rounded-full bg-primary-100 text-primary-800 items-center justify-center">
                <Users size={20} />
              </span>
              <p className="text-sm font-bold text-slate-700 mt-3">Team Member {n}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Contributor</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
