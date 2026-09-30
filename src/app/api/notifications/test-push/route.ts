// src/app/api/notifications/test-push/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WebPushService } from '@/lib/services/web-push.service';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu' } },
        { status: 401 }
      );
    }

    let delaySeconds = 0;
    try {
      const body = await request.json();
      if (body && typeof body.delaySeconds === 'number') {
        delaySeconds = Math.max(0, Math.min(15, body.delaySeconds)); // max 15 seconds
      }
    } catch {
      // Body may be empty if no delay requested
    }

    if (delaySeconds > 0) {
      await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
    }

    const payload = {
      title: '🌿 HabitGrow — Push Notifikasi Latar Belakang!',
      body: delaySeconds > 0
        ? `Berhasil! Notifikasi ini masuk ke layar ponsel/laptop setelah jeda ${delaySeconds} detik meski kamu sedang mengunci layar.`
        : 'Berhasil! Sistem Web Push Server HabitGrow aktif dan siap melindungi streak kebiasaanmu!',
      url: '/app/dashboard',
      tag: 'habitgrow-test-push',
    };

    const result = await WebPushService.sendPushToUser(supabase, user.id, payload);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PUSH_FAILED',
            message: result.error || 'Gagal mengirim push notifikasi. Pastikan izin push diaktifkan di peramban ini.',
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Push notifikasi berhasil dikirim dari server ke perangkat Anda!',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem internal';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
