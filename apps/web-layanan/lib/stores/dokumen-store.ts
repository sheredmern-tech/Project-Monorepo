import { create } from 'zustand';
import { Dokumen, DashboardStats } from '@/types';
import { dokumenApi } from '@/lib/api/dokumen';
import { dashboardApi } from '@/lib/api/dashboard';

interface DokumenStore {
  // State
  documents: Dokumen[];
  stats: DashboardStats;
  loading: boolean;
  error: string | null;

  // Actions
  fetchDocuments: () => Promise<void>;
  fetchStats: () => Promise<void>;
  addDocument: (document: Dokumen) => void;
  removeDocument: (id: string) => void;
  clearError: () => void;
  reset: () => void;
}

export const useDokumenStore = create<DokumenStore>((set, get) => ({
  // Initial State
  documents: [],
  stats: {
    total_dokumen: 0,
    dokumen_bulan_ini: 0,
    dokumen_minggu_ini: 0,
  },
  loading: false,
  error: null,

  // Fetch all documents
  fetchDocuments: async () => {
    try {
      set({ loading: true, error: null });

      const response = await dokumenApi.getAll();

      // ✅ Robust defensive check
      const documentsData = Array.isArray(response?.data)
        ? response.data
        : [];

      // Sort by date (newest first)
      const sorted = documentsData.sort(
        (a, b) =>
          new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
      );

      set({ documents: sorted, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch documents:', error);
      set({
        error: 'Gagal memuat dokumen. Silakan coba lagi.',
        loading: false,
        documents: [],
      });
    }
  },

  // Fetch stats
  fetchStats: async () => {
    try {
      const statsData = await dashboardApi.getStats();
      set({
        stats: statsData || {
          total_dokumen: 0,
          dokumen_bulan_ini: 0,
          dokumen_minggu_ini: 0,
        },
      });
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      set({
        stats: {
          total_dokumen: 0,
          dokumen_bulan_ini: 0,
          dokumen_minggu_ini: 0,
        },
      });
    }
  },

  // Add document (called after successful upload)
  addDocument: (document: Dokumen) => {
    set((state) => ({
      documents: [document, ...state.documents],
      stats: {
        ...state.stats,
        total_dokumen: state.stats.total_dokumen + 1,
        dokumen_bulan_ini: state.stats.dokumen_bulan_ini + 1,
        dokumen_minggu_ini: state.stats.dokumen_minggu_ini + 1,
      },
    }));
  },

  // Remove document (called after delete)
  removeDocument: (id: string) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
      stats: {
        ...state.stats,
        total_dokumen: Math.max(0, state.stats.total_dokumen - 1),
      },
    }));
  },

  // Clear error message
  clearError: () => {
    set({ error: null });
  },

  // Reset store (for logout)
  reset: () => {
    set({
      documents: [],
      stats: {
        total_dokumen: 0,
        dokumen_bulan_ini: 0,
        dokumen_minggu_ini: 0,
      },
      loading: false,
      error: null,
    });
  },
}));
