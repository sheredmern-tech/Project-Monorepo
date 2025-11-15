// ============================================================================
// FILE: lib/hooks/use-tim.ts - NEW HOOK FOR TIM PERKARA & USER MANAGEMENT
// ============================================================================
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { timApi, CreateUserDto } from "@/lib/api/tim.api";
import { 
  UserEntity, 
  UserWithStats,
  TimPerkaraWithRelations,
  CreateTimPerkaraDto,
  UpdateTimPerkaraDto,
  QueryTimPerkaraDto,
  QueryUsersDto,
} from "@/types";
import { handleApiError, getErrorMessage } from "@/lib/utils/error-handler";

export function useTim() {
  // State
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [timPerkara, setTimPerkara] = useState<TimPerkaraWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  /**
   * Fetch all users
   */
  const fetchUsers = useCallback(async (params?: QueryUsersDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await timApi.getAllUsers(params);
      setUsers(response.data);
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat data user");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch user by ID
   */
  const fetchUserById = useCallback(async (id: string): Promise<UserWithStats> => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await timApi.getUserById(id);
      return user;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat detail user");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create new user
   */
  const createUser = useCallback(async (data: CreateUserDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await timApi.createUser(data);
      toast.success("User berhasil ditambahkan");
      return user;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal menambahkan user");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user
   */
  const updateUser = useCallback(async (id: string, data: Partial<UserEntity>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await timApi.updateUser(id, data);
      toast.success("User berhasil diperbarui");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memperbarui user");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete user
   */
  const deleteUser = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await timApi.deleteUser(id);
      toast.success("User berhasil dihapus");
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal menghapus user");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Change user role
   */
  const changeUserRole = useCallback(async (id: string, role: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await timApi.changeUserRole(id, role);
      toast.success("Role user berhasil diubah");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal mengubah role user");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Toggle user active status
   */
  const toggleUserStatus = useCallback(async (id: string, active: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await timApi.toggleUserStatus(id, active);
      toast.success(`User berhasil ${active ? 'diaktifkan' : 'dinonaktifkan'}`);
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal mengubah status user");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset user password
   */
  const resetUserPassword = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await timApi.resetUserPassword(id);
      toast.success("Password berhasil direset");
      return result.temporary_password;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal mereset password");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Send invitation email
   */
  const sendInvitation = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await timApi.sendInvitationEmail(id);
      toast.success("Email undangan berhasil dikirim");
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal mengirim email undangan");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // TIM PERKARA MANAGEMENT
  // ============================================================================

  /**
   * Fetch all tim perkara
   */
  const fetchTimPerkara = useCallback(async (params?: QueryTimPerkaraDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await timApi.getAll(params);
      setTimPerkara(response.data);
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat data tim perkara");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch tim by perkara ID
   */
  const fetchTimByPerkaraId = useCallback(async (perkaraId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await timApi.getByPerkaraId(perkaraId);
      setTimPerkara(response.data);
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat tim perkara");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add user to tim perkara
   */
  const addToTim = useCallback(async (data: CreateTimPerkaraDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await timApi.addToTim(data);
      toast.success("Anggota tim berhasil ditambahkan");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal menambahkan anggota tim");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update tim perkara member
   */
  const updateTimMember = useCallback(async (id: string, data: UpdateTimPerkaraDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await timApi.update(id, data);
      toast.success("Data anggota tim berhasil diperbarui");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memperbarui data anggota tim");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Remove user from tim perkara
   */
  const removeFromTim = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await timApi.removeFromTim(id);
      toast.success("Anggota tim berhasil dihapus");
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal menghapus anggota tim");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // STATISTICS & REPORTS
  // ============================================================================

  /**
   * Get team statistics
   */
  const getTeamStatistics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stats = await timApi.getTeamStatistics();
      return stats;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat statistik tim");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get workload distribution
   */
  const getWorkloadDistribution = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const distribution = await timApi.getWorkloadDistribution();
      return distribution;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat distribusi beban kerja");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk import users
   */
  const bulkImportUsers = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await timApi.bulkImportUsers(file);
      toast.success(`Berhasil import ${result.success} user`);
      if (result.failed > 0) {
        toast.warning(`${result.failed} user gagal diimport`);
      }
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal import user");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Bulk delete users
   */
  const bulkDeleteUsers = useCallback(async (userIds: string[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await timApi.bulkDeleteUsers(userIds);
      toast.success(`Berhasil hapus ${result.success} user`);
      if (result.failed > 0) {
        toast.warning(`${result.failed} user gagal dihapus`);
      }
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal hapus user");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Export users
   */
  const exportUsers = useCallback(async (params?: {
    format?: 'csv' | 'excel';
    filters?: Record<string, unknown>;
    columns?: string[];
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const blob = await timApi.exportUsers(params);
      
      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users-export-${new Date().toISOString()}.${params?.format || 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Export berhasil");
    } catch (err) {
      handleApiError(err, "Gagal export user");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    users,
    timPerkara,
    isLoading,
    error,
    
    // User Management
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    changeUserRole,
    toggleUserStatus,
    resetUserPassword,
    sendInvitation,
    
    // Tim Perkara
    fetchTimPerkara,
    fetchTimByPerkaraId,
    addToTim,
    updateTimMember,
    removeFromTim,
    
    // Statistics
    getTeamStatistics,
    getWorkloadDistribution,
    
    // Bulk Operations
    bulkImportUsers,
    bulkDeleteUsers,
    exportUsers,
  };
}