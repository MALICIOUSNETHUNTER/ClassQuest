'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePassword } from '@/app/auth/update-action';
import { FormMessage } from '@/components/ui/form-message';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    'use server';
    setMessage(null);
    setError(null);
    setIsLoading(true);

    try {
      const result = await updatePassword(null, formData);

      if (result.error) {
        setError(result.error);
      } else {
        setMessage(result.message || 'Password updated successfully!');
        // Redirect to sign-in after successful password reset
        setTimeout(() => {
          router.push('/auth/sign-in');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[600px] flex flex-col items-center justify-center px-6 py-12">
      <form action={handleSubmit} className="w-full max-w-md space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Reset Password</h2>
          <p className="text-center text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        <FormMessage variant="destructive">{error}</FormMessage>
        <FormMessage variant="default">{message}</FormMessage>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
            New password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-muted-foreground">
            Confirm new password
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Updating...' : 'Update password'}
        </button>

        <div className="text-sm text-center mt-4">
          <a href="/auth/sign-in" className="text-muted-foreground hover:underline">
            Remember your password? Sign in
          </a>
        </div>
      </form>
    </main>
  );
}