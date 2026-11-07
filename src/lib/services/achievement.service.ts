// src/lib/services/achievement.service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { calculateLevel } from '../algorithms/level';

export class AchievementService {
  /**
   * Evaluates all locked achievements for a user and unlocks any whose conditions are met.
   * Server-side only per PRD Section 32.
   */
  static async evaluateAchievements(
    supabase: SupabaseClient,
    userId: string,
    currentStreak: number,
    consistencyScore: number,
    treeStage: string,
    knownTotalCompletions?: number
  ): Promise<Array<{ id: string; name: string; xp_reward: number }>> {
    // 1. Fetch unlocked achievements, active achievements, and total completions concurrently
    const [{ data: unlockedData }, { data: allAchievements }, countRes] = await Promise.all([
      supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId),
      supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true),
      typeof knownTotalCompletions === 'number'
        ? Promise.resolve({ count: knownTotalCompletions })
        : supabase
            .from('habit_completions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId),
    ]);

    if (!allAchievements || allAchievements.length === 0) return [];

    const unlockedIds = new Set((unlockedData || []).map((u) => u.achievement_id));
    const totalCompletions = countRes.count ?? 0;

    const newlyUnlocked: Array<{ id: string; name: string; xp_reward: number }> = [];

    const stageRanks: Record<string, number> = {
      Seed: 1,
      Sprout: 2,
      'Young Tree': 3,
      'Healthy Tree': 4,
      'Mature Tree': 5,
    };
    const currentStageRank = stageRanks[treeStage] || 1;

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      let conditionMet = false;

      switch (achievement.condition_type) {
        case 'first_step':
          if (totalCompletions >= 1) conditionMet = true;
          break;
        case 'streak_days':
          if (currentStreak >= achievement.condition_value) conditionMet = true;
          break;
        case 'total_completions':
          if (totalCompletions >= achievement.condition_value) conditionMet = true;
          break;
        case 'consistency_rate':
          if (consistencyScore >= achievement.condition_value) conditionMet = true;
          break;
        case 'tree_stage':
          if (currentStageRank >= achievement.condition_value) conditionMet = true;
          break;
      }

      if (conditionMet) {
        // Unlock achievement
        const { error: unlockError } = await supabase.from('user_achievements').insert({
          user_id: userId,
          achievement_id: achievement.id,
        });

        if (!unlockError) {
          newlyUnlocked.push({
            id: achievement.id,
            name: achievement.name,
            xp_reward: achievement.xp_reward,
          });

          const { data: levelRecord } = await supabase
            .from('user_levels')
            .select('total_xp')
            .eq('user_id', userId)
            .maybeSingle();

          const newTotalXp = (levelRecord?.total_xp ?? 0) + achievement.xp_reward;
          const { level } = calculateLevel(newTotalXp);

          // Execute achievement reward transactions in parallel
          await Promise.all([
            supabase.from('xp_transactions').insert({
              user_id: userId,
              source_type: 'achievement',
              source_id: achievement.id,
              amount: achievement.xp_reward,
              description: `Unlocked achievement: ${achievement.name}`,
            }),
            supabase.from('user_levels').upsert({
              user_id: userId,
              level,
              total_xp: newTotalXp,
              updated_at: new Date().toISOString(),
            }),
            supabase.from('activity_logs').insert({
              user_id: userId,
              activity_type: 'ACHIEVEMENT_UNLOCKED',
              entity_type: 'achievement',
              entity_id: achievement.id,
              metadata: {
                achievement_name: achievement.name,
                xp_reward: achievement.xp_reward,
              },
            }),
          ]);
        }
      }
    }

    return newlyUnlocked;
  }
}
