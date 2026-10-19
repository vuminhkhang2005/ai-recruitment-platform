import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/primitives';

/** Route guard: requires login, and optionally a specific role. */
export const RequireRole: React.FC<{ role?: 'candidate' | 'recruiter' | 'admin'; children: React.ReactNode }> = ({ role, children }) => {
  const { initializing, isAuthenticated, isCandidate, isRecruiter, isAdmin } = useAuth();
  const location = useLocation();

  if (initializing) return <PageLoader />;
  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (role === 'admin' && !isAdmin) return <Navigate to={isRecruiter ? '/employer' : '/'} replace />;
  if (role === 'candidate' && !isCandidate && !isAdmin) return <Navigate to={isRecruiter ? '/employer' : '/'} replace />;
  if (role === 'recruiter' && !isRecruiter && !isAdmin) return <Navigate to="/employers" replace />;
  return <>{children}</>;
};
