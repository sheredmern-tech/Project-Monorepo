'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { dokumenApi } from '@/lib/api/dokumen';
import { perkaraApi, Perkara } from '@/lib/api/perkara';
import {
  ArrowLeft,
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  Folder,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UploadDokumenPage() {
  const router = useRouter();
  const { user } = useAuth();

  // States
  const [perkaraList, setPerkaraList] = useState<Perkara[]>([]);
  const [loadingPerkara, setLoadingPerkara] = useState(true);
  const [selectedPerkara, setSelectedPerkara] = useState('');
  const [files, setFiles] = useState<File[]>([]); // Changed to array
  const [kategori, setKategori] = useState('bukti');
  const [catatan, setCatatan] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState('');

  // Fetch perkara list
  useEffect(() => {
    fetchPerkara();
  }, []);

  const fetchPerkara = async () => {
    try {
      setLoadingPerkara(true);
      const response = await perkaraApi.getAll({ limit: 100 });
      setPerkaraList(response.data);
    } catch (err: any) {
      console.error('Failed to fetch perkara:', err);
      setError('Gagal memuat daftar perkara');
    } finally {
      setLoadingPerkara(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    // Validate max files
    if (selectedFiles.length > 10) {
      setError('Maksimal 10 file per upload');
      return;
    }

    // Validate each file size (max 10MB per file)
    const invalidFiles = selectedFiles.filter(f => f.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError(`File terlalu besar: ${invalidFiles.map(f => f.name).join(', ')} (Max 10MB per file)`);
      return;
    }

    setFiles(selectedFiles);
    setError('');
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    // Validation
    if (!selectedPerkara) {
      setError('Pilih perkara terlebih dahulu');
      return;
    }

    if (files.length === 0) {
      setError('Pilih minimal 1 file terlebih dahulu');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const result = await dokumenApi.bulkUpload({
        files,
        perkara_id: selectedPerkara,
        kategori,
        catatan: catatan || undefined,
      });

      setSuccess(true);
      setUploadResult(result.data);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/dokumen');
      }, 3000);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Gagal upload dokumen. Silakan coba lagi.'
      );
    } finally {
      setUploading(false);
    }
  };

  if (loadingPerkara) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">Upload Berhasil!</h2>
              {uploadResult && (
                <div className="text-sm space-y-2">
                  <p className="text-muted-foreground">{uploadResult.message}</p>
                  <div className="flex justify-center gap-4 text-xs">
                    <span className="text-green-600">
                      ✓ {uploadResult.uploaded} berhasil
                    </span>
                    {uploadResult.failed > 0 && (
                      <span className="text-red-600">
                        ✗ {uploadResult.failed} gagal
                      </span>
                    )}
                  </div>
                </div>
              )}
              <p className="text-muted-foreground text-sm">
                Mengarahkan ke halaman dokumen...
              </p>
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dokumen')}
              className="p-2 hover:bg-accent rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Upload Dokumen</h1>
              <p className="text-sm text-muted-foreground">
                Upload dokumen pendukung untuk perkara Anda
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
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

        {/* No Perkara Warning */}
        {perkaraList.length === 0 && (
          <Card className="mb-6 border-orange-300 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-900 mb-1">
                    Belum Ada Perkara
                  </p>
                  <p className="text-sm text-orange-700">
                    Anda belum memiliki perkara. Silakan hubungi admin untuk membuat perkara terlebih dahulu sebelum mengupload dokumen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Form Upload Dokumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Perkara Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Pilih Perkara <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Folder className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <select
                  value={selectedPerkara}
                  onChange={(e) => setSelectedPerkara(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={perkaraList.length === 0 || uploading}
                >
                  <option value="">-- Pilih Perkara --</option>
                  {perkaraList.map((perkara) => (
                    <option key={perkara.id} value={perkara.id}>
                      {perkara.nomor_perkara} - {perkara.judul}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Pilih perkara yang terkait dengan dokumen ini
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Pilih File <span className="text-destructive">*</span>
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                disabled={uploading}
              />

              {/* Files Preview */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {files.length} file terpilih:
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-accent rounded-lg text-sm"
                      >
                        <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <span className="truncate flex-1">{file.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <button
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                          className="p-1 hover:bg-destructive/10 rounded transition disabled:opacity-50"
                          title="Hapus file"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                Format: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT (Max 10MB per file, Max 10 files)
              </p>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Kategori Dokumen
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={uploading}
              >
                <option value="bukti">Bukti Pendukung (KTP, KK, NPWP, dll)</option>
                <option value="surat_kuasa">Surat Kuasa</option>
                <option value="kontrak">Kontrak/Perjanjian</option>
                <option value="korespondensi">Surat/Email</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
                placeholder="Tambahkan catatan tentang dokumen ini..."
                disabled={uploading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dokumen')}
                className="flex-1 px-6 py-3 border rounded-lg hover:bg-accent transition"
                disabled={uploading}
              >
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedPerkara || files.length === 0 || perkaraList.length === 0}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Mengupload {files.length} file...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Upload {files.length > 0 ? `${files.length} ` : ''}Dokumen
                  </>
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
