// ============================================================================
// FILE: types/entities/tugas.ts
// ============================================================================

import { PrioritasTugas, StatusTugas } from "../enums";
import { BaseEntity } from "./base";
import { KlienBasic } from "./klien";
import { UserBasic } from "./user";

/**
 * Tugas Entity - Complete data
 */
export interface TugasEntity extends BaseEntity {
  perkara_id: string;
  judul: string;
  deskripsi: string | null;
  ditugaskan_ke: string | null;
  status: StatusTugas;
  prioritas: PrioritasTugas;
  tenggat_waktu: string | null;
  tanggal_selesai: string | null;
  dapat_ditagih: boolean;
  jam_kerja: number | null;
  tarif_per_jam: number | null;
  dibuat_oleh: string | null;
}

/**
 * Tugas with Relations
 */
export interface TugasWithRelations extends TugasEntity {
  perkara: {
    id: string;
    nomor_perkara: string;
    judul: string;
    klien: KlienBasic | null;
  };
  petugas: UserBasic | null;
  pembuat: UserBasic | null;
}