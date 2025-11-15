// ============================================================================
// FILE: types/dto/perkara.dto.ts
// ============================================================================

import { QueryFilters } from "../api";
import { JenisPerkara, PrioritasTugas, StatusPerkara } from "../enums";

/**
 * Create Perkara DTO
 */
export interface CreatePerkaraDto {
  nomor_perkara: string;
  nomor_perkara_pengadilan?: string;
  judul: string;
  deskripsi?: string;
  klien_id?: string;
  jenis_perkara: JenisPerkara;
  status?: StatusPerkara;
  prioritas?: PrioritasTugas;
  tingkat_pengadilan?: string;
  nama_pengadilan?: string;
  nomor_ruang_sidang?: string;
  nama_hakim_ketua?: string;
  posisi_klien?: string;
  pihak_lawan?: string;
  kuasa_hukum_lawan?: string;
  nilai_perkara?: number;
  tanggal_register?: string;
  tanggal_sidang_pertama?: string;
  nilai_fee?: number;
  status_pembayaran?: string;
  catatan?: string;
}

/**
 * Update Perkara DTO
 */
export interface UpdatePerkaraDto {
  nomor_perkara?: string;
  nomor_perkara_pengadilan?: string;
  judul?: string;
  deskripsi?: string;
  klien_id?: string;
  jenis_perkara?: JenisPerkara;
  status?: StatusPerkara;
  prioritas?: PrioritasTugas;
  tingkat_pengadilan?: string;
  nama_pengadilan?: string;
  nomor_ruang_sidang?: string;
  nama_hakim_ketua?: string;
  posisi_klien?: string;
  pihak_lawan?: string;
  kuasa_hukum_lawan?: string;
  nilai_perkara?: number;
  tanggal_register?: string;
  tanggal_sidang_pertama?: string;
  nilai_fee?: number;
  status_pembayaran?: string;
  catatan?: string;
}
/**
 * Query Perkara DTO
 */
export interface QueryPerkaraDto extends QueryFilters {
  jenis_perkara?: JenisPerkara;
  status?: StatusPerkara;
  klien_id?: string;
  nama_pengadilan?: string;
}