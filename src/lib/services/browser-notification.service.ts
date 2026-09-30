// src/lib/services/browser-notification.service.ts

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer | null | undefined): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export class BrowserNotificationService {
  /**
   * Checks if Notification API is supported in the current browser environment.
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Checks if Service Worker and Web Push Manager are supported.
   */
  static isPushSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Gets current notification permission status.
   */
  static getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  /**
   * Requests user permission to display browser notifications.
   */
  static async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'unsupported';
    }
  }

  /**
   * Registers the background service worker (/sw.js)
   */
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isPushSupported()) return null;
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      return registration;
    } catch (err) {
      console.warn('Service worker registration failed:', err);
      return null;
    }
  }

  /**
   * Subscribes the current device to Web Push and registers subscription to HabitGrow server.
   * If forceResubscribe is true or key rotation is detected, old subscription is unsubscribed first.
   */
  static async subscribeToPush(forceResubscribe: boolean = false): Promise<{
    success: boolean;
    subscription?: PushSubscription;
    error?: string;
  }> {
    if (!this.isPushSupported()) {
      return { success: false, error: 'Web Push tidak didukung pada browser ini' };
    }

    try {
      const perm = await this.requestPermission();
      if (perm !== 'granted') {
        return { success: false, error: 'Izin notifikasi belum diberikan di peramban' };
      }

      const registration = await this.registerServiceWorker();
      if (!registration) {
        return { success: false, error: 'Gagal meregistrasi Service Worker' };
      }

      await navigator.serviceWorker.ready;

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        return {
          success: false,
          error: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY belum dikonfigurasi di Environment Variables.',
        };
      }

      let subscription = await registration.pushManager.getSubscription();

      let shouldUnsubscribe = forceResubscribe;

      // Auto-detect key mismatch if options.applicationServerKey exists
      if (subscription && !shouldUnsubscribe && subscription.options?.applicationServerKey) {
        const currentServerKey = arrayBufferToBase64Url(subscription.options.applicationServerKey);
        const expectedServerKey = vapidPublicKey.replace(/=+$/, '');
        if (currentServerKey && currentServerKey !== expectedServerKey) {
          console.warn('[HabitGrow Push] VAPID key mismatch detected. Unsubscribing stale subscription...');
          shouldUnsubscribe = true;
        }
      }

      if (subscription && shouldUnsubscribe) {
        try {
          await subscription.unsubscribe();
        } catch (e) {
          console.warn('[HabitGrow Push] Could not unsubscribe old subscription:', e);
        }
        subscription = null;
      }

      if (!subscription) {
        const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey as unknown as BufferSource,
        });
      }

      // Explicitly serialize to clean JSON
      const serializedSubscription = subscription.toJSON ? subscription.toJSON() : subscription;

      // Save subscription to HabitGrow database via server endpoint
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: serializedSubscription }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        return {
          success: false,
          error: errJson.error?.message || 'Gagal menyimpan langganan push ke server',
        };
      }

      return { success: true, subscription };
    } catch (err: any) {
      console.error('Error during Web Push subscription:', err);
      return { success: false, error: err?.message || 'Gagal mendaftar push notifikasi' };
    }
  }

  /**
   * Checks if device is already subscribed to PushManager
   */
  static async checkPushSubscription(): Promise<boolean> {
    if (!this.isPushSupported()) return false;
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      return sub !== null;
    } catch {
      return false;
    }
  }

  /**
   * Dispatches a real background push from server to device (tested with locked screen or closed tab).
   * Automatically auto-heals and retries if stale subscription / key mismatch is detected.
   */
  static async sendServerTestPush(
    delaySeconds: number = 0,
    retryOnMismatch: boolean = true
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await fetch('/api/notifications/test-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delaySeconds }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        const rawMessage = json.error?.message || '';

        // Auto-heal on stale subscription / VAPID key mismatch
        if (
          retryOnMismatch &&
          (rawMessage.includes('unexpected response code') ||
           rawMessage.includes('kunci lama') ||
           rawMessage.includes('VAPID') ||
           rawMessage.includes('kedaluwarsa') ||
           json.error?.code === 'PUSH_FAILED')
        ) {
          console.warn('[HabitGrow Push] Stale push subscription detected. Re-subscribing with latest VAPID keys...');
          const resub = await this.subscribeToPush(true);
          if (resub.success) {
            // Re-attempt test push once
            return await this.sendServerTestPush(delaySeconds, false);
          }
        }

        return {
          success: false,
          message: rawMessage || 'Gagal mengirim push notifikasi dari server.',
        };
      }

      return {
        success: true,
        message: json.message || 'Push notification terkirim!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Gagal menghubungi server push.',
      };
    }
  }

  /**
   * Triggers an on-demand SPK SAW evaluation for push warning
   */
  static async triggerSmartReminders(): Promise<{
    success: boolean;
    dispatched: number;
    message: string;
  }> {
    try {
      const response = await fetch('/api/cron/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await response.json();
      return {
        success: json.success ?? false,
        dispatched: json.dispatched ?? 0,
        message: json.message || 'Evaluasi pengingat cerdas selesai.',
      };
    } catch (err: any) {
      return {
        success: false,
        dispatched: 0,
        message: err?.message || 'Gagal memicu evaluasi SPK.',
      };
    }
  }

  /**
   * Universal method to show notification (supports Android Chrome via ServiceWorker and Desktop via Notification)
   */
  static async sendNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<boolean> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      silent: false,
      tag: 'habitgrow-' + Date.now(),
      ...options,
    };

    // 1. Android Chrome FORBIDS `new Notification()`, so we MUST use ServiceWorkerRegistration.showNotification
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(title, defaultOptions);
          return true;
        }
      } catch (swErr) {
        console.warn('showNotification through serviceWorker failed, falling back to window Notification:', swErr);
      }
    }

    // 2. Desktop Fallback (Windows/Mac/Linux browsers)
    try {
      new Notification(title, defaultOptions);
      return true;
    } catch (e) {
      console.warn('Gagal memicu browser notification:', e);
      return false;
    }
  }

  /**
   * Sends an immediate test notification to verify setup.
   */
  static async sendTestNotification(): Promise<boolean> {
    return this.sendNotification('🌿 HabitGrow — Pengingat Aktif!', {
      body: 'Sistem pengingat browser berhasil diaktifkan. Pohon virtualmu akan mengingatkanmu saat ada kebiasaan yang berisiko terlewat!',
      tag: 'habitgrow-test-' + Date.now(),
    });
  }

  /**
   * Sends an early warning notification triggered by the Decision Support System (SAW).
   */
  static async sendAtRiskWarning(habitName: string, riskPercentage: number): Promise<boolean> {
    return this.sendNotification(`⚠️ Peringatan Dini SPK: ${habitName}`, {
      body: `Tingkat risiko terlewat hari ini mencapai ${riskPercentage}%. Buka HabitGrow sekarang untuk memangkas target atau selesaikan versi ringannya!`,
      tag: `at-risk-${habitName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    });
  }

  /**
   * Sends a streak defense reminder before midnight.
   */
  static async sendStreakReminder(streakDays: number, uncompletedCount: number): Promise<boolean> {
    return this.sendNotification(`🔥 Amankan Streak ${streakDays} Hari!`, {
      body: `Kamu masih punya ${uncompletedCount} kebiasaan yang belum tuntas hari ini. Rawat pohonmu sebelum pergantian hari!`,
      tag: `habitgrow-streak-${Date.now()}`,
    });
  }
}
