// src/lib/algorithms/streak.ts
import { Habit, HabitSchedule } from '@/types/database';
import { isHabitScheduledOnDate, parseDateString, toDateString } from './schedule';

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

/**
 * Calculates current and longest streaks based on completed dates and habit schedule.
 * Strictly adheres to PRD Section 21 & 22:
 * - Only scheduled occurrences affect the streak.
 * - Non-scheduled days DO NOT break streak.
 * - Missing a scheduled occurrence resets the streak.
 * - If today is scheduled and not completed yet, the previous active streak is preserved until the day closes.
 */
export function calculateStreak(
  habit: Pick<Habit, 'frequency_type' | 'start_date' | 'end_date' | 'is_active' | 'is_archived'>,
  schedules: HabitSchedule[],
  completedDatesSet: Set<string>, // Set of 'YYYY-MM-DD'
  evaluationDate: Date = new Date()
): StreakResult {
  const evalDate = new Date(evaluationDate);
  evalDate.setHours(0, 0, 0, 0);
  const evalDateStr = toDateString(evalDate);

  const startDate = parseDateString(habit.start_date);
  startDate.setHours(0, 0, 0, 0);

  if (evalDate < startDate) {
    return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
  }

  // Generate ordered list of scheduled dates from start_date up to evalDate
  const scheduledDates: string[] = [];
  const cur = new Date(startDate);
  while (cur <= evalDate) {
    if (isHabitScheduledOnDate(habit, schedules, cur)) {
      scheduledDates.push(toDateString(cur));
    }
    cur.setDate(cur.getDate() + 1);
  }

  if (scheduledDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
  }

  // Calculate longest streak and last completed date across history
  let longestStreak = 0;
  let runningStreak = 0;
  let lastCompletedDate: string | null = null;

  for (const dateStr of scheduledDates) {
    if (completedDatesSet.has(dateStr)) {
      runningStreak += 1;
      lastCompletedDate = dateStr;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
  }

  // Determine current streak:
  const lastIdx = scheduledDates.length - 1;
  const latestScheduled = scheduledDates[lastIdx];

  let startWalkIdx = lastIdx;

  // If the latest scheduled date is TODAY:
  if (latestScheduled === evalDateStr) {
    if (!completedDatesSet.has(latestScheduled)) {
      // Today is still in progress and not completed yet.
      // Streak is carried over from the prior scheduled occurrence.
      startWalkIdx = lastIdx - 1;
    }
  } else {
    // Latest scheduled date was before today.
    // If user missed that scheduled date, streak is broken -> 0
    if (!completedDatesSet.has(latestScheduled)) {
      return { currentStreak: 0, longestStreak, lastCompletedDate };
    }
  }

  let currentStreak = 0;
  for (let i = startWalkIdx; i >= 0; i--) {
    const sDate = scheduledDates[i];
    if (completedDatesSet.has(sDate)) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate,
  };
}
