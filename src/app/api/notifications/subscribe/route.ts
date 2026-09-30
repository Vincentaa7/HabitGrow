// src/app/api/notifications/subscribe/route.ts
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

    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SUBSCRIPTION', message: 'Data PushSubscription tidak valid' } },
        { status: 400 }
      );
    }

    const saved = await WebPushService.saveSubscription(supabase, user.id, subscription);

    if (!saved) {
      return NextResponse.json(
        { success: false, error: { code: 'SAVE_FAILED', message: 'Gagal menyimpan langganan push ke database' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Langganan Web Push berhasil didaftarkan ke server!',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal server';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
      .eq('type', 'PUSH_SUBSCRIPTION');

    return NextResponse.json({
      success: true,
      message: 'Langganan Web Push berhasil dicabut.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal server';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
