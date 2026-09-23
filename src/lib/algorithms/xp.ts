// src/lib/algorithms/xp.ts
import { HabitDifficulty } from '@/types/database';

export const XP_REWARDS: Record<HabitDifficulty, number> = {
  EASY: 10,
  MEDIUM: 15,
  HARD: 20,
};

/**
 * Calculates XP earned based on habit difficulty.
 * Difficulty multipliers are strictly enforced on server-side.
 * PRD Section 23: Easy = 10, Medium = 15, Hard = 20.
 */
export function calculateXP(difficulty: HabitDifficulty = 'EASY'): number {
  return XP_REWARDS[difficulty] ?? 10;
}
