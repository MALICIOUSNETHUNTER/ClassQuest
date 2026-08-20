import AdminSidebar from '@/components/admin-sidebar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ClassQuest Admin Dashboard',
  description: 'Admin dashboard for managing ClassQuest content',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden overflow-y-auto">
        <nav className="bg-white dark:bg-gray-800 border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  ClassQuest Admin Dashboard
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <a
                  href="/admin/profile"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Profile
                </a>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}