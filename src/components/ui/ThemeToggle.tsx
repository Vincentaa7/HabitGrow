// src/components/ui/ThemeToggle.tsx
'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      className={cn(
        'relative flex items-center justify-center rounded-xl border transition-all duration-200 active:scale-95',
        size === 'sm'
          ? 'w-8 h-8'
          : 'w-9 h-9',
        isDark
          ? 'border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700 hover:border-slate-600'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
        className
      )}
    >
      <span className={cn('transition-all duration-300', isDark ? 'rotate-0 scale-100' : 'rotate-90 scale-0 absolute')}>
        <Sun className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      </span>
      <span className={cn('transition-all duration-300', !isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0 absolute')}>
        <Moon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      </span>
    </button>
  );
}
