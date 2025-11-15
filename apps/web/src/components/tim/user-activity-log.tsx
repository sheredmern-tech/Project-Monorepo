// ============================================================================
// FILE 4: components/tim/user-activity-log.tsx - ✅ FIXED exhaustive-deps
// ============================================================================
"use client";

import { useEffect, useState, useCallback } from "react";
import { formatRelativeTime } from "@/lib/utils/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Briefcase,
  Calendar,
  UserPlus,
  Edit,
  Trash2,
  CheckSquare,
  Mail,
  Clock,
} from "lucide-react";
import { timApi, UserActivity } from "@/lib/api/tim.api";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

interface UserActivityLogProps {
  userId: string;
  userName: string;
  limit?: number;
}

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  perkara_created: Briefcase,
  perkara_updated: Edit,
  dokumen_uploaded: FileText,
  sidang_created: Calendar,
  tugas_completed: CheckSquare,
  email_sent: Mail,
  user_created: UserPlus,
  user_updated: Edit,
  user_deleted: Trash2,
  default: Clock,
};

const ACTIVITY_COLORS: Record<string, string> = {
  perkara_created: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
  perkara_updated: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
  dokumen_uploaded: "text-green-600 bg-green-100 dark:bg-green-900/20",
  sidang_created: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
  tugas_completed: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20",
  email_sent: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/20",
  user_created: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20",
  user_updated: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
  user_deleted: "text-red-600 bg-red-100 dark:bg-red-900/20",
};

export function UserActivityLog({ userId, userName, limit = 10 }: UserActivityLogProps) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // ✅ FIXED: useCallback to avoid exhaustive-deps warning
  const loadActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await timApi.getUserActivity(userId, { limit, page: 1 });
      setActivities(response.data);
      setTotal(response.meta.total);
    } catch {
      // Error silently handled
    } finally {
      setIsLoading(false);
    }
  }, [userId, limit]);

  // ✅ FIXED: Now loadActivities is stable
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const getActivityIcon = (type: string) => {
    const Icon = ACTIVITY_ICONS[type] || ACTIVITY_ICONS.default;
    return Icon;
  };

  const getActivityColor = (type: string) => {
    return ACTIVITY_COLORS[type] || "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
  };

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
        <div className="flex items-center justify-between">
          <CardTitle>Aktivitas Terbaru</CardTitle>
          {total > 0 && (
            <Badge variant="secondary">{total} aktivitas</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.activity_type);
                const colorClass = getActivityColor(activity.activity_type);

                return (
                  <div
                    key={activity.id}
                    className="flex gap-4 pb-4 border-b last:border-0"
                  >
                    <div
                      className={`flex-shrink-0 h-10 w-10 rounded-full ${colorClass} flex items-center justify-center`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <Badge
                              key={key}
                              variant="outline"
                              className="text-xs"
                            >
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Belum ada aktivitas dari {userName}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}