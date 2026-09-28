// src/components/habits/PredictionAlertBanner.tsx
'use client';

import React, { useState } from 'react';
import { HabitRiskPrediction } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import { toDateString } from '@/lib/algorithms/schedule';
import {
  Brain,
  X,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
        `⚡ Target untuk "${prediction.habit_name}" berhasil disesuaikan menjadi ${targetVal} ${targetUnit}! Tetap semangat! ✨`
      );

      // Invalidate queries so dashboard refreshes with new target
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });

      setTimeout(() => {
        handleDismiss(prediction.habit_id);
        setSuccessMessage(null);
      }, 3500);
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
        particleCount: 55,
        spread: 65,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#8b5cf6'],
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
        `🌱 Luar biasa! "${prediction.habit_name}" diselesaikan dalam 2 menit. Streak aman & pohonmu tetap sehat! ✨`
      );

      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['user-tree'] });

      setTimeout(() => {
        handleDismiss(prediction.habit_id);
        setSuccessMessage(null);
      }, 3500);
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
    setSuccessMessage(`⏰ Pengingat untuk "${prediction.habit_name}" ditunda 1 jam lagi.`);
    setTimeout(() => {
      handleDismiss(prediction.habit_id);
      setSuccessMessage(null);
    }, 2000);
  };

  const isQuantitative = current.suggested_action.type === 'LOWER_TARGET';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-amber-500/10 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-amber-950/20 border border-violet-200/80 dark:border-violet-900/50 p-5 sm:p-6 shadow-sm backdrop-blur-sm transition-all animate-in fade-in slide-in-from-top-2">
      {/* Background ambient light */}
      <div className="absolute top-0 right-1/4 -mt-10 w-48 h-48 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {successMessage ? (
        <div className="flex items-center gap-3 py-1 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold">{successMessage}</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            {/* AI Predictive Badge Icon */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-violet-500/20">
              <Brain className="w-5 h-5" />
            </div>

            {/* Content Details */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 text-[10px] font-bold tracking-wider uppercase border border-violet-200/60 dark:border-violet-800/50">
                  <Sparkles className="w-3 h-3" />
                  Smart Predictive Nudge
                </span>

                <span
                  className={cn(
                    'text-[10px] font-extrabold px-2 py-0.5 rounded-full border',
                    current.risk_level === 'HIGH'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/40'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40'
                  )}
                >
                  <ShieldAlert className="w-3 h-3 inline mr-1" />
                  Risiko Terlewat: {current.failure_probability}%
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Tugas <span className="underline decoration-violet-400 font-extrabold">&ldquo;{current.habit_name}&rdquo;</span> Rawan Terlewat Hari Ini
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                {current.primary_factor}. Agar ritme dan pohonmu tetap terjaga subur, pertimbangkan rekomendasi berikut:
              </p>

              {/* Recommendation Callout Box */}
              <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-violet-200/90 dark:border-violet-800/60 flex items-start gap-2.5 shadow-xs max-w-2xl backdrop-blur-xs">
                <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-violet-900 dark:text-violet-200 mr-1.5">
                    Rekomendasi AI:
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {current.suggested_action.message}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1.5 flex items-center gap-2.5 flex-wrap">
                {/* 1. Quantitative Habit Action */}
                {isQuantitative &&
                  current.suggested_action.suggested_target_value && (
                    <>
                      <button
                        type="button"
                        disabled={applyingId === current.habit_id}
                        onClick={() => handleApplyLowerTarget(current)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {applyingId === current.habit_id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 fill-current" />
                        )}
                        <span>
                          ⚡ Pangkas Target Jadi {current.suggested_action.suggested_target_value}{' '}
                          {current.suggested_action.suggested_target_unit || current.target_unit}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDismiss(current.habit_id)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      >
                        Saya Sanggup Target Normal
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {completingId === current.habit_id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 stroke-[3]" />
                      )}
                      <span>✓ Tandai Selesai Cepat (2 Menit)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSnooze1Hour(current)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>⏰ Ingatkan 1 Jam Lagi</span>
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
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
            title="Tutup saran"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

