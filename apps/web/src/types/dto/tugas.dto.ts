// ============================================================================
// FILE: types/dto/tugas.dto.ts
// ============================================================================

import { QueryFilters } from "../api";
import { PrioritasTugas, StatusTugas } from "../enums";

/**
 * Create Tugas DTO
 */
export interface CreateTugasDto {
  perkara_id: string;
  judul: string;
  deskripsi?: string;
  ditugaskan_ke?: string;
  status?: StatusTugas;
  prioritas?: PrioritasTugas;
  tenggat_waktu?: string;
  dapat_ditagih?: boolean;
  jam_kerja?: number;
  tarif_per_jam?: number;
}

/**
 * Update Tugas DTO
 */
export interface UpdateTugasDto extends Partial<CreateTugasDto> {
  tanggal_selesai?: string;
}

/**
 * Query Tugas DTO
 */
export interface QueryTugasDto extends QueryFilters {
  status?: StatusTugas;
  prioritas?: PrioritasTugas;
  perkara_id?: string;
  ditugaskan_ke?: string;
}