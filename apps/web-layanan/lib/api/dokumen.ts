import apiClient from './client';
import { Dokumen, PaginatedResponse } from '@/types';

export const dokumenApi = {
  /**
   * Upload dokumen
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

    const response = await apiClient.post<Dokumen>('/dokumen', formData, {
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
    const response = await apiClient.get<PaginatedResponse<Dokumen>>('/dokumen', {
      params,
    });
    return response.data;
  },

  /**
   * Get single document
   */
  getById: async (id: string): Promise<Dokumen> => {
    const response = await apiClient.get<Dokumen>(`/dokumen/${id}`);
    return response.data;
  },

  /**
   * Delete document
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/dokumen/${id}`);
  },
};