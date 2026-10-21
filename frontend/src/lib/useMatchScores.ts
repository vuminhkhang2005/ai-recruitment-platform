import type { MatchScore } from './types';

/**
 * Per TopCV business logic, AI CV-vs-JD match analysis is strictly opt-in when the candidate
 * selects a CV and requests AI comparison in the Apply Modal or Job Detail view, rather than
 * passively displaying scores on every job listing card.
 */
export function useMatchScores(_jobIds: number[]): Record<number, MatchScore> {
  return {};
}
