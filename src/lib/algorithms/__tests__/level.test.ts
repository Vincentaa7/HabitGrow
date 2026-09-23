// src/lib/algorithms/__tests__/level.test.ts
import { describe, it, expect } from 'vitest';
import { calculateLevel } from '../level';

describe('calculateLevel Algorithm', () => {
  it('places 0 XP at Level 1 with 0% progress', () => {
    const res = calculateLevel(0);
    expect(res.level).toBe(1);
    expect(res.progressPercentage).toBe(0);
  });

  it('places 50 XP at Level 1 with 50% progress', () => {
    const res = calculateLevel(50);
    expect(res.level).toBe(1);
    expect(res.progressPercentage).toBe(50);
  });

  it('advances to Level 2 at 100 XP', () => {
    const res = calculateLevel(100);
    expect(res.level).toBe(2);
    expect(res.xpInCurrentLevel).toBe(0);
  });

  it('advances to Level 3 at 250 XP', () => {
    const res = calculateLevel(250);
    expect(res.level).toBe(3);
  });

  it('handles large XP gracefully', () => {
    const res = calculateLevel(50000);
    expect(res.level).toBeGreaterThan(15);
  });
});
