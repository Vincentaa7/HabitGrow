// src/types/database.ts
// Database Entity Types matching Supabase PostgreSQL Schema

export type UserRole = 'USER' | 'ADMIN';
export type TreeStage = 'Seed' | 'Sprout' | 'Young Tree' | 'Healthy Tree' | 'Mature Tree';
export type HabitDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type FrequencyType = 'DAILY' | 'SELECTED_DAYS' | 'WEEKLY_TARGET';
export type AchievementConditionType = 'first_step' | 'streak_days' | 'total_completions' | 'consistency_rate' | 'tree_stage';
export type ActivityType =
  | 'HABIT_CREATED'
  | 'HABIT_COMPLETED'
  | 'XP_EARNED'
  | 'LEVEL_UP'
  | 'STREAK_INCREASED'
  | 'TREE_GREW'
  | 'ACHIEVEMENT_UNLOCKED';

export interface Profile {
  id: string; // references auth.users.id
  display_name: string | null;
  avatar_url: string | null;
  timezone: string;
  role: UserRole;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  difficulty: HabitDifficulty;
  frequency_type: FrequencyType;
  target_value: number;
  target_unit: string;
  start_date: string;
  end_date: string | null;
  reminder_time: string | null;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // joined fields
  category?: HabitCategory | null;
  schedules?: HabitSchedule[];
  completions?: HabitCompletion[];
  streak?: UserStreak | null;
}

export interface HabitSchedule {
  id: string;
  habit_id: string;
  day_of_week: number | null; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  specific_date: string | null;
  target_occurrences: number | null;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  completed_at: string;
  value: number;
  note: string | null;
  xp_earned: number;
  created_at: string;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  source_type: 'habit_completion' | 'achievement' | 'bonus' | string;
  source_id: string | null;
  amount: number;
  description: string | null;
  created_at: string;
}

export interface UserLevel {
  user_id: string;
  level: number;
  total_xp: number;
  updated_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  habit_id: string | null; // NULL for global streak, UUID for habit streak
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  updated_at: string;
}

export interface UserTree {
  user_id: string;
  stage: TreeStage;
  health: number; // 0 - 100
  consistency_score: number; // 0.00 - 100.00
  growth_points: number;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  condition_type: AchievementConditionType;
  condition_value: number;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  scheduled_for: string;
  sent_at: string | null;
  read_at: string | null;
  status: 'PENDING' | 'SENT' | 'READ' | 'FAILED';
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
