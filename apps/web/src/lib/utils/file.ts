// ============================================================================
// FILE: lib/utils/file.ts
// ============================================================================
import { FileText, Image, File } from "lucide-react";

/**
 * Get file icon based on file type
 */
export function getFileIcon(mimeType: string | null) {
  if (!mimeType) return FileText;

  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.includes("pdf")) return FileText;
  if (mimeType.includes("word") || mimeType.includes("document")) return FileText;

  return File;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toUpperCase() || "";
}

/**
 * Check if file is previewable
 */
export function isPreviewable(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return mimeType.includes("pdf") || mimeType.startsWith("image/");
}