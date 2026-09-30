// src/app/api/cron/reminders/route.ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { PredictionService } from '@/lib/services/prediction.service';
import { WebPushService } from '@/lib/services/web-push.service';
import { StreakService } from '@/lib/services/streak.service';
import { HabitService } from '@/lib/services/habit.service';
import { toDateString } from '@/lib/algorithms/schedule';

/**
 * Background Cron & On-Demand Endpoint for SPK SAW Smart Reminders
 * Evaluates at-risk habits and dispatches Web Push notifications to subscribed devices.
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Check if triggered by automated cron (with CRON_SECRET) or by logged in user
    let isCronAuth = false;
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      isCronAuth = true;
    }

    const adminSupabase = createAdminClient();
    let targetUserIds: string[] = [];

    if (isCronAuth) {
      // Find all distinct users with an active Web Push subscription
      const { data: subscriptions } = await adminSupabase
        .from('notifications')
        .select('user_id')
        .eq('type', 'PUSH_SUBSCRIPTION');

      if (subscriptions && subscriptions.length > 0) {
        targetUserIds = Array.from(new Set(subscriptions.map((s) => s.user_id)));
      }
    } else {
      // Allow authenticated user to trigger evaluation for their own account
      const serverSupabase = await createClient();
      const {
        data: { user },
      } = await serverSupabase.auth.getUser();

      if (!user) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized cron or user request' } },
          { status: 401 }
        );
      }
      targetUserIds = [user.id];
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tidak ada pengguna dengan langganan Web Push aktif.',
        dispatched: 0,
      });
    }

    const today = new Date();
    const todayStr = toDateString(today);
    let dispatchedCount = 0;
    const results: Array<{ userId: string; habitName?: string; type: string }> = [];

    for (const userId of targetUserIds) {
      try {
        // 1. Evaluate SPK SAW churn risk
        const atRiskHabits = await PredictionService.getAtRiskHabitsToday(adminSupabase, userId, today);

        if (atRiskHabits.length > 0) {
          const topRisk = atRiskHabits[0];
          const tip = topRisk.suggested_action?.message || 'Selesaikan versi ringannya agar pohonmu tetap subur!';
          const pushRes = await WebPushService.sendPushToUser(adminSupabase, userId, {
            title: `⚠️ Peringatan SPK: ${topRisk.habit_name}`,
            body: `Risiko terlewat ${topRisk.failure_probability}%. ${tip}`,
            url: '/app/dashboard',
            tag: `saw-warning-${topRisk.habit_id}`,
          });

          if (pushRes.success) {
            dispatchedCount++;
            results.push({ userId, habitName: topRisk.habit_name, type: 'SPK_SAW_EARLY_WARNING' });
          }
          continue;
        }

        // 2. If no high risk, evaluate streak defense
        const globalStreak = await StreakService.calculateUserGlobalStreak(adminSupabase, userId, today);
        const todayHabits = await HabitService.getTodayHabits(adminSupabase, userId, todayStr);
        const pendingHabits = todayHabits.filter((h) => !h.is_completed_today);

        if (globalStreak.currentStreak > 0 && pendingHabits.length > 0) {
          const pushRes = await WebPushService.sendPushToUser(adminSupabase, userId, {
            title: `🔥 Pertahankan Streak ${globalStreak.currentStreak} Hari!`,
            body: `Tersisa ${pendingHabits.length} kebiasaan hari ini (${pendingHabits[0].name}). Lindungi pohon virtualmu sebelum pergantian hari!`,
            url: '/app/dashboard',
            tag: 'habitgrow-streak-guard',
          });

          if (pushRes.success) {
            dispatchedCount++;
            results.push({ userId, type: 'STREAK_DEFENSE' });
          }
        }
      } catch (userErr) {
        console.error(`Error processing reminders for user ${userId}:`, userErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Evaluasi SPK selesai. Mengirim ${dispatchedCount} notifikasi push.`,
      dispatched: dispatchedCount,
      details: results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memproses cron reminders';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
