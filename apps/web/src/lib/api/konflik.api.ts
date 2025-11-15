// ============================================================================
// FILE: lib/api/konflik.api.ts - Clean Version
// ============================================================================

import apiClient from "./client";
import {
  PemeriksaanKonflikEntity,
  KonflikWithRelations,
  CreateKonflikDto,
  UpdateKonflikDto,
  QueryKonflikDto,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

export const konflikApi = {
  getAll: async (params?: QueryKonflikDto): Promise<PaginatedResponse<KonflikWithRelations>> => {
    return apiClient.get("/konflik", { params });
  },

  getById: async (id: string): Promise<ApiResponse<KonflikWithRelations>> => {
    return apiClient.get(`/konflik/${id}`);
  },

  create: async (data: CreateKonflikDto): Promise<ApiResponse<PemeriksaanKonflikEntity>> => {
    return apiClient.post("/konflik", data);
  },

  update: async (id: string, data: UpdateKonflikDto): Promise<ApiResponse<PemeriksaanKonflikEntity>> => {
    return apiClient.patch(`/konflik/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/konflik/${id}`);
  },
};