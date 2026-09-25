// src/lib/services/consistency.service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { calculateHabitConsistency, calculateOverallConsistency } from '../algorithms/consistency';
import { isHabitScheduledOnDate, toDateString, parseDateString } from '../algorithms/schedule';
import { calculateTreeHealth, calculateTreeStage } from '../algorithms/tree';
import { Habit, HabitSchedule } from '@/types/database';

export class ConsistencyService {
  /**
   * Recalculates and updates the user's overall consistency score and tree state.
   * Single source of truth per PRD Section 26 & 28.
   */
  static async recalculateUserConsistencyAndTree(
    supabase: SupabaseClient,
    userId: string,
    evalDate: Date = new Date()
  ): Promise<{ consistencyScore: number; treeStage: string; health: number }> {
    // 1. Fetch user's active, non-archived habits and schedules
    const { data: habitsData, error: habitsError } = await supabase
      .from('habits')
      .select('id, frequency_type, start_date, end_date, is_active, is_archived, habit_schedules(*)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_archived', false);

    if (habitsError || !habitsData || habitsData.length === 0) {
      // No active habits -> default 0%
      await supabase.from('user_trees').upsert({
        user_id: userId,
        stage: 'Seed',
        health: 100,
        consistency_score: 0.00,
        updated_at: new Date().toISOString(),
      });
      return { consistencyScore: 0, treeStage: 'Seed', health: 100 };
    }

    // 2. Fetch all completions for the user
    const { data: completionsData } = await supabase
      .from('habit_completions')
      .select('habit_id, date')
      .eq('user_id', userId);

    const completionsByHabit = new Map<string, Set<string>>();
    (completionsData || []).forEach((c) => {
      if (!completionsByHabit.has(c.habit_id)) {
        completionsByHabit.set(c.habit_id, new Set<string>());
      }
      completionsByHabit.get(c.habit_id)!.add(c.date);
    });

    // 3. Evaluate each habit over its active lifespan up to today (or last 30 days window)
    const today = new Date(evalDate);
    today.setHours(0, 0, 0, 0);

    const habitStats: Array<{ scheduledCount: number; completedCount: number }> = [];

    for (const habitItem of habitsData) {
      const habit = habitItem as unknown as Habit;
      const schedules = (habitItem.habit_schedules || []) as unknown as HabitSchedule[];
      const completedSet = completionsByHabit.get(habit.id) || new Set<string>();

      const startDate = parseDateString(habit.start_date);
      startDate.setHours(0, 0, 0, 0);

      let scheduledCount = 0;
      let completedCount = 0;

      const cur = new Date(startDate);
      while (cur <= today) {
        if (isHabitScheduledOnDate(habit, schedules, cur)) {
          scheduledCount += 1;
          const curStr = toDateString(cur);
          if (completedSet.has(curStr)) {
            completedCount += 1;
          }
        }
        cur.setDate(cur.getDate() + 1);
      }

      habitStats.push({ scheduledCount, completedCount });
    }

    // 4. Calculate overall consistency
    const overallConsistency = calculateOverallConsistency(habitStats);
    const treeStage = calculateTreeStage(overallConsistency);
    const health = calculateTreeHealth(overallConsistency);

    // 5. Update user_trees
    await supabase.from('user_trees').upsert({
      user_id: userId,
      stage: treeStage,
      health,
      consistency_score: overallConsistency,
      updated_at: new Date().toISOString(),
    });

    return { consistencyScore: overallConsistency, treeStage, health };
  }
}
