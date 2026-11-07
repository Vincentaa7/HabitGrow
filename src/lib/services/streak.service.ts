// src/lib/services/streak.service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import {
  calculateGlobalDailyStreak,
  GlobalStreakResult,
} from '@/lib/algorithms/streak';

export class StreakService {
  /**
   * Synchronizes the calculated Global Streak to the `user_streaks` table.
   */
  static async syncGlobalStreakToDb(
    supabase: SupabaseClient,
    userId: string,
    result: GlobalStreakResult
  ): Promise<void> {
    try {
      const { data: existing } = await supabase
        .from('user_streaks')
        .select('id')
        .eq('user_id', userId)
        .is('habit_id', null)
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from('user_streaks')
          .update({
            current_streak: result.currentStreak,
            longest_streak: result.longestStreak,
            last_completed_date: result.lastActiveDate,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('user_streaks').insert({
          user_id: userId,
          habit_id: null,
          current_streak: result.currentStreak,
          longest_streak: result.longestStreak,
          last_completed_date: result.lastActiveDate,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Sync user_streaks error:', e);
    }
  }

  /**
   * Calculates user's Global Daily Streak based on the "Non-Zero Day" principle:
   * As long as AT LEAST ONE habit is completed on each consecutive day, the global streak stays alive.
   * Also synchronizes the record to the `user_streaks` table (1:1 with auth.users).
   */
  static async calculateUserGlobalStreak(
    supabase: SupabaseClient,
    userId: string,
    evalDate: Date = new Date(),
    prefetchedCompletions?: Array<{ date: string }>
  ): Promise<GlobalStreakResult> {
    let completions = prefetchedCompletions;
    if (!completions) {
      const { data } = await supabase
        .from('habit_completions')
        .select('date')
        .eq('user_id', userId);
      completions = data || [];
    }

    const activeDatesSet = new Set<string>(completions.map((c) => c.date));
    const result = calculateGlobalDailyStreak(activeDatesSet, evalDate);

    // Non-blocking background sync to user_streaks table
    void this.syncGlobalStreakToDb(supabase, userId, result);

    return result;
  }
}
