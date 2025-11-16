// ============================================================================
// FILE: app/(dashboard)/sidang/[id]/page.tsx - NEW
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit, Trash2, ArrowLeft, MapPin, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { useSidang } from "@/lib/hooks/use-sidang";
import { usePermission } from "@/lib/hooks/use-permission";
import { JadwalSidangWithRelations } from "@/types";
import { formatDate, formatTime } from "@/lib/utils/date";

export default function SidangDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchSidangById, deleteSidang, isLoading } = useSidang();
  const permissions = usePermission();
  const [sidang, setSidang] = useState<JadwalSidangWithRelations | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadSidang = async () => {
      if (params.id) {
        const data = await fetchSidangById(params.id as string);
        setSidang(data);
      }
    };
    loadSidang();
  }, [params.id, fetchSidangById]);

  const handleDelete = async () => {
    try {
      await deleteSidang(params.id as string);
      router.push("/dashboard/sidang");
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading || !sidang) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <PageHeader
          title={`Sidang ${sidang.jenis_sidang.replace(/_/g, " ")}`}
          description={`${sidang.nama_pengadilan} - ${formatDate(sidang.tanggal_sidang)}`}
          action={
            <div className="flex gap-2">
              {permissions.sidang.update && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/sidang/${params.id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {permissions.sidang.delete && (
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              )}
            </div>
          }
        />

        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className="capitalize">
            {sidang.jenis_sidang.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detail Sidang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Perkara */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Perkara</p>
              <div
                className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent"
                onClick={() => router.push(`/dashboard/perkara/${sidang.perkara.id}`)}
              >
                <div className="flex-1">
                  <p className="font-medium">{sidang.perkara.nomor_perkara}</p>
                  <p className="text-sm text-muted-foreground">{sidang.perkara.judul}</p>
                  {sidang.perkara.klien && (
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {sidang.perkara.klien.nama}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Waktu & Tempat */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Sidang</p>
                <p className="font-medium">{formatDate(sidang.tanggal_sidang)}</p>
              </div>
              {sidang.waktu_mulai && (
                <div>
                  <p className="text-sm text-muted-foreground">Waktu</p>
                  <p className="font-medium">
                    {formatTime(sidang.waktu_mulai)}
                    {sidang.waktu_selesai && ` - ${formatTime(sidang.waktu_selesai)}`}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Pengadilan</p>
                <p className="font-medium">{sidang.nama_pengadilan}</p>
              </div>
              {sidang.nomor_ruang_sidang && (
                <div>
                  <p className="text-sm text-muted-foreground">Ruang Sidang</p>
                  <p className="font-medium">{sidang.nomor_ruang_sidang}</p>
                </div>
              )}
            </div>

            {sidang.nama_hakim && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Hakim</p>
                  <p className="font-medium">{sidang.nama_hakim}</p>
                </div>
              </>
            )}

            {sidang.lokasi_lengkap && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Lokasi Lengkap</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm">{sidang.lokasi_lengkap}</p>
                  </div>
                </div>
              </>
            )}

            {sidang.agenda_sidang && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Agenda Sidang</p>
                  <p className="text-sm whitespace-pre-wrap">{sidang.agenda_sidang}</p>
                </div>
              </>
            )}

            {sidang.hasil_sidang && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Hasil Sidang</p>
                  <p className="text-sm whitespace-pre-wrap">{sidang.hasil_sidang}</p>
                </div>
              </>
            )}

            {sidang.putusan && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Putusan</p>
                  <p className="text-sm whitespace-pre-wrap">{sidang.putusan}</p>
                </div>
              </>
            )}

            {sidang.catatan && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Catatan</p>
                  <p className="text-sm whitespace-pre-wrap">{sidang.catatan}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Dibuat</p>
                <p>{formatDate(sidang.created_at)}</p>
                {sidang.pembuat && (
                  <p className="text-muted-foreground">oleh {sidang.pembuat.nama_lengkap}</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Terakhir Diperbarui</p>
                <p>{formatDate(sidang.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Jenis Sidang</span>
                <Badge variant="outline" className="capitalize">
                  {sidang.jenis_sidang.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(sidang.tanggal_sidang)}</span>
              </div>
              {sidang.waktu_mulai && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatTime(sidang.waktu_mulai)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {(sidang.lokasi_lengkap || sidang.nama_pengadilan) && (
            <Card>
              <CardHeader>
                <CardTitle>Lokasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="font-medium">{sidang.nama_pengadilan}</p>
                  {sidang.nomor_ruang_sidang && (
                    <p className="text-sm text-muted-foreground">
                      Ruang {sidang.nomor_ruang_sidang}
                    </p>
                  )}
                </div>
                {sidang.lokasi_lengkap && (
                  <div className="flex items-start gap-2 pt-2 border-t">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-muted-foreground">{sidang.lokasi_lengkap}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Hapus Jadwal Sidang"
        description={`Apakah Anda yakin ingin menghapus jadwal sidang ini? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        confirmText="Hapus"
        variant="destructive"
      />
    </div>
  );
}