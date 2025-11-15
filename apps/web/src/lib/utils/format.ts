// ============================================================================
// FILE: lib/utils/format.ts
// ============================================================================
import { format as dateFnsFormat, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: string | Date, formatStr = "dd MMMM yyyy"): string {
  if (!date) return "-";
  return dateFnsFormat(new Date(date), formatStr, { locale: id });
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  if (!date) return "-";
  return dateFnsFormat(new Date(date), "dd MMM yyyy, HH:mm", { locale: id });
}

/**
 * Format relative time (e.g., "2 jam yang lalu")
 */
export function formatRelativeTime(date: string | Date): string {
  if (!date) return "-";
  return formatDistanceToNow(new Date(date), { locale: id, addSuffix: true });
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}