// ============================================================================
// FILE: app/(dashboard)/dokumen/[id]/page.tsx
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  ArrowLeft,
  Download,
  Eye,
  Lock,
  Unlock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { DetailPageSkeleton } from "@/components/shared/detail-page-skeleton";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { DokumenPreview } from "@/components/shared/dokumen-preview";
import { useDokumen } from "@/lib/hooks/use-dokumen";
import { usePermission } from "@/lib/hooks/use-permission";
import { DokumenWithRelations } from "@/types";
import { formatDate, formatFileSize } from "@/lib/utils/format";
import { getFileIcon, getFileExtension, isPreviewable } from "@/lib/utils/file";

// Helper component to render dynamic icon
interface FileIconDisplayProps {
  tipeFile: string;
  className?: string;
}

const FileIconDisplay = ({ tipeFile, className }: FileIconDisplayProps) => {
  const IconComponent = getFileIcon(tipeFile) as LucideIcon;
  return <IconComponent className={className} />;
};

export default function DokumenDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchDokumenById, deleteDokumen, downloadDokumen } = useDokumen();
  const permissions = usePermission();
  const [dokumen, setDokumen] = useState<DokumenWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ Local loading state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const loadDokumen = async () => {
      if (params.id) {
        try {
          setIsLoading(true); // ✅ Set loading true
          const data = await fetchDokumenById(params.id as string);
          setDokumen(data);
        } catch (error) {
          // Error already handled by hook (toast shown)
          // Just prevent infinite loading
          console.error('Failed to load dokumen:', error);
        } finally {
          setIsLoading(false); // ✅ Set loading false after everything
        }
      }
    };
    loadDokumen();
  }, [params.id, fetchDokumenById]);

  const handleDelete = async () => {
    try {
      await deleteDokumen(params.id as string);
      router.push("/dashboard/dokumen");
    } catch {
      // Error handled by hook
    }
  };

  const handleDownload = async () => {
    if (dokumen) {
      await downloadDokumen(dokumen.id, dokumen.nama_dokumen);
    }
  };

  // Show skeleton while loading
  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  // Show error if dokumen not found after loading
  if (!isLoading && !dokumen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-6xl">📄</div>
          <h2 className="text-2xl font-semibold">Dokumen Tidak Ditemukan</h2>
          <p className="text-muted-foreground max-w-md">
            Dokumen yang Anda cari tidak ditemukan atau Anda tidak memiliki akses untuk melihatnya.
          </p>
          <Button onClick={() => router.push("/dashboard/dokumen")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Dokumen
          </Button>
        </div>
      </div>
    );
  }

  const canPreview = isPreviewable(dokumen.tipe_file);

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <PageHeader
          title={dokumen.nama_dokumen}
          description={`Dokumen untuk perkara: ${dokumen.perkara.nomor_perkara}`}
          action={
            <div className="flex gap-2">
              {canPreview && dokumen.embed_link && (
                <Button variant="outline" onClick={() => setShowPreview(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Fullscreen
                </Button>
              )}
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              {permissions.dokumen.update && (
                <Button variant="outline" onClick={() => router.push(`/dashboard/dokumen/${params.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {permissions.dokumen.delete && (
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              )}
            </div>
          }
        />

        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary" className="capitalize">
            {dokumen.kategori.replace(/_/g, " ")}
          </Badge>
          <Badge variant="outline">
            {getFileExtension(dokumen.nama_dokumen)}
          </Badge>
          <Badge variant="outline">v{dokumen.versi}</Badge>
          {dokumen.adalah_rahasia ? (
            <Badge variant="destructive">
              <Lock className="mr-1 h-3 w-3" />
              Rahasia
            </Badge>
          ) : (
            <Badge variant="outline">
              <Unlock className="mr-1 h-3 w-3" />
              Publik
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Dokumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Perkara */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Perkara</p>
              <div
                className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent"
                onClick={() => router.push(`/dashboard/perkara/${dokumen.perkara.id}`)}
              >
                <div className="flex-1">
                  <p className="font-medium">{dokumen.perkara.nomor_perkara}</p>
                  <p className="text-sm text-muted-foreground">{dokumen.perkara.judul}</p>
                  {dokumen.perkara.klien && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Klien: {dokumen.perkara.klien.nama}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* File Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Kategori</p>
                <p className="font-medium capitalize">{dokumen.kategori.replace(/_/g, " ")}</p>
              </div>
              {dokumen.nomor_bukti && (
                <div>
                  <p className="text-sm text-muted-foreground">Nomor Bukti</p>
                  <p className="font-medium">{dokumen.nomor_bukti}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Ukuran File</p>
                <p className="font-medium">{formatFileSize(dokumen.ukuran_file)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipe File</p>
                <p className="font-medium">{dokumen.tipe_file || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Versi</p>
                <p className="font-medium">v{dokumen.versi}</p>
              </div>
              {dokumen.tanggal_dokumen && (
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Dokumen</p>
                  <p className="font-medium">{formatDate(dokumen.tanggal_dokumen)}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Uploader Info */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Diunggah Oleh</p>
              {dokumen.pengunggah ? (
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-medium">{dokumen.pengunggah.nama_lengkap}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(dokumen.tanggal_upload)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">-</p>
              )}
            </div>

            {/* Catatan */}
            {dokumen.catatan && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Catatan</p>
                  <p className="text-sm whitespace-pre-wrap">{dokumen.catatan}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Google Drive Info */}
            <div>
              <p className="text-sm text-muted-foreground">Storage</p>
              <div className="space-y-2 mt-1">
                {dokumen.google_drive_link && (
                  <div>
                    <p className="text-xs text-muted-foreground">Google Drive Link</p>
                    <a
                      href={dokumen.google_drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      Open in Google Drive
                    </a>
                  </div>
                )}
                {dokumen.file_path && (
                  <div>
                    <p className="text-xs text-muted-foreground">Local Path (Legacy)</p>
                    <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                      {dokumen.file_path}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {/* ✅ LANGSUNG SHOW PDF/IMAGE EMBED - TIDAK PERLU KLIK BUTTON */}
              {canPreview && dokumen.embed_link ? (
                <div className="space-y-4">
                  {/* Embedded Preview - Langsung tampil */}
                  <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden border">
                    <iframe
                      src={dokumen.embed_link}
                      className="w-full h-full"
                      title={dokumen.nama_dokumen}
                      allow="autoplay"
                    />
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowPreview(true)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Fullscreen Preview
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                /* Fallback - show icon if no embed link */
                <div>
                  <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                    <FileIconDisplay
                      tipeFile={dokumen.tipe_file || "application/octet-stream"}
                      className="h-20 w-20 text-muted-foreground"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground text-center mb-2">
                      Preview tidak tersedia
                    </p>
                    <Button variant="outline" className="w-full" onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {dokumen.adalah_rahasia ? (
                  <Badge variant="destructive">Rahasia</Badge>
                ) : (
                  <Badge variant="outline">Publik</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Versi</span>
                <Badge variant="secondary">v{dokumen.versi}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Kategori</span>
                <Badge variant="outline" className="capitalize">
                  {dokumen.kategori.replace(/_/g, " ")}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <DokumenPreview
          dokumen={dokumen}
          open={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Hapus Dokumen"
        description={`Apakah Anda yakin ingin menghapus dokumen "${dokumen.nama_dokumen}"? File akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        confirmText="Hapus"
        variant="destructive"
      />
    </div>
  );
}