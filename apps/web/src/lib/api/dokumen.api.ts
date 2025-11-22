// ============================================================================
// FILE: lib/api/dokumen.api.ts - Clean Version
// ============================================================================

import apiClient from "./client";
import {
  DokumenEntity,
  DokumenWithRelations,
  UpdateDokumenDto,
  QueryDokumenDto,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

export const dokumenApi = {
  getAll: async (params?: QueryDokumenDto): Promise<PaginatedResponse<DokumenWithRelations>> => {
    return apiClient.get("/dokumen", { params });
  },

  getById: async (id: string): Promise<ApiResponse<DokumenWithRelations>> => {
    return apiClient.get(`/dokumen/${id}`);
  },

  upload: async (formData: FormData): Promise<ApiResponse<DokumenEntity>> => {
    return apiClient.post("/dokumen", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  update: async (id: string, data: UpdateDokumenDto): Promise<ApiResponse<DokumenEntity>> => {
    return apiClient.patch(`/dokumen/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/dokumen/${id}`);
  },

  download: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/dokumen/${id}/download`, {
      responseType: "blob",
    });
    return response as unknown as Blob;
  },

  move: async (id: string, folderId: string | null): Promise<ApiResponse<any>> => {
    return apiClient.patch(`/dokumen/${id}/move`, {
      folder_id: folderId,
    });
  },

  copy: async (id: string, data?: {
    folder_id?: string | null;
    nama_dokumen?: string;
  }): Promise<ApiResponse<any>> => {
    return apiClient.post(`/dokumen/${id}/copy`, data || {});
  },

  bulkUpload: async (formData: FormData): Promise<ApiResponse<any>> => {
    return apiClient.post("/dokumen/bulk", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // ============================================================================
  // WORKFLOW API FUNCTIONS
  // ============================================================================

  submitDocument: async (id: string, notes?: string): Promise<ApiResponse<any>> => {
    return apiClient.post(`/dokumen/${id}/submit`, { notes });
  },

  bulkSubmit: async (dokumenIds: string[], notes?: string): Promise<ApiResponse<any>> => {
    return apiClient.post("/dokumen/workflow/bulk-submit", {
      dokumen_ids: dokumenIds,
      notes,
    });
  },

  reviewDocument: async (id: string, notes?: string): Promise<ApiResponse<any>> => {
    return apiClient.post(`/dokumen/${id}/review`, { notes });
  },

  approveDocument: async (id: string, notes?: string): Promise<ApiResponse<any>> => {
    return apiClient.post(`/dokumen/${id}/approve`, { notes });
  },

  bulkApprove: async (dokumenIds: string[], notes?: string): Promise<ApiResponse<any>> => {
    return apiClient.post("/dokumen/workflow/bulk-approve", {
      dokumen_ids: dokumenIds,
      notes,
    });
  },

  rejectDocument: async (id: string, reason: string, notes?: string): Promise<ApiResponse<any>> => {
    return apiClient.post(`/dokumen/${id}/reject`, { reason, notes });
  },

  bulkReject: async (dokumenIds: string[], reason: string, notes?: string): Promise<ApiResponse<any>> => {
    return apiClient.post("/dokumen/workflow/bulk-reject", {
      dokumen_ids: dokumenIds,
      reason,
      notes,
    });
  },

  archiveDocument: async (id: string, reason?: string, notes?: string): Promise<ApiResponse<any>> => {
    return apiClient.post(`/dokumen/${id}/archive`, { reason, notes });
  },

  getDocumentHistory: async (id: string): Promise<ApiResponse<any>> => {
    return apiClient.get(`/dokumen/${id}/history`);
  },

  getWorkflowQueue: async (params?: any): Promise<PaginatedResponse<any>> => {
    return apiClient.get("/dokumen/workflow/queue", { params });
  },

  getWorkflowStats: async (perkaraId?: string): Promise<ApiResponse<any>> => {
    return apiClient.get("/dokumen/workflow/stats", {
      params: perkaraId ? { perkara_id: perkaraId } : undefined,
    });
  },
};