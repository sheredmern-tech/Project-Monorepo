import apiClient from './client';
import { Dokumen, PaginatedResponse } from '@/types';

export const dokumenApi = {
  /**
   * Upload dokumen (SINGLE SYSTEM: uses /dokumen endpoint)
   * ✅ Requires perkara_id
   */
  upload: async (data: {
    file: File;
    perkara_id: string; // ✅ REQUIRED for single system
    nama_dokumen: string;
    kategori: string;
    nomor_bukti?: string;
    tanggal_dokumen?: string;
    catatan?: string;
  }): Promise<any> => {
    const formData = new FormData();

    formData.append('file', data.file);
    formData.append('perkara_id', data.perkara_id);
    formData.append('nama_dokumen', data.nama_dokumen);
    formData.append('kategori', data.kategori);

    if (data.nomor_bukti) {
      formData.append('nomor_bukti', data.nomor_bukti);
    }

    if (data.tanggal_dokumen) {
      formData.append('tanggal_dokumen', data.tanggal_dokumen);
    }

    if (data.catatan) {
      formData.append('catatan', data.catatan);
    }

    const response = await apiClient.post<any>('/dokumen', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // ✅ Backend returns: { success: true, data: {...dokumen} }
    return response.data;
  },

  /**
   * Bulk upload multiple dokumen at once
   * ✅ Max 10 files per request
   */
  bulkUpload: async (data: {
    files: File[];
    perkara_id: string;
    kategori: string;
    nomor_bukti?: string;
    tanggal_dokumen?: string;
    catatan?: string;
  }): Promise<any> => {
    const formData = new FormData();

    // Append multiple files
    data.files.forEach((file) => {
      formData.append('files', file);
    });

    formData.append('perkara_id', data.perkara_id);
    formData.append('kategori', data.kategori);

    if (data.nomor_bukti) {
      formData.append('nomor_bukti', data.nomor_bukti);
    }

    if (data.tanggal_dokumen) {
      formData.append('tanggal_dokumen', data.tanggal_dokumen);
    }

    if (data.catatan) {
      formData.append('catatan', data.catatan);
    }

    const response = await apiClient.post<any>('/dokumen/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Get all documents (filtered by user role automatically in backend)
   */
  getAll: async (params?: {
    search?: string;
    kategori?: string;
    perkara_id?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Dokumen>> => {
    const response = await apiClient.get<any>('/dokumen', {
      params,
    });
    // ✅ TransformInterceptor wraps response:
    // { success: true, data: { data: [...], meta: {...} }, timestamp: "..." }
    return {
      data: response.data.data?.data || [],
      meta: response.data.data?.meta || {},
    };
  },

  /**
   * Get single document
   */
  getById: async (id: string): Promise<Dokumen> => {
    const response = await apiClient.get<Dokumen>(`/dokumen/${id}`);
    return response.data;
  },

  /**
   * Download document
   */
  download: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/dokumen/${id}/download`);
    return response.data;
  },

  /**
   * Delete document
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/dokumen/${id}`);
  },

  /**
   * Move document to folder
   */
  move: async (id: string, folderId: string | null): Promise<any> => {
    const response = await apiClient.patch(`/dokumen/${id}/move`, {
      folder_id: folderId,
    });
    return response.data;
  },

  /**
   * Copy document
   */
  copy: async (id: string, data?: {
    folder_id?: string | null;
    nama_dokumen?: string;
  }): Promise<any> => {
    const response = await apiClient.post(`/dokumen/${id}/copy`, data || {});
    return response.data;
  },
};