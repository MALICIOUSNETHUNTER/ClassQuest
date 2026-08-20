'use client';

import { getProfileClient } from '@/lib/auth';
import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewQuizPage() {
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
  const [topics, setTopics] = useState<Array<any>>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const router = useRouter();

  // Handle auth/checks - using useEffect to avoid promise issues during render
  React.useEffect(() => {
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

  // Fetch topics for dropdown
  const fetchTopics = async () => {
    try {
      setTopicsLoading(true);
      const supabaseModule = await import('@/lib/supabase');
      const supabase = supabaseModule.createServerComponentClient();

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
      const supabaseModule = await import('@/lib/supabase');
      const supabase = supabaseModule.createServerComponentClient();

      const { data, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: formData.title,
          description: formData.description,
          difficulty: formData.difficulty,
          question_count: 0, // Will be updated as questions are added
          time_limit_minutes: formData.timeLimitMinutes,
          passing_percentage: formData.passingPercentage,
          topic_id: formData.topicId,
        })
        .select();

      if (quizError) throw quizError;

      setSuccess(true);
      // Redirect to quizzes list after a short delay
      setTimeout(() => {
        router.push('/admin/quizzes');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  // Load topics on mount
  React.useEffect(() => {
    fetchTopics();
  }, []);

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

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Create New Quiz
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  Create a new quiz for students to take
                </p>
              </div>
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="font-medium">Q</span>
              </div>
            </div>
            <Link href="/admin/quizzes" className="btn-outline">
              ← Back to Quizzes
            </Link>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 mb-6 p-4">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/50 border-l-4 border-green-500 mb-6 p-4">
              <p className="text-green-700 dark:text-green-400">
                Quiz created successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Quiz Information
              </h2>
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
                    onClick={() => router.push('/admin/quizzes')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !formData.topicId}
                    className="ml-4"
                  >
                    {loading ? 'Creating...' : 'Create Quiz'}
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
            Create engaging quizzes to assess student learning and track progress.
          </p>
        </div>
      </div>
    </main>
  );
}