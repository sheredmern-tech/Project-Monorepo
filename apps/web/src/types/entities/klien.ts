// ============================================================================
// FILE: types/entities/klien.ts
// ============================================================================

import { JenisPerkara, StatusPerkara } from "../enums";
import { BaseEntity } from "./base";

/**
 * Klien Entity - Complete data
 */
export interface KlienEntity extends BaseEntity {
  nama: string;
  jenis_klien: string;
  nomor_identitas: string | null;
  npwp: string | null;
  email: string | null;
  telepon: string | null;
  telepon_alternatif: string | null;
  alamat: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  kota: string | null;
  provinsi: string | null;
  kode_pos: string | null;
  nama_perusahaan: string | null;
  bentuk_badan_usaha: string | null;
  nomor_akta: string | null;
  nama_kontak_darurat: string | null;
  telepon_kontak_darurat: string | null;
  catatan: string | null;
  dibuat_oleh: string | null;
}

/**
 * Klien Basic - For selection/display
 */
export interface KlienBasic {
  id: string;
  nama: string;
  email: string | null;
  telepon: string | null;
  jenis_klien: string;
}

/**
 * Klien with Count
 */
export interface KlienWithCount extends KlienEntity {
  _count: {
    perkara: number;
  };
}

/**
 * Klien with Perkara List
 */
export interface KlienWithPerkara extends KlienEntity {
  perkara: Array<{
    id: string;
    nomor_perkara: string;
    judul: string;
    jenis_perkara: JenisPerkara;
    status: StatusPerkara;
    created_at: string;
  }>;
  _count: {
    perkara: number;
  };
}