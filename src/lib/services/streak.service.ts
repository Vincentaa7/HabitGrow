// src/lib/services/streak.service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import {
  calculateGlobalDailyStreak,
  GlobalStreakResult,
} from '@/lib/algorithms/streak';

export class StreakService {
  /**
   * Calculates user's Global Daily Streak based on the "Non-Zero Day" principle:
   * As long as AT LEAST ONE habit is completed on each consecutive day, the global streak stays alive.
   * Also synchronizes the record to the `user_streaks` table (1:1 with auth.users).
   */
  static async calculateUserGlobalStreak(
    supabase: SupabaseClient,
    userId: string,
    evalDate: Date = new Date()
  ): Promise<GlobalStreakResult> {
    const { data: completions } = await supabase
      .from('habit_completions')
      .select('date')
      .eq('user_id', userId);

    const activeDatesSet = new Set<string>((completions || []).map((c) => c.date));
    const result = calculateGlobalDailyStreak(activeDatesSet, evalDate);

    // Synchronize to user_streaks table (1:1 with auth.users, habit_id = null for global streak)
    try {
      await supabase.from('user_streaks').upsert(
        {
          user_id: userId,
          habit_id: null,
          current_streak: result.currentStreak,
          longest_streak: result.longestStreak,
          last_completed_date: result.lastActiveDate,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,habit_id' }
      );
    } catch (e) {
      // Non-blocking sync
      console.warn('Sync user_streaks error:', e);
    }

    return result;
  }
}
