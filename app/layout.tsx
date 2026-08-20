import '@/app/globals.css';
import Navbar from '@/components/navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ClassQuest',
  description: 'Turn Free Periods Into Learning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white">
        <Navbar />
        {children}
      </body>
    </html>
  );
}