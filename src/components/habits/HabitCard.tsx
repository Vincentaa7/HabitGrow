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

  const IconComp = ICON_MAP[habit.icon] || Sparkles;

  const handleCheck = async () => {
    if (isCompleted || isLoading) return;

    try {
      setIsLoading(true);
      await onComplete(habit.id);
      setIsCompleted(true);

      // Trigger celebratory confetti burst!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#ec4899'],
      });
    } catch (error) {
      console.error('Error marking habit complete:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md',
        isCompleted
          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 opacity-90'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
      )}
    >
      <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0 pr-3">
        {/* Habit Icon */}
        <div
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
          style={{
            backgroundColor: `${habit.color}18`,
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
                'text-base font-bold text-slate-900 dark:text-slate-100 truncate transition-all',
                isCompleted && 'line-through text-slate-400 dark:text-slate-500'
              )}
            >
              {habit.name}
            </h4>
            {habit.category_name && (
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {habit.category_name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Target: {habit.target_value} {habit.target_unit}
            </span>

            {habit.current_streak > 0 && (
              <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {habit.current_streak} hari streak
              </span>
            )}

            <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              +{habit.xp_reward} XP
            </span>
          </div>
        </div>
      </div>

      {/* Completion Checkbox */}
      <button
        type="button"
        onClick={handleCheck}
        disabled={isCompleted || isLoading}
        aria-label={`Tandai ${habit.name} selesai`}
        className={cn(
          'relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0',
          isCompleted
            ? 'bg-emerald-600 text-white shadow-md'
            : 'border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-transparent hover:text-emerald-400 active:scale-95'
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
