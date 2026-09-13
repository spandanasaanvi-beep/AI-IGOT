import { Competency, LearningResource, Priority } from '../types';
import { LEARNING_CATALOGUE } from '../mockData';

/* =========================================================================
 * iGOT Karmayogi integration layer — DEMO catalogue.
 *
 * All learning resources route to the official iGOT portal. When real
 * iGOT APIs become available, replace `getRecommendedResources` internals
 * with API calls; the interface (input: gaps, output: resources with
 * igotUrl) stays identical.
 * ======================================================================= */

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/**
 * Build personalized recommendations from CURRENT competency gaps.
 * Priority is derived from gap size (larger gap → higher priority);
 * module numbering supports the adaptive "next module" loop.
 */
export function getCourseCatalogue(): LearningResource[] {
  return LEARNING_CATALOGUE.map((resource) => ({
    ...resource,
    status: 'recommended',
    progress: 0,
    category: resource.category ?? 'General',
    relevanceScore: resource.relevanceScore ?? 80,
    enrolmentStatus: 'not-enrolled',
  }));
}

export function getCourseRecommendations(
  competencies: Competency[],
  existing: LearningResource[] = []
): LearningResource[] {
  return getRecommendedResources(competencies, existing);
}

export function getEnrolmentStatus(
  resourceId: string,
  existing: LearningResource[] = []
): LearningResource['enrolmentStatus'] {
  const match = existing.find((resource) => resource.id === resourceId);
  return match?.enrolmentStatus ?? 'not-enrolled';
}

export function getCompletionStatus(
  resourceId: string,
  existing: LearningResource[] = []
): LearningResource['status'] {
  const match = existing.find((resource) => resource.id === resourceId);
  return match?.status ?? 'recommended';
}

export function updateCompetencySignals(competencies: Competency[]) {
  return competencies
    .filter((competency) => competency.currentScore < competency.requiredScore)
    .map((competency) => ({
      competency: competency.name,
      gap: competency.gap,
      priority: competency.gap >= 25 ? 'high' : competency.gap >= 12 ? 'medium' : 'low',
      requiredScore: competency.requiredScore,
      currentScore: competency.currentScore,
    }))
    .sort((a, b) => b.gap - a.gap);
}

export function getRecommendedResources(
  competencies: Competency[],
  existing: LearningResource[] = []
): LearningResource[] {
  const recommendations: LearningResource[] = [];

  const gaps = [...competencies]
    .filter((c) => c.currentScore < c.requiredScore)
    .sort((a, b) => b.gap - a.gap);

  gaps.forEach((c, idx) => {
    const catalogueMatches = LEARNING_CATALOGUE.filter((r) => r.competency === c.name);
    const prev = existing.find((r) => r.competency === c.name && r.status !== 'completed');

    if (catalogueMatches.length) {
      const pick = catalogueMatches[idx % catalogueMatches.length];
      const nextModuleNumber = prev?.module ? (parseInt(prev.module.replace(/\D/g, ''), 10) || 1) + 1 : 1;
      recommendations.push({
        ...pick,
        priority: c.gap >= 25 ? 'high' : c.gap >= 12 ? 'medium' : 'low',
        status: prev?.status ?? 'recommended',
        progress: prev?.progress ?? 0,
        module: `Module ${nextModuleNumber}`,
      });
    } else {
      // Fallback: generic resource for competencies without catalogue entries.
      recommendations.push({
        id: `res-gen-${c.competencyId}`,
        title: `${c.name} — Applied Practice`,
        description: `Targeted practice resources for ${c.name} mapped from iGOT Karmayogi.`,
        competency: c.name,
        priority: 'medium',
        duration: '3 hours',
        type: 'Practice Module',
        status: prev?.status ?? 'recommended',
        progress: prev?.progress ?? 0,
        igotUrl: 'https://igotkarmayogi.gov.in/#/course',
        provider: 'iGOT Karmayogi',
        module: `Module ${prev ? (parseInt(prev.module?.replace(/\D/g, '') || '1', 10) || 1) + 1 : 1}`,
      });
    }
  });

  // Also surface already-started resources so progress is never hidden.
  existing.forEach((r) => {
    if (r.status === 'in-progress' && !recommendations.some((x) => x.id === r.id)) {
      recommendations.push(r);
    }
  });

  return recommendations.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

/** Count of competencies with zero remaining gap. */
export function achievedCount(competencies: Competency[]): number {
  return competencies.filter((c) => c.currentScore >= c.requiredScore).length;
}
