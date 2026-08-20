'use server';

import { createClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Validate passwords match
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  // Validate password length (minimum 8 characters)
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  const supabase = await createClient();

  // Updates the password for the currently logged-in user session
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { error: error.message };
  }

  // Log the user out immediately so they have to sign back in
  await supabase.auth.signOut();

  // Redirect to the sign-in page with success message
  redirect('/sign-in?message=Password updated successfully. Please sign in.');
}