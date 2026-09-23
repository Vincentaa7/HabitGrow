// src/components/tree/TreeVisualization.tsx
'use client';

import React from 'react';
import { TreeStage } from '@/types/database';
import { cn } from '@/lib/utils';

interface TreeVisualizationProps {
  stage: TreeStage;
  health?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showStageName?: boolean;
}

export function TreeVisualization({
  stage,
  health = 100,
  size = 'md',
  className,
  showStageName = false,
}: TreeVisualizationProps) {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48 sm:w-56 sm:h-56',
    lg: 'w-64 h-64 sm:w-80 sm:h-80',
  };

  const stageLabels: Record<TreeStage, { name: string; tag: string; color: string }> = {
    Seed: { name: 'Benih (Seed)', tag: 'Level Pohon 1/5', color: 'text-amber-500' },
    Sprout: { name: 'Tunas (Sprout)', tag: 'Level Pohon 2/5', color: 'text-emerald-500' },
    'Young Tree': { name: 'Pohon Muda (Young Tree)', tag: 'Level Pohon 3/5', color: 'text-teal-500' },
    'Healthy Tree': { name: 'Pohon Sehat (Healthy Tree)', tag: 'Level Pohon 4/5', color: 'text-emerald-600' },
    'Mature Tree': { name: 'Pohon Dewasa (Mature Tree)', tag: 'Level Pohon 5/5', color: 'text-green-500' },
  };

  const currentInfo = stageLabels[stage] || stageLabels.Seed;

  return (
    <div className={cn('flex flex-col items-center justify-center select-none', className)}>
      <div className={cn('relative flex items-center justify-center', sizeClasses[size])}>
        {/* Stage 1: Seed */}
        {stage === 'Seed' && (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
            {/* Mound / Pot */}
            <ellipse cx="100" cy="165" rx="55" ry="14" fill="#78350f" opacity="0.3" />
            <path d="M50 160 C50 140 150 140 150 160 C150 178 50 178 50 160 Z" fill="#854d0e" />
            <ellipse cx="100" cy="155" rx="42" ry="8" fill="#582d0a" />
            {/* Soil details */}
            <circle cx="90" cy="154" r="2" fill="#a16207" />
            <circle cx="112" cy="156" r="2.5" fill="#a16207" />
            {/* Seed */}
            <g className="animate-leaf-pulse">
              <path
                d="M100 132 C92 142 90 152 100 152 C110 152 108 142 100 132 Z"
                fill="#ca8a04"
                stroke="#854d0e"
                strokeWidth="2"
              />
              <path d="M100 134 Q98 144 100 150" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            {/* Micro sprout hint */}
            <path
              d="M100 132 Q97 122 93 120"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              className="animate-bounce"
            />
          </svg>
        )}

        {/* Stage 2: Sprout */}
        {stage === 'Sprout' && (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
            {/* Soil */}
            <ellipse cx="100" cy="165" rx="55" ry="14" fill="#78350f" opacity="0.25" />
            <ellipse cx="100" cy="158" rx="42" ry="9" fill="#582d0a" />
            {/* Stem */}
            <path
              d="M100 158 Q98 135 101 110"
              stroke="#15803d"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Leaves */}
            <g className="animate-tree-sway">
              {/* Left Leaf */}
              <path
                d="M99 122 C80 115 75 95 95 102 C99 104 100 115 99 122 Z"
                fill="#22c55e"
                stroke="#15803d"
                strokeWidth="1.5"
              />
              {/* Right Leaf */}
              <path
                d="M101 114 C120 108 126 88 106 96 C102 98 100 108 101 114 Z"
                fill="#4ade80"
                stroke="#15803d"
                strokeWidth="1.5"
              />
              {/* Top Bud */}
              <circle cx="101" cy="107" r="4" fill="#86efac" />
            </g>
          </svg>
        )}

        {/* Stage 3: Young Tree */}
        {stage === 'Young Tree' && (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
            {/* Ground shadow */}
            <ellipse cx="100" cy="172" rx="60" ry="12" fill="#0f172a" opacity="0.15" />
            <ellipse cx="100" cy="168" rx="45" ry="7" fill="#582d0a" />
            {/* Trunk & Branches */}
            <path
              d="M93 168 L97 125 L82 108 M103 168 L99 125 L118 105 M98 125 L98 90"
              stroke="#78350f"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Foliage Clusters */}
            <g className="animate-tree-sway">
              <ellipse cx="80" cy="100" rx="18" ry="15" fill="#10b981" />
              <ellipse cx="118" cy="98" rx="20" ry="16" fill="#34d399" />
              <ellipse cx="98" cy="78" rx="26" ry="22" fill="#059669" />
              <circle cx="95" cy="72" r="14" fill="#6ee7b7" opacity="0.6" />
            </g>
          </svg>
        )}

        {/* Stage 4: Healthy Tree */}
        {stage === 'Healthy Tree' && (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
            {/* Base Mound */}
            <ellipse cx="100" cy="174" rx="70" ry="12" fill="#059669" opacity="0.2" />
            <path d="M50 175 Q100 162 150 175" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
            {/* Strong Trunk */}
            <path
              d="M89 174 C92 140 94 115 80 95 M111 174 C108 140 106 115 120 92 M100 120 L100 80"
              stroke="#582d0a"
              strokeWidth="11"
              strokeLinecap="round"
              fill="none"
            />
            {/* Canopy */}
            <g className="animate-tree-sway">
              <circle cx="70" cy="85" r="30" fill="#047857" />
              <circle cx="130" cy="82" r="32" fill="#059669" />
              <circle cx="100" cy="55" r="38" fill="#10b981" />
              <circle cx="100" cy="65" r="28" fill="#34d399" opacity="0.4" />
              {/* Little blossoms */}
              <circle cx="75" cy="75" r="3.5" fill="#fef08a" className="animate-pulse" />
              <circle cx="120" cy="70" r="3.5" fill="#fef08a" className="animate-pulse" />
              <circle cx="95" cy="45" r="4" fill="#fbcfe8" className="animate-pulse" />
            </g>
          </svg>
        )}

        {/* Stage 5: Mature Tree */}
        {stage === 'Mature Tree' && (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
            {/* Glowing Aura */}
            <circle cx="100" cy="90" r="75" fill="#10b981" opacity="0.08" className="animate-pulse" />
            {/* Base Grass Bed */}
            <ellipse cx="100" cy="176" rx="80" ry="14" fill="#047857" opacity="0.2" />
            <path d="M35 178 Q100 160 165 178" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
            {/* Ancient Majestic Trunk */}
            <path
              d="M84 176 C90 135 92 105 68 85 M116 176 C110 135 108 105 132 80 M100 115 L100 65"
              stroke="#451a03"
              strokeWidth="16"
              strokeLinecap="round"
              fill="none"
            />
            {/* Massive Canopy */}
            <g className="animate-tree-sway">
              <circle cx="60" cy="80" r="36" fill="#065f46" />
              <circle cx="140" cy="78" r="38" fill="#047857" />
              <circle cx="100" cy="48" r="46" fill="#059669" />
              <circle cx="100" cy="55" r="38" fill="#10b981" opacity="0.75" />
              <circle cx="85" cy="40" r="20" fill="#34d399" opacity="0.5" />
              {/* Golden Fruits / Star Flowers */}
              <circle cx="65" cy="70" r="4.5" fill="#fbbf24" className="animate-pulse" />
              <circle cx="135" cy="65" r="4.5" fill="#fbbf24" className="animate-pulse" />
              <circle cx="100" cy="35" r="5" fill="#f59e0b" className="animate-pulse" />
              <circle cx="80" cy="52" r="4" fill="#fbbf24" />
              <circle cx="118" cy="50" r="4.5" fill="#f59e0b" />
            </g>
          </svg>
        )}
      </div>

      {showStageName && (
        <div className="mt-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
            {currentInfo.tag}
          </span>
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base mt-1">
            {currentInfo.name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kesehatan: <strong className="text-emerald-600 dark:text-emerald-400">{health}%</strong>
          </p>
        </div>
      )}
    </div>
  );
}
