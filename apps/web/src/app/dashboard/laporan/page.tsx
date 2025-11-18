// ============================================================================
// FILE: app/(dashboard)/laporan/page.tsx - FIXED DUPLICATE KEY ERROR
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Activity, TrendingUp, FileText } from "lucide-react";
import { StatisticWidget } from "@/components/widgets/statistics-widget";
import { Briefcase, Users, CheckSquare, Calendar } from "lucide-react";
import { perkaraApi } from "@/lib/api/perkara.api";
import { klienApi } from "@/lib/api/klien.api";
import { tugasApi } from "@/lib/api/tugas.api";
import { sidangApi } from "@/lib/api/sidang.api";

export default function LaporanPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPerkara: 0,
    totalKlien: 0,
    tugasAktif: 0,
    sidangBulanIni: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [perkaraRes, klienRes, tugasRes, sidangRes] = await Promise.all([
          perkaraApi.getAll({ limit: 1 }),
          klienApi.getAll({ limit: 1 }),
          tugasApi.getAll({ limit: 1 }),
          sidangApi.getAll({ limit: 1 }),
        ]);

        setStats({
          totalPerkara: perkaraRes.meta.total || 0,
          totalKlien: klienRes.meta.total || 0,
          tugasAktif: tugasRes.meta.total || 0,
          sidangBulanIni: sidangRes.meta.total || 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const reports = [
    {
      id: "aktivitas", // ADD UNIQUE ID
      title: "Laporan Aktivitas",
      description: "Log aktivitas pengguna dan sistem",
      icon: Activity,
      href: "/dashboard/laporan/aktivitas",
    },
    {
      id: "kinerja", // ADD UNIQUE ID
      title: "Laporan Kinerja",
      description: "Analisis kinerja tim dan produktivitas",
      icon: TrendingUp,
      href: "/dashboard/laporan/kinerja",
    },
    {
      id: "keuangan", // ADD UNIQUE ID
      title: "Laporan Keuangan",
      description: "Ringkasan fee dan penagihan",
      icon: BarChart3,
      href: "/dashboard/laporan/keuangan",
    },
    {
      id: "custom", // ADD UNIQUE ID
      title: "Laporan Custom",
      description: "Buat laporan sesuai kebutuhan",
      icon: FileText,
      href: "/dashboard/laporan/custom",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Laporan"
        description="Dashboard laporan dan analitik"
      />

      {/* Statistics - DYNAMIC */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoading ? (
          // ✅ Skeleton loading for statistics
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatisticWidget
              title="Total Perkara"
              value={stats.totalPerkara.toString()}
              description="Perkara aktif"
              icon={Briefcase}
            />
            <StatisticWidget
              title="Total Klien"
              value={stats.totalKlien.toString()}
              description="Klien terdaftar"
              icon={Users}
            />
            <StatisticWidget
              title="Tugas Aktif"
              value={stats.tugasAktif.toString()}
              description="Tugas menunggu"
              icon={CheckSquare}
            />
            <StatisticWidget
              title="Sidang Bulan Ini"
              value={stats.sidangBulanIni.toString()}
              description="Jadwal sidang"
              icon={Calendar}
            />
          </>
        )}
      </div>

      {/* Report Cards - USE UNIQUE ID FOR KEY */}
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(report.href)}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <report.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{report.title}</CardTitle>
                  <CardDescription className="mt-1">{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}