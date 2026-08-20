'use client';

import { getProfileClient } from '@/lib/auth';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function QuizDetailPage({ params }: { params: { quizId: string } }) {
  const [profile, setProfile] = useState<null | { [key: string]: any }>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Quiz data
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError(null);
        const result = await getProfileClient();
        if (result.error) {
          setProfileError(result.error);
        } else {
          setProfile(result.data);
        }
      } catch (err: any) {
        setProfileError(err.message || 'Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Fetch quiz when profile and quizId are available
  useEffect(() => {
    if (!profile || !params.quizId) return;

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        const supabase = await import('@/lib/supabase').then(
          (mod) => mod.createServerComponentClient()
        );

        // Fetch quiz with topic, unit, subject info
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select(`
            *,
            topics: topic_id (
              name,
              units: unit_id (
                name,
                subjects: subject_id (
                  name,
                  code,
                  semesters: semester_id (
                    name,
                    number,
                    branches: branch_id (
                      name,
                      code
                    )
                  )
                )
              )
            )
          `)
          .eq('id', params.quizId)
          .single();

        if (quizError) throw quizError;
        if (!quizData) {
          setError('Quiz not found');
          return;
        }

        // Check if user has access to this quiz (based on branch/semester)
        const hasAccess =
          quizData.topics.units.subjects.semesters.branches.id === profile.branch_id &&
          quizData.topics.units.subjects.semesters.id === profile.semester_id;

        if (!hasAccess) {
          setError('You do not have access to this quiz');
          return;
        }

        setQuiz(quizData);
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz details');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [params.quizId, profile]);

  // Handle auth/checks for profile
  if (profileError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="text-red-500">{profileError}</p>
            <Link href="/" className="btn-primary">Go Home</Link>
          </div>
        </div>
      </main>
    );
  }

  if (profileLoading || !profile) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </main>
    );
  }

  // Handle quiz loading and error
  if (error) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-red-500">{error}</p>
          <Link href="/" className="btn-primary">Go Home</Link>
        </div>
      </main>
    );
  }

  if (loading || !quiz) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading quiz details...</p>
          </div>
        </div>
      </main>
    );
  }

  // Calculate estimated time based on questions
  const estimatedTime = Math.max(5, quiz.question_count);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground">{quiz.description || 'No description available'}</p>
          </div>
          <div className="text-right space-x-3">
            <Link
              href={`/topics/${quiz.topics.id}/quizzes`}
              className="btn-outline"
            >
              Back to Quizzes
            </Link>
          </div>
        </div>

        {/* Quiz Info Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Topic</h3>
                <p className="text-sm text-muted-foreground">Subject area</p>
              </div>
              <div className="text-2xl font-bold">{quiz.topics.name}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Unit</h3>
                <p className="text-sm text-muted-foreground">Course module</p>
              </div>
              <div className="text-2xl font-bold">{quiz.topics.units.name}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Subject</h3>
                <p className="text-sm text-muted-foreground">Course</p>
              </div>
              <div className="text-2xl font-bold">
                {quiz.topics.units.subjects.name} ({quiz.topics.units.subjects.code})
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Quiz Details</h2>
          <div className="space-y-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Number of Questions:</span>
                <p className="text-lg font-medium">{quiz.question_count}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Time Limit:</span>
                <p className="text-lg font-medium">
                  {quiz.time_limit_minutes} min
                  {quiz.time_limit_minutes > 60
                    ? ` (${Math.floor(quiz.time_limit_minutes / 60)}h ${quiz.time_limit_minutes % 60}m)`
                    : ''}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Passing Score:</span>
                <p className="text-lg font-medium">
                  {quiz.passing_percentage}%
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Difficulty:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                  ${quiz.difficulty === 'easy'
                    ? 'bg-green-100 text-green-800'
                    : quiz.difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'}
                `}>
                  {quiz.difficulty}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Estimated Time:</span>
                <p className="text-lg font-medium">{estimatedTime} min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Instructions</h2>
          <ol className="space-y-3 pl-5 list-decimal">
            <li className="text-sm text-gray-700 dark:text-gray-300">
              Read each question carefully before selecting your answer.
            </li>
            <li className="text-sm text-gray-700 dark:text-gray-300">
              You will have <span className="font-medium">{quiz.time_limit_minutes}</span> minutes to complete this quiz.
            </li>
            <li className="text-sm text-gray-700 dark:text-gray-300">
              You need to score at least <span className="font-medium">{quiz.passing_percentage}%</span> to pass.
            </li>
            <li className="text-sm text-gray-700 dark:text-gray-300">
              Each question is worth <span className="font-medium">1 point</span> (unless otherwise specified).
            </li>
          </ol>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <Link
            href={`/quiz-attempts/new?quizId=${quiz.id}`}
            className="w-full"
          >
            <Button className="w-full">
              Start Quiz
            </Button>
          </Link>
        </div>

        {/* Sample Questions Preview (optional) */}
        {/* This would typically be hidden or limited to avoid giving away answers */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Sample Question Format</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h3 className="font-semibold">Sample Question:</h3>
              <p className="text-gray-600 dark:text-gray-300">
                What is the capital of France?
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-start space-x-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-md
                  bg-primary text-primary-foreground">
                  <span className="font-medium">A</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">Paris</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-md
                  bg-gray-50 dark:bg-gray-800">
                  <span className="font-medium">B</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">London</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-md
                  bg-gray-50 dark:bg-gray-800">
                  <span className="font-medium">C</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">Berlin</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-md
                  bg-gray-50 dark:bg-gray-800">
                  <span className="font-medium">D</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">Madrid</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Placeholder icons
const CheckCircle = () => <span>✓</span>;
const AlertTriangle = () => <span>⚠</span>;