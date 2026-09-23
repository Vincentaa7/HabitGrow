// src/lib/algorithms/__tests__/consistency.test.ts
import { describe, it, expect } from 'vitest';
import { calculateHabitConsistency, calculateOverallConsistency } from '../consistency';

describe('calculateConsistency Algorithm', () => {
  it('calculates 80% for 24 completed out of 30 scheduled (PRD Section 25 example)', () => {
    const score = calculateHabitConsistency(30, 24);
    expect(score).toBe(80);
  });

  it('handles 0 scheduled gracefully without division by zero', () => {
    expect(calculateHabitConsistency(0, 0)).toBe(0);
  });

  it('clamps values cleanly between 0 and 100', () => {
    expect(calculateHabitConsistency(10, 15)).toBe(100);
  });

  it('calculates weighted overall consistency score (PRD Section 26)', () => {
    const stats = [
      { scheduledCount: 10, completedCount: 9 }, // 90%
      { scheduledCount: 10, completedCount: 8 }, // 80%
      { scheduledCount: 10, completedCount: 7 }, // 70%
    ];
    // Total completed: 24, Total scheduled: 30 -> 80%
    expect(calculateOverallConsistency(stats)).toBe(80);
  });
});
