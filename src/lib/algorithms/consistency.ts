// src/lib/algorithms/consistency.ts

export interface HabitConsistencyStats {
  habitId: string;
  habitName: string;
  scheduledCount: number;
  completedCount: number;
  consistencyScore: number;
}

/**
 * Calculates consistency score for a single habit.
 * Formula per PRD Section 25:
 * Completion Rate = (completed scheduled occurrences / total scheduled occurrences) * 100
 * Clamped between 0 and 100.
 */
export function calculateHabitConsistency(scheduledCount: number, completedCount: number): number {
  if (scheduledCount <= 0) {
    // If habit was just created or has no scheduled days yet, score is 0
    return 0;
  }

  const rate = (completedCount / scheduledCount) * 100;
  return Math.min(100, Math.max(0, Math.round(rate * 100) / 100));
}

/**
 * Calculates overall consistency score across multiple habits.
 * PRD Section 26: Weighted average based on scheduled occurrences.
 * Overall = (Sum of all completed / Sum of all scheduled) * 100
 */
export function calculateOverallConsistency(
  habitsStats: Array<{ scheduledCount: number; completedCount: number }>
): number {
  if (!habitsStats || habitsStats.length === 0) {
    return 0;
  }

  let totalScheduled = 0;
  let totalCompleted = 0;

  for (const item of habitsStats) {
    totalScheduled += Math.max(0, item.scheduledCount);
    totalCompleted += Math.max(0, Math.min(item.completedCount, item.scheduledCount));
  }

  if (totalScheduled <= 0) {
    return 0;
  }

  const overall = (totalCompleted / totalScheduled) * 100;
  return Math.min(100, Math.max(0, Math.round(overall * 100) / 100));
}
