// ============================================================================
// FILE: lib/stores/ui.store.ts - PHASE 1: WITH COLLAPSE STATE
// ============================================================================
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Sidebar states
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapse: () => void;
  
  // Modal states (existing)
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  
  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial states
      sidebarOpen: false, // Mobile sidebar (overlay)
      sidebarCollapsed: false, // Desktop collapse state
      isModalOpen: false,
      isLoading: false,

      // Sidebar actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      
      setSidebarCollapsed: (collapsed) => set({ 
        sidebarCollapsed: collapsed 
      }),
      
      toggleSidebarCollapse: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),

      // Modal actions
      setModalOpen: (open) => set({ isModalOpen: open }),

      // Loading actions
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "ui-storage",
      // Only persist sidebar collapsed state (not the mobile open state)
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed 
      }),
    }
  )
);

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook to get current sidebar width in pixels
 * Useful for calculating main content margins
 */
export const useSidebarWidth = () => {
  const { sidebarCollapsed } = useUIStore();
  return sidebarCollapsed ? 64 : 256; // 16 * 4 = 64px, 64 * 4 = 256px
};

/**
 * Hook to check if we're on mobile
 */
export const useIsMobile = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 1024;
};