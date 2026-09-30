// src/lib/services/__tests__/web-push.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebPushService } from '../web-push.service';
import webpush from 'web-push';

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
  },
}));

describe('WebPushService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSubscription = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/fake-token',
    keys: {
      p256dh: 'mock-p256dh-key',
      auth: 'mock-auth-secret',
    },
  };

  it('saves new push subscription when none exists', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSupabase: any = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'notifications') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            insert: mockInsert,
          };
        }
        return {};
      }),
    };

    const result = await WebPushService.saveSubscription(
      mockSupabase,
      'user-123',
      mockSubscription as any
    );

    expect(result).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        type: 'PUSH_SUBSCRIPTION',
        title: 'WEB_PUSH_SUBSCRIPTION',
        status: 'SENT',
      })
    );
  });

  it('updates existing push subscription when found', async () => {
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: null });

    const mockSupabase: any = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'notifications') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'existing-notif-id' }, error: null }),
            update: (...args: any[]) => {
              mockUpdate(...args);
              return { eq: mockEq };
            },
          };
        }
        return {};
      }),
    };

    const result = await WebPushService.saveSubscription(
      mockSupabase,
      'user-123',
      mockSubscription as any
    );

    expect(result).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        message: JSON.stringify(mockSubscription),
        status: 'SENT',
      })
    );
  });

  it('retrieves and parses active subscription correctly', async () => {
    const mockSupabase: any = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { message: JSON.stringify(mockSubscription) },
          error: null,
        }),
      }),
    };

    const sub = await WebPushService.getSubscription(mockSupabase, 'user-123');
    expect(sub).toEqual(mockSubscription);
  });

  it('returns null if subscription JSON is invalid or missing', async () => {
    const mockSupabase: any = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { message: 'invalid-json{' },
          error: null,
        }),
      }),
    };

    const sub = await WebPushService.getSubscription(mockSupabase, 'user-123');
    expect(sub).toBeNull();
  });

  it('sends push to user successfully', async () => {
    const mockSupabase: any = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { message: JSON.stringify(mockSubscription) },
          error: null,
        }),
      }),
    };

    (webpush.sendNotification as any).mockResolvedValueOnce({});

    const result = await WebPushService.sendPushToUser(mockSupabase, 'user-123', {
      title: 'Halo!',
      body: 'Test push',
    });

    expect(result.success).toBe(true);
    expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
  });

  it('handles 410 Gone by removing expired subscription', async () => {
    const mockDelete = vi.fn().mockReturnThis();
    const mockEq1 = vi.fn().mockReturnThis();
    const mockEq2 = vi.fn().mockResolvedValue({ error: null });

    const mockSupabase: any = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'notifications') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { message: JSON.stringify(mockSubscription) },
              error: null,
            }),
            delete: () => {
              mockDelete();
              return {
                eq: (k1: string, v1: any) => {
                  mockEq1(k1, v1);
                  return { eq: mockEq2 };
                },
              };
            },
          };
        }
        return {};
      }),
    };

    const err410: any = new Error('Subscription expired');
    err410.statusCode = 410;
    (webpush.sendNotification as any).mockRejectedValueOnce(err410);

    const result = await WebPushService.sendPushToUser(mockSupabase, 'user-123', {
      title: 'Halo!',
      body: 'Test push',
    });

    expect(result.success).toBe(false);
    expect(mockDelete).toHaveBeenCalled();
  });
});
