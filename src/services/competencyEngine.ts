import { Question, Competency } from '../types';
import { COMPETENCIES_BY_ROLE } from '../mockData';

/* =========================================================================
 * Competency engine — all scoring maths lives here. Scores are ALWAYS
 * derived from stored assessment answers; nothing is fabricated.
 * ======================================================================= */

export interface CompetencyTally {
  correct: number;
  total: number;
  percentage: number;
}

/** Tally correct/total per competency tag for an answered assessment. */
export function tallyCompetencies(
  questions: Question[],
  answers: (number | null)[]
): Record<string, CompetencyTally> {
  const tally: Record<string, { correct: number; total: number }> = {};
  questions.forEach((q, i) => {
    if (!tally[q.competency]) tally[q.competency] = { correct: 0, total: 0 };
    tally[q.competency].total += 1;
    if (answers[i] === q.correctAnswer) tally[q.competency].correct += 1;
  });

  const out: Record<string, CompetencyTally> = {};
  Object.entries(tally).forEach(([k, v]) => {
    out[k] = { ...v, percentage: Math.round((v.correct / v.total) * 100) };
  });
  return out;
}

/**
 * Convert raw competency tallies into competency records.
 * `scoreProvider` lets callers decide how a competency's score is computed
 * (weighted blend with previous scores, etc.). Keeps the engine reusable
 * for both initial assessment and post-quiz updates.
 */
export function buildCompetencies(
  role: string,
  tally: Record<string, CompetencyTally>,
  previous: Competency[] | null,
  scoreProvider: (name: string, t: CompetencyTally | undefined, prev: Competency | undefined) => number
): Competency[] {
  const defs = COMPETENCIES_BY_ROLE[role] ?? [];
  return defs.map((def) => {
    const t = tally[def.name];
    const prev = previous?.find((c) => c.name === def.name);
    const score = clamp(scoreProvider(def.name, t, prev));
    const status: Competency['status'] =
      score >= def.requiredScore ? 'achieved' : score >= def.requiredScore - 20 ? 'needs-improvement' : 'critical';
    return {
      competencyId: def.competencyId,
      name: def.name,
      requiredScore: def.requiredScore,
      currentScore: score,
      initialScore: prev?.initialScore ?? score,
      latestScore: score,
      status,
      gap: Math.max(0, def.requiredScore - score),
    };
  });
}

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * Score for the INITIAL assessment: for role competencies covered by
 * questions, the raw percentage; uncovered competencies get a neutral
 * baseline so the gap analysis is honest about "not yet measured".
 */
export function initialScoreProvider(): (name: string, t?: CompetencyTally, prev?: Competency) => number {
  return (_name: string, t?: CompetencyTally, _prev?: Competency): number => {
    if (t && t.total > 0) return t.percentage;
    // Not directly measured → conservative baseline, later refined by quizzes.
    return 35;
  };
}

/**
 * Score after a generated/material quiz: blend the new evidence with the
 * prior score so single bad questions don't whipsaw the competency, and
 * competencies not covered by the quiz keep their previous score.
 */
export function blendedScoreProvider(weightNew = 0.5): (name: string, t?: CompetencyTally, prev?: Competency) => number {
  return (_name: string, t: CompetencyTally | undefined, prev: Competency | undefined): number => {
    if (t && t.total > 0) {
      const base = prev ? prev.currentScore : 35;
      return base * (1 - weightNew) + t.percentage * weightNew;
    }
    return prev ? prev.currentScore : 35;
  };
}

/** Overall role readiness: capped per-competency attainment averaged. */
export function computeRoleReadiness(competencies: Competency[]): number {
  if (!competencies.length) return 0;
  const allAchieved = competencies.every((c) => c.currentScore >= c.requiredScore);
  if (allAchieved) {
    // Readiness reflects overshoot quality, not a flat 100.
    const avg = competencies.reduce((s, c) => s + Math.min(115, c.currentScore), 0) / competencies.length;
    return clamp(Math.round((avg / 115) * 100));
  }
  const sum = competencies.reduce((s, c) => s + Math.min(100, (c.currentScore / c.requiredScore) * 100), 0);
  return clamp(sum / competencies.length);
}

/** Has the user reached role-ready (all competencies achieved)? */
export function isRoleReady(competencies: Competency[]): boolean {
  return competencies.length > 0 && competencies.every((c) => c.currentScore >= c.requiredScore);
}

/** Generate a unique certificate ID. */
export function generateCertificateId(mobile: string): string {
  const clean = mobile.replace(/\D/g, '').slice(-4) || '0000';
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const year = new Date().getFullYear();
  return `PRG-${year}-${clean}${rand}`;
}

/** Dynamic "AI" insight text generated from ACTUAL stored results. */
export function generateInsight(
  competencies: Competency[],
  tallies?: Record<string, CompetencyTally>
): string {
  if (!competencies.length) {
    return 'Take your initial assessment to unlock a personalized competency analysis.';
  }
  const achieved = competencies.filter((c) => c.currentScore >= c.requiredScore);
  const gaps = [...competencies].filter((c) => c.currentScore < c.requiredScore)
    .sort((a, b) => b.gap - a.gap);

  const parts: string[] = [];
  if (achieved.length) {
    const best = [...achieved].sort((a, b) => b.currentScore - a.currentScore)[0];
    parts.push(
      `Your assessment indicates strong performance in ${achieved.map((c) => c.name).join(', ')}` +
        `${best ? ` (highest: ${best.currentScore}%)` : ''}.`
    );
  } else {
    parts.push('Your initial assessment is recorded and no competency has yet reached its required level.');
  }
  if (gaps.length) {
    const top = gaps.slice(0, 2).map((c) => `${c.name} (${c.currentScore}% vs required ${c.requiredScore}%)`).join(' and ');
    parts.push(`${gaps.length === 1 ? gaps[0].name : top} require${gaps.length === 1 ? 's' : ''} further development to meet the competency requirements for your role.`);
  } else {
    parts.push('All required competencies have been achieved — you are role-ready and may download your report and certificate.');
  }
  if (tallies) {
    const weakest = Object.entries(tallies)
      .filter(([, t]) => t.total > 0 && t.percentage < 50)
      .sort((a, b) => a[1].percentage - b[1].percentage)[0];
    if (weakest) parts.push(`Within the last test, "${weakest[0]}" questions had the lowest accuracy (${weakest[1].percentage}%).`);
  }
  return parts.join(' ');
}
