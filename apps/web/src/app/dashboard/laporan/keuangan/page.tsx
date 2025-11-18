// ============================================================================
// FILE: app/(dashboard)/laporan/keuangan/page.tsx - PRODUCTION READY
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
import { Download, DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { StatisticWidget } from "@/components/widgets/statistics-widget";
import { laporanApi, FinanceStatistics } from "@/lib/api/laporan.api";

export default function LaporanKeuanganPage() {
  const { toast } = useToast();
  const [statistics, setStatistics] = useState<FinanceStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await laporanApi.getFinanceStatistics();
      setStatistics(data);
    } catch (error) {
      console.error("Failed to fetch keuangan data", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data keuangan",
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
        const data = await laporanApi.exportKeuanganToDrive(format);
        toast({
          title: "Export Berhasil",
          description: (
            <div>
              <p>Laporan Keuangan berhasil di-export ke Google Drive</p>
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
        const blob = await laporanApi.exportKeuanganLocal(format);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `laporan-keuangan-${Date.now()}.${format === "csv" ? "csv" : "xlsx"}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Export Berhasil",
          description: `Laporan Keuangan berhasil di-download sebagai ${format.toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        variant: "destructive",
        title: "Export Gagal",
        description: "Gagal meng-export laporan keuangan",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Laporan Keuangan"
          description="Ringkasan fee dan penagihan"
        />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div>
        <PageHeader
          title="Laporan Keuangan"
          description="Ringkasan fee dan penagihan"
        />
        <p className="text-muted-foreground">Gagal memuat data</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Laporan Keuangan"
        description="Ringkasan fee dan penagihan"
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

      {/* Financial Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatisticWidget
          title="Total Perkara"
          value={statistics.total_perkara.toString()}
          description="Jumlah perkara"
          icon={DollarSign}
        />
        <StatisticWidget
          title="Total Nilai Perkara"
          value={formatCurrency(statistics.total_nilai_perkara)}
          description="Nilai perkara keseluruhan"
          icon={TrendingUp}
        />
        <StatisticWidget
          title="Total Nilai Fee"
          value={formatCurrency(statistics.total_nilai_fee)}
          description="Fee keseluruhan"
          icon={DollarSign}
        />
        <StatisticWidget
          title="Pembayaran Lunas"
          value={statistics.paid_payment.toString()}
          description="Perkara sudah lunas"
          icon={CheckCircle}
        />
      </div>

      {/* Payment Status Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Status Pembayaran</CardTitle>
          <CardDescription>Rincian status pembayaran perkara</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(statistics.by_status_pembayaran).map(([status, count]) => {
              let icon = AlertCircle;
              let colorClass = "text-yellow-600";

              if (status.toLowerCase().includes("lunas")) {
                icon = CheckCircle;
                colorClass = "text-green-600";
              } else if (status.toLowerCase().includes("pending")) {
                icon = AlertCircle;
                colorClass = "text-orange-600";
              }

              const IconComponent = icon;

              return (
                <div
                  key={status}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-5 w-5 ${colorClass}`} />
                    <span className="font-medium">{status}</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Finansial</CardTitle>
            <CardDescription>Informasi keuangan utama</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-muted-foreground">Total Nilai Perkara</span>
              <span className="font-bold text-lg">
                {formatCurrency(statistics.total_nilai_perkara)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-muted-foreground">Total Nilai Fee</span>
              <span className="font-bold text-lg">
                {formatCurrency(statistics.total_nilai_fee)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-muted-foreground">Rata-rata Fee per Perkara</span>
              <span className="font-bold text-lg">
                {formatCurrency(
                  statistics.total_perkara > 0
                    ? statistics.total_nilai_fee / statistics.total_perkara
                    : 0
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Pembayaran</CardTitle>
            <CardDescription>Ringkasan pembayaran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-muted-foreground">Pembayaran Lunas</span>
              </div>
              <span className="font-bold text-lg text-green-600">
                {statistics.paid_payment}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="text-muted-foreground">Pembayaran Pending</span>
              </div>
              <span className="font-bold text-lg text-orange-600">
                {statistics.pending_payment}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-muted-foreground">Persentase Lunas</span>
              <span className="font-bold text-lg">
                {statistics.total_perkara > 0
                  ? ((statistics.paid_payment / statistics.total_perkara) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
