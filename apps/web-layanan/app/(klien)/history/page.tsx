'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useDokumenStore } from '@/lib/stores/dokumen-store';
import { Dokumen } from '@/types';
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { getDocumentTypeLabel } from '@/lib/utils/fileDetection';

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useAuth();

  // ✅ Use Zustand store for global state
  const { documents, loading, error, fetchDocuments, clearError } = useDokumenStore();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  /**
   * Group documents by date
   */
  const groupByDate = (docs: Dokumen[]) => {
    const groups: { [key: string]: Dokumen[] } = {};

    docs.forEach((doc) => {
      const date = new Date(doc.uploaded_at).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(doc);
    });

    return groups;
  };

  const groupedDocs = groupByDate(documents);

  /**
   * Calculate stats
   */
  const stats = {
    total: documents.length,
    today: documents.filter((doc) => {
      const today = new Date();
      const docDate = new Date(doc.uploaded_at);
      return (
        docDate.getDate() === today.getDate() &&
        docDate.getMonth() === today.getMonth() &&
        docDate.getFullYear() === today.getFullYear()
      );
    }).length,
    thisWeek: documents.filter((doc) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(doc.uploaded_at) >= weekAgo;
    }).length,
    uniqueDates: Object.keys(groupedDocs).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Riwayat Upload
                </h1>
                <p className="text-sm text-gray-600">
                  Timeline semua dokumen yang pernah diupload
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="font-medium text-gray-900">{user?.nama_lengkap}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Stats Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Ringkasan</h2>
            <button
              onClick={fetchDocuments}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Dokumen</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              <p className="text-sm text-gray-600">Hari Ini</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
              <p className="text-sm text-gray-600">Minggu Ini</p>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.uniqueDates}
              </p>
              <p className="text-sm text-gray-600">Hari Upload</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {documents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Belum Ada Riwayat
            </h3>
            <p className="text-gray-600 mb-4">
              Mulai upload dokumen untuk melihat riwayat upload Anda
            </p>
            <button
              onClick={() => router.push('/upload')}
              className="text-blue-600 font-medium hover:underline"
            >
              Upload Dokumen Sekarang →
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedDocs).map(([date, docs], dateIndex) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{date}</h2>
                    <p className="text-sm text-gray-600">{docs.length} dokumen</p>
                  </div>
                </div>

                {/* Documents */}
                <div className="ml-5 sm:ml-14 space-y-4">
                  {docs.map((doc, index) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition relative"
                    >
                      {/* Timeline Line (except last item) */}
                      {index < docs.length - 1 && (
                        <div className="absolute left-[-19px] sm:left-[-34px] top-12 w-0.5 h-full bg-blue-200" />
                      )}

                      {/* Timeline Dot */}
                      <div className="absolute left-[-26px] sm:left-[-42px] top-4 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md" />

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                {doc.nama_dokumen}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                                  {getDocumentTypeLabel(doc.tipe_dokumen)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(doc.uploaded_at).toLocaleTimeString(
                                    'id-ID',
                                    {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">Success</span>
                            </div>
                          </div>

                          {doc.deskripsi && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                              {doc.deskripsi}
                            </p>
                          )}

                          <div className="flex gap-2">
                            <a
                              href={doc.google_drive_link || doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Lihat
                            </a>
                            <a
                              href={doc.google_drive_link || doc.file_url}
                              download
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}