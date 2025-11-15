// ============================================================================
// FILE: types/dto/log-aktivitas.dto.ts
// ============================================================================

import { DateRangeFilter, QueryFilters } from "../api";

/**
 * Query Log Aktivitas DTO
 */
export interface QueryLogAktivitasDto extends QueryFilters, DateRangeFilter {
  aksi?: string;
  jenis_entitas?: string;
  user_id?: string;
}