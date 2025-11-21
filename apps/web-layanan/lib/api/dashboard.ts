import apiClient from './client';
import { DashboardStats } from '@/types';

export const dashboardApi = {
  /**
   * Get dashboard statistics (SINGLE SYSTEM: uses /dokumen/stats)
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<any>('/dokumen/stats');
    // ✅ TransformInterceptor wraps response:
    // { success: true, data: { total_dokumen, dokumen_bulan_ini, ... }, timestamp: "..." }
    return response.data.data || {};
  },
};