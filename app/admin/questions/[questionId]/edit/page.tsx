'use client';

import { getProfileClient } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function EditQuestionPage({ params }: { params: { questionId: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const questionId = params.questionId;

  // Question data
  const [question, setQuestion] = useState(null);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [questionError, setQuestionError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    quiz_id: '',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    explanation: '',
    points: 1,
  });

  // Quizzes for dropdown
  const [quizzes, setQuizzes] = useState([]);

  // Status messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load question data on mount
  useEffect(() => {
    const loadQuestion = async () => {
      if (!questionId) {
        router.push('/admin/questions');
        return;
      }

      try {
        setQuestionLoading(true);
        setQuestionError(null);
        const supabase = (await import('@/lib/supabase')).createServerComponentClient();

        const { data, error: questionError } = await supabase
          .from('questions')
          .select(`
            *,
            quizzes (
              id,
              title
            )
          `)
          .eq('id', questionId)
          .single();

        if (questionError) throw questionError;
        if (!data) {
          throw new Error('Question not found');
        }

        setQuestion(data);
        // Initialize form with existing data
        setFormData({
          quiz_id: data.quiz_id,
          question_text: data.question_text,
          option_a: data.option_a,
          option_b: data.option_b,
          option_c: data.option_c,
          option_d: data.option_d,
          correct_option: data.correct_option,
          explanation: data.explanation || '',
          points: data.points,
        });
      } catch (err: any) {
        setQuestionError(err.message || 'Failed to load question');
      } finally {
        setQuestionLoading(false);
      }
    };

    loadQuestion();
  }, [questionId, router]);

  // Load quizzes for dropdown
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const supabase = await import('@/lib/supabase').then(
          (mod) => mod.createServerComponentClient()
        );

        const { data, error } = await supabase
          .from('quizzes')
          .select(`
            id,
            title,
            topics (
              name,
              units (
                subjects (
                  name,
                  code,
                  semesters (
                    name,
                    number,
                    branches (
                      name,
                      code
                    )
                  )
                )
              )
            )
          `)
          .order('title');

        if (error) throw error;
        setQuizzes(data || []);
      } catch (err) {
        console.error('Failed to load quizzes:', err);
        // Non-fatal - we can still proceed with empty quizzes
      }
    };

    loadQuizzes();
  }, []);

  // Handle auth/checks
  useEffect(() => {
    const checkAuth = async () => {
      const profileResult = await getProfileClient();
      if (profileResult.error) {
        // In a real app, we'd redirect, but for now we'll show error state
        setError('Authentication error: Please sign in');
        return;
      }

      const profile = profileResult.data;
      if (!profile || profile.role !== 'admin') {
        setError('Access denied: Admin privileges required');
        return;
      }
    };

    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Basic validation
    if (!formData.quiz_id) {
      setError('Please select a quiz');
      setLoading(false);
      return;
    }

    if (!formData.question_text.trim()) {
      setError('Question text is required');
      setLoading(false);
      return;
    }

    if (!formData.option_a.trim()) {
      setError('Option A is required');
      setLoading(false);
      return;
    }

    if (!formData.option_b.trim()) {
      setError('Option B is required');
      setLoading(false);
      return;
    }

    if (!formData.option_c.trim()) {
      setError('Option C is required');
      setLoading(false);
      return;
    }

    if (!formData.option_d.trim()) {
      setError('Option D is required');
      setLoading(false);
      return;
    }

    if (!['A', 'B', 'C', 'D'].includes(formData.correct_option)) {
      setError('Please select a valid correct option');
      setLoading(false);
      return;
    }

    if (formData.points < 1) {
      setError('Points must be at least 1');
      setLoading(false);
      return;
    }

    try {
      const supabase = (await import('@/lib/supabase')).createServerComponentClient();

      // Check for duplicate question text within the same quiz (excluding current question)
      const { data: existingQuestion, error: checkError } = await supabase
        .from('questions')
        .select('id')
        .eq('quiz_id', formData.quiz_id)
        .eq('question_text', formData.question_text.trim())
        .neq('id', questionId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned (not an error)
        throw checkError;
      }

      if (existingQuestion) {
        throw new Error(`A question with this text already exists in the selected quiz.`);
      }

      // Get the original question to check if quiz_id is changing
        const { data: originalQuestion } = await supabase
          .from('questions')
          .select('quiz_id')
          .eq('id', questionId)
          .single();

        const { error: updateError } = await supabase
          .from('questions')
          .update({
            quiz_id: formData.quiz_id,
            question_text: formData.question_text.trim(),
            option_a: formData.option_a.trim(),
            option_b: formData.option_b.trim(),
            option_c: formData.option_c.trim(),
            option_d: formData.option_d.trim(),
            correct_option: formData.correct_option,
            explanation: formData.explanation.trim() || null,
            points: formData.points,
            updated_at: new Date().toISOString(),
          })
          .eq('id', questionId);

        // Update question counts if quiz changed
        if (!updateError && originalQuestion && originalQuestion.quiz_id !== formData.quiz_id) {
          // Decrement count for old quiz
          const { data: oldQuizData, error: decrementFetchError } = await supabase
            .from('quizzes')
            .select('question_count')
            .eq('id', originalQuestion.quiz_id)
            .single();

          if (!decrementFetchError && oldQuizData) {
            const { error: decrementError } = await supabase
              .from('quizzes')
              .update({ question_count: oldQuizData.question_count - 1 })
              .eq('id', originalQuestion.quiz_id);

            if (decrementError) {
              console.error('Failed to decrement question count for old quiz:', decrementError);
            }
          } else if (decrementFetchError) {
            console.error('Failed to fetch old quiz for decrement:', decrementFetchError);
          }

          // Increment count for new quiz
          const { data: newQuizData, error: incrementFetchError } = await supabase
            .from('quizzes')
            .select('question_count')
            .eq('id', formData.quiz_id)
            .single();

          if (!incrementFetchError && newQuizData) {
            const { error: incrementError } = await supabase
              .from('quizzes')
              .update({ question_count: newQuizData.question_count + 1 })
              .eq('id', formData.quiz_id);

            if (incrementError) {
              console.error('Failed to increment question count for new quiz:', incrementError);
            }
          } else if (incrementFetchError) {
            console.error('Failed to fetch new quiz for increment:', incrementFetchError);
          }
        }

      if (updateError) throw updateError;

      setSuccess(true);
      // Redirect to questions list after a short delay
      setTimeout(() => {
        router.push('/admin/questions');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  if (questionLoading || !question) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading question...</p>
        </div>
      </main>
    );
  }

  if (questionError) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Oops!</h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{questionError}</p>
          </div>
          <div className="space-x-3">
            <Link href="/admin/questions"><Button variant="outline">Back to Questions</Button></Link>
            <Link href="/dashboard"><Button>Go to Dashboard</Button></Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Edit Question
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  Update the question information
                </p>
              </div>
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="font-medium">Q</span>
              </div>
            </div>
            <Link href="/admin/questions" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus-ring-offset-2 focus-ring-primary">
              ← Back to Questions
            </Link>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="px-4 py-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 mb-6 p-4">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className="px-4 py-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-green-50 dark:bg-green-900/50 border-l-4 border-green-500 mb-6 p-4">
              <p className="text-green-700 dark:text-green-400">
                Question updated successfully! Redirecting...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Question Information
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quiz Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Quiz
                  </label>
                  <select
                    value={formData.quiz_id}
                    onChange={(e) => setFormData({ ...formData, quiz_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    required
                  >
                    <option value="">Select a quiz</option>
                    {quizzes.map((quiz) => (
                      <option key={quiz.id} value={quiz.id}>
                        {quiz.title} {quiz.topics ? (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            (`${quiz.topics.name} {'>'} ${quiz.topics.units?.subjects?.code}`)
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            (no topic info)
                          </span>
                        )}
                      </option>
                    ))}
                    {quizzes.length === 0 && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                        No quizzes available. Please create a quiz first.
                      </p>
                    )}
                  </select>
                </div>

                {/* Question Text */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Question Text
                  </label>
                  <textarea
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    rows={3}
                    placeholder="Enter the question text"
                    required
                  />
                </div>

                {/* Options */}
                <div className="space-y-6">
                  <fieldset className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <legend className="px-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                      Options
                    </legend>

                    {/* Option A */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        Option A
                      </label>
                      <input
                        type="text"
                        value={formData.option_a}
                        onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                        placeholder="Enter option A"
                        required
                      />
                    </div>

                    {/* Option B */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        Option B
                      </label>
                      <input
                        type="text"
                        value={formData.option_b}
                        onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                        placeholder="Enter option B"
                        required
                      />
                    </div>

                    {/* Option C */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        Option C
                      </label>
                      <input
                        type="text"
                        value={formData.option_c}
                        onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                        placeholder="Enter option C"
                        required
                      />
                    </div>

                    {/* Option D */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        Option D
                      </label>
                      <input
                        type="text"
                        value={formData.option_d}
                        onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                        placeholder="Enter option D"
                        required
                      />
                    </div>
                  </fieldset>
                </div>

                {/* Correct Option */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Correct Option
                  </label>
                  <div className="flex space-x-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="A"
                        checked={formData.correct_option === 'A'}
                        onChange={(e) => setFormData({ ...formData, correct_option: e.target.value })}
                        className="h-4 w-4 text-primary"
                        required
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">A</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="B"
                        checked={formData.correct_option === 'B'}
                        onChange={(e) => setFormData({ ...formData, correct_option: e.target.value })}
                        className="h-4 w-4 text-primary"
                        required
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">B</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="C"
                        checked={formData.correct_option === 'C'}
                        onChange={(e) => setFormData({ ...formData, correct_option: e.target.value })}
                        className="h-4 w-4 text-primary"
                        required
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">C</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="D"
                        checked={formData.correct_option === 'D'}
                        onChange={(e) => setFormData({ ...formData, correct_option: e.target.value })}
                        className="h-4 w-4 text-primary"
                        required
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">D</span>
                    </label>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Explanation (Optional)
                  </label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    rows={4}
                    placeholder="Enter explanation for the correct answer (shown after quiz)"
                  />
                </div>

                {/* Points */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Points
                  </label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    min="1"
                    required
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin/questions')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="ml-4"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Footer */}
      <div className="px-4 py-8 sm:px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Keep your questions accurate and relevant to ensure effective assessment of student learning.
          </p>
        </div>
      </div>
    </main>
  );
}