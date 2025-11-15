// ============================================================================
// FILE: lib/hooks/use-sidang.ts - REFACTORED WITH ERROR HANDLER
// ============================================================================
"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { sidangApi } from "@/lib/api/sidang.api";
import { 
  CreateJadwalSidangDto, 
  UpdateJadwalSidangDto, 
  JadwalSidangWithRelations, 
  QuerySidangDto 
} from "@/types";
import { handleApiError, getErrorMessage } from "@/lib/utils/error-handler";

export function useSidang() {
  const [sidang, setSidang] = useState<JadwalSidangWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch All Sidang
  const fetchSidang = useCallback(async (params?: QuerySidangDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await sidangApi.getAll(params);
      setSidang(response.data);
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat data sidang");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Sidang by ID
  const fetchSidangById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // Direct response, no .data wrapper
      const sidangData = await sidangApi.getById(id);
      return sidangData;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat detail sidang");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create Sidang
  const createSidang = useCallback(async (data: CreateJadwalSidangDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await sidangApi.create(data);
      toast.success("Jadwal sidang berhasil ditambahkan");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal menambahkan jadwal sidang");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update Sidang
  const updateSidang = useCallback(async (id: string, data: UpdateJadwalSidangDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await sidangApi.update(id, data);
      toast.success("Jadwal sidang berhasil diperbarui");
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memperbarui jadwal sidang");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete Sidang
  const deleteSidang = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await sidangApi.delete(id);
      toast.success("Jadwal sidang berhasil dihapus");
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal menghapus jadwal sidang");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sidang,
    isLoading,
    error,
    fetchSidang,
    fetchSidangById,
    createSidang,
    updateSidang,
    deleteSidang,
  };
}