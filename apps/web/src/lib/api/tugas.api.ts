// ============================================================================
// FILE: lib/api/tugas.api.ts - Clean Version
// ============================================================================

import apiClient from "./client";
import {
  TugasEntity,
  TugasWithRelations,
  CreateTugasDto,
  UpdateTugasDto,
  QueryTugasDto,
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

export const tugasApi = {
  getAll: async (params?: QueryTugasDto): Promise<PaginatedResponse<TugasWithRelations>> => {
    const response = await apiClient.get("/tugas", { params });
    
    if (response && typeof response === 'object' && 'data' in response && 'meta' in response) {
      const wrappedResponse = response as unknown as { 
        data: TugasWithRelations[]; 
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
      const wrappedResponse = response as unknown as { data: TugasWithRelations[] };
      
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
      const arrayResponse = response as unknown as TugasWithRelations[];
      
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

  getById: async (id: string): Promise<TugasWithRelations> => {
    const response = await apiClient.get<TugasWithRelations>(`/tugas/${id}`);
    
    if (typeof response === 'object' && response !== null && 'id' in response) {
      return response as unknown as TugasWithRelations;
    }
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as ApiSuccessResponse<TugasWithRelations>;
      return wrappedResponse.data;
    }
    
    throw new Error("Data tugas tidak ditemukan");
  },

  getMyTugas: async (params?: QueryTugasDto): Promise<PaginatedResponse<TugasWithRelations>> => {
    const response = await apiClient.get("/tugas/my-tasks", { params });
    
    if (response && typeof response === 'object' && 'data' in response && 'meta' in response) {
      const wrappedResponse = response as unknown as { 
        data: TugasWithRelations[]; 
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
      const wrappedResponse = response as unknown as { data: TugasWithRelations[] };
      
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
      const arrayResponse = response as unknown as TugasWithRelations[];
      
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

  create: async (data: CreateTugasDto): Promise<TugasEntity> => {
    const response = await apiClient.post<TugasEntity>("/tugas", data);
    
    if (typeof response === 'object' && response !== null && 'id' in response) {
      return response as unknown as TugasEntity;
    }
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as ApiSuccessResponse<TugasEntity>;
      return wrappedResponse.data;
    }
    
    throw new Error("Invalid response format");
  },

  update: async (id: string, data: UpdateTugasDto): Promise<TugasEntity> => {
    const response = await apiClient.patch<TugasEntity>(`/tugas/${id}`, data);
    
    if (typeof response === 'object' && response !== null && 'id' in response) {
      return response as unknown as TugasEntity;
    }
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as ApiSuccessResponse<TugasEntity>;
      return wrappedResponse.data;
    }
    
    throw new Error("Invalid response format");
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tugas/${id}`);
  },
};