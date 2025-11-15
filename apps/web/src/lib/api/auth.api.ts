// ============================================================================
// FILE: lib/api/auth.api.ts - Clean Version
// ============================================================================

import apiClient from "./client";
import { AuthResponse, LoginDto, RegisterDto, User } from "@/types";

export const authApi = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", data);
    return response as unknown as AuthResponse;
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/register", data);
    return response as unknown as AuthResponse;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get("/auth/profile");
    return response as unknown as User;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/refresh");
    return response as unknown as AuthResponse;
  },
};
