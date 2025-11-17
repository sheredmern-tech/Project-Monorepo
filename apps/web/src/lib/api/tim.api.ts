// ============================================================================
// FILE: lib/api/tim.api.ts - Clean Version
// ============================================================================

import apiClient from "./client";
import {
  UserEntity,
  UserWithStats,
  TimPerkaraEntity,
  TimPerkaraWithRelations,
  CreateTimPerkaraDto,
  UpdateTimPerkaraDto,
  QueryTimPerkaraDto,
  QueryUsersDto,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

export interface CreateUserDto {
  email: string;
  password: string;
  nama_lengkap: string;
  role: string;
  jabatan?: string | null;
  nomor_kta?: string | null;
  nomor_berita_acara?: string | null;
  spesialisasi?: string | null;
  telepon?: string | null;
  alamat?: string | null;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type UserActivityResponse = PaginatedResponse<UserActivity>;

export interface BulkImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    email: string;
    reason: string;
  }>;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{
    user_id?: string;
    email: string;
    reason: string;
  }>;
}

export interface ExportUsersFilters {
  user_ids?: string[];
  role?: string;
  status?: string;
  [key: string]: unknown;
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

export const timApi = {
  // User Endpoints
  getAllUsers: async (params?: QueryUsersDto): Promise<PaginatedResponse<UserEntity>> => {
    return apiClient.get("/users", { params });
  },

  getUserById: async (id: string): Promise<UserWithStats> => {
    const response = await apiClient.get(`/users/${id}`);
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as { data: UserWithStats };
      return wrappedResponse.data;
    }
    
    if (response && typeof response === 'object' && 'id' in response) {
      return response as unknown as UserWithStats;
    }
    
    throw new Error("Data user tidak ditemukan");
  },

  createUser: async (data: CreateUserDto): Promise<UserEntity> => {
    const response = await apiClient.post<UserEntity>("/users", data);
    
    if (typeof response === 'object' && response !== null && 'id' in response) {
      return response as unknown as UserEntity;
    }
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as { data: UserEntity };
      return wrappedResponse.data;
    }
    
    throw new Error("Invalid response format");
  },

  updateUser: async (id: string, data: Partial<UserEntity>): Promise<ApiResponse<UserEntity>> => {
    return apiClient.patch(`/users/${id}`, data);
  },

  deleteUser: async (id: string): Promise<void> => {
    return apiClient.delete(`/users/${id}`);
  },

  changeUserRole: async (id: string, role: string): Promise<ApiResponse<UserEntity>> => {
    return apiClient.patch(`/users/${id}/role`, { role });
  },

  uploadAvatar: async (id: string, file: File): Promise<ApiResponse<{ avatar_url: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post(`/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteAvatar: async (id: string): Promise<void> => {
    return apiClient.delete(`/users/${id}/avatar`);
  },

  sendInvitationEmail: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/users/${id}/send-invitation`);
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as { 
        data: { success: boolean; message: string } 
      };
      return wrappedResponse.data;
    }
    
    if (response && typeof response === 'object' && 'success' in response) {
      return response as { success: boolean; message: string };
    }
    
    throw new Error("Invalid response format");
  },

  resendInvitationEmail: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/users/${id}/resend-invitation`);
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as { 
        data: { success: boolean; message: string } 
      };
      return wrappedResponse.data;
    }
    
    if (response && typeof response === 'object' && 'success' in response) {
      return response as { success: boolean; message: string };
    }
    
    throw new Error("Invalid response format");
  },

  getUserActivity: async (
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<UserActivityResponse> => {
    return apiClient.get(`/users/${id}/activity`, { params });
  },

  toggleUserStatus: async (id: string, active: boolean): Promise<ApiResponse<UserEntity>> => {
    return apiClient.patch(`/users/${id}/status`, { active });
  },

  resetUserPassword: async (id: string): Promise<{ temporary_password: string }> => {
    const response = await apiClient.post<{ temporary_password: string }>(
      `/users/${id}/reset-password`
    );
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as { 
        data: { temporary_password: string } 
      };
      return wrappedResponse.data;
    }
    
    if (response && typeof response === 'object' && 'temporary_password' in response) {
      return response as { temporary_password: string };
    }
    
    throw new Error("Invalid response format");
  },

  // Bulk Operations
  bulkImportUsers: async (file: File): Promise<BulkImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/users/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as { data: BulkImportResult };
      return wrappedResponse.data;
    }
    
    if (response && typeof response === 'object' && 'success' in response) {
      return response as BulkImportResult;
    }
    
    throw new Error("Invalid response format");
  },

  downloadImportTemplate: async (): Promise<Blob> => {
    const response = await apiClient.get('/users/import-template', {
      responseType: 'blob',
    });

    if (response instanceof Blob) {
      return response;
    }

    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as { data: Blob };
      return wrappedResponse.data;
    }

    throw new Error("Invalid blob response");
  },

  downloadExcelTemplate: async (): Promise<Blob> => {
    const response = await apiClient.get('/users/import-template-excel', {
      responseType: 'blob',
    });

    if (response instanceof Blob) {
      return response;
    }

    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as { data: Blob };
      return wrappedResponse.data;
    }

    throw new Error("Invalid blob response");
  },

  bulkDeleteUsers: async (userIds: string[]): Promise<BulkOperationResult> => {
    const response = await apiClient.post('/users/bulk-delete', { user_ids: userIds });
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as { data: BulkOperationResult };
      return wrappedResponse.data;
    }
    
    if (response && typeof response === 'object' && 'success' in response) {
      return response as BulkOperationResult;
    }
    
    throw new Error("Invalid response format");
  },

  bulkChangeRole: async (userIds: string[], role: string): Promise<BulkOperationResult> => {
    const response = await apiClient.post('/users/bulk-change-role', { 
      user_ids: userIds, 
      role 
    });
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as { data: BulkOperationResult };
      return wrappedResponse.data;
    }
    
    if (response && typeof response === 'object' && 'success' in response) {
      return response as BulkOperationResult;
    }
    
    throw new Error("Invalid response format");
  },

  exportUsers: async (params?: {
    format?: 'csv' | 'excel';
    filters?: ExportUsersFilters;
    columns?: string[];
  }): Promise<Blob> => {
    const response = await apiClient.post('/users/export', params, {
      responseType: 'blob',
    });
    
    if (response instanceof Blob) {
      return response;
    }
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as { data: Blob };
      return wrappedResponse.data;
    }
    
    throw new Error("Invalid blob response");
  },

  // Tim Perkara Endpoints
  getAll: async (params?: QueryTimPerkaraDto): Promise<PaginatedResponse<TimPerkaraWithRelations>> => {
    return apiClient.get("/tim-perkara", { params });
  },

  getById: async (id: string): Promise<ApiResponse<TimPerkaraWithRelations>> => {
    return apiClient.get(`/tim-perkara/${id}`);
  },

  getByPerkaraId: async (perkaraId: string): Promise<PaginatedResponse<TimPerkaraWithRelations>> => {
    return apiClient.get("/tim-perkara", { params: { perkara_id: perkaraId } });
  },

  getByUserId: async (userId: string): Promise<PaginatedResponse<TimPerkaraWithRelations>> => {
    return apiClient.get("/tim-perkara", { params: { user_id: userId } });
  },

  addToTim: async (data: CreateTimPerkaraDto): Promise<ApiResponse<TimPerkaraEntity>> => {
    return apiClient.post("/tim-perkara", data);
  },

  update: async (id: string, data: UpdateTimPerkaraDto): Promise<ApiResponse<TimPerkaraEntity>> => {
    return apiClient.patch(`/tim-perkara/${id}`, data);
  },

  removeFromTim: async (id: string): Promise<void> => {
    await apiClient.delete(`/tim-perkara/${id}`);
  },

  // Statistics & Reports
  getTeamStatistics: async (): Promise<TeamStatistics> => {
    const response = await apiClient.get('/users/statistics');
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as { data: TeamStatistics };
      return wrappedResponse.data;
    }
    
    if (response && typeof response === 'object' && 'total_users' in response) {
      return response as TeamStatistics;
    }
    
    throw new Error("Invalid response format from API");
  },

  getWorkloadDistribution: async (): Promise<WorkloadDistribution[]> => {
    const response = await apiClient.get('/users/workload-distribution');
    
    if (response && typeof response === 'object' && 'data' in response) {
      const wrappedResponse = response as unknown as { data: WorkloadDistribution[] };
      return wrappedResponse.data;
    }
    
    if (Array.isArray(response)) {
      return response as WorkloadDistribution[];
    }
    
    throw new Error("Invalid response format from API");
  },
};