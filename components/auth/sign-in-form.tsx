'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInWithEmailPassword } from '@/lib/actions/auth';

export function SignInForm() {
  const [state, setState] = useState({
    success: false,
    error: null as string | null,
    redirectTo: null as string | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const result = await signInWithEmailPassword(null, formData);
      setState({
        success: result.success,
        error: result.error ?? null,
        redirectTo: result.redirectTo ?? null,
      });

      // Handle redirect if provided by server action
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    } catch (error: any) {
      setState({
        success: false,
        error: error.message || 'An unexpected error occurred',
        redirectTo: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleSubmit(formData);
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Sign in to ClassQuest</h2>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
          Email address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          defaultValue=""
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          defaultValue=""
          required
        />
      </div>

      {state.error && (
        <p className="text-destructive">{state.error}</p>
      )}
      {state.success && !state.redirectTo && (
        <p className="text-success">Signed in successfully!</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full ${isLoading ? 'opacity-50' : ''}`}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>

      <div className="text-sm text-center">
        <a href="/auth/sign-up" className="text-muted-foreground hover:underline">
          Don't have an account? Sign up
        </a>
      </div>

      <div className="text-sm text-center">
        <a href="/auth/password-reset" className="text-muted-foreground hover:underline">
          Forgot password?
        </a>
      </div>
    </form>
  );
}