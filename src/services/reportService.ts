import jsPDF from 'jspdf';
import { AppState } from '../types';

/* =========================================================================
 * Report service — professional PDF competency record built with jsPDF.
 * All content comes from ACTUAL stored state; nothing is fabricated.
 * ======================================================================= */

const NAVY: [number, number, number] = [23, 52, 150];
const SLATE: [number, number, number] = [71, 85, 105];
const GREEN: [number, number, number] = [19, 136, 8];
const RED: [number, number, number] = [220, 38, 38];
const AMBER: [number, number, number] = [234, 96, 2];

export function generateReport(state: AppState, roleReadiness: number): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const M = 16;
  let y = 0;

  const ensureSpace = (needed: number) => {
    if (y + needed > 280) {
      doc.addPage();
      y = 20;
    }
  };

  /* ------------------------------ Header ------------------------------ */
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 34, 'F');
  doc.setFillColor(255, 153, 51); doc.rect(0, 34, W / 3, 1.6, 'F');
  doc.setFillColor(255, 255, 255); doc.rect(W / 3, 34, W / 3, 1.6, 'F');
  doc.setFillColor(19, 136, 8); doc.rect((2 * W) / 3, 34, W / 3, 1.6, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
  doc.text('PragatiAI', M, 16);
  doc.setFont('normal'); doc.setFontSize(9);
  doc.text('Personalized Competency & Learning Platform for iGOT Karmayogi', M, 23);
  doc.setFontSize(8);
  doc.text('Competency Development Report · India\'s Official Statistical System', M, 29);
  y = 44;

  /* --------------------------- User details --------------------------- */
  const user = state.user!;
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.text('Competency Development Report', M, y); y += 8;

  doc.setFontSize(9.5); doc.setFont('normal');
  const rows: [string, string][] = [
    ['Name', user.fullName],
    ['Organization', user.organization || '—'],
    ['Role', user.role || '—'],
    ['Qualification', user.qualification || '—'],
    ['Experience', `${user.experienceYears} years ${user.experienceMonths} months`],
    ['Assessment Date', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })],
  ];
  rows.forEach(([k, v]) => {
    doc.setTextColor(...SLATE);
    doc.text(`${k}:`, M, y);
    doc.setTextColor(30, 41, 59);
    doc.text(v, M + 38, y);
    y += 6;
  });
  y += 4;

  /* --------------------- Overall readiness summary -------------------- */
  ensureSpace(30);
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(M, y, W - 2 * M, 22, 2, 2, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(`Overall Role Readiness: ${roleReadiness}%`, M + 6, y + 8);
  doc.setFontSize(9);
  const achieved = state.competencies.filter((c) => c.currentScore >= c.requiredScore).length;
  doc.setTextColor(30, 41, 59);
  doc.setFont('normal');
  doc.text(
    `Competencies achieved: ${achieved} / ${state.competencies.length}   ·   Assessments completed: ${state.assessments.length}   ·   Learning resources: ${state.resources.filter((r) => r.status === 'completed').length}/${state.resources.length} completed`,
    M + 6, y + 15
  );
  y += 30;

  /* ------------------------ Competency section ------------------------ */
  ensureSpace(40);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('1. Initial Skill Assessment & Competency Scores', M, y); y += 7;

  doc.setFontSize(9); doc.setFont('normal');
  doc.setTextColor(...SLATE);
  doc.text('Current score vs required level per role competency (scores derived from completed assessments).', M, y); y += 7;

  // table header
  const colX = [M, M + 62, M + 92, M + 118, M + 144];
  doc.setFillColor(241, 245, 249);
  doc.rect(M, y - 4.5, W - 2 * M, 7, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
  ['Competency', 'Initial', 'Current', 'Required', 'Status'].forEach((h, i) => doc.text(h, colX[i], y));
  y += 6;
  doc.setFont('normal');

  state.competencies.forEach((c) => {
    ensureSpace(10);
    const achievedNow = c.currentScore >= c.requiredScore;
    doc.setTextColor(30, 41, 59);
    doc.text(c.name.substring(0, 30), colX[0], y);
    doc.text(`${c.initialScore}%`, colX[1], y);
    doc.text(`${c.currentScore}%`, colX[2], y);
    doc.text(`${c.requiredScore}%`, colX[3], y);
    doc.setTextColor(...(achievedNow ? GREEN : c.gap > 20 ? RED : AMBER));
    doc.text(achievedNow ? 'Achieved' : c.gap > 20 ? 'Needs Improvement' : 'Gap Closing', colX[4], y);
    doc.setDrawColor(226, 232, 240);
    doc.line(M, y + 2, W - M, y + 2);
    y += 7;
  });
  y += 4;

  /* ---------------------- Before vs after section --------------------- */
  ensureSpace(30);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('2. Before vs After Comparison', M, y); y += 7;
  doc.setFontSize(9); doc.setFont('normal'); doc.setTextColor(...SLATE);
  doc.text('Change from initial assessment to latest measured score. Decreases are reported honestly.', M, y); y += 7;

  state.competencies.forEach((c) => {
    ensureSpace(10);
    const delta = c.latestScore - c.initialScore;
    doc.setTextColor(30, 41, 59);
    doc.text(`${c.name}`, M, y);
    doc.text(`${c.initialScore}%  →  ${c.latestScore}%`, M + 70, y);
    doc.setTextColor(...(delta > 0 ? GREEN : delta < 0 ? RED : SLATE));
    doc.text(delta > 0 ? `+${delta} pts improved` : delta < 0 ? `${delta} pts (performance decreased)` : 'no change', M + 110, y);
    y += 6.5;
  });
  y += 4;

  /* --------------------- Recommended learning ------------------------- */
  ensureSpace(30);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('3. Recommended Learning & Completion', M, y); y += 7;

  doc.setFontSize(9); doc.setFont('normal');
  if (state.resources.length) {
    state.resources.forEach((r) => {
      ensureSpace(12);
      doc.setTextColor(30, 41, 59);
      doc.text(`• ${r.title} (${r.competency}, ${r.priority} priority)`, M, y);
      doc.setTextColor(...(r.status === 'completed' ? GREEN : SLATE));
      doc.text(r.status === 'completed' ? 'Completed' : `${r.progress}% in progress`, W - M - 32, y, { align: 'left' });
      y += 6;
    });
  } else {
    doc.setTextColor(...SLATE);
    doc.text('No learning resources recommended yet.', M, y); y += 6;
  }
  y += 4;

  /* --------------------------- Quiz results --------------------------- */
  ensureSpace(30);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('4. Quiz / Assessment Results', M, y); y += 7;
  doc.setFontSize(9); doc.setFont('normal');

  if (state.assessments.length) {
    state.assessments.forEach((a) => {
      ensureSpace(12);
      doc.setTextColor(30, 41, 59);
      doc.text(`• ${a.title} — ${new Date(a.date).toLocaleDateString('en-IN')}`, M, y);
      doc.setTextColor(...(a.percentage >= 70 ? GREEN : a.percentage >= 50 ? AMBER : RED));
      doc.text(`${a.score}/${a.questions.length} (${a.percentage}%)`, M + 105, y);
      if (a.integrityViolations > 0) {
        doc.setTextColor(...AMBER);
        doc.text(`${a.integrityViolations} integrity violation(s)`, M + 140, y);
      }
      y += 6;
    });
  } else {
    doc.setTextColor(...SLATE);
    doc.text('No assessments recorded.', M, y); y += 6;
  }
  y += 4;

  /* -------------------------- Final status ---------------------------- */
  ensureSpace(40);
  const allAchieved = state.competencies.length > 0 && state.competencies.every((c) => c.currentScore >= c.requiredScore);
  const statusBg: [number, number, number] = allAchieved ? [236, 253, 245] : [255, 247, 237];
  const statusFg: [number, number, number] = allAchieved ? GREEN : NAVY;
  doc.setFillColor(...statusBg);
  doc.roundedRect(M, y, W - 2 * M, 24, 2, 2, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.setTextColor(...statusFg);
  doc.text(allAchieved ? 'Final Status: ROLE READY — all required competencies achieved' : 'Final Status: In Progress — competency development ongoing', M + 6, y + 9);
  doc.setFont('normal'); doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(
    allAchieved
      ? 'The participant has met all competency requirements for the role. Certificate unlocked.'
      : 'Continued learning and reassessment are recommended to close remaining gaps.',
    M + 6, y + 16
  );
  y += 34;

  /* ------------------------------ Footer ------------------------------ */
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('PragatiAI · Prototype competency record · Data shown is from the applicant\'s assessment sessions', M, 291);
    doc.text(`Page ${p} of ${pageCount}`, W - M, 291, { align: 'right' });
  }

  doc.save(`PragatiAI_Competency_Report_${user.fullName.replace(/\s+/g, '_')}.pdf`);
}
