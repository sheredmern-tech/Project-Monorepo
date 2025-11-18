// ============================================================================
// FILE: app/dashboard/loading.tsx
// Purpose: Minimal loading boundary - only shows during route transition
// With Next.js Link prefetch, this is briefly visible (50-100ms)
// ============================================================================
import { TableSkeleton } from "@/components/shared/table-skeleton";

export default function DashboardLoading() {
  // Minimal skeleton - just table area
  // Header/filters will render immediately from page component (static)
  return (
    <div className="space-y-6">
      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}
