// ============================================================================
// FILE: lib/stores/perkara.store.ts
// ============================================================================
import { create } from "zustand";
import { PerkaraWithKlien, JenisPerkara, StatusPerkara } from "@/types";

interface PerkaraState {
  perkara: PerkaraWithKlien[];
  selectedPerkara: PerkaraWithKlien | null;
  isLoading: boolean;
  error: string | null;

  // Pagination
  page: number;
  limit: number;
  total: number;

  // Filters
  search: string;
  jenisPerkara: JenisPerkara | string;
  status: StatusPerkara | string;
  klienId: string;
  namaPengadilan: string;

  // Actions
  setPerkara: (perkara: PerkaraWithKlien[]) => void;
  setSelectedPerkara: (perkara: PerkaraWithKlien | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  setSearch: (search: string) => void;
  setJenisPerkara: (jenis: JenisPerkara | string) => void;
  setStatus: (status: StatusPerkara | string) => void;
  setKlienId: (klienId: string) => void;
  setNamaPengadilan: (nama: string) => void;
  reset: () => void;
}

export const usePerkaraStore = create<PerkaraState>((set) => ({
  perkara: [],
  selectedPerkara: null,
  isLoading: false,
  error: null,
  page: 1,
  limit: 10,
  total: 0,
  search: "",
  jenisPerkara: "",
  status: "",
  klienId: "",
  namaPengadilan: "",

  setPerkara: (perkara) => set({ perkara }),
  setSelectedPerkara: (perkara) => set({ selectedPerkara: perkara }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit }),
  setTotal: (total) => set({ total }),
  setSearch: (search) => set({ search, page: 1 }),
  setJenisPerkara: (jenisPerkara) => set({ jenisPerkara, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setKlienId: (klienId) => set({ klienId, page: 1 }),
  setNamaPengadilan: (namaPengadilan) => set({ namaPengadilan, page: 1 }),
  reset: () =>
    set({
      perkara: [],
      selectedPerkara: null,
      isLoading: false,
      error: null,
      page: 1,
      search: "",
      jenisPerkara: "",
      status: "",
      klienId: "",
      namaPengadilan: "",
    }),
}));