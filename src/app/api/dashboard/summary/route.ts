// src/app/api/dashboard/summary/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { HabitService } from '@/lib/services/habit.service';
import { calculateLevel } from '@/lib/algorithms/level';
import { ConsistencyService } from '@/lib/services/consistency.service';
import { StreakService } from '@/lib/services/streak.service';
import { PredictionService } from '@/lib/services/prediction.service';
import { parseDateString, toDateString } from '@/lib/algorithms/schedule';
import { DashboardSummary } from '@/types';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu' } },
        { status: 401 }
      );
    }

    // Support client local date query param (?date=YYYY-MM-DD) to resolve client-server timezone difference
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const evalDate = dateParam ? parseDateString(dateParam) : new Date();
    const todayStr = dateParam || toDateString(evalDate);

    // 1. Fetch Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    // 2. Synchronize all habit streaks for user on evalDate (resets any streaks missed yesterday)
    await StreakService.recalculateAllUserStreaks(supabase, user.id, evalDate);

    // 3. Fetch Today Habits (aligned to client local date with refreshed streaks)
    const todayHabits = await HabitService.getTodayHabits(supabase, user.id, todayStr);
    const completedCount = todayHabits.filter((h) => h.is_completed_today).length;
    const totalScheduled = todayHabits.length;
    const completionPercentage = totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0;

    // 3. Fetch Level & XP
    const { data: levelData } = await supabase
      .from('user_levels')
      .select('level, total_xp')
      .eq('user_id', user.id)
      .maybeSingle();

    const totalXp = levelData?.total_xp ?? 0;
    const levelInfo = calculateLevel(totalXp);

    // 4. Fetch Tree State (or initialize if missing)
    let { data: treeData } = await supabase
      .from('user_trees')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!treeData) {
      const recalculated = await ConsistencyService.recalculateUserConsistencyAndTree(supabase, user.id, evalDate);
      treeData = {
        user_id: user.id,
        stage: recalculated.treeStage,
        health: recalculated.health,
        consistency_score: recalculated.consistencyScore,
        growth_points: 0,
        updated_at: new Date().toISOString(),
      };
    }

    // 5. Calculate Global Daily Streak (Non-Zero Day: >= 1 habit completed per day)
    const globalStreak = await StreakService.calculateUserGlobalStreak(supabase, user.id, evalDate);
    const currentStreak = globalStreak.currentStreak;
    const longestStreak = globalStreak.longestStreak;

    // 6. Fetch Recent Achievements
    const { data: recentAchievements } = await supabase
      .from('user_achievements')
      .select('unlocked_at, achievement:achievements(id, name, description, icon)')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false })
      .limit(3);

    const formattedAchievements = (recentAchievements || [])
      .filter((a) => a.achievement)
      .map((a) => {
        const item = a.achievement as unknown as { id: string; name: string; description: string; icon: string };
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          icon: item.icon,
          unlocked_at: a.unlocked_at,
        };
      });

    // 7. Detect Broken Streaks (missed scheduled days)
    const brokenStreaks = await StreakService.detectBrokenStreaks(supabase, user.id, evalDate);

    // 8. Predict Habits at Risk of Failure / Churn Today (Machine Learning Sigmoid Classifier)
    const atRiskHabits = await PredictionService.getAtRiskHabitsToday(supabase, user.id, evalDate);

    const summary: DashboardSummary = {
      profile: {
        display_name: profile?.display_name || user.email?.split('@')[0] || 'Teman',
        avatar_url: profile?.avatar_url || null,
      },
      today_habits: todayHabits,
      completed_count: completedCount,
      total_scheduled_today: totalScheduled,
      completion_percentage: completionPercentage,
      user_level: {
        level: levelInfo.level,
        total_xp: totalXp,
        current_level_xp: levelInfo.xpInCurrentLevel,
        next_level_xp: levelInfo.nextLevelXp,
        progress_percentage: levelInfo.progressPercentage,
      },
      streak: {
        current_streak: currentStreak,
        longest_streak: longestStreak,
      },
      tree: {
        stage: treeData.stage as any,
        health: treeData.health,
        consistency_score: Number(treeData.consistency_score) || 0,
        growth_points: treeData.growth_points || 0,
      },
      recent_achievements: formattedAchievements,
      broken_streaks: brokenStreaks,
      at_risk_habits: atRiskHabits,
    };

    return NextResponse.json({ success: true, data: summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat ringkasan dashboard';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}
