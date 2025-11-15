// ============================================================================
// FILE: lib/utils/date.ts
// ============================================================================
import { format, formatDistanceToNow, parseISO, isValid, startOfDay } from "date-fns";
import { id } from "date-fns/locale";

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