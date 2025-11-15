// ============================================================================
// FILE: lib/schemas/klien.schema.ts
// ============================================================================
import { z } from "zod";

export const klienSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi").min(3, "Nama minimal 3 karakter"),
  // PERBAIKAN: Hapus .default() untuk menghindari type mismatch
  jenis_klien: z.string().optional(),
  nomor_identitas: z.string().optional(),
  npwp: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  telepon: z.string().optional(),
  telepon_alternatif: z.string().optional(),
  alamat: z.string().optional(),
  kelurahan: z.string().optional(),
  kecamatan: z.string().optional(),
  kota: z.string().optional(),
  provinsi: z.string().optional(),
  kode_pos: z.string().optional(),
  nama_perusahaan: z.string().optional(),
  bentuk_badan_usaha: z.string().optional(),
  nomor_akta: z.string().optional(),
  nama_kontak_darurat: z.string().optional(),
  telepon_kontak_darurat: z.string().optional(),
  catatan: z.string().optional(),
});

export type KlienFormData = z.infer<typeof klienSchema>;