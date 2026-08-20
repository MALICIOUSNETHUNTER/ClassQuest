'use client';

import { getProfileClient } from '@/lib/auth';
import { createClientComponentClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UnitDetailPage({ params }: { params: { subjectId: string; unitId: string } }) {
  // Profile data
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Subject data
  const [subject, setSubject] = useState(null);
  const [subjectLoading, setSubjectLoading] = useState(true);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  // Unit data
  const [unit, setUnit] = useState(null);
  const [unitLoading, setUnitLoading] = useState(true);
  const [unitError, setUnitError] = useState<string | null>(null);

  // Topics data
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);

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

  // Load unit when subject is available and we have unitId
  useEffect(() => {
    if (!subject || !params.unitId) return;

    const fetchUnit = async () => {
      try {
        setUnitLoading(true);
        const supabase = createClientComponentClient();

        // Fetch unit and verify it belongs to the subject
        const { data, error: unitError } = await supabase
          .from('units')
          .select(`
            *,
            subjects: subject_id (
              id,
              name
            )
          `)
          .eq('id', params.unitId)
          .single();

        if (unitError) throw unitError;

        // Verify the unit belongs to the subject
        if (!data.subjects || data.subjects.id !== subject.id) {
          throw new Error('Unit not found or does not belong to the specified subject');
        }

        setUnit(data);
      } catch (err: any) {
        setUnitError(err.message || 'Failed to load unit');
      } finally {
        setUnitLoading(false);
      }
    };

    fetchUnit();
  }, [subject, params.unitId]);

  // Load topics when unit is available
  useEffect(() => {
    if (!unit) return;

    const fetchTopics = async () => {
      try {
        setTopicsLoading(true);
        const supabase = createClientComponentClient();

        const { data, error: topicsError } = await supabase
          .from('topics')
          .select(`
            *,
            units: unit_id (
              name
            )
          `)
          .eq('unit_id', unit.id)
          .order('name');

        if (topicsError) throw topicsError;
        setTopics(data || []);
      } catch (err: any) {
        setTopicsError(err.message || 'Failed to load topics');
      } finally {
        setTopicsLoading(false);
      }
    };

    fetchTopics();
  }, [unit]);

  // Handle auth/checks
  if (profileError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Please Sign In</h1>
          <p className="text-muted-foreground">You need to be signed in to view unit details.</p>
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

  if (unitError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Unit Not Found</h1>
          <p className="text-red-500">{unitError}</p>
          <div className="mt-6 flex space-x-3">
            <Link href="/" className="btn-outline">
              Go Home
            </Link>
            <Link href={`/subjects/${params.subjectId}`} className="btn-primary">
              Back to Subject
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (unitLoading) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading unit...</p>
          </div>
        </div>
      </main>
    );
  }

  if (topicsError) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-red-500">{topicsError}</p>
          <div className="mt-6 flex space-x-3">
            <Link href={`/subjects/${params.subjectId}/units/${params.unitId}`} className="btn-outline">
              Back to Unit
            </Link>
            <Link href={`/subjects/${params.subjectId}`} className="btn-primary">
              Back to Subject
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (topicsLoading) {
    return (
      <main className="space-y-6">
        <div className="flex flex-col items-center justify-between p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading topics...</p>
          </div>
        </div>
      </main>
    );
  }

  // Profile, subject, and unit loaded successfully
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
            <Link href={`/subjects/${params.subjectId}`} className="text-sm text-muted-foreground hover:underline">
              {subject.name}
            </Link>
            <span className="text-sm text-muted-foreground">→</span>
            <span className="text-sm font-medium">{unit.name}</span>
          </div>

          <div className="flex space-x-3">
            <Link href={`/subjects/${params.subjectId}`} className="btn-outline">
              ← Back to Subject
            </Link>
          </div>
        </div>

        {/* Unit Details */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
              <span className="text-xl">
                {unit.name.charAt(0)}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {unit.name}
            </h1>

            {/* Unit number/order if available */}
            {/* Assuming there might be a field like 'number' or 'order' in units table? */}
            {/* The schema doesn't show one, but we can check for a common field like 'unit_number' or just skip. */}
            {/* We'll skip for now as it's not in the schema. */}

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {unit.description || 'No description available'}
            </p>

            <p className="text-xs text-muted-foreground">
              Part of: {subject.name} {subject.code ? `(${subject.code})` : ''}
            </p>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Topics
          </h2>

          {topics.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No topics found for this unit.
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Please contact your instructor to add topics for this unit.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.id}/quizzes`}
                  className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow hover:border-primary/20 border"
                >
                  <div className="p-6">
                    {/* Topic Icon */}
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-xl">
                        {topic.name.charAt(0)}
                      </span>
                    </div>

                    {/* Topic Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {topic.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                        {topic.description || 'No description available'}
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