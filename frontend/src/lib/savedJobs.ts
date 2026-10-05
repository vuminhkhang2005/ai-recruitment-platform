import { useCallback, useSyncExternalStore } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Job } from './types';

/**
 * Saved jobs are kept per user in localStorage (the backend has no bookmark endpoint yet).
 * A snapshot of the job is stored so the list renders without extra requests.
 */
export interface SavedJob {
  id: number;
  title: string;
  companyName: string;
  companyLogo: string | null;
  salaryFormatted: string;
  locationCity: string | null;
  deadline: string | null;
  savedAt: string;
}

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: SavedJob[] }>();
const EMPTY: SavedJob[] = [];

const keyFor = (userId?: number) => (userId ? `talentbridge_saved_jobs_${userId}` : '');

function read(key: string): SavedJob[] {
  if (!key) return EMPTY;
  const raw = localStorage.getItem(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value;
  let value: SavedJob[] = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    value = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    value = EMPTY;
  }
  cache.set(key, { raw, value });
  return value;
}

function write(key: string, list: SavedJob[]) {
  localStorage.setItem(key, JSON.stringify(list));
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener('storage', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', cb);
  };
}

export function useSavedJobs() {
  const { user } = useAuth();
  const key = keyFor(user?.id);
  const saved = useSyncExternalStore(subscribe, () => read(key));

  const isSaved = useCallback((jobId: number) => saved.some((s) => s.id === jobId), [saved]);

  const toggle = useCallback(
    (job: Job) => {
      if (!key) return false;
      const current = read(key);
      if (current.some((s) => s.id === job.id)) {
        write(key, current.filter((s) => s.id !== job.id));
        return false;
      }
      const snap: SavedJob = {
        id: job.id,
        title: job.title,
        companyName: job.companyName,
        companyLogo: job.companyLogo,
        salaryFormatted: job.salaryFormatted,
        locationCity: job.locationCity,
        deadline: job.deadline,
        savedAt: new Date().toISOString(),
      };
      write(key, [snap, ...current]);
      return true;
    },
    [key],
  );

  const remove = useCallback(
    (jobId: number) => {
      if (key) write(key, read(key).filter((s) => s.id !== jobId));
    },
    [key],
  );

  return { saved, isSaved, toggle, remove, enabled: !!key };
}
