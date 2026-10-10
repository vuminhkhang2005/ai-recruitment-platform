import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, SESSION_EXPIRED_EVENT, tokens } from '../lib/api';
import type { AuthResponse, RegisterInput, UserSummary } from '../lib/types';

interface AuthContextValue {
  user: UserSummary | null;
  /** True until the stored session has been verified with the backend. */
  initializing: boolean;
  isAuthenticated: boolean;
  isCandidate: boolean;
  isRecruiter: boolean;
  login: (email: string, password: string) => Promise<UserSummary>;
  register: (input: RegisterInput) => Promise<UserSummary>;
  logout: () => Promise<void>;
  setUserSession: (res: AuthResponse) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Restore the session from a stored token (refresh happens inside the API client).
  useEffect(() => {
    let active = true;
    if (!tokens.access) {
      setInitializing(false);
      return;
    }
    authApi
      .me()
      .then((u) => active && setUser(u))
      .catch(() => {
        tokens.clear();
        if (active) setUser(null);
      })
      .finally(() => active && setInitializing(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email.trim(), password);
    tokens.set(res);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const res = await authApi.register(input);
    tokens.set(res);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokens.refresh;
    tokens.clear();
    setUser(null);
    await authApi.logout(refreshToken);
  }, []);

  const setUserSession = useCallback((res: AuthResponse) => {
    tokens.set(res);
    setUser(res.user);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const roles = user?.roles ?? [];
    return {
      user,
      initializing,
      isAuthenticated: !!user,
      isCandidate: roles.includes('ROLE_CANDIDATE'),
      isRecruiter: roles.includes('ROLE_RECRUITER'),
      login,
      register,
      logout,
      setUserSession,
    };
  }, [user, initializing, login, register, logout, setUserSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}