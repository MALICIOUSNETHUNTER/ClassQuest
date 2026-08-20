'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createQuizAttempt } from '@/lib/actions/quiz';

export default function QuizAttemptNewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = searchParams.get('quizId');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) {
      setError('Quiz ID is required');
      return;
    }

    const createAttempt = async () => {
      setLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.set('quizId', quizId);
        const result = await createQuizAttempt(undefined, formData);

        if (result.error) {
          setError(result.error);
          return;
        }

        if (result.success && result.data?.attemptId) {
          setAttemptId(result.data.attemptId);
          setSuccess(true);
          // Redirect to the attempt page
          router.push(`/quiz-attempts/${result.data.attemptId}`);
        } else {
          setError('Unexpected response from server');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to create quiz attempt');
      } finally {
        setLoading(false);
      }
    };

    createAttempt();
  }, [quizId, router]);

  if (error) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-red-500">{error}</p>
          <div className="mt-6 flex space-x-3">
            <a href="/" className="btn-outline">
              Go Home
            </a>
            <a href="/subjects" className="btn-primary">
              Browse Subjects
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Creating quiz attempt...</p>
          </div>
        </div>
      </main>
    );
  }

  // If success but not yet redirected (should redirect immediately)
  if (success) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Redirecting...</p>
          </div>
        </div>
      </main>
    );
  }

  // Fallback (should not happen)
  return (
    <main className="space-y-6">
      <div className="flex flex-col items-center justify-between p-6">
        <h1 className="text-2xl font-bold">Creating attempt...</h1>
      </div>
    </main>
  );
}