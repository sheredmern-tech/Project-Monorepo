// ============================================================================
// FILE: types/entities/user.ts
// ============================================================================

import { UserRole } from "../enums";
import { BaseEntity } from "./base";

/**
 * User Entity - Complete User data
 */
export interface UserEntity extends BaseEntity {
  email: string;
  nama_lengkap: string | null;
  role: UserRole;
  jabatan: string | null;
  nomor_kta: string | null;
  nomor_berita_acara: string | null;
  spesialisasi: string | null;
  avatar_url: string | null;
  telepon: string | null;
  alamat: string | null;
  tanggal_bergabung: string;
  is_active: boolean;
}

/**
 * User Basic - For selection/display
 */
export interface UserBasic {
  id: string;
  email: string;
  nama_lengkap: string | null;
  role: UserRole;
  avatar_url: string | null;
}

/**
 * User Public - Safe data for public display
 */
export interface UserPublic {
  id: string;
  nama_lengkap: string | null;
  email: string;
  role: UserRole;
  jabatan: string | null;
  avatar_url: string | null;
  telepon: string | null;
}
/**
 * User with Statistics
 */
export interface UserWithStats extends UserEntity {
  _count: {
    perkara_dibuat: number;
    tugas_ditugaskan: number;
    tim_perkara: number;
    klien_dibuat: number;
    dokumen_diunggah: number;
  };
}