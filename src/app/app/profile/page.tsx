// src/app/app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardSummary } from '@/types';
import { toDateString } from '@/lib/algorithms/schedule';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
  User,
  Mail,
  Shield,
  Flame,
  Zap,
  Trees,
  Sun,
  Moon,
  Laptop,
  Download,
  Bell,
  BellRing,
  Send,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBrowserNotifications } from '@/hooks/use-browser-notifications';
import { usePwaInstall } from '@/hooks/use-pwa-install';

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const {
    isSupported,
    isPushSupported,
    permission,
    isPushSubscribed,
    isRequesting,
    subscribeToPush,
    sendServerTestPush,
    triggerSmartReminders,
    sendTestNotification,
  } = useBrowserNotifications();

  const [testSent, setTestSent] = useState(false);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);
  const [pushCountdown, setPushCountdown] = useState<number>(0);
  const [isSendingPush, setIsSendingPush] = useState<boolean>(false);
  const [isEvaluatingSaw, setIsEvaluatingSaw] = useState<boolean>(false);

  // Countdown timer effect
  useEffect(() => {
    if (pushCountdown <= 0) return;
    const timer = setTimeout(() => {
      setPushCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [pushCountdown]);

  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const localDate = toDateString(new Date());
      const res = await fetch(`/api/dashboard/summary?date=${localDate}`);
      const json = await res.json();
      return json.data;
    },
  });

  const exportData = () => {
    if (!summary) return;
    const blob = new Blob([JSON.stringify(summary, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitgrow-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTestLockScreenPush = async (delaySeconds: number = 5) => {
    setIsSendingPush(true);
    setPushCountdown(delaySeconds);
    setPushStatusMessage(
      `📱 Mengirim Web Push dalam ${delaySeconds} detik! Kunci layar ponsel Anda sekarang atau tutup aplikasi untuk menguji push latar belakang.`
    );

    try {
      const res = await sendServerTestPush(delaySeconds);
      if (res.success) {
        setPushStatusMessage('✨ Notifikasi Web Push berhasil dikirim ke perangkat Anda!');
      } else {
        setPushStatusMessage(`⚠️ ${res.message || 'Gagal mengirim push notifikasi'}`);
      }
    } catch {
      setPushStatusMessage('⚠️ Terjadi kendala koneksi ke server.');
    } finally {
      setIsSendingPush(false);
      setTimeout(() => {
        setPushStatusMessage(null);
      }, 7000);
    }
  };

  const handleTriggerSawEvaluation = async () => {
    setIsEvaluatingSaw(true);
    setPushStatusMessage('🔍 Menghitung matriks SAW & mengevaluasi kebiasaan berisiko...');
    try {
      const res = await triggerSmartReminders();
      if (res.success) {
        setPushStatusMessage(`✅ ${res.message} (Push terkirim: ${res.dispatched})`);
      } else {
        setPushStatusMessage(`⚠️ ${res.message}`);
      }
    } catch {
      setPushStatusMessage('⚠️ Gagal memproses evaluasi SPK.');
    } finally {
      setIsEvaluatingSaw(false);
      setTimeout(() => {
        setPushStatusMessage(null);
      }, 6000);
    }
  };

  if (isLoading || !summary) {
    return <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />;
  }

  const { profile, user_level, streak, tree } = summary;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-500/20">
          {profile.display_name?.charAt(0).toUpperCase() || 'H'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {profile.display_name || 'Pengguna HabitGrow'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Anggota pembangun kebiasaan positif 🌱
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 fill-emerald-500" />
              Level {user_level.level} ({user_level.total_xp} XP)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              {streak.current_streak} Hari Streak
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold">
              <Trees className="w-3.5 h-3.5" />
              {tree.stage}
            </span>
          </div>
        </div>
      </div>

      {/* Preferences & Theme Switcher (PRD Section 39 & 40) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Preferensi Tampilan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pilih tema tampilan yang paling nyaman untuk matamu.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Terang', icon: Sun },
            { id: 'dark', label: 'Gelap', icon: Moon },
            { id: 'system', label: 'Sistem', icon: Laptop },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={cn(
                  'p-4 rounded-2xl border flex flex-col items-center gap-2 font-bold text-xs transition-all cursor-pointer',
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="w-5 h-5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real Background Web Push Notifications (Service Worker + VAPID + FCM) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BellRing className="w-5 h-5 text-emerald-500" />
              Notifikasi Web Push Latar Belakang (HP & Desktop)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">
              Menerima notifikasi langsung ke bilah status / layar terkunci HP meski peramban tidak dibuka, didukung Service Worker dan standar VAPID Web Push.
            </p>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {isPushSubscribed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Web Push Aktif
              </span>
            ) : permission === 'granted' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                Izin Diberikan
              </span>
            ) : permission === 'denied' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                Diblokir di Peramban
              </span>
            ) : !isSupported ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                Tidak Didukung
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold">
                Belum Terhubung
              </span>
            )}
          </div>
        </div>

        {/* Action Controls & Testing */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {!isPushSubscribed && isSupported && (
              <button
                type="button"
                disabled={isRequesting}
                onClick={async () => {
                  const res = await subscribeToPush();
                  if (res.success) {
                    await sendServerTestPush(0);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
              >
                <Bell className="w-4 h-4" />
                <span>{isRequesting ? 'Mendaftarkan Service Worker...' : 'Hubungkan & Aktifkan Web Push'}</span>
              </button>
            )}

            {/* Test Server Push with 5s delay for Lock Screen Testing */}
            <button
              type="button"
              disabled={isSendingPush}
              onClick={() => handleTestLockScreenPush(5)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>
                {pushCountdown > 0
                  ? `Mengirim dalam ${pushCountdown}s (Kunci Layar HP!)...`
                  : 'Uji Push Layar HP Terkunci (Jeda 5 Detik)'}
              </span>
            </button>

            {/* Test Immediate Server Push */}
            <button
              type="button"
              disabled={isSendingPush}
              onClick={() => handleTestLockScreenPush(0)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-emerald-500" />
              <span>Uji Push Langsung</span>
            </button>

            {/* Trigger On-Demand SPK Evaluation */}
            <button
              type="button"
              disabled={isEvaluatingSaw}
              onClick={handleTriggerSawEvaluation}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', isEvaluatingSaw && 'animate-spin')} />
              <span>Evaluasi SPK SAW Sekarang</span>
            </button>
          </div>

          {/* Real-time status / countdown feedback banner */}
          {pushStatusMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 animate-fadeIn">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="font-medium">{pushStatusMessage}</p>
            </div>
          )}

          {permission === 'denied' && (
            <p className="text-[11px] text-rose-500 dark:text-rose-400 italic">
              * Izin notifikasi sebelumnya diblokir di peramban ini. Untuk mengaktifkannya kembali, klik ikon gembok / izin situs pada bilah alamat URL peramban Anda, lalu ubah status notifikasi menjadi "Izinkan".
            </p>
          )}

          {/* Educational Note about Web Push vs Locked Phone */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Bagaimana Notifikasi Masuk Saat HP Mati / Chrome Ditutup?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Aplikasi berbasis web modern (PWA) menggunakan <strong>Service Worker</strong> dan <strong>Push API</strong> yang didaftarkan langsung ke sistem operasi perangkat Anda melalui Push Service (seperti Google FCM di Android/Chrome atau Apple APNs di iOS/Safari). Saat jadwal SPK SAW dievaluasi oleh server HabitGrow, server mengirim payload terenkripsi VAPID. Sistem operasi perangkat akan secara otomatis membangunkan Service Worker di latar belakang untuk memunculkan notifikasi di bilah status dan <em>lock screen</em> tanpa mewajibkan aplikasi atau tab Chrome sedang dibuka.
            </p>
          </div>
        </div>
      </div>

      {/* PWA Mobile Installation Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-500" />
              Instal Aplikasi ke Layar Utama HP (PWA)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">
              Pasang HabitGrow sebagai aplikasi mandiri di ponsel Android / iPhone Anda tanpa bilah peramban, lengkap dengan ikon resmi di beranda ponsel.
            </p>
          </div>

          <div>
            {isInstalled ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Aplikasi Terinstal
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                Siap Diinstal
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {!isInstalled && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  if (isInstallable) {
                    await promptInstall();
                  } else {
                    alert('Untuk menginstal di Chrome Android:\n1. Ketuk ikon titik tiga (⋮) di pojok kanan atas.\n2. Pilih menu "Instal aplikasi" (atau "Tambahkan ke Layar Utama").');
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Instal Aplikasi HabitGrow Sekarang</span>
              </button>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              💡 Cara Memasang Secara Manual di Ponsel:
            </p>
            <p>
              • <strong>Android (Google Chrome):</strong> Ketuk menu titik tiga (⋮) di kanan atas peramban $\rightarrow$ sekarang opsi <strong>"Instal aplikasi"</strong> sudah aktif dan dapat ditekan.
            </p>
            <p>
              • <strong>iOS / iPhone (Apple Safari):</strong> Ketuk tombol <strong>Bagikan (Share)</strong> $\rightarrow$ gulir ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Thesis Compliance & Data Export (PRD Section 112 & 113) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Ekspor Data Penelitian / Evaluasi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">
              Sesuai PRD Section 112-114 untuk evaluasi skripsi, Anda dapat mengunduh seluruh data riwayat aktivitas dalam format JSON standar.
            </p>
          </div>
        </div>

        <button
          onClick={exportData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-500" />
          Unduh Data Saya (.JSON)
        </button>
      </div>
    </div>
  );
}
