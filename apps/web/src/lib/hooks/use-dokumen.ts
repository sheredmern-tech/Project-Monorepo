// ============================================================================
// 4. lib/hooks/use-dokumen.ts - REFACTORED
// ============================================================================
"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { dokumenApi } from "@/lib/api/dokumen.api";
import { useDokumenStore } from "@/lib/stores/dokumen.store";
import { UpdateDokumenDto, KategoriDokumen } from "@/types";
import { handleApiError, getErrorMessage } from "@/lib/utils/error-handler";

export function useDokumen() {
  const {
    dokumen,
    selectedDokumen,
    isLoading,
    isUploading,
    error,
    page,
    limit,
    total,
    search,
    kategori,
    perkaraId,
    setDokumen,
    setSelectedDokumen,
    setLoading,
    setUploading,
    setError,
    setTotal,
    setPage,
    setSearch,
    setKategori,
    setPerkaraId,
    reset,
  } = useDokumenStore();

  // Fetch All Dokumen
  const fetchDokumen = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dokumenApi.getAll({
        page,
        limit,
        search: search || undefined,
        kategori: (kategori as KategoriDokumen) || undefined,
        perkara_id: perkaraId || undefined,
      });
      setDokumen(response.data);
      setTotal(response.meta.total);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat data dokumen");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, kategori, perkaraId, setDokumen, setLoading, setError, setTotal]);

  // Fetch Dokumen by ID
  const fetchDokumenById = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await dokumenApi.getById(id);
        return response.data;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        handleApiError(err, "Gagal memuat detail dokumen");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Upload Dokumen
  const uploadDokumen = useCallback(
    async (formData: FormData) => {
      try {
        setUploading(true);
        setError(null);
        const response = await dokumenApi.upload(formData);
        toast.success("Dokumen berhasil diunggah");
        await fetchDokumen();
        return response.data;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        handleApiError(err, "Gagal mengunggah dokumen");
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [fetchDokumen, setUploading, setError]
  );

  // Update Dokumen
  const updateDokumen = useCallback(
    async (id: string, data: UpdateDokumenDto) => {
      try {
        setLoading(true);
        setError(null);
        const response = await dokumenApi.update(id, data);
        toast.success("Dokumen berhasil diperbarui");
        await fetchDokumen();
        return response.data;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        handleApiError(err, "Gagal memperbarui dokumen");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchDokumen, setLoading, setError]
  );

  // Delete Dokumen
  const deleteDokumen = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        await dokumenApi.delete(id);
        toast.success("Dokumen berhasil dihapus");
        await fetchDokumen();
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        handleApiError(err, "Gagal menghapus dokumen");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchDokumen, setLoading, setError]
  );

  // Download Dokumen
  const downloadDokumen = useCallback(
    async (id: string, filename: string) => {
      try {
        const blob = await dokumenApi.download(id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Dokumen berhasil diunduh");
      } catch (err) {
        handleApiError(err, "Gagal mengunduh dokumen");
        throw err;
      }
    },
    []
  );

  return {
    dokumen,
    selectedDokumen,
    isLoading,
    isUploading,
    error,
    page,
    limit,
    total,
    search,
    kategori,
    perkaraId,
    setPage,
    setSearch,
    setKategori,
    setPerkaraId,
    setSelectedDokumen,
    fetchDokumen,
    fetchDokumenById,
    uploadDokumen,
    updateDokumen,
    deleteDokumen,
    downloadDokumen,
    reset,
  };
}