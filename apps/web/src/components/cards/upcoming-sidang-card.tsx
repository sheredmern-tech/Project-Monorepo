// ============================================================================
// FILE: components/cards/upcoming-sidang-card.tsx - CLEANED
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sidangApi } from "@/lib/api/sidang.api";
import { JadwalSidangWithRelations } from "@/types";
import { formatDate, formatTime } from "@/lib/utils/date";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { Calendar, Clock, MapPin } from "lucide-react";

export function UpcomingSidangCard() {
  const router = useRouter();
  const [sidang, setSidang] = useState<JadwalSidangWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingSidang = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await sidangApi.getAll({ 
          limit: 5,
          sortBy: "tanggal_sidang",
          sortOrder: "asc",
        });
        
        const upcoming = response.data.filter(s => s.tanggal_sidang >= today);
        setSidang(upcoming);
      } catch {
        // Error silently handled
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingSidang();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sidang Mendatang</CardTitle>
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
        <CardTitle>Sidang Mendatang</CardTitle>
      </CardHeader>
      <CardContent>
        {sidang.length > 0 ? (
          <div className="space-y-3">
            {sidang.map((item) => {
              const isToday = item.tanggal_sidang === new Date().toISOString().split('T')[0];
              
              return (
                <div
                  key={item.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => router.push(`/sidang/${item.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.perkara.nomor_perkara}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.perkara.judul}
                      </p>
                    </div>
                    {isToday && (
                      <Badge variant="destructive" className="text-xs">
                        Hari Ini
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDate(item.tanggal_sidang)}</span>
                      {item.waktu_mulai && (
                        <>
                          <Clock className="h-3 w-3 text-muted-foreground ml-2" />
                          <span>{formatTime(item.waktu_mulai)}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="line-clamp-1">{item.nama_pengadilan}</span>
                    </div>

                    <Badge variant="outline" className="capitalize text-xs">
                      {item.jenis_sidang.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="Tidak ada sidang"
            description="Belum ada jadwal sidang mendatang"
          />
        )}
      </CardContent>
    </Card>
  );
}