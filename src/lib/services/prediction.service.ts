// src/lib/services/prediction.service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { HabitRiskPrediction } from '@/types';
import { Habit, HabitSchedule } from '@/types/database';
import {
  predictHabitFailureRisk,
  isHabitEligibleForPrediction,
  HabitCompletionRecord,
} from '@/lib/algorithms/prediction';
import { isHabitScheduledOnDate, toDateString } from '@/lib/algorithms/schedule';

export class PredictionService {
  /**
   * Evaluates churn and failure risk for all uncompleted habits scheduled today.
   * Returns list of at-risk habits (failure_probability >= 50%, Vi >= 0.50) sorted by risk descending.
   */
  static async getAtRiskHabitsToday(
    supabase: SupabaseClient,
    userId: string,
    evalDate: Date = new Date(),
    timezone: string = 'Asia/Jakarta'
  ): Promise<HabitRiskPrediction[]> {
    const today = new Date(evalDate);
    today.setHours(0, 0, 0, 0);
    const todayStr = toDateString(today);

    // 1. Fetch active habits (with schedules) and past 15 days completions (14-day SAW window + 1-day TZ margin) concurrently in 1 round-trip
    const lookbackStart = new Date(today);
    lookbackStart.setDate(lookbackStart.getDate() - 15);
    const lookbackStartStr = toDateString(lookbackStart);

    const [{ data: habits, error: habitsError }, { data: completionsData }] = await Promise.all([
      supabase
        .from('habits')
        .select('*, habit_schedules(*)')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('is_archived', false),
      supabase
        .from('habit_completions')
        .select('habit_id, date, completed_at, value')
        .eq('user_id', userId)
        .gte('date', lookbackStartStr),
    ]);

    if (habitsError || !habits || habits.length === 0) {
      return [];
    }

    const schedulesByHabit = new Map<string, HabitSchedule[]>();
    for (const h of habits as Array<Habit & { habit_schedules?: HabitSchedule[] }>) {
      schedulesByHabit.set(h.id, h.habit_schedules || []);
    }

    const completionsByHabit = new Map<string, HabitCompletionRecord[]>();
    const completedTodayHabitIds = new Set<string>();

    (completionsData || []).forEach((c) => {
      const list = completionsByHabit.get(c.habit_id) || [];
      list.push(c as HabitCompletionRecord);
      completionsByHabit.set(c.habit_id, list);

      if (c.date === todayStr) {
        completedTodayHabitIds.add(c.habit_id);
      }
    });

    // 4. Calculate total daily workload difficulty points
    const difficultyPointsMap: Record<string, number> = {
      EASY: 1,
      MEDIUM: 2,
      HARD: 3,
    };

    let totalDifficultyPointsToday = 0;
    const uncompletedScheduledHabits: Habit[] = [];

    for (const h of habits as Habit[]) {
      const isCompleted = completedTodayHabitIds.has(h.id);
      const hSchedules = schedulesByHabit.get(h.id) || [];

      // Check if scheduled today (strictly respects start_date, end_date, is_active, is_archived, and frequency)
      const isScheduled = isHabitScheduledOnDate(h, hSchedules, today);

      if (isScheduled) {
        totalDifficultyPointsToday += difficultyPointsMap[h.difficulty] || 2;
        if (!isCompleted) {
          uncompletedScheduledHabits.push(h);
        }
      }
    }

    if (uncompletedScheduledHabits.length === 0) {
      return [];
    }

    // 5. Run prediction for each uncompleted habit
    const atRiskHabits: HabitRiskPrediction[] = [];

    for (const habit of uncompletedScheduledHabits) {
      // 2-Week (14-Day) Cold Start Guard:
      // Predictive risk nudges only activate after a habit has been tracked for at least 14 days (2 weeks).
      // Brand new accounts and freshly created habits are in their onboarding baseline phase to capture
      // 2 full calendar cycles and eliminate small sample noise.
      if (!isHabitEligibleForPrediction(habit, today, timezone)) {
        continue;
      }

      const hCompletions = completionsByHabit.get(habit.id) || [];
      const hSchedules = schedulesByHabit.get(habit.id) || [];

      const prediction = predictHabitFailureRisk({
        habit,
        schedules: hSchedules,
        completions: hCompletions,
        evaluationDate: today,
        timezone,
        totalScheduledToday: habits.length,
        totalDifficultyPointsToday,
      });

      // Filter: only include if failure risk is at least 50% (Vi >= 0.50)
      if (prediction.failure_probability >= 50) {
        atRiskHabits.push(prediction);
      }
    }

    // Sort by highest risk first
    atRiskHabits.sort((a, b) => b.failure_probability - a.failure_probability);

    return atRiskHabits;
  }
}
