// ============================================================================
// FILE 1: components/tables/dokumen-table.tsx - WITH RBAC PROTECTION
// ============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Edit, Trash2, Download, AlertCircle, FolderInput, Copy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { DokumenPreview } from "@/components/shared/dokumen-preview";
import { TablePagination } from "@/components/tables/table-pagination";
import { MoveFolderModal } from "@/components/dokumen/MoveFolderModal";
import { DokumenWithRelations } from "@/types";
import { useDokumen } from "@/lib/hooks/use-dokumen";
import { usePermission } from "@/lib/hooks/use-permission";
import { formatDate, formatFileSize } from "@/lib/utils/format";
import { getFileIcon, getFileExtension } from "@/lib/utils/file";
import { handleApiError } from "@/lib/utils/error-handler";
import { toast } from "sonner";

interface DokumenTableProps {
  data: DokumenWithRelations[];
  isLoading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
  onSelectAll?: () => void;
}

export function DokumenTable({
  data,
  isLoading,
  error,
  page,
  limit,
  total,
  selectionMode = false,
  selectedIds = new Set<string>(),
  onToggleSelection,
  onSelectAll,
}: DokumenTableProps) {
  const router = useRouter();
  const { deleteDokumen, downloadDokumen, setPage, fetchDokumen } = useDokumen();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewDokumen, setPreviewDokumen] = useState<DokumenWithRelations | null>(null);
  const [moveOperation, setMoveOperation] = useState<{ dokumen: DokumenWithRelations; mode: 'move' | 'copy' } | null>(null);

  // 🔒 RBAC: Get user permissions
  const permissions = usePermission();

  // ✅ Enhanced delete with error handling
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await deleteDokumen(deleteId);
      toast.success("Dokumen berhasil dihapus");
      setDeleteId(null);
      await fetchDokumen();
    } catch (error) {
      handleApiError(error, "Gagal menghapus dokumen");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Enhanced download with loading state
  const handleDownload = async (id: string, filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setDownloadingId(id);
      await downloadDokumen(id, filename);
      toast.success("Dokumen berhasil diunduh");
    } catch (error) {
      handleApiError(error, "Gagal mengunduh dokumen");
    } finally {
      setDownloadingId(null);
    }
  };

  // ✅ Loading State
  if (isLoading) {
    return <TableSkeleton rows={10} columns={6} />;
  }

  // ✅ Error State with Retry
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDokumen()}
          >
            Coba Lagi
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // ✅ Empty State
  if (!data.length) {
    return (
      <EmptyState
        title="Belum ada dokumen"
        description="Mulai dengan upload dokumen baru"
        action={{
          label: "Upload Dokumen",
          onClick: () => router.push("/dashboard/dokumen/upload"),
        }}
      />
    );
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {selectionMode && (
                <TableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && data.every(d => selectedIds.has(d.id))}
                    onChange={onSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </TableHead>
              )}
              <TableHead>Nama Dokumen</TableHead>
              <TableHead>Perkara</TableHead>
              <TableHead>Folder</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Ukuran</TableHead>
              <TableHead>Diunggah</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((dokumen) => {
              const Icon = getFileIcon(dokumen.tipe_file);
              const extension = getFileExtension(dokumen.nama_dokumen);
              const isDownloading = downloadingId === dokumen.id;

              // 🎯 Check if user has ANY action permission
              const hasAnyAction = permissions.dokumen.read || permissions.dokumen.update || permissions.dokumen.delete || permissions.dokumen.download;

              return (
                <TableRow
                  key={dokumen.id}
                  className={`cursor-pointer hover:bg-muted/50 ${selectionMode && selectedIds.has(dokumen.id) ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}
                  onClick={() => !selectionMode && setPreviewDokumen(dokumen)}
                >
                  {selectionMode && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(dokumen.id)}
                        onChange={() => onToggleSelection?.(dokumen.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Icon className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{dokumen.nama_dokumen}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {extension}
                          </Badge>
                          {/* ✨ Badge: Uploaded by Client */}
                          {dokumen.pengunggah?.role === 'klien' && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                              📤 Client Upload
                            </Badge>
                          )}
                          {dokumen.nomor_bukti && (
                            <span className="text-xs text-muted-foreground">
                              {dokumen.nomor_bukti}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{dokumen.perkara.nomor_perkara}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {dokumen.perkara.judul}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(dokumen as any).folder ? (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: (dokumen as any).folder.warna || '#6B7280' }}
                        />
                        <span className="text-sm truncate max-w-[120px]">
                          {(dokumen as any).folder.nama_folder}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Root</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {dokumen.kategori.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatFileSize(dokumen.ukuran_file)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{formatDate(dokumen.tanggal_upload)}</p>
                      {dokumen.pengunggah && (
                        <p className="text-muted-foreground">{dokumen.pengunggah.nama_lengkap}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {/* 🎯 Only show dropdown if user has any action permission */}
                    {hasAnyAction && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isDownloading}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          {/* 🔒 View - requires dokumen:read permission */}
                          {permissions.dokumen.read && (
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/dokumen/${dokumen.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Detail
                            </DropdownMenuItem>
                          )}

                          {/* 🔒 Download - requires dokumen:download permission */}
                          {permissions.dokumen.download && (
                            <DropdownMenuItem
                              onClick={(e) => handleDownload(dokumen.id, dokumen.nama_dokumen, e)}
                              disabled={isDownloading}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {isDownloading ? "Downloading..." : "Download"}
                            </DropdownMenuItem>
                          )}

                          {/* 🔒 Edit - requires dokumen:update permission */}
                          {permissions.dokumen.update && (
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/dokumen/${dokumen.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}

                          {/* 🔒 Move to Folder - requires dokumen:update permission */}
                          {permissions.dokumen.update && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setMoveOperation({ dokumen, mode: 'move' })}
                              >
                                <FolderInput className="mr-2 h-4 w-4" />
                                Move to Folder
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setMoveOperation({ dokumen, mode: 'copy' })}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy to Folder
                              </DropdownMenuItem>
                            </>
                          )}

                          {/* 🔒 Delete - requires dokumen:delete permission */}
                          {permissions.dokumen.delete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteId(dokumen.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <TablePagination page={page} limit={limit} total={total} onPageChange={setPage} />

      {/* Preview Modal */}
      {previewDokumen && (
        <DokumenPreview
          dokumen={previewDokumen}
          open={!!previewDokumen}
          onClose={() => setPreviewDokumen(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Dokumen"
        description="Apakah Anda yakin ingin menghapus dokumen ini? File akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Menghapus..." : "Hapus"}
        variant="destructive"
      />

      {/* Move/Copy Folder Modal */}
      {moveOperation && (
        <MoveFolderModal
          dokumenId={moveOperation.dokumen.id}
          dokumenName={moveOperation.dokumen.nama_dokumen}
          perkaraId={moveOperation.dokumen.perkara_id}
          currentFolderId={(moveOperation.dokumen as any).folder_id}
          mode={moveOperation.mode}
          onClose={() => setMoveOperation(null)}
          onSuccess={() => {
            fetchDokumen();
            setMoveOperation(null);
          }}
        />
      )}
    </>
  );
}