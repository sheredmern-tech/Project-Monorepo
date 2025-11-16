// ============================================================================
// FILE 6: components/tables/klien-table.tsx - WITH RBAC PROTECTION
// ============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
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
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { TablePagination } from "@/components/tables/table-pagination";
import { KlienWithCount } from "@/types";
import { useKlien } from "@/lib/hooks/use-klien";
import { usePermission } from "@/lib/hooks/use-permission";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";

interface KlienTableProps {
  data: KlienWithCount[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
}

export function KlienTable({ data, isLoading, page, limit, total }: KlienTableProps) {
  const router = useRouter();
  const { deleteKlien, setPage } = useKlien();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 🔒 RBAC: Get user permissions
  const permissions = usePermission();

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteKlien(deleteId);
      toast.success("Klien berhasil dihapus");
      setDeleteId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus klien";
      toast.error(message);
    }
  };

  // ✅ IMPROVED: Skeleton loading
  if (isLoading) {
    return <TableSkeleton rows={10} columns={7} />;
  }

  if (!data.length) {
    return (
      <EmptyState
        title="Belum ada klien"
        description="Mulai dengan menambahkan klien baru"
        action={{
          label: "Tambah Klien",
          onClick: () => router.push("/klien/baru"),
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
              <TableHead>Nama</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Perkara</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((klien) => (
              <TableRow
                key={klien.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/klien/${klien.id}`)}
              >
                <TableCell>
                  <div>
                    <p className="font-medium">{klien.nama}</p>
                    {klien.email && (
                      <p className="text-sm text-muted-foreground">{klien.email}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {klien.jenis_klien}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {klien.telepon && <p>{klien.telepon}</p>}
                    {klien.telepon_alternatif && (
                      <p className="text-muted-foreground">{klien.telepon_alternatif}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {klien.kota && <p>{klien.kota}</p>}
                    {klien.provinsi && (
                      <p className="text-muted-foreground">{klien.provinsi}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{klien._count.perkara}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(klien.created_at)}
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

                      {/* 🔒 View - requires klien:read permission */}
                      {permissions.klien.read && (
                        <DropdownMenuItem
                          onClick={() => router.push(`/klien/${klien.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                      )}

                      {/* 🔒 Edit - requires klien:update permission */}
                      {permissions.klien.update && (
                        <DropdownMenuItem
                          onClick={() => router.push(`/klien/${klien.id}/edit`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}

                      {/* 🔒 Delete - requires klien:delete permission (ADMIN only) */}
                      {permissions.klien.delete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteId(klien.id)}
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

      <TablePagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Klien"
        description="Apakah Anda yakin ingin menghapus klien ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        confirmText="Hapus"
        variant="destructive"
      />
    </>
  );
}