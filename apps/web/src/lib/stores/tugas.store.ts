// ============================================================================
// FILE: lib/stores/tugas.store.ts
// ============================================================================
import { create } from "zustand";
import { TugasWithRelations, StatusTugas, PrioritasTugas } from "@/types";

interface TugasState {
  tugas: TugasWithRelations[];
  selectedTugas: TugasWithRelations | null;
  isLoading: boolean;
  error: string | null;

  // Pagination
  page: number;
  limit: number;
  total: number;

  // Filters
  search: string;
  status: StatusTugas | string;
  prioritas: PrioritasTugas | string;
  perkaraId: string;
  ditugaskanKe: string;
  myTugasOnly: boolean;

  // Actions
  setTugas: (tugas: TugasWithRelations[]) => void;
  setSelectedTugas: (tugas: TugasWithRelations | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  setSearch: (search: string) => void;
  setStatus: (status: StatusTugas | string) => void;
  setPrioritas: (prioritas: PrioritasTugas | string) => void;
  setPerkaraId: (perkaraId: string) => void;
  setDitugaskanKe: (ditugaskanKe: string) => void;
  setMyTugasOnly: (myTugasOnly: boolean) => void;
  reset: () => void;
}

export const useTugasStore = create<TugasState>((set) => ({
  tugas: [],
  selectedTugas: null,
  isLoading: true, // ✅ Start with loading state to show skeleton on mount
  error: null,
  page: 1,
  limit: 10,
  total: 0,
  search: "",
  status: "",
  prioritas: "",
  perkaraId: "",
  ditugaskanKe: "",
  myTugasOnly: false,

  setTugas: (tugas) => set({ tugas }),
  setSelectedTugas: (tugas) => set({ selectedTugas: tugas }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit }),
  setTotal: (total) => set({ total }),
  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setPrioritas: (prioritas) => set({ prioritas, page: 1 }),
  setPerkaraId: (perkaraId) => set({ perkaraId, page: 1 }),
  setDitugaskanKe: (ditugaskanKe) => set({ ditugaskanKe, page: 1 }),
  setMyTugasOnly: (myTugasOnly) => set({ myTugasOnly, page: 1 }),
  reset: () =>
    set({
      tugas: [],
      selectedTugas: null,
      isLoading: false,
      error: null,
      page: 1,
      search: "",
      status: "",
      prioritas: "",
      perkaraId: "",
      ditugaskanKe: "",
      myTugasOnly: false,
    }),
}));