// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function getGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  let timeStr = 'Selamat pagi';
  if (hour >= 12 && hour < 15) timeStr = 'Selamat siang';
  else if (hour >= 15 && hour < 18) timeStr = 'Selamat sore';
  else if (hour >= 18 || hour < 5) timeStr = 'Selamat malam';

  return name ? `${timeStr}, ${name} 🌱` : `${timeStr} 🌱`;
}
