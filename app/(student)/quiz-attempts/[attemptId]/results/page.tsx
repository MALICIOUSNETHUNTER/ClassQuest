'use client';

import { getProfileClient } from '@/lib/auth';
import { createClientComponentClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function QuizResultsPage({ params }: { params: { attemptId: string } }) {
  // Profile data
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Attempt data
  const [attempt, setAttempt] = useState(null);
  const [attemptLoading, setAttemptLoading] = useState(true);
  const [attemptError, setAttemptError] = useState<string | null>(null);

  // Questions data
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // Answers data
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answersLoading, setAnswersLoading] = useState(true);
  const [answersError, setAnswersError] = useState<string | null>(null);

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
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

  // Load attempt when profile is available
  useEffect(() => {
    if (!profile) return;

    const loadAttempt = async () => {
      try {
        setAttemptLoading(true);
        const supabase = createClientComponentClient();

        const { data, error: attemptError } = await supabase
          .from('quiz_attempts')
          .select(`
            *,
            quizzes (
              *,
              topics: topic_id (
                name,
                units: unit_id (
                  name,
                  subjects: subject_id (
                    name,
                    code
                  )
                )
              )
            )
          `)
          .eq('id', params.attemptId)
          .eq('user_id', profile.id)
          .single();

        if (attemptError) throw attemptError;
        if (!data) {
          throw new Error('Attempt not found or access denied');
        }

        setAttempt(data);
      } catch (err: any) {
        setAttemptError(err.message || 'Failed to load attempt');
      } finally {
        setAttemptLoading(false);
      }
    };

    loadAttempt();
  }, [profile, params.attemptId]);

  // Load questions when attempt is available
  useEffect(() => {
    if (!attempt) return;

    const loadQuestions = async () => {
      try {
        setQuestionsLoading(true);
        const supabase = createClientComponentClient();

        const { data, error: questionsError } = await supabase
          .from('questions')
          .select(`
            *
          `)
          .eq('quiz_id', attempt.quiz_id)
          .order('created_at', { ascending: true });

        if (questionsError) throw questionsError;
        setQuestions(data || []);
      } catch (err: any) {
        setQuestionsError(err.message || 'Failed to load questions');
      } finally {
        setQuestionsLoading(false);
      }
    };

    loadQuestions();
  }, [attempt, params.attemptId]);

  // Load answers when attempt is available
  useEffect(() => {
    if (!attempt) return;

    const loadAnswers = async () => {
      try {
        setAnswersLoading(true);
        const supabase = createClientComponentClient();

        const { data, error: answersError } = await supabase
          .from('quiz_answers')
          .select(`
            question_id,
            selected_option
          `)
          .eq('attempt_id', params.attemptId);

        if (answersError) throw answersError;

        const answersMap: Record<string, string> = {};
        (data || []).forEach((a: any) => {
          answersMap[a.question_id] = a.selected_option;
        });
        setAnswers(answersMap);
      } catch (err: any) {
        setAnswersError(err.message || 'Failed to load answers');
      } finally {
        setAnswersLoading(false);
      }
    };

    loadAnswers();
  }, [attempt, params.attemptId]);

  // Handle auth/checks
  if (profileError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Please Sign In</h1>
          <p className="text-muted-foreground">You need to be signed in to view quiz results.</p>
          <a href="/auth/sign-in" className="btn-primary">Sign In</a>
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
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (attemptError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-red-500">{attemptError}</p>
          <div className="mt-6 flex space-x-3">
            <Link href="/" className="btn-outline">
              Go Home
            </Link>
            <Link href="/subjects" className="btn-primary">
              Browse Subjects
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (attemptLoading) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading attempt...</p>
          </div>
        </div>
      </main>
    );
  }

  if (questionsError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-red-500">{questionsError}</p>
          <Link href={`/quiz-attempts/${params.attemptId}`} className="btn-outline">
            Back to Attempt
          </Link>
        </div>
      </main>
    );
  }

  if (questionsLoading) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        </div>
      </main>
    );
  }

  if (answersError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-red-500">{answersError}</p>
          <Link href={`/quiz-attempts/${params.attemptId}`} className="btn-outline">
            Back to Attempt
          </Link>
        </div>
      </main>
    );
  }

  if (answersLoading) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading answers...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Quiz Results</h1>
            <p className="text-muted-foreground">
              {attempt?.quizzes.title || 'Quiz'}
            </p>
          </div>
          <div className="text-right space-x-3">
            <Link
              href={`/quiz/${attempt?.quizzes.id}`}
              className="btn-outline"
            >
              View Quiz
            </Link>
          </div>
        </div>

        {/* Score Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Score</h3>
              <p className="text-3xl font-bold">
                {attempt?.score} / {attempt?.quizzes.question_count}
              </p>
              <p className="text-sm text-gray-500">
                {Math.round((attempt?.score || 0) / (attempt?.quizzes.question_count || 1) * 100)}%
              </p>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Percentage</h3>
              <p className="text-3xl font-bold">
                {Math.round((attempt?.percentage || 0))}%
              </p>
              <p className="text-sm text-gray-500">
                {attempt?.passed ? 'PASSED' : 'FAILED'}
              </p>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Time Taken</h3>
              <p className="text-2xl font-bold">
                {Math.floor((attempt?.time_taken_seconds || 0) / 60)}m {
                  (attempt?.time_taken_seconds || 0) % 60
                }s
              </p>
              <p className="text-sm text-gray-500">
                {attempt?.time_taken_seconds === 0
                  ? 'In progress'
                  : 'Completed'}
              </p>
            </div>
          </div>
        </div>

        {/* Answers Breakdown */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Answers Breakdown</h2>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const selected = answers[question.id] || '';
              const correct = question.correct_option;
              const isCorrect = selected === correct;

              return (
                <div
                  key={question.id}
                  className={`border rounded-lg p-4
                    ${isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'}
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{question.question_text}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${isCorrect
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'}
                      `}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="mr-2 font-medium">Your answer:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${selected === correct
                          ? 'bg-green-100 text-green-800'
                          : selected
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-200 dark:bg-gray-700'}
                      `}>
                        {selected || 'Not answered'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 font-medium">Correct answer:</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {correct}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review Answers */}
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Review Answers</h2>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const selected = answers[question.id] || '';
              const correct = question.correct_option;
              const isCorrect = selected === correct;

              return (
                <div key={question.id} className="border rounded-lg p-4 mb-4">
                  <div className="mb-2">
                    <h3 className="font-semibold">
                      Question {index + 1}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {question.question_text}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3 p-3 border rounded-lg
                      ${isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/10'}
                    ">
                      <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-md
                        ${isCorrect
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'}
                      ">
                        <span className="font-medium">{question.options?.[0] || 'A'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{question.options?.[0] || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border rounded-lg
                      ${isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/10'}
                    ">
                      <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-md
                        ${isCorrect
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'}
                      ">
                        <span className="font-medium">{question.options?.[1] || 'B'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{question.options?.[1] || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border rounded-lg
                      ${isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/10'}
                    ">
                      <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-md
                        ${isCorrect
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'}
                      ">
                        <span className="font-medium">{question.options?.[2] || 'C'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{question.options?.[2] || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border rounded-lg
                      ${isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/10'}
                    ">
                      <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-md
                        ${isCorrect
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'}
                      ">
                        <span className="font-medium">{question.options?.[3] || 'D'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{question.options?.[3] || ''}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}