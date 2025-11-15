// ============================================================================
// FILE: lib/api/log.api.ts - Clean Version
// ============================================================================

import apiClient from "./client";
import {
  LogAktivitasWithUser,
  QueryLogAktivitasDto,
  PaginatedResponse,
} from "@/types";

export const logApi = {
  getAll: async (params?: QueryLogAktivitasDto): Promise<PaginatedResponse<LogAktivitasWithUser>> => {
    return apiClient.get("/logs", { params });
  },

  getMyActivity: async (params?: QueryLogAktivitasDto): Promise<PaginatedResponse<LogAktivitasWithUser>> => {
    return apiClient.get("/logs/my-activities", { params });
  },
};