// src/app/app/statistics/page.tsx
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Trophy, AlertTriangle, TrendingUp, CheckCircle2, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatisticsPage() {
  // 1. Fetch Weekly Chart Data
  const { data: weeklyData = [], isLoading: isWeeklyLoading } = useQuery({
    queryKey: ['analytics-weekly'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/weekly');
      const json = await res.json();
      return json.data || [];
    },
  });

  // 2. Fetch Habit Performance Data
  const { data: performanceData, isLoading: isPerfLoading } = useQuery({
    queryKey: ['analytics-performance'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/performance');
      const json = await res.json();
      return json.data || { items: [], bestHabit: null, needsAttentionHabit: null };
    },
  });

  if (isWeeklyLoading || isPerfLoading) {
    return <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />;
  }

  const { items = [], bestHabit, needsAttentionHabit } = performanceData || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>Statistik & Analisis</span>
          <BarChart2 className="w-7 h-7 text-emerald-500" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pantau tren penyelesaian mingguan dan efektivitas kebiasaanmu secara akurat.
        </p>
      </div>

      {/* Best vs Needs Attention Highlights (PRD Section 35) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Best Habit */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Kebiasaan Terbaik
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {bestHabit ? bestHabit.name : 'Belum cukup data'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {bestHabit ? `Tingkat Konsistensi: ${bestHabit.consistencyPercentage}%` : 'Mulai selesaikan kebiasaan'}
            </p>
          </div>
        </div>

        {/* Needs Attention Habit */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Perlu Perhatian
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {needsAttentionHabit ? needsAttentionHabit.name : 'Semua berjalan baik! ✨'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {needsAttentionHabit
                ? `Konsistensi: ${needsAttentionHabit.consistencyPercentage}% (Targetkan peningkatan)`
                : 'Konsistensi seluruh kebiasaan di atas 70%'}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Completion Chart (PRD Section 34) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Penyelesaian Mingguan (Senin – Minggu)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Jumlah kebiasaan yang terjadwal vs diselesaikan setiap harinya.
          </p>
        </div>

        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="day" tickLine={false} stroke="#94a3b8" fontSize={12} />
              <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="scheduled" fill="#cbd5e1" name="Terjadwal" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#10b981" name="Selesai" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Habit Breakdown List */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Rincian Performa per Kebiasaan
        </h3>

        {items.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Belum ada kebiasaan aktif untuk dianalisis.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item: any) => (
              <div
                key={item.habitId}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {item.completed} selesai dari {item.scheduled} jadwal
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-32 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${item.consistencyPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 min-w-[45px] text-right">
                    {item.consistencyPercentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
