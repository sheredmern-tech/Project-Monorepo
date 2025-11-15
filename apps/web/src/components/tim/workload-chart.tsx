// ============================================================================
// FILE: components/tim/workload-chart.tsx - CLEANED
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { timApi } from "@/lib/api/tim.api";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

interface WorkloadData {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  active_perkara: number;
  pending_tugas: number;
  workload_score: number;
}

export function WorkloadChart() {
  const [workloadData, setWorkloadData] = useState<WorkloadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkloadData();
  }, []);

  const loadWorkloadData = async () => {
    try {
      setIsLoading(true);
      const data = await timApi.getWorkloadDistribution();
      setWorkloadData(data as unknown as WorkloadData[]);
    } catch {
      // Error silently handled
    } finally {
      setIsLoading(false);
    }
  };

  const getWorkloadColor = (score: number) => {
    if (score >= 80) return "text-red-600 bg-red-100 dark:bg-red-900/20";
    if (score >= 60) return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
    if (score >= 40) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
    return "text-green-600 bg-green-100 dark:bg-green-900/20";
  };

  const getWorkloadLabel = (score: number) => {
    if (score >= 80) return "Sangat Tinggi";
    if (score >= 60) return "Tinggi";
    if (score >= 40) return "Sedang";
    return "Rendah";
  };

  const getWorkloadIcon = (score: number) => {
    if (score >= 60) return TrendingUp;
    if (score >= 40) return Minus;
    return TrendingDown;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Workload Tim</CardTitle>
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
        <CardTitle>Distribusi Workload Tim</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {workloadData.map((member) => {
            const Icon = getWorkloadIcon(member.workload_score);
            const colorClass = getWorkloadColor(member.workload_score);
            const initials = member.user_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <div key={member.user_id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user_avatar} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{member.active_perkara} perkara</span>
                        <span>•</span>
                        <span>{member.pending_tugas} tugas</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={colorClass}>
                      <Icon className="h-3 w-3 mr-1" />
                      {getWorkloadLabel(member.workload_score)}
                    </Badge>
                    <span className="text-sm font-medium">
                      {member.workload_score}%
                    </span>
                  </div>
                </div>
                
                <Progress value={member.workload_score} className="h-2" />
              </div>
            );
          })}
          
          {workloadData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Tidak ada data workload tersedia
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}