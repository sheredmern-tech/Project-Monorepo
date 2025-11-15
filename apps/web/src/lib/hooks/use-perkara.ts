// ============================================================================
// 2. lib/hooks/use-perkara.ts - REFACTORED & FIXED
// ============================================================================
"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { perkaraApi } from "@/lib/api/perkara.api";
import { usePerkaraStore } from "@/lib/stores/perkara.store";
import { CreatePerkaraDto, UpdatePerkaraDto, JenisPerkara, StatusPerkara } from "@/types";
import { handleApiError, getErrorMessage } from "@/lib/utils/error-handler";

export function usePerkara() {
  const {
    perkara,
    selectedPerkara,
    isLoading,
    error,
    page,
    limit,
    total,
    search,
    jenisPerkara,
    status,
    klienId,
    namaPengadilan,
    setPerkara,
    setSelectedPerkara,
    setLoading,
    setError,
    setTotal,
    setPage,
    setSearch,
    setJenisPerkara,
    setStatus,
    setKlienId,
    setNamaPengadilan,
    reset,
  } = usePerkaraStore();

  // Fetch All Perkara
  const fetchPerkara = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await perkaraApi.getAll({
        page,
        limit,
        search: search || undefined,
        jenis_perkara: (jenisPerkara as JenisPerkara) || undefined,
        status: (status as StatusPerkara) || undefined,
        klien_id: klienId || undefined,
        nama_pengadilan: namaPengadilan || undefined,
      });
      setPerkara(response.data);
      setTotal(response.meta.total);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat data perkara");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, jenisPerkara, status, klienId, namaPengadilan, setPerkara, setLoading, setError, setTotal]);

  // Create Perkara
  const createPerkara = useCallback(
    async (data: CreatePerkaraDto) => {
      try {
        setLoading(true);
        setError(null);
        const { 
          nomor_perkara_pengadilan: _unused, 
          ...rawData 
        } = data as CreatePerkaraDto & { nomor_perkara_pengadilan?: string };
        
        const createData = {
          ...rawData,
          tanggal_register: rawData.tanggal_register 
            ? new Date(rawData.tanggal_register).toISOString() 
            : undefined,
          tanggal_sidang_pertama: rawData.tanggal_sidang_pertama 
            ? new Date(rawData.tanggal_sidang_pertama).toISOString() 
            : undefined,
        };
        
        const response = await perkaraApi.create(createData);
        
        toast.success('Perkara berhasil ditambahkan!', {
          description: `${createData.nomor_perkara} - ${createData.judul}`,
        });
        
        await fetchPerkara();
        return response;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        handleApiError(err, "Gagal menambahkan perkara");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchPerkara, setLoading, setError]
  );

  // Update Perkara
  const updatePerkara = useCallback(
    async (id: string, data: UpdatePerkaraDto) => {
      try {
        setLoading(true);
        setError(null);
        
        const updateData = {
          ...data,
          tanggal_register: data.tanggal_register 
            ? new Date(data.tanggal_register).toISOString() 
            : undefined,
          tanggal_sidang_pertama: data.tanggal_sidang_pertama 
            ? new Date(data.tanggal_sidang_pertama).toISOString() 
            : undefined,
        };
        
        const response = await perkaraApi.update(id, updateData);
        
        toast.success('Perkara berhasil diperbarui!', {
          description: updateData.nomor_perkara || 'Data telah disimpan',
        });
        
        await fetchPerkara();
        return response;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        handleApiError(err, "Gagal memperbarui perkara");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchPerkara, setLoading, setError]
  );

  // Delete Perkara
  const deletePerkara = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        
        await perkaraApi.delete(id);
        
        toast.success('Perkara berhasil dihapus!');
        await fetchPerkara();
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        handleApiError(err, "Gagal menghapus perkara");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchPerkara, setLoading, setError]
  );

  return {
    perkara,
    selectedPerkara,
    isLoading,
    error,
    page,
    limit,
    total,
    search,
    jenisPerkara,
    status,
    klienId,
    namaPengadilan,
    setPage,
    setSearch,
    setJenisPerkara,
    setStatus,
    setKlienId,
    setNamaPengadilan,
    setSelectedPerkara,
    fetchPerkara,
    createPerkara,
    updatePerkara,
    deletePerkara,
    reset,
  };
}