// ============================================================================
// FILE: lib/stores/dokumen.store.ts
// ============================================================================
import { create } from "zustand";
import { DokumenWithRelations, KategoriDokumen } from "@/types";

interface DokumenState {
  dokumen: DokumenWithRelations[];
  selectedDokumen: DokumenWithRelations | null;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;

  // Pagination
  page: number;
  limit: number;
  total: number;

  // Filters
  search: string;
  kategori: KategoriDokumen | string;
  perkaraId: string;

  // Actions
  setDokumen: (dokumen: DokumenWithRelations[]) => void;
  setSelectedDokumen: (dokumen: DokumenWithRelations | null) => void;
  setLoading: (loading: boolean) => void;
  setUploading: (uploading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  setSearch: (search: string) => void;
  setKategori: (kategori: KategoriDokumen | string) => void;
  setPerkaraId: (perkaraId: string) => void;
  reset: () => void;
}

export const useDokumenStore = create<DokumenState>((set) => ({
  dokumen: [],
  selectedDokumen: null,
  isLoading: true, // ✅ Start with loading state to show skeleton on mount
  isUploading: false,
  error: null,
  page: 1,
  limit: 10,
  total: 0,
  search: "",
  kategori: "",
  perkaraId: "",

  setDokumen: (dokumen) => set({ dokumen }),
  setSelectedDokumen: (dokumen) => set({ selectedDokumen: dokumen }),
  setLoading: (loading) => set({ isLoading: loading }),
  setUploading: (uploading) => set({ isUploading: uploading }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit }),
  setTotal: (total) => set({ total }),
  setSearch: (search) => set({ search, page: 1 }),
  setKategori: (kategori) => set({ kategori, page: 1 }),
  setPerkaraId: (perkaraId) => set({ perkaraId, page: 1 }),
  reset: () =>
    set({
      dokumen: [],
      selectedDokumen: null,
      isLoading: false,
      isUploading: false,
      error: null,
      page: 1,
      search: "",
      kategori: "",
      perkaraId: "",
    }),
}));