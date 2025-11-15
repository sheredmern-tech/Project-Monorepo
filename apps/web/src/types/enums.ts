// ============================================================================
// FILE: types/enums.ts
// ============================================================================

/**
 * User Role Enum
 */
export enum UserRole {
  ADMIN = 'admin',
  ADVOKAT = 'advokat',
  PARALEGAL = 'paralegal',
  STAFF = 'staff',
  KLIEN = 'klien',
}

/**
 * Status Perkara Enum
 */
export enum StatusPerkara {
  AKTIF = 'aktif',
  PENDING = 'pending',
  SELESAI = 'selesai',
  ARSIP = 'arsip',
}

/**
 * Jenis Perkara Enum
 */
export enum JenisPerkara {
  PERDATA = 'perdata',
  PIDANA = 'pidana',
  KELUARGA = 'keluarga',
  PERUSAHAAN = 'perusahaan',
  PERTANAHAN = 'pertanahan',
  HKI = 'hki',
  KETENAGAKERJAAN = 'ketenagakerjaan',
  PAJAK = 'pajak',
  TATA_USAHA_NEGARA = 'tata_usaha_negara',
  NIAGA = 'niaga',
  LAINNYA = 'lainnya',
}

/**
 * Status Tugas Enum
 */
export enum StatusTugas {
  BELUM_MULAI = 'belum_mulai',
  SEDANG_BERJALAN = 'sedang_berjalan',
  SELESAI = 'selesai',
}

/**
 * Prioritas Tugas Enum
 */
export enum PrioritasTugas {
  RENDAH = 'rendah',
  SEDANG = 'sedang',
  TINGGI = 'tinggi',
  MENDESAK = 'mendesak',
}

/**
 * Kategori Dokumen Enum
 */
export enum KategoriDokumen {
  GUGATAN = 'gugatan',
  PERMOHONAN = 'permohonan',
  JAWABAN = 'jawaban',
  REPLIK = 'replik',
  DUPLIK = 'duplik',
  KESIMPULAN = 'kesimpulan',
  MEMORI_BANDING = 'memori_banding',
  KONTRA_MEMORI = 'kontra_memori',
  KASASI = 'kasasi',
  BUKTI = 'bukti',
  SURAT_KUASA = 'surat_kuasa',
  KONTRAK = 'kontrak',
  KORESPONDENSI = 'korespondensi',
  PUTUSAN = 'putusan',
  PENETAPAN = 'penetapan',
  BERITA_ACARA = 'berita_acara',
  INVOICE = 'invoice',
  LAINNYA = 'lainnya',
}

/**
 * Jenis Sidang Enum
 */
export enum JenisSidang {
  SIDANG_PERTAMA = 'sidang_pertama',
  SIDANG_MEDIASI = 'sidang_mediasi',
  SIDANG_PEMBUKTIAN = 'sidang_pembuktian',
  SIDANG_KESIMPULAN = 'sidang_kesimpulan',
  SIDANG_PUTUSAN = 'sidang_putusan',
  SIDANG_BANDING = 'sidang_banding',
  SIDANG_KASASI = 'sidang_kasasi',
  SIDANG_PK = 'sidang_pk',
  EKSEKUSI = 'eksekusi',
  LAINNYA = 'lainnya',
}