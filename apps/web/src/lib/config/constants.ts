// ============================================================================
// FILE: lib/config/constants.ts - FINAL VERSION
// ============================================================================
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Law Firm Management";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ✅ ALL ROUTES USE /dashboard PREFIX
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",

  // Dashboard
  DASHBOARD: "/dashboard",

  // Klien
  KLIEN: "/dashboard/klien",
  KLIEN_NEW: "/dashboard/klien/baru",
  KLIEN_DETAIL: (id: string) => `/dashboard/klien/${id}`,
  KLIEN_EDIT: (id: string) => `/dashboard/klien/${id}/edit`,
  KLIEN_PROFILE: "/dashboard/klien/profile",

  // Perkara
  PERKARA: "/dashboard/perkara",
  PERKARA_NEW: "/dashboard/perkara/baru",
  PERKARA_DETAIL: (id: string) => `/dashboard/perkara/${id}`,
  PERKARA_EDIT: (id: string) => `/dashboard/perkara/${id}/edit`,

  // Tugas
  TUGAS: "/dashboard/tugas",
  TUGAS_NEW: "/dashboard/tugas/baru",
  TUGAS_DETAIL: (id: string) => `/dashboard/tugas/${id}`,
  TUGAS_EDIT: (id: string) => `/dashboard/tugas/${id}/edit`,

  // Dokumen
  DOKUMEN: "/dashboard/dokumen",
  DOKUMEN_UPLOAD: "/dashboard/dokumen/upload",
  DOKUMEN_DETAIL: (id: string) => `/dashboard/dokumen/${id}`,
  DOKUMEN_EDIT: (id: string) => `/dashboard/dokumen/${id}/edit`,

  // Sidang
  SIDANG: "/dashboard/sidang",
  SIDANG_NEW: "/dashboard/sidang/baru",
  SIDANG_DETAIL: (id: string) => `/dashboard/sidang/${id}`,

  // Konflik
  KONFLIK: "/dashboard/konflik",
  KONFLIK_NEW: "/dashboard/konflik/baru",

  // Tim
  TIM: "/dashboard/tim",
  TIM_DETAIL: (id: string) => `/dashboard/tim/${id}`,

  // Laporan
  LAPORAN: "/dashboard/laporan",
  LAPORAN_AKTIVITAS: "/dashboard/laporan/aktivitas",
  LAPORAN_KINERJA: "/dashboard/laporan/kinerja",

  // Pengaturan
  PENGATURAN: "/dashboard/pengaturan",
  PENGATURAN_AKUN: "/dashboard/pengaturan/akun",
  PENGATURAN_NOTIFIKASI: "/dashboard/pengaturan/notifikasi",

  // Referensi Hukum
  REFERENSI_HUKUM: "/referensi-hukum",
} as const;

export const EXTERNAL_DATA_API = `${API_URL}/external-data`;

export const STATUS_COLORS = {
  aktif: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  selesai: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  arsip: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  belum_mulai: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
  sedang_berjalan: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
} as const;

export const PRIORITY_COLORS = {
  rendah: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  sedang: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  tinggi: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  mendesak: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
} as const;