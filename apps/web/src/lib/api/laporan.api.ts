// ============================================================================
// FILE: lib/api/laporan.api.ts - Laporan (Reports) API Client
// ============================================================================

import apiClient from "./client";

export interface FinanceStatistics {
  total_perkara: number;
  total_nilai_perkara: number;
  total_nilai_fee: number;
  by_status_pembayaran: Record<string, number>;
  pending_payment: number;
  paid_payment: number;
}

export interface TeamStatistics {
  total_users: number;
  by_role: Record<string, number>;
  active_users: number;
  inactive_users: number;
  recent_additions: number;
}

export interface WorkloadDistribution {
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  active_perkara: number;
  pending_tugas: number;
  completed_tugas: number;
  total_dokumen: number;
  workload_score: number;
}

export interface GoogleDriveExportResult {
  fileId: string;
  fileName: string;
  webViewLink: string;
  webContentLink: string;
  embedLink: string;
}

export const laporanApi = {
  // ============================================================================
  // LAPORAN KINERJA (PERFORMANCE REPORT)
  // ============================================================================

  /**
   * Get team statistics
   */
  getTeamStatistics: async (): Promise<TeamStatistics> => {
    const response = await apiClient.get<TeamStatistics>("/users/statistics");
    return response.data;
  },

  /**
   * Get workload distribution
   */
  getWorkloadDistribution: async (): Promise<WorkloadDistribution[]> => {
    const response = await apiClient.get<WorkloadDistribution[]>(
      "/users/workload-distribution"
    );
    return response.data;
  },

  /**
   * Export Laporan Kinerja to local file (CSV/Excel)
   */
  exportKinerjaLocal: async (format: "csv" | "excel"): Promise<Blob> => {
    const response = await apiClient.post(
      "/users/reports/kinerja/export",
      { format },
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  /**
   * Export Laporan Kinerja to Google Drive
   */
  exportKinerjaToDrive: async (
    format: "csv" | "excel"
  ): Promise<GoogleDriveExportResult> => {
    const response = await apiClient.post<GoogleDriveExportResult>(
      "/users/reports/kinerja/export-to-drive",
      { format }
    );
    return response.data;
  },

  // ============================================================================
  // LAPORAN KEUANGAN (FINANCE REPORT)
  // ============================================================================

  /**
   * Get finance statistics
   */
  getFinanceStatistics: async (): Promise<FinanceStatistics> => {
    const response = await apiClient.get<FinanceStatistics>(
      "/perkara/reports/keuangan/statistics"
    );
    return response.data;
  },

  /**
   * Export Laporan Keuangan to local file (CSV/Excel)
   */
  exportKeuanganLocal: async (
    format: "csv" | "excel",
    filters?: any
  ): Promise<Blob> => {
    const response = await apiClient.post(
      "/perkara/reports/keuangan/export",
      { format, filters },
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  /**
   * Export Laporan Keuangan to Google Drive
   */
  exportKeuanganToDrive: async (
    format: "csv" | "excel",
    filters?: any
  ): Promise<GoogleDriveExportResult> => {
    const response = await apiClient.post<GoogleDriveExportResult>(
      "/perkara/reports/keuangan/export-to-drive",
      { format, filters }
    );
    return response.data;
  },
};
