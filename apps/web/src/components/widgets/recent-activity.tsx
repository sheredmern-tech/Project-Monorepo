// ============================================================================
// FILE: components/widgets/recent-activity.tsx - CLEANED
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { logApi } from "@/lib/api/log.api";
import { LogAktivitasWithUser } from "@/types";
import { formatRelativeTime } from "@/lib/utils/format";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export function RecentActivity() {
  const [activities, setActivities] = useState<LogAktivitasWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await logApi.getAll({ limit: 10, sortBy: "created_at", sortOrder: "desc" });
        setActivities(response.data);
      } catch {
        // Error silently handled
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 pb-3 border-b last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{activity.aksi}</p>
                      {activity.jenis_entitas && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.jenis_entitas}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.user?.nama_lengkap || "System"} •{" "}
                      {formatRelativeTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada aktivitas
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}