'use client';

import { getProfileClient } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const supabase = await import('@/lib/supabase').then(
          (mod) => mod.createServerComponentClient()
        );

        // Fetch units with subject, semester, and branch data
        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select(`
            *,
            subjects (
              name,
              code,
              semesters (
                name,
                number,
                branches (
                  name,
                  code
                )
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (unitsError) throw unitsError;
        setUnits(unitsData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load units');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) return;

    try {
      const supabase = await import('@/lib/supabase').then(
        (mod) => mod.createServerComponentClient()
      );

      // First check if there are any topics associated with this unit
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('id')
        .eq('unit_id', id)
        .limit(1);

      if (topicsError) throw topicsError;

      if (topicsData && topicsData.length > 0) {
        throw new Error('Cannot delete unit that has associated topics. Please delete or reassign topics first.');
      }

      // If we get here, it's safe to delete
      const { error: deleteError } = await supabase
        .from('units')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Remove from local state
      setUnits(units.filter(unit => unit.id !== id));
    } catch (err: any) {
      // Check if it's a validation error we want to show
      if (err.message && (
          err.message.includes('Cannot delete unit') ||
          err.message.includes('associated') ||
          err.message.includes('topics')
      )) {
        setError(err.message);
      } else {
        setError('Failed to delete unit: ' + (err.message || 'Unknown error'));
      }
      console.error('Delete error:', err);
    }
  };

  // Handle auth/checks
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
            <Link href="/"><Button variant="outline">Go Home</Button></Link>
            <Link href="/dashboard"><Button>Back to Dashboard</Button></Link>
          </div>
        </div>
      </main>
    );
  }

  // Add auth check at the top level too
  // We'll do this in a useEffect to avoid blocking render
  useEffect(() => {
    const checkAuth = async () => {
      const profileResult = await getProfileClient();
      if (profileResult.error) {
        // In a real app, we'd redirect, but for now we'll show error state
        setError('Authentication error: Please sign in');
        return;
      }

      const profile = profileResult.data;
      if (!profile || profile.role !== 'admin') {
        setError('Access denied: Admin privileges required');
        return;
      }
    };

    checkAuth();
  }, []);

  // Handle auth errors in render
  if (error && (error.includes('Authentication') || error.includes('Access denied'))) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {error.includes('Authentication') ? 'Please Sign In' : 'Access Denied'}
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {error.includes('Authentication')
                ? 'You need to be signed in to access the admin panel.'
                : 'You do not have permission to access the admin panel.'}
            </p>
          </div>
          <div className="space-x-3">
            <Link href="/"><Button variant="outline">Go Home</Button></Link>
            {!error.includes('Authentication') && (
              <Link href="/auth/sign-in"><Button>Sign In</Button></Link>
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
                  Units
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  Manage academic units
                </p>
              </div>
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="font-medium">U</span>
              </div>
            </div>
            <Link href="/admin/units/new" className="btn-primary">
              Add New Unit
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 mb-6 p-4">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="px-4 py-8 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading units...</p>
              </div>
            }
          </div>
        </div>
      ) : units.length === 0 ? (
        <div className="px-4 py-8 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-500/20 text-gray-500 mx-auto mb-4">
                <span className="text-xl">📗</span>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                No units found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click "Add New Unit" to get started.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-8 sm:px-6">
          <div className="max-w-7xl mx-auto overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Unit Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Subject
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Semester
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Branch
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y dark:divide-gray-700">
                {units.map((unit) => (
                  <tr
                    key={unit.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{unit.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {unit.subjects ? (
                        <>
                          <span className="font-medium">{unit.subjects.name}</span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            ({unit.subjects.code || 'no code'})
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">No subject</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {unit.subjects?.semesters ? (
                        <>
                          <span className="font-medium">{unit.subjects.semesters.name}</span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            (Semester {unit.subjects.semesters.number})
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">No semester</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {unit.subjects?.semesters?.branches ? (
                        <>
                          <span className="font-medium">{unit.subjects.semesters.branches.name}</span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            ({unit.subjects.semesters.branches.code})
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">No branch</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {unit.description || (
  <span className="text-xs text-gray-500 dark:text-gray-400 italic">No description</span>
)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link
                        href={`/admin/units/${unit.id}/edit`}
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(unit.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Motivational Footer */}
      <div className="px-4 py-8 sm:px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Organize your academic units effectively to provide students with clear learning structures.
          </p>
        </div>
      </div>
    </main>
  );
}