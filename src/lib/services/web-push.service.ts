// src/lib/services/web-push.service.ts
import webpush from 'web-push';
import { SupabaseClient } from '@supabase/supabase-js';

const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:vince@habitgrow.app';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
}

export class WebPushService {
  /**
   * Saves or updates a user's web push subscription in database
   */
  static async saveSubscription(
    supabase: SupabaseClient,
    userId: string,
    subscription: webpush.PushSubscription
  ): Promise<boolean> {
    const serialized = JSON.stringify(subscription);

    const { data: existingRows } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'PUSH_SUBSCRIPTION')
      .limit(1);

    const existing = existingRows && existingRows.length > 0 ? existingRows[0] : null;

    if (existing) {
      const { error } = await supabase
        .from('notifications')
        .update({
          message: serialized,
          sent_at: new Date().toISOString(),
          status: 'SENT',
        })
        .eq('id', existing.id);
      return !error;
    } else {
      const { error } = await supabase.from('notifications').insert({
        user_id: userId,
        type: 'PUSH_SUBSCRIPTION',
        title: 'WEB_PUSH_SUBSCRIPTION',
        message: serialized,
        status: 'SENT',
      });
      return !error;
    }
  }

  /**
   * Retrieves active push subscription for a user
   */
  static async getSubscription(
    supabase: SupabaseClient,
    userId: string
  ): Promise<webpush.PushSubscription | null> {
    const { data, error } = await supabase
      .from('notifications')
      .select('message')
      .eq('user_id', userId)
      .eq('type', 'PUSH_SUBSCRIPTION')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0 || !data[0]?.message) return null;

    try {
      return JSON.parse(data[0].message) as webpush.PushSubscription;
    } catch {
      return null;
    }
  }

  /**
   * Initializes or refreshes VAPID credentials at runtime
   */
  static ensureVapidConfig(): boolean {
    const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    const sub = process.env.VAPID_SUBJECT || vapidSubject;

    if (!pub || !priv) {
      return false;
    }

    try {
      webpush.setVapidDetails(sub, pub, priv);
      return true;
    } catch (e) {
      console.warn('VAPID setup warning:', e);
      return false;
    }
  }

  /**
   * Sends a Web Push notification to a user's device even if their browser/phone is closed
   */
  static async sendPushToUser(
    supabase: SupabaseClient,
    userId: string,
    payload: PushPayload
  ): Promise<{ success: boolean; error?: string; statusCode?: number }> {
    const isConfigured = this.ensureVapidConfig();
    if (!isConfigured) {
      return {
        success: false,
        error: 'Kunci VAPID belum dikonfigurasi di Environment Variables server (Vercel).',
      };
    }

    const subscription = await this.getSubscription(supabase, userId);
    if (!subscription) {
      return { success: false, error: 'User does not have an active push subscription' };
    }

    try {
      const payloadString = JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || '/app/dashboard',
        tag: (payload.tag || 'habitgrow-alert') + '-' + Date.now(),
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
      });

      await webpush.sendNotification(subscription, payloadString);
      return { success: true };
    } catch (error: any) {
      const statusCode = error?.statusCode || (typeof error?.status === 'number' ? error.status : undefined);

      // If subscription expired, revoked, or key mismatched (HTTP 410, 404, 400, 401), clean up stale record
      if (statusCode === 410 || statusCode === 404 || statusCode === 400 || statusCode === 401) {
        await supabase
          .from('notifications')
          .delete()
          .eq('user_id', userId)
          .eq('type', 'PUSH_SUBSCRIPTION');
      }

      let errorMessage = error?.message || 'Failed to send web push';
      if (statusCode === 400 || statusCode === 401 || errorMessage.includes('unexpected response code')) {
        errorMessage = 'Kunci VAPID tidak cocok dengan langganan peramban lama. Silakan hubungkan ulang notifikasi di Profil.';
      } else if (statusCode === 410 || statusCode === 404) {
        errorMessage = 'Langganan notifikasi peramban telah kedaluwarsa. Silakan aktifkan kembali di Profil.';
      }

      return { success: false, error: errorMessage, statusCode };
    }
  }
}
