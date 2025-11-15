// ============================================================================
// FILE 2: components/shared/table-skeleton.tsx - NEW
// ============================================================================
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <Card>
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-10 flex-1" />
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-16 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}