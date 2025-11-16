
// ============================================================================
// FILE 1: components/tables/perkara-table.tsx - WITH RBAC PROTECTION
// ============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Edit, Trash2, User, AlertCircle } from "lucide-react";
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
import { TablePagination } from "@/components/tables/table-pagination";
import { PerkaraWithKlien } from "@/types";
import { usePerkara } from "@/lib/hooks/use-perkara";
import { usePermission } from "@/lib/hooks/use-permission";
import { formatDate } from "@/lib/utils/format";
import { handleApiError } from "@/lib/utils/error-handler";
import { toast } from "sonner";

interface PerkaraTableProps {
  data: PerkaraWithKlien[];
  isLoading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
}

export function PerkaraTable({ data, isLoading, error, page, limit, total }: PerkaraTableProps) {
  const router = useRouter();
  const { deletePerkara, setPage, fetchPerkara } = usePerkara();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🔒 RBAC: Get user permissions
  const permissions = usePermission();

  // ✅ Enhanced delete with error handling
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await deletePerkara(deleteId);
      toast.success("Perkara berhasil dihapus");
      setDeleteId(null);
      
      // ✅ Refresh data after delete
      await fetchPerkara();
    } catch (error) {
      handleApiError(error, "Gagal menghapus perkara");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Loading State with Skeleton
  if (isLoading) {
    return <TableSkeleton rows={10} columns={9} />;
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
            onClick={() => fetchPerkara()}
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
        title="Belum ada perkara"
        description="Mulai dengan menambahkan perkara baru"
        action={{
          label: "Tambah Perkara",
          onClick: () => router.push("/dashboard/perkara/baru"),
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
              <TableHead>Nomor Perkara</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Klien</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioritas</TableHead>
              <TableHead>Statistik</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((perkara) => (
              <TableRow
                key={perkara.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/dashboard/perkara/${perkara.id}`)}
              >
                <TableCell>
                  <div>
                    <p className="font-medium">{perkara.nomor_perkara}</p>
                    {perkara.nama_pengadilan && (
                      <p className="text-sm text-muted-foreground">{perkara.nama_pengadilan}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="max-w-xs truncate">{perkara.judul}</p>
                </TableCell>
                <TableCell>
                  {perkara.klien ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{perkara.klien.nama}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {perkara.jenis_perkara.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={perkara.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={perkara.prioritas} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Badge variant="secondary" title="Tugas">
                      {perkara._count.tugas}
                    </Badge>
                    <Badge variant="secondary" title="Dokumen">
                      {perkara._count.dokumen}
                    </Badge>
                    <Badge variant="secondary" title="Sidang">
                      {perkara._count.jadwal_sidang}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(perkara.created_at)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* 🔒 View - requires perkara:read permission */}
                      {permissions.perkara.read && (
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/perkara/${perkara.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                      )}

                      {/* 🔒 Edit - requires perkara:update permission */}
                      {permissions.perkara.update && (
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/perkara/${perkara.id}/edit`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}

                      {/* 🔒 Delete - requires perkara:delete permission */}
                      {permissions.perkara.delete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteId(perkara.id)}
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
            ))}
          </TableBody>
        </Table>
      </Card>

      <TablePagination page={page} limit={limit} total={total} onPageChange={setPage} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Perkara"
        description="Apakah Anda yakin ingin menghapus perkara ini? Semua data terkait (tugas, dokumen, sidang) akan ikut terhapus. Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Menghapus..." : "Hapus"}
        variant="destructive"
      />
    </>
  );
}