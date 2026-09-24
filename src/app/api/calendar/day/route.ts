// src/app/api/calendar/day/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { HabitService } from '@/lib/services/habit.service';
import { toDateString } from '@/lib/algorithms/schedule';

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

    const { searchParams } = new URL(request.url);
    const targetDate = searchParams.get('date') || toDateString(new Date());

    // Fetch scheduled habits and their completion state on target date
    const items = await HabitService.getTodayHabits(supabase, user.id, targetDate);

    const totalScheduled = items.length;
    const totalCompleted = items.filter((h) => h.is_completed_today).length;
    const totalXpEarned = items
      .filter((h) => h.is_completed_today)
      .reduce((sum, h) => sum + (h.xp_reward || 10), 0);
    const completionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
    const isNonZeroDay = totalCompleted > 0;

    return NextResponse.json({
      success: true,
      data: {
        date: targetDate,
        items,
        summary: {
          totalScheduled,
          totalCompleted,
          totalXpEarned,
          completionRate,
          isNonZeroDay,
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat detail hari';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}
