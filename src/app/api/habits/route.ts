// src/app/api/habits/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { HabitService } from '@/lib/services/habit.service';
import { habitCreateSchema } from '@/lib/validators/habit.schema';

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const isArchived = searchParams.get('archived') === 'true' ? true : searchParams.get('archived') === 'false' ? false : undefined;
    const categoryId = searchParams.get('categoryId') || undefined;

    const habits = await HabitService.getHabits(supabase, user.id, { isArchived, categoryId });

    return NextResponse.json({ success: true, data: habits });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}

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

    const json = await request.json();
    const validation = habitCreateSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0]?.message || 'Input tidak valid',
            details: validation.error.flatten(),
          },
        },
        { status: 422 }
      );
    }

    const newHabit = await HabitService.createHabit(supabase, user.id, validation.data);

    return NextResponse.json({ success: true, data: newHabit }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal membuat kebiasaan';
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message } },
      { status: 400 }
    );
  }
}
