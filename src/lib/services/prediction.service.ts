// src/lib/services/prediction.service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { HabitRiskPrediction } from '@/types';
import { Habit, HabitSchedule } from '@/types/database';
import {
  predictHabitFailureRisk,
  isHabitEligibleForPrediction,
  HabitCompletionRecord,
} from '@/lib/algorithms/prediction';
import { toDateString } from '@/lib/algorithms/schedule';

export class PredictionService {
  /**
   * Evaluates churn and failure risk for all uncompleted habits scheduled today.
   * Returns list of at-risk habits (failure_probability >= 60%) sorted by risk descending.
   */
  static async getAtRiskHabitsToday(
    supabase: SupabaseClient,
    userId: string,
    evalDate: Date = new Date()
  ): Promise<HabitRiskPrediction[]> {
    const today = new Date(evalDate);
    today.setHours(0, 0, 0, 0);
    const todayStr = toDateString(today);

    // 1. Fetch all active, unarchived habits for this user
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_archived', false);

    if (habitsError || !habits || habits.length === 0) {
      return [];
    }

    // 2. Fetch all schedules for these habits
    const habitIds = habits.map((h: Habit) => h.id);
    const { data: schedules } = await supabase
      .from('habit_schedules')
      .select('*')
      .in('habit_id', habitIds);

    const schedulesByHabit = new Map<string, HabitSchedule[]>();
    (schedules || []).forEach((s: HabitSchedule) => {
      const list = schedulesByHabit.get(s.habit_id) || [];
      list.push(s);
      schedulesByHabit.set(s.habit_id, list);
    });

    // 3. Fetch completions in the past 30 days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 35);
    const thirtyDaysAgoStr = toDateString(thirtyDaysAgo);

    const { data: completionsData } = await supabase
      .from('habit_completions')
      .select('habit_id, date, completed_at, value')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgoStr);

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

      // Check if scheduled today
      let isScheduled = false;
      if (h.frequency_type === 'DAILY' || h.frequency_type === 'WEEKLY_TARGET') {
        isScheduled = true;
      } else if (h.frequency_type === 'SELECTED_DAYS') {
        const dow = today.getDay();
        isScheduled = hSchedules.some((s) => s.day_of_week === dow);
      }

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
      if (!isHabitEligibleForPrediction(habit, today)) {
        continue;
      }

      const hCompletions = completionsByHabit.get(habit.id) || [];
      const hSchedules = schedulesByHabit.get(habit.id) || [];

      const prediction = predictHabitFailureRisk({
        habit,
        schedules: hSchedules,
        completions: hCompletions,
        evaluationDate: today,
        totalScheduledToday: habits.length,
        totalDifficultyPointsToday,
      });

      // Filter: only include if failure risk is at least 60%
      if (prediction.failure_probability >= 60) {
        atRiskHabits.push(prediction);
      }
    }

    // Sort by highest risk first
    atRiskHabits.sort((a, b) => b.failure_probability - a.failure_probability);

    return atRiskHabits;
  }
}
