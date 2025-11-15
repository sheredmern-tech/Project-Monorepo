// ============================================================================
// FILE: types/dto/konflik.dto.ts
// ============================================================================

import { QueryFilters } from "../api";

/**
 * Create Konflik DTO
 */
export interface CreateKonflikDto {
  perkara_id?: string;
  nama_klien: string;
  pihak_lawan: string;
  ada_konflik: boolean;
  detail_konflik?: string;
}

/**
 * Update Konflik DTO
 */
export interface UpdateKonflikDto {
  perkara_id?: string;
  nama_klien?: string;
  pihak_lawan?: string;
  ada_konflik?: boolean;
  detail_konflik?: string;
}
/**
 * Query Konflik DTO
 */
export interface QueryKonflikDto extends QueryFilters {
  ada_konflik?: boolean;
  perkara_id?: string;
}