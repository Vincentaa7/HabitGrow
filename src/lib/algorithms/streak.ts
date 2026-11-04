// src/lib/algorithms/streak.ts
import { parseDateString, toDateString } from './schedule';

export interface GlobalStreakResult {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

/**
 * Calculates user's Global Daily Streak based on the "Non-Zero Day" principle:
 * As long as AT LEAST ONE habit is completed on each consecutive day, the global streak stays alive.
 * - Each consecutive day with >= 1 habit completed increments the global streak (+1).
 * - If today has 0 completions yet, today is considered in-progress (streak is carried over from yesterday).
 * - If yesterday had 0 completions, the streak resets to 0.
 *
 * This design intentionally eliminates "Streak Fatigue" and "The What-The-Hell Effect"
 * by treating any positive effort as a victory for the day.
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
