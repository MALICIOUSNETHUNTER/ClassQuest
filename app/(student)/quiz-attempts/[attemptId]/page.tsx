'use client';

import { getProfileClient } from '@/lib/auth';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function QuizTakePage({ params }: { params: { attemptId: string } }) {
  // Profile data
  const [profile, setProfile] = useState<null | { [key: string]: any }>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Attempt data
  const [attempt, setAttempt] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const router = useRouter();

  // Handle answer change
  const handleAnswerChange = (questionId: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // Handle next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Handle previous question
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    // Check if all questions are answered
    const unanswered = Object.keys(answers).filter((qId) => !answers[qId]);
    if (unanswered.length > 0) {
      if (
        !window.confirm(
          `You have ${unanswered.length} unanswered questions. Submit anyway?`
        )
      ) {
        return;
      }
    }

    setSubmitted(true);

    try {
      const supabaseModule = await import('@/lib/supabase');
      const supabase = supabaseModule.createClientComponentClient();

      // Calculate score
      let score = 0;
      questions.forEach((question) => {
        if (answers[question.id] === question.correct_option) {
          score += question.points;
        }
      });

      const totalPoints = questions.reduce(
        (sum, q) => sum + q.points,
        0
      );
      const percentage = (score / totalPoints) * 100;
      const passed = percentage >= quiz.passing_percentage;
      const timeTakenSeconds = Math.floor(
        (Date.now() - startTime) / 1000
      );

      // Update the attempt with results
      const { error: updateError } = await supabase
        .from('quiz_attempts')
        .update({
          score: score,
          percentage: percentage,
          passed: passed,
          time_taken_seconds: timeTakenSeconds,
          completed_at: new Date().toISOString(),
        })
        .eq('id', params.attemptId);

      if (updateError) throw updateError;

      // Save individual answers
      const answerRecords = Object.entries(answers).map(
        ([questionId, selectedOption]) => ({
          attempt_id: params.attemptId,
          question_id: questionId,
          selected_option: selectedOption,
          is_correct:
            selectedOption ===
            questions.find((q) => q.id === questionId)?.correct_option,
          answered_at: new Date().toISOString(),
        })
      );

      if (answerRecords.length > 0) {
        const { error: answersError } = await supabase
          .from('quiz_answers')
          .insert(answerRecords);

        if (answersError) throw answersError;
      }

      // Note: redirection handled by the submitted block above
    } catch (err: any) {
      setError('Failed to submit quiz: ' + (err.message || 'Unknown error'));
      setSubmitted(false);
    }
  }, [answers, questions, quiz, params.attemptId, startTime]);

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

  // Load attempt data when profile and attemptId are available
  useEffect(() => {
    if (!profile) return;

    const loadAttempt = async () => {
      try {
        setLoading(true);
        setError(null);
        const supabaseModule = await import('@/lib/supabase');
        const supabase = supabaseModule.createClientComponentClient();

        // Get the quiz attempt to verify it belongs to the user
        const { data: attemptData, error: attemptError } = await supabase
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
        if (!attemptData) {
          setError('Quiz attempt not found or access denied');
          return;
        }

        setAttempt(attemptData);
        setQuiz(attemptData.quizzes);

        // Get questions for this quiz
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', attemptData.quiz_id)
          .order('created_at', { ascending: true });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);

        // Initialize answers object
        const initialAnswers: Record<string, string> = {};
        questionsData?.forEach((q) => {
          initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);

        // Set start time from attempt or now if not started
        setStartTime(
          attemptData.started_at
            ? new Date(attemptData.started_at).getTime()
            : Date.now()
        );
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    loadAttempt();
  }, [params.attemptId, profile]); // Removed handleSubmit and startTime from dependencies

  // Set up timer if quiz has a time limit
  useEffect(() => {
    if (!quiz || !quiz.time_limit_minutes || quiz.time_limit_minutes <= 0) {
      return;
    }

    const totalTimeMs = quiz.time_limit_minutes * 60 * 1000;
    const endTime = startTime + totalTimeMs;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      if (remaining <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        // Auto-submit when time runs out
        handleSubmit();
      } else {
        setTimeLeft(Math.ceil(remaining / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, startTime]); // Removed handleSubmit from dependencies

  // Handle redirect after submission
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        router.push(`/quiz-attempts/${params.attemptId}/results`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [submitted, router, params.attemptId]);

  // Handle auth/checks
  if (profileError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Please Sign In</h1>
          <p className="text-muted-foreground">You need to be signed in to take quizzes.</p>
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
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

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

  if (loading || !quiz || questions.length === 0) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Loading quiz...</p>
              </>
            ) : (
              <p className="text-muted-foreground">Quiz data not available</p>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-bold">Quiz Submitted!</h2>
            <p className="text-muted-foreground mt-4">
              Your quiz has been submitted. Redirecting to results...
            </p>
          </div>
        </div>
      </main>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground">
              {quiz.description || 'No description available'}
            </p>
          </div>
          <div className="text-right space-x-4">
            {timeLeft > 0 && (
              <div className="text-lg font-mono text-red-600">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(
                  2,
                  '0'
                )}
              </div>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-medium
              ${quiz.difficulty === 'easy'
                ? 'bg-green-100 text-green-800'
                : quiz.difficulty === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'}
            ">
              {quiz.difficulty}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-primary transition-width duration-300 w-${(
                  (currentQuestionIndex + 1) / questions.length
                ) * 100}%`}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">
              Question {currentQuestionIndex + 1}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
              {currentQuestion.question_text}
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-4">
            {['A', 'B', 'C', 'D'].map((option) => (
              <div
                key={option}
                className={`flex items-start space-x-3 p-4 border rounded-lg
                  ${answers[currentQuestion.id] === option
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700'}
                  hover:border-gray-300 dark:hover:border-gray-600
                  transition-all duration-200
                  cursor-pointer`}
                onClick={() => handleAnswerChange(currentQuestion.id, option)}
              >
                <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-md
                  ${answers[currentQuestion.id] === option
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-50 dark:bg-gray-800'}
                ">
                  <span className="font-medium">{option}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300">
                    {currentQuestion[`option_${option.toLowerCase()}`]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between items-center">
          <div className="flex-1">
            {isFirstQuestion ? (
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled
              >
                Previous
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handlePrev}
              >
                Previous
              </Button>
            )}
          </div>
          <div className="flex-1 text-right">
            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                className="w-full"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full"
              >
                Next Question
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}