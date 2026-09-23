// src/components/habits/HabitCard.tsx
'use client';

import React, { useState } from 'react';
import { TodayHabitItem } from '@/types';
import confetti from 'canvas-confetti';
import { Check, Flame, Sparkles, Dumbbell, BookOpen, Heart, Briefcase, Smile, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: TodayHabitItem;
  onComplete: (habitId: string) => Promise<void>;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  'book-open': BookOpen,
  dumbbell: Dumbbell,
  heart: Heart,
  briefcase: Briefcase,
  smile: Smile,
  zap: Zap,
};

export function HabitCard({ habit, onComplete }: HabitCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(habit.is_completed_today);

  // Sync state if habit prop changes from server
  React.useEffect(() => {
    setIsCompleted(habit.is_completed_today);
  }, [habit.is_completed_today]);

  const IconComp = ICON_MAP[habit.icon] || Sparkles;

  const handleCheck = async () => {
    if (isCompleted || isLoading) return;

    // 1. OPTIMISTIC UPDATE: update visual state instantly (0ms delay)
    setIsCompleted(true);

    // 2. Trigger celebratory confetti burst immediately!
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#34d399', '#f59e0b', '#ec4899'],
    });

    try {
      setIsLoading(true);
      await onComplete(habit.id);
    } catch (error) {
      // 3. Rollback if server request fails
      setIsCompleted(false);
      console.error('Error marking habit complete:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200 shadow-sm',
        isCompleted
          ? 'bg-slate-50/60 dark:bg-[#111a16]/60 border-emerald-200/60 dark:border-emerald-900/40 opacity-90'
          : 'bg-white dark:bg-[#0f1713] border-slate-200/90 dark:border-[#1e2e26] hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md hover:-translate-y-0.5'
      )}
      style={{
        borderLeftColor: habit.color,
        borderLeftWidth: '4px',
      }}
    >
      <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0 pr-3">
        {/* Habit Icon Avatar */}
        <div
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          style={{
            backgroundColor: `${habit.color}15`,
            color: habit.color,
          }}
        >
          <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        {/* Habit Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={cn(
                'text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate transition-all',
                isCompleted && 'line-through text-slate-400 dark:text-slate-500 font-medium'
              )}
            >
              {habit.name}
            </h4>

            {habit.category_name && (
              <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1a2620] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50">
                {habit.category_name}
              </span>
            )}

            {isCompleted && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                ✓ Selesai
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="inline-flex items-center gap-1 font-medium">
              Target: <strong className="text-slate-700 dark:text-slate-300">{habit.target_value} {habit.target_unit}</strong>
            </span>

            {habit.current_streak > 0 && (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-900/40">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {habit.current_streak} hari
              </span>
            )}

            <span className="inline-flex items-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-900/40">
              +{habit.xp_reward} XP
            </span>
          </div>
        </div>
      </div>

      {/* Tactile Circular Checkmark Button */}
      <button
        type="button"
        onClick={handleCheck}
        disabled={isCompleted || isLoading}
        aria-label={`Tandai ${habit.name} selesai`}
        className={cn(
          'relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 shadow-sm',
          isCompleted
            ? 'bg-emerald-600 text-white shadow-emerald-600/20 cursor-default'
            : 'border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-transparent hover:text-emerald-500 hover:scale-105 active:scale-95'
        )}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Check className={cn('w-5 h-5 transition-transform', isCompleted ? 'scale-100 stroke-[3]' : 'scale-75')} />
        )}
      </button>
    </div>
  );
}
