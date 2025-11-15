// ============================================================================
// FILE: lib/api/perkara.api.ts - Clean Version
// ============================================================================

import apiClient from "./client";
import {
  PerkaraEntity,
  PerkaraWithKlien,
  PerkaraWithRelations,
  PerkaraStatistics,
  CreatePerkaraDto,
  UpdatePerkaraDto,
  QueryPerkaraDto,
  PaginatedResponse,
} from "@/types";

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp?: string;
}

export const perkaraApi = {
  getAll: async (params?: QueryPerkaraDto): Promise<PaginatedResponse<PerkaraWithKlien>> => {
    const response = await apiClient.get("/perkara", { params });
    
    if (response && typeof response === 'object' && 'data' in response && 'meta' in response) {
      const wrappedResponse = response as unknown as { 
        data: PerkaraWithKlien[]; 
        meta: { page: number; limit: number; total: number; totalPages: number }; 
      };
      
      return {
        success: true,
        data: wrappedResponse.data,
        meta: {
          page: wrappedResponse.meta.page,
          limit: wrappedResponse.meta.limit,
          total: wrappedResponse.meta.total,
          totalPages: wrappedResponse.meta.totalPages,
          hasNextPage: wrappedResponse.meta.page < wrappedResponse.meta.totalPages,
          hasPrevPage: wrappedResponse.meta.page > 1,
        },
        timestamp: new Date().toISOString()
      };
    }
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as { data: PerkaraWithKlien[] };
      
      return {
        success: true,
        data: wrappedResponse.data,
        meta: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: wrappedResponse.data.length,
          totalPages: Math.ceil(wrappedResponse.data.length / (params?.limit || 10)),
          hasNextPage: false,
          hasPrevPage: false,
        },
        timestamp: new Date().toISOString()
      };
    }
    
    if (Array.isArray(response)) {
      const arrayResponse = response as unknown as PerkaraWithKlien[];
      
      return {
        success: true,
        data: arrayResponse,
        meta: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: arrayResponse.length,
          totalPages: Math.ceil(arrayResponse.length / (params?.limit || 10)),
          hasNextPage: false,
          hasPrevPage: false,
        },
        timestamp: new Date().toISOString()
      };
    }
    
    throw new Error("Invalid response format from API");
  },

  getById: async (id: string): Promise<PerkaraWithRelations> => {
    const response = await apiClient.get<PerkaraWithRelations>(`/perkara/${id}`);
    
    if (typeof response === 'object' && response !== null && 'id' in response) {
      return response as unknown as PerkaraWithRelations;
    }
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as ApiSuccessResponse<PerkaraWithRelations>;
      return wrappedResponse.data;
    }
    
    throw new Error("Data perkara tidak ditemukan");
  },

  getStatistics: async (id: string): Promise<PerkaraStatistics> => {
    const response = await apiClient.get<PerkaraStatistics>(`/perkara/${id}/statistics`);
    
    if (typeof response === 'object' && response !== null && 'statistik' in response) {
      return response as unknown as PerkaraStatistics;
    }
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as ApiSuccessResponse<PerkaraStatistics>;
      return wrappedResponse.data;
    }
    
    throw new Error("Statistik tidak ditemukan");
  },

  create: async (data: CreatePerkaraDto): Promise<PerkaraEntity> => {
    const response = await apiClient.post<PerkaraEntity>("/perkara", data);
    
    if (typeof response === 'object' && response !== null && 'id' in response) {
      return response as unknown as PerkaraEntity;
    }
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as ApiSuccessResponse<PerkaraEntity>;
      return wrappedResponse.data;
    }
    
    throw new Error("Invalid response format");
  },

  update: async (id: string, data: UpdatePerkaraDto): Promise<PerkaraEntity> => {
    const response = await apiClient.patch<PerkaraEntity>(`/perkara/${id}`, data);
    
    if (typeof response === 'object' && response !== null && 'id' in response) {
      return response as unknown as PerkaraEntity;
    }
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as ApiSuccessResponse<PerkaraEntity>;
      return wrappedResponse.data;
    }
    
    throw new Error("Invalid response format");
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/perkara/${id}`);
  },
};