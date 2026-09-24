// src/components/ui/BrandLogo.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  showTagline?: boolean;
}

export function BrandLogo({ className, showTagline = true }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={showTagline ? "0 0 600 140" : "0 0 520 120"}
      className={cn("w-auto h-9 select-none", className)}
      fill="none"
      aria-label="HabitGrow Logo"
    >
      <defs>
        {/* Background Gradient for Icon */}
        <linearGradient id="navBrandIconBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0c1914" />
          <stop offset="100%" stopColor="#050a08" />
        </linearGradient>

        {/* Border Glow */}
        <linearGradient id="navBrandHBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0.4" />
        </linearGradient>

        {/* Sprout Stem Gradient */}
        <linearGradient id="navBrandHStemGrad" x1="0%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="60%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>

        {/* Leaves */}
        <linearGradient id="navBrandHLeaf1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="navBrandHLeaf2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Text Gradient for 'Grow' */}
        <linearGradient id="navBrandTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* Left Icon Container */}
      <g transform="translate(10, 10)">
        {/* Squircle Icon Box */}
        <rect
          x="0"
          y="0"
          width="120"
          height="120"
          rx="30"
          fill="url(#navBrandIconBgGrad)"
          stroke="url(#navBrandHBorderGrad)"
          strokeWidth="3"
        />

        {/* Mini Sprout & Crystal Foundation */}
        <polygon points="60,95 48,90 52,82 60,85" fill="#10b981" opacity="0.8" />
        <polygon points="60,95 60,85 68,82 72,90" fill="#047857" opacity="0.9" />
        <polygon points="60,85 52,82 60,75 68,82" fill="#34d399" opacity="0.95" />

        {/* Stem */}
        <path
          d="M 60,80 Q 57,65 60,52 Q 62,42 60,35"
          fill="none"
          stroke="url(#navBrandHStemGrad)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Left Leaf */}
        <path
          d="M 59,62 C 43,59 36,47 40,38 C 49,37 56,46 59,55 Z"
          fill="url(#navBrandHLeaf1)"
        />
        {/* Right Leaf */}
        <path
          d="M 61,54 C 77,50 84,37 78,29 C 69,29 63,40 61,49 Z"
          fill="url(#navBrandHLeaf2)"
        />
        {/* Top Peak Leaf */}
        <path
          d="M 60,38 C 55,30 58,22 60,20 C 62,22 65,30 60,38 Z"
          fill="#6ee7b7"
        />
      </g>

      {/* Brand Typography */}
      <text
        x="150"
        y="78"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="52"
        fontWeight="800"
        letterSpacing="-1.5"
        className="fill-slate-900 dark:fill-white transition-colors duration-200"
      >
        Habit<tspan fill="url(#navBrandTextGrad)">Grow</tspan>
      </text>

      {/* Subtitle Tagline */}
      {showTagline && (
        <text
          x="152"
          y="105"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="14"
          fontWeight="600"
          letterSpacing="2.5"
          className="fill-slate-500 dark:fill-slate-400 transition-colors duration-200"
        >
          GAMIFIED HABIT TRACKER &amp; VIRTUAL TREE
        </text>
      )}
    </svg>
  );
}
