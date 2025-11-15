// ============================================================================
// FILE: lib/schemas/perkara.schema.ts
// ============================================================================
import { z } from "zod";
import { JenisPerkara, StatusPerkara, PrioritasTugas } from "@/types";

export const perkaraSchema = z.object({
  nomor_perkara: z
    .string()
    .min(1, "Nomor perkara wajib diisi")
    .min(3, "Nomor perkara minimal 3 karakter"),
  nomor_perkara_pengadilan: z.string().optional().or(z.literal("")),
  judul: z.string().min(1, "Judul perkara wajib diisi").min(5, "Judul minimal 5 karakter"),
  deskripsi: z.string().optional().or(z.literal("")),
  klien_id: z.string().optional().or(z.literal("")),
  jenis_perkara: z.nativeEnum(JenisPerkara, {
    message: "Pilih jenis perkara",
  }),
  status: z.nativeEnum(StatusPerkara),
  prioritas: z.nativeEnum(PrioritasTugas),
  tingkat_pengadilan: z.string().optional().or(z.literal("")),
  nama_pengadilan: z.string().optional().or(z.literal("")),
  nomor_ruang_sidang: z.string().optional().or(z.literal("")),
  nama_hakim_ketua: z.string().optional().or(z.literal("")),
  posisi_klien: z.string().optional().or(z.literal("")),
  pihak_lawan: z.string().optional().or(z.literal("")),
  kuasa_hukum_lawan: z.string().optional().or(z.literal("")),
  nilai_perkara: z.number().optional().or(z.literal(0)),
  tanggal_register: z.string().optional().or(z.literal("")),
  tanggal_sidang_pertama: z.string().optional().or(z.literal("")),
  nilai_fee: z.number().optional().or(z.literal(0)),
  status_pembayaran: z.string().optional().or(z.literal("")),
  catatan: z.string().optional().or(z.literal("")),
});

export type PerkaraFormData = z.infer<typeof perkaraSchema>;