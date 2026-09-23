// src/app/app/profile/page.tsx
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardSummary } from '@/types';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
  User,
  Mail,
  Shield,
  Flame,
  Zap,
  Trees,
  Sun,
  Moon,
  Laptop,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();

  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/summary');
      const json = await res.json();
      return json.data;
    },
  });

  const exportData = () => {
    if (!summary) return;
    const blob = new Blob([JSON.stringify(summary, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitgrow-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || !summary) {
    return <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />;
  }

  const { profile, user_level, streak, tree } = summary;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-500/20">
          {profile.display_name?.charAt(0).toUpperCase() || 'H'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {profile.display_name || 'Pengguna HabitGrow'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Anggota pembangun kebiasaan positif 🌱
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 fill-emerald-500" />
              Level {user_level.level} ({user_level.total_xp} XP)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              {streak.current_streak} Hari Streak
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold">
              <Trees className="w-3.5 h-3.5" />
              {tree.stage}
            </span>
          </div>
        </div>
      </div>

      {/* Preferences & Theme Switcher (PRD Section 39 & 40) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Preferensi Tampilan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pilih tema tampilan yang paling nyaman untuk matamu.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Terang', icon: Sun },
            { id: 'dark', label: 'Gelap', icon: Moon },
            { id: 'system', label: 'Sistem', icon: Laptop },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={cn(
                  'p-4 rounded-2xl border flex flex-col items-center gap-2 font-bold text-xs transition-all',
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="w-5 h-5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Thesis Compliance & Data Export (PRD Section 112 & 113) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Ekspor Data Penelitian / Evaluasi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">
              Sesuai PRD Section 112-114 untuk evaluasi skripsi, Anda dapat mengunduh seluruh data riwayat aktivitas dalam format JSON standar.
            </p>
          </div>
        </div>

        <button
          onClick={exportData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-500" />
          Unduh Data Saya (.JSON)
        </button>
      </div>
    </div>
  );
}
