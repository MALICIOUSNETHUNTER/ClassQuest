import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Next destination (e.g., /protected/update-password)
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    // Exchanging the code creates an active user session in the cookies
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to an error page if code exchange fails
  return NextResponse.redirect(`${origin}/auth/auth-error`);
}