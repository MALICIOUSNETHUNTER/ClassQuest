export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createServerComponentClient();
    const { data: { session } } = await supabase.auth.getSession();

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}