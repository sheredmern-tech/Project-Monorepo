// ============================================================================
// FILE: types/entities/konflik.ts
// ============================================================================

import { PerkaraBasic } from "./perkara";
import { UserBasic } from "./user";

/**
 * Pemeriksaan Konflik Entity - Complete data
 */
export interface PemeriksaanKonflikEntity {
  id: string;
  perkara_id: string | null;
  nama_klien: string;
  pihak_lawan: string;
  diperiksa_oleh: string | null;
  ada_konflik: boolean;
  detail_konflik: string | null;
  tanggal_periksa: string;
}

/**
 * Konflik with Relations
 */
export interface KonflikWithRelations extends PemeriksaanKonflikEntity {
  perkara: PerkaraBasic | null;
  pemeriksa: UserBasic | null;
}