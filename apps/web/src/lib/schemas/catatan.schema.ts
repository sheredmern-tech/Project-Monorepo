// ============================================================================
// FILE: lib/schemas/catatan.schema.ts
// ============================================================================
import { z } from "zod";

export const catatanSchema = z.object({
  perkara_id: z.string().min(1, "Perkara wajib dipilih"),
  catatan: z.string().min(10, "Catatan minimal 10 karakter"),
  dapat_ditagih: z.boolean(),
  jam_kerja: z.number().positive("Jam kerja harus lebih dari 0").optional(),
});

export type CatatanFormData = z.infer<typeof catatanSchema>;

// Type for form with default values
export type CatatanFormInput = z.input<typeof catatanSchema>;