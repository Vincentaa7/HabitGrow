import { describe, it, expect } from 'vitest';
import { calculateStreak, detectBrokenStreak } from '../streak';
import { Habit, HabitSchedule } from '@/types/database';

describe('calculateStreak Algorithm', () => {
  const baseHabit: Habit = {
    id: 'habit-1',
    user_id: 'user-1',
    category_id: null,
    name: 'Gym',
    description: null,
    icon: 'dumbbell',
    color: '#10b981',
    difficulty: 'MEDIUM',
    frequency_type: 'DAILY',
    target_value: 1,
    target_unit: 'times',
    start_date: '2026-09-01',
    end_date: null,
    reminder_time: null,
    is_active: true,
    is_archived: false,
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
  };

  it('calculates 3-day consecutive streak correctly for daily habit', () => {
    const completed = new Set(['2026-09-01', '2026-09-02', '2026-09-03']);
    const evalDate = new Date('2026-09-03T12:00:00');
    const res = calculateStreak(baseHabit, [], completed, evalDate);

    expect(res.currentStreak).toBe(3);
    expect(res.longestStreak).toBe(3);
    expect(res.lastCompletedDate).toBe('2026-09-03');
  });

  it('preserves current streak if today is scheduled and not yet completed', () => {
    // Yesterday completed, today is 2026-09-04 and not completed yet
    const completed = new Set(['2026-09-01', '2026-09-02', '2026-09-03']);
    const evalDate = new Date('2026-09-04T10:00:00');
    const res = calculateStreak(baseHabit, [], completed, evalDate);

    expect(res.currentStreak).toBe(3);
  });

  it('resets streak if a previous scheduled day was missed', () => {
    // Completed Sep 1, 2. Missed Sep 3. Today is Sep 4.
    const completed = new Set(['2026-09-01', '2026-09-02']);
    const evalDate = new Date('2026-09-04T12:00:00');
    const res = calculateStreak(baseHabit, [], completed, evalDate);

    expect(res.currentStreak).toBe(0);
    expect(res.longestStreak).toBe(2);
  });

  it('non-scheduled days DO NOT break streak (Mon/Wed/Fri schedule)', () => {
    // 2026-09-07 is Monday (1), 2026-09-08 is Tuesday (2), 2026-09-09 is Wednesday (3)
    const mwfHabit: Habit = {
      ...baseHabit,
      frequency_type: 'SELECTED_DAYS',
      start_date: '2026-09-07',
    };
    const mwfSchedules: HabitSchedule[] = [
      { id: 's1', habit_id: 'habit-1', day_of_week: 1, specific_date: null, target_occurrences: null, created_at: '' }, // Mon
      { id: 's2', habit_id: 'habit-1', day_of_week: 3, specific_date: null, target_occurrences: null, created_at: '' }, // Wed
      { id: 's3', habit_id: 'habit-1', day_of_week: 5, specific_date: null, target_occurrences: null, created_at: '' }, // Fri
    ];

    // User completed Monday (Sep 7) and Wednesday (Sep 9). Tuesday (Sep 8) is non-scheduled!
    const completed = new Set(['2026-09-07', '2026-09-09']);
    const evalDate = new Date('2026-09-09T18:00:00');

    const res = calculateStreak(mwfHabit, mwfSchedules, completed, evalDate);

    // Tuesday did NOT break the streak; current streak is 2
    expect(res.currentStreak).toBe(2);
    expect(res.longestStreak).toBe(2);
  });

  it('immediately yields streak of 1 on the first day when completed today', () => {
    const completed = new Set(['2026-09-01']);
    const evalDate = new Date('2026-09-01T12:00:00');
    const res = calculateStreak(baseHabit, [], completed, evalDate);

    expect(res.currentStreak).toBe(1);
    expect(res.longestStreak).toBe(1);
    expect(res.lastCompletedDate).toBe('2026-09-01');
  });

  describe('detectBrokenStreak', () => {
    it('detects when yesterday was missed after having an active streak', () => {
      // Completed Sep 1, Sep 2 (streak 2). Missed Sep 3. Evaluated on Sep 4.
      const completed = new Set(['2026-09-01', '2026-09-02']);
      const evalDate = new Date('2026-09-04T10:00:00');
      const broken = detectBrokenStreak(baseHabit, [], completed, evalDate);

      expect(broken.isBroken).toBe(true);
      expect(broken.lostStreak).toBe(2);
      expect(broken.missedDate).toBe('2026-09-03');
    });

    it('does NOT flag broken if yesterday was completed', () => {
      // Completed Sep 1, Sep 2, Sep 3. Evaluated on Sep 4.
      const completed = new Set(['2026-09-01', '2026-09-02', '2026-09-03']);
      const evalDate = new Date('2026-09-04T10:00:00');
      const broken = detectBrokenStreak(baseHabit, [], completed, evalDate);

      expect(broken.isBroken).toBe(false);
      expect(broken.lostStreak).toBe(0);
    });

    it('does NOT flag broken if habit never had an active streak previously', () => {
      // Never completed anything. Evaluated on Sep 4.
      const completed = new Set<string>();
      const evalDate = new Date('2026-09-04T10:00:00');
      const broken = detectBrokenStreak(baseHabit, [], completed, evalDate);

      expect(broken.isBroken).toBe(false);
    });
  });
});
