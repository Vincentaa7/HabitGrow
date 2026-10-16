// src/components/layout/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardSummary } from '@/types';
import { toDateString } from '@/lib/algorithms/schedule';
import {
  LayoutDashboard,
  CheckSquare,
  Trees,
  Calendar,
  BarChart3,
  Trophy,
  LogOut,
  User,
  Menu,
  X,
  ChevronRight,
  Download,
  Flame,
  Gem,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { usePwaInstall } from '@/hooks/use-pwa-install';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();

  // Fetch summary for Duolingo-style Streak & Level header stats
  const { data: summary } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const localDate = toDateString(new Date());
      const res = await fetch(`/api/dashboard/summary?date=${localDate}`);
      const json = await res.json();
      return json.data;
    },
    staleTime: 1000 * 30,
  });

  const currentStreak = summary?.streak?.current_streak ?? 0;
  const userLevel = summary?.user_level?.level ?? 1;
  const userXp = summary?.user_level?.total_xp ?? 0;

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/app/habits', label: 'Kebiasaan', icon: CheckSquare },
    { href: '/app/tree', label: 'Pohon Virtual', icon: Trees },
    { href: '/app/calendar', label: 'Kalender', icon: Calendar },
    { href: '/app/statistics', label: 'Statistik', icon: BarChart3 },
    { href: '/app/achievements', label: 'Pencapaian', icon: Trophy },
  ];

  // Primary 4 items for bottom bar (clean, non-wrapping)
  const bottomBarLinks = [
    { href: '/app/dashboard', label: 'Beranda', icon: LayoutDashboard },
    { href: '/app/habits', label: 'Kebiasaan', icon: CheckSquare },
    { href: '/app/tree', label: 'Pohon', icon: Trees },
    { href: '/app/calendar', label: 'Kalender', icon: Calendar },
  ];

  const handleLogout = async () => {
    try {
      // 1. Immediately wipe all cached user data from memory (prevents lingering data on account switch)
      queryClient.clear();
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-[#1e293b] bg-white/85 dark:bg-[#020617]/85 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link
              href="/app/dashboard"
              className="flex items-center group transition-opacity hover:opacity-95"
              title="HabitGrow Dashboard"
            >
              <BrandLogo className="h-8 sm:h-10 w-auto group-hover:scale-[1.02] transition-transform" />
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-emerald-50 dark:bg-[#1e293b] text-emerald-700 dark:text-[#aff33e] font-bold border border-transparent dark:border-[#aff33e]/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1e293b]'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4',
                        isActive ? 'text-emerald-600 dark:text-[#aff33e]' : 'text-slate-400'
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Controls: Duolingo-style Streak & Level Crystal + Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* 1. Streak Badge (Duolingo Flame style) */}
              <Link
                href="/app/calendar"
                prefetch={true}
                className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/60 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 transition active:scale-95 group shadow-xs"
                title={`Streak: ${currentStreak} Hari Beruntun (Lihat Kalender)`}
              >
                <Flame className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" />
                <span className="font-black text-xs sm:text-sm tracking-tight">
                  {currentStreak}
                </span>
              </Link>

              {/* 2. Level Crystal Badge (Duolingo Crystal style) */}
              <Link
                href="/app/tree"
                prefetch={true}
                className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900/60 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition active:scale-95 group shadow-xs"
                title={`Level ${userLevel} · Total ${userXp} XP (Lihat Pohon)`}
              >
                <Gem className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-sky-500 fill-sky-400/40 dark:fill-sky-400/50 group-hover:scale-110 transition-transform stroke-[2]" />
                <span className="font-black text-xs sm:text-sm tracking-tight flex items-center gap-0.5">
                  <span className="hidden sm:inline text-[11px] font-bold text-sky-500/80">Lvl</span>
                  <span>{userLevel}</span>
                </span>
              </Link>

              {/* Desktop Profile & Logout */}
              <div className="hidden md:flex items-center gap-2 ml-1">
                <Link
                  href="/app/profile"
                  className="p-2 rounded-xl border border-slate-200 dark:border-[#1e293b] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e293b] transition"
                  title="Profil Pengguna"
                >
                  <User className="w-4 h-4" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl border border-red-200/60 dark:border-[#ef4444]/30 text-red-600 dark:text-[#ef4444] hover:bg-red-50 dark:hover:bg-[#ef4444]/10 transition cursor-pointer"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative ml-auto w-[85%] max-w-xs h-full bg-white dark:bg-[#0f172a] border-l border-slate-200/80 dark:border-[#1e293b] shadow-2xl p-5 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-250">
            {/* Drawer Top */}
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e293b]">
                <BrandLogo className="h-8 w-auto" />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1e293b] transition cursor-pointer"
                  aria-label="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 pb-1">
                  Menu Navigasi
                </p>
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all',
                        isActive
                          ? 'bg-emerald-50 dark:bg-[#1e293b] text-emerald-700 dark:text-[#aff33e] font-bold border border-emerald-200/50 dark:border-[#aff33e]/40'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e293b]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center',
                            isActive
                              ? 'bg-emerald-600 dark:bg-[#aff33e] text-white dark:text-[#0f172a]'
                              : 'bg-slate-100 dark:bg-[#1e293b] text-slate-500 dark:text-slate-400'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#1e293b] space-y-2">
              {!isInstalled && (
                <button
                  type="button"
                  onClick={async () => {
                    if (isInstallable) {
                      await promptInstall();
                    } else {
                      alert('Untuk menginstal di HP: Ketuk ikon titik tiga di kanan atas Chrome, lalu pilih "Instal aplikasi" atau "Tambahkan ke Layar Utama".');
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-sm shadow-emerald-500/20 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white">
                      <Download className="w-4 h-4" />
                    </div>
                    <span>Instal Aplikasi ke HP</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-semibold">PWA</span>
                </button>
              )}

              <Link
                href="/app/profile"
                prefetch={true}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e293b] transition"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1e293b] flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <span>Pengaturan Profil</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-red-600 dark:text-[#ef4444] hover:bg-red-50 dark:hover:bg-[#ef4444]/10 transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-[#ef4444]/20 flex items-center justify-center text-red-600 dark:text-[#ef4444]">
                  <LogOut className="w-4 h-4" />
                </div>
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Navigasi Bawah Seluler"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-[#1e293b] px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
      >
        {bottomBarLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-medium transition active:scale-90',
                isActive
                  ? 'text-emerald-600 dark:text-[#aff33e] font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                  isActive
                    ? 'bg-emerald-100 dark:bg-[#1e293b] text-emerald-600 dark:text-[#aff33e] border border-transparent dark:border-[#aff33e]/30'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Menu Toggle Tab */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-medium transition active:scale-90 cursor-pointer',
            isMobileMenuOpen
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <div
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
              isMobileMenuOpen
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400'
            )}
          >
            <Menu className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="tracking-tight">Menu</span>
        </button>
      </nav>
    </>
  );
}
