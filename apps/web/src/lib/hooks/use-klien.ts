// ============================================================================
// 1. lib/hooks/use-klien.ts - REFACTORED
// ============================================================================
"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { klienApi } from "@/lib/api/klien.api";
import { useKlienStore } from "@/lib/stores/klien.store";
import { CreateKlienDto, UpdateKlienDto } from "@/types";
import { handleApiError, getErrorMessage } from "@/lib/utils/error-handler";

export function useKlien() {
  const {
    klien,
    selectedKlien,
    isLoading,
    error,
    page,
    limit,
    total,
    search,
    jenisKlien,
    kota,
    setKlien,
    setSelectedKlien,
    setLoading,
    setError,
    setTotal,
    setPage,
    setSearch,
    setJenisKlien,
    setKota,
    reset,
  } = useKlienStore();

  // Fetch My Profile (for KLIEN role)
  const fetchMyProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profile = await klienApi.getMyProfile();
      setSelectedKlien(profile);
      
      return profile;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat profile");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setSelectedKlien, setLoading, setError]);

  // Update My Profile (for KLIEN role)
  const updateMyProfile = useCallback(async (data: UpdateKlienDto) => {
    try {
      setLoading(true);
      setError(null);

      const updated = await klienApi.updateMyProfile(data);

      // ✅ REMOVED: Toast handled by component
      await fetchMyProfile();

      return updated;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memperbarui profile");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyProfile, setLoading, setError]);

  // Fetch All Klien
  const fetchKlien = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await klienApi.getAll({
        page,
        limit,
        search: search || undefined,
        jenis_klien: jenisKlien === "all" || !jenisKlien ? undefined : jenisKlien,
        kota: kota || undefined,
      });
      
      setKlien(response.data);
      setTotal(response.meta.total);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat data klien");
      setKlien([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, jenisKlien, kota, setKlien, setLoading, setError, setTotal]);

  // Fetch Klien by ID
  const fetchKlienById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await klienApi.getById(id);
      return data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat detail klien");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Create Klien
  const createKlien = useCallback(async (data: CreateKlienDto) => {
    try {
      setLoading(true);
      setError(null);
      const response = await klienApi.create(data);
      // ✅ REMOVED: Toast handled by component (form)
      await fetchKlien();
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal menambahkan klien");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchKlien, setLoading, setError]);

  // Update Klien
  const updateKlien = useCallback(async (id: string, data: UpdateKlienDto) => {
    try {
      setLoading(true);
      setError(null);
      const response = await klienApi.update(id, data);
      // ✅ REMOVED: Toast handled by component (form)
      await fetchKlien();
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memperbarui klien");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchKlien, setLoading, setError]);

  // Delete Klien
  const deleteKlien = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await klienApi.delete(id);
      // ✅ REMOVED: Toast handled by component (table)
      await fetchKlien();
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal menghapus klien");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchKlien, setLoading, setError]);

  return {
    klien,
    selectedKlien,
    isLoading,
    error,
    page,
    limit,
    total,
    search,
    jenisKlien,
    kota,
    setPage,
    setSearch,
    setJenisKlien,
    setKota,
    setSelectedKlien,
    reset,
    fetchMyProfile,
    updateMyProfile,
    fetchKlien,
    fetchKlienById,
    createKlien,
    updateKlien,
    deleteKlien,
  };
}