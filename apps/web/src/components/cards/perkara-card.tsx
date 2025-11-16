// ============================================================================
// FILE: components/cards/perkara-card.tsx - NEW
// ============================================================================
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PerkaraWithKlien } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { formatDate } from "@/lib/utils/format";
import { Eye, User } from "lucide-react";

interface PerkaraCardProps {
  perkara: PerkaraWithKlien;
}

export function PerkaraCard({ perkara }: PerkaraCardProps) {
  const router = useRouter();

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/perkara/${perkara.id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{perkara.nomor_perkara}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{perkara.judul}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/perkara/${perkara.id}`);
          }}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={perkara.status} />
          <PriorityBadge priority={perkara.prioritas} />
          <Badge variant="outline" className="capitalize">
            {perkara.jenis_perkara.replace(/_/g, " ")}
          </Badge>
        </div>

        {perkara.klien && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{perkara.klien.nama}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-3 text-sm">
            <span className="text-muted-foreground">Tugas: <strong>{perkara._count.tugas}</strong></span>
            <span className="text-muted-foreground">Dokumen: <strong>{perkara._count.dokumen}</strong></span>
          </div>
          <span className="text-xs text-muted-foreground">{formatDate(perkara.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}