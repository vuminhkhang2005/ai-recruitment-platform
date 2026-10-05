import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/primitives';

/** Route guard: requires login, and optionally a specific role. */
export const RequireRole: React.FC<{ role?: 'candidate' | 'recruiter'; children: React.ReactNode }> = ({ role, children }) => {
  const { initializing, isAuthenticated, isCandidate, isRecruiter } = useAuth();
  const location = useLocation();

  if (initializing) return <PageLoader />;
  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (role === 'candidate' && !isCandidate) return <Navigate to={isRecruiter ? '/employer' : '/'} replace />;
  if (role === 'recruiter' && !isRecruiter) return <Navigate to="/employers" replace />;
  return <>{children}</>;
};
