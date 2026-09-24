// src/app/api/calendar/activity/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toDateString } from '@/lib/algorithms/schedule';

export interface DayActivityData {
  date: string; // 'YYYY-MM-DD'
  count: number;
  xp: number;
  level: 0 | 1 | 2 | 3 | 4;
}

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
    const currentYear = new Date().getFullYear();
    const selectedYear = parseInt(searchParams.get('year') || String(currentYear), 10);

    const startDateStr = `${selectedYear}-01-01`;
    const endDateStr = `${selectedYear}-12-31`;

    // 1. Fetch completions for the user in this year
    const { data: completions, error: compError } = await supabase
      .from('habit_completions')
      .select('id, habit_id, date, xp_earned, completed_at')
      .eq('user_id', user.id)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true });

    if (compError) {
      throw new Error(compError.message);
    }

    // 2. Fetch all completions overall to find available active years
    const { data: allCompletions } = await supabase
      .from('habit_completions')
      .select('date')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    const availableYearsSet = new Set<number>([currentYear]);
    (allCompletions || []).forEach((c) => {
      if (c.date) {
        const y = parseInt(c.date.split('-')[0], 10);
        if (!isNaN(y)) availableYearsSet.add(y);
      }
    });
    // Add past 2 years minimum for nice UI selector
    availableYearsSet.add(currentYear - 1);
    availableYearsSet.add(currentYear - 2);

    const availableYears = Array.from(availableYearsSet).sort((a, b) => b - a);

    // 3. Aggregate daily activities
    const activities: Record<string, DayActivityData> = {};
    let totalCompletions = 0;
    let totalXp = 0;
    let activeDaysCount = 0;

    (completions || []).forEach((c) => {
      const d = c.date;
      if (!activities[d]) {
        activities[d] = {
          date: d,
          count: 0,
          xp: 0,
          level: 0,
        };
        activeDaysCount++;
      }
      activities[d].count += 1;
      activities[d].xp += Number(c.xp_earned) || 10;
      totalCompletions += 1;
      totalXp += Number(c.xp_earned) || 10;
    });

    // Compute intensity level (0 to 4)
    Object.values(activities).forEach((act) => {
      if (act.count === 0) act.level = 0;
      else if (act.count === 1) act.level = 1;
      else if (act.count <= 3) act.level = 2;
      else if (act.count <= 5) act.level = 3;
      else act.level = 4;
    });

    // 4. Calculate longest streak in this year
    let maxStreakInYear = 0;
    let tempStreak = 0;

    // Check consecutive days across the year
    const dIter = new Date(selectedYear, 0, 1);
    const endIter = new Date(selectedYear, 11, 31);
    const today = new Date();

    while (dIter <= endIter && dIter <= today) {
      const dStr = toDateString(dIter);
      if (activities[dStr] && activities[dStr].count > 0) {
        tempStreak++;
        if (tempStreak > maxStreakInYear) {
          maxStreakInYear = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
      dIter.setDate(dIter.getDate() + 1);
    }

    return NextResponse.json({
      success: true,
      data: {
        year: selectedYear,
        totalCompletions,
        totalXp,
        activeDaysCount,
        maxStreakInYear,
        activities,
        availableYears,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat aktivitas kalender';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}
