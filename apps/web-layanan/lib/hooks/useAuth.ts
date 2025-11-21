'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { authApi } from '@/lib/api/auth';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');

      // ✅ FIX: Check if userData exists and is not "undefined"
      if (!token || !userData || userData === 'undefined') {
        setLoading(false);
        return;
      }

      // ✅ FIX: Safely parse JSON
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsAuthenticated(true);

    } catch (error) {
      console.error('Auth check failed:', error);
      // ✅ FIX: Clear invalid data
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });

    // ✅ FIX: Ensure data is valid before storing
    if (response.access_token && response.user) {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      setUser(response.user);
      setIsAuthenticated(true);
    } else {
      throw new Error('Invalid response from server');
    }

    return response;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    nama_lengkap: string;
    no_hp?: string;
  }) => {
    const response = await authApi.register(data);

    // ✅ FIX: Ensure data is valid before storing
    if (response.access_token && response.user) {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      setUser(response.user);
      setIsAuthenticated(true);
    } else {
      throw new Error('Invalid response from server');
    }

    return response;
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    checkAuth,
  };
}