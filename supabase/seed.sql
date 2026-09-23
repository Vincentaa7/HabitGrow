-- supabase/seed.sql
-- HabitGrow Deterministic Seed Data

-- 1. Initial Categories
INSERT INTO public.habit_categories (name, slug, icon, description, is_active)
VALUES
    ('Study', 'study', 'book-open', 'Belajar, membaca, kursus, dan pengembangan keilmuan', true),
    ('Health', 'health', 'heart', 'Kesehatan fisik, minum air, nutrisi, dan tidur teratur', true),
    ('Fitness', 'fitness', 'dumbbell', 'Olahraga, gym, lari, stretching, dan aktivitas fisik', true),
    ('Productivity', 'productivity', 'briefcase', 'Kerja, tugas kuliah, coding, dan manajemen waktu', true),
    ('Personal Growth', 'personal-growth', 'sparkles', 'Meditasi, journaling, refleksi, dan pengembangan diri', true),
    ('Cleaning', 'cleaning', 'sparkle', 'Merapikan kamar, bersih-bersih rumah, dan lingkungan teratur', true),
    ('Other', 'other', 'tag', 'Kebiasaan positif lainnya', true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Initial System Achievements
INSERT INTO public.achievements (name, slug, description, icon, condition_type, condition_value, xp_reward, is_active)
VALUES
    ('First Step', 'first-step', 'Selesaikan kebiasaan pertamamu', 'footprints', 'first_step', 1, 20, true),
    ('7 Day Streak', '7-day-streak', 'Pertahankan streak selama 7 scheduled occurrence berturut-turut', 'flame', 'streak_days', 7, 50, true),
    ('30 Day Streak', '30-day-streak', 'Pertahankan streak selama 30 scheduled occurrence berturut-turut', 'zap', 'streak_days', 30, 200, true),
    ('Habit Builder', '50-completions', 'Selesaikan total 50 completion', 'check-check', 'total_completions', 50, 100, true),
    ('Centurion', '100-completions', 'Selesaikan total 100 completion', 'award', 'total_completions', 100, 250, true),
    ('Consistency Champion', '80-consistency', 'Raih Consistency Score minimal 80%', 'target', 'consistency_rate', 80, 100, true),
    ('Consistency Master', '90-consistency', 'Raih Consistency Score minimal 90%', 'crown', 'consistency_rate', 90, 250, true),
    ('Healthy Tree', 'healthy-tree', 'Bawa pohon virtualmu mencapai tahap Healthy Tree', 'trees', 'tree_stage', 4, 150, true),
    ('Mature Tree', 'mature-tree', 'Bawa pohon virtualmu mencapai tahap Mature Tree yang megah', 'flower2', 'tree_stage', 5, 300, true)
ON CONFLICT (slug) DO NOTHING;
