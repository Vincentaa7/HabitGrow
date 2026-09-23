// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validators/auth.schema';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const validation = loginSchema.safeParse(json);

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

    const { email, password } = validation.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_ERROR', message: 'Email atau password salah' } },
        { status: 401 }
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
    const message = error instanceof Error ? error.message : 'Gagal login';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}
