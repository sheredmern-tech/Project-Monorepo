// ============================================================================
// FILE: types/dto/klien.dto.ts
// ============================================================================

import { QueryFilters } from "../api";

/**
 * Create Klien DTO
 */
export interface CreateKlienDto {
  nama: string;
  jenis_klien?: string;
  nomor_identitas?: string;
  npwp?: string;
  email?: string;
  telepon?: string;
  telepon_alternatif?: string;
  alamat?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  kode_pos?: string;
  nama_perusahaan?: string;
  bentuk_badan_usaha?: string;
  nomor_akta?: string;
  nama_kontak_darurat?: string;
  telepon_kontak_darurat?: string;
  catatan?: string;
}

/**
 * Update Klien DTO
 */
export interface UpdateKlienDto {
  nama?: string;
  jenis_klien?: string;
  nomor_identitas?: string;
  npwp?: string;
  email?: string;
  telepon?: string;
  telepon_alternatif?: string;
  alamat?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  kode_pos?: string;
  nama_perusahaan?: string;
  bentuk_badan_usaha?: string;
  nomor_akta?: string;
  nama_kontak_darurat?: string;
  telepon_kontak_darurat?: string;
  catatan?: string;
}
/**
 * Query Klien DTO
 */
export interface QueryKlienDto extends QueryFilters {
  jenis_klien?: string;
  kota?: string;
}