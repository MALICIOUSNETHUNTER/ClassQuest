'use client';

import { getProfileClient } from '@/lib/auth';
import { createClientComponentClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SubjectsPage() {
  // Profile data
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Subjects data
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);

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

  // Load subjects when profile is available
  useEffect(() => {
    if (!profile) return;

    const fetchSubjects = async () => {
      try {
        setSubjectsLoading(true);
        const supabase = createClientComponentClient();

        // Cleanse ID values - convert string 'null' to actual null
        const cleanBranchId = profile.branch_id === 'null' ? null : profile.branch_id;
        const cleanSemesterId = profile.semester_id === 'null' ? null : profile.semester_id;

        // Fetch subjects for the user's branch/semester - only if we have both IDs
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
        setSubjectsError(err.message || 'Failed to load subjects');
      } finally {
        setSubjectsLoading(false);
      }
    };

    fetchSubjects();
  }, [profile]);

  // Handle auth/checks
  if (profileError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Please Sign In</h1>
          <p className="text-muted-foreground">You need to be signed in to view subjects.</p>
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
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (subjectsError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-red-500">{subjectsError}</p>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  if (subjectsLoading) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading subjects...</p>
          </div>
        </div>
      </main>
    );
  }

  // Profile loaded successfully
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Subjects
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {profile.semesters?.name} • {profile.branches?.name}
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid gap-6">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/subjects/${subject.id}`}
              className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow hover:border-primary/20 border"
            >
              <div className="p-6">
                {/* Subject Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-xl">
                    {subject.code?.charAt(0) || subject.name?.charAt(0) || 'S'}
                  </span>
                </div>

                {/* Subject Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {subject.name}
                  </h3>
                  {subject.code && (
                    <p className="text-sm text-muted-foreground">
                      Code: {subject.code}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                    {subject.description || 'No description available'}
                  </p>
                </div>
              </div>
            </Link>
          ))}

          {/* Empty State */}
          {subjects.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No subjects found for your branch and semester.
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Please contact your administrator to enroll in courses.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}