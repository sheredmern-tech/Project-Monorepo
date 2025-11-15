// ============================================================================
// FILE: components/shared/priority-badge.tsx
// ============================================================================
import { Badge } from "@/components/ui/badge";
import { PRIORITY_COLORS } from "@/lib/config/constants";
import { PrioritasTugas } from "@/types";

interface PriorityBadgeProps {
  priority: PrioritasTugas;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getLabel = (priority: string) => {
    const labels: Record<string, string> = {
      rendah: "Rendah",
      sedang: "Sedang",
      tinggi: "Tinggi",
      mendesak: "Mendesak",
    };
    return labels[priority] || priority;
  };

  return (
    <Badge 
      variant="secondary" 
      className={PRIORITY_COLORS[priority]}
    >
      {getLabel(priority)}
    </Badge>
  );
}