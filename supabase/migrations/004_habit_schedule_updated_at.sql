-- 004_habit_schedule_updated_at.sql
-- Adds nullable `schedule_updated_at` column to existing `public.habits` table
-- (keeps schema strictly at 13 tables in 3NF).
-- Prevents retroactive phantom misses in SPK SAW, Virtual Tree, and Statistics
-- when a user expands a habit's schedule (e.g. SELECTED_DAYS -> DAILY or adding new weekdays).

ALTER TABLE public.habits
    ADD COLUMN IF NOT EXISTS schedule_updated_at DATE;
