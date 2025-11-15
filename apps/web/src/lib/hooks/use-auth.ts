// ============================================================================
// FILE: hooks/use-auth.ts - REFACTORED (SIMPLIFIED REDIRECTS)
// ============================================================================
"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth.store";
import { authApi } from "@/lib/api/auth.api";
import { LoginDto, RegisterDto } from "@/types";
import { UserRole } from "@/types/enums";
import { handleApiError, getErrorMessage } from "@/lib/utils/error-handler";
import { getDefaultRedirect } from "@/lib/config/rbac";

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth, setLoading } = useAuthStore();

  const login = useCallback(async (data: LoginDto) => {
    try {
      setLoading(true);
      
      const response = await authApi.login(data);

      if (!response?.access_token) {
        throw new Error('Invalid response: missing access_token');
      }
      
      if (!response.user?.role) {
        throw new Error('Invalid response: missing user role');
      }
      
      // Set cookies via API route
      const cookieResponse = await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: response.access_token,
          role: response.user.role
        }),
      });

      if (!cookieResponse.ok) {
        const cookieResult = await cookieResponse.json();
        throw new Error(cookieResult.message || 'Failed to set cookies');
      }

      setAuth(response.user, response.access_token);
      
      toast.success(`Selamat datang, ${response.user.nama_lengkap || response.user.email}!`);
      
      // ✅ REDIRECT BERDASARKAN ROLE
      const redirectPath = getDefaultRedirect(response.user.role as UserRole);
      window.location.href = redirectPath;
      
    } catch (error) {
      handleApiError(error, "Login gagal");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading]);

  const register = useCallback(async (data: RegisterDto) => {
    try {
      setLoading(true);
      
      const registrationData: RegisterDto = {
        ...data,
        role: UserRole.KLIEN // Default role untuk registrasi
      };
      
      const response = await authApi.register(registrationData);
      
      if (!response?.access_token) {
        throw new Error('Invalid response: missing access_token');
      }
      
      const cookieResponse = await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: response.access_token,
          role: response.user.role
        }),
      });

      if (!cookieResponse.ok) {
        const cookieResult = await cookieResponse.json();
        throw new Error(cookieResult.message || 'Failed to set cookies');
      }

      setAuth(response.user, response.access_token);
      
      toast.success(`Registrasi berhasil! Selamat datang, ${response.user.nama_lengkap}!`);
      
      // ✅ REDIRECT BERDASARKAN ROLE (KLIEN → 404)
      const redirectPath = getDefaultRedirect(response.user.role as UserRole);
      window.location.href = redirectPath;

    } catch (error) {
      handleApiError(error, "Registrasi gagal");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading]);

  // ✅ LOGOUT → CLEAR EVERYTHING → REDIRECT TO LOGIN
const logout = useCallback(async () => {
  try {
    console.log('🚪 ===== CLIENT LOGOUT DEBUG =====');
    
    // Debug state sebelum logout
    console.log('📋 BEFORE LOGOUT:');
    console.log('   User:', user?.email);
    console.log('   Role:', user?.role);
    console.log('   Token exists:', !!token);
    console.log('   isAuthenticated:', isAuthenticated);
    
    // Check cookies sebelum logout
    if (typeof document !== 'undefined') {
      console.log('   Document cookies:', document.cookie);
    }
    
    console.log('🔄 Step 1: Calling logout API...');
    const logoutResponse = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (logoutResponse.ok) {
      console.log('✅ Step 1: Logout API success');
    } else {
      console.error('❌ Step 1: Logout API failed');
    }
    
    console.log('🔄 Step 2: Calling backend logout...');
    try {
      await authApi.logout();
      console.log('✅ Step 2: Backend logout success');
    } catch (err) {
      console.error('❌ Step 2: Backend logout failed:', err);
    }
    
    console.log('🔄 Step 3: Clearing Zustand store...');
    clearAuth();
    console.log('✅ Step 3: Zustand cleared');
    
    console.log('🔄 Step 4: Clearing localStorage & sessionStorage...');
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ Step 4: Storage cleared');
    }
    
    // Check cookies setelah logout
    if (typeof document !== 'undefined') {
      console.log('📋 AFTER LOGOUT:');
      console.log('   Document cookies:', document.cookie);
    }
    
    console.log('================================');
    console.log('✅ Logout completed - redirecting to /login');
    
    toast.success("Logout berhasil");
    
    // Hard redirect
    setTimeout(() => {
      window.location.href = "/login";
    }, 500);
    
  } catch (error) {
    console.error('❌ LOGOUT ERROR:', error);
    window.location.href = "/login";
  }
}, [user, token, isAuthenticated, clearAuth]);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await authApi.getCurrentUser();
      
      if (token) {
        setAuth(currentUser, token);
      }
      
      return currentUser;
    } catch (error) {
      const message = getErrorMessage(error);
      handleApiError(error, "Gagal memuat data user");
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [token, setAuth, setLoading]);

  const hasRole = useCallback((role: UserRole): boolean => {
    return user?.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return roles.some(role => user?.role === role);
  }, [user]);

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    hasRole,
    hasAnyRole,
  };
}