// ============================================================================
// FILE: types/dto/dokumen.dto.ts
// ============================================================================

import { QueryFilters } from "../api";
import { KategoriDokumen } from "../enums";

/**
 * Create Dokumen DTO
 */
export interface CreateDokumenDto {
  perkara_id: string;
  nama_dokumen: string;
  kategori: KategoriDokumen;
  nomor_bukti?: string;
  file_path: string;
  ukuran_file?: number;
  tipe_file?: string;
  versi?: number;
  adalah_rahasia?: boolean;
  tanggal_dokumen?: string;
  catatan?: string;
}

/**
 * Update Dokumen DTO
 */
export interface UpdateDokumenDto {
  nama_dokumen?: string;
  kategori?: KategoriDokumen;
  nomor_bukti?: string;
  tanggal_dokumen?: string;
  adalah_rahasia?: boolean;
  catatan?: string;
}
/**
 * Query Dokumen DTO
 */
export interface QueryDokumenDto extends QueryFilters {
  kategori?: KategoriDokumen;
  perkara_id?: string;
}