// ============================================================================
// FILE: lib/schemas/auth.schema.ts - PHASE 1: REMOVED ROLE FROM REGISTER
// ============================================================================
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(8, "Password minimal 8 karakter"),
});

// ✅ PHASE 1: Removed role from registerSchema
// Role will be hardcoded to "klien" in the register page
export const registerSchema = z.object({
  nama_lengkap: z
    .string()
    .min(1, "Nama lengkap wajib diisi")
    .min(3, "Nama minimal 3 karakter"),
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung huruf besar")
    .regex(/[a-z]/, "Password harus mengandung huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung angka"),
  confirmPassword: z
    .string()
    .min(1, "Konfirmasi password wajib diisi"),
  jabatan: z.string().optional(),
  telepon: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;