'use client';

import { getProfileClient } from '@/lib/auth';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FreePeriodPage() {
  // Profile data
  const [profile, setProfile] = useState<null | { [key: string]: any }>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Quiz data
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('30');

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

  // Fetch quizzes when profile or selectedTime changes
  useEffect(() => {
    // If we don't have profile or missing IDs, we cannot fetch
    if (!profile || !profile.branch_id || !profile.semester_id) {
      // Reset quiz data
      setQuizzes([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        const supabase = (await import('@/lib/supabase')).createServerComponentClient();

        // Get quizzes with estimated time based on question count
        // Assuming 1 minute per question as a baseline
        const { data: quizzesData, error: quizzesError } = await supabase
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
          .eq('topics.units.subjects.semesters.branches.id', profile.branch_id)
          .eq('topics.units.subjects.semesters.id', profile.semester_id)
          .order('created_at', { ascending: false });

        if (quizzesError) throw quizzesError;

        // Process quizzes to add estimated time and filter by selected time
        const processedQuizzes = quizzesData
          .map(quiz => ({
            ...quiz,
            estimatedTime: Math.max(5, quiz.question_count), // Minimum 5 minutes
          }))
          .filter(quiz =>
            selectedTime === '30'
              ? quiz.estimatedTime >= 30
              : quiz.estimatedTime <= parseInt(selectedTime)
          )
          .sort((a, b) => {
            // Prioritize: subjects you might need practice on (simplified)
            // In a real app, this would use historical performance data
            return b.estimatedTime - a.estimatedTime; // Descending by time
          });

        setQuizzes(processedQuizzes);
      } catch (err: any) {
        setError(err.message || 'Failed to load quizzes');
        console.error('Free period error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [profile, selectedTime]);

  // Handle auth/checks
  if (profileError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-red-500">{profileError}</p>
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

  if (error) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-red-500">{error}</p>
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

  if (loading) {
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

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Free Period Mode</h1>
            <p className="text-muted-foreground">
              Select how much time you have available to find a suitable quiz.
            </p>
          </div>
        </div>

        {/* Time Selector */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Available Time</label>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="border rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
            <span className="text-sm text-gray-500">
              {selectedTime === '30' ? '30+ minutes' : selectedTime + ' minutes max'}
            </span>
          </div>
        </div>

        {/* Quizzes List */}
        {quizzes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No quizzes available for the selected time. Try adjusting the time or check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{quiz.title}</h2>
                    <p className="text-muted-foreground">{quiz.description || 'No description available'}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {quiz.question_count} Questions
                      </span>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {quiz.time_limit_minutes} min timer
                      </span>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                        Pass: {quiz.passing_percentage}%
                      </span>
                      <span className={`
                        px-3 py-1 rounded-full
                        ${quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}
                      `}>
                        {quiz.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Link
                      href={`/quiz/${quiz.id}`}
                      className="btn-primary px-6 py-2"
                    >
                      Start Quiz
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}