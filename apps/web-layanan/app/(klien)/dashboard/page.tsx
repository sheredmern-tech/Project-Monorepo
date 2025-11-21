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
  ArrowRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDocumentTypeLabel } from '@/lib/utils/fileDetection';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [recentDocuments, setRecentDocuments] = useState<Dokumen[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_dokumen: 0,
    dokumen_bulan_ini: 0,
    dokumen_minggu_ini: 0,
  });
  const [loading, setLoading] = useState(true);
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

      const documentsData = Array.isArray(docsResponse?.data)
        ? docsResponse.data
        : [];

      // Sort by date and get only recent 5
      const recent = documentsData
        .sort(
          (a, b) =>
            new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
        )
        .slice(0, 5);

      setRecentDocuments(recent);
      setStats(statsData || { total_dokumen: 0, dokumen_bulan_ini: 0, dokumen_minggu_ini: 0 });
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setError('Gagal memuat data. Silakan coba lagi.');
      setRecentDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Selamat Datang, {user?.nama_lengkap}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Kelola dokumen Anda dengan mudah dan efisien
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-destructive hover:text-destructive/80"
                >
                  ×
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_dokumen}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Semua dokumen yang telah diupload
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.dokumen_bulan_ini}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Dokumen diupload bulan ini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minggu Ini</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.dokumen_minggu_ini}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Dokumen diupload minggu ini
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground cursor-pointer hover:shadow-lg transition" onClick={() => router.push('/upload')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Dokumen Baru
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Upload dokumen hukum Anda dengan mudah
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button className="flex items-center gap-2 text-sm font-medium hover:underline">
                Mulai Upload
                <ArrowRight className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary to-secondary/80 cursor-pointer hover:shadow-lg transition" onClick={() => router.push('/dokumen')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Lihat Semua Dokumen
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Kelola dan cari semua dokumen Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button className="flex items-center gap-2 text-sm font-medium hover:underline">
                Buka Dokumen
                <ArrowRight className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Dokumen Terbaru</CardTitle>
                <CardDescription>5 dokumen terakhir yang diupload</CardDescription>
              </div>
              <button
                onClick={() => router.push('/dokumen')}
                className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {recentDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Belum Ada Dokumen</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Mulai upload dokumen pertama Anda
                </p>
                <button
                  onClick={() => router.push('/upload')}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                >
                  Upload Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent hover:shadow-md transition cursor-pointer"
                    onClick={() => router.push(`/dokumen/${doc.id}`)}
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1 truncate">{doc.nama_dokumen}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        {doc.tipe_dokumen && (
                          <Badge variant="secondary" className="text-xs">
                            {getDocumentTypeLabel(doc.tipe_dokumen)}
                          </Badge>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(doc.uploaded_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
