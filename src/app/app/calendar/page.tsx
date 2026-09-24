'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toDateString } from '@/lib/algorithms/schedule';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  CalendarDays,
  Check,
  TrendingUp,
  Leaf,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DayActivityData } from '@/app/api/calendar/activity/route';
import { TodayHabitItem } from '@/types';

const MONTH_NAMES_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
];

const FULL_MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

interface MatrixDay {
  dateStr: string;
  dateObj: Date;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  dayOfMonth: number;
  month: number;
  count: number;
  xp: number;
  level: 0 | 1 | 2 | 3 | 4;
  isToday: boolean;
  isFuture: boolean;
}

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const today = new Date();
  const todayStr = toDateString(today);
  const currentRealYear = today.getFullYear();

  const [selectedYear, setSelectedYear] = useState<number>(currentRealYear);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [viewMode, setViewMode] = useState<'matrix' | 'month'>('matrix');
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // For monthly view
  const [completingId, setCompletingId] = useState<string | null>(null);

  const handleCompleteHabit = async (habitId: string) => {
    try {
      setCompletingId(habitId);
      const res = await fetch(`/api/habits/${habitId}/complete`, { method: 'POST' });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['calendar-day-detail'] });
        queryClient.invalidateQueries({ queryKey: ['calendar-activity'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      }
    } catch (err) {
      console.error('Error completing habit from calendar:', err);
    } finally {
      setCompletingId(null);
    }
  };

  // 1. Fetch Year Activity Matrix
  const { data: activityResponse, isLoading: isActivityLoading } = useQuery<{
    success: boolean;
    data: {
      year: number;
      totalCompletions: number;
      totalXp: number;
      activeDaysCount: number;
      maxStreakInYear: number;
      activities: Record<string, DayActivityData>;
      availableYears: number[];
    };
  }>({
    queryKey: ['calendar-activity', selectedYear],
    queryFn: async () => {
      const res = await fetch(`/api/calendar/activity?year=${selectedYear}`);
      return res.json();
    },
  });

  const activityData = activityResponse?.data;
  const activitiesMap = activityData?.activities || {};
  const availableYears = activityData?.availableYears || [currentRealYear, currentRealYear - 1, currentRealYear - 2];

  // 2. Fetch Day Detail for Selected Date
  const { data: dayDetailResponse, isLoading: isDayLoading, refetch: refetchDay } = useQuery<{
    success: boolean;
    data: {
      date: string;
      items: TodayHabitItem[];
      summary: {
        totalScheduled: number;
        totalCompleted: number;
        totalXpEarned: number;
        completionRate: number;
        isNonZeroDay: boolean;
      };
    };
  }>({
    queryKey: ['calendar-day-detail', selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/calendar/day?date=${selectedDate}`);
      return res.json();
    },
  });

  const dayDetail = dayDetailResponse?.data;

  // Build 53-week Matrix for the selected year
  const { weeks, monthHeaders } = useMemo(() => {
    const isLeap = (selectedYear % 4 === 0 && selectedYear % 100 !== 0) || selectedYear % 400 === 0;
    const daysInMonths = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    const weeksList: (MatrixDay | null)[][] = [];
    let currentWeek: (MatrixDay | null)[] = [];
    const monthCols: { month: number; colIndex: number }[] = [];
    let lastMonthSeen = -1;

    // Start on Jan 1
    const jan1 = new Date(selectedYear, 0, 1);
    const startDayOfWeek = jan1.getDay(); // 0 is Sun

    // Fill initial empty days in week 0
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }

    let colIdx = 0;

    for (let m = 0; m < 12; m++) {
      const totalDays = daysInMonths[m];
      for (let d = 1; d <= totalDays; d++) {
        const dObj = new Date(selectedYear, m, d);
        const dStr = toDateString(dObj);
        const dayOfWeek = dObj.getDay();

        if (m !== lastMonthSeen) {
          monthCols.push({ month: m, colIndex: colIdx });
          lastMonthSeen = m;
        }

        const act = activitiesMap[dStr];
        const count = act?.count || 0;
        const xp = act?.xp || 0;
        const level = (act?.level ?? 0) as 0 | 1 | 2 | 3 | 4;
        const isFuture = dObj > today;

        currentWeek.push({
          dateStr: dStr,
          dateObj: dObj,
          dayOfWeek,
          dayOfMonth: d,
          month: m,
          count,
          xp,
          level,
          isToday: dStr === todayStr,
          isFuture,
        });

        // If Saturday (end of column), wrap to next week
        if (dayOfWeek === 6) {
          weeksList.push(currentWeek);
          currentWeek = [];
          colIdx++;
        }
      }
    }

    // Push trailing week if days remaining
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeksList.push(currentWeek);
    }

    return { weeks: weeksList, monthHeaders: monthCols };
  }, [selectedYear, activitiesMap, todayStr]);

  // Selected date human-readable label
  const formattedSelectedDate = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date.getDay()];
      return `${dayName}, ${d} ${FULL_MONTH_NAMES_ID[m - 1]} ${y}`;
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Monthly Calendar navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Monthly Calendar Days
  const monthCalendarDays = useMemo(() => {
    const firstDayIndex = new Date(selectedYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, currentMonth + 1, 0).getDate();
    const days: (string | null)[] = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      days.push(`${selectedYear}-${monthStr}-${dayStr}`);
    }
    return days;
  }, [selectedYear, currentMonth]);

  return (
    <div className="space-y-6">
      {/* 1. Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Kalender &amp; Matriks Pertumbuhan</span>
            <span className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Rekam jejak konsistensi kebiasaan dan kesuburan kebun virtualmu sepanjang tahun.
          </p>
        </div>

        {/* View Switcher Pill */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-[#121c17] border border-slate-200 dark:border-[#1e2e26] self-start sm:self-auto">
          <button
            onClick={() => setViewMode('matrix')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
              viewMode === 'matrix'
                ? 'bg-white dark:bg-[#1a2c23] text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Matriks 52 Minggu</span>
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
              viewMode === 'month'
                ? 'bg-white dark:bg-[#1a2c23] text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Tampilan Bulanan</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Completions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111a16] border border-slate-200 dark:border-[#1e2e26] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Checklist {selectedYear}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {activityData?.totalCompletions ?? 0}
            </span>
          </div>
        </div>

        {/* Non-Zero Days */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111a16] border border-slate-200 dark:border-[#1e2e26] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Hari Non-Zero (Disiplin)
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {activityData?.activeDaysCount ?? 0} <span className="text-xs text-slate-400 font-normal">hari</span>
            </span>
          </div>
        </div>

        {/* Total XP Earned */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111a16] border border-slate-200 dark:border-[#1e2e26] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Akumulasi XP {selectedYear}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              +{activityData?.totalXp ?? 0} <span className="text-xs text-slate-400 font-normal">XP</span>
            </span>
          </div>
        </div>

        {/* Max Streak in Year */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111a16] border border-slate-200 dark:border-[#1e2e26] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Rekor Streak Terpanjang
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {activityData?.maxStreakInYear ?? 0} <span className="text-xs text-slate-400 font-normal">hari</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Grid + Inspector Card */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT: Matrix or Month View (xl:col-span-8) */}
        <div className="xl:col-span-8 space-y-6">
          {viewMode === 'matrix' ? (
            /* ============================================================ */
            /* GITHUB-STYLE BOTANICAL CONTRIBUTION MATRIX (52 WEEKS)        */
            /* ============================================================ */
            <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0e1713] border border-slate-200 dark:border-[#1e2e26] shadow-sm space-y-5">
              {/* Matrix Topbar with Year Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1a2c23]">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>
                      {activityData?.totalCompletions ?? 0} checklist kebiasaan di tahun {selectedYear}
                    </span>
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                    Setiap kotak mewakili hari kalender. Klik untuk meninjau rincian tugas.
                  </span>
                </div>

                {/* Year Select Buttons (GitHub Style) */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  {availableYears.map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setSelectedYear(yr)}
                      className={cn(
                        'px-3 py-1 rounded-xl text-xs font-bold transition-all',
                        selectedYear === yr
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-[#15231c] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1e342a]'
                      )}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Heatmap Canvas */}
              <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-emerald-500/20">
                <div className="min-w-[780px]">
                  {/* Month Labels Bar (Absolute positioning, no truncation) */}
                  <div className="relative h-5 text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                    {monthHeaders.map((header) => (
                      <span
                        key={`month-header-${header.month}`}
                        className="absolute top-0 font-semibold text-slate-600 dark:text-slate-300 select-none whitespace-nowrap"
                        style={{ left: `calc(34px + ${header.colIndex} * 16px)` }}
                      >
                        {MONTH_NAMES_ID[header.month]}
                      </span>
                    ))}
                  </div>

                  {/* Heatmap Grid (7 rows x 53 cols) */}
                  <div className="flex gap-[3px]">
                    {/* Weekday Row Labels (Sen, Rab, Jum) */}
                    <div className="flex flex-col gap-[3px] pr-2 justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 select-none w-7 text-right">
                      <div className="h-[13px]"></div>
                      <div className="h-[13px] leading-tight">Sen</div>
                      <div className="h-[13px]"></div>
                      <div className="h-[13px] leading-tight">Rab</div>
                      <div className="h-[13px]"></div>
                      <div className="h-[13px] leading-tight">Jum</div>
                      <div className="h-[13px]"></div>
                    </div>

                    {/* Columns of Weeks */}
                    {weeks.map((week, colIdx) => (
                      <div key={`col-${colIdx}`} className="flex flex-col gap-[3px]">
                        {week.map((day, rowIdx) => {
                          if (!day) {
                            return (
                              <div
                                key={`empty-${colIdx}-${rowIdx}`}
                                className="w-[13px] h-[13px] opacity-0"
                              />
                            );
                          }

                          const isSelected = selectedDate === day.dateStr;

                          // Color based on Level (HabitGrow Botanical Theme)
                          let cellColor = 'bg-slate-100 dark:bg-[#15231c] border border-black/5 dark:border-white/5';
                          if (day.level === 1) {
                            cellColor = 'bg-emerald-200 dark:bg-[#0e4429] border border-emerald-300 dark:border-[#006d32]/60';
                          } else if (day.level === 2) {
                            cellColor = 'bg-emerald-400 dark:bg-[#006d32] border border-emerald-500 dark:border-emerald-600/60';
                          } else if (day.level === 3) {
                            cellColor = 'bg-emerald-500 dark:bg-[#26a641] border border-emerald-600 dark:border-emerald-400/60 shadow-xs shadow-emerald-500/20';
                          } else if (day.level === 4) {
                            cellColor = 'bg-teal-400 dark:bg-[#39d353] border border-teal-300 dark:border-mint-300 shadow-sm shadow-emerald-400/40 ring-1 ring-emerald-300/40';
                          }

                          return (
                            <button
                              key={day.dateStr}
                              onClick={() => setSelectedDate(day.dateStr)}
                              title={`${day.dateStr}: ${day.count} kebiasaan selesai (${day.xp} XP)`}
                              className={cn(
                                'w-[13px] h-[13px] sm:w-[14px] sm:h-[14px] rounded-[3.5px] transition-all relative group',
                                cellColor,
                                isSelected && 'ring-2 ring-emerald-500 dark:ring-emerald-400 scale-125 z-10 shadow-md',
                                day.isToday && !isSelected && 'ring-1.5 ring-emerald-500 dark:ring-emerald-400',
                                day.isFuture && 'opacity-40 cursor-default'
                              )}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Footer: Philosophy Hint + Botanical Scale Legend */}
              <div className="pt-3 border-t border-slate-100 dark:border-[#1a2c23] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Keterangan: 1 checklist cukup untuk mempertahankan Non-Zero Day 🌱</span>
                </div>

                {/* Botanical Intensity Legend (GitHub Style) */}
                <div className="flex items-center gap-1.5 select-none self-end sm:self-auto font-medium">
                  <span className="text-[11px] text-slate-400 mr-1">Kurang</span>
                  <span className="w-3 h-3 rounded-[3px] bg-slate-100 dark:bg-[#15231c] border border-black/5 dark:border-white/5" title="0 selesai" />
                  <span className="w-3 h-3 rounded-[3px] bg-emerald-200 dark:bg-[#0e4429] border border-emerald-300 dark:border-[#006d32]/60" title="1 selesai" />
                  <span className="w-3 h-3 rounded-[3px] bg-emerald-400 dark:bg-[#006d32] border border-emerald-500 dark:border-emerald-600/60" title="2-3 selesai" />
                  <span className="w-3 h-3 rounded-[3px] bg-emerald-500 dark:bg-[#26a641] border border-emerald-600 dark:border-emerald-400/60" title="4-5 selesai" />
                  <span className="w-3 h-3 rounded-[3px] bg-teal-400 dark:bg-[#39d353] border border-teal-300 dark:border-mint-300 shadow-xs" title="6+ selesai (Subur)" />
                  <span className="text-[11px] text-slate-400 ml-1">Subur</span>
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* MONTHLY CALENDAR GRID (ALTERNATIVE VIEW)                     */
            /* ============================================================ */
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e1713] border border-slate-200 dark:border-[#1e2e26] shadow-sm space-y-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {FULL_MONTH_NAMES_ID[currentMonth]} {selectedYear}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-xl border border-slate-200 dark:border-[#1e2e26] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#15231c] transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-xl border border-slate-200 dark:border-[#1e2e26] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#15231c] transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((w) => (
                  <div key={w} className="py-2">
                    {w}
                  </div>
                ))}
              </div>

              {/* Month Days */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {monthCalendarDays.map((dateStr, idx) => {
                  if (!dateStr) {
                    return <div key={`empty-month-${idx}`} className="h-12 sm:h-14" />;
                  }

                  const isSelected = selectedDate === dateStr;
                  const isToday = todayStr === dateStr;
                  const dayNumber = Number(dateStr.split('-')[2]);
                  const act = activitiesMap[dateStr];
                  const count = act?.count || 0;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={cn(
                        'h-12 sm:h-14 rounded-2xl flex flex-col items-center justify-center p-1 text-xs font-bold transition-all relative',
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-md scale-105 z-10'
                          : isToday
                          ? 'border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                          : count > 0
                          ? 'border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200'
                          : 'border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      )}
                    >
                      <span>{dayNumber}</span>
                      {count > 0 && (
                        <div className="flex gap-0.5 mt-1">
                          <span className={cn('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white' : 'bg-emerald-500')} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Selected Day Inspector Card (xl:col-span-4) */}
        <div className="xl:col-span-4 p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0e1713] border border-slate-200 dark:border-[#1e2e26] shadow-sm space-y-5">
          {/* Card Header with Formatted Date */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-[#1a2c23]">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Tinjauan Hari Terpilih
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mt-0.5">
                {formattedSelectedDate}
              </h3>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>

          {/* Day Metric Summary */}
          {isDayLoading ? (
            <div className="space-y-3">
              <div className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={cn(
                  'p-3.5 rounded-2xl border flex items-center justify-between gap-3',
                  dayDetail?.summary.isNonZeroDay
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-[#121d17] border-slate-200 dark:border-[#1e2e26] text-slate-600 dark:text-slate-400'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">
                    {dayDetail?.summary.completionRate === 100
                      ? '🌸'
                      : dayDetail?.summary.isNonZeroDay
                      ? '🌱'
                      : '🍂'}
                  </span>
                  <div>
                    <span className="text-xs font-bold block">
                      {dayDetail?.summary.completionRate === 100
                        ? 'Kebun Berbunga Sempurna!'
                        : dayDetail?.summary.isNonZeroDay
                        ? 'Hari Produktif (Non-Zero Day)'
                        : 'Belum Ada Aktivitas / Istirahat'}
                    </span>
                    <span className="text-[11px] opacity-80">
                      {dayDetail?.summary.totalCompleted ?? 0} dari {dayDetail?.summary.totalScheduled ?? 0} kebiasaan selesai
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-white dark:bg-[#1a2c23] shadow-xs">
                  +{dayDetail?.summary.totalXpEarned ?? 0} XP
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>Tingkat Penyelesaian</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {dayDetail?.summary.completionRate ?? 0}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#16231c] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${dayDetail?.summary.completionRate ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Scheduled Habits List */}
              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Daftar Kebiasaan ({dayDetail?.items.length ?? 0})
                </h4>

                {(!dayDetail?.items || dayDetail.items.length === 0) ? (
                  <p className="text-xs text-slate-400 py-4 text-center bg-slate-50 dark:bg-[#121c17] rounded-2xl border border-dashed border-slate-200 dark:border-[#1e2e26]">
                    Tidak ada kebiasaan yang terjadwal pada hari ini.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {dayDetail.items.map((habit) => {
                      const isCompletable = !habit.is_completed_today && selectedDate === todayStr;
                      const isCurrentlyCompleting = completingId === habit.id;

                      return (
                        <div
                          key={habit.id}
                          className={cn(
                            'p-3 rounded-2xl border flex items-center justify-between text-xs transition-all',
                            habit.is_completed_today
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 text-slate-800 dark:text-slate-200'
                              : 'bg-slate-50/60 dark:bg-[#121d17]/80 border-slate-200/70 dark:border-[#1e2e26] text-slate-600 dark:text-slate-400'
                          )}
                        >
                          <div className="flex items-center gap-2.5 truncate pr-2">
                            {isCompletable ? (
                              <button
                                onClick={() => handleCompleteHabit(habit.id)}
                                disabled={isCurrentlyCompleting}
                                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-emerald-500 hover:bg-emerald-500 hover:text-white text-transparent transition-all group/btn"
                                title="Klik untuk selesaikan tugas ini hari ini"
                              >
                                {isCurrentlyCompleting ? (
                                  <Loader2 className="w-3 h-3 text-emerald-600 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3 stroke-[3] group-hover/btn:text-white" />
                                )}
                              </button>
                            ) : (
                              <span
                                className={cn(
                                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white text-[10px]',
                                  habit.is_completed_today
                                    ? 'bg-emerald-500 shadow-xs'
                                    : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                                )}
                              >
                                {habit.is_completed_today && <Check className="w-3 h-3 stroke-[3]" />}
                              </span>
                            )}
                            <span
                              className={cn(
                                'font-semibold truncate',
                                habit.is_completed_today && 'line-through text-slate-400 dark:text-slate-500'
                              )}
                            >
                              {habit.name}
                            </span>
                          </div>

                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0',
                              habit.is_completed_today
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            )}
                          >
                            +{habit.xp_reward || 10} XP
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
