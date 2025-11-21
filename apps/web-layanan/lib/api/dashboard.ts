import apiClient from './client';
import { DashboardStats } from '@/types';

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<any>('/dokumen-klien/stats');
    // ✅ Backend returns: { success: true, data: {...} }
    return response.data.data || response.data;
  },
};