import { create } from 'zustand';
import storageService from '../services/storage.service';
import apiService from '../services/api.service';
import syncService from '../services/sync.service';
import networkService from '../services/network.service';
import dataTransformService from '../services/data-transform.service';
import type { 
  User, 
  SyncStatus,
  Case,
  DokumenHukum,
  Perkara,
  Tugas,
  DashboardStats
} from '../types';

interface AppState {
  // ========================================
  // AUTH STATE
  // ========================================
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // ========================================
  // CASES STATE
  // ========================================
  cases: Case[];
  currentCase: Case | null;
  isLoadingCases: boolean;
  casesError: string | null;

  // ========================================
  // DOCUMENTS STATE
  // ========================================
  documents: DokumenHukum[];
  isLoadingDocuments: boolean;
  documentsError: string | null;

  // ========================================
  // TASKS STATE
  // ========================================
  tasks: Tugas[];
  isLoadingTasks: boolean;
  tasksError: string | null;

  // ========================================
  // DASHBOARD STATE
  // ========================================
  dashboardStats: DashboardStats | null;
  isLoadingStats: boolean;

  // ========================================
  // SYNC STATE
  // ========================================
  syncStatus: SyncStatus;

  // ========================================
  // AUTH ACTIONS
  // ========================================
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUserFromStorage: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  // ========================================
  // CASES ACTIONS
  // ========================================
  loadCases: (forceRefresh?: boolean) => Promise<void>;
  loadCaseById: (id: string) => Promise<void>;
  createCase: (caseData: any) => Promise<void>;
  updateCase: (id: string, updates: any) => Promise<void>;
  updateCasePhase: (id: string, phase: number, skipPhase2?: boolean) => Promise<void>;

  // ========================================
  // DOCUMENTS ACTIONS
  // ========================================
  loadDocuments: (caseId?: string) => Promise<void>;
  uploadDocument: (
    fileUri: string,
    fileName: string,
    fileType: string,
    caseId: string,
    category: string,
    phase: number,
    isRequired?: boolean
  ) => Promise<void>;
  updateDocumentStatus: (
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    notes?: string
  ) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  // ========================================
  // TASKS ACTIONS
  // ========================================
  loadTasks: () => Promise<void>;
  createTask: (taskData: any) => Promise<void>;
  updateTaskStatus: (id: string, status: string) => Promise<void>;

  // ========================================
  // DASHBOARD ACTIONS
  // ========================================
  loadDashboardStats: () => Promise<void>;

  // ========================================
  // SYNC ACTIONS
  // ========================================
  updateSyncStatus: () => Promise<void>;
  syncAll: () => Promise<void>;
  clearCache: () => Promise<void>;

  // ========================================
  // UTILITY ACTIONS
  // ========================================
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null, type?: 'cases' | 'documents' | 'tasks') => void;
  reset: () => void;
}

const initialState = {
  // Auth
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // Cases
  cases: [],
  currentCase: null,
  isLoadingCases: false,
  casesError: null,

  // Documents
  documents: [],
  isLoadingDocuments: false,
  documentsError: null,

  // Tasks
  tasks: [],
  isLoadingTasks: false,
  tasksError: null,

  // Dashboard
  dashboardStats: null,
  isLoadingStats: false,

  // Sync
  syncStatus: {
    isOnline: true,
    isSyncing: false,
    lastSyncTime: null,
    pendingUploads: 0,
    failedUploads: 0,
  },
};

export const useStore = create<AppState>((set, get) => ({
  ...initialState,

  // ========================================
  // AUTH ACTIONS IMPLEMENTATION
  // ========================================

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiService.login(email, password);
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Start syncing after login
      get().syncAll();

      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      set({ 
        isLoading: false,
        user: null,
        isAuthenticated: false,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiService.logout();
      await storageService.clearAll();
      syncService.stopAutoSync();
      
      set(initialState);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadUserFromStorage: async () => {
    try {
      const user = await storageService.getUser();
      const token = await storageService.getToken();
      
      if (user && token) {
        set({
          user,
          isAuthenticated: true,
        });

        // Start syncing
        get().syncAll();
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
    }
  },

  refreshProfile: async () => {
    try {
      const profile = await apiService.getProfile();
      set({ user: profile });
      await storageService.setUser(profile);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  },

  // ========================================
  // CASES ACTIONS IMPLEMENTATION
  // ========================================

  loadCases: async (forceRefresh = false) => {
    set({ isLoadingCases: true, casesError: null });

    try {
      // Load from cache first
      if (!forceRefresh) {
        const cachedCases = await storageService.getCases();
        if (cachedCases.length > 0) {
          set({ cases: cachedCases });
        }
      }

      // Fetch from server if online
      if (networkService.getStatus()) {
        const response = await apiService.getPerkara({
          limit: 100,
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        });

        // Transform to Case format
        const cases = dataTransformService.perkaraListToCases(response.data);

        // Save to cache
        await storageService.saveCases(cases);

        set({ cases });
      }
    } catch (error: any) {
      console.error('Failed to load cases:', error);
      set({ casesError: error.message });
    } finally {
      set({ isLoadingCases: false });
    }
  },

  loadCaseById: async (id: string) => {
    set({ isLoading: true });

    try {
      // Check cache first
      const cachedCase = await storageService.getCaseById(id);
      if (cachedCase) {
        set({ currentCase: cachedCase });
      }

      // Fetch from server if online
      if (networkService.getStatus()) {
        const response = await apiService.getPerkaraById(id);
        const caseData = dataTransformService.perkaraToCase(response);
        
        set({ currentCase: caseData });

        // Update cache
        const cases = get().cases;
        const index = cases.findIndex(c => c.id === id);
        if (index !== -1) {
          cases[index] = caseData;
          set({ cases });
          await storageService.saveCases(cases);
        }
      }
    } catch (error: any) {
      console.error('Failed to load case:', error);
      set({ casesError: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createCase: async (caseData: any) => {
    set({ isLoading: true });

    try {
      if (networkService.getStatus()) {
        // Create online
        const response = await apiService.createPerkara(caseData);
        const newCase = dataTransformService.perkaraToCase(response);
        
        // Update state and cache
        const cases = [...get().cases, newCase];
        set({ cases });
        await storageService.saveCases(cases);
      } else {
        // Queue for later sync
        await syncService.addToUploadQueue({
          type: 'case',
          action: 'create',
          endpoint: '/perkara',
          payload: caseData,
          status: 'pending',
        });
      }
    } catch (error: any) {
      console.error('Failed to create case:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCase: async (id: string, updates: any) => {
    try {
      if (networkService.getStatus()) {
        const response = await apiService.updatePerkara(id, updates);
        const updatedCase = dataTransformService.perkaraToCase(response);
        
        // Update state and cache
        const cases = get().cases.map(c => c.id === id ? updatedCase : c);
        set({ cases });
        await storageService.saveCases(cases);
      } else {
        // Queue for later sync
        await syncService.addToUploadQueue({
          type: 'case',
          action: 'update',
          endpoint: `/perkara/${id}`,
          payload: { id, ...updates },
          status: 'pending',
        });
      }
    } catch (error) {
      console.error('Failed to update case:', error);
      throw error;
    }
  },

  updateCasePhase: async (id: string, phase: number, skipPhase2 = false) => {
    try {
      const updates: any = {
        currentPhase: phase,
      };

      if (skipPhase2 && phase === 3) {
        updates.phase2Skipped = true;
        updates.skipReason = 'All required documents approved in Phase 1';
      }

      await get().updateCase(id, updates);
    } catch (error) {
      console.error('Failed to update case phase:', error);
      throw error;
    }
  },

  // ========================================
  // DOCUMENTS ACTIONS IMPLEMENTATION
  // ========================================

  loadDocuments: async (caseId?: string) => {
    set({ isLoadingDocuments: true, documentsError: null });

    try {
      // Load from cache first
      if (caseId) {
        const cachedDocs = await storageService.getDocumentsForCase(caseId);
        if (cachedDocs.length > 0) {
          set({ documents: cachedDocs });
        }
      }

      // Fetch from server if online
      if (networkService.getStatus()) {
        const response = await apiService.getDokumen(caseId);
        
        set({ documents: response.data });

        // Save to cache
        if (caseId) {
          await storageService.saveDocumentsForCase(caseId, response.data);
        }
      }
    } catch (error: any) {
      console.error('Failed to load documents:', error);
      set({ documentsError: error.message });
    } finally {
      set({ isLoadingDocuments: false });
    }
  },

  uploadDocument: async (
    fileUri: string,
    fileName: string,
    fileType: string,
    caseId: string,
    category: string,
    phase: number,
    isRequired = false
  ) => {
    try {
      if (networkService.getStatus()) {
        // Upload immediately
        const response = await apiService.uploadDokumen(
          fileUri,
          fileName,
          fileType,
          caseId,
          category,
          phase,
          isRequired,
          !isRequired // isOptional = !isRequired
        );

        // Refresh documents
        await get().loadDocuments(caseId);
      } else {
        // Queue for later upload
        await syncService.addToUploadQueue({
          type: 'document',
          action: 'create',
          endpoint: '/dokumen/upload',
          payload: {
            perkaraId: caseId,
            kategori: category,
            phase,
            isRequired,
            isOptional: !isRequired,
          },
          fileUri,
          fileName,
          fileType,
          status: 'pending',
        });

        // Create local document entry
        const localDoc: DokumenHukum = {
          id: `local-${Date.now()}`,
          perkaraId: caseId,
          namaDokumen: fileName,
          kategori: category,
          phase,
          isRequired,
          isOptional: !isRequired,
          uploadedById: get().user?.id || '',
          uploadedAt: new Date().toISOString(),
          syncStatus: 'pending',
          localUri: fileUri,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Update local state
        set({ documents: [...get().documents, localDoc] });
      }
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    }
  },

  updateDocumentStatus: async (id: string, status: 'pending' | 'approved' | 'rejected', notes?: string) => {
    try {
      if (networkService.getStatus()) {
        await apiService.updateDokumenStatus(id, status, notes);
        await get().loadDocuments();
      } else {
        // Queue for later sync
        await syncService.addToUploadQueue({
          type: 'document',
          action: 'update',
          endpoint: `/dokumen/${id}`,
          payload: { reviewStatus: status, reviewNotes: notes },
          status: 'pending',
        });
      }
    } catch (error) {
      console.error('Failed to update document status:', error);
      throw error;
    }
  },

  deleteDocument: async (id: string) => {
    try {
      if (networkService.getStatus()) {
        await apiService.deleteDokumen(id);
        set({ documents: get().documents.filter(d => d.id !== id) });
      } else {
        // Queue for later sync
        await syncService.addToUploadQueue({
          type: 'document',
          action: 'delete',
          endpoint: `/dokumen/${id}`,
          payload: { id },
          status: 'pending',
        });

        // Remove from local state
        set({ documents: get().documents.filter(d => d.id !== id) });
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  },

  // ========================================
  // TASKS ACTIONS IMPLEMENTATION
  // ========================================

  loadTasks: async () => {
    set({ isLoadingTasks: true, tasksError: null });

    try {
      // Load from cache first
      const cachedTasks = await storageService.getTasks();
      if (cachedTasks.length > 0) {
        set({ tasks: cachedTasks });
      }

      // Fetch from server if online
      if (networkService.getStatus()) {
        const response = await apiService.getTugas({
          assignedToId: get().user?.id,
          limit: 100,
        });

        set({ tasks: response.data });
        await storageService.saveTasks(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      set({ tasksError: error.message });
    } finally {
      set({ isLoadingTasks: false });
    }
  },

  createTask: async (taskData: any) => {
    try {
      if (networkService.getStatus()) {
        const response = await apiService.createTugas(taskData);
        set({ tasks: [...get().tasks, response] });
      } else {
        await syncService.addToUploadQueue({
          type: 'task',
          action: 'create',
          endpoint: '/tugas',
          payload: taskData,
          status: 'pending',
        });
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  },

  updateTaskStatus: async (id: string, status: string) => {
    try {
      if (networkService.getStatus()) {
        await apiService.updateTugasStatus(id, status);
        
        const tasks = get().tasks.map(t => 
          t.id === id ? { ...t, status } : t
        );
        set({ tasks });
      } else {
        await syncService.addToUploadQueue({
          type: 'task',
          action: 'update',
          endpoint: `/tugas/${id}`,
          payload: { id, status },
          status: 'pending',
        });
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
      throw error;
    }
  },

  // ========================================
  // DASHBOARD ACTIONS IMPLEMENTATION
  // ========================================

  loadDashboardStats: async () => {
    set({ isLoadingStats: true });

    try {
      if (networkService.getStatus()) {
        const stats = await apiService.getDashboardStats();
        set({ dashboardStats: stats });
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      set({ isLoadingStats: false });
    }
  },

  // ========================================
  // SYNC ACTIONS IMPLEMENTATION
  // ========================================

  updateSyncStatus: async () => {
    const status = await syncService.getSyncStatus();
    set({ syncStatus: status });
  },

  syncAll: async () => {
    set((state) => ({
      syncStatus: { ...state.syncStatus, isSyncing: true }
    }));

    try {
      await syncService.syncAll();
      
      // Refresh all data
      await Promise.all([
        get().loadCases(),
        get().loadDocuments(),
        get().loadTasks(),
        get().updateSyncStatus(),
      ]);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      set((state) => ({
        syncStatus: { ...state.syncStatus, isSyncing: false }
      }));
    }
  },

  clearCache: async () => {
    try {
      await storageService.clearCache();
      
      // Reset local state
      set({
        cases: [],
        currentCase: null,
        documents: [],
        tasks: [],
        dashboardStats: null,
      });

      // Reload data
      await get().syncAll();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  },

  // ========================================
  // UTILITY ACTIONS IMPLEMENTATION
  // ========================================

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null, type?: 'cases' | 'documents' | 'tasks') => {
    if (type === 'cases') {
      set({ casesError: error });
    } else if (type === 'documents') {
      set({ documentsError: error });
    } else if (type === 'tasks') {
      set({ tasksError: error });
    }
  },

  reset: () => {
    set(initialState);
  },
}));

// ========================================
// NETWORK LISTENER
// ========================================

// Initialize network listener
networkService.subscribe((isOnline) => {
  useStore.setState((state) => ({
    syncStatus: { ...state.syncStatus, isOnline },
  }));

  // Trigger sync when coming back online
  if (isOnline) {
    console.log('📡 Network is back online - starting sync...');
    syncService.syncAll();
    useStore.getState().updateSyncStatus();
  } else {
    console.log('📴 Network is offline - enabling offline mode');
  }
});

// ========================================
// AUTO-LOAD USER ON APP START
// ========================================

// Check for existing auth on app start
useStore.getState().loadUserFromStorage();
