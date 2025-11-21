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
  /**
   * Create new folder
   */
  create: async (data: {
    perkara_id: string;
    nama_folder: string;
    parent_id?: string;
    warna?: string;
    icon?: string;
    urutan?: number;
  }): Promise<any> => {
    const response = await apiClient.post('/folders', data);
    return response.data;
  },

  /**
   * Get all folders with optional filtering
   */
  getAll: async (params?: {
    perkara_id?: string;
    parent_id?: string | 'null';
  }): Promise<Folder[]> => {
    const response = await apiClient.get('/folders', { params });
    return response.data.data || [];
  },

  /**
   * Get folder tree for a perkara
   */
  getTree: async (perkaraId: string): Promise<Folder[]> => {
    const response = await apiClient.get(`/folders/tree/${perkaraId}`);
    return response.data.data || [];
  },

  /**
   * Get single folder with details
   */
  getById: async (id: string): Promise<Folder> => {
    const response = await apiClient.get(`/folders/${id}`);
    return response.data.data;
  },

  /**
   * Update folder
   */
  update: async (id: string, data: Partial<{
    nama_folder: string;
    parent_id: string | null;
    warna: string;
    icon: string;
    urutan: number;
  }>): Promise<any> => {
    const response = await apiClient.patch(`/folders/${id}`, data);
    return response.data;
  },

  /**
   * Delete folder
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/folders/${id}`);
  },
};
