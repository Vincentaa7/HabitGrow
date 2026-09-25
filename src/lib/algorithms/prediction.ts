// src/lib/algorithms/prediction.ts
import { Habit, HabitSchedule } from '@/types/database';
import { HabitRiskPrediction } from '@/types';
import { isHabitScheduledOnDate, parseDateString, toDateString } from './schedule';

export interface HabitCompletionRecord {
  habit_id: string;
  date: string; // 'YYYY-MM-DD'
  completed_at: string; // ISO timestamp
  value: number;
}

export interface PredictionInput {
  habit: Pick<
    Habit,
    | 'id'
    | 'name'
    | 'icon'
    | 'color'
    | 'difficulty'
    | 'frequency_type'
    | 'target_value'
    | 'target_unit'
    | 'start_date'
    | 'end_date'
    | 'is_active'
    | 'is_archived'
    | 'created_at'
  >;
  schedules: HabitSchedule[];
  completions: HabitCompletionRecord[];
  evaluationDate?: Date;
  totalScheduledToday: number;
  totalDifficultyPointsToday: number;
}

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Calibrated Logistic Regression Weights (Trained on habit retention heuristic):
 * Baseline intercept: -2.3 (clean default state)
 * beta_1: 2.6 (Recent 14-day miss rate)
 * beta_2: 2.0 (Day-of-week historical vulnerability)
 * beta_3: 1.2 (Daily workload fatigue)
 * beta_4: 1.3 (Habit maturity / newness)
 * beta_5: 1.1 (Procrastination hour delay)
 */
const BETA = {
  INTERCEPT: -2.3,
  MISS_RATE: 2.6,
  WEEKDAY: 2.0,
  WORKLOAD: 1.2,
  MATURITY: 1.3,
  LATE_HOUR: 1.1,
};

export function predictHabitFailureRisk(input: PredictionInput): HabitRiskPrediction {
  const {
    habit,
    schedules,
    completions,
    evaluationDate = new Date(),
    totalDifficultyPointsToday,
  } = input;

  const evalDate = new Date(evaluationDate);
  evalDate.setHours(0, 0, 0, 0);
  const evalDateStr = toDateString(evalDate);
  const currentDayOfWeek = evalDate.getDay();
  const currentDayName = DAY_NAMES[currentDayOfWeek];

  const completionDatesSet = new Set(completions.map((c) => c.date));

  // --- Feature 1: Miss Rate in Recent 14 Days (X1) ---
  const startDate = parseDateString(habit.start_date);
  startDate.setHours(0, 0, 0, 0);

  let past14ScheduledCount = 0;
  let past14MissedCount = 0;

  for (let i = 1; i <= 14; i++) {
    const checkDate = new Date(evalDate);
    checkDate.setDate(checkDate.getDate() - i);

    if (checkDate >= startDate && isHabitScheduledOnDate(habit, schedules, checkDate)) {
      past14ScheduledCount += 1;
      const dateStr = toDateString(checkDate);
      if (!completionDatesSet.has(dateStr)) {
        past14MissedCount += 1;
      }
    }
  }

  const x1_missRate = past14ScheduledCount > 0 ? past14MissedCount / past14ScheduledCount : 0.2;

  // --- Feature 2: Day-of-Week Historical Vulnerability (X2) ---
  let sameWeekdayScheduledCount = 0;
  let sameWeekdayMissedCount = 0;

  for (let i = 1; i <= 21; i++) {
    const checkDate = new Date(evalDate);
    checkDate.setDate(checkDate.getDate() - i);

    if (
      checkDate >= startDate &&
      checkDate.getDay() === currentDayOfWeek &&
      isHabitScheduledOnDate(habit, schedules, checkDate)
    ) {
      sameWeekdayScheduledCount += 1;
      const dateStr = toDateString(checkDate);
      if (!completionDatesSet.has(dateStr)) {
        sameWeekdayMissedCount += 1;
      }
    }
  }

  const x2_weekday =
    sameWeekdayScheduledCount > 0 ? sameWeekdayMissedCount / sameWeekdayScheduledCount : 0.25;

  // --- Feature 3: Daily Workload & Cognitive Fatigue (X3) ---
  // Max cognitive load threshold ~ 16 difficulty points
  const x3_workload = Math.min(1.0, Math.max(0.1, totalDifficultyPointsToday / 16));

  // --- Feature 4: Habit Maturity & Fragility (X4) ---
  const createdDate = habit.created_at ? new Date(habit.created_at) : startDate;
  const daysSinceCreation = Math.max(
    0,
    Math.round((evalDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24))
  );

  let x4_maturity = 0.15;
  if (daysSinceCreation < 7) {
    x4_maturity = 0.85; // highly fragile in first week
  } else if (daysSinceCreation < 14) {
    x4_maturity = 0.65;
  } else if (daysSinceCreation < 30) {
    x4_maturity = 0.35;
  } else {
    x4_maturity = 0.12; // stable established habit
  }

  // --- Feature 5: Late Hour Procrastination Trend (X5) ---
  const recentCompletions = completions.filter((c) => {
    const cDate = parseDateString(c.date);
    const diff = Math.round((evalDate.getTime() - cDate.getTime()) / (1000 * 3600 * 24));
    return diff <= 7;
  });

  let x5_lateHour = 0.25;
  if (recentCompletions.length > 0) {
    const hours = recentCompletions.map((c) => {
      const d = new Date(c.completed_at);
      return d.getHours();
    });
    const avgHour = hours.reduce((acc, h) => acc + h, 0) / hours.length;

    if (avgHour >= 22) {
      x5_lateHour = 0.85; // usually completed near midnight
    } else if (avgHour >= 20) {
      x5_lateHour = 0.65; // completed in evening
    } else if (avgHour >= 16) {
      x5_lateHour = 0.4;
    } else {
      x5_lateHour = 0.15; // completed in morning / afternoon
    }
  }

  // --- Logistic Logit z Calculation ---
  const z =
    BETA.INTERCEPT +
    BETA.MISS_RATE * x1_missRate +
    BETA.WEEKDAY * x2_weekday +
    BETA.WORKLOAD * x3_workload +
    BETA.MATURITY * x4_maturity +
    BETA.LATE_HOUR * x5_lateHour;

  // Sigmoid probability: P = 1 / (1 + e^-z)
  const probability = 1 / (1 + Math.exp(-z));
  const failurePercentage = Math.min(99, Math.max(1, Math.round(probability * 100)));

  // Identify primary contributing factor
  const weightedContributions = [
    { factor: `Tingkat terlewat dalam 14 hari terakhir (${Math.round(x1_missRate * 100)}%)`, weight: BETA.MISS_RATE * x1_missRate },
    { factor: `Pola historis sering terlewat setiap hari ${currentDayName}`, weight: BETA.WEEKDAY * x2_weekday },
    { factor: 'Beban kebiasaan harian cukup padat hari ini', weight: BETA.WORKLOAD * x3_workload },
    { factor: 'Kebiasaan baru masih dalam fase adaptasi rentan (< 14 hari)', weight: BETA.MATURITY * x4_maturity },
    { factor: 'Pola pengerjaan cenderung menumpuk larut malam', weight: BETA.LATE_HOUR * x5_lateHour },
  ];

  weightedContributions.sort((a, b) => b.weight - a.weight);
  const primaryFactor = weightedContributions[0].factor;

  const riskLevel: 'MODERATE' | 'HIGH' = failurePercentage >= 70 ? 'HIGH' : 'MODERATE';

  // Formulate Adaptive Action Recommendation
  const currentTarget = Number(habit.target_value) || 1;
  const suggestedTarget = Math.max(1, Math.floor(currentTarget * 0.5));

  let suggestedAction: HabitRiskPrediction['suggested_action'];
  if (currentTarget > 1 && suggestedTarget < currentTarget) {
    suggestedAction = {
      type: 'LOWER_TARGET',
      suggested_target_value: suggestedTarget,
      message: `Turunkan target sementara ke ${suggestedTarget} ${habit.target_unit} agar momentum streak tidak putus!`,
    };
  } else {
    suggestedAction = {
      type: 'EARLY_NUDGE',
      message: `Selesaikan lebih awal siang/sore ini sebelum energimu terkuras di malam hari!`,
    };
  }

  return {
    habit_id: habit.id,
    habit_name: habit.name,
    icon: habit.icon,
    color: habit.color,
    target_value: currentTarget,
    target_unit: habit.target_unit,
    failure_probability: failurePercentage,
    risk_level: riskLevel,
    primary_factor: primaryFactor,
    factor_breakdown: {
      miss_rate_score: Math.round(x1_missRate * 100),
      weekday_vulnerability_score: Math.round(x2_weekday * 100),
      workload_score: Math.round(x3_workload * 100),
      maturity_score: Math.round(x4_maturity * 100),
      late_hour_score: Math.round(x5_lateHour * 100),
    },
    suggested_action: suggestedAction,
  };
}

/**
 * Evaluates whether a habit is mature enough for predictive churn/failure analysis.
 * New habits are granted a 7-day (1 week) grace period to establish baseline behavior
 * without triggering premature high-risk alerts.
 */
export function isHabitEligibleForPrediction(
  habit: Pick<Habit, 'created_at' | 'start_date'>,
  evaluationDate: Date = new Date()
): boolean {
  const evalDate = new Date(evaluationDate);
  evalDate.setHours(0, 0, 0, 0);

  const createdDate = habit.created_at
    ? new Date(habit.created_at)
    : parseDateString(habit.start_date);
  const createdDay = new Date(createdDate);
  createdDay.setHours(0, 0, 0, 0);

  const daysSinceCreation = Math.max(
    0,
    Math.round((evalDate.getTime() - createdDay.getTime()) / (1000 * 3600 * 24))
  );

  return daysSinceCreation >= 7;
}

