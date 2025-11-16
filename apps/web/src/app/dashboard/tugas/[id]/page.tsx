// ============================================================================
// FILE: app/(dashboard)/tugas/[id]/page.tsx - COMPLETE FIXED VERSION
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  ArrowLeft,
  Clock,
  DollarSign,
  CheckCircle2,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useTugas } from "@/lib/hooks/use-tugas";
import { TugasWithRelations, StatusTugas } from "@/types";
import { formatDate, formatCurrency, formatRelativeTime } from "@/lib/utils/format";

export default function TugasDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchTugasById, updateTugas, deleteTugas, isLoading } = useTugas();
  const [tugas, setTugas] = useState<TugasWithRelations | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadTugas = async () => {
      if (params.id) {
        const data = await fetchTugasById(params.id as string);
        setTugas(data);
      }
    };
    loadTugas();
  }, [params.id, fetchTugasById]);

  const handleDelete = async () => {
    try {
      await deleteTugas(params.id as string);
      router.push("/dashboard/tugas");
    } catch {
      // Error handled by hook
    }
  };

  const handleStatusChange = async (newStatus: StatusTugas) => {
    try {
      // Backend auto-sets tanggal_selesai when status = SELESAI
      await updateTugas(params.id as string, { 
        status: newStatus,
      });
      const updated = await fetchTugasById(params.id as string);
      setTugas(updated);
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading || !tugas) {
    return <LoadingSpinner />;
  }

  const isOverdue = tugas.tenggat_waktu && new Date(tugas.tenggat_waktu) < new Date() && tugas.status !== StatusTugas.SELESAI;

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <PageHeader
          title={tugas.judul}
          description={`Tugas untuk perkara: ${tugas.perkara.nomor_perkara}`}
          action={
            <div className="flex gap-2">
              {tugas.status !== StatusTugas.SELESAI && (
                <Button variant="outline" onClick={() => handleStatusChange(StatusTugas.SELESAI)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Tandai Selesai
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push(`/dashboard/tugas/${params.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </Button>
            </div>
          }
        />

        <div className="flex flex-wrap gap-2 mt-4">
          <StatusBadge status={tugas.status} />
          <PriorityBadge priority={tugas.prioritas} />
          {tugas.dapat_ditagih && (
            <Badge variant="outline">
              <DollarSign className="mr-1 h-3 w-3" />
              Dapat Ditagih
            </Badge>
          )}
          {isOverdue && <Badge variant="destructive">Terlambat</Badge>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detail Tugas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Perkara */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Perkara</p>
              <div
                className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent"
                onClick={() => router.push(`/dashboard/perkara/${tugas.perkara.id}`)}
              >
                <div className="flex-1">
                  <p className="font-medium">{tugas.perkara.nomor_perkara}</p>
                  <p className="text-sm text-muted-foreground">{tugas.perkara.judul}</p>
                  {tugas.perkara.klien && (
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {tugas.perkara.klien.nama}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Deskripsi */}
            {tugas.deskripsi && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Deskripsi</p>
                  <p className="text-sm whitespace-pre-wrap">{tugas.deskripsi}</p>
                </div>
                <Separator />
              </>
            )}

            {/* Petugas */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Ditugaskan Kepada</p>
              {tugas.petugas ? (
                <div className="flex items-center gap-3">
                  <UserAvatar user={tugas.petugas} className="h-10 w-10" />
                  <div>
                    <p className="font-medium">{tugas.petugas.nama_lengkap}</p>
                    <p className="text-sm text-muted-foreground">{tugas.petugas.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ditugaskan</p>
              )}
            </div>

            <Separator />

            {/* Tanggal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tenggat Waktu</p>
                {tugas.tenggat_waktu ? (
                  <div>
                    <p className="font-medium">{formatDate(tugas.tenggat_waktu)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatRelativeTime(tugas.tenggat_waktu)}
                    </p>
                  </div>
                ) : (
                  <p className="font-medium">-</p>
                )}
              </div>

              {tugas.tanggal_selesai && (
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Selesai</p>
                  <p className="font-medium">{formatDate(tugas.tanggal_selesai)}</p>
                </div>
              )}
            </div>

            {/* Billable Info */}
            {tugas.dapat_ditagih && (
              <>
                <Separator />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Jam Kerja</p>
                    <p className="font-medium">{tugas.jam_kerja || 0} jam</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tarif/Jam</p>
                    <p className="font-medium">{formatCurrency(tugas.tarif_per_jam)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Biaya</p>
                    <p className="font-medium text-primary">
                      {formatCurrency((tugas.jam_kerja || 0) * (tugas.tarif_per_jam || 0))}
                    </p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Dibuat</p>
                <p>{formatDate(tugas.created_at)}</p>
                {tugas.pembuat && <p className="text-muted-foreground">oleh {tugas.pembuat.nama_lengkap}</p>}
              </div>
              <div>
                <p className="text-muted-foreground">Terakhir Diperbarui</p>
                <p>{formatDate(tugas.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Status Change */}
          <Card>
            <CardHeader>
              <CardTitle>Ubah Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.values(StatusTugas).map((stat) => (
                <Button
                  key={stat}
                  variant={tugas.status === stat ? "default" : "outline"}
                  className="w-full justify-start capitalize"
                  onClick={() => handleStatusChange(stat)}
                  disabled={tugas.status === stat}
                >
                  {stat.replace(/_/g, " ")}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Time Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={tugas.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prioritas</span>
                <PriorityBadge priority={tugas.prioritas} />
              </div>
              {tugas.tenggat_waktu && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className={isOverdue ? "text-red-500" : ""}>
                    {isOverdue ? "Terlambat" : "Dalam batas waktu"}
                  </span>
                </div>
              )}
              {tugas.dapat_ditagih && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{tugas.jam_kerja || 0} jam kerja</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Hapus Tugas"
        description={`Apakah Anda yakin ingin menghapus tugas "${tugas.judul}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        confirmText="Hapus"
        variant="destructive"
      />
    </div>
  );
}