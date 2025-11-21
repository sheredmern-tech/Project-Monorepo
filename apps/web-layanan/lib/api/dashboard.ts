import apiClient from './client';
import { DashboardStats } from '@/types';

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/dokumen-klien/stats');
    return response.data;
  },
};