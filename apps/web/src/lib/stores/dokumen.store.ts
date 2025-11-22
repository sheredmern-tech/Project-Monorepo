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
  folderId: string | null;

  // Sorting
  sortBy: string;
  sortOrder: 'asc' | 'desc';

  // Bulk Selection
  selectedIds: Set<string>;
  isSelectionMode: boolean;

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
  setFolderId: (folderId: string | null) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSelectionMode: (mode: boolean) => void;
  reset: () => void;
}

export const useDokumenStore = create<DokumenState>((set, get) => ({
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
  folderId: null,
  sortBy: "tanggal_upload", // ✅ Default: newest first
  sortOrder: "desc", // ✅ Default: descending
  selectedIds: new Set<string>(), // ✅ Bulk selection
  isSelectionMode: false, // ✅ Selection mode toggle

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
  setFolderId: (folderId) => set({ folderId, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy, page: 1 }), // ✅ Reset to page 1 when sorting
  setSortOrder: (sortOrder) => set({ sortOrder, page: 1 }), // ✅ Reset to page 1 when sorting

  // ✅ Bulk selection actions
  toggleSelection: (id: string) => set((state) => {
    const newSelected = new Set(state.selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    return { selectedIds: newSelected };
  }),

  selectAll: () => set((state) => ({
    selectedIds: new Set(state.dokumen.map(d => d.id)),
  })),

  clearSelection: () => set({ selectedIds: new Set<string>(), isSelectionMode: false }),

  setSelectionMode: (mode: boolean) => set({
    isSelectionMode: mode,
    selectedIds: mode ? get().selectedIds : new Set<string>()
  }),

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
      folderId: null,
      sortBy: "tanggal_upload",
      sortOrder: "desc",
      selectedIds: new Set<string>(),
      isSelectionMode: false,
    }),
}));