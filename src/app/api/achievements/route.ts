// src/app/api/achievements/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
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

    // 1. All active achievements
    const { data: achievements, error: achError } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('condition_value', { ascending: true });

    if (achError) throw new Error(achError.message);

    // 2. User unlocked achievements
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', user.id);

    const unlockMap = new Map<string, string>();
    (userAchievements || []).forEach((u) => unlockMap.set(u.achievement_id, u.unlocked_at));

    const result = (achievements || []).map((ach) => ({
      ...ach,
      is_unlocked: unlockMap.has(ach.id),
      unlocked_at: unlockMap.get(ach.id) || null,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat achievements';
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}
