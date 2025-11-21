'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Upload, Clock } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function KlienLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const isActive = (path: string) => pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {children}

      {/* Bottom Navigation (Mobile & Desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-around p-2">
            <Link
              href="/dashboard"
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition ${isActive('/dashboard')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-xs font-medium">Dashboard</span>
            </Link>

            <Link
              href="/upload"
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition ${isActive('/upload')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <Upload className="w-6 h-6" />
              <span className="text-xs font-medium">Upload</span>
            </Link>

            <Link
              href="/history"
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition ${isActive('/history')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <Clock className="w-6 h-6" />
              <span className="text-xs font-medium">Riwayat</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}