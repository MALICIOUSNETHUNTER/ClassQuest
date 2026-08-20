'use server';

import { createClient } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = await createClient();
  const originList = await headers();
  const origin = originList.get('origin') ?? '';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // The callback route that will exchange the token for a session
    // This should point to your auth callback route
    redirectTo: `${origin}/auth/callback?next=/protected/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Check your email for the password reset link.' };
}