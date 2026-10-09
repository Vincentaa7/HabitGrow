// src/components/ui/BrandLogo.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  showTagline?: boolean;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <span className={cn('inline-flex items-center h-8 sm:h-9', className)}>
      {/* Light mode brand logo */}
      <img
        src="/image/habitgrow_brand_horizontal.png"
        alt="HabitGrow"
        className="h-full w-auto max-h-full object-contain select-none dark:hidden"
        loading="eager"
        decoding="async"
      />
      {/* Dark mode brand logo */}
      <img
        src="/image/habitgrow_brand_horizontal_dark.png"
        alt="HabitGrow"
        className="h-full w-auto max-h-full object-contain select-none hidden dark:block"
        loading="eager"
        decoding="async"
      />
    </span>
  );
}
