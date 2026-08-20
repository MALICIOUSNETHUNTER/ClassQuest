'use client';

import { getProfileClient } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewSubjectPage() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    semesterId: '',
  });
  const [semesters, setSemesters] = useState([]);
  const router = useRouter();

  // Load auth and semesters on mount
  useEffect(() => {
    const init = async () => {
      try {
        setInitialLoading(true);
        const profileResult = await getProfileClient();
        if (profileResult.error) {
          throw new Error(profileResult.error || 'Authentication error');
        }
        const profile = profileResult.data;
        if (!profile || profile.role !== 'admin') {
          throw new Error('Access denied: Admin privileges required');
        }
        // Auth successful, now load semesters
        const supabase = await import('@/lib/supabase').then(
          (mod) => mod.createServerComponentClient()
        );
        const { data, error } = await supabase
          .from('semesters')
          .select('id, name, number')
          .order('name');
        if (error) throw error;
        setSemesters(data || []);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    // Basic validation
    if (!formData.name.trim()) {
      setError('Subject name is required');
      setSubmitting(false);
      return;
    }

    if (!formData.semesterId) {
      setError('Please select a semester');
      setSubmitting(false);
      return;
    }

    try {
      const supabase = (await import('@/lib/supabase')).createServerComponentClient();

      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: formData.name.trim(),
          code: formData.code.trim() || null, // Store null if empty string
          description: formData.description.trim() || null,
          semester_id: formData.semesterId,
        })
        .select();

      if (error) throw error;

      setSuccess(true);
      // Redirect to subjects list after a short delay
      setTimeout(() => {
        router.push('/admin/subjects');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create subject');
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Error
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {error}
            </p>
          </div>
          <div className="space-x-3">
            <Link href="/"><Button variant="outline">Go Home</Button></Link>
            {!error.includes('Authentication') && !error.includes('Access denied') && (
              <Link href="/admin/subjects"><Button>Back to Subjects</Button></Link>
            )}
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
                  Create New Subject
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  Add a new academic subject to the system
                </p>
              </div>
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="font-medium">S</span>
              </div>
            </div>
            <Link href="/admin/subjects" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus-ring-offset-2 focus-ring-primary">
              ← Back to Subjects
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
                Subject created successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Subject Information
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    placeholder="Enter subject name (e.g., Calculus I)"
                    required
                  />
                </div>

                {/* Code */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Subject Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    placeholder="Enter subject code (e.g., MATH101)"
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
                    placeholder="Enter a brief description of the subject"
                  />
                </div>

                {/* Semester Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Semester
                  </label>
                  <select
                    value={formData.semesterId}
                    onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    required
                  >
                    <option value="">Select a semester</option>
                    {semesters.map((semester) => (
                      <option key={semester.id} value={semester.id}>
                        {semester.name} (Semester {semester.number})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin/subjects')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="ml-4"
                  >
                    {submitting ? 'Creating...' : 'Create Subject'}
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
            Organize your academic subjects to provide students with clear learning paths.
          </p>
        </div>
      </div>
    </main>
  );
}