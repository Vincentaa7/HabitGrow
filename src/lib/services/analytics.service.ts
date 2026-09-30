// src/lib/services/analytics.service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Habit, HabitSchedule } from '@/types/database';
import { isHabitScheduledOnDate, toDateString, parseDateString } from '../algorithms/schedule';
import { calculateHabitConsistency } from '../algorithms/consistency';

export interface WeeklyChartData {
  day: string; // 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min' or 'DD/MM'
  date: string;
  completed: number;
  scheduled: number;
  percentage: number;
  isMissed: boolean;
}

export interface HabitPerformanceItem {
  habitId: string;
  name: string;
  color: string;
  icon: string;
  scheduled: number;
  completed: number;
  consistencyPercentage: number;
}

export class AnalyticsService {
  /**
   * Retrieves completion overview for a given range (7 days weekly Mon-Sun or 30 days rolling)
   */
  static async getWeeklyOverview(
    supabase: SupabaseClient,
    userId: string,
    evalDate: Date = new Date(),
    range: '7' | '30' = '7'
  ): Promise<WeeklyChartData[]> {
    const today = new Date(evalDate);
    today.setHours(0, 0, 0, 0);

    const dates: Date[] = [];
    const dayLabels: string[] = [];

    if (range === '30') {
      // 30 consecutive days up to today
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(d);
        dayLabels.push(`${d.getDate()}/${d.getMonth() + 1}`);
      }
    } else {
      // Find the Monday of current week
      const currentDay = today.getDay(); // 0 is Sun, 1 is Mon
      const distanceToMonday = (currentDay + 6) % 7;
      const monday = new Date(today);
      monday.setDate(today.getDate() - distanceToMonday);

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(d);
      }
      dayLabels.push('Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min');
    }

    const startDateStr = toDateString(dates[0]);
    const endDateStr = toDateString(dates[dates.length - 1]);

    // Fetch active habits
    const { data: habitsData } = await supabase
      .from('habits')
      .select('*, habit_schedules(*)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_archived', false);

    // Fetch completions in range
    const { data: completionsData } = await supabase
      .from('habit_completions')
      .select('habit_id, date')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    const completionDatesSet = new Set(
      (completionsData || []).map((c) => `${c.habit_id}_${c.date}`)
    );

    return dates.map((dateObj, idx) => {
      const dateStr = toDateString(dateObj);
      let scheduled = 0;
      let completed = 0;

      for (const h of habitsData || []) {
        const habit = h as unknown as Habit;
        const schedules = (h.habit_schedules || []) as unknown as HabitSchedule[];
        if (isHabitScheduledOnDate(habit, schedules, dateStr)) {
          scheduled += 1;
          if (completionDatesSet.has(`${habit.id}_${dateStr}`)) {
            completed += 1;
          }
        }
      }

      const percentage =
        scheduled > 0
          ? Math.round((completed / scheduled) * 100)
          : completed > 0
          ? 100
          : 0;

      const isMissed = scheduled > 0 && completed === 0;

      return {
        day: dayLabels[idx],
        date: dateStr,
        completed,
        scheduled,
        percentage,
        isMissed,
      };
    });
  }

  /**
   * Evaluates individual habit performance to determine best habit and needs attention habit.
   * PRD Section 35.
   */
  static async getHabitPerformance(
    supabase: SupabaseClient,
    userId: string,
    evalDate: Date = new Date()
  ): Promise<{
    items: HabitPerformanceItem[];
    bestHabit: HabitPerformanceItem | null;
    needsAttentionHabit: HabitPerformanceItem | null;
  }> {
    const { data: habitsData } = await supabase
      .from('habits')
      .select('*, habit_schedules(*)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_archived', false);

    if (!habitsData || habitsData.length === 0) {
      return { items: [], bestHabit: null, needsAttentionHabit: null };
    }

    const { data: completionsData } = await supabase
      .from('habit_completions')
      .select('habit_id, date')
      .eq('user_id', userId);

    const completionsByHabit = new Map<string, Set<string>>();
    (completionsData || []).forEach((c) => {
      if (!completionsByHabit.has(c.habit_id)) {
        completionsByHabit.set(c.habit_id, new Set<string>());
      }
      completionsByHabit.get(c.habit_id)!.add(c.date);
    });

    const today = new Date(evalDate);
    today.setHours(0, 0, 0, 0);

    const items: HabitPerformanceItem[] = [];

    for (const h of habitsData) {
      const habit = h as unknown as Habit;
      const schedules = (h.habit_schedules || []) as unknown as HabitSchedule[];
      const completedSet = completionsByHabit.get(habit.id) || new Set<string>();

      const startDate = parseDateString(habit.start_date);
      startDate.setHours(0, 0, 0, 0);

      let scheduledCount = 0;
      let completedCount = 0;

      const cur = new Date(startDate);
      while (cur <= today) {
        if (isHabitScheduledOnDate(habit, schedules, cur)) {
          scheduledCount += 1;
          if (completedSet.has(toDateString(cur))) {
            completedCount += 1;
          }
        }
        cur.setDate(cur.getDate() + 1);
      }

      const consistency = calculateHabitConsistency(scheduledCount, completedCount);
      items.push({
        habitId: habit.id,
        name: habit.name,
        color: habit.color || '#10b981',
        icon: habit.icon || 'sparkles',
        scheduled: scheduledCount,
        completed: completedCount,
        consistencyPercentage: consistency,
      });
    }

    // Sort by consistency descending
    items.sort((a, b) => b.consistencyPercentage - a.consistencyPercentage);

    const bestHabit = items.length > 0 ? items[0] : null;
    const needsAttentionHabit =
      items.length > 1 && items[items.length - 1].consistencyPercentage < 70
        ? items[items.length - 1]
        : null;

    return { items, bestHabit, needsAttentionHabit };
  }
}
