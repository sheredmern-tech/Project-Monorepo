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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UploadDokumenPage() {
  const router = useRouter();
  const { user } = useAuth();

  // States
  const [perkaraList, setPerkaraList] = useState<Perkara[]>([]);
  const [loadingPerkara, setLoadingPerkara] = useState(true);
  const [selectedPerkara, setSelectedPerkara] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [kategori, setKategori] = useState('administratif');
  const [namaDokumen, setNamaDokumen] = useState('');
  const [catatan, setCatatan] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
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
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Ukuran file maksimal 10MB');
        return;
      }
      setFile(selectedFile);
      // Auto-set nama dokumen dari filename
      if (!namaDokumen) {
        setNamaDokumen(selectedFile.name);
      }
      setError('');
    }
  };

  const handleUpload = async () => {
    // Validation
    if (!selectedPerkara) {
      setError('Pilih perkara terlebih dahulu');
      return;
    }

    if (!file) {
      setError('Pilih file terlebih dahulu');
      return;
    }

    if (!namaDokumen.trim()) {
      setError('Nama dokumen harus diisi');
      return;
    }

    try {
      setUploading(true);
      setError('');

      await dokumenApi.upload({
        file,
        perkara_id: selectedPerkara,
        nama_dokumen: namaDokumen,
        kategori,
        catatan: catatan || undefined,
      });

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dokumen');
      }, 2000);
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
              <p className="text-muted-foreground">
                Dokumen berhasil diupload. Mengarahkan ke halaman dokumen...
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
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                disabled={uploading}
              />
              {file && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="truncate">{file.name}</span>
                  <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Format: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT (Max 10MB)
              </p>
            </div>

            {/* Nama Dokumen */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nama Dokumen <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={namaDokumen}
                onChange={(e) => setNamaDokumen(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Contoh: KTP - John Doe"
                disabled={uploading}
              />
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
                <option value="administratif">Administratif (KTP, KK, NPWP)</option>
                <option value="bukti">Bukti Pendukung</option>
                <option value="surat">Surat/Korespondensi</option>
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
                disabled={uploading || !selectedPerkara || !file || perkaraList.length === 0}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Upload Dokumen
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
