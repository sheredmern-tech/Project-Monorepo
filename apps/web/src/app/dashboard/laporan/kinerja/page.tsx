// ============================================================================
// FILE: app/(dashboard)/laporan/kinerja/page.tsx - PRODUCTION READY
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, TrendingUp, Users, Activity } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { StatisticWidget } from "@/components/widgets/statistics-widget";
import { laporanApi, TeamStatistics, WorkloadDistribution } from "@/lib/api/laporan.api";

export default function LaporanKinerjaPage() {
  const { toast } = useToast();
  const [statistics, setStatistics] = useState<TeamStatistics | null>(null);
  const [workload, setWorkload] = useState<WorkloadDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsData, workloadData] = await Promise.all([
        laporanApi.getTeamStatistics(),
        laporanApi.getWorkloadDistribution(),
      ]);
      setStatistics(statsData);
      setWorkload(workloadData);
    } catch (error) {
      console.error("Failed to fetch kinerja data", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data kinerja",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (
    format: "csv" | "excel",
    destination: "local" | "drive"
  ) => {
    try {
      setIsExporting(true);

      if (destination === "drive") {
        const data = await laporanApi.exportKinerjaToDrive(format);
        toast({
          title: "Export Berhasil",
          description: (
            <div>
              <p>Laporan Kinerja berhasil di-export ke Google Drive</p>
              <a
                href={data.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline mt-2 inline-block"
              >
                Lihat di Google Drive
              </a>
            </div>
          ),
        });
      } else {
        const blob = await laporanApi.exportKinerjaLocal(format);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `laporan-kinerja-${Date.now()}.${format === "csv" ? "csv" : "xlsx"}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Export Berhasil",
          description: `Laporan Kinerja berhasil di-download sebagai ${format.toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        variant: "destructive",
        title: "Export Gagal",
        description: "Gagal meng-export laporan kinerja",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Laporan Kinerja"
          description="Analisis kinerja tim dan produktivitas"
        />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div>
        <PageHeader
          title="Laporan Kinerja"
          description="Analisis kinerja tim dan produktivitas"
        />
        <p className="text-muted-foreground">Gagal memuat data</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Laporan Kinerja"
        description="Analisis kinerja tim dan produktivitas"
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isExporting}>
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Export Lokal (Download)</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExport("csv", "local")}>
                Download CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel", "local")}>
                Download Excel
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Export ke Google Drive</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExport("csv", "drive")}>
                Save CSV to Drive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel", "drive")}>
                Save Excel to Drive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatisticWidget
          title="Total User"
          value={statistics.total_users.toString()}
          description="Total anggota tim"
          icon={Users}
        />
        <StatisticWidget
          title="User Aktif"
          value={statistics.active_users.toString()}
          description="User yang aktif"
          icon={Activity}
        />
        <StatisticWidget
          title="User Tidak Aktif"
          value={statistics.inactive_users.toString()}
          description="User yang tidak aktif"
          icon={Users}
        />
        <StatisticWidget
          title="Penambahan Terbaru"
          value={statistics.recent_additions.toString()}
          description="User baru bergabung"
          icon={TrendingUp}
        />
      </div>

      {/* Role Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Distribusi Berdasarkan Role</CardTitle>
          <CardDescription>Pembagian user berdasarkan peran</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(statistics.by_role).map(([role, count]) => (
              <div
                key={role}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <span className="font-medium capitalize">{role}</span>
                <span className="text-2xl font-bold text-primary">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workload Distribution Table */}
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Beban Kerja</CardTitle>
          <CardDescription>
            Detail beban kerja masing-masing anggota tim
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Perkara Aktif</TableHead>
                  <TableHead className="text-right">Tugas Pending</TableHead>
                  <TableHead className="text-right">Tugas Selesai</TableHead>
                  <TableHead className="text-right">Total Dokumen</TableHead>
                  <TableHead className="text-right">Skor Beban Kerja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workload.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  workload.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">{user.user_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell className="text-right">{user.active_perkara}</TableCell>
                      <TableCell className="text-right">{user.pending_tugas}</TableCell>
                      <TableCell className="text-right">{user.completed_tugas}</TableCell>
                      <TableCell className="text-right">{user.total_dokumen}</TableCell>
                      <TableCell className="text-right font-bold">
                        {user.workload_score.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
