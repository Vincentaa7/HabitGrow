// src/app/api/habits/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { HabitService } from '@/lib/services/habit.service';
import { habitUpdateSchema } from '@/lib/validators/habit.schema';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
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

    const { data: habit, error } = await supabase
      .from('habits')
      .select('*, category:habit_categories(*), habit_schedules(*), streak:user_streaks(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !habit) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Kebiasaan tidak ditemukan' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: habit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
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

    const json = await request.json();
    const validation = habitUpdateSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0]?.message || 'Input tidak valid',
          },
        },
        { status: 422 }
      );
    }

    const updated = await HabitService.updateHabit(supabase, user.id, id, validation.data);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui kebiasaan';
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message } },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
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

    await HabitService.deleteHabit(supabase, user.id, id);
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghapus kebiasaan';
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message } },
      { status: 400 }
    );
  }
}
