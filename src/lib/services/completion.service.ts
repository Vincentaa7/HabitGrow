// src/lib/services/completion.service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { calculateXP } from '../algorithms/xp';
import { calculateLevel } from '../algorithms/level';
import { calculateStreak } from '../algorithms/streak';
import { isHabitScheduledOnDate, toDateString, parseDateString } from '../algorithms/schedule';
import { ConsistencyService } from './consistency.service';
import { AchievementService } from './achievement.service';
import { StreakService } from './streak.service';
import { Habit, HabitSchedule } from '@/types/database';

export interface CompletionResult {
  completionId: string;
  xpEarned: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  consistencyScore: number;
  treeStage: string;
  treeHealth: number;
  newAchievements: Array<{ id: string; name: string; xp_reward: number }>;
}

export class CompletionService {
  /**
   * Completes a habit for a given date. Idempotent and atomic.
   * PRD Section 16, 17, 65, 80.
   */
  static async completeHabit(
    supabase: SupabaseClient,
    userId: string,
    habitId: string,
    dateStr?: string,
    note?: string
  ): Promise<CompletionResult> {
    const todayStr = dateStr || toDateString(new Date());

    // 1. Fetch habit and its schedules
    const { data: habitData, error: habitError } = await supabase
      .from('habits')
      .select('*, habit_schedules(*)')
      .eq('id', habitId)
      .eq('user_id', userId)
      .single();

    if (habitError || !habitData) {
      throw new Error('Kebiasaan tidak ditemukan atau tidak memiliki akses.');
    }

    const habit = habitData as unknown as Habit;
    const schedules = (habitData.habit_schedules || []) as unknown as HabitSchedule[];

    if (!habit.is_active || habit.is_archived) {
      throw new Error('Kebiasaan sudah diarsipkan atau tidak aktif.');
    }

    // 2. Validate schedule
    const isScheduled = isHabitScheduledOnDate(habit, schedules, todayStr);
    if (!isScheduled) {
      throw new Error('Kebiasaan tidak dijadwalkan untuk tanggal ini.');
    }

    // 3. Idempotency Check (PRD Section 16 & 17)
    const { data: existingCompletion } = await supabase
      .from('habit_completions')
      .select('id, xp_earned')
      .eq('habit_id', habitId)
      .eq('date', todayStr)
      .maybeSingle();

    if (existingCompletion) {
      throw new Error('Kebiasaan sudah diselesaikan untuk hari ini.');
    }

    // 4. Calculate XP strictly on the server
    const xpReward = calculateXP(habit.difficulty);

    // 5. Insert completion record
    const { data: insertedCompletion, error: insertError } = await supabase
      .from('habit_completions')
      .insert({
        habit_id: habitId,
        user_id: userId,
        date: todayStr,
        completed_at: new Date().toISOString(),
        value: 1,
        note: note || null,
        xp_earned: xpReward,
      })
      .select('id')
      .single();

    if (insertError || !insertedCompletion) {
      throw new Error(`Gagal menyimpan completion: ${insertError?.message}`);
    }

    // 6. Record XP Transaction
    await supabase.from('xp_transactions').insert({
      user_id: userId,
      source_type: 'habit_completion',
      source_id: insertedCompletion.id,
      amount: xpReward,
      description: `Menyelesaikan habit: ${habit.name}`,
    });

    // 7. Update User Total XP & Level
    const { data: currentLevelRecord } = await supabase
      .from('user_levels')
      .select('total_xp')
      .eq('user_id', userId)
      .maybeSingle();

    const newTotalXp = (currentLevelRecord?.total_xp ?? 0) + xpReward;
    const levelInfo = calculateLevel(newTotalXp);

    await supabase.from('user_levels').upsert({
      user_id: userId,
      level: levelInfo.level,
      total_xp: newTotalXp,
      updated_at: new Date().toISOString(),
    });

    // 8. Recalculate Streak
    const streakResult = await StreakService.recalculateHabitStreak(
      supabase,
      userId,
      habitId,
      new Date(todayStr + 'T12:00:00')
    );

    // 9. Recalculate Consistency & Tree Stage
    const evalDate = parseDateString(todayStr);
    const { consistencyScore, treeStage, health } = await ConsistencyService.recalculateUserConsistencyAndTree(
      supabase,
      userId,
      evalDate
    );

    // 10. Check & Unlock Achievements
    const newAchievements = await AchievementService.evaluateAchievements(
      supabase,
      userId,
      streakResult.currentStreak,
      consistencyScore,
      treeStage
    );

    // 11. Write Activity Log
    await supabase.from('activity_logs').insert({
      user_id: userId,
      activity_type: 'HABIT_COMPLETED',
      entity_type: 'habit',
      entity_id: habitId,
      metadata: {
        habit_name: habit.name,
        xp_earned: xpReward,
        date: todayStr,
        streak: streakResult.currentStreak,
      },
    });

    return {
      completionId: insertedCompletion.id,
      xpEarned: xpReward,
      currentStreak: streakResult.currentStreak,
      longestStreak: streakResult.longestStreak,
      totalXp: newTotalXp,
      level: levelInfo.level,
      consistencyScore,
      treeStage,
      treeHealth: health,
      newAchievements,
    };
  }

  /**
   * Undoes a completion if created today. Adjusts XP and stats cleanly.
   */
  static async uncompleteHabit(
    supabase: SupabaseClient,
    userId: string,
    completionId: string
  ): Promise<void> {
    // 1. Fetch completion
    const { data: completion, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('id', completionId)
      .eq('user_id', userId)
      .single();

    if (error || !completion) {
      throw new Error('Catatan completion tidak ditemukan.');
    }

    // 2. Delete completion
    await supabase.from('habit_completions').delete().eq('id', completionId);

    // 3. Reverse XP transaction
    await supabase.from('xp_transactions').insert({
      user_id: userId,
      source_type: 'habit_uncomplete',
      source_id: completion.habit_id,
      amount: -completion.xp_earned,
      description: 'Pembatalan penyelesaian habit',
    });

    // 4. Update Level
    const { data: levelRecord } = await supabase
      .from('user_levels')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    const newXp = Math.max(0, (levelRecord?.total_xp ?? 0) - completion.xp_earned);
    const { level } = calculateLevel(newXp);

    await supabase.from('user_levels').upsert({
      user_id: userId,
      level,
      total_xp: newXp,
      updated_at: new Date().toISOString(),
    });

    // 5. Recalculate Consistency & Tree
    const evalDate = parseDateString(completion.date);
    await ConsistencyService.recalculateUserConsistencyAndTree(supabase, userId, evalDate);

    // 6. Recalculate Streak for this habit
    await StreakService.recalculateHabitStreak(supabase, userId, completion.habit_id, evalDate);
  }
}
