// src/lib/algorithms/__tests__/prediction.test.ts
import { describe, it, expect } from 'vitest';
import { predictHabitFailureRisk, isHabitEligibleForPrediction } from '../prediction';
import { Habit, HabitSchedule } from '@/types/database';
import { toDateString } from '../schedule';

describe('predictHabitFailureRisk', () => {
  const baseHabit: Habit = {
    id: 'habit-1',
    user_id: 'user-1',
    category_id: null,
    name: 'Push-up 20x',
    description: null,
    icon: 'dumbbell',
    color: '#10b981',
    difficulty: 'MEDIUM',
    frequency_type: 'DAILY',
    target_value: 20,
    target_unit: 'kali',
    start_date: '2026-08-01',
    end_date: null,
    reminder_time: '20:00:00',
    is_active: true,
    is_archived: false,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
  };

  const schedules: HabitSchedule[] = [];

  it('predicts low failure probability for a well-maintained, consistent habit', () => {
    // 21 days of perfect completions done in the afternoon
    const evalDate = new Date(2026, 8, 24); // Sept 24, 2026
    const completions = [];
    for (let i = 1; i <= 21; i++) {
      const d = new Date(evalDate);
      d.setDate(d.getDate() - i);
      const dateStr = toDateString(d);
      completions.push({
        habit_id: 'habit-1',
        date: dateStr,
        completed_at: `${dateStr}T14:30:00Z`,
        value: 20,
      });
    }

    const prediction = predictHabitFailureRisk({
      habit: baseHabit,
      schedules,
      completions,
      evaluationDate: evalDate,
      totalScheduledToday: 3,
      totalDifficultyPointsToday: 5,
    });

    expect(prediction.failure_probability).toBeLessThan(35);
    expect(prediction.risk_level).toBe('MODERATE');
  });

  it('predicts high failure probability when recent 14-day miss rate is high and done late at night', () => {
    const evalDate = new Date(2026, 8, 24); // Sept 24, 2026
    // Only 2 completions in last 14 days, and both done at 23:30 (near midnight)
    const completions = [
      {
        habit_id: 'habit-1',
        date: '2026-09-20',
        completed_at: '2026-09-20T23:30:00Z',
        value: 20,
      },
      {
        habit_id: 'habit-1',
        date: '2026-09-15',
        completed_at: '2026-09-15T23:45:00Z',
        value: 20,
      },
    ];

    const prediction = predictHabitFailureRisk({
      habit: baseHabit,
      schedules,
      completions,
      evaluationDate: evalDate,
      totalScheduledToday: 7,
      totalDifficultyPointsToday: 14, // high workload
    });

    expect(prediction.failure_probability).toBeGreaterThanOrEqual(65);
    expect(prediction.suggested_action.type).toBe('LOWER_TARGET');
    expect(prediction.suggested_action.suggested_target_value).toBe(10);
  });

  it('suggests CHECKLIST_2MIN (2-Minute Rule) for habit with target_value of 1', () => {
    const evalDate = new Date(2026, 8, 24);
    const habitSingle: Habit = {
      ...baseHabit,
      id: 'habit-reading',
      name: 'Membaca Buku',
      target_value: 1,
      target_unit: 'sesi',
      created_at: '2026-09-22T00:00:00Z', // brand new (2 days old)
    };

    const prediction = predictHabitFailureRisk({
      habit: habitSingle,
      schedules,
      completions: [],
      evaluationDate: evalDate,
      totalScheduledToday: 8,
      totalDifficultyPointsToday: 15,
    });

    expect(prediction.suggested_action.type).toBe('CHECKLIST_2MIN');
    expect(prediction.suggested_action.message).toContain('prinsip 2 menit');
    expect(prediction.primary_factor).toBeDefined();
  });

  it('converts 1 jam to 30 menit for LOWER_TARGET action', () => {
    const evalDate = new Date(2026, 8, 24);
    const habitHour: Habit = {
      ...baseHabit,
      id: 'habit-study',
      name: 'Belajar Koding',
      target_value: 1,
      target_unit: 'jam',
      created_at: '2026-08-01T00:00:00Z',
    };

    const prediction = predictHabitFailureRisk({
      habit: habitHour,
      schedules,
      completions: [],
      evaluationDate: evalDate,
      totalScheduledToday: 6,
      totalDifficultyPointsToday: 12,
    });

    expect(prediction.suggested_action.type).toBe('LOWER_TARGET');
    expect(prediction.suggested_action.suggested_target_value).toBe(30);
    expect(prediction.suggested_action.suggested_target_unit).toBe('menit');
    expect(prediction.suggested_action.message).toContain('30 menit');
  });

  it('converts 1 liter to 500 ml for LOWER_TARGET action', () => {
    const evalDate = new Date(2026, 8, 24);
    const habitWater: Habit = {
      ...baseHabit,
      id: 'habit-water',
      name: 'Minum Air',
      target_value: 1,
      target_unit: 'liter',
      created_at: '2026-08-01T00:00:00Z',
    };

    const prediction = predictHabitFailureRisk({
      habit: habitWater,
      schedules,
      completions: [],
      evaluationDate: evalDate,
      totalScheduledToday: 5,
      totalDifficultyPointsToday: 10,
    });

    expect(prediction.suggested_action.type).toBe('LOWER_TARGET');
    expect(prediction.suggested_action.suggested_target_value).toBe(500);
    expect(prediction.suggested_action.suggested_target_unit).toBe('ml');
    expect(prediction.suggested_action.message).toContain('500 ml');
  });
});

describe('isHabitEligibleForPrediction', () => {
  const evalDate = new Date(2026, 8, 25); // Sept 25, 2026

  it('returns false for habits created on the same day (0 days old)', () => {
    const habit = {
      created_at: '2026-09-25T10:00:00Z',
      start_date: '2026-09-25',
    };
    expect(isHabitEligibleForPrediction(habit, evalDate)).toBe(false);
  });

  it('returns false for habits younger than 14 days (e.g. 3, 7, and 13 days old)', () => {
    const habit3Days = {
      created_at: '2026-09-22T08:00:00Z',
      start_date: '2026-09-22',
    };
    const habit7Days = {
      created_at: '2026-09-18T14:00:00Z',
      start_date: '2026-09-18',
    };
    const habit13Days = {
      created_at: '2026-09-12T14:00:00Z',
      start_date: '2026-09-12',
    };
    expect(isHabitEligibleForPrediction(habit3Days, evalDate)).toBe(false);
    expect(isHabitEligibleForPrediction(habit7Days, evalDate)).toBe(false);
    expect(isHabitEligibleForPrediction(habit13Days, evalDate)).toBe(false);
  });

  it('returns true for habits created exactly 14 days ago', () => {
    const habit14Days = {
      created_at: '2026-09-11T00:00:00Z',
      start_date: '2026-09-11',
    };
    expect(isHabitEligibleForPrediction(habit14Days, evalDate)).toBe(true);
  });

  it('returns true for mature habits (> 14 days old)', () => {
    const habitMature = {
      created_at: '2026-08-01T00:00:00Z',
      start_date: '2026-08-01',
    };
    expect(isHabitEligibleForPrediction(habitMature, evalDate)).toBe(true);
  });

  it('correctly uses start_date fallback when created_at is null', () => {
    const habitNoCreatedAt = {
      created_at: null as any,
      start_date: '2026-09-20', // 5 days old (< 14 days)
    };
    expect(isHabitEligibleForPrediction(habitNoCreatedAt, evalDate)).toBe(false);

    const habitOldStartDate = {
      created_at: null as any,
      start_date: '2026-09-01', // 24 days old (>= 14 days)
    };
    expect(isHabitEligibleForPrediction(habitOldStartDate, evalDate)).toBe(true);
  });
});

