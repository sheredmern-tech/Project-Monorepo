// ============================================================================
// FILE: lib/api/sidang.api.ts - Clean Version
// ============================================================================

import apiClient from "./client";
import {
  JadwalSidangEntity,
  JadwalSidangWithRelations,
  CreateJadwalSidangDto,
  UpdateJadwalSidangDto,
  QuerySidangDto,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

export const sidangApi = {
  getAll: async (params?: QuerySidangDto): Promise<PaginatedResponse<JadwalSidangWithRelations>> => {
    return apiClient.get("/sidang", { params });
  },

  getById: async (id: string): Promise<JadwalSidangWithRelations> => {
    return apiClient.get(`/sidang/${id}`);
  },

  create: async (data: CreateJadwalSidangDto): Promise<ApiResponse<JadwalSidangEntity>> => {
    return apiClient.post("/sidang", data);
  },

  update: async (id: string, data: UpdateJadwalSidangDto): Promise<ApiResponse<JadwalSidangEntity>> => {
    return apiClient.patch(`/sidang/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/sidang/${id}`);
  },
};