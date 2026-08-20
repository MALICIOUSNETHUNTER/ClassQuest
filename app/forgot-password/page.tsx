'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetPassword } from '@/app/auth/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
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
      const result = await resetPassword(null, formData);

      if (result.error) {
        setError(result.error);
      } else {
        setMessage(result.message || 'Check your email for the password reset link.');
        setEmail('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-6 py-12 md:px-8">
      <section className="w-full max-w-md space-y-12">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-center">
            Forgot Password
          </h1>
          <p className="text-center text-muted-foreground">
            Enter your email to receive a password reset link
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive text-sm text-center rounded">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-4 bg-success/10 text-success text-sm text-center rounded">
            {message}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? 'opacity-50' : ''} rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90`}
          >
            {isLoading ? 'Sending...' : 'Send reset link'}
          </button>

          <div className="text-sm text-center">
            <a href="/auth/sign-in" className="text-muted-foreground hover:underline">
              Back to sign in
            </a>
          </div>
        </form>
      </section>
    </main>
  );
}