'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r">
      <div className="flex-shrink-0 flex items-center h-16 px-4">
        <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Admin Panel
        </span>
      </div>

      <nav className="mt-8 space-y-2 px-4">
        <Link
          href="/admin"
          className={`
            flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100
            rounded-md ${isActive('/admin') ? 'bg-primary/10 text-primary' : ''}
          `}
        >
          Dashboard
        </Link>

        <Link
          href="/admin/branches"
          className={`
            flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100
            rounded-md ${isActive('/admin/branches') ? 'bg-primary/10 text-primary' : ''}
          `}
        >
          Branches
        </Link>

        <Link
          href="/admin/semesters"
          className={`
            flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100
            rounded-md ${isActive('/admin/semesters') ? 'bg-primary/10 text-primary' : ''}
          `}
        >
          Semesters
        </Link>

        <Link
          href="/admin/subjects"
          className={`
            flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100
            rounded-md ${isActive('/admin/subjects') ? 'bg-primary/10 text-primary' : ''}
          `}
        >
          Subjects
        </Link>

        <Link
          href="/admin/units"
          className={`
            flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100
            rounded-md ${isActive('/admin/units') ? 'bg-primary/10 text-primary' : ''}
          `}
        >
          Units
        </Link>

        <Link
          href="/admin/topics"
          className={`
            flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100
            rounded-md ${isActive('/admin/topics') ? 'bg-primary/10 text-primary' : ''}
          `}
        >
          Topics
        </Link>

        <Link
          href="/admin/quizzes"
          className={`
            flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100
            rounded-md ${isActive('/admin/quizzes') ? 'bg-primary/10 text-primary' : ''}
          `}
        >
          Quizzes
        </Link>

        <Link
          href="/admin/questions"
          className={`
            flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100
            rounded-md ${isActive('/admin/questions') ? 'bg-primary/10 text-primary' : ''}
          `}
        >
          Questions
        </Link>

        <Link
          href="/admin/routine"
          className={`
            flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100
            rounded-md ${isActive('/admin/routine') ? 'bg-primary/10 text-primary' : ''}
          `}
        >
          Class Routine
        </Link>

        <Link
          href="/admin/announcements"
          className={`
            flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100
            rounded-md ${isActive('/admin/announcements') ? 'bg-primary/10 text-primary' : ''}
          `}
        >
          Announcements
        </Link>

        <Link
          href="/admin/users"
          className={`
            flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100
            rounded-md ${isActive('/admin/users') ? 'bg-primary/10 text-primary' : ''}
          `}
        >
          Users
        </Link>
      </nav>
    </aside>
  );
}