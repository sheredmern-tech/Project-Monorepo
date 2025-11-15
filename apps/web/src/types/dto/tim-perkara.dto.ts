// ============================================================================
// FILE: types/dto/tim-perkara.dto.ts
// ============================================================================

import { QueryFilters } from "../api";

/**
 * Create Tim Perkara DTO
 */
export interface CreateTimPerkaraDto {
  perkara_id: string;
  user_id: string;
  peran?: string;
}

/**
 * Update Tim Perkara DTO
 */
export interface UpdateTimPerkaraDto {
  peran?: string;
}

/**
 * Query Tim Perkara DTO
 */
export interface QueryTimPerkaraDto extends QueryFilters {
  perkara_id?: string;
  user_id?: string;
}