// src/lib/services/analytics.service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Habit, HabitSchedule } from '@/types/database';
import { isHabitScheduledOnDate, toDateString, parseDateString } from '../algorithms/schedule';
import { calculateHabitConsistency } from '../algorithms/consistency';

export interface WeeklyChartData {
  day: string; // 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'
  date: string;
  completed: number;
  scheduled: number;
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
   * Retrieves 7-day weekly completion overview (Mon-Sun)
   */
  static async getWeeklyOverview(
    supabase: SupabaseClient,
    userId: string,
    evalDate: Date = new Date()
  ): Promise<WeeklyChartData[]> {
    const today = new Date(evalDate);
    today.setHours(0, 0, 0, 0);

    // Find the Monday of current week
    const currentDay = today.getDay(); // 0 is Sun, 1 is Mon
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    const weekDates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(d);
    }

    const startDateStr = toDateString(weekDates[0]);
    const endDateStr = toDateString(weekDates[6]);

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

    const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    return weekDates.map((dateObj, idx) => {
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

      return {
        day: dayLabels[idx],
        date: dateStr,
        completed,
        scheduled,
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
