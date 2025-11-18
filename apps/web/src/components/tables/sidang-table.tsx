// ============================================================================
// FILE 2: components/tables/sidang-table.tsx - WITH RBAC PROTECTION
// ============================================================================
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Edit, Trash2, Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
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
import { TablePagination } from "@/components/tables/table-pagination";
import { JadwalSidangWithRelations } from "@/types";
import { useSidang } from "@/lib/hooks/use-sidang";
import { usePermission } from "@/lib/hooks/use-permission";
import { formatDate, formatTime, isToday, isFuture } from "@/lib/utils/date";
import { handleApiError } from "@/lib/utils/error-handler";
import { toast } from "sonner";

interface SidangTableProps {
  data: JadwalSidangWithRelations[];
  isLoading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function SidangTable({
  data,
  isLoading,
  error,
  page,
  limit,
  total,
  onPageChange
}: SidangTableProps) {
  const router = useRouter();
  const { deleteSidang, fetchSidang } = useSidang();

  // 🔒 RBAC: Get user permissions
  const permissions = usePermission();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Track if we've attempted to load data (prevent flash of empty state on first render)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  useEffect(() => {
    // Mark that we've attempted load once isLoading becomes false for the first time
    if (!isLoading) {
      setHasAttemptedLoad(true);
    }
  }, [isLoading]);

  // ✅ Enhanced delete with error handling
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await deleteSidang(deleteId);
      toast.success("Jadwal sidang berhasil dihapus");
      setDeleteId(null);
      await fetchSidang();
    } catch (error) {
      handleApiError(error, "Gagal menghapus jadwal sidang");
    } finally {
      setIsDeleting(false);
    }
  };

  const getSidangStatus = (tanggalSidang: string) => {
    if (isToday(tanggalSidang)) {
      return { label: "Hari Ini", variant: "destructive" as const };
    }
    if (isFuture(tanggalSidang)) {
      return { label: "Akan Datang", variant: "default" as const };
    }
    return { label: "Sudah Lewat", variant: "secondary" as const };
  };

  // ✅ Loading State
  if (isLoading) {
    return <TableSkeleton rows={10} columns={7} />;
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
            onClick={() => fetchSidang()}
          >
            Coba Lagi
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // ✅ Empty State - only show if we've attempted to load data
  if (!data.length && hasAttemptedLoad) {
    return (
      <EmptyState
        icon={Calendar}
        title="Belum ada jadwal sidang"
        description="Mulai dengan menambahkan jadwal sidang baru"
        action={{
          label: "Tambah Jadwal Sidang",
          onClick: () => router.push("/dashboard/sidang/baru"),
        }}
      />
    );
  }

  // Show skeleton if data not loaded yet and we haven't attempted load
  if (!hasAttemptedLoad) {
    return <TableSkeleton rows={10} columns={7} />;
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal & Waktu</TableHead>
              <TableHead>Perkara</TableHead>
              <TableHead>Jenis Sidang</TableHead>
              <TableHead>Pengadilan</TableHead>
              <TableHead>Hakim</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((sidang) => {
              const statusInfo = getSidangStatus(sidang.tanggal_sidang);

              // 🎯 Check if user has ANY action permission
              const hasAnyAction = permissions.sidang.read || permissions.sidang.update || permissions.sidang.delete;

              return (
                <TableRow
                  key={sidang.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/dashboard/sidang/${sidang.id}`)}
                >
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{formatDate(sidang.tanggal_sidang)}</p>
                        {sidang.waktu_mulai && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(sidang.waktu_mulai)}</span>
                            {sidang.waktu_selesai && (
                              <span>- {formatTime(sidang.waktu_selesai)}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{sidang.perkara.nomor_perkara}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {sidang.perkara.judul}
                      </p>
                      {sidang.perkara.klien && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Klien: {sidang.perkara.klien.nama}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {sidang.jenis_sidang.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{sidang.nama_pengadilan}</p>
                        {sidang.nomor_ruang_sidang && (
                          <p className="text-xs text-muted-foreground">
                            Ruang {sidang.nomor_ruang_sidang}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {sidang.nama_hakim ? (
                      <p className="text-sm">{sidang.nama_hakim}</p>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {/* 🎯 Only show dropdown if user has any action permission */}
                    {hasAnyAction && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          {/* 🔒 View - requires sidang:read permission */}
                          {permissions.sidang.read && (
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/sidang/${sidang.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Detail
                            </DropdownMenuItem>
                          )}

                          {/* 🔒 Edit - requires sidang:update permission */}
                          {permissions.sidang.update && (
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/sidang/${sidang.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}

                          {/* 🔒 Delete - requires sidang:delete permission */}
                          {permissions.sidang.delete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteId(sidang.id)}
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

      <TablePagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Jadwal Sidang"
        description="Apakah Anda yakin ingin menghapus jadwal sidang ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Menghapus..." : "Hapus"}
        variant="destructive"
      />
    </>
  );
}