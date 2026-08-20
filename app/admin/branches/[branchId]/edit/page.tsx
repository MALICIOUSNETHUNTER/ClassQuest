'use client';

import { getProfileClient } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useFormState } from 'react-dom';

export default function EditBranchPage({ params }: { params: { branchId: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const branchId = params.branchId;

  // Branch data
  const [branch, setBranch] = useState(null);
  const [branchLoading, setBranchLoading] = useState(true);
  const [branchError, setBranchError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  // Status messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load branch data on mount
  useEffect(() => {
    const loadBranch = async () => {
      if (!branchId) {
        router.push('/admin/branches');
        return;
      }

      try {
        setBranchLoading(true);
        setBranchError(null);
        const supabase = (await import('@/lib/supabase')).createServerComponentClient();

        const { data, error: branchError } = await supabase
          .from('branches')
          .select('*')
          .eq('id', branchId)
          .single();

        if (branchError) throw branchError;
        if (!data) {
          throw new Error('Branch not found');
        }

        setBranch(data);
        // Initialize form with existing data
        setFormData({
          name: data.name,
          code: data.code,
          description: data.description || '',
        });
      } catch (err: any) {
        setBranchError(err.message || 'Failed to load branch');
      } finally {
        setBranchLoading(false);
      }
    };

    loadBranch();
  }, [branchId, router]);

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

    try {
      const supabase = (await import('@/lib/supabase')).createServerComponentClient();

      const { error: updateError } = await supabase
        .from('branches')
        .update({
          name: formData.name,
          code: formData.code.toUpperCase(), // Ensure code is uppercase
          description: formData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', branchId);

      if (updateError) throw updateError;

      setSuccess(true);
      // Redirect to branches list after a short delay
      setTimeout(() => {
        router.push('/admin/branches');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update branch');
    } finally {
      setLoading(false);
    }
  };

  if (branchLoading || !branch) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading branch...</p>
        </div>
      </main>
    );
  }

  if (branchError) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Oops!</h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{branchError}</p>
          </div>
          <div className="space-x-3">
            <Link href="/admin/branches"><Button variant="outline">Back to Branches</Button></Link>
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
                  Edit Branch
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  Update the branch information
                </p>
              </div>
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="font-medium">B</span>
              </div>
            </div>
            <Link href="/admin/branches" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus-ring-offset-2 focus-ring-primary">
              ← Back to Branches
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
                Branch updated successfully! Redirecting...
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
                Branch Information
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    placeholder="Enter branch name"
                    required
                  />
                </div>

                {/* Code */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    placeholder="Enter branch code"
                    maxLength={10}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Will be converted to uppercase
                  </p>
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
                    placeholder="Enter a brief description of the branch"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin/branches')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="ml-4"
                  >
                    {loading ? "Updating..." : "Save Changes"}
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
            Keep your academic structure up to date to ensure students have access to relevant learning materials.
          </p>
        </div>
      </div>
    </main>
  );
}