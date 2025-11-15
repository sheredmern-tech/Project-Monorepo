// ============================================================================
// FILE: components/shared/status-badge.tsx
// ============================================================================
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/lib/config/constants";
import { StatusPerkara, StatusTugas } from "@/types";

interface StatusBadgeProps {
  status: StatusPerkara | StatusTugas;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getLabel = (status: string) => {
    const labels: Record<string, string> = {
      aktif: "Aktif",
      pending: "Pending",
      selesai: "Selesai",
      arsip: "Arsip",
      belum_mulai: "Belum Mulai",
      sedang_berjalan: "Sedang Berjalan",
    };
    return labels[status] || status;
  };

  return (
    <Badge 
      variant="secondary" 
      className={STATUS_COLORS[status as keyof typeof STATUS_COLORS]}
    >
      {getLabel(status)}
    </Badge>
  );
}