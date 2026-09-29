// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { registerSchema } from '@/lib/validators/auth.schema';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const validation = registerSchema.safeParse(json);

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

    const { email, password, display_name } = validation.data;
    const supabase = await createClient();

    const origin = request.headers.get('origin') || 'https://habitsgrow.vercel.app';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name,
        },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_ERROR', message: error.message } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mendaftar';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}
