import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { candidateApi } from './api';
import type { MatchScore } from './types';

/**
 * Skill-overlap match scores from the backend. Only fetched for logged-in candidates;
 * a score is absent when the job or the candidate has no skills listed.
 */
export function useMatchScores(jobIds: number[]) {
  const { isCandidate } = useAuth();
  const [scores, setScores] = useState<Record<number, MatchScore>>({});
  const key = jobIds.join(',');

  useEffect(() => {
    if (!isCandidate || !key) {
      setScores({});
      return;
    }
    let active = true;
    candidateApi
      .matchScores(key.split(',').map(Number))
      .then((list) => {
        if (!active) return;
        const map: Record<number, MatchScore> = {};
        list.forEach((m) => (map[m.jobId] = m));
        setScores(map);
      })
      .catch(() => active && setScores({}));
    return () => {
      active = false;
    };
  }, [isCandidate, key]);

  return scores;
}
