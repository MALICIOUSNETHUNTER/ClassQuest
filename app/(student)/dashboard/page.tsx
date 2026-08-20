'use client';

import { getProfileClient } from '@/lib/auth';
import { createClientComponentClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function StudentDashboard() {
  // Profile data
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Dashboard data - must be declared here, before any early returns
  const [subjects, setSubjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Load dashboard data when profile is available
  useEffect(() => {
    if (!profile) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClientComponentClient();

        // Cleanse ID values - convert string 'null' to actual null
        const cleanBranchId = profile.branch_id === 'null' ? null : profile.branch_id;
        const cleanSemesterId = profile.semester_id === 'null' ? null : profile.semester_id;

        // Fetch subjects for this student's branch and semester - only if we have both IDs
        let subjectsData = [];
        if (cleanBranchId && cleanSemesterId) {
          const { data, error: subjectsError } = await supabase
            .from('subjects')
            .select(`
              id,
              semesters: semester_id (
                branch_id
              )
            `)
            .eq('semesters.branch_id', cleanBranchId)
            .eq('semesters.id', cleanSemesterId);

          if (subjectsError) throw subjectsError;
          subjectsData = data || [];
        }
        setSubjects(subjectsData);

        // Fetch recent quiz attempts
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('quiz_attempts')
          .select(`
            id,
            score,
            percentage,
            passed,
            completed_at,
            quizzes (
              title,
              topics (
                name,
                units (
                  name,
                  subjects (
                    name
                  )
                )
              )
            )
          `)
          .eq('user_id', profile.id)
          .order('completed_at', { ascending: false })
          .limit(5);

        if (attemptsError) throw attemptsError;

        // Transform to match expected format for recentActivity
        const formattedActivity = (attemptsData || []).map(attempt => {
          const quiz = attempt.quizzes?.[0];
          const topic = quiz?.topics?.[0];
          const unit = topic?.units?.[0];
          const subject = unit?.subjects?.[0];

          return {
            id: attempt.id,
            quizzes: {
              title: quiz?.title ?? '',
              topics: {
                name: topic?.name ?? '',
                units: {
                  name: unit?.name ?? ''
                }
              }
            },
            score: attempt.score,
            percentage: attempt.percentage,
            passed: attempt.passed,
            completed_at: attempt.completed_at
          };
        });

        setRecentActivity(formattedActivity);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [profile]);

  // Handle auth/checks
  if (profileError) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Please Sign In
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              You need to be signed in to access your dashboard.
            </p>
          </div>
          <a href="/auth/sign-in" className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-md transition-colors">
            Sign In
          </a>
        </div>
      </main>
    );
  }

  if (profileLoading || !profile) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Oops!</h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {error}
            </p>
          </div>
          <div className="space-x-3">
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
            <Link href="/subjects">
              <Button>Browse Subjects</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Calculate average score from recent activity
  const averageScore = recentActivity.length > 0
    ? Math.round(
        (recentActivity.reduce((sum, activity) => sum + (activity.percentage || 0), 0) /
          recentActivity.length)
      )
    : 0;

  // Calculate study streak (simplified - in a real app this would be more complex)
  const studyStreak = 7; // Placeholder

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Welcome back, {profile.first_name || 'Student'}!
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  Ready to learn something new today?
                </p>
              </div>
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="font-medium">{(profile.first_name || 'S')[0]}</span>
              </div>
            </div>
            <Link href="/syllabus" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus-ring-offset-2 focus-ring-primary">
              Browse Syllabus
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Subjects Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
                  <span className="font-medium text-lg">S</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Subjects Enrolled
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Courses available for your branch and semester
                  </p>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {subjects.length}
              </p>
            </div>
          </div>

          {/* Quizzes Taken Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                  <span className="font-medium text-lg">Q</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Quizzes Taken
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Completed assessments
                  </p>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {recentActivity.length}
              </p>
            </div>
          </div>

          {/* Average Score Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-purple-500">
                  <span className="font-medium text-lg">📊</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Average Score
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Performance across all quizzes
                  </p>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {averageScore}%
              </p>
            </div>
          </div>

          {/* Study Streak Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                  <span className="font-medium text-lg">🔥</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Study Streak
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Consecutive days of learning
                  </p>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {studyStreak} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Recent Activity
          </h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-shrink-0 flex h-9 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
                        <span className="font-medium text-lg">Q</span>
                      </div>
                      <div className="flex-1 ml-4">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {activity.quizzes.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.quizzes.topics.name} • {activity.quizzes.topics.units.name}
                        </p>
                      </div>
                      <div className="text-right space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                          ${activity.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        `}>
                          {activity.passed ? 'PASSED' : 'FAILED'}
                        </span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {activity.percentage}%
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Completed{' '}
                      {new Date(activity.completed_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-500/20 text-gray-500 mx-auto mb-4">
                <span className="text-xl">📚</span>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                No recent activity yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start taking quizzes to see your progress here
              </p>
              <div className="mt-6">
                <Link href="/subjects" className="btn-primary">
                  Browse Subjects
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Motivational Footer */}
      <div className="px-4 py-8 sm:px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Every quiz you take brings you closer to your goals. Keep learning, keep growing!
          </p>
        </div>
      </div>
    </main>
  );
}