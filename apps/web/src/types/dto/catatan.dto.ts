// ============================================================================
// FILE: types/dto/catatan.dto.ts
// ============================================================================

import { QueryFilters } from "../api";

/**
 * Create Catatan DTO
 */
export interface CreateCatatanDto {
  perkara_id: string;
  catatan: string;
  dapat_ditagih?: boolean;
  jam_kerja?: number;
}

/**
 * Update Catatan DTO
 */
export interface UpdateCatatanDto {
  catatan?: string;
  dapat_ditagih?: boolean;
  jam_kerja?: number;
}

/**
 * Query Catatan DTO
 */
export interface QueryCatatanDto extends QueryFilters {
  perkara_id?: string;
  user_id?: string;
}