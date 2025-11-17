import { create } from 'zustand';
import storageService from '../services/storage.service';
import apiService from '../services/api.service';
import syncService from '../services/sync.service';
import networkService from '../services/network.service';
import type { Document, User, SyncStatus } from '../types';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // Documents
  documents: Document[];
  isLoadingDocuments: boolean;

  // Sync
  syncStatus: SyncStatus;

  // Actions
  setUser: (user: User | null) => void;
  loadDocuments: () => Promise<void>;
  refreshDocuments: () => Promise<void>;
  updateSyncStatus: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  documents: [],
  isLoadingDocuments: false,
  syncStatus: {
    isOnline: true,
    isSyncing: false,
    lastSyncTime: null,
    pendingUploads: 0,
    failedUploads: 0,
  },

  // Set user
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  // Load documents (from cache first, then sync)
  loadDocuments: async () => {
    set({ isLoadingDocuments: true });

    try {
      // 1. Load from cache immediately
      const cachedDocs = await storageService.getDocuments();
      set({ documents: cachedDocs });

      // 2. Sync from server if online
      if (networkService.getStatus()) {
        try {
          const response = await apiService.getDocuments();
          const documents: Document[] = response.documents.map((doc) => ({
            ...doc,
            syncStatus: 'synced' as const,
          }));

          // Update cache
          await storageService.saveDocuments(documents);
          set({ documents });
        } catch (error) {
          console.error('Failed to sync documents:', error);
          // Keep using cached data
        }
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      set({ isLoadingDocuments: false });
    }
  },

  // Refresh documents (pull-to-refresh)
  refreshDocuments: async () => {
    const { loadDocuments, updateSyncStatus } = get();
    await Promise.all([
      loadDocuments(),
      syncService.syncAll(),
      updateSyncStatus(),
    ]);
  },

  // Update sync status
  updateSyncStatus: async () => {
    const status = await syncService.getSyncStatus();
    set({ syncStatus: status });
  },
}));

// Initialize network listener
networkService.subscribe((isOnline) => {
  useStore.setState((state) => ({
    syncStatus: { ...state.syncStatus, isOnline },
  }));

  // Trigger sync when coming back online
  if (isOnline) {
    syncService.syncAll();
    useStore.getState().updateSyncStatus();
  }
});