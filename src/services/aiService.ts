import { Question, Competency } from '../types';
import { QUESTION_BANK, SAMPLE_MATERIAL_TOPICS } from '../mockData';

/* =========================================================================
 * AI service abstraction.
 *
 * `generateQuiz` and `analyzeMaterial` are the two integration points:
 * when a real LLM/API is configured, implement them with real calls and
 * keep the same signatures. The demo provider uses a curated local
 * question bank so the prototype works offline.
 * ======================================================================= */

export interface QuizConfig {
  count: 5 | 10 | 15;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  source: 'gaps' | 'material';
  targetCompetencies?: string[]; // for gap-based quizzes
  materialTopics?: string[]; // for material-based quizzes
}

export interface MaterialAnalysis {
  topics: string[];
  competencies: string[];
  summary: string;
}

/** Deterministic shuffle so a quiz isn't reshuffled on every re-render. */
function seededShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  let seed = Date.now() % 2147483647;
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * DEMO question generation from the local bank. A real implementation would
 * call the configured LLM with competency context and return structured
 * questions in this same shape.
 */
export async function generateQuiz(config: QuizConfig): Promise<Question[]> {
  // Simulated model latency
  await new Promise((r) => setTimeout(r, 1200));

  let pool: Question[] = QUESTION_BANK;

  if (config.source === 'gaps') {
    const targets = config.targetCompetencies?.length
      ? config.targetCompetencies
      : [];
    if (targets.length) {
      pool = QUESTION_BANK.filter((q) => targets.includes(q.competency));
      // Widen if not enough questions for the requested count.
      if (pool.length < config.count) {
        pool = [...pool, ...QUESTION_BANK.filter((q) => !targets.includes(q.competency))];
      }
    }
  }

  if (config.difficulty !== 'mixed') {
    const byDiff = pool.filter((q) => q.difficulty === config.difficulty);
    if (byDiff.length >= 3) pool = byDiff;
  }

  return seededShuffle(pool)
    .slice(0, config.count)
    .map((q) => ({ ...q }));
}

/**
 * DEMO document analysis: simulates parsing PDF/DOCX/PPTX/TXT and topic
 * extraction. A real implementation would extract text (pdfplumber /
 * python-docx server-side, or client-side parsers) and run an LLM topic
 * model over the content, returning the same MaterialAnalysis shape.
 */
export async function analyzeMaterial(fileName: string): Promise<MaterialAnalysis> {
  await new Promise((r) => setTimeout(r, 400));
  const seed = fileName.length;
  const topics = seededShuffle(SAMPLE_MATERIAL_TOPICS).slice(0, 4 + (seed % 3));
  const competencyMap: Record<string, string> = {
    'Data Collection': 'Data Management',
    'Statistical Sampling': 'Statistical Methods',
    'Data Management': 'Data Management',
    'Data Visualization': 'Data Visualization',
    'Hypothesis Testing': 'Statistical Methods',
    'Descriptive Statistics': 'Statistical Analysis',
    'Data Quality': 'Quality Assurance',
    'Survey Design': 'Statistical Methods',
    'Regression Analysis': 'Statistical Analysis',
    'Official Statistics': 'Official Statistics',
  };
  const competencies = Array.from(new Set(topics.map((t) => competencyMap[t] ?? 'Data Management')));
  return {
    topics,
    competencies,
    summary: `Analyzed "${fileName}" — ${topics.length} topics detected across ${competencies.length} competencies.`,
  };
}

/** Map material competencies to competency records (helper for context). */
export function matchCompetencyRecords(competencies: string[], records: Competency[]): Competency[] {
  return competencies
    .map((name) => records.find((c) => c.name === name))
    .filter((c): c is Competency => Boolean(c));
}
