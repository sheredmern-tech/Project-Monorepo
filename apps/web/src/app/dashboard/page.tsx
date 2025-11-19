// ============================================================================
// FILE: app/dashboard/page.tsx - ROLE-AWARE DASHBOARD
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase, Users, CheckSquare, Calendar, ArrowRight, Clock,
  AlertCircle, FileText, Gavel, FolderOpen, UserCheck
} from "lucide-react";
import { perkaraApi } from "@/lib/api/perkara.api";
import { klienApi } from "@/lib/api/klien.api";
import { tugasApi } from "@/lib/api/tugas.api";
import { sidangApi } from "@/lib/api/sidang.api";
import { dokumenApi } from "@/lib/api/dokumen.api";
import { useAuthStore } from "@/lib/stores/auth.store";
import { StatusPerkara, StatusTugas, PerkaraWithKlien, TugasWithRelations, UserRole } from "@/types";
import { formatDate } from "@/lib/utils/format";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { usePermission } from "@/lib/hooks/use-permission";

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
// MAIN DASHBOARD COMPONENT - ROLE AWARE
// ============================================================================
export default function DashboardHomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const permissions = usePermission();

  // State Management
  const [stats, setStats] = useState({
    totalPerkara: 0,
    totalKlien: 0,
    tugasAktif: 0,
    sidangMingguIni: 0,
    totalDokumen: 0,
    tugasSaya: 0,
  });

  const [recentPerkara, setRecentPerkara] = useState<PerkaraWithKlien[]>([]);
  const [myTugas, setMyTugas] = useState<TugasWithRelations[]>([]);
  const [recentDokumen, setRecentDokumen] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // FETCH DASHBOARD DATA BASED ON ROLE
  // ============================================================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch based on role permissions
        const promises: Promise<any>[] = [];
        const promiseTypes: string[] = [];

        // TUGAS - Everyone can see their tasks
        promises.push(tugasApi.getMyTugas({ limit: 5, status: StatusTugas.SEDANG_BERJALAN }));
        promiseTypes.push('tugas');

        // SIDANG - Everyone can view
        if (permissions.sidang.read) {
          promises.push(sidangApi.getAll({ limit: 5 }));
          promiseTypes.push('sidang');
        }

        // KLIEN - Only if can read
        if (permissions.klien.read) {
          promises.push(klienApi.getAll({ limit: 1 }));
          promiseTypes.push('klien');
        }

        // PERKARA - Only if can read AND not STAFF
        if (permissions.perkara.read && user.role !== UserRole.STAFF) {
          promises.push(perkaraApi.getAll({ limit: 5, status: StatusPerkara.AKTIF }));
          promiseTypes.push('perkara');
        }

        // DOKUMEN - For STAFF, important metric
        if (permissions.dokumen.read) {
          promises.push(dokumenApi.getAll({ limit: 5 }));
          promiseTypes.push('dokumen');
        }

        const results = await Promise.allSettled(promises);

        // Process results based on what was fetched
        const newStats: any = { ...stats };

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const type = promiseTypes[index];
            switch (type) {
              case 'tugas':
                newStats.tugasAktif = result.value.meta.total;
                newStats.tugasSaya = result.value.data.filter((t: any) =>
                  t.ditugaskan_ke === user.id
                ).length;
                setMyTugas(result.value.data.slice(0, 3));
                break;
              case 'sidang':
                newStats.sidangMingguIni = result.value.meta.total;
                break;
              case 'klien':
                newStats.totalKlien = result.value.meta.total;
                break;
              case 'perkara':
                newStats.totalPerkara = result.value.meta.total;
                setRecentPerkara(result.value.data.slice(0, 3));
                break;
              case 'dokumen':
                newStats.totalDokumen = result.value.meta.total;
                setRecentDokumen(result.value.data.slice(0, 3));
                break;
            }
          }
        });

        setStats(newStats);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Gagal memuat data dashboard. Silakan refresh halaman.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, permissions]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // ============================================================================
  // RENDER BASED ON ROLE
  // ============================================================================

  // Get role display name
  const getRoleDisplayName = (role: UserRole) => {
    const roleNames: Record<UserRole, string> = {
      [UserRole.ADMIN]: "Administrator",
      [UserRole.PARTNER]: "Partner",
      [UserRole.ADVOKAT]: "Advokat",
      [UserRole.PARALEGAL]: "Paralegal",
      [UserRole.STAFF]: "Staff",
      [UserRole.KLIEN]: "Klien"
    };
    return roleNames[role] || role;
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title={`Selamat Datang, ${user?.nama_lengkap || 'User'}`}
        description={`Dashboard ${getRoleDisplayName(user?.role || UserRole.STAFF)} - Ringkasan aktivitas firma hukum`}
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
      {/* ROLE-BASED STATS GRID */}
      {/* ============================================================================ */}

      {/* STAFF DASHBOARD - Focus on tasks and documents */}
      {user?.role === UserRole.STAFF && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Tugas Saya"
              value={stats.tugasSaya}
              description="Ditugaskan ke saya"
              icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
              variant="primary"
              onClick={() => router.push("/dashboard/tugas")}
            />

            <StatsCard
              title="Dokumen"
              value={stats.totalDokumen}
              description="Total dokumen"
              icon={<FileText className="h-4 w-4 text-muted-foreground" />}
              variant="success"
              onClick={() => router.push("/dashboard/dokumen")}
            />

            <StatsCard
              title="Jadwal Sidang"
              value={stats.sidangMingguIni}
              description="Bulan ini"
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              onClick={() => router.push("/dashboard/sidang")}
            />

            <StatsCard
              title="Total Klien"
              value={stats.totalKlien}
              description="Klien terdaftar"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              onClick={() => router.push("/dashboard/klien")}
            />
          </div>

          {/* Content for STAFF - Tasks and Documents */}
          <div className="grid gap-4 md:grid-cols-2">
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
                    <p className="text-sm text-muted-foreground">Belum ada tugas untuk Anda</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* RECENT DOCUMENTS */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Dokumen Terbaru</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/dashboard/dokumen")}
                  >
                    Lihat Semua
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentDokumen.length > 0 ? (
                  <div className="space-y-3">
                    {recentDokumen.map((dok) => (
                      <div
                        key={dok.id}
                        className="p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <p className="font-medium text-sm truncate">{dok.nama_dokumen}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {dok.kategori}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(dok.tanggal_upload)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">Belum ada dokumen</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => router.push("/dashboard/dokumen/upload")}
                    >
                      Upload Dokumen
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* OTHER ROLES - Show full dashboard */}
      {user?.role !== UserRole.STAFF && (
        <>
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

          {/* Content Grid for NON-STAFF */}
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
                    {permissions.perkara.create && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => router.push("/dashboard/perkara/baru")}
                      >
                        Tambah Perkara
                      </Button>
                    )}
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
        </>
      )}
    </div>
  );
}
