export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient();

    await supabase.auth.signOut();

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Signout API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}