// ============================================================================
// FILE: types/auth.ts
// ============================================================================

import { UserRole } from "./enums";

/**
 * User Basic Info
 */
export interface User {
  id: string;
  email: string;
  nama_lengkap: string | null;
  role: UserRole;
  jabatan?: string | null;
  avatar_url?: string | null;
  telepon?: string | null;
}

/**
 * JWT Payload
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Auth Response
 */
export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    nama_lengkap: string;
    role: UserRole;
    jabatan?: string | null;
    avatar_url?: string | null;
  };
}

/**
 * Login DTO
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Register DTO
 */
export interface RegisterDto {
  email: string;
  password: string;
  nama_lengkap: string;
  role?: UserRole;
  jabatan?: string;
  telepon?: string;
}