// src/app/app/tree/page.tsx
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardSummary } from '@/types';
import { TreeVisualization } from '@/components/tree/TreeVisualization';
import { TREE_STAGES } from '@/lib/algorithms/tree';
import { toDateString } from '@/lib/algorithms/schedule';
import { Sparkles, Heart, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TreePage() {
  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const localDate = toDateString(new Date());
      const res = await fetch(`/api/dashboard/summary?date=${localDate}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Gagal memuat pohon');
      return json.data;
    },
  });

  if (isLoading || !summary) {
    return (
      <div className="h-96 rounded-3xl bg-slate-200 dark:bg-[#1e293b] animate-pulse" />
    );
  }

  const { tree } = summary;
  const currentStageInfo = TREE_STAGES.find((s) => s.stage === tree.stage) || TREE_STAGES[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>Pohon Virtualmu</span>
          <span className="text-2xl">🌱</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kondisi pohon mencerminkan konsistensi kebiasaan yang kamu rawat setiap hari.
        </p>
      </div>

      {/* Main Tree Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white via-emerald-50/30 to-emerald-100/40 dark:from-[#0f172a] dark:via-[#020617] dark:to-[#0f172a] border border-emerald-200/80 dark:border-[#1e293b] shadow-lg text-center flex flex-col items-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-400/10 dark:bg-[#aff33e]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Tree Stage Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#1e293b] border border-emerald-200 dark:border-[#1e293b] text-xs font-bold text-emerald-700 dark:text-[#aff33e] shadow-sm mb-6">
          <Sparkles className="w-4 h-4 text-emerald-500 dark:text-[#aff33e]" />
          Tahap Saat Ini: {currentStageInfo.displayName}
        </div>

        {/* Large Tree Illustration */}
        <TreeVisualization stage={tree.stage} health={tree.health} size="lg" />

        {/* Health & Consistency Stats Bar */}
        <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-md">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#1e293b] shadow-sm">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Kesehatan Pohon
            </span>
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-red-500 dark:text-[#ef4444] fill-red-500 dark:fill-[#ef4444]" />
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {tree.health}%
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#1e293b] shadow-sm">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Skor Konsistensi
            </span>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-[#aff33e]" />
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {Math.round(tree.consistency_score)}%
              </span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-600 dark:text-slate-300 max-w-md">
          {currentStageInfo.description}
        </p>
      </div>

      {/* Evolution Roadmap */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Peta Tahap Pertumbuhan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pertahankan skor konsistensimu untuk menembus ambang batas tahap berikutnya.
          </p>
        </div>

        <div className="space-y-4">
          {TREE_STAGES.map((stageItem) => {
            const isCurrent = stageItem.stage === tree.stage;
            const isUnlocked = tree.consistency_score >= stageItem.minScore;

            return (
              <div
                key={stageItem.stage}
                className={cn(
                  'flex items-center justify-between p-4 rounded-2xl border transition-all',
                  isCurrent
                    ? 'bg-emerald-50 dark:bg-[#aff33e]/15 border-emerald-500 dark:border-[#aff33e] shadow-sm'
                    : isUnlocked
                    ? 'bg-slate-50/80 dark:bg-[#1e293b]/40 border-slate-200 dark:border-[#1e293b]'
                    : 'bg-slate-50/40 dark:bg-[#020617]/40 border-slate-200 dark:border-[#1e293b]/60 opacity-60'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center shrink-0">
                    <TreeVisualization stage={stageItem.stage} size="sm" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {stageItem.displayName}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 dark:bg-[#aff33e] text-white dark:text-[#0f172a]">
                          Tahap Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Syarat Konsistensi: {stageItem.minScore}% – {Math.floor(stageItem.maxScore)}%
                    </p>
                  </div>
                </div>

                <div>
                  {isUnlocked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-[#aff33e]" />
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">Terkunci</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
