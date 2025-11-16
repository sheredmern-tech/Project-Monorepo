// ============================================================================
// FILE 2: components/tables/tugas-table.tsx - WITH RBAC PROTECTION
// ============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Edit, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { TablePagination } from "@/components/tables/table-pagination";
import { TugasWithRelations, StatusTugas } from "@/types";
import { useTugas } from "@/lib/hooks/use-tugas";
import { usePermission } from "@/lib/hooks/use-permission";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import { handleApiError } from "@/lib/utils/error-handler";
import { toast } from "sonner";

interface TugasTableProps {
  data: TugasWithRelations[];
  isLoading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
}

export function TugasTable({ data, isLoading, error, page, limit, total }: TugasTableProps) {
  const router = useRouter();
  const { deleteTugas, updateTugas, setPage, fetchTugas } = useTugas();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  // 🔒 RBAC: Get user permissions
  const permissions = usePermission();

  // ✅ Enhanced mark complete with optimistic update
  const handleMarkComplete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setCompletingId(id);
      await updateTugas(id, { 
        status: StatusTugas.SELESAI,
      });
      toast.success("Tugas berhasil diselesaikan");
      
      // ✅ Refresh to get updated data
      await fetchTugas();
    } catch (error) {
      handleApiError(error, "Gagal menyelesaikan tugas");
    } finally {
      setCompletingId(null);
    }
  };

  // ✅ Enhanced delete with error handling
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await deleteTugas(deleteId);
      toast.success("Tugas berhasil dihapus");
      setDeleteId(null);
      await fetchTugas();
    } catch (error) {
      handleApiError(error, "Gagal menghapus tugas");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Loading State
  if (isLoading) {
    return <TableSkeleton rows={10} columns={7} />;
  }

  // ✅ Error State
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTugas()}
            className="ml-4"
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
        title="Belum ada tugas"
        description="Mulai dengan menambahkan tugas baru"
        action={{
          label: "Tambah Tugas",
          onClick: () => router.push("/dashboard/tugas/baru"),
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
              <TableHead>Tugas</TableHead>
              <TableHead>Perkara</TableHead>
              <TableHead>Petugas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioritas</TableHead>
              <TableHead>Tenggat</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((tugas) => {
              const isOverdue = tugas.tenggat_waktu && 
                new Date(tugas.tenggat_waktu) < new Date() && 
                tugas.status !== StatusTugas.SELESAI;
              const isCompleting = completingId === tugas.id;

              return (
                <TableRow
                  key={tugas.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/dashboard/tugas/${tugas.id}`)}
                >
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{tugas.judul}</p>
                        {tugas.deskripsi && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {tugas.deskripsi}
                          </p>
                        )}
                      </div>
                      {tugas.dapat_ditagih && (
                        <Badge variant="outline" className="shrink-0">
                          <Clock className="mr-1 h-3 w-3" />
                          {tugas.jam_kerja || 0}h
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{tugas.perkara.nomor_perkara}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {tugas.perkara.judul}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {tugas.petugas ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar user={tugas.petugas} className="h-8 w-8" />
                        <span className="text-sm">{tugas.petugas.nama_lengkap}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tugas.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={tugas.prioritas} />
                  </TableCell>
                  <TableCell>
                    {tugas.tenggat_waktu ? (
                      <div>
                        <p className="text-sm">{formatDate(tugas.tenggat_waktu)}</p>
                        <p className={`text-xs ${isOverdue ? "text-red-500" : "text-muted-foreground"}`}>
                          {formatRelativeTime(tugas.tenggat_waktu)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isCompleting}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* 🔒 Mark Complete - requires tugas:update permission */}
                        {permissions.tugas.update && tugas.status !== StatusTugas.SELESAI && (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => handleMarkComplete(tugas.id, e)}
                              disabled={isCompleting}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {isCompleting ? "Menyimpan..." : "Tandai Selesai"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}

                        {/* 🔒 View - requires tugas:read permission */}
                        {permissions.tugas.read && (
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/tugas/${tugas.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </DropdownMenuItem>
                        )}

                        {/* 🔒 Edit - requires tugas:update permission */}
                        {permissions.tugas.update && (
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/tugas/${tugas.id}/edit`)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}

                        {/* 🔒 Delete - requires tugas:delete permission */}
                        {permissions.tugas.delete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setDeleteId(tugas.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <TablePagination page={page} limit={limit} total={total} onPageChange={setPage} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Tugas"
        description="Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Menghapus..." : "Hapus"}
        variant="destructive"
      />
    </>
  );
}