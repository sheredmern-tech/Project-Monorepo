// ============================================================================
// FILE: types/dto/sidang.dto.ts
// ============================================================================

import { DateRangeFilter, QueryFilters } from "../api";
import { JenisSidang } from "../enums";

/**
 * Create Jadwal Sidang DTO
 */
export interface CreateJadwalSidangDto {
  perkara_id: string;
  jenis_sidang: JenisSidang;
  tanggal_sidang: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
  nama_pengadilan: string;
  nomor_ruang_sidang?: string;
  nama_hakim?: string;
  lokasi_lengkap?: string;
  agenda_sidang?: string;
  hasil_sidang?: string;
  putusan?: string;
  catatan?: string;
}

/**
 * Update Jadwal Sidang DTO
 */
export type UpdateJadwalSidangDto = Partial<Omit<CreateJadwalSidangDto, 'perkara_id'>>;

/**
 * Query Jadwal Sidang DTO
 */
export interface QueryJadwalSidangDto extends QueryFilters, DateRangeFilter {
  jenis_sidang?: JenisSidang;
  perkara_id?: string;
}

/**
 * Type alias untuk konsistensi dengan server
 */
export type QuerySidangDto = QueryJadwalSidangDto;