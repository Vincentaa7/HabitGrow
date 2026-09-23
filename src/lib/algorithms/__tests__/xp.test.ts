// src/lib/algorithms/__tests__/xp.test.ts
import { describe, it, expect } from 'vitest';
import { calculateXP } from '../xp';

describe('calculateXP Algorithm', () => {
  it('awards 10 XP for EASY habits', () => {
    expect(calculateXP('EASY')).toBe(10);
  });

  it('awards 15 XP for MEDIUM habits', () => {
    expect(calculateXP('MEDIUM')).toBe(15);
  });

  it('awards 20 XP for HARD habits', () => {
    expect(calculateXP('HARD')).toBe(20);
  });

  it('defaults to 10 XP if undefined difficulty', () => {
    // @ts-ignore testing undefined fallback
    expect(calculateXP(undefined)).toBe(10);
  });
});
