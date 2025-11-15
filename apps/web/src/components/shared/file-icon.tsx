// ============================================================================
// FILE: components/shared/file-icon.tsx
// ============================================================================
import { FileText, Image, File, FileSpreadsheet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FileIconProps {
  mimeType: string | null;
  className?: string;
}

export function FileIcon({ mimeType, className }: FileIconProps) {
  const getIcon = (): LucideIcon => {
    if (!mimeType) return FileText;
    
    if (mimeType.startsWith("image/")) return Image;
    if (mimeType.includes("pdf")) return FileText;
    if (mimeType.includes("word") || mimeType.includes("document")) return FileText;
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return FileSpreadsheet;
    
    return File;
  };

  const Icon = getIcon() as LucideIcon;

  return <Icon className={cn("h-4 w-4", className)} />;
}