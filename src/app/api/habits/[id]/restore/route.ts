// src/app/api/habits/[id]/restore/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { HabitService } from '@/lib/services/habit.service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
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

    await HabitService.restoreHabit(supabase, user.id, id);
    return NextResponse.json({ success: true, data: { restored: true } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memulihkan kebiasaan';
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message } },
      { status: 400 }
    );
  }
}
