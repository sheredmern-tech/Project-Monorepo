// ============================================================================
// FILE: types/entities/perkara.ts
// ============================================================================

import { JenisPerkara, JenisSidang, KategoriDokumen, PrioritasTugas, StatusPerkara, StatusTugas } from "../enums";
import { BaseEntity } from "./base";
import { KlienBasic, KlienEntity } from "./klien";
import { UserBasic, UserPublic } from "./user";

/**
 * Perkara Entity - Complete data
 */
export interface PerkaraEntity extends BaseEntity {
  nomor_perkara: string;
  nomor_perkara_pengadilan: string | null;
  judul: string;
  deskripsi: string | null;
  klien_id: string | null;
  jenis_perkara: JenisPerkara;
  status: StatusPerkara;
  prioritas: PrioritasTugas;
  tingkat_pengadilan: string | null;
  nama_pengadilan: string | null;
  nomor_ruang_sidang: string | null;
  nama_hakim_ketua: string | null;
  nama_hakim_anggota_1: string | null;
  nama_hakim_anggota_2: string | null;
  nama_panitera: string | null;
  posisi_klien: string | null;
  pihak_lawan: string | null;
  kuasa_hukum_lawan: string | null;
  nilai_perkara: number | null;
  tanggal_register: string | null;
  tanggal_sidang_pertama: string | null;
  tanggal_sidang_berikutnya: string | null;
  batas_waktu_banding: string | null;
  batas_waktu_kasasi: string | null;
  nilai_fee: number | null;
  status_pembayaran: string | null;
  catatan: string | null;
  dibuat_oleh: string | null;
}

/**
 * Perkara Basic - For selection/display
 */
export interface PerkaraBasic {
  id: string;
  nomor_perkara: string;
  judul: string;
  jenis_perkara: JenisPerkara;
  status: StatusPerkara;
  created_at: string;
}

/**
 * Perkara with Klien
 */
export interface PerkaraWithKlien extends PerkaraEntity {
  klien: KlienBasic | null;
  _count: {
    tugas: number;
    dokumen: number;
    jadwal_sidang: number;
  };
}

/**
 * Perkara with Full Relations
 */
export interface PerkaraWithRelations extends PerkaraEntity {
  klien: KlienEntity | null;
  pembuat: UserPublic | null;
  tim_perkara: Array<{
    id: string;
    peran: string | null;
    tanggal_ditugaskan: string;
    user: UserPublic;
  }>;
  tugas: Array<{
    id: string;
    judul: string;
    status: StatusTugas;
    prioritas: PrioritasTugas;
    tenggat_waktu: string | null;
    created_at: string;
    petugas: UserBasic | null;
  }>;
  dokumen: Array<{
    id: string;
    nama_dokumen: string;
    kategori: KategoriDokumen;
    file_path: string;
    tanggal_upload: string;
  }>;
  jadwal_sidang: Array<{
    id: string;
    jenis_sidang: JenisSidang;
    tanggal_sidang: string;
    nama_pengadilan: string;
  }>;
  _count: {
    tugas: number;
    dokumen: number;
    jadwal_sidang: number;
    catatan_perkara: number;
  };
}

/**
 * Perkara Statistics
 */
export interface PerkaraStatistics {
  perkara_info: {
    nomor_perkara: string;
    judul: string;
    status: string;
  };
  statistik: {
    total_tugas: number;
    tugas_selesai: number;
    tugas_progress: string;
    total_dokumen: number;
    total_sidang: number;
  };
}