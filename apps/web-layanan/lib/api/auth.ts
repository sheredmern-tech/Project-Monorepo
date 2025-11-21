import apiClient from './client';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types';

export const authApi = {
  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);

    // ✅ FIX: Extract from wrapped response
    return response.data.data; // response.data.data karena backend wrap dengan { data: {...} }
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);

    // ✅ FIX: Extract from wrapped response
    return response.data.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/auth/profile');

    // ✅ FIX: Extract from wrapped response
    return response.data.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};