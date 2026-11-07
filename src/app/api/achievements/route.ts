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

    // Fetch active achievements and user unlocked achievements in parallel
    const [{ data: achievements, error: achError }, { data: userAchievements }] =
      await Promise.all([
        supabase
          .from('achievements')
          .select('*')
          .eq('is_active', true)
          .order('condition_value', { ascending: true }),
        supabase
          .from('user_achievements')
          .select('achievement_id, unlocked_at')
          .eq('user_id', user.id),
      ]);

    if (achError) throw new Error(achError.message);

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
