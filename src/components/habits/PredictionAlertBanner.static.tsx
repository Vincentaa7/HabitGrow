// src/components/habits/PredictionAlertBanner.tsx
'use client';

import React, { useState } from 'react';
import { HabitRiskPrediction } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import { toDateString } from '@/lib/algorithms/schedule';
import {
  Leaf,
  X,
  CheckCircle2,
  Clock,
  Zap,
  Check,
} from 'lucide-react';

interface PredictionAlertBannerProps {
  predictions?: HabitRiskPrediction[];
}

export function PredictionAlertBanner({ predictions }: PredictionAlertBannerProps) {
  const queryClient = useQueryClient();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!predictions || predictions.length === 0) return null;

  const isSnoozed = (habitId: string) => {
    if (typeof window === 'undefined') return false;
    const snoozeTime = localStorage.getItem(`habitgrow_snooze_${habitId}`);
    if (!snoozeTime) return false;
    if (Date.now() < Number(snoozeTime)) return true;
    localStorage.removeItem(`habitgrow_snooze_${habitId}`);
    return false;
  };

  // Filter out any dismissed or snoozed predictions
  const activePredictions = predictions.filter(
    (p) => !dismissedIds.has(p.habit_id) && !isSnoozed(p.habit_id)
  );
  if (activePredictions.length === 0) return null;

  // Show top highest risk prediction first
  const current = activePredictions[0];

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  // Quantitative: Trim target value
  const handleApplyLowerTarget = async (prediction: HabitRiskPrediction) => {
    if (!prediction.suggested_action.suggested_target_value) return;

    try {
      setApplyingId(prediction.habit_id);
      const targetVal = prediction.suggested_action.suggested_target_value;
      const targetUnit = prediction.suggested_action.suggested_target_unit || prediction.target_unit;

      const res = await fetch(`/api/habits/${prediction.habit_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_value: targetVal,
          ...(prediction.suggested_action.suggested_target_unit ? { target_unit: targetUnit } : {}),
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Gagal mengubah target');

      setSuccessMessage(
        `Target untuk "${prediction.habit_name}" disesuaikan jadi ${targetVal} ${targetUnit}. Semangat!`
      );

      // Invalidate queries so dashboard refreshes with new target
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });

      setTimeout(() => {
        handleDismiss(prediction.habit_id);
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error applying adaptive target:', err);
    } finally {
      setApplyingId(null);
    }
  };

  // Binary/Checklist: Quick 2-Minute Completion
  const handleComplete2Min = async (prediction: HabitRiskPrediction) => {
    try {
      setCompletingId(prediction.habit_id);

      // Festive celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#f59e0b'],
      });

      const res = await fetch(`/api/habits/${prediction.habit_id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: toDateString(new Date()),
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Gagal menyelesaikan kebiasaan');

      setSuccessMessage(
        `Bagus! "${prediction.habit_name}" tuntas dalam 2 menit. Streak & pohonmu aman!`
      );

      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['user-tree'] });

      setTimeout(() => {
        handleDismiss(prediction.habit_id);
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error completing habit in 2 min:', err);
    } finally {
      setCompletingId(null);
    }
  };

  // Binary/Checklist: Snooze 1 Hour
  const handleSnooze1Hour = (prediction: HabitRiskPrediction) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `habitgrow_snooze_${prediction.habit_id}`,
        String(Date.now() + 3600 * 1000)
      );
    }
    setSuccessMessage(`Pengingat untuk "${prediction.habit_name}" ditunda 1 jam.`);
    setTimeout(() => {
      handleDismiss(prediction.habit_id);
      setSuccessMessage(null);
    }, 2000);
  };

  const isQuantitative = current.suggested_action.type === 'LOWER_TARGET';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 p-4 sm:p-5 shadow-xs transition-all animate-in fade-in slide-in-from-top-2">
      {successMessage ? (
        <div className="flex items-center gap-2.5 py-1 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs sm:text-sm font-medium">{successMessage}</p>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Tasteful Botanical Accent Icon */}
            <div className="w-8 h-8 rounded-xl bg-amber-100/90 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/50 mt-0.5">
              <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>

            {/* Content Details */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[11px] font-semibold">
                  Pendamping Rutinitas
                </span>

                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Peluang terlewat: <strong className="text-amber-700 dark:text-amber-400 font-bold">{current.failure_probability}%</strong>
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Yuk selesaikan <span className="font-extrabold text-emerald-700 dark:text-emerald-400">&ldquo;{current.habit_name}&rdquo;</span> hari ini
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {current.primary_factor}. {current.suggested_action.message}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2.5 flex-wrap">
                {/* 1. Quantitative Habit Action */}
                {isQuantitative &&
                  current.suggested_action.suggested_target_value && (
                    <>
                      <button
                        type="button"
                        disabled={applyingId === current.habit_id}
                        onClick={() => handleApplyLowerTarget(current)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {applyingId === current.habit_id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 fill-current" />
                        )}
                        <span>
                          Pangkas Target Jadi {current.suggested_action.suggested_target_value}{' '}
                          {current.suggested_action.suggested_target_unit || current.target_unit}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDismiss(current.habit_id)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      >
                        Tetap Target Normal
                      </button>
                    </>
                  )}

                {/* 2. Binary / Checklist Habit Action (2-Minute Rule) */}
                {!isQuantitative && (
                  <>
                    <button
                      type="button"
                      disabled={completingId === current.habit_id}
                      onClick={() => handleComplete2Min(current)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {completingId === current.habit_id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                      <span>✓ Tandai Selesai (2 Menit)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSnooze1Hour(current)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 transition cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ingatkan Nanti (1 Jam)</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Dismiss Icon */}
          <button
            type="button"
            onClick={() => handleDismiss(current.habit_id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition shrink-0 cursor-pointer"
            title="Tutup saran"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
