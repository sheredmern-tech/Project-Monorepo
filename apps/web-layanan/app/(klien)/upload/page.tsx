'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUpload } from '@/lib/hooks/useUpload';
import {
  ArrowLeft,
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Folder,
  Download,
  Eye,
  Trash2,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import { formatFileSize } from '@/lib/utils/fileValidation';
import { getDocumentTypeLabel, getDocumentTypeColor } from '@/lib/utils/fileDetection';

export default function BulkUploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    files,
    uploading,
    uploadComplete,
    stats,
    addFiles,
    removeFile,
    clearFiles,
    uploadAll,
    retryFailed,
  } = useUpload();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      addFiles(acceptedFiles);
    },
    [addFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'uploading':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Folder className="w-5 h-5" />;
      case 'uploading':
        return (
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        );
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Folder className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
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
                  Bulk Upload Dokumen
                </h1>
                <p className="text-sm text-gray-600">
                  Upload multiple files sekaligus dengan mudah
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="font-medium text-gray-900">{user?.nama_lengkap}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total Files</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-200">
            <p className="text-sm text-blue-600">Pending</p>
            <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-200">
            <p className="text-sm text-green-600">Success</p>
            <p className="text-3xl font-bold text-green-600">{stats.success}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-red-200">
            <p className="text-sm text-red-600">Failed</p>
            <p className="text-3xl font-bold text-red-600">{stats.error}</p>
          </div>
        </div>

        {/* Dropzone */}
        {!uploadComplete && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 mb-8 text-center cursor-pointer transition ${isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 bg-white'
              } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-16 sm:w-20 h-16 sm:h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {isDragActive
                ? 'Drop files di sini...'
                : 'Drag & Drop Files atau Klik untuk Browse'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Mendukung: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Max 10MB per file • Unlimited files
            </p>
          </div>
        )}

        {/* Files List */}
        {files.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold">
                Files ({files.length})
              </h2>
              {!uploading && !uploadComplete && (
                <div className="flex gap-3">
                  <button
                    onClick={clearFiles}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus Semua
                  </button>
                  <button
                    onClick={uploadAll}
                    disabled={files.length === 0}
                    className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:bg-gray-400 text-sm sm:text-base font-semibold"
                  >
                    <Upload className="w-4 sm:w-5 h-4 sm:h-5" />
                    Upload Semua ({files.length})
                  </button>
                </div>
              )}
              {stats.error > 0 && uploadComplete && (
                <button
                  onClick={retryFailed}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                >
                  Retry Failed ({stats.error})
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`border rounded-lg p-4 transition ${file.status === 'success'
                    ? 'border-green-300 bg-green-50'
                    : file.status === 'error'
                      ? 'border-red-300 bg-red-50'
                      : file.status === 'uploading'
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    {/* File Preview/Icon */}
                    <div className="flex-shrink-0">
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.file.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                            {file.file.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {formatFileSize(file.file.size)} •{' '}
                            {file.file.type || 'Unknown type'}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                            file.status
                          )}`}
                        >
                          {getStatusIcon(file.status)}
                          <span className="capitalize hidden sm:inline">
                            {file.status}
                          </span>
                        </div>
                      </div>

                      {/* Auto-detected Type */}
                      {file.status !== 'error' && file.uploadedData && (
                        <div className="mb-2">
                          <span className="text-xs text-gray-600">
                            Auto-detected:
                          </span>{' '}
                          <span className="text-xs font-medium text-blue-600">
                            {getDocumentTypeLabel(
                              file.uploadedData.tipe_dokumen
                            )}
                          </span>
                        </div>
                      )}

                      {/* Progress Bar */}
                      {file.status === 'uploading' && (
                        <div className="mb-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {file.progress}%
                          </p>
                        </div>
                      )}

                      {/* Error Message */}
                      {file.status === 'error' && file.error && (
                        <p className="text-xs sm:text-sm text-red-600 mb-2">
                          ❌ {file.error}
                        </p>
                      )}

                      {/* Success Actions */}
                      {file.status === 'success' && file.uploadedData && (
                        <div className="flex gap-2 mt-2">
                          <a
                            href={file.uploadedData.google_drive_link || file.uploadedData.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </a>
                          <a
                            href={file.uploadedData.google_drive_link || file.uploadedData.file_url}
                            download
                            className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    {file.status === 'pending' && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Complete */}
        {uploadComplete && stats.success > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 text-center border border-green-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              🎉 Upload Selesai!
            </h2>
            <p className="text-gray-600 mb-6">
              {stats.success} dari {stats.total} files berhasil diupload
              {stats.error > 0 && ` (${stats.error} gagal)`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
              >
                Lihat Dashboard
              </button>
              <button
                onClick={() => {
                  clearFiles();
                }}
                className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-semibold"
              >
                Upload Lagi
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && !uploadComplete && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Siap untuk Upload?
            </h3>
            <p className="text-gray-600">
              Drag & drop files ke area di atas atau klik untuk memilih
            </p>
          </div>
        )}
      </main>
    </div>
  );
}