// ============================================================================
// lib/stores/auth.store.ts - SIMPLIFIED (NO COOKIE MANAGEMENT)
// ============================================================================
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // ✅ ONLY update Zustand store (cookies handled by API route)
      setAuth: (user, token) => {
        // Keep localStorage for backup/sync
        if (typeof window !== 'undefined') {
          localStorage.setItem("access_token", token);
        }
        
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        });
      },

      // ✅ Clear everything
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem("access_token");
        }
        
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },

      // ✅ Logout (same as clearAuth, kept for compatibility)
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem("access_token");
        }
        
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);