export default function AuthErrorPage() {
  return (
    <main className="min-h-[600px] flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-destructive">
          Authentication Error
        </h1>
        <p className="text-muted-foreground">
          Unable to verify your request. Please try again or contact support.
        </p>
        <a
          href="/auth/sign-in"
          className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded"
        >
          Return to Sign In
        </a>
      </div>
    </main>
  );
}