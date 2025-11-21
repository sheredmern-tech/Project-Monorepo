'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ⚠️ HALAMAN INI TIDAK COMPATIBLE DENGAN SINGLE SYSTEM
 *
 * Bulk upload tidak support perkara_id yang REQUIRED di SINGLE SYSTEM.
 * Redirect ke /dokumen/upload yang sudah support SINGLE SYSTEM.
 */
export default function BulkUploadPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect ke halaman upload baru
    router.push('/dokumen/upload');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-yellow-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Halaman Tidak Tersedia
        </h2>
        <p className="text-gray-600 mb-6">
          Bulk upload telah diganti dengan sistem upload baru yang lebih baik.
          Anda akan dialihkan otomatis...
        </p>
        <button
          onClick={() => router.push('/dokumen/upload')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Lanjutkan ke Upload Baru
        </button>
      </div>
    </div>
  );
}
