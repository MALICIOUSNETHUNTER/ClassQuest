'use client';

import { getProfileClient } from '@/lib/auth';
import { createClientComponentClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SyllabusPage() {
  // Profile data
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Syllabus data
  const [subjects, setSubjects] = useState([]);
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

  // Load syllabus data when profile is available
  useEffect(() => {
    if (!profile) return;

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClientComponentClient();

        // Get clean IDs
        const cleanBranchId = profile.branch_id === 'null' ? null : profile.branch_id;
        const cleanSemesterId = profile.semester_id === 'null' ? null : profile.semester_id;

        // Fetch subjects for the user's branch/semester
        let subjectsData = [];
        if (cleanBranchId && cleanSemesterId) {
          const { data, error: subjectsError } = await supabase
            .from('subjects')
            .select(`
              *,
              semesters: semester_id (
                name,
                number,
                branches: branch_id (
                  name,
                  code
                )
              )
            `)
            .eq('semesters.branches.id', cleanBranchId)
            .eq('semesters.id', cleanSemesterId)
            .order('name');

          if (subjectsError) throw subjectsError;
          subjectsData = data || [];
        }
        setSubjects(subjectsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load subjects');
        console.error('Syllabus error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
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
              You need to be signed in to view the syllabus.
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
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading your syllabus...</p>
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
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading syllabus...</p>
        </div>
      </main>
    );
  }

  // Profile loaded successfully
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Syllabus
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  {profile.first_name && `Hello, ${profile.first_name}!`} Browse your courses and topics
                </p>
              </div>
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="font-medium">{(profile.first_name || 'S')[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/subjects/${subject.id}`}
                className="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Subject Icon */}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="text-xl font-medium">
                      {subject.code ? subject.code.substring(0, 2).toUpperCase() : 'SM'}
                    </span>
                  </div>

                  {/* Subject Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {subject.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        <span className="font-medium">{subject.semesters?.name}</span>
                        <span className="mx-1">•</span>
                        <span className="font-medium">{subject.semesters?.branches?.name}</span>
                      </span>
                      <span>
                        <span className="font-medium">Semester {subject.semesters?.number}</span>
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-4">
                      {subject.description || 'No description available for this subject.'}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-start">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Units: {subject.units_count || 0}
                    </div>
                    <Link
                      href={`/subjects/${subject.id}`}
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </Link>
            ))}

            {/* Empty State */}
            {subjects.length === 0 && (
              <div className="col-span-full">
                <div className="text-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-500/20 text-gray-500 mx-auto mb-4">
                    <span className="text-xl">📚</span>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                    No subjects found for your branch and semester
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Please contact your administrator to enroll in courses or check back later.
                  </p>
                  <div className="space-x-3">
                    <Link href="/dashboard">
                      <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                    <Link href="/subjects">
                      <Button>Browse All Subjects</Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Motivational Footer */}
      <div className="px-4 py-8 sm:px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Education is the passport to the future, for tomorrow belongs to those who prepare for it today.
          </p>
        </div>
      </div>
    </main>
  );
}