// ============================================================================
// FILE: lib/stores/klien.store.ts
// ============================================================================
import { create } from "zustand";
import { KlienWithCount } from "@/types";

interface KlienState {
  klien: KlienWithCount[];
  selectedKlien: KlienWithCount | null;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  page: number;
  limit: number;
  total: number;
  
  // Filters
  search: string;
  jenisKlien: string;
  kota: string;
  
  // Actions
  setKlien: (klien: KlienWithCount[]) => void;
  setSelectedKlien: (klien: KlienWithCount | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  setSearch: (search: string) => void;
  setJenisKlien: (jenis: string) => void;
  setKota: (kota: string) => void;
  reset: () => void;
}

export const useKlienStore = create<KlienState>((set) => ({
  klien: [],
  selectedKlien: null,
  isLoading: false,
  error: null,
  page: 1,
  limit: 10,
  total: 0,
  search: "",
  jenisKlien: "",
  kota: "",

  setKlien: (klien) => set({ klien }),
  setSelectedKlien: (klien) => set({ selectedKlien: klien }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit }),
  setTotal: (total) => set({ total }),
  setSearch: (search) => set({ search, page: 1 }),
  setJenisKlien: (jenisKlien) => set({ jenisKlien, page: 1 }),
  setKota: (kota) => set({ kota, page: 1 }),
  reset: () => set({
    klien: [],
    selectedKlien: null,
    isLoading: false,
    error: null,
    page: 1,
    search: "",
    jenisKlien: "",
    kota: "",
  }),
}));