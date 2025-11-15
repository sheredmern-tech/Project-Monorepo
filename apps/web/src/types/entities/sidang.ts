// ============================================================================
// FILE: types/entities/sidang.ts
// ============================================================================

import { JenisSidang } from "../enums";
import { BaseEntity } from "./base";
import { KlienBasic } from "./klien";
import { UserBasic } from "./user";

/**
 * Jadwal Sidang Entity - Complete data
 */
export interface JadwalSidangEntity extends BaseEntity {
  perkara_id: string;
  jenis_sidang: JenisSidang;
  tanggal_sidang: string;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
  nama_pengadilan: string;
  nomor_ruang_sidang: string | null;
  nama_hakim: string | null;
  lokasi_lengkap: string | null;
  agenda_sidang: string | null;
  hasil_sidang: string | null;
  putusan: string | null;
  catatan: string | null;
  dibuat_oleh: string | null;
}

/**
 * Jadwal Sidang with Relations
 */
export interface JadwalSidangWithRelations extends JadwalSidangEntity {
  perkara: {
    id: string;
    nomor_perkara: string;
    judul: string;
    klien: KlienBasic | null;
  };
  pembuat: UserBasic | null;
}