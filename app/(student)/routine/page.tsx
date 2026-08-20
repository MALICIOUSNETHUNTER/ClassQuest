'use client';

import { getProfileClient } from '@/lib/auth';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RoutinePage() {
  // Profile data
  const [profile, setProfile] = useState<null | { [key: string]: any }>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Routine data
  const [routines, setRoutines] = useState<any[]>([]);
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

  // Fetch routines when profile changes
  useEffect(() => {
    // If we don't have profile or missing IDs, we cannot fetch
    if (!profile || !profile.branch_id || !profile.semester_id) {
      // Reset routine data
      setRoutines([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchRoutines = async () => {
      try {
        setLoading(true);
        const supabase = await import('@/lib/supabase').then(
          (mod) => mod.createServerComponentClient()
        );

        // Fetch routines for the user's branch/semester
        const { data: routinesData, error: routinesError } = await supabase
          .from('routines')
          .select(`
            *,
            subjects: subject_id (
              name,
              code
            ),
            branches: branch_id (
              name,
              code
            ),
            semesters: semester_id (
              name,
              number
            )
          `)
          .eq('branches.id', profile.branch_id)
          .eq('semesters.id', profile.semester_id)
          .order('day_of_week')
          .order('start_time');

        if (routinesError) throw routinesError;
        setRoutines(routinesData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load routine');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, [profile]);

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

  // Helper function to get day name
  const getDayName = (dayIndex: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex] || '';
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Class Routine</h1>
            <p className="text-muted-foreground">
              View your weekly class schedule.
            </p>
          </div>
        </div>

        {/* Routine Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:border-gray-700">
              {routines.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No routine found for your branch and semester.
                  </td>
                </tr>
              ) : (
                routines.map((routine) => (
                  <tr key={routine.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getDayName(parseInt(routine.day_of_week))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {new Date(`1970-01-01T${routine.start_time}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                      {new Date(`1970-01-01T${routine.end_time}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {routine.subjects?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {routine.room || 'TBA'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}