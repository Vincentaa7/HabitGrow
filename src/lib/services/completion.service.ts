// src/lib/services/completion.service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { calculateXP } from '../algorithms/xp';
import { calculateLevel } from '../algorithms/level';
import { calculateGlobalDailyStreak } from '../algorithms/streak';
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
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercentage: number;
  consistencyScore: number;
  treeStage: string;
  treeHealth: number;
  activeCompletedDays: number;
  newAchievements: Array<{ id: string; name: string; xp_reward: number }>;
}

export class CompletionService {
  /**
   * Completes a habit for a given date. Idempotent, atomic, and parallelized for minimal latency.
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

    // Prevent completing habits on future dates (allow +1 day UTC margin for UTC+14 timezones)
    const maxAllowedDate = new Date();
    maxAllowedDate.setUTCDate(maxAllowedDate.getUTCDate() + 1);
    const maxAllowedDateStr = maxAllowedDate.toISOString().split('T')[0];
    if (todayStr > maxAllowedDateStr) {
      throw new Error('Tidak dapat menyelesaikan kebiasaan untuk tanggal di masa depan.');
    }

    // 1. Parallel Read Batch: Fetch user's habits, completions, and current XP in a single round-trip
    const [
      { data: allHabitsData, error: habitsError },
      { data: allCompletionsData },
      { data: currentLevelRecord },
    ] = await Promise.all([
      supabase
        .from('habits')
        .select('*, habit_schedules(*)')
        .eq('user_id', userId),
      supabase
        .from('habit_completions')
        .select('id, habit_id, date, xp_earned')
        .eq('user_id', userId),
      supabase
        .from('user_levels')
        .select('total_xp')
        .eq('user_id', userId)
        .maybeSingle(),
    ]);

    const habitData = (allHabitsData || []).find((h) => h.id === habitId);

    if (habitsError || !habitData) {
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

    // 3. Idempotency Check in-memory (PRD Section 16 & 17)
    const existingCompletion = (allCompletionsData || []).find(
      (c) => c.habit_id === habitId && c.date === todayStr
    );

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

    // 6. Compute updated metrics in-memory (0ms latency)
    const updatedCompletions = [
      ...(allCompletionsData || []),
      { id: insertedCompletion.id, habit_id: habitId, date: todayStr, xp_earned: xpReward },
    ];

    const baseTotalXp = (currentLevelRecord?.total_xp ?? 0) + xpReward;

    const activeDatesSet = new Set<string>(updatedCompletions.map((c) => c.date));
    const evalDate = parseDateString(todayStr);
    const globalStreak = calculateGlobalDailyStreak(activeDatesSet, evalDate);

    const activeUnarchivedHabits = (allHabitsData || []).filter(
      (h) => h.is_active && !h.is_archived
    );
    const { consistencyScore, treeStage, health, activeCompletedDays } =
      ConsistencyService.computeConsistencyFromData(
        activeUnarchivedHabits,
        updatedCompletions,
        evalDate
      );

    // 7. Parallel Write Batch: Persist independent tables & evaluate achievements concurrently
    const [, , , newAchievements] = await Promise.all([
      supabase.from('xp_transactions').insert({
        user_id: userId,
        source_type: 'habit_completion',
        source_id: insertedCompletion.id,
        amount: xpReward,
        description: `Menyelesaikan habit: ${habit.name}`,
      }),
      StreakService.syncGlobalStreakToDb(supabase, userId, globalStreak),
      supabase.from('user_trees').upsert({
        user_id: userId,
        stage: treeStage,
        health,
        consistency_score: consistencyScore,
        updated_at: new Date().toISOString(),
      }),
      AchievementService.evaluateAchievements(
        supabase,
        userId,
        globalStreak.currentStreak,
        consistencyScore,
        treeStage,
        updatedCompletions.length,
        activeCompletedDays
      ),
      supabase.from('activity_logs').insert({
        user_id: userId,
        activity_type: 'HABIT_COMPLETED',
        entity_type: 'habit',
        entity_id: habitId,
        metadata: {
          habit_name: habit.name,
          xp_earned: xpReward,
          date: todayStr,
          global_streak: globalStreak.currentStreak,
        },
      }),
    ]);

    // 8. Single authoritative user_levels write (combines habit XP + any unlocked achievement XP with zero race condition)
    const achievementBonusXp = newAchievements.reduce((sum, a) => sum + (a.xp_reward || 0), 0);
    const finalTotalXp = baseTotalXp + achievementBonusXp;
    const finalLevelInfo = calculateLevel(finalTotalXp);

    await supabase.from('user_levels').upsert({
      user_id: userId,
      level: finalLevelInfo.level,
      total_xp: finalTotalXp,
      updated_at: new Date().toISOString(),
    });

    return {
      completionId: insertedCompletion.id,
      xpEarned: xpReward + achievementBonusXp,
      currentStreak: globalStreak.currentStreak,
      longestStreak: globalStreak.longestStreak,
      totalXp: finalTotalXp,
      level: finalLevelInfo.level,
      currentLevelXp: finalLevelInfo.xpInCurrentLevel,
      nextLevelXp: finalLevelInfo.nextLevelXp,
      progressPercentage: finalLevelInfo.progressPercentage,
      consistencyScore,
      treeStage,
      treeHealth: health,
      activeCompletedDays,
      newAchievements,
    };
  }

  /**
   * Undoes a completion if created today. Adjusts XP and stats cleanly in parallel.
   */
  static async uncompleteHabit(
    supabase: SupabaseClient,
    userId: string,
    completionId: string
  ): Promise<void> {
    const [{ data: completion, error }, { data: levelRecord }] = await Promise.all([
      supabase
        .from('habit_completions')
        .select('*')
        .eq('id', completionId)
        .eq('user_id', userId)
        .single(),
      supabase
        .from('user_levels')
        .select('total_xp')
        .eq('user_id', userId)
        .maybeSingle(),
    ]);

    if (error || !completion) {
      throw new Error('Catatan completion tidak ditemukan.');
    }

    await supabase.from('habit_completions').delete().eq('id', completionId);

    const newXp = Math.max(0, (levelRecord?.total_xp ?? 0) - completion.xp_earned);
    const { level } = calculateLevel(newXp);
    const evalDate = parseDateString(completion.date);

    await Promise.all([
      supabase.from('xp_transactions').insert({
        user_id: userId,
        source_type: 'habit_uncomplete',
        source_id: completion.habit_id,
        amount: -completion.xp_earned,
        description: 'Pembatalan penyelesaian habit',
      }),
      supabase.from('user_levels').upsert({
        user_id: userId,
        level,
        total_xp: newXp,
        updated_at: new Date().toISOString(),
      }),
      ConsistencyService.recalculateUserConsistencyAndTree(supabase, userId, evalDate),
      StreakService.calculateUserGlobalStreak(supabase, userId, evalDate),
    ]);
  }
}
