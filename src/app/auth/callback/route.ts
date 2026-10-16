// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/app/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure profile and virtual tree exist for first-time OAuth users
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existingProfile) {
          const displayName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.user_metadata?.display_name ||
            user.email?.split('@')[0] ||
            'User';

          await supabase.from('profiles').insert({
            id: user.id,
            display_name: displayName,
            avatar_url: user.user_metadata?.avatar_url || null,
          });

          await supabase.from('user_trees').insert({
            user_id: user.id,
            stage: 'Seed',
            health: 100,
            growth_points: 0,
            consistency_score: 0,
          });

          await supabase.from('user_levels').insert({
            user_id: user.id,
            level: 1,
            total_xp: 0,
          });
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // If code exchange failed or no code, redirect to login
  return NextResponse.redirect(`${origin}/login?verified=true`);
}
