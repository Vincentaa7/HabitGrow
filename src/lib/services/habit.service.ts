// src/lib/services/habit.service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { HabitCreateInput, HabitUpdateInput } from '../validators/habit.schema';
import { isHabitScheduledOnDate, toDateString } from '../algorithms/schedule';
import { Habit, HabitSchedule } from '@/types/database';
import { TodayHabitItem } from '@/types';
import { calculateXP } from '../algorithms/xp';

export class HabitService {
  /**
   * Create a new habit with optional schedule entries.
   */
  static async createHabit(
    supabase: SupabaseClient,
    userId: string,
    input: HabitCreateInput
  ): Promise<Habit> {
    const { selected_days, ...habitFields } = input;

    // 1. Insert Habit
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .insert({
        ...habitFields,
        user_id: userId,
        is_active: true,
        is_archived: false,
      })
      .select('*, category:habit_categories(*)')
      .single();

    if (habitError || !habit) {
      throw new Error(`Gagal membuat habit: ${habitError?.message}`);
    }

    // 2. Insert schedules if SELECTED_DAYS
    if (input.frequency_type === 'SELECTED_DAYS' && selected_days && selected_days.length > 0) {
      const scheduleRows = selected_days.map((day) => ({
        habit_id: habit.id,
        day_of_week: day,
      }));

      const { error: scheduleError } = await supabase.from('habit_schedules').insert(scheduleRows);
      if (scheduleError) {
        console.error('Error creating schedules:', scheduleError);
      }
    }

    // 3. Insert initial streak entry
    await supabase.from('user_streaks').insert({
      user_id: userId,
      habit_id: habit.id,
      current_streak: 0,
      longest_streak: 0,
    });

    // 4. Log Activity
    await supabase.from('activity_logs').insert({
      user_id: userId,
      activity_type: 'HABIT_CREATED',
      entity_type: 'habit',
      entity_id: habit.id,
      metadata: { habit_name: habit.name },
    });

    return habit as unknown as Habit;
  }

  /**
   * List all habits for a user (with filtering for active/archived).
   */
  static async getHabits(
    supabase: SupabaseClient,
    userId: string,
    options: { isArchived?: boolean; categoryId?: string } = {}
  ): Promise<Habit[]> {
    let query = supabase
      .from('habits')
      .select('*, category:habit_categories(*), habit_schedules(*), streak:user_streaks(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (typeof options.isArchived === 'boolean') {
      query = query.eq('is_archived', options.isArchived);
    }
    if (options.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data || []).map((h) => ({
      ...h,
      schedules: h.habit_schedules,
      streak: Array.isArray(h.streak) ? h.streak[0] : h.streak,
    })) as unknown as Habit[];
  }

  /**
   * Fetch today's scheduled habits with completion status.
   */
  static async getTodayHabits(
    supabase: SupabaseClient,
    userId: string,
    targetDateStr?: string
  ): Promise<TodayHabitItem[]> {
    const dateStr = targetDateStr || toDateString(new Date());

    // 1. Fetch active habits with schedules and streaks
    const { data: habits, error } = await supabase
      .from('habits')
      .select('*, category:habit_categories(name), habit_schedules(*), user_streaks(*)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_archived', false);

    if (error) throw new Error(error.message);

    // 2. Fetch completions for this date
    const { data: completions } = await supabase
      .from('habit_completions')
      .select('id, habit_id')
      .eq('user_id', userId)
      .eq('date', dateStr);

    const completionMap = new Map<string, string>();
    (completions || []).forEach((c) => {
      completionMap.set(c.habit_id, c.id);
    });

    const todayItems: TodayHabitItem[] = [];

    for (const h of habits || []) {
      const habit = h as unknown as Habit;
      const schedules = (h.habit_schedules || []) as unknown as HabitSchedule[];
      const isScheduled = isHabitScheduledOnDate(habit, schedules, dateStr);

      if (isScheduled) {
        const streakRecord = Array.isArray(h.user_streaks) ? h.user_streaks[0] : h.user_streaks;
        const completionId = completionMap.get(h.id);

        todayItems.push({
          id: h.id,
          name: h.name,
          description: h.description,
          icon: h.icon || 'sparkles',
          color: h.color || '#10b981',
          difficulty: h.difficulty,
          frequency_type: h.frequency_type,
          target_value: Number(h.target_value) || 1,
          target_unit: h.target_unit || 'times',
          category_name: h.category?.name,
          is_completed_today: Boolean(completionId),
          today_completion_id: completionId,
          current_streak:
            Boolean(completionId) && (streakRecord?.current_streak ?? 0) === 0
              ? 1
              : streakRecord?.current_streak ?? 0,
          xp_reward: calculateXP(h.difficulty),
        });
      }
    }

    return todayItems;
  }

  /**
   * Update habit.
   */
  static async updateHabit(
    supabase: SupabaseClient,
    userId: string,
    habitId: string,
    input: HabitUpdateInput
  ): Promise<Habit> {
    const { selected_days, ...habitFields } = input;

    const { data: updated, error } = await supabase
      .from('habits')
      .update({
        ...habitFields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', habitId)
      .eq('user_id', userId)
      .select('*, category:habit_categories(*)')
      .single();

    if (error || !updated) {
      throw new Error(`Gagal update habit: ${error?.message}`);
    }

    if (selected_days !== undefined) {
      // Re-create schedule
      await supabase.from('habit_schedules').delete().eq('habit_id', habitId);
      if (selected_days.length > 0) {
        await supabase.from('habit_schedules').insert(
          selected_days.map((day) => ({
            habit_id: habitId,
            day_of_week: day,
          }))
        );
      }
    }

    return updated as unknown as Habit;
  }

  /**
   * Archive habit.
   */
  static async archiveHabit(supabase: SupabaseClient, userId: string, habitId: string): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq('id', habitId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  /**
   * Restore habit.
   */
  static async restoreHabit(supabase: SupabaseClient, userId: string, habitId: string): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .update({ is_archived: false, updated_at: new Date().toISOString() })
      .eq('id', habitId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  /**
   * Delete habit (if allowed by business rules).
   */
  static async deleteHabit(supabase: SupabaseClient, userId: string, habitId: string): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }
}
