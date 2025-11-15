// ============================================================================
// FILE: lib/schemas/konflik.schema.ts
// ============================================================================
import { z } from "zod";

export const konflikSchema = z.object({
  perkara_id: z.string().optional(),
  nama_klien: z.string().min(1, "Nama klien wajib diisi"),
  pihak_lawan: z.string().min(1, "Pihak lawan wajib diisi"),
  ada_konflik: z.boolean(),
  detail_konflik: z.string().optional(),
});

export type KonflikFormData = z.infer<typeof konflikSchema>;