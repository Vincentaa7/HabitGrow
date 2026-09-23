// src/lib/algorithms/schedule.ts
import { Habit, HabitSchedule } from '@/types/database';

export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(str: string): Date {
  const parts = str.split('T')[0].split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

/**
 * Determines if a habit is scheduled to be performed on a specific date.
 * Strictly respects habit frequency:
 * - DAILY: Always scheduled if within start_date and end_date.
 * - SELECTED_DAYS: Scheduled if the date's day of week matches one of the habit_schedules entries.
 * - WEEKLY_TARGET: Allowed any day of the week until weekly target is met or flexible.
 */
export function isHabitScheduledOnDate(
  habit: Pick<Habit, 'frequency_type' | 'start_date' | 'end_date' | 'is_active' | 'is_archived'>,
  schedules: HabitSchedule[],
  date: Date | string
): boolean {
  if (!habit.is_active || habit.is_archived) return false;

  const targetDate = typeof date === 'string' ? parseDateString(date) : new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const startDate = parseDateString(habit.start_date);
  startDate.setHours(0, 0, 0, 0);
  if (targetDate < startDate) return false;

  if (habit.end_date) {
    const endDate = parseDateString(habit.end_date);
    endDate.setHours(23, 59, 59, 999);
    if (targetDate > endDate) return false;
  }

  if (habit.frequency_type === 'DAILY') {
    return true;
  }

  if (habit.frequency_type === 'SELECTED_DAYS') {
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    return schedules.some((s) => s.day_of_week === dayOfWeek);
  }

  if (habit.frequency_type === 'WEEKLY_TARGET') {
    return true;
  }

  return false;
}

/**
 * Returns all scheduled dates for a habit within a date range [startDate, endDate].
 */
export function getScheduledDatesInRange(
  habit: Pick<Habit, 'frequency_type' | 'start_date' | 'end_date' | 'is_active' | 'is_archived'>,
  schedules: HabitSchedule[],
  rangeStart: Date,
  rangeEnd: Date
): string[] {
  const result: string[] = [];
  const current = new Date(rangeStart);
  current.setHours(0, 0, 0, 0);

  const end = new Date(rangeEnd);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    if (isHabitScheduledOnDate(habit, schedules, current)) {
      result.push(toDateString(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return result;
}
