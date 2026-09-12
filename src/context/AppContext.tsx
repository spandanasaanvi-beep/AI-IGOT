import React, { createContext, useContext, useEffect, useMemo, useReducer, ReactNode } from 'react';
import {
  AppState, UserProfile, Competency, Assessment, LearningResource,
  UploadedMaterial, ActivityEvent, Question, ContactMessage, CompetencyTally as TallyType,
} from '../types';
import { loadState, saveState, clearState } from '../services/storage';
import {
  tallyCompetencies, buildCompetencies, initialScoreProvider, blendedScoreProvider,
  computeRoleReadiness, isRoleReady, generateCertificateId,
} from '../services/competencyEngine';
import { getRecommendedResources } from '../services/igotService';

/* =========================================================================
 * AppContext — single source of truth for the whole product journey.
 * State persists to localStorage via the storage service.
 * ======================================================================= */

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  competencies: [],
  assessments: [],
  materials: [],
  resources: [],
  generatedQuiz: null,
  lastQuizResultId: null,
  certificate: null,
  activities: [],
  contactMessages: [],
  completionCelebrated: false,
};

type Action =
  | { type: 'HYDRATE'; payload: AppState }
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_COMPETENCIES'; payload: Competency[] }
  | { type: 'ADD_ASSESSMENT'; payload: Assessment }
  | { type: 'ADD_MATERIAL'; payload: UploadedMaterial }
  | { type: 'UPDATE_MATERIAL'; payload: { id: string; patch: Partial<UploadedMaterial> } }
  | { type: 'SET_RESOURCES'; payload: LearningResource[] }
  | { type: 'UPDATE_RESOURCE'; payload: { id: string; patch: Partial<LearningResource> } }
  | { type: 'SET_GENERATED_QUIZ'; payload: AppState['generatedQuiz'] }
  | { type: 'SET_LAST_QUIZ_RESULT'; payload: string | null }
  | { type: 'SET_CERTIFICATE' }
  | { type: 'ADD_ACTIVITY'; payload: ActivityEvent }
  | { type: 'ADD_CONTACT_MESSAGE'; payload: ContactMessage }
  | { type: 'MARK_CELEBRATED' }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'UPDATE_PROFILE':
      return state.user ? { ...state, user: { ...state.user, ...action.payload } } : state;
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_COMPETENCIES':
      return { ...state, competencies: action.payload };
    case 'ADD_ASSESSMENT':
      return { ...state, assessments: [...state.assessments, action.payload] };
    case 'ADD_MATERIAL':
      return { ...state, materials: [...state.materials, action.payload] };
    case 'UPDATE_MATERIAL':
      return {
        ...state,
        materials: state.materials.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload.patch } : m
        ),
      };
    case 'SET_RESOURCES':
      return { ...state, resources: action.payload };
    case 'UPDATE_RESOURCE':
      return {
        ...state,
        resources: state.resources.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload.patch } : r
        ),
      };
    case 'SET_GENERATED_QUIZ':
      return { ...state, generatedQuiz: action.payload };
    case 'SET_LAST_QUIZ_RESULT':
      return { ...state, lastQuizResultId: action.payload };
    case 'SET_CERTIFICATE': {
      if (!state.user) return state;
      return {
        ...state,
        certificate: {
          certificateId: generateCertificateId(state.user.mobile),
          completionDate: new Date().toISOString(),
          status: 'unlocked',
        },
      };
    }
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities].slice(0, 30) };
    case 'ADD_CONTACT_MESSAGE':
      return { ...state, contactMessages: [...state.contactMessages, action.payload] };
    case 'MARK_CELEBRATED':
      return { ...state, completionCelebrated: true };
    case 'RESET':
      clearState();
      return { ...initialState };
    default:
      return state;
  }
}

export interface AppContextValue {
  state: AppState;
  roleReadiness: number;
  isReady: boolean;
  // auth/profile
  registerUser: (name: string, mobile: string) => void;
  completeProfile: (profile: Partial<UserProfile>) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  logout: () => void;
  // assessments
  submitInitialAssessment: (questions: Question[], answers: (number | null)[], violations: number, title: string, type?: Assessment['type']) => Assessment;
  submitQuiz: (questions: Question[], answers: (number | null)[], violations: number, title: string, source: string, difficulty: string) => Assessment;
  // resources & learning
  refreshRecommendations: () => void;
  updateResourceProgress: (id: string, progress: number) => void;
  // materials & quizzes
  addMaterial: (m: UploadedMaterial) => void;
  updateMaterial: (id: string, patch: Partial<UploadedMaterial>) => void;
  setGeneratedQuiz: (q: AppState['generatedQuiz']) => void;
  setLastQuizResult: (id: string | null) => void;
  // misc
  addActivity: (type: ActivityEvent['type'], message: string) => void;
  addContactMessage: (msg: Omit<ContactMessage, 'id' | 'submittedAt'>) => void;
  resetApplication: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

let activityCounter = 0;
function makeActivity(type: ActivityEvent['type'], message: string): ActivityEvent {
  return {
    id: `act-${Date.now()}-${activityCounter++}`,
    type,
    message,
    timestamp: new Date().toISOString(),
  };
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate once on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) dispatch({ type: 'HYDRATE', payload: saved });
  }, []);

  // Persist on every change (after hydration)
  useEffect(() => {
    if (state !== initialState) saveState(state);
  }, [state]);

  // Derived values
  const roleReadiness = useMemo(() => computeRoleReadiness(state.competencies), [state.competencies]);
  const isReady = useMemo(() => isRoleReady(state.competencies), [state.competencies]);

  // Auto-unlock certificate + celebrate when role-ready
  useEffect(() => {
    if (isReady && !state.certificate) {
      dispatch({ type: 'SET_CERTIFICATE' });
    }
    if (isReady && !state.completionCelebrated) {
      dispatch({ type: 'MARK_CELEBRATED' });
    }
  }, [isReady, state.certificate, state.completionCelebrated]);

  const registerUser = (name: string, mobile: string) => {
    const user: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: name,
      mobile,
      gender: '',
      dateOfBirth: '',
      age: 0,
      qualification: '',
      role: '',
      organization: '',
      experienceYears: 0,
      experienceMonths: 0,
      createdAt: new Date().toISOString(),
      profileCompleted: false,
    };
    dispatch({ type: 'SET_USER', payload: user });
    dispatch({ type: 'ADD_ACTIVITY', payload: makeActivity('system', 'Account created and mobile number verified via OTP.') });
  };

  const completeProfile = (profile: Partial<UserProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { ...profile, profileCompleted: true } });
    dispatch({ type: 'ADD_ACTIVITY', payload: makeActivity('profile', 'Professional profile created.') });
  };

  const updateProfile = (patch: Partial<UserProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: patch });
  };

  const logout = () => dispatch({ type: 'RESET' });

  /** Shared scoring + state-update pipeline for every assessment/quiz. */
  const processSubmission = (
    questions: Question[],
    answers: (number | null)[],
    violations: number,
    title: string,
    type: Assessment['type'],
    scoreProvider: (name: string, t: TallyType | undefined, prev: Competency | undefined) => number
  ): Assessment => {
    const tally = tallyCompetencies(questions, answers);
    const correct = questions.reduce((s, q, i) => s + (answers[i] === q.correctAnswer ? 1 : 0), 0);
    const percentage = questions.length ? Math.round((correct / questions.length) * 100) : 0;

    const assessment: Assessment = {
      id: `asmt-${Date.now()}`,
      type,
      title,
      date: new Date().toISOString(),
      questions,
      answers,
      score: correct,
      percentage,
      competencyPerformance: tally,
      integrityViolations: violations,
    };

    const nextCompetencies = buildCompetencies(state.user?.role || '', tally, state.competencies, scoreProvider);
    dispatch({ type: 'SET_COMPETENCIES', payload: nextCompetencies });
    dispatch({ type: 'ADD_ASSESSMENT', payload: assessment });
    dispatch({ type: 'ADD_ACTIVITY', payload: makeActivity(type === 'initial' ? 'assessment' : 'quiz', `${title} completed — scored ${correct}/${questions.length} (${percentage}%).`) });
    dispatch({ type: 'SET_RESOURCES', payload: getRecommendedResources(nextCompetencies, state.resources) });

    return assessment;
  };

  const submitInitialAssessment = (
    questions: Question[], answers: (number | null)[], violations: number, title: string,
    type: Assessment['type'] = 'initial'
  ) => processSubmission(questions, answers, violations, title, type, initialScoreProvider());

  const submitQuiz = (
    questions: Question[], answers: (number | null)[], violations: number, title: string,
    source: string, difficulty: string
  ) => {
    const assessment = processSubmission(questions, answers, violations, title, 'generated', blendedScoreProvider());
    void source; void difficulty; // recorded for future analytics
    return assessment;
  };

  const refreshRecommendations = () => {
    dispatch({ type: 'SET_RESOURCES', payload: getRecommendedResources(state.competencies, state.resources) });
  };

  const updateResourceProgress = (id: string, progress: number) => {
    const res = state.resources.find((r) => r.id === id);
    if (!res) return;
    const p = Math.max(res.progress, Math.min(100, Math.round(progress)));
    const status: LearningResource['status'] = p >= 100 ? 'completed' : p > 0 ? 'in-progress' : 'recommended';
    dispatch({ type: 'UPDATE_RESOURCE', payload: { id, patch: { progress: p, status } } });
    if (status === 'completed') {
      dispatch({ type: 'ADD_ACTIVITY', payload: makeActivity('learning', `"${res.title}" marked complete on iGOT Karmayogi.`) });
    }
  };

  const addMaterial = (m: UploadedMaterial) => dispatch({ type: 'ADD_MATERIAL', payload: m });
  const updateMaterial = (id: string, patch: Partial<UploadedMaterial>) =>
    dispatch({ type: 'UPDATE_MATERIAL', payload: { id, patch } });
  const setGeneratedQuiz = (q: AppState['generatedQuiz']) => dispatch({ type: 'SET_GENERATED_QUIZ', payload: q });
  const setLastQuizResult = (id: string | null) => dispatch({ type: 'SET_LAST_QUIZ_RESULT', payload: id });

  const addActivity = (type: ActivityEvent['type'], message: string) =>
    dispatch({ type: 'ADD_ACTIVITY', payload: makeActivity(type, message) });

  const addContactMessage = (msg: Omit<ContactMessage, 'id' | 'submittedAt'>) =>
    dispatch({
      type: 'ADD_CONTACT_MESSAGE',
      payload: { ...msg, id: `msg-${Date.now()}`, submittedAt: new Date().toISOString() },
    });

  const resetApplication = () => dispatch({ type: 'RESET' });

  const value: AppContextValue = {
    state, roleReadiness, isReady,
    registerUser, completeProfile, updateProfile, logout,
    submitInitialAssessment, submitQuiz,
    refreshRecommendations, updateResourceProgress,
    addMaterial, updateMaterial, setGeneratedQuiz, setLastQuizResult,
    addActivity, addContactMessage, resetApplication,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
