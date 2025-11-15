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
};