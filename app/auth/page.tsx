'use client';

export default function AuthPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-6 py-12 md:px-8">
      <section className="w-full max-w-md space-y-12">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-center">
            Welcome to ClassQuest
          </h1>
          <p className="text-center text-muted-foreground">
            Sign in to continue your learning journey
          </p>
        </div>
      </section>
    </main>
  )
}