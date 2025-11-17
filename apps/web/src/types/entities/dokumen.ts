// ============================================================================
// FILE: types/entities/dokumen.ts
// ============================================================================

import { KategoriDokumen } from "../enums";
import { KlienBasic } from "./klien";
import { UserBasic } from "./user";

/**
 * Dokumen Entity - Complete data
 */
export interface DokumenEntity {
  id: string;
  perkara_id: string;
  nama_dokumen: string;
  kategori: KategoriDokumen;
  nomor_bukti: string | null;
  file_path: string | null; // ✅ Nullable - legacy local files
  google_drive_id: string | null; // ✅ Google Drive file ID
  google_drive_link: string | null; // ✅ Google Drive shareable link
  embed_link: string | null; // ✅ Google Drive embed preview link
  ukuran_file: number | null;
  tipe_file: string | null;
  versi: number;
  diunggah_oleh: string | null;
  tanggal_dokumen: string | null;
  tanggal_upload: string;
  catatan: string | null;
}

/**
 * Dokumen with Relations
 */
export interface DokumenWithRelations extends DokumenEntity {
  perkara: {
    id: string;
    nomor_perkara: string;
    judul: string;
    klien: KlienBasic | null;
  };
  pengunggah: UserBasic | null;
}