// src/lib/services/streak.service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { calculateStreak, StreakResult } from '@/lib/algorithms/streak';
import { Habit, HabitSchedule } from '@/types/database';

export class StreakService {
  /**
   * Recalculates streak for a specific habit and updates user_streaks with conflict resolution.
   */
  static async recalculateHabitStreak(
    supabase: SupabaseClient,
    userId: string,
    habitId: string,
    evalDate: Date = new Date()
  ): Promise<StreakResult> {
    const { data: habitData, error } = await supabase
      .from('habits')
      .select('frequency_type, start_date, end_date, is_active, is_archived, habit_schedules(*)')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single();

    if (error || !habitData) {
      return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
    }

    const schedules = (habitData.habit_schedules || []) as unknown as HabitSchedule[];
    const { data: completions } = await supabase
      .from('habit_completions')
      .select('date')
      .eq('habit_id', habitId)
      .eq('user_id', userId);

    const completedDatesSet = new Set((completions || []).map((c) => c.date));
    const streakResult = calculateStreak(habitData, schedules, completedDatesSet, evalDate);

    const { error: upsertError } = await supabase.from('user_streaks').upsert(
      {
        user_id: userId,
        habit_id: habitId,
        current_streak: streakResult.currentStreak,
        longest_streak: streakResult.longestStreak,
        last_completed_date: streakResult.lastCompletedDate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,habit_id' }
    );

    if (upsertError) {
      console.error('StreakService upsert error:', upsertError);
    }

    return streakResult;
  }

  /**
   * Recalculates all streaks for a user (self-healing / sync mechanism).
   */
  static async recalculateAllUserStreaks(
    supabase: SupabaseClient,
    userId: string,
    evalDate: Date = new Date()
  ): Promise<{ maxCurrentStreak: number; maxLongestStreak: number }> {
    const { data: habits } = await supabase
      .from('habits')
      .select('id, frequency_type, start_date, end_date, is_active, is_archived, habit_schedules(*)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_archived', false);

    let maxCurrentStreak = 0;
    let maxLongestStreak = 0;

    if (!habits || habits.length === 0) {
      return { maxCurrentStreak: 0, maxLongestStreak: 0 };
    }

    const { data: allCompletions } = await supabase
      .from('habit_completions')
      .select('habit_id, date')
      .eq('user_id', userId);

    const completionsByHabit = new Map<string, Set<string>>();
    (allCompletions || []).forEach((c) => {
      if (!completionsByHabit.has(c.habit_id)) {
        completionsByHabit.set(c.habit_id, new Set());
      }
      completionsByHabit.get(c.habit_id)!.add(c.date);
    });

    const upsertRows = [];
    for (const h of habits) {
      const habitObj = h as unknown as Habit;
      const schedules = (h.habit_schedules || []) as unknown as HabitSchedule[];
      const completedSet = completionsByHabit.get(h.id) || new Set<string>();
      const streakResult = calculateStreak(habitObj, schedules, completedSet, evalDate);

      if (streakResult.currentStreak > maxCurrentStreak) {
        maxCurrentStreak = streakResult.currentStreak;
      }
      if (streakResult.longestStreak > maxLongestStreak) {
        maxLongestStreak = streakResult.longestStreak;
      }

      upsertRows.push({
        user_id: userId,
        habit_id: h.id,
        current_streak: streakResult.currentStreak,
        longest_streak: streakResult.longestStreak,
        last_completed_date: streakResult.lastCompletedDate,
        updated_at: new Date().toISOString(),
      });
    }

    if (upsertRows.length > 0) {
      await supabase.from('user_streaks').upsert(upsertRows, { onConflict: 'user_id,habit_id' });
    }

    return { maxCurrentStreak, maxLongestStreak };
  }
}
