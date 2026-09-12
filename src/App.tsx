import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';

// Public flow pages
import CreateAccount from './pages/CreateAccount';
import ProfileSetup from './pages/ProfileSetup';

// App pages
import SkillAssessment from './pages/SkillAssessment';
import CompetencyGaps from './pages/CompetencyGaps';
import Dashboard from './pages/Dashboard';
import LearningPath from './pages/LearningPath';
import IGOTPage from './pages/IGOTPage';
import UploadPage from './pages/UploadPage';
import QuizPage from './pages/QuizPage';
import QuizResult from './pages/QuizResult';
import BeforeVsAfter from './pages/BeforeVsAfter';
import AdaptiveRecommendations from './pages/AdaptiveRecommendations';
import RoleReady from './pages/RoleReady';
import ReportsPage from './pages/ReportsPage';
import CertificatePage from './pages/CertificatePage';
import AboutUs from './pages/AboutUs';
import ContactPage from './pages/ContactPage';

/**
 * Guards the registration journey: account → OTP → profile.
 * Redirects forward if the step is already done, backward if skipped ahead.
 */
const OnboardingRoute: React.FC<{ step: 'account' | 'profile'; children: React.ReactNode }> = ({ step, children }) => {
  const { state } = useAppContext();
  if (state.isAuthenticated && step === 'account') {
    return <Navigate to={state.user?.profileCompleted ? '/dashboard' : '/profile-setup'} replace />;
  }
  if (step === 'profile' && (!state.isAuthenticated || state.user?.profileCompleted)) {
    return <Navigate to={state.user?.profileCompleted ? '/initial-assessment' : '/profile-setup'} replace />;
  }
  return <>{children}</>;
};

/** Requires authentication; routes unauthenticated visitors to account creation. */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAppContext();
  if (!state.isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public journey */}
      <Route path="/" element={<OnboardingRoute step="account"><CreateAccount /></OnboardingRoute>} />
      <Route path="/create-account" element={<Navigate to="/" replace />} />
      <Route path="/profile-setup" element={<OnboardingRoute step="profile"><ProfileSetup /></OnboardingRoute>} />

      {/* Post-profile assessment flow (no sidebar chrome — focused testing) */}
      <Route path="/initial-assessment" element={<ProtectedRoute><SkillAssessment /></ProtectedRoute>} />
      <Route path="/competency-gaps" element={<ProtectedRoute><CompetencyGaps /></ProtectedRoute>} />

      {/* Main application shell */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/learning-path" element={<ProtectedRoute><Layout><LearningPath /></Layout></ProtectedRoute>} />
      <Route path="/igot" element={<ProtectedRoute><Layout><IGOTPage /></Layout></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Layout><UploadPage /></Layout></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><Layout><QuizPage /></Layout></ProtectedRoute>} />
      <Route path="/quiz-result" element={<ProtectedRoute><Layout><QuizResult /></Layout></ProtectedRoute>} />
      <Route path="/before-after" element={<ProtectedRoute><Layout><BeforeVsAfter /></Layout></ProtectedRoute>} />
      <Route path="/adaptive" element={<ProtectedRoute><Layout><AdaptiveRecommendations /></Layout></ProtectedRoute>} />
      <Route path="/role-ready" element={<ProtectedRoute><Layout><RoleReady /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Layout><ReportsPage /></Layout></ProtectedRoute>} />
      <Route path="/certificate" element={<ProtectedRoute><Layout><CertificatePage /></Layout></ProtectedRoute>} />
      <Route path="/about" element={<ProtectedRoute><Layout><AboutUs /></Layout></ProtectedRoute>} />
      <Route path="/contact" element={<ProtectedRoute><Layout><ContactPage /></Layout></ProtectedRoute>} />

      {/* Fallbacks */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/landing" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
