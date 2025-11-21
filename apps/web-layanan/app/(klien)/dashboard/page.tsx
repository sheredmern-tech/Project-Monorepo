'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { dokumenApi } from '@/lib/api/dokumen';
import { dashboardApi } from '@/lib/api/dashboard';
import { Dokumen, DashboardStats } from '@/types';
import {
  Upload,
  FileText,
  Clock,
  CheckCircle,
  LogOut,
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { formatFileSize } from '@/lib/utils/fileValidation';
import { getDocumentTypeLabel } from '@/lib/utils/fileDetection';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [documents, setDocuments] = useState<Dokumen[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_dokumen: 0,
    dokumen_bulan_ini: 0,
    dokumen_minggu_ini: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError('');
      const [docsResponse, statsData] = await Promise.all([
        dokumenApi.getAll(),
        dashboardApi.getStats(),
      ]);

      setDocuments(docsResponse.data);
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus dokumen "${nama}"?`)) {
      return;
    }

    try {
      await dokumenApi.delete(id);
      setDocuments(docs => docs.filter(doc => doc.id !== id));

      // Update stats
      setStats(prev => ({
        ...prev,
        total_dokumen: prev.total_dokumen - 1,
      }));

      alert('Dokumen berhasil dihapus');
    } catch (error: any) {
      console.error('Delete failed:', error);
      alert('Gagal menghapus dokumen. Silakan coba lagi.');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.nama_dokumen
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === 'all' || doc.tipe_dokumen === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WEB-LAYANAN</h1>
                <p className="text-xs text-gray-600">Document Upload System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-gray-900">{user?.nama_lengkap}</p>
                <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Selamat Datang, {user?.nama_lengkap}! 👋
          </h2>
          <p className="text-gray-600">
            Upload dan kelola dokumen hukum Anda dengan mudah dan aman
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Dokumen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_dokumen}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bulan Ini</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.dokumen_bulan_ini}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Minggu Ini</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.dokumen_minggu_ini}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-xl shadow-blue-500/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                Upload Dokumen Baru
              </h3>
              <p className="text-blue-100">
                Mulai upload dokumen hukum Anda sekarang dengan mudah
              </p>
            </div>
            <button
              onClick={() => router.push('/upload')}
              className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-blue-50 transition flex items-center gap-2 shadow-lg whitespace-nowrap"
            >
              <Upload className="w-5 h-5" />
              Upload Sekarang
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari dokumen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Semua Tipe</option>
              <option value="surat_kuasa">Surat Kuasa</option>
              <option value="gugatan">Gugatan</option>
              <option value="putusan">Putusan</option>
              <option value="bukti">Bukti</option>
              <option value="kontrak">Kontrak</option>
              <option value="surat_menyurat">Surat Menyurat</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        {/* Document List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Dokumen Saya ({filteredDocuments.length})
            </h3>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">
                {searchQuery || filterType !== 'all'
                  ? 'Tidak ada dokumen yang cocok dengan filter'
                  : 'Belum ada dokumen yang diupload'}
              </p>
              <button
                onClick={() => router.push('/upload')}
                className="text-blue-600 font-medium hover:underline"
              >
                Upload dokumen pertama Anda →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 truncate">
                            {doc.nama_dokumen}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium capitalize">
                              {getDocumentTypeLabel(doc.tipe_dokumen)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(doc.uploaded_at).toLocaleDateString(
                                'id-ID',
                                {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {doc.deskripsi && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {doc.deskripsi}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat
                        </a>
                        <a
                          href={doc.file_url}
                          download
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                        <button
                          onClick={() => handleDelete(doc.id, doc.nama_dokumen)}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}