// ============================================================================
// FILE: lib/api/catatan.api.ts - Clean Version
// ============================================================================

import apiClient from "./client";
import {
  CatatanPerkaraEntity,
  CatatanWithRelations,
  CreateCatatanDto,
  UpdateCatatanDto,
  QueryCatatanDto,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

export const catatanApi = {
  getAll: async (params?: QueryCatatanDto): Promise<PaginatedResponse<CatatanWithRelations>> => {
    return apiClient.get("/catatan", { params });
  },

  getById: async (id: string): Promise<ApiResponse<CatatanWithRelations>> => {
    return apiClient.get(`/catatan/${id}`);
  },

  create: async (data: CreateCatatanDto): Promise<ApiResponse<CatatanPerkaraEntity>> => {
    return apiClient.post("/catatan", data);
  },

  update: async (id: string, data: UpdateCatatanDto): Promise<ApiResponse<CatatanPerkaraEntity>> => {
    return apiClient.patch(`/catatan/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/catatan/${id}`);
  },
};