'use client';

import { getProfileClient } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewQuestionPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
  const [quizzes, setQuizzes] = useState([]);
  const [profile, setProfile] = useState<null | { [key: string]: any }>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const router = useRouter();

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

  // Load quizzes for dropdown
  const loadQuizzes = async () => {
    try {
      const supabase = await import('@/lib/supabase').then(
        (mod) => mod.createServerComponentClient()
      );

      // Get quizzes with topic/subject/semester/branch info for filtering/display
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

  // Load quizzes on mount
  useEffect(() => {
    loadQuizzes();
  }, []);

  // Handle auth/checks
  if (profileError) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Error
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {profileError}
            </p>
          </div>
          <div className="space-x-3">
            <Link href="/" className="btn-outline">Go Home</Link>
            {(!profileError || !profileError.includes('Authentication')) && (
              <Link href="/auth/sign-in" className="btn">Sign In</Link>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (profileLoading || !profile) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Access Denied
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              You do not have permission to access the admin panel.
            </p>
          </div>
          <div className="space-x-3">
            <Link href="/" className="btn-outline">Go Home</Link>
            {(!profileError || !profileError.includes('Authentication')) && (
              <Link href="/auth/sign-in" className="btn">Sign In</Link>
            )}
          </div>
        </div>
      </main>
    );
  }

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

      // Check for duplicate question text within the same quiz
      const { data: existingQuestion, error: checkError } = await supabase
        .from('questions')
        .select('id')
        .eq('quiz_id', formData.quiz_id)
        .eq('question_text', formData.question_text.trim())
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned (not an error)
        throw checkError;
      }

      if (existingQuestion) {
        throw new Error(`A question with this text already exists in the selected quiz.`);
      }

      const { data, error } = await supabase
        .from('questions')
        .insert({
          quiz_id: formData.quiz_id,
          question_text: formData.question_text.trim(),
          option_a: formData.option_a.trim(),
          option_b: formData.option_b.trim(),
          option_c: formData.option_c.trim(),
          option_d: formData.option_d.trim(),
          correct_option: formData.correct_option,
          explanation: formData.explanation.trim() || null,
          points: formData.points,
          question_type: 'multiple_choice', // Default from schema
        })
        .select();

      // Update question count for the quiz if question was created successfully
      if (!error && data) {
        // Get current question count
        const { data: quizData, error: countError } = await supabase
          .from('quizzes')
          .select('question_count')
          .eq('id', formData.quiz_id)
          .single();

        if (!countError && quizData) {
          const newCount = quizData.question_count + 1;
          const { error: updateError } = await supabase
            .from('quizzes')
            .update({ question_count: newCount })
            .eq('id', formData.quiz_id);

          if (updateError) {
            console.error('Failed to update question count:', updateError);
            // We don't throw here because the question was created successfully
            // but we log the error for investigation
          }
        } else if (countError) {
          console.error('Failed to fetch question count:', countError);
        }
      }

      if (error) throw error;

      setSuccess(true);
      // Redirect to questions list after a short delay
      setTimeout(() => {
        router.push('/admin/questions');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Create New Question
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  Add a new question to a quiz
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

      {/* Form */}
      <div className="px-4 py-8 sm:px-6">
        <div className="max-w-7xl:max-w-7xl mx-auto lg:px-6">
          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 mb-6 p-4">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/50 border-l-4 border-green-500 mb-6 p-4">
              <p className="text-green-700 dark:text-green-400">
                Question created successfully! Redirecting...
              </p>
            </div>
          )}

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
                            ({quiz.topics.name} {'>'} {quiz.topics.units?.subjects?.code})
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
                    {loading ? 'Creating...' : 'Create Question'}
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
            Create clear, well-structured questions that effectively test student knowledge and understanding.
          </p>
        </div>
      </div>
    </main>
  );
}