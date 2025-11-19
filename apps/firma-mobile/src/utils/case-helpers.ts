import type { Case } from '../types';

/**
 * Get the user's active case (Phase 0-2, not completed)
 * Backend integration: Returns first active case from the list
 */
export function getActiveCase(cases: Case[]): Case | null {
  return cases.find(c =>
    c.current_phase < 3 &&
    c.status !== 'completed' &&
    c.status !== 'cancelled'
  ) || null;
}

/**
 * Check if user has any active cases
 */
export function hasActiveCase(cases: Case[]): boolean {
  return getActiveCase(cases) !== null;
}

/**
 * Get completed cases
 */
export function getCompletedCases(cases: Case[]): Case[] {
  return cases.filter(c => c.current_phase === 3 || c.status === 'completed');
}

/**
 * Get cases in a specific phase
 */
export function getCasesByPhase(cases: Case[], phase: number): Case[] {
  return cases.filter(c => c.current_phase === phase);
}
