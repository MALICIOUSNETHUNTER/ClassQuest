'use client';

import { getProfileClient } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function EditSemesterPage({ params }: { params: { semesterId: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const semesterId = params.semesterId;

  // Semester data
  const [semester, setSemester] = useState(null);
  const [semesterLoading, setSemesterLoading] = useState(true);
  const [semesterError, setSemesterError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    branchId: '',
  });

  // Branches for dropdown
  const [branches, setBranches] = useState([]);

  // Status messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load semester data on mount
  useEffect(() => {
    const loadSemester = async () => {
      if (!semesterId) {
        router.push('/admin/semesters');
        return;
      }

      try {
        setSemesterLoading(true);
        setSemesterError(null);
        const supabase = (await import('@/lib/supabase')).createServerComponentClient();

        const { data, error: semesterError } = await supabase
          .from('semesters')
          .select(`
            *,
            branches (
              id,
              name,
              code
            )
          `)
          .eq('id', semesterId)
          .single();

        if (semesterError) throw semesterError;
        if (!data) {
          throw new Error('Semester not found');
        }

        setSemester(data);
        // Initialize form with existing data
        setFormData({
          name: data.name,
          number: data.number.toString(),
          branchId: data.branch_id,
        });
      } catch (err: any) {
        setSemesterError(err.message || 'Failed to load semester');
      } finally {
        setSemesterLoading(false);
      }
    };

    loadSemester();
  }, [semesterId, router]);

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

      // Check for duplicate semester number in the same branch (excluding current semester)
      const { data: existingSemester, error: checkError } = await supabase
        .from('semesters')
        .select('id')
        .eq('branch_id', formData.branchId)
        .eq('number', semesterNumber)
        .neq('id', semesterId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned (not an error)
        throw checkError;
      }

      if (existingSemester) {
        throw new Error(`A semester with number ${semesterNumber} already exists for this branch.`);
      }

      const { error: updateError } = await supabase
        .from('semesters')
        .update({
          name: formData.name.trim(),
          number: semesterNumber,
          branch_id: formData.branchId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', semesterId);

      if (updateError) throw updateError;

      setSuccess(true);
      // Redirect to semesters list after a short delay
      setTimeout(() => {
        router.push('/admin/semesters');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update semester');
    } finally {
      setLoading(false);
    }
  };

  if (semesterLoading || !semester) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading semester...</p>
        </div>
      </main>
    );
  }

  if (semesterError) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Oops!</h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{semesterError}</p>
          </div>
          <div className="space-x-3">
            <Link href="/admin/semesters"><Button variant="outline">Back to Semesters</Button></Link>
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Edit Semester
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  Update the semester information
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
                Semester updated successfully! Redirecting...
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
            Keep your academic calendar up to date to ensure students have clear learning timelines.
          </p>
        </div>
      </div>
    </main>
  );
}