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
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 flex items-center gap-3 transition-all duration-300">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div className="flex-1 text-xs">
          <span className="font-bold">Notifikasi Web Push Berhasil Diaktifkan!</span>
          <p className="text-emerald-700 dark:text-emerald-300 mt-0.5">
            Sistem Web Push aktif. Pohon virtualmu kini terlindungi dengan peringatan dini SPK & pengingat streak bahkan saat peramban ditutup!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-[#11231a] dark:via-[#0e1c15] dark:to-[#0f1713] border border-emerald-200/80 dark:border-emerald-700/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <BellRing className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Aktifkan Pengingat Web Push</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wide">
              Peringatan Dini SPK
            </span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-xl">
            Izinkan notifikasi agar sistem SPK dapat mengirimkan peringatan dini (*early warning*) langsung ke ponsel atau peramban Anda, bahkan saat aplikasi sedang tidak dibuka.
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
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{isLoading ? 'Mendaftarkan...' : 'Aktifkan'}</span>
        </button>
      </div>
    </div>
  );
}
