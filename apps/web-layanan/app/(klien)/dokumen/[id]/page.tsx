'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { dokumenApi } from '@/lib/api/dokumen';
import { Dokumen } from '@/types';
import {
  ArrowLeft,
  FileText,
  Download,
  ExternalLink,
  Calendar,
  HardDrive,
  Tag,
  Loader2,
  AlertCircle,
  Edit,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getDocumentTypeLabel } from '@/lib/utils/fileDetection';
import { formatFileSize } from '@/lib/utils/fileValidation';
import { cn } from '@/lib/utils';

/**
 * Helper function to detect Google Workspace file type and build URLs
 */
function getGoogleWorkspaceUrls(googleDriveId: string, mimeType?: string): {
  isEditable: boolean;
  viewUrl: string;
  editUrl: string;
  fileType: 'docs' | 'sheets' | 'slides' | 'generic';
} {
  // Google Workspace MIME types
  const GOOGLE_DOCS = 'application/vnd.google-apps.document';
  const GOOGLE_SHEETS = 'application/vnd.google-apps.spreadsheet';
  const GOOGLE_SLIDES = 'application/vnd.google-apps.presentation';

  // Detect file type and build appropriate URLs
  switch (mimeType) {
    case GOOGLE_DOCS:
      return {
        isEditable: true,
        viewUrl: `https://docs.google.com/document/d/${googleDriveId}/preview`,
        editUrl: `https://docs.google.com/document/d/${googleDriveId}/edit`,
        fileType: 'docs',
      };
    case GOOGLE_SHEETS:
      return {
        isEditable: true,
        viewUrl: `https://docs.google.com/spreadsheets/d/${googleDriveId}/preview`,
        editUrl: `https://docs.google.com/spreadsheets/d/${googleDriveId}/edit`,
        fileType: 'sheets',
      };
    case GOOGLE_SLIDES:
      return {
        isEditable: true,
        viewUrl: `https://docs.google.com/presentation/d/${googleDriveId}/preview`,
        editUrl: `https://docs.google.com/presentation/d/${googleDriveId}/edit`,
        fileType: 'slides',
      };
    default:
      // Generic file (PDF, images, etc) - no edit mode
      return {
        isEditable: false,
        viewUrl: `https://drive.google.com/file/d/${googleDriveId}/preview`,
        editUrl: `https://drive.google.com/file/d/${googleDriveId}/view`,
        fileType: 'generic',
      };
  }
}

export default function DokumenDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [dokumen, setDokumen] = useState<Dokumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // ✨ NEW: Edit mode state

  // ✅ FIX: Extract google_drive_id from google_drive_link - BEFORE any hooks
  const extractDriveId = (link?: string): string | undefined => {
    if (!link) return undefined;
    const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : undefined;
  };

  const google_drive_id = dokumen ? extractDriveId(dokumen.google_drive_link) : undefined;

  // ✅ FIX: Move useMemo BEFORE any conditional returns (Rules of Hooks)
  const fileUrls = useMemo(() => {
    if (!google_drive_id || !dokumen) {
      return {
        isEditable: false,
        viewUrl: dokumen?.embed_link || '',
        editUrl: '',
        fileType: 'generic' as const,
      };
    }

    return getGoogleWorkspaceUrls(google_drive_id, dokumen.mime_type);
  }, [google_drive_id, dokumen?.mime_type, dokumen?.embed_link]);

  // ✨ Dynamic iframe URL based on mode
  const embedLink = isEditMode ? fileUrls.editUrl : fileUrls.viewUrl;
  const extension = dokumen?.nama_dokumen.split('.').pop()?.toUpperCase() || 'FILE';

  useEffect(() => {
    fetchDokumen();
  }, [id]);

  const fetchDokumen = async () => {
    try {
      setError('');
      // Since we don't have a getById endpoint, fetch all and filter
      const response = await dokumenApi.getAll();
      const documentsData = Array.isArray(response?.data) ? response.data : [];
      const doc = documentsData.find((d) => d.id === id);

      if (!doc) {
        setError('Dokumen tidak ditemukan');
      } else {
        setDokumen(doc);
      }
    } catch (error: any) {
      console.error('Failed to fetch document:', error);
      setError('Gagal memuat dokumen. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (dokumen?.google_drive_link || dokumen?.file_url) {
      window.open(dokumen.google_drive_link || dokumen.file_url, '_blank');
    }
  };

  const handleOpenInDrive = () => {
    if (dokumen?.google_drive_link || dokumen?.file_url) {
      window.open(dokumen.google_drive_link || dokumen.file_url, '_blank');
    }
  };

  // ✅ Conditional returns AFTER all hooks
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !dokumen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {error || 'Dokumen Tidak Ditemukan'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Dokumen yang Anda cari tidak ditemukan atau telah dihapus.
                </p>
              </div>
              <button
                onClick={() => router.push('/dokumen')}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
              >
                Kembali ke Dokumen
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push('/dokumen')}
              className="p-2 hover:bg-accent rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <h1 className="text-xl font-bold truncate">{dokumen.nama_dokumen}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{extension}</Badge>
                {dokumen.tipe_dokumen && (
                  <Badge variant="outline">
                    {getDocumentTypeLabel(dokumen.tipe_dokumen)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* ✨ NEW: Edit Mode Toggle (only for Google Workspace files) */}
            {fileUrls.isEditable && (
              <button
                onClick={() => {
                  setIsEditMode(!isEditMode);
                  setIframeLoading(true); // Reset loading state when switching
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
                  isEditMode
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border hover:bg-accent'
                }`}
              >
                {isEditMode ? (
                  <>
                    <Edit className="h-4 w-4" />
                    Editing
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    View Mode
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleOpenInDrive}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Drive
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {embedLink ? (
                  <div
                    className="relative w-full bg-muted rounded-lg overflow-hidden border"
                    style={{ minHeight: '600px' }}
                  >
                    {/* Loading Overlay */}
                    {iframeLoading && !iframeError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-10">
                        <div className="text-center space-y-3">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                          <p className="text-sm text-muted-foreground">
                            Loading preview...
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Error State */}
                    {iframeError ? (
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="text-center space-y-4 max-w-md">
                          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">
                              Preview Tidak Dapat Dimuat
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Google Drive mungkin memblokir embedding untuk file ini.
                              Silakan buka di tab baru atau download file.
                            </p>
                          </div>
                          <div className="flex gap-2 justify-center flex-wrap">
                            <button
                              onClick={handleOpenInDrive}
                              className="px-4 py-2 border rounded-lg hover:bg-accent transition text-sm font-medium"
                            >
                              <ExternalLink className="inline h-4 w-4 mr-2" />
                              Buka di Tab Baru
                            </button>
                            <button
                              onClick={() => {
                                setIframeError(false);
                                setIframeLoading(true);
                              }}
                              className="px-4 py-2 border rounded-lg hover:bg-accent transition text-sm font-medium"
                            >
                              Coba Lagi
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <iframe
                        src={embedLink}
                        className="w-full h-full"
                        style={{ minHeight: '600px' }}
                        title={dokumen.nama_dokumen}
                        allow="autoplay"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        referrerPolicy="no-referrer-when-downgrade"
                        loading="lazy"
                        onLoad={() => setIframeLoading(false)}
                        onError={() => {
                          setIframeLoading(false);
                          setIframeError(true);
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[600px]">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Preview Tidak Tersedia</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          File ini tidak memiliki link preview
                        </p>
                        <button
                          onClick={handleDownload}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
                        >
                          <Download className="inline h-4 w-4 mr-2" />
                          Download untuk Melihat
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Dokumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dokumen.file_size && (
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Ukuran:</span>
                    <span className="font-medium ml-auto">
                      {formatFileSize(dokumen.file_size)}
                    </span>
                  </div>
                )}

                {dokumen.mime_type && (
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Tipe:</span>
                    <span className="font-medium ml-auto truncate max-w-[150px]">
                      {dokumen.mime_type}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Upload:</span>
                  <span className="font-medium ml-auto">
                    {new Date(dokumen.uploaded_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {dokumen.deskripsi && (
              <Card>
                <CardHeader>
                  <CardTitle>Deskripsi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                    {dokumen.deskripsi}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Aksi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={handleOpenInDrive}
                  className="w-full flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition text-sm font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  Buka di Google Drive
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
                >
                  <Download className="h-4 w-4" />
                  Download File
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
