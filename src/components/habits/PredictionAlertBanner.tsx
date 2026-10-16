// src/components/habits/PredictionAlertBanner.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { HabitRiskPrediction } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import { toDateString } from '@/lib/algorithms/schedule';
import { cn } from '@/lib/utils';
import {
  Leaf,
  X,
  CheckCircle2,
  Clock,
  Zap,
  Check,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface PredictionAlertBannerProps {
  predictions?: HabitRiskPrediction[];
}

export function PredictionAlertBanner({ predictions }: PredictionAlertBannerProps) {
  const queryClient = useQueryClient();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showTwoMinInfo, setShowTwoMinInfo] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSnoozed = (habitId: string) => {
    if (typeof window === 'undefined') return false;
    const snoozeTime = localStorage.getItem(`habitgrow_snooze_${habitId}`);
    if (!snoozeTime) return false;
    if (Date.now() < Number(snoozeTime)) return true;
    localStorage.removeItem(`habitgrow_snooze_${habitId}`);
    return false;
  };

  // Filter out any dismissed or snoozed predictions
  const activePredictions = (predictions || []).filter(
    (p) => !dismissedIds.has(p.habit_id) && !isSnoozed(p.habit_id)
  );

  const current = activePredictions[0];

  // Trigger smooth slide-down animation on mount or when habit changes
  useEffect(() => {
    if (!current) {
      setIsVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 80);
    return () => clearTimeout(timer);
  }, [current?.habit_id]);

  const handleDismiss = (id: string) => {
    setIsExiting(true);
    setTimeout(() => {
      setDismissedIds((prev) => new Set([...prev, id]));
      setIsExiting(false);
    }, 280);
  };

  // Early return ONLY after all hooks are declared
  if (!predictions || predictions.length === 0 || activePredictions.length === 0 || !current) {
    return null;
  }

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
        `Target "${prediction.habit_name}" disesuaikan jadi ${targetVal} ${targetUnit}. Semangat!`
      );

      // Invalidate queries so dashboard refreshes with new target
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });

      setTimeout(() => {
        handleDismiss(prediction.habit_id);
        setSuccessMessage(null);
      }, 2500);
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
        origin: { y: 0.3 },
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
        `Mantap! Langkah awal "${prediction.habit_name}" selesai. Streak & pohonmu aman!`
      );

      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['user-tree'] });

      setTimeout(() => {
        handleDismiss(prediction.habit_id);
        setSuccessMessage(null);
      }, 2500);
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
    }, 1800);
  };

  const isQuantitative = current.suggested_action.type === 'LOWER_TARGET';

  return (
    <aside
      aria-label="Pemberitahuan Rekomendasi Rutinitas"
      className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl sm:max-w-2xl px-3 sm:px-4 pointer-events-none transition-all duration-300"
    >
      <div
        className={cn(
          "pointer-events-auto relative overflow-hidden rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200/90 dark:border-[#1e293b] p-4 sm:p-5 shadow-2xl shadow-slate-900/10 dark:shadow-black/80 transition-all duration-300 ease-out transform",
          isVisible && !isExiting
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-8 scale-95"
        )}
      >
        {successMessage ? (
          <div className="flex items-center gap-2.5 py-1 text-emerald-800 dark:text-[#aff33e]">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-[#aff33e]" />
            <p className="text-xs sm:text-sm font-medium">{successMessage}</p>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3.5">
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              {/* Botanical Accent Icon */}
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-[#1e293b] text-emerald-600 dark:text-[#aff33e] flex items-center justify-center shrink-0 border border-emerald-200/70 dark:border-[#1e293b] mt-0.5">
                <Leaf className="w-4 h-4 text-emerald-600 dark:text-[#aff33e]" />
              </div>

              {/* Main Content Details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                {/* Clean Pills: Status & Indeks Risiko */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-[#aff33e]/10 text-emerald-700 dark:text-[#aff33e] text-[11px] font-semibold border border-emerald-200/60 dark:border-[#aff33e]/30">
                    Pendamping Rutinitas
                  </span>

                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#1e293b] text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200/70 dark:border-[#1e293b]">
                    Indeks Risiko: <strong className="text-amber-600 dark:text-amber-400 font-bold ml-1">{current.failure_probability}%</strong>
                  </span>
                </div>

                {/* Habit Title */}
                <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Yuk selesaikan <span className="font-extrabold text-emerald-600 dark:text-[#aff33e]">&ldquo;{current.habit_name}&rdquo;</span> hari ini
                </h4>

                {/* Friendly Recommendation Message */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-normal">
                  {current.suggested_action.message}
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
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-[#aff33e] dark:hover:bg-[#9de62e] text-white dark:text-[#0f172a] font-semibold text-xs shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {applyingId === current.habit_id ? (
                            <div className="w-3.5 h-3.5 border-2 border-white dark:border-[#0f172a] border-t-transparent rounded-full animate-spin" />
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
                          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#1e293b] hover:bg-slate-100 dark:hover:bg-[#1e293b] text-xs font-medium text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        >
                          Tetap Target Penuh
                        </button>
                      </>
                    )}

                  {/* 2. Binary / Checklist Habit Action (2-Minute Rule) */}
                  {!isQuantitative && (
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        type="button"
                        disabled={completingId === current.habit_id}
                        onClick={() => handleComplete2Min(current)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-[#aff33e] dark:hover:bg-[#9de62e] text-white dark:text-[#0f172a] font-semibold text-xs shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {completingId === current.habit_id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white dark:border-[#0f172a] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                        <span>Selesaikan Versi Ringan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSnooze1Hour(current)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#1e293b] hover:bg-slate-100 dark:hover:bg-[#1e293b] text-xs font-medium text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Nanti Saja (1 Jam)</span>
                      </button>

                      {/* Educational Interactive Button */}
                      <button
                        type="button"
                        onClick={() => setShowTwoMinInfo((prev) => !prev)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-[#aff33e] font-medium py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1e293b] transition cursor-pointer"
                        title="Pelajari Aturan 2 Menit"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span className="underline underline-offset-2">
                          {showTwoMinInfo ? 'Sembunyikan info' : 'Apa itu versi ringan?'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline Explainer Callout (Clean & Non-Intrusive) */}
                {!isQuantitative && showTwoMinInfo && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200/80 dark:border-[#1e293b] text-xs text-slate-700 dark:text-slate-200 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-[#aff33e]/10 text-emerald-600 dark:text-[#aff33e] flex items-center justify-center shrink-0 mt-0.5">
                          <Lightbulb className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">
                            Aturan 2 Menit (Metode Inisiasi Perilaku)
                          </p>
                          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            Bukan berarti tugas harus beres dalam 2 menit, melainkan <strong>mencicil langkah awal</strong> atau versi paling ringannya (misal: cukup siapkan peralatannya dulu) agar rantai kebiasaan dan pohonmu tidak terhenti.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTwoMinInfo(false)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#1e293b] transition cursor-pointer shrink-0"
                        title="Tutup penjelasan"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dismiss Icon */}
            <button
              type="button"
              onClick={() => handleDismiss(current.habit_id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1e293b] transition shrink-0 cursor-pointer mt-0.5"
              title="Tutup saran"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
