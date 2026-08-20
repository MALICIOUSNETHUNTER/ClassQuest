'use client';

import { getProfileClient } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function EditUnitPage({ params }: { params: { unitId: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const unitId = params.unitId;

  // Unit data
  const [unit, setUnit] = useState(null);
  const [unitLoading, setUnitLoading] = useState(true);
  const [unitError, setUnitError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subjectId: '',
  });

  // Subjects for dropdown
  const [subjects, setSubjects] = useState([]);

  // Status messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load unit data on mount
  useEffect(() => {
    const loadUnit = async () => {
      if (!unitId) {
        router.push('/admin/units');
        return;
      }

      try {
        setUnitLoading(true);
        setUnitError(null);
        const supabase = (await import('@/lib/supabase')).createServerComponentClient();

        const { data, error: unitError } = await supabase
          .from('units')
          .select(`
            *,
            subjects (
              id,
              name,
              code
            )
          `)
          .eq('id', unitId)
          .single();

        if (unitError) throw unitError;
        if (!data) {
          throw new Error('Unit not found');
        }

        setUnit(data);
        // Initialize form with existing data
        setFormData({
          name: data.name,
          description: data.description || '',
          subjectId: data.subject_id,
        });
      } catch (err: any) {
        setUnitError(err.message || 'Failed to load unit');
      } finally {
        setUnitLoading(false);
      }
    };

    loadUnit();
  }, [unitId, router]);

  // Load subjects for dropdown
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const supabase = await import('@/lib/supabase').then(
          (mod) => mod.createServerComponentClient()
        );

        const { data, error } = await supabase
          .from('subjects')
          .select('id, name, code')
          .order('name');

        if (error) throw error;
        setSubjects(data || []);
      } catch (err) {
        console.error('Failed to load subjects:', err);
        // Non-fatal - we can still proceed with empty subjects
      }
    };

    loadSubjects();
  }, []);

  // Handle auth/checks
  useEffect(() => {
    const checkAuth = async () => {
      const profileResult = await getProfileClient();
      if (profileResult.error) {
        // Redirect to sign-in
        window.location.href = '/auth/sign-in';
        return;
      }

      const profile = profileResult.data;
      if (!profile || profile.role !== 'admin') {
        // Redirect to home or show access denied
        window.location.href = '/';
        return;
      }
    };

    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Basic validation
    if (!formData.name.trim()) {
      setError('Unit name is required');
      setLoading(false);
      return;
    }

    if (!formData.subjectId) {
      setError('Please select a subject');
      setLoading(false);
      return;
    }

    try {
      const supabase = (await import('@/lib/supabase')).createServerComponentClient();

      const { error: updateError } = await supabase
        .from('units')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          subject_id: formData.subjectId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', unitId);

      if (updateError) throw updateError;

      setSuccess(true);
      // Redirect to units list after a short delay
      setTimeout(() => {
        router.push('/admin/units');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update unit');
    } finally {
      setLoading(false);
    }
  };

  if (unitLoading || !unit) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading unit...</p>
        </div>
      </main>
    );
  }

  if (unitError) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Oops!</h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{unitError}</p>
          </div>
          <div className="space-x-3">
            <Link href="/admin/units"><Button variant="outline">Back to Units</Button></Link>
            <Link href="/dashboard"><Button>Go to Dashboard</Button></Link>
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
          {
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Edit Unit
                  </h1>
                  <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                    Update the unit information
                  </p>
                </div>
                <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="font-medium">U</span>
                </div>
              </div>
              <Link href="/admin/units" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus-ring-offset-2 focus-ring-primary">
                ← Back to Units
              </Link>
            </div>
          }
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="px-4 py-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 mb-6 p-4">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className="px-4 py-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-green-50 dark:bg-green-900/50 border-l-4 border-green-500 mb-6 p-4">
              <p className="text-green-700 dark:text-green-400">
                Unit updated successfully! Redirecting...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Unit Information
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Unit Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    placeholder="Enter unit name (e.g., Introduction to Calculus)"
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
                    placeholder="Enter a brief description of the unit"
                  />
                </div>

                {/* Subject Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Subject
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    required
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code || 'no code'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin/units')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="ml-4"
                  >
                    {loading ? 'Updating...' : 'Save Changes'}
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
            Keep your academic units up to date to ensure students have clear learning structures.
          </p>
        </div>
      </div>
    </main>
  );
}