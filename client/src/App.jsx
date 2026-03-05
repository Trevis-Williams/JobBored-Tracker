import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { FullPageSpinner } from './components/ui/Spinner';
import useNotifications from './hooks/useNotifications';
import BottomNav from './components/layout/BottomNav';

const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Scanner = lazy(() => import('./pages/Scanner'));
const FoodDetail = lazy(() => import('./pages/FoodDetail'));
const Search = lazy(() => import('./pages/Search'));
const Recipe = lazy(() => import('./pages/Recipe'));
const Exercise = lazy(() => import('./pages/Exercise'));
const Settings = lazy(() => import('./pages/Settings'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboardingComplete) return <Navigate to="/onboarding" replace />;

  return children;
}

function OnboardingRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingComplete) return <Navigate to="/" replace />;

  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;

  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  const { user } = useAuth();
  useNotifications(user);
  const showNav = user && user.onboardingComplete;

  return (
    <div className={showNav ? 'pb-20' : ''}>
      <Suspense fallback={<FullPageSpinner />}>
        <Routes>
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

          <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
          <Route path="/food/:id" element={<ProtectedRoute><FoodDetail /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/recipe" element={<ProtectedRoute><Recipe /></ProtectedRoute>} />
          <Route path="/exercise" element={<ProtectedRoute><Exercise /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {showNav && <BottomNav />}
    </div>
  );
}
