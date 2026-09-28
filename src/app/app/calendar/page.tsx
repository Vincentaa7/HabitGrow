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
  CalendarDays,
  Check,
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

interface MonthGridCell {
  dateStr: string;
  dayNumber: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  isPast: boolean;
  count: number;
  xp: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const today = new Date();
  const todayStr = toDateString(today);
  const currentRealYear = today.getFullYear();

  const [selectedYear, setSelectedYear] = useState<number>(currentRealYear);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
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

  // 1. Fetch Year Activity (Contains all daily activities in this year)
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

  // 2. Fetch Day Detail for Selected Date
  const { data: dayDetailResponse, isLoading: isDayLoading } = useQuery<{
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

  // Selected date human-readable label in Indonesian
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

  const handleJumpToToday = () => {
    setSelectedYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  const handleSelectDate = (dateStr: string, cellMonth: number, cellYear: number) => {
    setSelectedDate(dateStr);
    if (cellYear !== selectedYear) {
      setSelectedYear(cellYear);
    }
    if (cellMonth !== currentMonth) {
      setCurrentMonth(cellMonth);
    }
  };

  // Month Statistics Calculation
  const monthStats = useMemo(() => {
    let completions = 0;
    let activeDays = 0;
    let xp = 0;

    const daysInMonth = new Date(selectedYear, currentMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;
      const act = activitiesMap[dateStr];
      if (act && act.count > 0) {
        completions += act.count;
        activeDays += 1;
        xp += act.xp;
      }
    }

    const isCurrentMonthNow = selectedYear === today.getFullYear() && currentMonth === today.getMonth();
    const daysCounted = isCurrentMonthNow ? today.getDate() : daysInMonth;
    const consistencyRate = daysCounted > 0 ? Math.round((activeDays / daysCounted) * 100) : 0;

    return { completions, activeDays, xp, consistencyRate, daysInMonth };
  }, [selectedYear, currentMonth, activitiesMap, today]);

  // Build 7-column Calendar Grid (Senin - Minggu) with date padding
  const monthGridCells = useMemo(() => {
    const firstDay = new Date(selectedYear, currentMonth, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    // Monday-first offset: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
    const startDayOffset = (firstDayOfWeek + 6) % 7;

    const daysInCurrentMonth = new Date(selectedYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(selectedYear, currentMonth, 0).getDate();

    const cells: MonthGridCell[] = [];

    // 1. Previous month trailing days
    const prevYear = currentMonth === 0 ? selectedYear - 1 : selectedYear;
    const prevMonthNum = currentMonth === 0 ? 11 : currentMonth - 1;
    for (let i = startDayOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const mStr = String(prevMonthNum + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${prevYear}-${mStr}-${dStr}`;
      const dObj = new Date(prevYear, prevMonthNum, d);
      const act = activitiesMap[dateStr];
      cells.push({
        dateStr,
        dayNumber: d,
        month: prevMonthNum,
        year: prevYear,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isFuture: dObj > today,
        isPast: dObj < today && dateStr !== todayStr,
        count: act?.count || 0,
        xp: act?.xp || 0,
        level: (act?.level ?? 0) as 0 | 1 | 2 | 3 | 4,
      });
    }

    // 2. Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${selectedYear}-${mStr}-${dStr}`;
      const dObj = new Date(selectedYear, currentMonth, d);
      const act = activitiesMap[dateStr];
      cells.push({
        dateStr,
        dayNumber: d,
        month: currentMonth,
        year: selectedYear,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isFuture: dObj > today,
        isPast: dObj < today && dateStr !== todayStr,
        count: act?.count || 0,
        xp: act?.xp || 0,
        level: (act?.level ?? 0) as 0 | 1 | 2 | 3 | 4,
      });
    }

    // 3. Next month leading padding (fill to 35 or 42 cells)
    const totalSoFar = cells.length;
    const targetTotal = totalSoFar <= 35 ? 35 : 42;
    const nextYear = currentMonth === 11 ? selectedYear + 1 : selectedYear;
    const nextMonthNum = currentMonth === 11 ? 0 : currentMonth + 1;
    const paddingNeeded = targetTotal - totalSoFar;

    for (let d = 1; d <= paddingNeeded; d++) {
      const mStr = String(nextMonthNum + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${nextYear}-${mStr}-${dStr}`;
      const dObj = new Date(nextYear, nextMonthNum, d);
      const act = activitiesMap[dateStr];
      cells.push({
        dateStr,
        dayNumber: d,
        month: nextMonthNum,
        year: nextYear,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isFuture: dObj > today,
        isPast: dObj < today && dateStr !== todayStr,
        count: act?.count || 0,
        xp: act?.xp || 0,
        level: (act?.level ?? 0) as 0 | 1 | 2 | 3 | 4,
      });
    }

    return cells;
  }, [selectedYear, currentMonth, activitiesMap, todayStr, today]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Kalender Kebiasaan</span>
            <span className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau rutinitas harian, rekam jejak konsistensi, dan pertumbuhan kebunmu per bulan &amp; per tanggal.
          </p>
        </div>

        {/* Quick Return to Today Button */}
        <button
          onClick={handleJumpToToday}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#111a16] border border-slate-200 dark:border-[#1e2e26] text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-500/60 shadow-xs transition-all self-start sm:self-auto"
        >
          <CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Kembali ke Hari Ini</span>
        </button>
      </div>

      {/* 2. Monthly Executive Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Completions in Month */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111a16] border border-slate-200 dark:border-[#1e2e26] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Checklist {MONTH_NAMES_ID[currentMonth]}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {monthStats.completions}
            </span>
          </div>
        </div>

        {/* Non-Zero Days in Month */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111a16] border border-slate-200 dark:border-[#1e2e26] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Hari Non-Zero (Disiplin)
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {monthStats.activeDays} <span className="text-xs text-slate-400 font-normal">/ {monthStats.daysInMonth} hari</span>
            </span>
          </div>
        </div>

        {/* Monthly XP Earned */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111a16] border border-slate-200 dark:border-[#1e2e26] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Akumulasi XP {MONTH_NAMES_ID[currentMonth]}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              +{monthStats.xp} <span className="text-xs text-slate-400 font-normal">XP</span>
            </span>
          </div>
        </div>

        {/* Monthly Consistency Rate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111a16] border border-slate-200 dark:border-[#1e2e26] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Konsistensi Bulan Ini
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {monthStats.consistencyRate}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Monthly Calendar + Day Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT: Monthly Calendar Grid (xl:col-span-8) */}
        <div className="xl:col-span-8 space-y-6">
          <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0e1713] border border-slate-200 dark:border-[#1e2e26] shadow-sm space-y-5">
            {/* Topbar: Month Title & Year Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#1a2c23]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-xl border border-slate-200 dark:border-[#1e2e26] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#15231c] transition"
                    title="Bulan Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-xl border border-slate-200 dark:border-[#1e2e26] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#15231c] transition"
                    title="Bulan Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>{FULL_MONTH_NAMES_ID[currentMonth]} {selectedYear}</span>
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                    {monthStats.completions} checklist selesai &bull; {monthStats.activeDays} hari aktif
                  </span>
                </div>
              </div>

              {/* Year Navigation Controls */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#121c17] p-1 rounded-xl border border-slate-200 dark:border-[#1e2e26]">
                  <button
                    onClick={() => setSelectedYear((y) => y - 1)}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                    title="Tahun Sebelumnya"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-black px-2 text-slate-800 dark:text-slate-200">
                    {selectedYear}
                  </span>
                  <button
                    onClick={() => setSelectedYear((y) => y + 1)}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                    title="Tahun Berikutnya"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Month Selector Bar (Jan s/d Des) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-emerald-500/20">
              {MONTH_NAMES_ID.map((name, idx) => {
                const isCurrent = currentMonth === idx;
                return (
                  <button
                    key={name}
                    onClick={() => setCurrentMonth(idx)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                      isCurrent
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                        : 'bg-slate-100 dark:bg-[#15231c] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1f3329] hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    {name}
                  </button>
                );
              })}
            </div>

            {/* Weekdays Header: Senin s/d Minggu */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs font-bold uppercase tracking-wider">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((dayName, idx) => (
                <div
                  key={dayName}
                  className={cn(
                    'py-2 rounded-xl text-[11px] sm:text-xs font-extrabold',
                    idx >= 5
                      ? 'text-emerald-600/90 dark:text-emerald-400/90 bg-emerald-50/60 dark:bg-emerald-950/20'
                      : 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#121c17]'
                  )}
                >
                  <span className="hidden sm:inline">{dayName}</span>
                  <span className="sm:hidden">{['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][idx]}</span>
                </div>
              ))}
            </div>

            {/* 7-Column Days Grid (Per Tanggal) */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {monthGridCells.map((cell) => {
                const isSelected = selectedDate === cell.dateStr;

                return (
                  <button
                    key={cell.dateStr}
                    onClick={() => handleSelectDate(cell.dateStr, cell.month, cell.year)}
                    className={cn(
                      'min-h-[72px] sm:min-h-[96px] p-2 sm:p-2.5 rounded-2xl flex flex-col justify-between text-left transition-all duration-200 relative group border text-xs',
                      // Selected state
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 ring-2 ring-emerald-500 dark:ring-emerald-400 shadow-md scale-[1.02] z-10'
                        : cell.isToday
                        ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 hover:border-emerald-500 shadow-xs'
                        : cell.isCurrentMonth
                        ? 'border-slate-200/90 dark:border-[#1e2e26] bg-white dark:bg-[#111a16] hover:border-emerald-300 dark:hover:border-emerald-700/60 hover:bg-slate-50/70 dark:hover:bg-[#16231c]'
                        : 'border-slate-100 dark:border-[#16221c]/50 bg-slate-50/30 dark:bg-[#0c1411]/30 opacity-35 hover:opacity-75',
                      cell.isFuture && !isSelected && 'opacity-60'
                    )}
                  >
                    {/* Top: Day Number & Today indicator */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={cn(
                          'font-black text-xs sm:text-sm',
                          isSelected
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : cell.isToday
                            ? 'text-emerald-600 dark:text-emerald-400 font-black'
                            : cell.isCurrentMonth
                            ? 'text-slate-800 dark:text-slate-100'
                            : 'text-slate-400 dark:text-slate-600'
                        )}
                      >
                        {cell.dayNumber}
                      </span>

                      {cell.isToday && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500 text-white shadow-xs">
                          <span className="hidden sm:inline">Hari Ini</span>
                          <span className="sm:hidden">&bull;</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom: Botanical Activity Badge */}
                    <div className="mt-1 w-full">
                      {cell.count > 0 ? (
                        <div
                          className={cn(
                            'w-full py-1 px-1.5 rounded-xl flex items-center justify-between text-[10px] font-bold transition-all',
                            cell.level === 1 && 'bg-emerald-100 dark:bg-[#0e4429]/90 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-[#006d32]/60',
                            cell.level === 2 && 'bg-emerald-200/90 dark:bg-[#006d32]/90 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-600/60',
                            cell.level === 3 && 'bg-emerald-500 text-white border border-emerald-600 shadow-xs shadow-emerald-500/20',
                            cell.level === 4 && 'bg-teal-500 text-white border border-teal-400 shadow-xs shadow-teal-500/30'
                          )}
                        >
                          <div className="flex items-center gap-1 truncate">
                            <span className="text-xs">{cell.level >= 4 ? '🌸' : cell.level >= 3 ? '🌳' : cell.level >= 2 ? '🌿' : '🌱'}</span>
                            <span className="hidden md:inline truncate">{cell.count} selesai</span>
                            <span className="md:hidden">{cell.count}</span>
                          </div>
                          <span className="text-[9px] opacity-80 shrink-0 hidden lg:inline">+{cell.xp}</span>
                        </div>
                      ) : cell.isToday ? (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold italic truncate">
                          Belum selesai
                        </div>
                      ) : (
                        <div className="h-4" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Botanical Legend & Non-Zero Day Philosophy */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#1a2c23] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>
                  <strong>Filosofi Non-Zero Day:</strong> Minimal 1 checklist kebiasaan untuk menyiram pohon virtualmu 🌱
                </span>
              </div>

              <div className="flex items-center gap-1.5 select-none font-medium text-[11px] self-start lg:self-auto">
                <span className="text-slate-400 mr-1">Kurang</span>
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#15231c] border border-black/5 dark:border-white/5" title="0 selesai">
                  0
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-[#0e4429] text-emerald-800 dark:text-emerald-300 border border-emerald-200" title="1 selesai">
                  🌱 1
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-200 dark:bg-[#006d32] text-emerald-900 dark:text-white border border-emerald-300" title="2-3 selesai">
                  🌿 2-3
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-white" title="4-5 selesai">
                  🌳 4-5
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-teal-500 text-white" title="6+ selesai (Subur)">
                  🌸 6+
                </span>
                <span className="text-slate-400 ml-1">Subur</span>
              </div>
            </div>
          </div>
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
