import { useState } from 'react';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUpWithEmailPassword } from '@/lib/actions/auth';

export function SignUpForm() {
  const [state, setState] = useState({
    success: false,
    message: null as string | null,
    error: null as string | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [isShowingSuccess, setIsShowingSuccess] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const result = await signUpWithEmailPassword(null, formData);
      setState({
        success: result.success,
        message: result.message ?? null,
        error: result.error ?? null,
      });
    } catch (error: any) {
      setState({
        success: false,
        message: null,
        error: error.message || 'Sign up failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle redirect after showing success message for 3 seconds
  useEffect(() => {
    if (state.success && state.message && !isShowingSuccess) {
      setIsShowingSuccess(true);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set timeout to redirect after 3 seconds
      timeoutRef.current = setTimeout(() => {
        router.push('/auth/sign-in');
      }, 3000);
    } else if (!state.success) {
      // Reset showing success flag when not in success state
      setIsShowingSuccess(false);

      // Clear timeout if not in success state
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.success, state.message, router]);

  // Reset loading state when we get a result (success or error)
  useEffect(() => {
    if ((state.success && state.message) || state.error) {
      setIsLoading(false);
    }
  }, [state.success, state.message, state.error]);

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleSubmit(formData);
    }} className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-center">Create your ClassQuest account</h1>
        <p className="text-center text-muted-foreground">
          Join thousands of students making the most of their free time
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium text-muted-foreground">
          Full name
        </label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Enter your full name"
          defaultValue=""
          required
          autoFocus
        />
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
          placeholder="Create a password"
          defaultValue=""
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-muted-foreground">
          Confirm password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          defaultValue=""
          required
        />
      </div>

      {state.error && (
        <p className="text-destructive">{state.error}</p>
      )}
      {state.message && !state.error && (
        <p className="text-success">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Creating account...' : 'Sign up'}
      </button>

      <div className="text-sm text-center">
        <a href="/auth/sign-in" className="text-muted-foreground hover:underline">
          Already have an account? Sign in
        </a>
      </div>
    </form>
  );
}