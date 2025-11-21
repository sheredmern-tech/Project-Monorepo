import apiClient from './client';

export interface Perkara {
  id: string;
  nomor_perkara: string;
  judul: string;
  jenis_perkara: string;
  status: string;
  tanggal_daftar: string;
  klien_id: string;
}

export const perkaraApi = {
  /**
   * Get all cases for current klien
   * Backend automatically filters by klien_id for klien role
   */
  getAll: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Perkara[]; meta: any }> => {
    const response = await apiClient.get<any>('/perkara', {
      params,
    });

    // ✅ TransformInterceptor wraps response
    return {
      data: response.data.data?.data || [],
      meta: response.data.data?.meta || {},
    };
  },

  /**
   * Get single case by ID
   */
  getById: async (id: string): Promise<Perkara> => {
    const response = await apiClient.get<any>(`/perkara/${id}`);
    return response.data.data || response.data;
  },
};
