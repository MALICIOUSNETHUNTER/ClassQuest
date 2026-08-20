'use client';

import { getProfileClient } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewSemesterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    branchId: '',
  });
  const [branches, setBranches] = useState([]);
  const router = useRouter();

  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profileResult = await getProfileClient();
        if (profileResult.error) {
          // Redirect to sign-in
          window.location.href = '/auth/sign-in';
          return;
        }

        const profileData = profileResult.data;
        if (!profileData || profileData.role !== 'admin') {
          // Redirect to home or show access denied
          window.location.href = '/';
          return;
        }
      } catch (err) {
        // In case of error, redirect to sign-in
        window.location.href = '/auth/sign-in';
      } finally {
        setLoadingAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (loadingAuth) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Checking access...</p>
        </div>
      </main>
    );
  }

  // Load branches for dropdown
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const supabase = await import('@/lib/supabase').then(
          (mod) => mod.createServerComponentClient()
        );

        const { data, error } = await supabase
          .from('branches')
          .select('id, name, code')
          .order('name');

        if (error) throw error;
        setBranches(data || []);
      } catch (err) {
        console.error('Failed to load branches:', err);
        // Non-fatal - we can still proceed with empty branches
      }
    };

    loadBranches();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Basic validation
    if (!formData.name.trim()) {
      setError('Semester name is required');
      setLoading(false);
      return;
    }

    if (!formData.number || isNaN(Number(formData.number))) {
      setError('Please enter a valid semester number');
      setLoading(false);
      return;
    }

    const semesterNumber = Number(formData.number);
    if (semesterNumber < 1) {
      setError('Semester number must be 1 or greater');
      setLoading(false);
      return;
    }

    if (!formData.branchId) {
      setError('Please select a branch');
      setLoading(false);
      return;
    }

    try {
      const supabase = (await import('@/lib/supabase')).createServerComponentClient();

      // Check for duplicate semester number in the same branch
      const { data: existingSemester, error: checkError } = await supabase
        .from('semesters')
        .select('id')
        .eq('branch_id', formData.branchId)
        .eq('number', semesterNumber)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned (not an error)
        throw checkError;
      }

      if (existingSemester) {
        throw new Error(`A semester with number ${semesterNumber} already exists for this branch.`);
      }

      const { data, error } = await supabase
        .from('semesters')
        .insert({
          name: formData.name.trim(),
          number: semesterNumber,
          branch_id: formData.branchId,
        })
        .select();

      if (error) throw error;

      setSuccess(true);
      // Redirect to semesters list after a short delay
      setTimeout(() => {
        router.push('/admin/semesters');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create semester');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Create New Semester
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  Add a new academic semester to the system
                </p>
              </div>
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="font-medium">S</span>
              </div>
            </div>
            <Link href="/admin/semesters" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus-ring-offset-2 focus-ring-primary">
              ← Back to Semesters
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
                Semester created successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Semester Information
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Semester Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    placeholder="Enter semester name (e.g., Fall 2023)"
                    required
                  />
                </div>

                {/* Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Semester Number
                  </label>
                  <input
                    type="number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    placeholder="Enter semester number (e.g., 1, 2, 3)"
                    min="1"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Must be a positive integer (1, 2, 3, etc.)
                  </p>
                </div>

                {/* Branch Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Branch
                  </label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    required
                  >
                    <option value="">Select a branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>
                  {branches.length === 0 && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                      No branches available. Please create a branch first.
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin/semesters')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="ml-4"
                  >
                    {loading ? 'Creating...' : 'Create Semester'}
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
            Organize your academic calendar to provide students with clear learning timelines.
          </p>
        </div>
      </div>
    </main>
  );
}