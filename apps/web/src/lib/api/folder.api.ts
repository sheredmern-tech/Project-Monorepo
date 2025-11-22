import apiClient from './client';

export interface Folder {
  id: string;
  perkara_id: string;
  nama_folder: string;
  parent_id?: string | null;
  warna?: string | null;
  icon?: string | null;
  urutan: number;
  dibuat_oleh?: string;
  created_at: string;
  updated_at: string;
  _count?: {
    children: number;
    dokumen: number;
  };
  children?: Folder[];
}

export const folderApi = {
  create: async (data: {
    perkara_id: string;
    nama_folder: string;
    parent_id?: string;
    warna?: string;
    icon?: string;
    urutan?: number;
  }) => {
    const response = await apiClient.post('/folders', data);
    return response; // ✅ Interceptor already unwrapped
  },

  getAll: async (params?: {
    perkara_id?: string;
    parent_id?: string | 'null';
  }) => {
    const response = await apiClient.get('/folders', { params });
    return Array.isArray(response) ? response : (response?.data || []); // ✅ Handle both cases
  },

  getTree: async (perkaraId: string): Promise<Folder[]> => {
    const response = await apiClient.get(`/folders/tree/${perkaraId}`);
    return Array.isArray(response) ? response : (response?.data || []); // ✅ Handle both cases
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/folders/${id}`);
    return response; // ✅ Interceptor already unwrapped
  },

  update: async (id: string, data: Partial<{
    nama_folder: string;
    parent_id: string | null;
    warna: string;
    icon: string;
    urutan: number;
  }>) => {
    const response = await apiClient.patch(`/folders/${id}`, data);
    return response; // ✅ Interceptor already unwrapped
  },

  delete: async (id: string) => {
    await apiClient.delete(`/folders/${id}`);
  },
};
