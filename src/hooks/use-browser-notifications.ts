// src/hooks/use-browser-notifications.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { BrowserNotificationService } from '@/lib/services/browser-notification.service';

export function useBrowserNotifications() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isPushSupported, setIsPushSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isPushSubscribed, setIsPushSubscribed] = useState<boolean>(false);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  useEffect(() => {
    const supported = BrowserNotificationService.isSupported();
    const pushSupported = BrowserNotificationService.isPushSupported();
    setIsSupported(supported);
    setIsPushSupported(pushSupported);

    if (supported) {
      setPermission(BrowserNotificationService.getPermission());
    } else {
      setPermission('unsupported');
    }

    if (pushSupported) {
      BrowserNotificationService.checkPushSubscription().then((sub) => {
        setIsPushSubscribed(sub);
      });
    }
  }, []);

  const requestPermission = useCallback(async () => {
    setIsRequesting(true);
    try {
      const res = await BrowserNotificationService.requestPermission();
      setPermission(res);
      return res;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const subscribeToPush = useCallback(async () => {
    setIsRequesting(true);
    try {
      const res = await BrowserNotificationService.subscribeToPush();
      if (res.success) {
        setIsPushSubscribed(true);
        setPermission('granted');
      }
      return res;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    return await BrowserNotificationService.sendTestNotification();
  }, []);

  const sendServerTestPush = useCallback((delaySeconds: number = 0) => {
    return BrowserNotificationService.sendServerTestPush(delaySeconds);
  }, []);

  const triggerSmartReminders = useCallback(() => {
    return BrowserNotificationService.triggerSmartReminders();
  }, []);

  const sendAtRiskWarning = useCallback(async (habitName: string, riskPercentage: number) => {
    return await BrowserNotificationService.sendAtRiskWarning(habitName, riskPercentage);
  }, []);

  return {
    isSupported,
    isPushSupported,
    permission,
    isPushSubscribed,
    isRequesting,
    requestPermission,
    subscribeToPush,
    sendTestNotification,
    sendServerTestPush,
    triggerSmartReminders,
    sendAtRiskWarning,
  };
}
