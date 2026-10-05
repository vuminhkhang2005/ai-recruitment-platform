import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { applicationApi } from '../lib/api';
import type { Application } from '../lib/types';
import { useAuth } from './AuthContext';

interface MyApplicationsValue {
  applications: Application[];
  loading: boolean;
  appliedJobIds: Set<number>;
  refresh: () => Promise<void>;
}

const MyApplicationsContext = createContext<MyApplicationsValue | undefined>(undefined);

/** Candidate's own applications, shared so job cards/details can show "Đã ứng tuyển". */
export const MyApplicationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isCandidate, user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isCandidate) {
      setApplications([]);
      return;
    }
    setLoading(true);
    try {
      setApplications(await applicationApi.mine());
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [isCandidate]);

  useEffect(() => {
    void refresh();
  }, [refresh, user?.id]);

  const value = useMemo(
    () => ({ applications, loading, appliedJobIds: new Set(applications.map((a) => a.jobId)), refresh }),
    [applications, loading, refresh],
  );

  return <MyApplicationsContext.Provider value={value}>{children}</MyApplicationsContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useMyApplications() {
  const ctx = useContext(MyApplicationsContext);
  if (!ctx) throw new Error('useMyApplications must be used within MyApplicationsProvider');
  return ctx;
}
