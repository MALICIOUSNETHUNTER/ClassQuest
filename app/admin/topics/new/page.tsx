'use client';

import { getProfileClient } from '@/lib/auth';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewTopicPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unitId: '',
  });
  const [units, setUnits] = useState([]);
  const router = useRouter();

  // Handle auth/checks - using useEffect to avoid promise issues during render
  React.useEffect(() => {
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

  // Load units for dropdown
  useEffect(() => {
    const loadUnits = async () => {
      try {
        const supabaseModule = await import('@/lib/supabase');
        const supabase = supabaseModule.createServerComponentClient();

        const { data, error } = await supabase
          .from('units')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setUnits(data || []);
      } catch (err) {
        console.error('Failed to load units:', err);
        // Non-fatal - we can still proceed with empty units
      }
    };

    loadUnits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Basic validation
    if (!formData.name.trim()) {
      setError('Topic name is required');
      setLoading(false);
      return;
    }

    if (!formData.unitId) {
      setError('Please select a unit');
      setLoading(false);
      return;
    }

    try {
      const supabaseModule = await import('@/lib/supabase');
      const supabase = supabaseModule.createServerComponentClient();

      // Check for duplicate topic name within the same unit (business rule)
      const { data: existingTopic, error: checkError } = await supabase
        .from('topics')
        .select('id')
        .eq('unit_id', formData.unitId)
        .eq('name', formData.name.trim())
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned (not an error)
        throw checkError;
      }

      if (existingTopic) {
        throw new Error(`A topic with the name "${formData.name.trim()}" already exists in this unit.`);
      }

      const { data, error } = await supabase
        .from('topics')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          unit_id: formData.unitId,
        })
        .select();

      if (error) throw error;

      setSuccess(true);
      // Redirect to topics list after a short delay
      setTimeout(() => {
        router.push('/admin/topics');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create topic');
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
                  Create New Topic
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  Add a new academic topic to the system
                </p>
              </div>
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="font-medium">T</span>
              </div>
            </div>
            <Link href="/admin/topics" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus-ring-offset-2 focus-ring-primary">
              ← Back to Topics
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
                Topic created successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Topic Information
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Topic Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    placeholder="Enter topic name (e.g., Limits and Continuity)"
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
                    placeholder="Enter a brief description of the topic"
                  />
                </div>

                {/* Unit Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Unit
                  </label>
                  <select
                    value={formData.unitId}
                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    required
                  >
                    <option value="">Select a unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                  {units.length === 0 && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                      No units available. Please create a unit first.
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin/topics')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="ml-4"
                  >
                    {loading ? 'Creating...' : 'Create Topic'}
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
            Organize your academic topics to provide students with clear learning concepts.
          </p>
        </div>
      </div>
    </main>
  );
}