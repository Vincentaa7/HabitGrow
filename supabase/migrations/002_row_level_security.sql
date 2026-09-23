-- 002_row_level_security.sql
-- HabitGrow Row Level Security (RLS) & Trigger Setup

-- Enable RLS on all user tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Categories Policies (Public read for active categories, admin can manage)
CREATE POLICY "Categories are readable by all authenticated users" ON public.habit_categories
    FOR SELECT TO authenticated USING (is_active = true);

-- 3. Habits Policies
CREATE POLICY "Users can manage their own habits" ON public.habits
    FOR ALL USING (auth.uid() = user_id);

-- 4. Habit Schedules Policies (Linked through habits)
CREATE POLICY "Users can view own habit schedules" ON public.habit_schedules
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_schedules.habit_id AND habits.user_id = auth.uid())
    );

CREATE POLICY "Users can insert own habit schedules" ON public.habit_schedules
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_schedules.habit_id AND habits.user_id = auth.uid())
    );

CREATE POLICY "Users can update own habit schedules" ON public.habit_schedules
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_schedules.habit_id AND habits.user_id = auth.uid())
    );

CREATE POLICY "Users can delete own habit schedules" ON public.habit_schedules
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_schedules.habit_id AND habits.user_id = auth.uid())
    );

-- 5. Habit Completions Policies
CREATE POLICY "Users can manage their own completions" ON public.habit_completions
    FOR ALL USING (auth.uid() = user_id);

-- 6. XP Transactions Policies
CREATE POLICY "Users can view their own XP transactions" ON public.xp_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP transactions" ON public.xp_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. User Levels Policies
CREATE POLICY "Users can view their own level" ON public.user_levels
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own level" ON public.user_levels
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own level" ON public.user_levels
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. User Streaks Policies
CREATE POLICY "Users can manage their own streaks" ON public.user_streaks
    FOR ALL USING (auth.uid() = user_id);

-- 9. User Trees Policies
CREATE POLICY "Users can view their own tree" ON public.user_trees
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tree" ON public.user_trees
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tree" ON public.user_trees
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Achievements Policies (System-wide read for active achievements)
CREATE POLICY "Achievements are readable by all authenticated users" ON public.achievements
    FOR SELECT TO authenticated USING (is_active = true);

-- 11. User Achievements Policies
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own unlocked achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 12. Notifications Policies
CREATE POLICY "Users can manage their own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- 13. Activity Logs Policies
CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs" ON public.activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Automated trigger function on new user signup in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Create Profile
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );

    -- 2. Create Initial Level
    INSERT INTO public.user_levels (user_id, level, total_xp)
    VALUES (NEW.id, 1, 0);

    -- 3. Create Initial Tree State
    INSERT INTO public.user_trees (user_id, stage, health, consistency_score, growth_points)
    VALUES (NEW.id, 'Seed', 100, 0.00, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
