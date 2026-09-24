// src/app/app/dashboard/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardSummary } from '@/types';
import { HabitCategory } from '@/types/database';
import { HabitCard } from '@/components/habits/HabitCard';
import { TreeVisualization } from '@/components/tree/TreeVisualization';
import { HabitFormModal } from '@/components/habits/HabitFormModal';
import { StreakAlertBanner } from '@/components/habits/StreakAlertBanner';
import { PredictionAlertBanner } from '@/components/habits/PredictionAlertBanner';
import {
  formatIndonesianDate,
  formatFirstName,
  getTimeGreeting,
  cn,
} from '@/lib/utils';
import Link from 'next/link';
import {
  Flame,
  Zap,
  Plus,
  ArrowRight,
  Trophy,
  Calendar as CalendarIcon,
  Sprout,
  CheckCircle2,
  ListTodo,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

type FilterType = 'all' | 'pending' | 'completed';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  // 1. Fetch Dashboard Summary
  const { data: summary, isLoading, error } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/summary');
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Gagal memuat dashboard');
      return json.data;
    },
  });

  // 2. Fetch Categories for Modal
  const { data: categories = [] } = useQuery<HabitCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      const json = await res.json();
      return json.data || [];
    },
  });

  // 3. Complete Habit Mutation with Optimistic UI updates
  const completeMutation = useMutation({
    mutationFn: async (habitId: string) => {
      const res = await fetch(`/api/habits/${habitId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Gagal menyelesaikan kebiasaan');
      return json.data;
    },
    onMutate: async (habitId: string) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard-summary'] });
      const previousSummary = queryClient.getQueryData<DashboardSummary>(['dashboard-summary']);

      if (previousSummary) {
        const targetHabit = previousSummary.today_habits.find((h) => h.id === habitId);
        const xpEarned = targetHabit?.xp_reward || 10;
        const newCompletedCount = previousSummary.completed_count + 1;
        const newPercentage = previousSummary.total_scheduled_today > 0
          ? Math.round((newCompletedCount / previousSummary.total_scheduled_today) * 100)
          : 0;

        const isFirstCompletionToday = previousSummary.completed_count === 0;
        const newCurrentStreak = isFirstCompletionToday
          ? previousSummary.streak.current_streak + 1
          : previousSummary.streak.current_streak;

        queryClient.setQueryData<DashboardSummary>(['dashboard-summary'], {
          ...previousSummary,
          completed_count: newCompletedCount,
          completion_percentage: newPercentage,
          streak: {
            current_streak: newCurrentStreak,
            longest_streak: Math.max(previousSummary.streak.longest_streak, newCurrentStreak),
          },
          user_level: {
            ...previousSummary.user_level,
            total_xp: previousSummary.user_level.total_xp + xpEarned,
          },
          today_habits: previousSummary.today_habits.map((h) =>
            h.id === habitId
              ? {
                  ...h,
                  is_completed_today: true,
                  current_streak: h.current_streak + 1,
                }
              : h
          ),
        });
      }

      return { previousSummary };
    },
    onError: (_err, _habitId, context) => {
      if (context?.previousSummary) {
        queryClient.setQueryData(['dashboard-summary'], context.previousSummary);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  // Filtered habits memo
  const filteredHabits = useMemo(() => {
    if (!summary?.today_habits) return [];
    if (filter === 'pending') {
      return summary.today_habits.filter((h) => !h.is_completed_today);
    }
    if (filter === 'completed') {
      return summary.today_habits.filter((h) => h.is_completed_today);
    }
    return summary.today_habits;
  }, [summary?.today_habits, filter]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="lg:col-span-4 h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-10 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto my-12">
        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
          ⚠️
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Gagal Memuat Halaman
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          {error instanceof Error ? error.message : 'Terjadi kendala saat mengambil data dashboard.'}
        </p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })}
          className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-md shadow-emerald-600/20"
        >
          Coba Muat Ulang
        </button>
      </div>
    );
  }

  const {
    profile,
    today_habits,
    completed_count,
    total_scheduled_today,
    completion_percentage,
    user_level,
    streak,
    tree,
    recent_achievements,
  } = summary;

  const firstName = formatFirstName(profile.display_name);
  const timeGreeting = getTimeGreeting();
  const currentDateStr = formatIndonesianDate();
  const pendingCount = total_scheduled_today - completed_count;
  const isAllCompleted = total_scheduled_today > 0 && completed_count === total_scheduled_today;

  // Next tree evolution milestone calculation
  const stageThresholds = [
    { stage: 'Seed', min: 0, nextMin: 20, nextName: 'Tunas Baru' },
    { stage: 'Sprout', min: 20, nextMin: 40, nextName: 'Pohon Muda' },
    { stage: 'Young Tree', min: 40, nextMin: 60, nextName: 'Pohon Sehat' },
    { stage: 'Healthy Tree', min: 60, nextMin: 80, nextName: 'Pohon Dewasa' },
    { stage: 'Mature Tree', min: 80, nextMin: 100, nextName: 'Tingkat Maksimal' },
  ];
  const currentThreshold = stageThresholds.find((t) => t.stage === tree.stage) || stageThresholds[1];
  const pointsToNext = Math.max(0, Math.round(currentThreshold.nextMin - tree.consistency_score));

  return (
    <div className="space-y-6">
      {/* 1. Streamlined Executive Command Bar (Combines Greeting, 3 Core Stats, & Quick Action) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/10 via-white to-teal-500/10 dark:from-[#0f1713] dark:via-[#111a16] dark:to-[#0f1713] border border-emerald-100/90 dark:border-emerald-900/40 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Greeting & Date */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{currentDateStr}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400 dark:text-slate-600">|</span>
              <span className="text-slate-600 dark:text-slate-400">
                {isAllCompleted
                  ? 'Semua tuntas! 🎉'
                  : `${completed_count}/${total_scheduled_today} tugas selesai`}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{timeGreeting},</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                {firstName}
              </span>
              <span>🌱</span>
            </h1>
          </div>

          {/* Center/Right: 3 Compact Metric Tiles + Action Button */}
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
            {/* Stat 1: Streak */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/40">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              </div>
              <div className="min-w-0 pr-1">
                <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                  {streak.current_streak} Hari Streak
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Rekor: {streak.longest_streak} Hari
                </div>
              </div>
            </div>

            {/* Stat 2: Level & XP */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/40">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 fill-emerald-500 text-emerald-500" />
              </div>
              <div className="min-w-0 pr-1">
                <div className="text-xs font-black text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                  <span>Level {user_level.level}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {user_level.total_xp} XP
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {user_level.progress_percentage}% ke Lvl {user_level.level + 1}
                </div>
              </div>
            </div>

            {/* Stat 3: Pohon & Konsistensi */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-900/40">
              <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-600 flex items-center justify-center shrink-0">
                <Sprout className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="min-w-0 pr-1">
                <div className="text-xs font-black text-slate-900 dark:text-white leading-tight flex items-center gap-1">
                  <span>{Math.round(tree.consistency_score)}% Konsisten</span>
                </div>
                <div className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold">
                  {tree.stage} (Sehat: {tree.health}%)
                </div>
              </div>
            </div>

            {/* Action Button: Create Habit */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition hover:scale-105 active:scale-95 shrink-0 ml-auto lg:ml-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Kebiasaan</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Alert Banners (Broken Streak & Machine Learning Predictive Nudge) */}
      <div className="space-y-3">
        <StreakAlertBanner brokenStreaks={summary.broken_streaks} />
        <PredictionAlertBanner predictions={summary.at_risk_habits} />
      </div>

      {/* 3. Main Workspace: Left (Habit Hub Checklist) + Right (Sanctuary Pohon & Achievements) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Unified Habit Hub (High Density & 2-Column Responsive Grid) */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          {/* Habit Hub Header & Segment Controls */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1713] border border-slate-200/90 dark:border-[#1e2e26] shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Rencana Kebiasaan Hari Ini
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  {completed_count}/{total_scheduled_today}
                </span>
              </div>

              <Link
                href="/app/habits"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 self-start sm:self-auto"
              >
                Kelola Semua
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Compact Progress Track */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-400 text-[11px]">
                  {isAllCompleted
                    ? 'Target Harian Selesai Sempurna! 🎉'
                    : `${pendingCount} kebiasaan tersisa hari ini`}
                </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                  {completion_percentage}% Selesai
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${completion_percentage}%` }}
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 flex-wrap gap-2">
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={cn(
                    'px-3 py-1 rounded-lg transition-all',
                    filter === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  Semua ({today_habits.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('pending')}
                  className={cn(
                    'px-3 py-1 rounded-lg transition-all',
                    filter === 'pending'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  Belum Selesai ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('completed')}
                  className={cn(
                    'px-3 py-1 rounded-lg transition-all',
                    filter === 'completed'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  Selesai ({completed_count})
                </button>
              </div>

              {isAllCompleted && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-900/60">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% Tuntas
                </span>
              )}
            </div>
          </div>

          {/* Celebratory Banner when 100% completed */}
          {isAllCompleted && filter !== 'pending' && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-3">
              <span className="text-xl">🎉</span>
              <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                Seluruh target harian sudah terlaksana! Pohon virtualmu bertumbuh subur hari ini.
              </p>
            </div>
          )}

          {/* Habit Items Grid: 2 Columns on Desktop to Eliminate Vertical Scrolling! */}
          {today_habits.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#0f1713] border border-slate-200/90 dark:border-[#1e2e26] shadow-xs">
              <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-2xl">
                🌱
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Kebunmu Sedang Menanti
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Belum ada kebiasaan yang dijadwalkan untuk hari ini. Mulai dengan menanam satu kebiasaan sederhana!
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition"
              >
                Tanam Kebiasaan Pertama
              </button>
            </div>
          ) : filteredHabits.length === 0 ? (
            <div className="p-6 text-center rounded-3xl bg-white dark:bg-[#0f1713] border border-slate-200/90 dark:border-[#1e2e26] shadow-xs">
              <span className="text-2xl">✨</span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                {filter === 'pending'
                  ? 'Tidak ada kebiasaan tertunda!'
                  : 'Belum ada kebiasaan yang diselesaikan.'}
              </h4>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={async (id) => {
                    await completeMutation.mutateAsync(id);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sanctuary Pohon (Terrarium) & Recent Achievements */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-4">
          {/* Botanical Terrarium / Sanctuary Pohon */}
          <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-b from-emerald-500/10 via-white to-teal-500/10 dark:from-emerald-950/40 dark:via-[#0c1410] dark:to-[#09100d] border border-emerald-200/70 dark:border-emerald-900/50 shadow-xs flex flex-col items-center text-center">
            {/* Ambient Terrarium Glow Behind Tree */}
            <div className="absolute top-1/4 w-36 h-36 rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-2xl pointer-events-none" />

            {/* Top Card Navigation */}
            <div className="w-full flex items-center justify-between mb-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                <Sprout className="w-4 h-4" />
                Sanctuary Pohon
              </span>
              <Link
                href="/app/tree"
                className="text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition"
              >
                Detail
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Tree Visualization with Soft Halo */}
            <div className="py-1 relative">
              <TreeVisualization
                stage={tree.stage}
                health={tree.health}
                size="md"
                showStageName={true}
              />
            </div>

            {/* Tree Lifecycle Stages Progression Dots */}
            <div className="w-full mt-2 pt-3 border-t border-emerald-100/80 dark:border-emerald-950/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>Evolusi Pohon</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {tree.stage === 'Mature Tree'
                    ? 'Tahap Puncak 🌟'
                    : `+${pointsToNext}% ke ${currentThreshold.nextName}`}
                </span>
              </div>

              {/* 5-stage mini indicator dots */}
              <div className="grid grid-cols-5 gap-1.5">
                {stageThresholds.map((stg, idx) => {
                  const isCurrent = stg.stage === tree.stage;
                  const isPassed = tree.consistency_score >= stg.min;

                  return (
                    <div
                      key={stg.stage}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-300',
                        isCurrent
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 ring-2 ring-emerald-300 dark:ring-emerald-700'
                          : isPassed
                          ? 'bg-emerald-400/80 dark:bg-emerald-600'
                          : 'bg-slate-200 dark:bg-slate-800'
                      )}
                      title={`Tahap ${idx + 1}: ${stg.stage}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Direct action link to Virtual Tree Page */}
            <Link
              href="/app/tree"
              className="mt-3.5 w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Buka Kebun Virtual Lengkap</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Recent Achievements Widget */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0f1713] border border-slate-200/90 dark:border-[#1e2e26] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                Pencapaian Terkini
              </h3>
              <Link
                href="/app/achievements"
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Lihat Semua
              </Link>
            </div>

            {recent_achievements.length === 0 ? (
              <div className="py-4 text-center">
                <span className="text-xl">🏆</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Belum ada pencapaian terbuka. Terus selesaikan habit harian untuk mengoleksi trofi!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recent_achievements.slice(0, 3).map((ach) => (
                  <div
                    key={ach.id}
                    className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-900/40 transition group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-100 to-amber-50 dark:from-amber-950/80 dark:to-amber-900/40 text-amber-600 border border-amber-200/50 dark:border-amber-800/40 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform text-sm">
                      🏆
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {ach.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Habit Creation Modal */}
      <HabitFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmitSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        }}
        categories={categories}
      />
    </div>
  );
}
