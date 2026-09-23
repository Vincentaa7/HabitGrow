// src/app/app/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardSummary } from '@/types';
import { HabitCategory } from '@/types/database';
import { HabitCard } from '@/components/habits/HabitCard';
import { TreeVisualization } from '@/components/tree/TreeVisualization';
import { HabitFormModal } from '@/components/habits/HabitFormModal';
import { StreakAlertBanner } from '@/components/habits/StreakAlertBanner';
import { getGreeting } from '@/lib/utils';
import Link from 'next/link';
import {
  Flame,
  Zap,
  Plus,
  ArrowRight,
  Trophy,
  Calendar as CalendarIcon,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['dashboard-summary'] });

      // Snapshot previous value for rollback
      const previousSummary = queryClient.getQueryData<DashboardSummary>(['dashboard-summary']);

      // Optimistically update dashboard cache immediately
      if (previousSummary) {
        const targetHabit = previousSummary.today_habits.find((h) => h.id === habitId);
        const xpEarned = targetHabit?.xp_reward || 10;
        const newCompletedCount = previousSummary.completed_count + 1;
        const newPercentage = previousSummary.total_scheduled_today > 0
          ? Math.round((newCompletedCount / previousSummary.total_scheduled_today) * 100)
          : 0;

        queryClient.setQueryData<DashboardSummary>(['dashboard-summary'], {
          ...previousSummary,
          completed_count: newCompletedCount,
          completion_percentage: newPercentage,
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
      // Rollback to previous state on failure
      if (context?.previousSummary) {
        queryClient.setQueryData(['dashboard-summary'], context.previousSummary);
      }
    },
    onSettled: () => {
      // Background re-sync to ensure exact server consistency
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-red-500 mb-4">
          {error instanceof Error ? error.message : 'Terjadi kendala saat memuat data.'}
        </p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })}
          className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl"
        >
          Muat Ulang
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

  return (
    <div className="space-y-8">
      {/* Top Greeting & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {getGreeting(profile.display_name)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Hari ini ada <strong className="text-emerald-600 dark:text-emerald-400">{total_scheduled_today}</strong> kebiasaan yang terjadwal.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition shadow-emerald-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Kebiasaan Baru
        </button>
      </div>

      {/* Broken Streak Alert Banner (Points 1 & 4) */}
      <StreakAlertBanner brokenStreaks={summary.broken_streaks} />

      {/* Gamification Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Streak Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Current Streak
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {streak.current_streak}
              </h3>
              <span className="text-xs font-medium text-slate-500">hari berturut-turut</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rekor terbaik: {streak.longest_streak} hari
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shadow-inner">
            <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
        </div>

        {/* Level & XP Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex-1 pr-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Level & Pengalaman
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Level {user_level.level}
              </h3>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {user_level.total_xp} XP Total
              </span>
            </div>
            {/* XP progress bar */}
            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${user_level.progress_percentage}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shadow-inner shrink-0">
            <Zap className="w-6 h-6 fill-emerald-500 text-emerald-500" />
          </div>
        </div>

        {/* Consistency Score Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Consistency Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {Math.round(tree.consistency_score)}%
              </h3>
              <span className="text-xs font-medium text-slate-500">skor rata-rata</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              Tahap: {tree.stage}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Layout: Habits (Left) + Tree Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Today's Progress & Habits Checklist */}
        <div className="lg:col-span-8 space-y-6">
          {/* Progress Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Progres Hari Ini
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {completed_count} dari {total_scheduled_today} kebiasaan terselesaikan
                </p>
              </div>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                {completion_percentage}%
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completion_percentage}%` }}
              />
            </div>
          </div>

          {/* Habit Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Daftar Kebiasaan Hari Ini</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {today_habits.length}
                </span>
              </h3>
              <Link
                href="/app/habits"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Kelola Semua
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {today_habits.length === 0 ? (
              /* Empty State per PRD Section 68 */
              <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-4xl">🌱</span>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-2">
                  Kebunmu sedang menanti
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  Belum ada kebiasaan yang dijadwalkan untuk hari ini. Tanam kebiasaan pertamamu dan mulai bertumbuh!
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow transition"
                >
                  Buat Kebiasaan Sekarang
                </button>
              </div>
            ) : (
              today_habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={async (id) => {
                    await completeMutation.mutateAsync(id);
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Virtual Tree Card & Recent Achievements */}
        <div className="lg:col-span-4 space-y-6">
          {/* Virtual Tree Widget */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-white to-emerald-50/40 dark:from-slate-900 dark:to-emerald-950/20 border border-emerald-100 dark:border-emerald-900/60 shadow-sm flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Pohon Virtual
              </span>
              <Link
                href="/app/tree"
                className="text-[11px] font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1"
              >
                Detail Pohon
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <TreeVisualization stage={tree.stage} health={tree.health} size="md" showStageName={true} />

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 max-w-xs">
              Pohonmu berkembang dari konsistensi harian. Pertahankan checklist untuk menjaga kesegarannya!
            </p>
          </div>

          {/* Recent Achievements Widget */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                Pencapaian Terkini
              </h4>
              <Link
                href="/app/achievements"
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Lihat Semua
              </Link>
            </div>

            {recent_achievements.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Belum ada pencapaian terbuka. Terus selesaikan habit untuk membuka trofi!
              </p>
            ) : (
              recent_achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                    🏆
                  </span>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {ach.name}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {ach.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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
