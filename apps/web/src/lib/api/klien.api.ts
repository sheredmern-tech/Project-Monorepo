// ============================================================================
// FILE: lib/api/klien.api.ts - Clean Version
// ============================================================================

import apiClient from "./client";
import { 
  KlienEntity, 
  KlienWithCount, 
  KlienWithPerkara,
  CreateKlienDto, 
  UpdateKlienDto, 
  QueryKlienDto,
  PaginatedResponse 
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

function isWrappedResponse<T>(response: unknown): response is ApiSuccessResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    (Array.isArray((response as { data: unknown }).data) || typeof (response as { data: unknown }).data === 'object')
  );
}

function isKlienObject(response: unknown): response is KlienWithPerkara {
  return (
    typeof response === 'object' &&
    response !== null &&
    'id' in response &&
    'nama' in response
  );
}

export const klienApi = {
  getAll: async (params?: QueryKlienDto): Promise<PaginatedResponse<KlienWithCount>> => {
    const response = await apiClient.get<ApiSuccessResponse<KlienWithCount[]>>("/klien", { params });
    
    if (response && typeof response === 'object' && 'data' in response && 'meta' in response) {
      const wrappedResponse = response as unknown as { 
        data: KlienWithCount[]; 
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
      const wrappedResponse = response as unknown as { data: KlienWithCount[] };
      
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
      const arrayResponse = response as unknown as KlienWithCount[];
      
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

  getById: async (id: string): Promise<KlienWithPerkara> => {
    const response = await apiClient.get<KlienWithPerkara>(`/klien/${id}`);
    
    if (isKlienObject(response)) {
      return response;
    }
    
    if (isWrappedResponse<KlienWithPerkara>(response)) {
      return response.data;
    }
    
    throw new Error("Data klien tidak ditemukan");
  },

  create: async (data: CreateKlienDto): Promise<KlienEntity> => {
    const response = await apiClient.post<KlienEntity>("/klien", data);
    
    if (typeof response === 'object' && response !== null && 'id' in response) {
      return response as unknown as KlienEntity;
    }
    
    if (isWrappedResponse<KlienEntity>(response)) {
      return response.data;
    }
    
    throw new Error("Invalid response format");
  },

  update: async (id: string, data: UpdateKlienDto): Promise<KlienEntity> => {
    const response = await apiClient.patch<KlienEntity>(`/klien/${id}`, data);
    
    if (typeof response === 'object' && response !== null && 'id' in response) {
      return response as unknown as KlienEntity;
    }
    
    if (isWrappedResponse<KlienEntity>(response)) {
      return response.data;
    }
    
    throw new Error("Invalid response format");
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/klien/${id}`);
  },

  getMyProfile: async (): Promise<KlienWithPerkara> => {
    const response = await apiClient.get<KlienWithPerkara>("/klien/profile");
    
    if (isKlienObject(response)) {
      return response;
    }
    
    if (isWrappedResponse<KlienWithPerkara>(response)) {
      return response.data;
    }
    
    throw new Error("Data profile tidak ditemukan");
  },

  updateMyProfile: async (data: UpdateKlienDto): Promise<KlienEntity> => {
    const response = await apiClient.patch<KlienEntity>("/klien/profile", data);
    
    if (typeof response === 'object' && response !== null && 'id' in response) {
      return response as unknown as KlienEntity;
    }
    
    if (isWrappedResponse<KlienEntity>(response)) {
      return response.data;
    }
    
    throw new Error("Invalid response format");
  },
};