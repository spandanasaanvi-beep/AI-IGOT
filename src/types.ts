/* =========================================================================
 * PragatiAI — Shared TypeScript data model
 * =========================================================================
 * These interfaces mirror the backend models (backend/models.py) so the app
 * can later migrate from localStorage persistence to PostgreSQL without
 * rewriting the UI layer.
 * ======================================================================= */

export type Gender = 'Male' | 'Female' | 'Other';
export type CompetencyStatus = 'achieved' | 'needs-improvement' | 'critical';
export type Priority = 'high' | 'medium' | 'low';
export type LearningStatus = 'recommended' | 'in-progress' | 'completed';
export type AssessmentType = 'initial' | 'reassessment' | 'generated' | 'material';

/* ---------------- User ---------------- */
export interface UserProfile {
  id: string;
  fullName: string;
  mobile: string;
  gender: string;
  dateOfBirth: string; // ISO date
  age: number;
  qualification: string;
  role: string;
  organization: string;
  currentAssignment?: string;
  experienceYears: number;
  experienceMonths: number;
  previousTraining?: string;
  technicalSkills?: string;
  statisticalSkills?: string;
  createdAt: string;
  profileCompleted: boolean;
}

/* ---------------- Competency ---------------- */
export interface Competency {
  competencyId: string;
  name: string;
  requiredScore: number;
  currentScore: number;
  initialScore: number;
  latestScore: number;
  status: CompetencyStatus;
  gap: number; // required - current (0 if achieved)
}

/* ---------------- Questions ---------------- */
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index
  explanation: string;
  competency: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

/* ---------------- Assessments / Quizzes ---------------- */
export interface Assessment {
  id: string;
  type: AssessmentType;
  title: string;
  date: string; // ISO
  questions: Question[];
  answers: (number | null)[]; // index per question
  score: number; // correct count
  percentage: number;
  competencyPerformance: Record<string, { correct: number; total: number; percentage: number }>;
  integrityViolations: number; // tab switches etc.
}

export interface UploadedMaterial {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  processingStage: number; // 0..5
  status: 'processing' | 'ready' | 'error';
  topics: string[];
  detectedCompetencies: string[];
  error?: string;
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  competency: string;
  priority: Priority;
  duration: string;
  type: string;
  status: LearningStatus;
  progress: number; // 0-100
  igotUrl: string;
  provider: string;
  module?: string; // e.g. "Module 2" for adaptive re-recommendation
  category?: string;
  relevanceScore?: number;
  enrolmentStatus?: string;
}

export interface Certificate {
  certificateId: string;
  completionDate: string;
  status: 'locked' | 'unlocked';
}

export interface ActivityEvent {
  id: string;
  type: 'assessment' | 'learning' | 'quiz' | 'upload' | 'system' | 'profile';
  message: string;
  timestamp: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export interface CompetencyTally {
  correct: number;
  total: number;
  percentage: number;
}

export interface AppState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  competencies: Competency[];
  assessments: Assessment[];
  materials: UploadedMaterial[];
  resources: LearningResource[];
  generatedQuiz: { questions: Question[]; source: string; difficulty: string } | null;
  lastQuizResultId: string | null;
  certificate: Certificate | null;
  activities: ActivityEvent[];
  contactMessages: ContactMessage[];
  completionCelebrated: boolean;
}
