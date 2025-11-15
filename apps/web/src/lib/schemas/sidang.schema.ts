// ============================================================================
// FILE: lib/schemas/sidang.schema.ts
// ============================================================================
import { z } from "zod";
import { JenisSidang } from "@/types";

export const sidangSchema = z.object({
  perkara_id: z.string().min(1, "Perkara wajib dipilih"),
  jenis_sidang: z.nativeEnum(JenisSidang),
  tanggal_sidang: z.string().min(1, "Tanggal sidang wajib diisi"),
  waktu_mulai: z.string().optional(),
  waktu_selesai: z.string().optional(),
  nama_pengadilan: z.string().min(1, "Nama pengadilan wajib diisi"),
  nomor_ruang_sidang: z.string().optional(),
  nama_hakim: z.string().optional(),
  lokasi_lengkap: z.string().optional(),
  agenda_sidang: z.string().optional(),
  hasil_sidang: z.string().optional(),
  putusan: z.string().optional(),
  catatan: z.string().optional(),
});

export type SidangFormData = z.infer<typeof sidangSchema>;