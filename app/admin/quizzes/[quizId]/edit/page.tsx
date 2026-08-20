'use client';

import { getProfileClient } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export default function EditQuizPage() {
  const params = useParams<{ quizId: string }>();
  const quizId = params?.quizId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    timeLimitMinutes: 10,
    passingPercentage: 50,
    topicId: '',
  });
  const [quiz, setQuiz] = useState<any>(null);
  const [topics, setTopics] = useState<Array<any>>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [questionCount, setQuestionCount] = useState(0);
  const router = useRouter();

  // Handle auth/checks - using useEffect to avoid promise issues during render
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

  if (!quizId) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Quiz Not Found
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Invalid quiz ID provided.
            </p>
            </div>
            <div className="space-x-3">
            <Link href="/admin/quizzes"><Button variant="outline">Back to Quizzes</Button></Link>
          </div>
          </div>
        </main>
    );
  }

  // Fetch quiz data
  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const supabase = await import('@/lib/supabase').then(
        (mod) => mod.createServerComponentClient()
      );

      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select(`
          *,
          topics: topic_id (
            *,
            units: unit_id (
              *,
              subjects: subject_id (
                *,
                semesters: semester_id (
                  *,
                  branches: branch_id (
                    *
                  )
                )
              )
            )
          )
        `)
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;
      if (!quizData) {
        setError('Quiz not found');
        return;
      }

      setQuiz(quizData);
      setFormData({
        title: quizData.title,
        description: quizData.description || '',
        difficulty: quizData.difficulty,
        timeLimitMinutes: quizData.time_limit_minutes,
        passingPercentage: quizData.passing_percentage,
        topicId: quizData.topic_id,
      });
      setQuestionCount(quizData.question_count || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  // Fetch topics for dropdown
  const fetchTopics = async () => {
    try {
      setTopicsLoading(true);
      const supabase = await import('@/lib/supabase').then(
        (mod) => mod.createServerComponentClient()
      );

      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select(`
          *,
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
        `)
        .order('created_at', { ascending: false });

      if (topicsError) throw topicsError;
      setTopics(topicsData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load topics');
    } finally {
      setTopicsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = await import('@/lib/supabase').then(
        (mod) => mod.createServerComponentClient()
      );

      const { error: quizError } = await supabase
        .from('quizzes')
        .update({
          title: formData.title,
          description: formData.description,
          difficulty: formData.difficulty,
          time_limit_minutes: formData.timeLimitMinutes,
          passing_percentage: formData.passingPercentage,
          topic_id: formData.topicId,
          // Note: Not updating question_count here as it should be managed separately
          // when questions are added/removed
        })
        .eq('id', quizId);

      if (quizError) throw quizError;

      setSuccess(true);
      // Redirect to quizzes list after a short delay
      setTimeout(() => {
        router.push('/admin/quizzes');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update quiz');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete quiz
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;

    try {
      setLoading(true);
      setError(null);
      const supabase = await import('@/lib/supabase').then(
        (mod) => mod.createServerComponentClient()
      );

      // First check if there are any questions associated with this quiz
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('id')
        .eq('quiz_id', quizId)
        .limit(1);

      if (questionsError) throw questionsError;

      if (questionsData && questionsData.length > 0) {
        throw new Error('Cannot delete quiz that has associated questions. Please delete or reassign questions first.');
      }

      // Check if there are any quiz attempts
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('id')
        .eq('quiz_id', quizId)
        .limit(1);

      if (attemptsError) throw attemptsError;

      if (attemptsData && attemptsData.length > 0) {
        throw new Error('Cannot delete quiz that has been attempted by students. Please remove all attempts first.');
      }

      // If we get here, it's safe to delete
      const { error: deleteError } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (deleteError) throw deleteError;

      // Redirect to quizzes list
      router.push('/admin/quizzes');
    } catch (err: any) {
      // Check if it's a validation error we want to show
      if (err.message && (
          err.message.includes('Cannot delete quiz') ||
          err.message.includes('associated') ||
          err.message.includes('questions') ||
          err.message.includes('attempts')
      )) {
        setError(err.message);
      } else {
        setError('Failed to delete quiz: ' + (err.message || 'Unknown error'));
      }
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchQuiz();
    fetchTopics();
  }, [quizId]);

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Oops!
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {error}
            </p>
          </div>
          <div className="space-x-3">
            <Link href="/admin/quizzes"><Button variant="outline">Back to Quizzes</Button></Link>
            <Link href="/auth/sign-in"><Button>Sign In</Button></Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading || !quiz) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading quiz...</p>
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
                  Edit Quiz
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  Edit quiz details for "{quiz.title}"
                </p>
              </div>
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="font-medium">Q</span>
              </div>
            </div>
            <div className="flex space-x-3 mb-4">
              <Link href="/admin/quizzes">
                <Button variant="outline">
                  ← Back to Quizzes
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800"
              >
                Delete Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="space-y-6">
                {/* Status Messages */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 mb-4 p-4">
                    <p className="text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 dark:bg-green-900/50 border-l-4 border-green-500 mb-4 p-4">
                    <p className="text-green-700 dark:text-green-400">
                      Quiz updated successfully! Redirecting...
                    </p>
                  </div>
                )}

                {/* Quiz Information Card */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Quiz Information
                  </h2>

                  {/* Topic Info */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Topic
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {`${quiz.topics.units.subjects.name} (${quiz.topics.units.subjects.code}) > ${quiz.topics.units.name} > ${quiz.topics.name}`}
                    </p>
                  </div>

                  {/* Question Count Info */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Question Count
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {questionCount} questions
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Note: Question count is managed separately in the question management system
                    </p>
                  </div>

                  {/* Edit Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Topic Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        Topic (*)
                      </label>
                      {topicsLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mb-0"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Loading topics...</span>
                        </div>
                      ) : topics.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          No topics available. Please create a topic first.
                        </p>
                      ) : (
                        <select
                          value={formData.topicId}
                          onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                          required
                        >
                          <option value="">Select a topic</option>
                          {topics.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                              {`${topic.units.subjects.name} (${topic.units.subjects.code}) > ${topic.units.name} > ${topic.name}`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        Quiz Title (*)
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                        placeholder="Enter quiz title"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        Description (Optional)
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                        rows={4}
                        placeholder="Enter a description for the quiz"
                      />
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        Difficulty Level (*)
                      </label>
                      <div className="flex space-x-4">
                        {[['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']].map(
                          ([value, label]) => (
                            <label key={value} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value={value}
                                checked={formData.difficulty === value}
                                onChange={(e) =>
                                  setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })
                                }
                                className="h-4 w-4 text-primary"
                              />
                              <span className={`
                                text-sm font-medium text-gray-900 dark:text-gray-100
                                ${value === 'easy' ? 'text-green-800' : value === 'medium' ? 'text-yellow-800' : 'text-red-800'}
                              `}>
                                {label}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>

                    {/* Time Limit */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        Time Limit (minutes) (*)
                      </label>
                      <input
                        type="number"
                        value={formData.timeLimitMinutes}
                        onChange={(e) => setFormData({ ...formData, timeLimitMinutes: parseInt(e.target.value) || 10 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                        min="1"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Minimum 1 minute
                      </p>
                    </div>

                    {/* Passing Percentage */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        Passing Percentage (%) (*)
                      </label>
                      <input
                        type="number"
                        value={formData.passingPercentage}
                        onChange={(e) => setFormData({ ...formData, passingPercentage: parseInt(e.target.value) || 50 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                        min="0"
                        max="100"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Between 0 and 100
                      </p>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4 pt-6">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/admin/quizzes/${quizId}`)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading || !formData.topicId}
                        className="ml-4"
                      >
                        {loading ? 'Updating...' : 'Update Quiz'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Footer */}
      <div className="px-4 py-8 sm:px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Edit quiz details to keep your assessments relevant and effective.
          </p>
        </div>
      </div>
    </main>
  );
}