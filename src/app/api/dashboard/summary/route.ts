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

    // Fetch all dashboard components concurrently in parallel (Zero Sequential Blocking)
    const [
      { data: profile },
      todayHabits,
      { data: levelData },
      treeRes,
      globalStreak,
      { data: recentAchievements },
      brokenStreaks,
      atRiskHabits,
    ] = await Promise.all([
      supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).maybeSingle(),
      HabitService.getTodayHabits(supabase, user.id, todayStr),
      supabase.from('user_levels').select('level, total_xp').eq('user_id', user.id).maybeSingle(),
      supabase.from('user_trees').select('*').eq('user_id', user.id).maybeSingle(),
      StreakService.calculateUserGlobalStreak(supabase, user.id, evalDate),
      supabase
        .from('user_achievements')
        .select('unlocked_at, achievement:achievements(id, name, description, icon)')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })
        .limit(3),
      StreakService.detectBrokenStreaks(supabase, user.id, evalDate),
      PredictionService.getAtRiskHabitsToday(supabase, user.id, evalDate),
      // Synchronize habit streaks in parallel without blocking main queries
      StreakService.recalculateAllUserStreaks(supabase, user.id, evalDate),
    ]);

    const completedCount = todayHabits.filter((h) => h.is_completed_today).length;
    const totalScheduled = todayHabits.length;
    const completionPercentage = totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0;

    const totalXp = levelData?.total_xp ?? 0;
    const levelInfo = calculateLevel(totalXp);

    let treeData = treeRes.data;
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

    const currentStreak = globalStreak.currentStreak;
    const longestStreak = globalStreak.longestStreak;

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
