// ============================================================================
// FILE: lib/utils/date.ts
// ============================================================================
import { format, formatDistanceToNow, parseISO, isValid, startOfDay } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Parse date string in LOCAL timezone (not UTC) to avoid off-by-one errors
 *
 * ❌ PROBLEM: parseISO("2025-01-18") creates Date at UTC midnight
 *    In Indonesia (UTC+7), this displays as Jan 17, 23:00
 *
 * ✅ SOLUTION: Parse as local date without timezone conversion
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object at local midnight, or undefined if invalid
 */
export function parseDateLocal(dateString: string): Date | undefined {
  if (!dateString || dateString === "") return undefined;

  // Parse YYYY-MM-DD manually to avoid timezone issues
  const parts = dateString.split("-");
  if (parts.length !== 3) return undefined;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;

  // Create Date at LOCAL midnight, not UTC
  const date = new Date(year, month, day);

  return isValid(date) ? date : undefined;
}

export function formatDate(date: string | Date | null | undefined, formatStr = "dd MMMM yyyy"): string {
  if (!date) return "-";
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "-";
  return format(parsedDate, formatStr, { locale: id });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "-";
  return format(parsedDate, "dd MMM yyyy, HH:mm", { locale: id });
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "-";
  return formatDistanceToNow(parsedDate, { locale: id, addSuffix: true });
}

export function formatTime(time: string): string {
  if (!time) return "-";
  return time.substring(0, 5); // HH:mm
}

export function isToday(date: string | Date): boolean {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  const today = startOfDay(new Date());
  const compareDate = startOfDay(parsedDate);
  return compareDate.getTime() === today.getTime();
}

export function isFuture(date: string | Date): boolean {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return parsedDate > new Date();
}

export function isPast(date: string | Date): boolean {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return parsedDate < new Date();
}