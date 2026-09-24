// src/lib/algorithms/__tests__/prediction.test.ts
import { describe, it, expect } from 'vitest';
import { predictHabitFailureRisk } from '../prediction';
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

  it('suggests EARLY_NUDGE for habit with target_value of 1', () => {
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

    expect(prediction.suggested_action.type).toBe('EARLY_NUDGE');
    expect(prediction.primary_factor).toBeDefined();
  });
});
