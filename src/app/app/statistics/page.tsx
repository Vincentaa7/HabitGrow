// src/app/app/statistics/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
  Area,
  AreaChart,
} from 'recharts';
import {
  Trophy,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  BarChart2,
  CalendarDays,
  SlidersHorizontal,
  Percent,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatisticsPage() {
  // State: Chart Model Selection ('bar' = Gambar 1, 'line' = Gambar 2)
  const [chartModel, setChartModel] = useState<'bar' | 'line'>('bar');
  // State: Time Range ('7' = Mingguan, '30' = Tren Bulanan)
  const [timeRange, setTimeRange] = useState<'7' | '30'>('7');
  // State: Toggle for showing data labels (%) directly above points (like Gambar 2)
  const [showPercentages, setShowPercentages] = useState<boolean>(true);

  // 1. Fetch Chart Overview Data (supports 7 days and 30 days)
  const { data: chartData = [], isLoading: isChartLoading } = useQuery({
    queryKey: ['analytics-overview', timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/weekly?range=${timeRange}`);
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

  if (isChartLoading || isPerfLoading) {
    return <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />;
  }

  const { items = [], bestHabit, needsAttentionHabit } = performanceData || {};

  // Summary Metrics from current chart data
  const totalCompleted = chartData.reduce((acc: number, d: any) => acc + (d.completed || 0), 0);
  const totalScheduled = chartData.reduce((acc: number, d: any) => acc + (d.scheduled || 0), 0);
  const avgConsistency = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

  // Custom Dot for Line Chart (matches Gambar 2: with red 'X' indicator when habit was missed)
  const CustomizedDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;

    if (payload.isMissed) {
      // Red dot with cross 'X' just like the handwritten 'X' in Gambar 2
      return (
        <svg x={cx - 7} y={cy - 7} width={14} height={14} viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
          <path d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    }

    return (
      <circle
        cx={cx}
        cy={cy}
        r={timeRange === '30' ? 3.5 : 4.5}
        fill="#10b981"
        stroke="#ffffff"
        strokeWidth={2}
        className="transition-all duration-150"
      />
    );
  };

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isMissed = data.isMissed;
      return (
        <div className="p-3.5 rounded-2xl bg-slate-900/95 dark:bg-[#0f1713]/95 backdrop-blur-md border border-slate-700/80 dark:border-emerald-500/20 shadow-2xl text-white text-xs space-y-2 min-w-[190px]">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
            <span className="font-bold text-slate-200">
              {data.day} <span className="text-slate-400 font-normal">({data.date})</span>
            </span>
            {isMissed ? (
              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 font-extrabold text-[10px] flex items-center gap-1">
                ✕ Terlewat
              </span>
            ) : data.completed >= data.scheduled && data.scheduled > 0 ? (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] flex items-center gap-1">
                ✓ Selesai
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-700/50 text-slate-300 font-bold text-[10px]">
                {data.percentage}%
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              Selesai:
            </span>
            <span className="font-black text-emerald-400 text-sm">{data.completed}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
              Terjadwal:
            </span>
            <span className="font-medium text-slate-300">{data.scheduled}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 text-[11px]">
            <span className="text-slate-400">Konsistensi:</span>
            <span className="font-black text-emerald-400">{data.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

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

      {/* Main Interactive Chart Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        {/* Chart Header with Interactive Selectors */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {chartModel === 'bar' ? (
                <BarChart2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              )}
              {chartModel === 'bar' ? 'Penyelesaian Kebiasaan (Diagram Batang)' : 'Fluktuasi Tren Kebiasaan (Diagram Garis)'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {chartModel === 'bar'
                ? 'Model perbandingan volume kebiasaan terjadwal vs diselesaikan (Gambar 1).'
                : 'Model fluktuasi garis kontinu dan tingkat konsistensi harian (Gambar 2).'}
            </p>
          </div>

          {/* Interactive Controls (Pilihan Model Statistik & Rentang Waktu) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* 1. Selector Model Statistik (Batang vs Garis) */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <button
                type="button"
                onClick={() => setChartModel('bar')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
                  chartModel === 'bar'
                    ? 'bg-white dark:bg-emerald-600 text-emerald-700 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
                title="Model Diagram Batang (Gambar 1)"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Batang</span>
              </button>
              <button
                type="button"
                onClick={() => setChartModel('line')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
                  chartModel === 'line'
                    ? 'bg-white dark:bg-emerald-600 text-emerald-700 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
                title="Model Diagram Garis Tren (Gambar 2)"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Garis Tren</span>
              </button>
            </div>

            {/* 2. Selector Rentang Waktu (7 Hari vs 30 Hari) */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <button
                type="button"
                onClick={() => setTimeRange('7')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
                  timeRange === '7'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                7 Hari
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('30')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
                  timeRange === '30'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                30 Hari
              </button>
            </div>

            {/* 3. Toggle Label Persentase di Atas Titik (Khusus Model Garis Tren Gambar 2) */}
            {chartModel === 'line' && (
              <button
                type="button"
                onClick={() => setShowPercentages(!showPercentages)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer',
                  showPercentages
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                )}
                title="Tampilkan nilai persentase di atas titik kurva (seperti pada sketsa Gambar 2)"
              >
                <Percent className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Label %</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Summary Metrics Row */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="text-center sm:text-left">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Selesai
            </span>
            <span className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
              {totalCompleted}
            </span>
          </div>
          <div className="text-center sm:text-left border-x border-slate-200 dark:border-slate-700/60 px-2 sm:px-4">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Terjadwal
            </span>
            <span className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-200">
              {totalScheduled}
            </span>
          </div>
          <div className="text-center sm:text-left">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Rata-rata Konsistensi
            </span>
            <span className="text-base sm:text-xl font-black text-amber-500">
              {avgConsistency}%
            </span>
          </div>
        </div>

        {/* Chart View Rendering (Bar Chart vs Line Chart) */}
        <div className="h-72 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartModel === 'bar' ? (
              /* --- MODEL 1: DIAGRAM BATANG (GAMBAR 1) --- */
              <BarChart data={chartData} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  stroke="#94a3b8"
                  fontSize={timeRange === '30' ? 10 : 12}
                  interval={timeRange === '30' ? 2 : 0}
                />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="scheduled" fill="#cbd5e1" name="Terjadwal" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="completed" fill="#10b981" name="Selesai" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            ) : (
              /* --- MODEL 2: DIAGRAM GARIS TREN (GAMBAR 2 KERTAS KOTAK-KOTAK) --- */
              <LineChart data={chartData} margin={{ top: 22, right: 16, left: -20, bottom: 0 }}>
                {/* Grid berpetak presisi seperti kertas grafik di Gambar 2 */}
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={true} horizontal={true} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  stroke="#94a3b8"
                  fontSize={timeRange === '30' ? 10 : 12}
                  interval={timeRange === '30' ? 2 : 0}
                />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                {/* Garis putus-putus untuk target terjadwal */}
                <Line
                  type="monotone"
                  dataKey="scheduled"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Terjadwal"
                />
                {/* Garis tren utama penyelesaian kebiasaan dengan titik data dan penanda missed 'X' */}
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={<CustomizedDot />}
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                  name="Selesai"
                >
                  {/* Label persentase di atas titik seperti tulisan angka di Gambar 2 */}
                  {showPercentages && (
                    <LabelList
                      dataKey="percentage"
                      position="top"
                      offset={10}
                      formatter={(val: any) => (Number(val) > 0 ? `${val}%` : '✕')}
                      style={{
                        fontSize: timeRange === '30' ? '9px' : '11px',
                        fontWeight: 'bold',
                        fill: '#10b981',
                      }}
                    />
                  )}
                </Line>
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend & Hint */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              <span>Selesai</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-300 dark:bg-slate-600 inline-block" />
              <span>Terjadwal</span>
            </div>
            {chartModel === 'line' && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-flex items-center justify-center text-white text-[9px] font-bold">
                  ✕
                </span>
                <span>Hari Terlewat (Missed)</span>
              </div>
            )}
          </div>
          <span className="italic text-[11px] text-slate-400">
            {chartModel === 'line'
              ? '💡 Titik merah ✕ menandakan kebiasaan terjadwal yang terlewat.'
              : '💡 Arahkan kursor atau sentuh batang untuk melihat detail.'}
          </span>
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
