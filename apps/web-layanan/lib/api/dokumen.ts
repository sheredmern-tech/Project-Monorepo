import apiClient from './client';
import { Dokumen, PaginatedResponse } from '@/types';

export const dokumenApi = {
  /**
   * Upload dokumen (bulk upload)
   */
  upload: async (data: {
    files: File[];
    nama_dokumen: string;
    tipe_dokumen: string;
    deskripsi?: string;
    kategori?: string;
    tags?: string[];
  }): Promise<Dokumen> => {
    const formData = new FormData();

    data.files.forEach((file) => {
      formData.append('files', file);
    });

    formData.append('nama_dokumen', data.nama_dokumen);
    formData.append('tipe_dokumen', data.tipe_dokumen);

    if (data.deskripsi) {
      formData.append('deskripsi', data.deskripsi);
    }

    if (data.kategori) {
      formData.append('kategori', data.kategori);
    }

    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }

    const response = await apiClient.post<Dokumen>('/dokumen-klien/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Get all documents
   */
  getAll: async (params?: {
    search?: string;
    tipe_dokumen?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Dokumen>> => {
    const response = await apiClient.get<any>('/dokumen-klien', {
      params,
    });
    // ✅ Backend returns: { success: true, data: [...], meta: {...} }
    // Extract the actual data array
    return {
      data: response.data.data || [],
      meta: response.data.meta || {},
    };
  },

  /**
   * Get single document
   */
  getById: async (id: string): Promise<Dokumen> => {
    const response = await apiClient.get<Dokumen>(`/dokumen-klien/${id}`);
    return response.data;
  },

  /**
   * Delete document
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/dokumen-klien/${id}`);
  },
};