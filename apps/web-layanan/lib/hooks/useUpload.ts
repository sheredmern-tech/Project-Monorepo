'use client';

import { useState, useCallback } from 'react';
import { dokumenApi } from '@/lib/api/dokumen';
import { BulkFile } from '@/types';
import { extractMetadataFromFilename } from '@/lib/utils/fileDetection';
import { validateFile } from '@/lib/utils/fileValidation';

export function useUpload() {
  const [files, setFiles] = useState<BulkFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  /**
   * Add files to upload queue
   */
  const addFiles = useCallback((newFiles: File[]) => {
    const bulkFiles: BulkFile[] = newFiles.map((file) => {
      // Validate file
      const validation = validateFile(file);

      return {
        id: Math.random().toString(36).substring(7),
        file,
        preview: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined,
        status: validation.valid ? 'pending' : 'error',
        progress: 0,
        error: validation.valid ? undefined : validation.error,
      };
    });

    setFiles((prev) => [...prev, ...bulkFiles]);
  }, []);

  /**
   * Remove file from queue
   */
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find(f => f.id === id);
      // Revoke object URL to prevent memory leak
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  /**
   * Clear all files
   */
  const clearFiles = useCallback(() => {
    // Revoke all object URLs
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setUploadComplete(false);
  }, [files]);

  /**
   * Upload all files
   */
  const uploadAll = useCallback(async () => {
    if (files.length === 0) return;

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Skip if already error or success
      if (file.status === 'error' || file.status === 'success') {
        continue;
      }

      try {
        // Update status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
          )
        );

        // Extract metadata from filename
        const metadata = extractMetadataFromFilename(file.file);

        // Simulate progress
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) => {
              if (f.id === file.id && f.progress < 90) {
                return { ...f, progress: f.progress + 10 };
              }
              return f;
            })
          );
        }, 200);

        // Upload to backend
        const response = await dokumenApi.upload({
          files: [file.file],
          nama_dokumen: metadata.nama_dokumen,
          tipe_dokumen: metadata.tipe_dokumen,
          deskripsi: metadata.deskripsi,
          kategori: metadata.kategori,
        });

        clearInterval(progressInterval);

        // Update status to success
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                ...f,
                status: 'success',
                progress: 100,
                uploadedData: response,
              }
              : f
          )
        );
      } catch (error: any) {
        // Update status to error
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                ...f,
                status: 'error',
                progress: 0,
                error:
                  error.response?.data?.message ||
                  error.message ||
                  'Upload failed',
              }
              : f
          )
        );
      }
    }

    setUploading(false);
    setUploadComplete(true);
  }, [files]);

  /**
   * Retry failed uploads
   */
  const retryFailed = useCallback(async () => {
    // Reset failed files to pending
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'error'
          ? { ...f, status: 'pending', progress: 0, error: undefined }
          : f
      )
    );

    // Re-upload
    await uploadAll();
  }, [uploadAll]);

  // Calculate stats
  const stats = {
    total: files.length,
    pending: files.filter((f) => f.status === 'pending').length,
    uploading: files.filter((f) => f.status === 'uploading').length,
    success: files.filter((f) => f.status === 'success').length,
    error: files.filter((f) => f.status === 'error').length,
  };

  return {
    files,
    uploading,
    uploadComplete,
    stats,
    addFiles,
    removeFile,
    clearFiles,
    uploadAll,
    retryFailed,
  };
}