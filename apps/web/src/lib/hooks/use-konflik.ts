// ============================================================================
// 5. lib/hooks/use-konflik.ts - REFACTORED
// ============================================================================
"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { konflikApi } from "@/lib/api/konflik.api";
import { useKonflikStore } from "@/lib/stores/konflik.store";
import { CreateKonflikDto, UpdateKonflikDto } from "@/types";
import { handleApiError, getErrorMessage } from "@/lib/utils/error-handler";

export function useKonflik() {
  const {
    konflik,
    selectedKonflik,
    isLoading,
    error,
    page,
    limit,
    total,
    search,
    adaKonflik,
    perkaraId,
    setKonflik,
    setSelectedKonflik,
    setLoading,
    setError,
    setTotal,
    setPage,
    setSearch,
    setAdaKonflik,
    setPerkaraId,
    reset,
  } = useKonflikStore();

  // Fetch All Konflik
  const fetchKonflik = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await konflikApi.getAll({
        page,
        limit,
        search: search || undefined,
        ada_konflik: typeof adaKonflik === 'boolean' ? adaKonflik : undefined,
        perkara_id: perkaraId || undefined,
      });
      setKonflik(response.data);
      setTotal(response.meta.total);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat data konflik");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, adaKonflik, perkaraId, setKonflik, setLoading, setError, setTotal]);

  // Fetch Konflik by ID
  const fetchKonflikById = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await konflikApi.getById(id);
        return response.data;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        handleApiError(err, "Gagal memuat detail konflik");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Create Konflik
  const createKonflik = useCallback(
    async (data: CreateKonflikDto) => {
      try {
        setLoading(true);
        setError(null);

        const response = await konflikApi.create(data);

        toast.success("Pemeriksaan konflik berhasil disimpan");
        // ✅ FIXED: Don't fetch konflik after create - page will navigate away
        // await fetchKonflik();
        return response.data;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        handleApiError(err, "Gagal menyimpan pemeriksaan konflik");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Update Konflik
  const updateKonflik = useCallback(
    async (id: string, data: UpdateKonflikDto) => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await konflikApi.update(id, data);
        
        toast.success("Pemeriksaan konflik berhasil diperbarui");
        await fetchKonflik();
        return response.data;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        handleApiError(err, "Gagal memperbarui pemeriksaan konflik");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchKonflik, setLoading, setError]
  );

  // Delete Konflik
  const deleteKonflik = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        await konflikApi.delete(id);
        toast.success("Pemeriksaan konflik berhasil dihapus");
        await fetchKonflik();
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        handleApiError(err, "Gagal menghapus pemeriksaan konflik");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchKonflik, setLoading, setError]
  );

  return {
    konflik,
    selectedKonflik,
    isLoading,
    error,
    page,
    limit,
    total,
    search,
    adaKonflik,
    perkaraId,
    setPage,
    setSearch,
    setAdaKonflik,
    setPerkaraId,
    setSelectedKonflik,
    fetchKonflik,
    fetchKonflikById,
    createKonflik,
    updateKonflik,
    deleteKonflik,
    reset,
  };
}