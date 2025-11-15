// ============================================================================
// FILE: lib/stores/konflik.store.ts - NEW
// ============================================================================
import { create } from "zustand";
import { KonflikWithRelations } from "@/types";

interface KonflikState {
  konflik: KonflikWithRelations[];
  selectedKonflik: KonflikWithRelations | null;
  isLoading: boolean;
  error: string | null;

  // Pagination
  page: number;
  limit: number;
  total: number;

  // Filters
  search: string;
  adaKonflik: boolean | string;
  perkaraId: string;

  // Actions
  setKonflik: (konflik: KonflikWithRelations[]) => void;
  setSelectedKonflik: (konflik: KonflikWithRelations | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  setSearch: (search: string) => void;
  setAdaKonflik: (adaKonflik: boolean | string) => void;
  setPerkaraId: (perkaraId: string) => void;
  reset: () => void;
}

export const useKonflikStore = create<KonflikState>((set) => ({
  konflik: [],
  selectedKonflik: null,
  isLoading: false,
  error: null,
  page: 1,
  limit: 10,
  total: 0,
  search: "",
  adaKonflik: "",
  perkaraId: "",

  setKonflik: (konflik) => set({ konflik }),
  setSelectedKonflik: (konflik) => set({ selectedKonflik: konflik }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit }),
  setTotal: (total) => set({ total }),
  setSearch: (search) => set({ search, page: 1 }),
  setAdaKonflik: (adaKonflik) => set({ adaKonflik, page: 1 }),
  setPerkaraId: (perkaraId) => set({ perkaraId, page: 1 }),
  reset: () =>
    set({
      konflik: [],
      selectedKonflik: null,
      isLoading: false,
      error: null,
      page: 1,
      search: "",
      adaKonflik: "",
      perkaraId: "",
    }),
}));