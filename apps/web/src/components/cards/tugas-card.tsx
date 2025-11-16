// ============================================================================
// FILE: components/cards/tugas-card.tsx - NEW
// ============================================================================
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TugasWithRelations, StatusTugas } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import { Eye, Clock, AlertCircle } from "lucide-react";

interface TugasCardProps {
  tugas: TugasWithRelations;
  onComplete?: (id: string) => void;
}

export function TugasCard({ tugas }: TugasCardProps) {
  const router = useRouter();
  
  const isOverdue = tugas.tenggat_waktu && 
    new Date(tugas.tenggat_waktu) < new Date() && 
    tugas.status !== StatusTugas.SELESAI;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/tugas/${tugas.id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{tugas.judul}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {tugas.perkara.nomor_perkara}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/tugas/${tugas.id}`);
          }}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={tugas.status} />
          <PriorityBadge priority={tugas.prioritas} />
          {isOverdue && (
            <Badge variant="destructive">
              <AlertCircle className="mr-1 h-3 w-3" />
              Terlambat
            </Badge>
          )}
        </div>

        {tugas.petugas && (
          <div className="flex items-center gap-2">
            <UserAvatar user={tugas.petugas} className="h-6 w-6" />
            <span className="text-sm">{tugas.petugas.nama_lengkap}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          {tugas.tenggat_waktu ? (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className={isOverdue ? "text-red-500" : ""}>
                  {formatDate(tugas.tenggat_waktu)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(tugas.tenggat_waktu)}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Tidak ada tenggat</span>
          )}
          
          {tugas.dapat_ditagih && tugas.jam_kerja && (
            <Badge variant="outline">
              {tugas.jam_kerja}h
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}