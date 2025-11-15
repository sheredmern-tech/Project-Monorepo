// ============================================================================
// FILE: lib/schemas/tugas.schema.ts
// ============================================================================
import { z } from "zod";
import { StatusTugas, PrioritasTugas } from "@/types";

export const tugasSchema = z.object({
  perkara_id: z.string().min(1, "Perkara wajib dipilih"),
  judul: z.string().min(1, "Judul tugas wajib diisi").min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().optional().or(z.literal("")),
  ditugaskan_ke: z.string().optional().or(z.literal("")),
  status: z.nativeEnum(StatusTugas),
  prioritas: z.nativeEnum(PrioritasTugas),
  tenggat_waktu: z.string().optional().or(z.literal("")),
  dapat_ditagih: z.boolean(),
  jam_kerja: z.number().optional().or(z.literal(0)),
  tarif_per_jam: z.number().optional().or(z.literal(0)),
});

export type TugasFormData = z.infer<typeof tugasSchema>;