// ============================================================================
// 3. lib/hooks/use-tugas.ts - REFACTORED
// ============================================================================
"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { tugasApi } from "@/lib/api/tugas.api";
import { useTugasStore } from "@/lib/stores/tugas.store";
import { CreateTugasDto, UpdateTugasDto, StatusTugas, PrioritasTugas } from "@/types";
import { handleApiError, getErrorMessage } from "@/lib/utils/error-handler";

export function useTugas() {
  const {
    tugas,
    selectedTugas,
    isLoading,
    error,
    page,
    limit,
    total,
    search,
    status,
    prioritas,
    perkaraId,
    ditugaskanKe,
    myTugasOnly,
    setTugas,
    setSelectedTugas,
    setLoading,
    setError,
    setTotal,
    setPage,
    setSearch,
    setStatus,
    setPrioritas,
    setPerkaraId,
    setDitugaskanKe,
    setMyTugasOnly,
    reset,
  } = useTugasStore();

  // Fetch All Tugas or My Tugas
  const fetchTugas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        search: search || undefined,
        status: (status as StatusTugas) || undefined,
        prioritas: (prioritas as PrioritasTugas) || undefined,
        perkara_id: perkaraId || undefined,
        ditugaskan_ke: ditugaskanKe || undefined,
      };

      const response = myTugasOnly 
        ? await tugasApi.getMyTugas(params)
        : await tugasApi.getAll(params);

      setTugas(response.data);
      setTotal(response.meta.total);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat data tugas");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    status,
    prioritas,
    perkaraId,
    ditugaskanKe,
    myTugasOnly,
    setTugas,
    setLoading,
    setError,
    setTotal,
  ]);

  // Fetch Tugas by ID
  const fetchTugasById = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        const tugas = await tugasApi.getById(id);
        return tugas;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        handleApiError(err, "Gagal memuat detail tugas");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Create Tugas
  const createTugas = useCallback(
    async (data: CreateTugasDto) => {
      try {
        setLoading(true);
        setError(null);
        const tugas = await tugasApi.create(data);
        // ✅ REMOVED: Toast handled by component (page)
        await fetchTugas();
        return tugas;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        handleApiError(err, "Gagal menambahkan tugas");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTugas, setLoading, setError]
  );

  // Update Tugas
  const updateTugas = useCallback(
    async (id: string, data: UpdateTugasDto) => {
      try {
        setLoading(true);
        setError(null);

        const tugas = await tugasApi.update(id, data);
        // ✅ REMOVED: Toast handled by component (page)

        await fetchTugas();
        return tugas;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        handleApiError(err, "Gagal memperbarui tugas");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTugas, setLoading, setError]
  );

  // Delete Tugas
  const deleteTugas = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        await tugasApi.delete(id);
        // ✅ REMOVED: Toast handled by component (table)
        await fetchTugas();
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        handleApiError(err, "Gagal menghapus tugas");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTugas, setLoading, setError]
  );

  return {
    tugas,
    selectedTugas,
    isLoading,
    error,
    page,
    limit,
    total,
    search,
    status,
    prioritas,
    perkaraId,
    ditugaskanKe,
    myTugasOnly,
    setPage,
    setSearch,
    setStatus,
    setPrioritas,
    setPerkaraId,
    setDitugaskanKe,
    setMyTugasOnly,
    setSelectedTugas,
    fetchTugas,
    fetchTugasById,
    createTugas,
    updateTugas,
    deleteTugas,
    reset,
  };
}