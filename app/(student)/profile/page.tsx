'use client';

import { getProfileClient, updateProfileClient } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  // Profile data
  const [profileResult, setProfileResult] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    role: 'student',
    branch_id: '',
    semester_id: '',
  });
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const result = await getProfileClient();
        setProfileResult(result);
        if (result.error) {
          setProfileError(result.error);
        } else {
          // Set form data from profile
          setFormData({
            full_name: result.data?.full_name || '',
            role: result.data?.role || 'student',
            branch_id: result.data?.branch_id || '',
            semester_id: result.data?.semester_id || '',
          });
        }
      } catch (err: any) {
        setProfileError(err.message || 'Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const supabase = (await import('@/lib/supabase')).createServerComponentClient();

        const [branchesResult, semestersResult] = await Promise.all([
          supabase.from('branches').select('id, name, code').order('name'),
          supabase.from('semesters').select('id, name, number').order('number'),
        ]);

        if (branchesResult.error) throw branchesResult.error;
        if (semestersResult.error) throw semestersResult.error;

        setBranches(branchesResult.data || []);
        setSemesters(semestersResult.data || []);
      } catch (err) {
        console.error('Failed to load reference data:', err);
      }
    };

    loadReferenceData();
  }, []);

  // Handle auth/checks
  if (profileError) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Please Sign In
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              You need to be signed in to view your profile.
            </p>
          </div>
          <a href="/auth/sign-in" className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-md transition-colors">
            Sign In
          </a>
        </div>
      </main>
    );
  }

  if (profileLoading || !profileResult) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </main>
    );
  }

  const profile = profileResult.data;
  if (!profile) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Oops!</h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Unable to load profile data
            </p>
          </div>
          <div className="space-x-3">
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveMessage({ type: '', text: '' });

    try {
      const supabase = (await import('@/lib/supabase')).createServerComponentClient();

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role,
          branch_id: formData.branch_id || null,
          semester_id: formData.semester_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save profile' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to current values
    setFormData({
      full_name: profile.full_name || '',
      role: profile.role || 'student',
      branch_id: profile.branch_id || '',
      semester_id: profile.semester_id || '',
    });
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
                  My Profile
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  {profile.first_name && `Hello, ${profile.first_name}!`} View and update your account information
                </p>
              </div>
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="font-medium">{(profile.first_name || 'P')[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage.text && (
        <div className="px-4 py-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className={`${saveMessage.type === 'success'
              ? 'bg-green-50 dark:bg-green-900 border-l-4 border-green-500'
              : 'bg-red-50 dark:bg-red-900 border-l-4 border-red-500'} mb-6 p-4 rounded-lg`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {saveMessage.type === 'success' ? (
                    <span className="h-5 w-5 text-green-600">✓</span>
                  ) : (
                    <span className="h-5 w-5 text-red-600">⚠</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{saveMessage.text}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-primary/5 dark:bg-primary/10 border-b border-primary/20 px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                    <span className="text-2xl font-medium">
                      {profile.full_name ? profile.full_name.charAt(0) : 'U'}
                    </span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {profile.full_name || 'No name provided'}
                  </h2>
                  <p className="text-sm text-muted-foreground flex items-center space-x-2">
                    {profile.role === 'student' && (
                      <>
                        <span className="flex items-center bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                          Student
                        </span>
                      </>
                    )}
                    {profile.role === 'admin' && (
                      <>
                        <span className="flex items-center bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
                          Administrator
                        </span>
                      </>
                    )}
                    {profile.role === 'teacher' && (
                      <>
                        <span className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                          Teacher
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {editing ? (
                <form onSubmit={handleSave} className="space-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'student' | 'admin' | 'teacher' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Administrator</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>

                  {/* Branch */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      Academic Branch
                    </label>
                    <select
                      value={formData.branch_id}
                      onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    >
                      <option value="">Select a branch</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name} ({branch.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Semester */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      Semester
                    </label>
                    <select
                      value={formData.semester_id}
                      onChange={(e) => setFormData({ ...formData, semester_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-ring-primary focus:border-primary disabled:opacity-50"
                    >
                      <option value="">Select a semester</option>
                      {semesters.map((semester) => (
                        <option key={semester.id} value={semester.id}>
                          Semester {semester.number}: {semester.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saveLoading}
                      className="ml-4"
                    >
                      {saveLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Info Grid */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Personal Information
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        <span className="flex items-center space-x-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
                            👤
                          </span>
                          <span className="font-medium">{profile.full_name || 'Not set'}</span>
                        </span>
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Academic Info
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                            🏫
                          </span>
                          <span className="font-medium">
                            {profile.branches?.name || 'Not set'} {profile.branches?.code ? `(${profile.branches.code})` : ''}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
                            📅
                          </span>
                          <span className="font-medium">
                            {profile.semesters
                              ? `Semester ${profile.semesters.number}`
                              : 'Not set'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Role & Permissions
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                            👤
                          </span>
                          <span className="font-medium">
                            {profile.role === 'student' ? 'Student' : profile.role === 'admin' ? 'Administrator' : 'Teacher'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {profile.role === 'student' && (
                            <span>Access to learning materials and quizzes</span>
                          )}
                          {profile.role === 'admin' && (
                            <span>Full system access including user and content management</span>
                          )}
                          {profile.role === 'teacher' && (
                            <span>Access to create and manage educational content</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Account Statistics
                      </h3>
                      <div className="space-y-3">
                        {/* These would come from actual stats in a real implementation */}
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-500">
                            📊
                          </span>
                          <span className="font-medium">Quizzes Taken: 0</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-500">
                            📈
                          </span>
                          <span className="font-medium">Average Score: -</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-500">
                            🔥
                          </span>
                          <span className="font-medium">Study Streak: 0 days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setEditing(true)}
                    >
                      Edit Profile
                    </Button>
                    <Link href="/auth/sign-out">
                      <Button variant="outline" className="ml-4">
                        Sign Out
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Footer */}
      <div className="px-4 py-8 sm:px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your profile represents your journey in learning. Keep it updated to get the most personalized experience.
          </p>
        </div>
      </div>
    </main>
  );
}