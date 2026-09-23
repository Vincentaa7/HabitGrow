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

export interface BrokenStreakDetail {
  isBroken: boolean;
  lostStreak: number;
  missedDate: string | null;
}

/**
 * Detects if a habit's streak was recently broken (e.g. yesterday).
 * Only flags as broken if user had an active streak (>0) immediately before the missed day.
 */
export function detectBrokenStreak(
  habit: Pick<Habit, 'frequency_type' | 'start_date' | 'end_date' | 'is_active' | 'is_archived'>,
  schedules: HabitSchedule[],
  completedDatesSet: Set<string>,
  evaluationDate: Date = new Date()
): BrokenStreakDetail {
  const evalDate = new Date(evaluationDate);
  evalDate.setHours(0, 0, 0, 0);

  const startDate = parseDateString(habit.start_date);
  startDate.setHours(0, 0, 0, 0);

  if (evalDate <= startDate) {
    return { isBroken: false, lostStreak: 0, missedDate: null };
  }

  // Find all scheduled dates strictly before evalDate
  const pastScheduledDates: string[] = [];
  const cur = new Date(startDate);
  while (cur < evalDate) {
    if (isHabitScheduledOnDate(habit, schedules, cur)) {
      pastScheduledDates.push(toDateString(cur));
    }
    cur.setDate(cur.getDate() + 1);
  }

  if (pastScheduledDates.length === 0) {
    return { isBroken: false, lostStreak: 0, missedDate: null };
  }

  const latestPast = pastScheduledDates[pastScheduledDates.length - 1];

  // If latest past scheduled date was completed, streak is not broken
  if (completedDatesSet.has(latestPast)) {
    return { isBroken: false, lostStreak: 0, missedDate: null };
  }

  // Only notify if the missed date was recent (within last 3 days)
  const missedDateObj = parseDateString(latestPast);
  const diffDays = Math.round((evalDate.getTime() - missedDateObj.getTime()) / (1000 * 3600 * 24));
  if (diffDays > 3) {
    return { isBroken: false, lostStreak: 0, missedDate: null };
  }

  // Walk backwards from the date prior to latestPast to calculate how many consecutive days were lost
  let lostStreak = 0;
  for (let i = pastScheduledDates.length - 2; i >= 0; i--) {
    const sDate = pastScheduledDates[i];
    if (completedDatesSet.has(sDate)) {
      lostStreak += 1;
    } else {
      break;
    }
  }

  if (lostStreak > 0) {
    return {
      isBroken: true,
      lostStreak,
      missedDate: latestPast,
    };
  }

  return { isBroken: false, lostStreak: 0, missedDate: null };
}

export interface GlobalStreakResult {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

/**
 * Calculates user's Global Daily Streak based on the "Non-Zero Day" principle:
 * As long as AT LEAST ONE habit is completed on each consecutive day, the global streak stays alive.
 * - Each consecutive day with >= 1 habit completed increments the global streak.
 * - If today has 0 completions yet, today is considered in-progress (streak is carried over from yesterday).
 * - If yesterday had 0 completions, the streak resets to 0.
 */
export function calculateGlobalDailyStreak(
  activeDatesSet: Set<string>, // Set of 'YYYY-MM-DD' dates where at least 1 habit was completed
  evaluationDate: Date = new Date()
): GlobalStreakResult {
  if (!activeDatesSet || activeDatesSet.size === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
  }

  const evalDate = new Date(evaluationDate);
  evalDate.setHours(0, 0, 0, 0);
  const evalDateStr = toDateString(evalDate);

  // Sort distinct active dates chronologically
  const sortedDates = Array.from(activeDatesSet).sort();
  const lastActiveDate = sortedDates[sortedDates.length - 1];

  // Calculate longest consecutive days streak in history
  let longestStreak = 0;
  let runningStreak = 0;
  let prevDateObj: Date | null = null;

  for (const dateStr of sortedDates) {
    const curDateObj = parseDateString(dateStr);
    curDateObj.setHours(0, 0, 0, 0);

    if (!prevDateObj) {
      runningStreak = 1;
    } else {
      const diffDays = Math.round((curDateObj.getTime() - prevDateObj.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        runningStreak += 1;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    }

    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDateObj = curDateObj;
  }

  // Calculate current streak relative to evalDate (today)
  const completedToday = activeDatesSet.has(evalDateStr);

  const yesterday = new Date(evalDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateString(yesterday);
  const completedYesterday = activeDatesSet.has(yesterdayStr);

  // If user did not complete any habit today AND did not complete any habit yesterday -> streak is 0
  if (!completedToday && !completedYesterday) {
    return { currentStreak: 0, longestStreak, lastActiveDate };
  }

  // Walk backwards from today (if completed today) or from yesterday (if today not completed yet)
  let currentStreak = 0;
  const walkDate = new Date(completedToday ? evalDate : yesterday);

  while (true) {
    const dateStr = toDateString(walkDate);
    if (activeDatesSet.has(dateStr)) {
      currentStreak += 1;
      walkDate.setDate(walkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    lastActiveDate,
  };
}
