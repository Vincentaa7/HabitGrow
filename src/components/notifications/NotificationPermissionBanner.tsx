// src/components/notifications/NotificationPermissionBanner.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellRing, X, CheckCircle2 } from 'lucide-react';
import { useBrowserNotifications } from '@/hooks/use-browser-notifications';

export function NotificationPermissionBanner() {
  const {
    isSupported,
    permission,
    isPushSubscribed,
    subscribeToPush,
    sendServerTestPush,
    sendTestNotification,
  } = useBrowserNotifications();
  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [justEnabled, setJustEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check if user previously dismissed this session/device
    const dismissed = localStorage.getItem('habitgrow_notification_dismissed');
    if (!dismissed && permission === 'default' && isSupported) {
      setIsDismissed(false);
    }
  }, [permission, isSupported]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('habitgrow_notification_dismissed', 'true');
  };

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const res = await subscribeToPush();
      if (res.success) {
        setJustEnabled(true);
        // Try server push first; fallback to local notification
        await sendServerTestPush(0);
        setTimeout(() => {
          setIsDismissed(true);
        }, 4000);
      } else {
        // Fallback to local notification
        sendTestNotification();
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported || isDismissed || permission === 'denied' || isPushSubscribed) {
    return null;
  }

  if (justEnabled) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-[#0f172a] border border-emerald-200 dark:border-[#aff33e]/40 text-emerald-900 dark:text-emerald-100 flex items-center gap-3 transition-all duration-300">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-[#aff33e] shrink-0" />
        <div className="flex-1 text-xs">
          <span className="font-bold">Notifikasi Web Push Berhasil Diaktifkan!</span>
          <p className="text-emerald-700 dark:text-[#94a3b8] mt-0.5">
            Sistem Web Push aktif. Pohon virtualmu kini terlindungi dengan peringatan dini SPK & pengingat streak bahkan saat peramban ditutup!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-[#0f172a] dark:via-[#161618] dark:to-[#0f172a] border border-emerald-200/80 dark:border-[#1e293b] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-[#1e293b] text-emerald-600 dark:text-[#aff33e] border border-transparent dark:border-[#aff33e]/30 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <BellRing className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Aktifkan Pengingat Harian</span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-[#94a3b8] mt-0.5 max-w-xl">
            Izinkan notifikasi agar Anda mendapatkan pengingat di malam hari sebelum kebiasaan penting terlewat dan streak terputus.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
        >
          Nanti Saja
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={handleEnable}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-[#aff33e] dark:hover:bg-[#aff33e]/90 text-white dark:text-[#0f172a] font-bold text-xs shadow-sm shadow-emerald-600/20 dark:shadow-[#aff33e]/20 transition cursor-pointer disabled:opacity-50"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{isLoading ? 'Mendaftarkan...' : 'Aktifkan'}</span>
        </button>
      </div>
    </div>
  );
}
