"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { getProfileClient } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [profile, setProfile] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load profile whenever the pathname changes (after navigation) or on mount
  useEffect(() => {
    const loadInitialProfile = async () => {
      console.log("[Navbar] loadInitialProfile called for pathname:", pathname);
      try {
        setProfileLoading(true);
        const { data, error } = await getProfileClient();
        console.log("[Navbar] getProfileClient result:", { data, error });
        if (error) {
          setProfileError((error as any)?.message ?? String(error));
          setProfile(null); // Not authenticated
          console.log("[Navbar] profile set to null (error)");
        } else {
          setProfile(data); // Authenticated
          setProfileError(null);
          console.log("[Navbar] profile set to:", data);
        }
      } catch (err: any) {
        setProfileError(err?.message ?? String(err) ?? "Failed to load profile");
        setProfile(null); // Not authenticated on error
        console.log("[Navbar] profile set to null (catch)");
      } finally {
        setProfileLoading(false);
        console.log("[Navbar] profileLoading set to false");
      }
    };

    loadInitialProfile();
  }, [pathname]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        // Redirect to home page on successful logout
        router.push('/');
      } else {
        // If logout fails, still try to redirect to sign-in
        router.push('/auth/sign-in');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, try to redirect to sign-in
      router.push('/auth/sign-in');
    }
  };

  // Show loading state
  if (profileLoading) {
    return (
      <nav className="bg-white/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-900">
                  ClassQuest
                </p>
                <p className="text-sm text-gray-500">
                  Learn. Practice. Grow.
                </p>
              </div>
            </div>

            <div className="hidden md:flex space-x-4 items-center">
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/syllabus" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                      Syllabus
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/free-period" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                      Free Period
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                      Profile
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/auth/sign-in"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/auth/sign-up"
                className="px-4 py-2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Show error state (treat as not authenticated)
  if (profileError) {
    return (
      <nav className="bg-white/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-900">
                  ClassQuest
                </p>
                <p className="text-sm text-gray-500">
                  Learn. Practice. Grow.
                </p>
              </div>
            </div>

            <div className="hidden md:flex space-x-4 items-center">
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/syllabus" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                      Syllabus
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/free-period" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                      Free Period
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                      Profile
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/auth/sign-in"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/auth/sign-up"
                className="px-4 py-2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }



  // Authenticated state - show user navigation
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0 flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-gray-900">
                ClassQuest
              </p>
              <p className="text-sm text-gray-500">
                Learn. Practice. Grow.
              </p>
            </div>
          </div>

          <div className="hidden md:flex space-x-4 items-center">
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/syllabus" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                    Syllabus
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/free-period" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                    Free Period
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                    Profile
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            {/* User menu */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="h-8 w-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                  {/* Avatar: First letter of email or fallback */}
                  <span className="text-white font-medium">
                    {/* Prefer first letter of email, fallback to first letter of name, then 'U' */}
                    {
                      (profile?.email && profile.email.length > 0)
                        ? profile.email.charAt(0).toUpperCase()
                        : (profile?.full_name && profile.full_name.length > 0)
                          ? profile.full_name.charAt(0).toUpperCase()
                          : 'U'
                    }
                  </span>
                </div>
                <span className="hidden md:block">
                  {profile?.first_name || profile?.email?.split('@')[0] || 'User'}
                </span>
              </button>
              {/* Dropdown menu - ONLY shows when BOTH authenticated AND dropdown is open */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                  <div className="py-1">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}