// src/components/landing/LandingHeroShowcase.tsx
'use client';

import React, { useState } from 'react';
import { TreeVisualization } from '@/components/tree/TreeVisualization';
import { TreeStage } from '@/types/database';
import { Check, Flame, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SampleHabit {
  id: string;
  name: string;
  category: string;
  xp: number;
  streak: number;
  completed: boolean;
}

const STAGES: { stage: TreeStage; label: string; score: number; desc: string }[] = [
  { stage: 'Seed', label: 'Benih', score: 15, desc: 'Awal mula kebiasaan baru ditanam' },
  { stage: 'Sprout', label: 'Tunas', score: 35, desc: 'Mulai tumbuh dengan konsistensi 3–7 hari' },
  { stage: 'Young Tree', label: 'Pohon Muda', score: 55, desc: 'Batang kokoh terbentuk dari rutinitas teratur' },
  { stage: 'Healthy Tree', label: 'Pohon Sehat', score: 75, desc: 'Daun lebat menandakan konsistensi stabil' },
  { stage: 'Mature Tree', label: 'Pohon Dewasa', score: 92, desc: 'Puncak pertumbuhan kebiasaan berkelanjutan' },
];

const INITIAL_HABITS: SampleHabit[] = [
  { id: '1', name: 'Minum 2 Liter Air', category: 'Kesehatan', xp: 10, streak: 14, completed: true },
  { id: '2', name: 'Membaca Buku 20 Menit', category: 'Pengembangan Diri', xp: 15, streak: 8, completed: true },
  { id: '3', name: 'Olahraga Pagi 15 Menit', category: 'Kebugaran', xp: 20, streak: 5, completed: false },
];

export function LandingHeroShowcase() {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(4); // default: Mature Tree
  const [habits, setHabits] = useState<SampleHabit[]>(INITIAL_HABITS);

  const activeStage = STAGES[selectedStageIdx];

  const completedCount = habits.filter((h) => h.completed).length;
  const totalHabits = habits.length;
  const completionPercent = Math.round((completedCount / totalHabits) * 100);

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const nextCompleted = !h.completed;
          return { ...h, completed: nextCompleted };
        }
        return h;
      })
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* App Mockup Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1410] shadow-xl shadow-slate-900/5 dark:shadow-black/40 overflow-hidden">
        {/* Mockup Window Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#09100d] text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="ml-2 font-mono text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              habitgrow.app/dashboard
            </span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Simulasi Interaktif
            </span>
          </div>
        </div>

        {/* Mockup Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Left/Center: The Living Tree Centerpiece */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col items-center justify-between bg-gradient-to-b from-slate-50/50 to-white dark:from-[#0c1410] dark:to-[#080d0a]">
            {/* Stage Selector Pills */}
            <div className="w-full flex items-center justify-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
              {STAGES.map((s, idx) => {
                const isActive = idx === selectedStageIdx;
                return (
                  <button
                    key={s.stage}
                    type="button"
                    onClick={() => setSelectedStageIdx(idx)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] sm:text-xs',
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Tree Canvas */}
            <div className="py-6 sm:py-8 flex flex-col items-center">
              <TreeVisualization
                stage={activeStage.stage}
                health={100}
                size="lg"
                showStageName={false}
              />

              <div className="mt-4 text-center">
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                  <span>{activeStage.label}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    · Skor Konsistensi {activeStage.score}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  {activeStage.desc}
                </p>
              </div>
            </div>

            {/* Bottom Status Row */}
            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Pohon Berkelanjutan
              </span>
              <span>Klik fase di atas untuk melihat perubahan pohon</span>
            </div>
          </div>

          {/* Right: Daily Habit Execution Hub Mockup */}
          <div className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between bg-white dark:bg-[#0c1410]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Kebiasaan Hari Ini
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Coba centang untuk simulasi progres
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {completedCount}/{totalHabits}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-5">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>

              {/* Interactive Habit List */}
              <div className="space-y-2.5">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={cn(
                      'p-3.5 rounded-xl border transition cursor-pointer select-none flex items-center justify-between gap-3',
                      habit.completed
                        ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0',
                          habit.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                        )}
                      >
                        {habit.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <div
                          className={cn(
                            'text-xs font-semibold truncate',
                            habit.completed
                              ? 'text-slate-500 dark:text-slate-400 line-through'
                              : 'text-slate-800 dark:text-slate-200'
                          )}
                        >
                          {habit.name}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          {habit.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                        <Flame className="w-3 h-3 fill-amber-500" />
                        {habit.streak}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                        +{habit.xp} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Micro Summary Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
                Level 4 · 480 XP
              </span>
              <span>Streak Aktif: 14 Hari</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
