// ============================================================================
// FILE: lib/hooks/use-catatan.ts - NEW HOOK FOR CATATAN PERKARA
// ============================================================================
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { catatanApi } from "@/lib/api/catatan.api";
import { 
  CatatanWithRelations,
  CreateCatatanDto,
  UpdateCatatanDto,
  QueryCatatanDto
} from "@/types";
import { handleApiError, getErrorMessage } from "@/lib/utils/error-handler";

export function useCatatan() {
  // State
  const [catatan, setCatatan] = useState<CatatanWithRelations[]>([]);
  const [selectedCatatan, setSelectedCatatan] = useState<CatatanWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all catatan
   */
  const fetchCatatan = useCallback(async (params?: QueryCatatanDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await catatanApi.getAll(params);
      setCatatan(response.data);
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat catatan");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch catatan by ID
   */
  const fetchCatatanById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await catatanApi.getById(id);
      setSelectedCatatan(response.data);
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat detail catatan");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create new catatan
   */
  const createCatatan = useCallback(async (data: CreateCatatanDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await catatanApi.create(data);
      toast.success("Catatan berhasil ditambahkan");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal menambahkan catatan");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update catatan
   */
  const updateCatatan = useCallback(async (id: string, data: UpdateCatatanDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await catatanApi.update(id, data);
      toast.success("Catatan berhasil diperbarui");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memperbarui catatan");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete catatan
   */
  const deleteCatatan = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await catatanApi.delete(id);
      toast.success("Catatan berhasil dihapus");
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal menghapus catatan");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Calculate total billable hours
   */
  const getTotalBillableHours = useCallback((catatanList: CatatanWithRelations[]): number => {
    return catatanList
      .filter(c => c.dapat_ditagih && c.jam_kerja)
      .reduce((total, c) => total + (c.jam_kerja || 0), 0);
  }, []);

  /**
   * Calculate total non-billable hours
   */
  const getTotalNonBillableHours = useCallback((catatanList: CatatanWithRelations[]): number => {
    return catatanList
      .filter(c => !c.dapat_ditagih && c.jam_kerja)
      .reduce((total, c) => total + (c.jam_kerja || 0), 0);
  }, []);

  /**
   * Get catatan by perkara ID
   */
  const getCatatanByPerkaraId = useCallback((perkaraId: string) => {
    return catatan.filter(c => c.perkara_id === perkaraId);
  }, [catatan]);

  /**
   * Get catatan by user ID
   */
  const getCatatanByUserId = useCallback((userId: string) => {
    return catatan.filter(c => c.user_id === userId);
  }, [catatan]);

  return {
    // State
    catatan,
    selectedCatatan,
    isLoading,
    error,
    
    // Actions
    fetchCatatan,
    fetchCatatanById,
    createCatatan,
    updateCatatan,
    deleteCatatan,
    
    // Utilities
    setSelectedCatatan,
    getTotalBillableHours,
    getTotalNonBillableHours,
    getCatatanByPerkaraId,
    getCatatanByUserId,
  };
}