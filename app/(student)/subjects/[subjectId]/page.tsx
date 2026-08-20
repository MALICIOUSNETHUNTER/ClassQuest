'use client';

import { getProfileClient } from '@/lib/auth';
import { createClientComponentClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SubjectDetailPage({ params }: { params: { subjectId: string } }) {
  // Profile data
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Subject data
  const [subject, setSubject] = useState(null);
  const [subjectLoading, setSubjectLoading] = useState(true);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  // Units data
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [unitsError, setUnitsError] = useState<string | null>(null);

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

  // Load subject when profile is available and we have subjectId
  useEffect(() => {
    if (!profile || !params.subjectId) return;

    const fetchSubject = async () => {
      try {
        setSubjectLoading(true);
        const supabase = createClientComponentClient();

        // Fetch subject with semester and branch info for validation
        const { data, error: subjectError } = await supabase
          .from('subjects')
          .select(`
            *,
            semesters: semester_id (
              id,
              name,
              number,
              branches: branch_id (
                id,
                name,
                code
              )
            )
          `)
          .eq('id', params.subjectId)
          .single();

        if (subjectError) throw subjectError;

        // Verify the subject belongs to the user's branch and semester
        if (
          !data.semesters ||
          !data.semesters.branches ||
          data.semesters.branches.id !== profile.branch_id ||
          data.semesters.id !== profile.semester_id
        ) {
          throw new Error('Subject not found or access denied');
        }

        setSubject(data);
      } catch (err: any) {
        setSubjectError(err.message || 'Failed to load subject');
      } finally {
        setSubjectLoading(false);
      }
    };

    fetchSubject();
  }, [profile, params.subjectId]);

  // Load units when subject is available
  useEffect(() => {
    if (!subject) return;

    const fetchUnits = async () => {
      try {
        setUnitsLoading(true);
        const supabase = createClientComponentClient();

        const { data, error: unitsError } = await supabase
          .from('units')
          .select(`
            *,
            subjects: subject_id (
              name,
              code
            )
          `)
          .eq('subject_id', subject.id)
          .order('name');

        if (unitsError) throw unitsError;
        setUnits(data || []);
      } catch (err: any) {
        setUnitsError(err.message || 'Failed to load units');
      } finally {
        setUnitsLoading(false);
      }
    };

    fetchUnits();
  }, [subject]);

  // Handle auth/checks
  if (profileError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Please Sign In</h1>
          <p className="text-muted-foreground">You need to be signed in to view subject details.</p>
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

  if (subjectError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Subject Not Found</h1>
          <p className="text-red-500">{subjectError}</p>
          <div className="mt-6 flex space-x-3">
            <Link href="/" className="btn-outline">
              Go Home
            </Link>
            <Link href="/subjects" className="btn-primary">
              Back to Subjects
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (subjectLoading) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading subject...</p>
          </div>
        </div>
      </main>
    );
  }

  if (unitsError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-red-500">{unitsError}</p>
          <div className="mt-6 flex space-x-3">
            <Link href={`/subjects/${params.subjectId}`} className="btn-outline">
              Back to Subject
            </Link>
            <Link href="/subjects" className="btn-primary">
              Back to Subjects
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (unitsLoading) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading units...</p>
          </div>
        </div>
      </main>
    );
  }

  // Profile and subject loaded successfully
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Breadcrumbs and Back Button */}
        <div className="mb-8 flex flex-col items-start gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Dashboard
            </Link>
            <span className="text-sm text-muted-foreground">→</span>
            <Link href="/subjects" className="text-sm text-muted-foreground hover:underline">
              Subjects
            </Link>
            <span className="text-sm text-muted-foreground">→</span>
            <span className="text-sm font-medium">{subject.name}</span>
          </div>

          <div className="flex space-x-3">
            <Link href="/subjects" className="btn-outline">
              ← Back to Subjects
            </Link>
          </div>
        </div>

        {/* Subject Details */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
              <span className="text-xl">
                {subject.code?.charAt(0) || subject.name?.charAt(0) || 'S'}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {subject.name}
            </h1>

            {subject.code && (
              <p className="text-sm text-muted-foreground mb-2">
                Code: {subject.code}
              </p>
            )}

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {subject.description || 'No description available'}
            </p>

            <p className="text-xs text-muted-foreground">
              Belongs to: {subject.semesters.name} • {subject.semesters.branches.name}
            </p>
          </div>
        </div>

        {/* Units Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Units
          </h2>

          {units.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No units found for this subject.
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Please contact your instructor to add units for this subject.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {units.map((unit) => (
                <Link
                  key={unit.id}
                  href={`/subjects/${params.subjectId}/units/${unit.id}`}
                  className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow hover:border-primary/20 border"
                >
                  <div className="p-6">
                    {/* Unit Icon */}
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-xl">
                        {unit.name.charAt(0)}
                      </span>
                    </div>

                    {/* Unit Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {unit.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                        {unit.description || 'No description available'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}