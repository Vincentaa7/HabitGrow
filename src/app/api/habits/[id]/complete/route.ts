// src/app/api/habits/[id]/complete/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CompletionService } from '@/lib/services/completion.service';
import { habitCompletionSchema } from '@/lib/validators/completion.schema';

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

    let body = {};
    try {
      body = await request.json();
    } catch {
      // Body can be empty for default completion
    }

    const validation = habitCompletionSchema.safeParse(body);
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

    const result = await CompletionService.completeHabit(
      supabase,
      user.id,
      id,
      validation.data.date,
      validation.data.note || undefined
    );

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menyelesaikan kebiasaan';
    const isConflict = message.includes('sudah diselesaikan');
    return NextResponse.json(
      { success: false, error: { code: isConflict ? 'CONFLICT' : 'BAD_REQUEST', message } },
      { status: isConflict ? 409 : 400 }
    );
  }
}
