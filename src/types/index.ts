// src/types/index.ts
export * from './database';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface TodayHabitItem {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  frequency_type: 'DAILY' | 'SELECTED_DAYS' | 'WEEKLY_TARGET';
  target_value: number;
  target_unit: string;
  category_name?: string;
  is_completed_today: boolean;
  today_completion_id?: string;
  current_streak: number;
  xp_reward: number;
}

export interface DashboardSummary {
  profile: {
    display_name: string | null;
    avatar_url: string | null;
  };
  today_habits: TodayHabitItem[];
  completed_count: number;
  total_scheduled_today: number;
  completion_percentage: number;
  user_level: {
    level: number;
    total_xp: number;
    current_level_xp: number;
    next_level_xp: number;
    progress_percentage: number;
  };
  streak: {
    current_streak: number;
    longest_streak: number;
  };
  tree: {
    stage: 'Seed' | 'Sprout' | 'Young Tree' | 'Healthy Tree' | 'Mature Tree';
    health: number;
    consistency_score: number;
    growth_points: number;
  };
  recent_achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked_at: string;
  }>;
  broken_streaks?: BrokenStreakInfo[];
  at_risk_habits?: HabitRiskPrediction[];
}

export interface BrokenStreakInfo {
  habit_id: string;
  habit_name: string;
  icon: string;
  color: string;
  lost_streak: number;
  missed_date: string;
}

export interface HabitRiskPrediction {
  habit_id: string;
  habit_name: string;
  icon: string;
  color: string;
  target_value: number;
  target_unit: string;
  failure_probability: number; // e.g. 78 (%)
  risk_level: 'MODERATE' | 'HIGH';
  primary_factor: string;
  factor_breakdown: {
    miss_rate_score: number;
    weekday_vulnerability_score: number;
    workload_score: number;
    maturity_score: number;
    late_hour_score: number;
  };
  suggested_action: {
    type: 'LOWER_TARGET' | 'EARLY_NUDGE' | 'CHECKLIST_2MIN';
    suggested_target_value?: number;
    suggested_target_unit?: string;
    message: string;
  };
}
