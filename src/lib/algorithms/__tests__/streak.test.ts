import { describe, it, expect } from 'vitest';
import { calculateGlobalDailyStreak } from '../streak';

describe('calculateGlobalDailyStreak (Non-Zero Day Principle)', () => {
  it('returns 0 streak and null lastActiveDate for empty completion history', () => {
    const activeDates = new Set<string>();
    const evalDate = new Date('2026-09-23T12:00:00');
    const res = calculateGlobalDailyStreak(activeDates, evalDate);

    expect(res.currentStreak).toBe(0);
    expect(res.longestStreak).toBe(0);
    expect(res.lastActiveDate).toBeNull();
  });

  it('yields 1 day streak when at least 1 habit is completed today', () => {
    const activeDates = new Set(['2026-09-23']);
    const evalDate = new Date('2026-09-23T12:00:00');
    const res = calculateGlobalDailyStreak(activeDates, evalDate);

    expect(res.currentStreak).toBe(1);
    expect(res.longestStreak).toBe(1);
    expect(res.lastActiveDate).toBe('2026-09-23');
  });

  it('keeps streak alive across consecutive days as long as at least 1 habit was completed each day', () => {
    // Completed at least one habit on Sep 21, Sep 22, Sep 23
    const activeDates = new Set(['2026-09-21', '2026-09-22', '2026-09-23']);
    const evalDate = new Date('2026-09-23T18:00:00');
    const res = calculateGlobalDailyStreak(activeDates, evalDate);

    expect(res.currentStreak).toBe(3);
    expect(res.longestStreak).toBe(3);
    expect(res.lastActiveDate).toBe('2026-09-23');
  });

  it('preserves active streak if today has 0 completions yet (in progress / grace period)', () => {
    // Completed yesterday (Sep 22) and 2 days ago (Sep 21). Today is Sep 23 morning.
    const activeDates = new Set(['2026-09-21', '2026-09-22']);
    const evalDate = new Date('2026-09-23T08:00:00');
    const res = calculateGlobalDailyStreak(activeDates, evalDate);

    expect(res.currentStreak).toBe(2);
    expect(res.longestStreak).toBe(2);
    expect(res.lastActiveDate).toBe('2026-09-22');
  });

  it('resets global streak to 0 if yesterday had zero completions', () => {
    // Completed Sep 20, Sep 21. Sep 22 had 0 completions. Today is Sep 23.
    const activeDates = new Set(['2026-09-20', '2026-09-21']);
    const evalDate = new Date('2026-09-23T12:00:00');
    const res = calculateGlobalDailyStreak(activeDates, evalDate);

    expect(res.currentStreak).toBe(0);
    expect(res.longestStreak).toBe(2);
  });

  it('calculates longest consecutive days streak accurately across gaps and multiple streaks', () => {
    // Historical streak: Sep 1 to Sep 5 (5 days)
    // Gap: Sep 6 to Sep 9 (0 completions)
    // Recent streak: Sep 10 to Sep 12 (3 days)
    const activeDates = new Set([
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
      '2026-09-05',
      '2026-09-10',
      '2026-09-11',
      '2026-09-12',
    ]);
    const evalDate = new Date('2026-09-12T20:00:00');
    const res = calculateGlobalDailyStreak(activeDates, evalDate);

    expect(res.currentStreak).toBe(3);
    expect(res.longestStreak).toBe(5);
    expect(res.lastActiveDate).toBe('2026-09-12');
  });

  it('treats single completion per day identically to multiple completions on the same day', () => {
    // In Non-Zero Day, sets of dates naturally deduplicate multiple completions per day
    const activeDates = new Set(['2026-09-01', '2026-09-02']);
    const evalDate = new Date('2026-09-02T15:00:00');
    const res = calculateGlobalDailyStreak(activeDates, evalDate);

    expect(res.currentStreak).toBe(2);
  });
});
