// src/app/app/calendar/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Habit } from '@/types/database';
import { toDateString } from '@/lib/algorithms/schedule';
import { ChevronLeft, ChevronRight, Check, X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0 - 11
  const [selectedDate, setSelectedDate] = useState<string>(toDateString(today));

  // 1. Fetch all habits for scheduling evaluation
  const { data: habits = [] } = useQuery<Habit[]>({
    queryKey: ['habits-calendar'],
    queryFn: async () => {
      const res = await fetch('/api/habits');
      const json = await res.json();
      return json.data || [];
    },
  });

  // Calculate days in month
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Build grid calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    calendarDays.push(`${currentYear}-${monthStr}-${dayStr}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>Kalender Aktivitas</span>
          <CalendarIcon className="w-7 h-7 text-emerald-500" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tinjau riwayat dan konsistensi kebiasaanmu dari hari ke hari.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Month Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((dateStr, idx) => {
              if (!dateStr) {
                return <div key={`empty-${idx}`} className="h-12 sm:h-14" />;
              }

              const isSelected = selectedDate === dateStr;
              const isToday = toDateString(new Date()) === dateStr;
              const dayNumber = Number(dateStr.split('-')[2]);

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
                      : 'border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <span>{dayNumber}</span>
                  <div className="flex gap-0.5 mt-1">
                    <span className={cn('w-1 h-1 rounded-full', isSelected ? 'bg-white' : 'bg-emerald-500')} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend per PRD Section 20 */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Terjadwal / Selesai</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-emerald-500" />
              <span>Hari Ini</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span>Tidak Ada Jadwal</span>
            </div>
          </div>
        </div>

        {/* Selected Date Details (4 cols) */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Tanggal Terpilih
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                {selectedDate}
              </h3>
            </div>
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Clock className="w-5 h-5" />
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Kebiasaan Aktif
            </h4>
            {habits.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">Belum ada kebiasaan terdaftar.</p>
            ) : (
              habits.map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                    {h.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                    +{h.difficulty === 'HARD' ? 20 : h.difficulty === 'MEDIUM' ? 15 : 10} XP
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
