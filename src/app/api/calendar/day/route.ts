// src/app/api/calendar/day/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { HabitService } from '@/lib/services/habit.service';
import { toDateString } from '@/lib/algorithms/schedule';
import { calculateXP } from '@/lib/algorithms/xp';
import { TodayHabitItem } from '@/types';

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

    // Fetch active scheduled habits and ALL completions recorded on targetDate (including archived habits)
    const [activeItems, { data: dayCompletions }] = await Promise.all([
      HabitService.getTodayHabits(supabase, user.id, targetDate),
      supabase
        .from('habit_completions')
        .select('id, habit_id, xp_earned, habit:habits(id, name, description, icon, color, difficulty, frequency_type, target_value, target_unit, is_archived, category:habit_categories(name))')
        .eq('user_id', user.id)
        .eq('date', targetDate),
    ]);

    const itemIds = new Set(activeItems.map((h) => h.id));
    const items: TodayHabitItem[] = [...activeItems];

    // Preserve historical accuracy: include completed habits that were later archived so calendar detail matches heatmap count
    for (const c of dayCompletions || []) {
      if (itemIds.has(c.habit_id)) continue;
      const h = c.habit as unknown as {
        id: string;
        name: string;
        description: string | null;
        icon: string | null;
        color: string | null;
        difficulty: 'EASY' | 'MEDIUM' | 'HARD';
        frequency_type: 'DAILY' | 'SELECTED_DAYS';
        target_value: number;
        target_unit: string | null;
        category?: { name: string } | null;
      } | null;

      if (h) {
        items.push({
          id: h.id,
          name: `${h.name} (Diarsipkan)`,
          description: h.description,
          icon: h.icon || 'sparkles',
          color: h.color || '#10b981',
          difficulty: h.difficulty,
          frequency_type: h.frequency_type,
          target_value: Number(h.target_value) || 1,
          target_unit: h.target_unit || 'kali',
          category_name: h.category?.name,
          is_completed_today: true,
          today_completion_id: c.id,
          current_streak: 0,
          xp_reward: Number(c.xp_earned) || calculateXP(h.difficulty),
        });
        itemIds.add(h.id);
      }
    }

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
