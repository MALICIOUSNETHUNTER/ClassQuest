'use client';

import { useSearchParams } from 'next/navigation';
import { SignInForm } from '@/components/auth/sign-in-form'

export default function SignInPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-6 py-12 md:px-8">
      <section className="w-full max-w-md space-y-12">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-center">
            Welcome back to ClassQuest
          </h1>
          <p className="text-center text-muted-foreground">
            Sign in to continue your learning journey
          </p>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-success/10 text-success text-sm text-center rounded">
            {message}
          </div>
        )}

        <SignInForm />
        <div className="text-sm text-center mt-4">
          <a href="/forgot-password" className="text-muted-foreground hover:underline">
            Forgot your password?
          </a>
        </div>
      </section>
    </main>
  )
}