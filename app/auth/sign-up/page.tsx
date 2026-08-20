'use client';

import { SignUpForm } from '@/components/auth/sign-up-form'

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-6 py-12 md:px-8">
      <section className="w-full max-w-md space-y-12">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-center">
            Create your ClassQuest account
          </h1>
          <p className="text-center text-muted-foreground">
            Join thousands of students making the most of their free time
          </p>
        </div>

        <SignUpForm />
      </section>
    </main>
  )
}