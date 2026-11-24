// src/app/api/cron/reminders/route.ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { PredictionService } from '@/lib/services/prediction.service';
import { WebPushService } from '@/lib/services/web-push.service';
import { StreakService } from '@/lib/services/streak.service';
import { HabitService } from '@/lib/services/habit.service';
import { toDateString } from '@/lib/algorithms/schedule';
import { getDateInTimezone } from '@/lib/algorithms/prediction';
import { hasAdminOrTestAccess, parseAllowedEmails } from '@/lib/auth/access';

/**
 * Background Cron & On-Demand Endpoint for SPK SAW Smart Reminders
 * Evaluates at-risk habits and dispatches Web Push notifications to subscribed devices.
 */
export async function GET(request: Request) {
  return handleReminders(request);
}

export async function POST(request: Request) {
  return handleReminders(request);
}

async function handleReminders(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    const url = new URL(request.url);
    const querySecret = url.searchParams.get('secret') || url.searchParams.get('cron_secret');

    // Strictly verify automated cron calls using CRON_SECRET (never trust spoofable User-Agent / x-vercel-cron headers)
    const isCronAuth = Boolean(
      cronSecret && (authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret)
    );

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
      // Allow only authorized admin / test user accounts to trigger on-demand evaluation manually
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

      const { data: profile } = await serverSupabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', user.id)
        .maybeSingle();

      const isAllowed = hasAdminOrTestAccess({
        role: profile?.role,
        displayName: profile?.display_name ?? null,
        email: user.email,
        allowedEmails: parseAllowedEmails(process.env.ADMIN_FEATURE_EMAILS),
      });

      if (!isAllowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Fitur evaluasi pengujian hanya tersedia untuk akun admin dan test user.',
            },
          },
          { status: 403 }
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

    // Fetch timezones for all target users in a single query
    const { data: userProfiles } = await adminSupabase
      .from('profiles')
      .select('id, timezone')
      .in('id', targetUserIds);

    const timezoneByUser = new Map<string, string>();
    (userProfiles || []).forEach((p) => {
      const tz = p.timezone && p.timezone !== 'UTC' ? p.timezone : 'Asia/Jakarta';
      timezoneByUser.set(p.id, tz);
    });

    const nowIso = new Date().toISOString();
    let dispatchedCount = 0;
    const results: Array<{ userId: string; habitName?: string; type: string }> = [];

    for (const userId of targetUserIds) {
      try {
        const userTz = timezoneByUser.get(userId) || 'Asia/Jakarta';
        const userToday = getDateInTimezone(nowIso, userTz);
        const userTodayStr = toDateString(userToday);

        // 1. Evaluate SPK SAW churn risk in the user's local calendar date & timezone
        const atRiskHabits = await PredictionService.getAtRiskHabitsToday(
          adminSupabase,
          userId,
          userToday,
          userTz
        );

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

        // 2. If no high risk, evaluate streak defense (ONLY if user has NOT completed any habit today yet!)
        const globalStreak = await StreakService.calculateUserGlobalStreak(adminSupabase, userId, userToday);
        const todayHabits = await HabitService.getTodayHabits(adminSupabase, userId, userTodayStr);
        const completedTodayCount = todayHabits.filter((h) => h.is_completed_today).length;
        const pendingHabits = todayHabits.filter((h) => !h.is_completed_today);

        if (globalStreak.currentStreak > 0 && completedTodayCount === 0 && pendingHabits.length > 0) {
          const pushRes = await WebPushService.sendPushToUser(adminSupabase, userId, {
            title: `🔥 Pertahankan Streak ${globalStreak.currentStreak} Hari!`,
            body: `Belum ada kebiasaan yang selesai hari ini (${pendingHabits[0].name}). Selesaikan minimal 1 kebiasaan agar streak tetap menyala!`,
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
