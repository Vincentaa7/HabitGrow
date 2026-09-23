// src/app/app/achievements/page.tsx
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, CheckCircle2, Lock, Sparkles, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  xp_reward: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
}

export default function AchievementsPage() {
  const { data: achievements = [], isLoading } = useQuery<AchievementItem[]>({
    queryKey: ['achievements'],
    queryFn: async () => {
      const res = await fetch('/api/achievements');
      const json = await res.json();
      return json.data || [];
    },
  });

  const unlockedCount = achievements.filter((a) => a.is_unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>Pencapaian & Trofi</span>
          <Trophy className="w-7 h-7 text-amber-500" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Buka berbagai pencapaian unik untuk mendapatkan bonus XP dan mempercepat pertumbuhan pohonmu!
        </p>
      </div>

      {/* Overview Progress Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-200/60 dark:border-amber-900/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
            🏆
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Koleksi Pencapaian
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {unlockedCount} dari {totalCount} pencapaian berhasil dibuka ({progressPercent}%)
            </p>
          </div>
        </div>

        <div className="w-full sm:w-48 bg-white dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
          <div
            className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={cn(
              'p-5 rounded-2xl border transition-all duration-200 shadow-sm flex flex-col justify-between',
              ach.is_unlocked
                ? 'bg-white dark:bg-slate-900 border-amber-200/80 dark:border-amber-900/50 hover:shadow-md'
                : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-70'
            )}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={cn(
                    'w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-inner',
                    ach.is_unlocked
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-500'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  )}
                >
                  {ach.is_unlocked ? '🏆' : <Lock className="w-5 h-5 text-slate-400" />}
                </span>

                <span
                  className={cn(
                    'text-xs font-bold px-2.5 py-1 rounded-full',
                    ach.is_unlocked
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  )}
                >
                  +{ach.xp_reward} XP
                </span>
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                {ach.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {ach.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
              {ach.is_unlocked ? (
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Terbuka
                </span>
              ) : (
                <span className="text-slate-400">Terkunci</span>
              )}

              {ach.unlocked_at && (
                <span className="text-slate-400">
                  {new Date(ach.unlocked_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
