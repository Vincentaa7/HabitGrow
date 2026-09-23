// src/components/habits/StreakAlertBanner.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { BrokenStreakInfo } from '@/types';
import { AlertTriangle, X, ArrowRight, Flame } from 'lucide-react';
import { toDateString } from '@/lib/algorithms/schedule';

interface StreakAlertBannerProps {
  brokenStreaks?: BrokenStreakInfo[];
}

export function StreakAlertBanner({ brokenStreaks }: StreakAlertBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (!brokenStreaks || brokenStreaks.length === 0) return;

    // Check if dismissed today in this session / date
    const todayStr = toDateString(new Date());
    const dismissedKey = `habitgrow_dismissed_broken_streak_${todayStr}`;
    const wasDismissed = localStorage.getItem(dismissedKey) === 'true';

    if (!wasDismissed) {
      setIsDismissed(false);
    }
  }, [brokenStreaks]);

  if (isDismissed || !brokenStreaks || brokenStreaks.length === 0) {
    return null;
  }

  const handleDismiss = () => {
    const todayStr = toDateString(new Date());
    localStorage.setItem(`habitgrow_dismissed_broken_streak_${todayStr}`, 'true');
    setIsDismissed(true);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-r from-amber-50 via-orange-50/50 to-rose-50/40 dark:from-[#1c150c] dark:via-[#19140e] dark:to-[#171010] p-4 sm:p-5 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-3">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5 flex-1">
          {/* Warning Icon badge */}
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner mt-0.5 sm:mt-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                Peringatan Streak
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Kemarin ada jadwal yang terlewat
              </span>
            </div>

            <div className="mt-1.5 space-y-1">
              {brokenStreaks.map((item) => (
                <p key={item.habit_id} className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Kebiasaan <span className="font-bold text-amber-600 dark:text-amber-400">"{item.habit_name}"</span> terputus (rekor <span className="font-bold underline">{item.lost_streak} hari</span> berturut-turut).
                </p>
              ))}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Jangan patah semangat! Membangun kebiasaan adalah maraton. Selesaikan tugas hari ini untuk menyalakan kembali apimu! 🔥
            </p>
          </div>
        </div>

        {/* Action Button & Close */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-200/50 dark:border-amber-900/40">
          <button
            onClick={handleDismiss}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition shadow-sm hover:shadow active:scale-95"
          >
            Mengerti, Siap Mulai
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Tutup pemberitahuan"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-amber-100/50 dark:hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
