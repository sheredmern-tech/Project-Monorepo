// ============================================================================
// FILE: app/(dashboard)/klien/[id]/page.tsx - ✅ FIXED WITH CLIENT REDIRECT
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { klienApi } from "@/lib/api/klien.api";
import { useAuthStore } from "@/lib/stores/auth.store";
import { usePermission } from "@/lib/hooks/use-permission";
import { UserRole } from "@/types/enums";
import { KlienWithPerkara } from "@/types";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";

export default function KlienDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const permissions = usePermission();
  const [klien, setKlien] = useState<KlienWithPerkara | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ CLIENT REDIRECT: Client tidak boleh akses detail klien lain
  useEffect(() => {
    if (user?.role === UserRole.KLIEN) {
      console.log('🔀 Client detected, redirecting to profile...');
      toast.info('Gunakan halaman Profile untuk melihat data Anda');
      router.replace('/klien/profile');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    let isMounted = true;

    const loadKlien = async () => {
      if (!params.id || user?.role === UserRole.KLIEN) return;

      try {
        setIsLoading(true);
        
        const data = await klienApi.getById(params.id as string);
        
        if (isMounted) {
          if (data && data.id) {
            setKlien(data);
          } else {
            toast.error("Data klien tidak valid");
            setTimeout(() => router.push("/dashboard/klien"), 1500);
          }
        }
      } catch (error) {
        console.error("Error loading klien:", error);
        
        if (isMounted) {
          toast.error("Gagal memuat detail klien");
          setTimeout(() => router.push("/dashboard/klien"), 2000);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadKlien();

    return () => {
      isMounted = false;
    };
  }, [params.id, router, user]);

  const handleDelete = async () => {
    if (!params.id) return;

    try {
      setIsDeleting(true);
      await klienApi.delete(params.id as string);
      toast.success("Klien berhasil dihapus");
      router.push("/dashboard/klien");
    } catch (error) {
      console.error("Error deleting klien:", error);
      toast.error("Gagal menghapus klien");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // ✅ Show loading while redirecting client
  if (user?.role === UserRole.KLIEN) {
    return <LoadingSpinner />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!klien) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-muted-foreground">Data klien tidak ditemukan</p>
        <Button onClick={() => router.push("/dashboard/klien")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Klien
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <PageHeader
          title={klien.nama}
          description={`Detail informasi klien - ${klien.jenis_klien}`}
          action={
            <div className="flex gap-2">
              {permissions.klien.update && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/klien/${params.id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {permissions.klien.delete && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              )}
            </div>
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Umum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Jenis Klien</p>
                <p className="font-medium capitalize">{klien.jenis_klien}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nomor Identitas</p>
                <p className="font-medium">{klien.nomor_identitas || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NPWP</p>
                <p className="font-medium">{klien.npwp || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{klien.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telepon</p>
                <p className="font-medium">{klien.telepon || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telepon Alternatif</p>
                <p className="font-medium">{klien.telepon_alternatif || "-"}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-2">Alamat Lengkap</p>
              <p className="font-medium">{klien.alamat || "-"}</p>
              {(klien.kelurahan || klien.kecamatan || klien.kota || klien.provinsi) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {[klien.kelurahan, klien.kecamatan, klien.kota, klien.provinsi]
                    .filter(Boolean)
                    .join(", ")}
                  {klien.kode_pos && ` - ${klien.kode_pos}`}
                </p>
              )}
            </div>

            {klien.jenis_klien === "perusahaan" && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nama Perusahaan</p>
                    <p className="font-medium">{klien.nama_perusahaan || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bentuk Badan Usaha</p>
                    <p className="font-medium">{klien.bentuk_badan_usaha || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Nomor Akta</p>
                    <p className="font-medium">{klien.nomor_akta || "-"}</p>
                  </div>
                </div>
              </>
            )}

            {(klien.nama_kontak_darurat || klien.telepon_kontak_darurat) && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Kontak Darurat</p>
                    <p className="font-medium">{klien.nama_kontak_darurat || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telepon Darurat</p>
                    <p className="font-medium">{klien.telepon_kontak_darurat || "-"}</p>
                  </div>
                </div>
              </>
            )}

            {klien.catatan && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Catatan</p>
                  <p className="text-sm">{klien.catatan}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats & Perkara */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Perkara</span>
                  <Badge variant="secondary">{klien._count?.perkara || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Terdaftar</span>
                  <span className="text-sm">{formatDate(klien.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perkara Terkait ({klien.perkara?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {klien.perkara && klien.perkara.length > 0 ? (
                <div className="space-y-3">
                  {klien.perkara.slice(0, 5).map((perkara) => (
                    <div
                      key={perkara.id}
                      className="cursor-pointer rounded-lg border p-3 hover:bg-accent"
                      onClick={() => router.push(`/dashboard/perkara/${perkara.id}`)}
                    >
                      <p className="font-medium text-sm">{perkara.nomor_perkara}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {perkara.judul}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {perkara.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(perkara.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada perkara</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Hapus Klien"
        description={`Apakah Anda yakin ingin menghapus klien "${klien.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        confirmText="Hapus"
        variant="destructive"
      />
    </div>
  );
}