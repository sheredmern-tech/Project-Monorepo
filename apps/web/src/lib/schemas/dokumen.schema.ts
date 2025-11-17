// ============================================================================
// FILE: lib/schemas/dokumen.schema.ts
// ============================================================================
import { z } from "zod";
import { KategoriDokumen } from "@/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

export const dokumenSchema = z.object({
  perkara_id: z.string().min(1, "Perkara wajib dipilih"),
  nama_dokumen: z.string().min(1, "Nama dokumen wajib diisi"),
  kategori: z.nativeEnum(KategoriDokumen, {
    message: "Pilih kategori dokumen",
  }),
  nomor_bukti: z.string().optional().or(z.literal("")),
  tanggal_dokumen: z.string().optional().or(z.literal("")),
  catatan: z.string().optional().or(z.literal("")),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "Ukuran file maksimal 10MB")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Format file tidak didukung. Gunakan PDF, Word, atau gambar"
    )
    .optional(),
});

export type DokumenFormData = z.infer<typeof dokumenSchema>;