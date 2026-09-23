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
    treeStage: string
  ): Promise<Array<{ id: string; name: string; xp_reward: number }>> {
    // 1. Fetch user's currently unlocked achievement IDs
    const { data: unlockedData } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const unlockedIds = new Set((unlockedData || []).map((u) => u.achievement_id));

    // 2. Fetch active system achievements
    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true);

    if (!allAchievements) return [];

    // 3. Fetch user total completions count
    const { count: totalCompletions } = await supabase
      .from('habit_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

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
          if ((totalCompletions ?? 0) >= 1) conditionMet = true;
          break;
        case 'streak_days':
          if (currentStreak >= achievement.condition_value) conditionMet = true;
          break;
        case 'total_completions':
          if ((totalCompletions ?? 0) >= achievement.condition_value) conditionMet = true;
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

          // Award bonus XP for achievement
          await supabase.from('xp_transactions').insert({
            user_id: userId,
            source_type: 'achievement',
            source_id: achievement.id,
            amount: achievement.xp_reward,
            description: `Unlocked achievement: ${achievement.name}`,
          });

          // Update user level
          const { data: levelRecord } = await supabase
            .from('user_levels')
            .select('total_xp')
            .eq('user_id', userId)
            .single();

          const newTotalXp = (levelRecord?.total_xp ?? 0) + achievement.xp_reward;
          const { level } = calculateLevel(newTotalXp);

          await supabase.from('user_levels').upsert({
            user_id: userId,
            level,
            total_xp: newTotalXp,
            updated_at: new Date().toISOString(),
          });

          // Log activity
          await supabase.from('activity_logs').insert({
            user_id: userId,
            activity_type: 'ACHIEVEMENT_UNLOCKED',
            entity_type: 'achievement',
            entity_id: achievement.id,
            metadata: {
              achievement_name: achievement.name,
              xp_reward: achievement.xp_reward,
            },
          });
        }
      }
    }

    return newlyUnlocked;
  }
}
