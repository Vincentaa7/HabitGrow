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
 * Bobot Kriteria Metode Simple Additive Weighting (SAW) untuk SPK Retensi Kebiasaan:
 * W1 (30%): Tingkat Terlewat 14 Hari Terakhir (Recent Miss Rate)
 * W2 (25%): Kerentanan Historis Hari Terkait (Day-of-Week Vulnerability)
 * W3 (15%): Beban Kognitif / Kesulitan Tugas Hari Ini (Daily Workload Fatigue)
 * W4 (15%): Maturitas / Kerentanan Usia Kebiasaan (Habit Maturity & Fragility)
 * W5 (15%): Pola Penundaan Larut Malam (Late Hour Procrastination)
 * Total Bobot W = 1.00 (100%)
 */
export const SAW_WEIGHTS = {
  MISS_RATE: 0.30,
  WEEKDAY: 0.25,
  WORKLOAD: 0.15,
  MATURITY: 0.15,
  LATE_HOUR: 0.15,
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

  // --- Kriteria 1: Tingkat Terlewat dalam 14 Hari Terakhir (C1) ---
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

  const c1_missRate = past14ScheduledCount > 0 ? past14MissedCount / past14ScheduledCount : 0.0;

  // --- Kriteria 2: Kerentanan Historis Hari yang Sama (C2) ---
  let sameWeekdayScheduledCount = 0;
  let sameWeekdayMissedCount = 0;

  for (let i = 1; i <= 14; i++) {
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

  const c2_weekday =
    sameWeekdayScheduledCount > 0 ? sameWeekdayMissedCount / sameWeekdayScheduledCount : 0.0;

  // --- Kriteria 3: Beban Kognitif Harian Hari Ini (C3) ---
  // Batas normalisasi beban kognitif maksimal 16 poin kesulitan harian
  const c3_workload = Math.min(1.0, Math.max(0.0, totalDifficultyPointsToday / 16));

  // --- Kriteria 4: Maturitas & Kerentanan Usia Kebiasaan (C4) ---
  const createdDate = habit.created_at ? new Date(habit.created_at) : startDate;
  const daysSinceCreation = Math.max(
    0,
    Math.round((evalDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24))
  );

  let c4_maturity = 0.12;
  if (daysSinceCreation < 7) {
    c4_maturity = 0.85; // sangat rentan pada minggu pertama
  } else if (daysSinceCreation < 14) {
    c4_maturity = 0.65;
  } else if (daysSinceCreation < 30) {
    c4_maturity = 0.35;
  } else {
    c4_maturity = 0.12; // kebiasaan mapan (> 30 hari)
  }

  // --- Kriteria 5: Pola Penundaan Larut Malam (C5) ---
  const recentCompletions = completions.filter((c) => {
    const cDate = parseDateString(c.date);
    const diff = Math.round((evalDate.getTime() - cDate.getTime()) / (1000 * 3600 * 24));
    return diff <= 14;
  });

  let c5_lateHour = 0.15;
  if (recentCompletions.length > 0) {
    const hours = recentCompletions.map((c) => {
      const d = new Date(c.completed_at);
      return d.getHours();
    });
    const avgHour = hours.reduce((acc, h) => acc + h, 0) / hours.length;

    if (avgHour >= 22) {
      c5_lateHour = 0.85; // kecenderungan menumpuk lewat pukul 22:00
    } else if (avgHour >= 20) {
      c5_lateHour = 0.65;
    } else if (avgHour >= 16) {
      c5_lateHour = 0.40;
    } else {
      c5_lateHour = 0.15; // diselesaikan pagi / siang hari
    }
  }

  // --- Perhitungan Matriks Penjumlahan Terbobot Metode SAW (Simple Additive Weighting) ---
  // Seluruh kriteria bertipe BENEFIT (semakin tinggi nilainya, semakin tinggi kerentanan gagal)
  // V = W1*R1 + W2*R2 + W3*R3 + W4*R4 + W5*R5
  const preferenceScore =
    SAW_WEIGHTS.MISS_RATE * c1_missRate +
    SAW_WEIGHTS.WEEKDAY * c2_weekday +
    SAW_WEIGHTS.WORKLOAD * c3_workload +
    SAW_WEIGHTS.MATURITY * c4_maturity +
    SAW_WEIGHTS.LATE_HOUR * c5_lateHour;

  const failurePercentage = Math.min(99, Math.max(1, Math.round(preferenceScore * 100)));

  // Menentukan Faktor Kriteria Dominan Penyebab Risiko
  const weightedContributions = [
    { factor: `Tingkat terlewat dalam 14 hari terakhir (${Math.round(c1_missRate * 100)}%)`, weight: SAW_WEIGHTS.MISS_RATE * c1_missRate },
    { factor: `Pola historis sering terlewat setiap hari ${currentDayName}`, weight: SAW_WEIGHTS.WEEKDAY * c2_weekday },
    { factor: 'Beban kebiasaan harian cukup padat hari ini', weight: SAW_WEIGHTS.WORKLOAD * c3_workload },
    { factor: 'Kebiasaan baru masih dalam fase adaptasi rentan (< 14 hari)', weight: SAW_WEIGHTS.MATURITY * c4_maturity },
    { factor: 'Pola pengerjaan cenderung menumpuk larut malam', weight: SAW_WEIGHTS.LATE_HOUR * c5_lateHour },
  ];

  weightedContributions.sort((a, b) => b.weight - a.weight);
  const primaryFactor = weightedContributions[0].factor;

  const riskLevel: 'MODERATE' | 'HIGH' = failurePercentage >= 70 ? 'HIGH' : 'MODERATE';

  // Formulate Adaptive Action Recommendation
  const currentTarget = Number(habit.target_value) || 1;
  const currentUnit = (habit.target_unit || 'kali').trim();
  const unitLower = currentUnit.toLowerCase();
  const isHourUnit = unitLower === 'jam';
  const isLiterUnit = unitLower === 'liter' || unitLower === 'l';

  let suggestedAction: HabitRiskPrediction['suggested_action'];

  // Case 1: Quantitative habit (e.g. Push up 20x, Baca 30 Halaman, Olahraga 30 Menit, Belajar 1 Jam, Minum Air 1 Liter)
  if (currentTarget > 1 || isHourUnit || isLiterUnit) {
    let suggestedTarget: number;
    let suggestedUnit = currentUnit;

    if (isHourUnit && currentTarget === 1) {
      // Smart unit conversion: 1 Jam -> 30 Menit
      suggestedTarget = 30;
      suggestedUnit = 'menit';
    } else if (isLiterUnit && currentTarget === 1) {
      // Smart unit conversion: 1 Liter -> 500 ml
      suggestedTarget = 500;
      suggestedUnit = 'ml';
    } else {
      suggestedTarget = Math.max(1, Math.floor(currentTarget * 0.5));
    }

    suggestedAction = {
      type: 'LOWER_TARGET',
      suggested_target_value: suggestedTarget,
      suggested_target_unit: suggestedUnit,
      message: `Beban hari ini terdeteksi tinggi. Amankan streak dengan memangkas target menjadi ${suggestedTarget} ${suggestedUnit}.`,
    };
  } else {
    // Case 2: Binary / Checklist habit (e.g. Siram Tanaman, Minum Vitamin)
    // Applies Atomic Habits 2-Minute Rule
    suggestedAction = {
      type: 'CHECKLIST_2MIN',
      message: `${habit.name} biasanya rawan terlewat di hari ${currentDayName}. Gunakan prinsip 2 menit: lakukan versi teringan sekarang agar pohon virtualmu tidak kekurangan nutrisi.`,
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
      miss_rate_score: Math.round(c1_missRate * 100),
      weekday_vulnerability_score: Math.round(c2_weekday * 100),
      workload_score: Math.round(c3_workload * 100),
      maturity_score: Math.round(c4_maturity * 100),
      late_hour_score: Math.round(c5_lateHour * 100),
    },
    suggested_action: suggestedAction,
  };
}

/**
 * Evaluates whether a habit is mature enough for predictive churn/failure analysis.
 * New habits are granted a 14-day (2-week) baseline grace period to establish consistent behavior,
 * capture at least 2 full calendar cycles, and eliminate small sample noise before triggering
 * predictive early-warning alerts.
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

  return daysSinceCreation >= 14;
}

