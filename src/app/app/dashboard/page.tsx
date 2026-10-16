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
import { NotificationPermissionBanner } from '@/components/notifications/NotificationPermissionBanner';
import {
  formatIndonesianDate,
  formatFirstName,
  getTimeGreeting,
  cn,
} from '@/lib/utils';
import { toDateString } from '@/lib/algorithms/schedule';
import Link from 'next/link';
import {
  Flame,
  Zap,
  Plus,
  ArrowRight,
  Trophy,
  Calendar as CalendarIcon,
  CheckCircle2,
  ListTodo,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

type FilterType = 'all' | 'pending' | 'completed';

const ACHIEVEMENT_TRANSLATIONS: Record<string, string> = {
  '7 Day Streak': 'Streak 7 Hari',
  '3 Day Streak': 'Streak 3 Hari',
  '30 Day Streak': 'Streak 30 Hari',
  'Mature Tree': 'Pohon Dewasa',
  'Healthy Tree': 'Pohon Sehat',
  'First Habit': 'Kebiasaan Pertama',
  'Seedling Master': 'Master Tunas',
};

const STAGE_NAMES_ID: Record<string, string> = {
  Seed: 'Benih',
  Sprout: 'Tunas',
  'Young Tree': 'Pohon Muda',
  'Healthy Tree': 'Pohon Sehat',
  'Mature Tree': 'Pohon Dewasa',
};

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  // 1. Fetch Dashboard Summary
  const { data: summary, isLoading, error } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const localDate = toDateString(new Date());
      const res = await fetch(`/api/dashboard/summary?date=${localDate}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Gagal memuat dashboard');
      return json.data;
    },
    staleTime: 1000 * 30, // 30 seconds cache (avoids repeated re-fetching)
    refetchOnWindowFocus: false, // Prevents aggressive re-fetching on alt-tab
  });

  // 2. Fetch Categories for Modal
  const { data: categories = [] } = useQuery<HabitCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      const json = await res.json();
      return json.data || [];
    },
    staleTime: 1000 * 60 * 5, // Categories rarely change (5 mins cache)
    refetchOnWindowFocus: false,
  });

  // 3. Complete Habit Mutation with Optimistic UI updates
  const completeMutation = useMutation({
    mutationFn: async (habitId: string) => {
      const localDate = toDateString(new Date());
      const res = await fetch(`/api/habits/${habitId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: localDate }),
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
            ...previousSummary.streak,
            current_streak: newCurrentStreak,
          },
          user_level: {
            ...previousSummary.user_level,
            total_xp: previousSummary.user_level.total_xp + xpEarned,
          },
          today_habits: previousSummary.today_habits.map((h) =>
            h.id === habitId
              ? { ...h, is_completed_today: true, current_streak: h.current_streak + 1 }
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
      queryClient.invalidateQueries({ queryKey: ['user-tree'] });
    },
  });

  // Filter habits based on active tab
  const filteredHabits = useMemo(() => {
    if (!summary?.today_habits) return [];
    if (filter === 'completed') return summary.today_habits.filter((h) => h.is_completed_today);
    if (filter === 'pending') return summary.today_habits.filter((h) => !h.is_completed_today);
    return summary.today_habits;
  }, [summary?.today_habits, filter]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-[#1e293b]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-80 rounded-2xl bg-slate-200 dark:bg-[#1e293b]" />
          <div className="lg:col-span-4 h-80 rounded-2xl bg-slate-200 dark:bg-[#1e293b]" />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#0f172a] border border-red-200 dark:border-[#ef4444]/40 shadow-sm space-y-3">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          {error instanceof Error ? error.message : 'Gagal memuat data dashboard'}
        </p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-[#1e293b] dark:hover:bg-[#1e293b] text-xs font-semibold hover:bg-slate-800 transition"
        >
          Muat Ulang Halaman
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
    { stage: 'Seed', min: 0, nextMin: 20, nextName: 'Tunas' },
    { stage: 'Sprout', min: 20, nextMin: 40, nextName: 'Pohon Muda' },
    { stage: 'Young Tree', min: 40, nextMin: 60, nextName: 'Pohon Sehat' },
    { stage: 'Healthy Tree', min: 60, nextMin: 80, nextName: 'Pohon Dewasa' },
    { stage: 'Mature Tree', min: 80, nextMin: 100, nextName: 'Tingkat Maksimal' },
  ];
  const currentThreshold = stageThresholds.find((t) => t.stage === tree.stage) || stageThresholds[1];
  const pointsToNext = Math.max(0, Math.round(currentThreshold.nextMin - tree.consistency_score));
  const currentStageIndonesian = STAGE_NAMES_ID[tree.stage] || tree.stage;

  return (
    <div className="space-y-6">
      {/* 1. PANGGUNG POHON VIRTUAL (CENTERPIECE UTAMA DASHBOARD) */}
      <section className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-[#1e293b] p-5 sm:p-7 shadow-xs">
        {/* Top Header of the Showcase */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-[#1e293b]/80">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{currentDateStr}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {timeGreeting}, {firstName}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <Link
              href="/app/tree"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#1e293b] hover:bg-slate-50 dark:hover:bg-[#1e293b] text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
            >
              <span>Kebun Virtual</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-[#aff33e] dark:hover:bg-[#9de62e] text-white dark:text-[#0f172a] font-semibold text-xs shadow-xs transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Kebiasaan</span>
            </button>
          </div>
        </div>

        {/* Center Stage: The Living Virtual Tree with Today's Progress */}
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Virtual Tree Terrarium Showcase */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center text-center py-2">
            <div className="relative">
              <TreeVisualization
                stage={tree.stage}
                health={tree.health}
                size="md"
                showStageName={false}
              />
            </div>

            <div className="mt-3 space-y-1 w-full max-w-sm mx-auto">
              <div className="inline-flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {currentStageIndonesian}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-[#aff33e]/10 text-emerald-700 dark:text-[#aff33e] font-semibold">
                  Kesehatan: {Math.round(tree.health)}%
                </span>
              </div>

              {/* Evolution milestone bar */}
              <div className="w-full pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#94a3b8] font-medium">
                  <span>Skor Konsistensi: {Math.round(tree.consistency_score)}%</span>
                  <span className="text-emerald-600 dark:text-[#aff33e] font-semibold">
                    {tree.stage === 'Mature Tree'
                      ? 'Fase Maksimal 🌟'
                      : `+${pointsToNext}% ke ${currentThreshold.nextName}`}
                  </span>
                </div>

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
                            ? 'bg-emerald-500 dark:bg-[#aff33e] shadow-xs'
                            : isPassed
                            ? 'bg-emerald-400/70 dark:bg-[#aff33e]/50'
                            : 'bg-slate-200 dark:bg-[#1e293b]'
                        )}
                        title={`Tahap ${idx + 1}: ${STAGE_NAMES_ID[stg.stage] || stg.stage}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Metrics: Today's Completion & Tree Condition */}
          <div className="lg:col-span-5 space-y-3.5">
            {/* Today's Completion Metric */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-[#1e293b] bg-slate-50/60 dark:bg-[#1e293b]/40 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#aff33e]" />
                  <span className="font-semibold">Penyelesaian Hari Ini</span>
                </div>
                <span className="font-extrabold text-emerald-600 dark:text-[#aff33e]">
                  {completion_percentage}%
                </span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {completed_count} dari {total_scheduled_today} Selesai
              </div>
              <div className="w-full bg-slate-200 dark:bg-[#1e293b] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 dark:bg-[#aff33e] h-full rounded-full transition-all duration-300"
                  style={{ width: `${completion_percentage}%` }}
                />
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-[#1e293b] bg-slate-50/60 dark:bg-[#1e293b]/40">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Kondisi Pohon
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {isAllCompleted
                  ? 'Pohon mendapat nutrisi penuh hari ini ✨'
                  : pendingCount > 0
                  ? `${pendingCount} kebiasaan menanti untuk disiram 🌱`
                  : 'Belum ada jadwal aktif hari ini'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ALERT BANNERS (PENGINGAT & REKOMENDASI) */}
      <div className="space-y-3">
        <NotificationPermissionBanner />
        <StreakAlertBanner brokenStreaks={summary.broken_streaks} />
        <PredictionAlertBanner predictions={summary.at_risk_habits} />
      </div>

      {/* 3. MAIN WORKSPACE: KEBIASAAN HARI INI & PENCAPAIAN */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Utama (8 Kolom): Daftar Kebiasaan Hari Ini */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-[#1e293b] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-emerald-600 dark:text-[#aff33e]" />
                  <span>Daftar Kebiasaan Hari Ini</span>
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1e293b] text-slate-600 dark:text-slate-300">
                  {completed_count}/{total_scheduled_today}
                </span>
              </div>

              <Link
                href="/app/habits"
                className="text-xs font-semibold text-emerald-600 dark:text-[#aff33e] hover:underline flex items-center gap-1"
              >
                Kelola Semua
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Segment Controls Filter */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#020617] border border-slate-200/60 dark:border-[#1e293b] text-xs">
              {(
                [
                  { id: 'all', label: `Semua (${total_scheduled_today})` },
                  { id: 'pending', label: `Belum Selesai (${pendingCount})` },
                  { id: 'completed', label: `Selesai (${completed_count})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg font-medium transition text-center cursor-pointer',
                    filter === tab.id
                      ? 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-[#aff33e] font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Habit Cards Grid */}
          {today_habits.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#0f172a] border border-dashed border-slate-200 dark:border-[#1e293b] space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Belum ada kebiasaan yang dijadwalkan untuk hari ini.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 dark:bg-[#aff33e] text-white dark:text-[#0f172a] font-semibold text-xs hover:bg-emerald-500 transition"
              >
                + Tambah Kebiasaan Baru
              </button>
            </div>
          ) : filteredHabits.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-[#1e293b]">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filter === 'pending'
                  ? 'Semua kebiasaan hari ini sudah tuntas! 🎉'
                  : 'Belum ada kebiasaan yang diselesaikan hari ini.'}
              </p>
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

        {/* Kolom Pendamping (4 Kolom): Pencapaian Terkini */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-[#1e293b] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Pencapaian Terkini</span>
              </h3>
              <Link
                href="/app/achievements"
                className="text-[11px] font-semibold text-emerald-600 dark:text-[#aff33e] hover:underline"
              >
                Lihat Semua
              </Link>
            </div>

            {recent_achievements.length === 0 ? (
              <div className="py-5 text-center text-xs text-slate-500 dark:text-slate-400">
                Selesaikan kebiasaan secara konsisten untuk membuka trofi pencapaian.
              </div>
            ) : (
              <div className="space-y-2">
                {recent_achievements.slice(0, 3).map((ach) => (
                  <div
                    key={ach.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/80 dark:bg-[#1e293b]/40 border border-slate-100 dark:border-[#1e293b] transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200/50 dark:border-amber-800/40 flex items-center justify-center shrink-0 text-sm">
                      🏆
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {ACHIEVEMENT_TRANSLATIONS[ach.name] || ach.name}
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
