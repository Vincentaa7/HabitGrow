// src/lib/services/web-push.service.ts
import webpush from 'web-push';
import { SupabaseClient } from '@supabase/supabase-js';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:vince@habitgrow.app';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

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

    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'PUSH_SUBSCRIPTION')
      .limit(1)
      .single();

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
      .limit(1)
      .single();

    if (error || !data?.message) return null;

    try {
      return JSON.parse(data.message) as webpush.PushSubscription;
    } catch {
      return null;
    }
  }

  /**
   * Sends a Web Push notification to a user's device even if their browser/phone is closed
   */
  static async sendPushToUser(
    supabase: SupabaseClient,
    userId: string,
    payload: PushPayload
  ): Promise<{ success: boolean; error?: string }> {
    const subscription = await this.getSubscription(supabase, userId);
    if (!subscription) {
      return { success: false, error: 'User does not have an active push subscription' };
    }

    try {
      const payloadString = JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || '/app/dashboard',
        tag: payload.tag || 'habitgrow-alert',
        icon: payload.icon || '/image/habitgrow_logo.svg',
      });

      await webpush.sendNotification(subscription, payloadString);
      return { success: true };
    } catch (error: any) {
      // If subscription expired or was unsubscribed (HTTP 410 Gone / 404), remove it
      if (error?.statusCode === 410 || error?.statusCode === 404) {
        await supabase
          .from('notifications')
          .delete()
          .eq('user_id', userId)
          .eq('type', 'PUSH_SUBSCRIPTION');
      }
      return { success: false, error: error?.message || 'Failed to send web push' };
    }
  }
}
