// ============================================================================
// FILE: app/dashboard/page.tsx - REFACTORED (NO ROLE CHECKS)
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, CheckSquare, Calendar, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { perkaraApi } from "@/lib/api/perkara.api";
import { klienApi } from "@/lib/api/klien.api";
import { tugasApi } from "@/lib/api/tugas.api";
import { sidangApi } from "@/lib/api/sidang.api";
import { useAuthStore } from "@/lib/stores/auth.store";
import { StatusPerkara, StatusTugas, PerkaraWithKlien, TugasWithRelations } from "@/types";
import { formatDate } from "@/lib/utils/format";

// ============================================================================
// LOADING COMPONENT
// ============================================================================
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================
interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

function StatsCard({ title, value, description, icon, isLoading, onClick, variant = 'default' }: StatsCardProps) {
  const variantStyles = {
    default: 'hover:shadow-md',
    primary: 'border-primary/20 bg-primary/5 hover:shadow-md',
    success: 'border-green-500/20 bg-green-50 dark:bg-green-950 hover:shadow-md',
    warning: 'border-orange-500/20 bg-orange-50 dark:bg-orange-950 hover:shadow-md',
  };

  return (
    <Card 
      className={`transition-all ${onClick ? 'cursor-pointer' : ''} ${variantStyles[variant]}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================
export default function DashboardHomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // State Management
  const [stats, setStats] = useState({
    totalPerkara: 0,
    totalKlien: 0,
    tugasAktif: 0,
    sidangMingguIni: 0,
  });
  
  const [recentPerkara, setRecentPerkara] = useState<PerkaraWithKlien[]>([]);
  const [myTugas, setMyTugas] = useState<TugasWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // FETCH DASHBOARD DATA
  // ============================================================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // ✅ FETCH ALL DATA (sama untuk semua role)
        const [perkaraRes, klienRes, tugasRes, sidangRes] = await Promise.allSettled([
          perkaraApi.getAll({ limit: 5, status: StatusPerkara.AKTIF }),
          klienApi.getAll({ limit: 1 }),
          tugasApi.getMyTugas({ limit: 5, status: StatusTugas.SEDANG_BERJALAN }),
          sidangApi.getAll({ limit: 5 }),
        ]);

        setStats({
          totalPerkara: perkaraRes.status === 'fulfilled' ? perkaraRes.value.meta.total : 0,
          totalKlien: klienRes.status === 'fulfilled' ? klienRes.value.meta.total : 0,
          tugasAktif: tugasRes.status === 'fulfilled' ? tugasRes.value.meta.total : 0,
          sidangMingguIni: sidangRes.status === 'fulfilled' ? sidangRes.value.meta.total : 0,
        });

        // Set recent data
        if (perkaraRes.status === 'fulfilled') {
          setRecentPerkara(perkaraRes.value.data.slice(0, 3));
        }
        if (tugasRes.status === 'fulfilled') {
          setMyTugas(tugasRes.value.data.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Gagal memuat data dashboard. Silakan refresh halaman.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title={`Dashboard - ${user?.nama_lengkap || 'User'}`}
        description="Ringkasan aktivitas firma hukum"
      />

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{error}</p>
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 text-destructive"
              onClick={() => window.location.reload()}
            >
              Refresh halaman
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* STATS GRID */}
      {/* ============================================================================ */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Perkara"
          value={stats.totalPerkara}
          description="Perkara aktif"
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
          variant="primary"
          onClick={() => router.push("/dashboard/perkara")}
        />

        <StatsCard
          title="Total Klien"
          value={stats.totalKlien}
          description="Klien terdaftar"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          onClick={() => router.push("/dashboard/klien")}
        />

        <StatsCard
          title="Tugas Aktif"
          value={stats.tugasAktif}
          description="Tugas menunggu"
          icon={<CheckSquare className="h-4 w-4 text-muted-foreground" />}
          variant="warning"
          onClick={() => router.push("/dashboard/tugas")}
        />

        <StatsCard
          title="Sidang Bulan Ini"
          value={stats.sidangMingguIni}
          description="Jadwal sidang"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          variant="success"
          onClick={() => router.push("/dashboard/sidang")}
        />
      </div>

      {/* ============================================================================ */}
      {/* CONTENT GRID */}
      {/* ============================================================================ */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* RECENT PERKARA */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Perkara Terbaru</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push("/dashboard/perkara")}
              >
                Lihat Semua
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentPerkara.length > 0 ? (
              <div className="space-y-3">
                {recentPerkara.map((perkara) => (
                  <div
                    key={perkara.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => router.push(`/dashboard/perkara/${perkara.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{perkara.nomor_perkara}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {perkara.judul}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {perkara.jenis_perkara.replace(/_/g, " ")}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {perkara.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">Belum ada perkara aktif</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => router.push("/dashboard/perkara/baru")}
                >
                  Tambah Perkara
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* MY TASKS */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tugas Saya</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push("/dashboard/tugas")}
              >
                Lihat Semua
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {myTugas.length > 0 ? (
              <div className="space-y-3">
                {myTugas.map((tugas) => (
                  <div
                    key={tugas.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => router.push(`/dashboard/tugas/${tugas.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{tugas.judul}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tugas.perkara?.nomor_perkara || "-"}
                        </p>
                      </div>
                      {tugas.tenggat_waktu && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(tugas.tenggat_waktu)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {tugas.status.replace(/_/g, " ")}
                      </Badge>
                      <Badge 
                        variant={
                          tugas.prioritas === "mendesak" 
                            ? "destructive" 
                            : tugas.prioritas === "tinggi"
                            ? "default"
                            : "outline"
                        }
                        className="text-xs capitalize"
                      >
                        {tugas.prioritas}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">Belum ada tugas aktif</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}