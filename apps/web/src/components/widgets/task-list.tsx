// ============================================================================
// FILE: components/widgets/task-list.tsx - CLEANED
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tugasApi } from "@/lib/api/tugas.api";
import { TugasWithRelations } from "@/types/entities/tugas";
import { StatusTugas } from "@/types/enums";
import { formatDate } from "@/lib/utils/format";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { CheckSquare } from "lucide-react";

export function TaskList() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TugasWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await tugasApi.getMyTugas({ 
          limit: 5, 
          status: StatusTugas.SEDANG_BERJALAN 
        });
        setTasks(response.data);
      } catch {
        // Error silently handled
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tugas Saya</CardTitle>
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
        <CardTitle>Tugas Saya</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                onClick={() => router.push(`/tugas/${task.id}`)}
              >
                <p className="font-medium text-sm">{task.judul}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {task.prioritas}
                  </Badge>
                  {task.tenggat_waktu && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(task.tenggat_waktu)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CheckSquare}
            title="Tidak ada tugas"
            description="Semua tugas sudah selesai"
          />
        )}
      </CardContent>
    </Card>
  );
}