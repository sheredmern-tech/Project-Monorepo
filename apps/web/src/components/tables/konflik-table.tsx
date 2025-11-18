// ============================================================================
// FILE: components/tables/konflik-table.tsx - WITH RBAC PROTECTION
// ============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Trash2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
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
import { KonflikWithRelations } from "@/types";
import { usePermission } from "@/lib/hooks/use-permission";
import { formatDate } from "@/lib/utils/format";

interface KonflikTableProps {
  data: KonflikWithRelations[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => Promise<void>;
}

export function KonflikTable({ 
  data, 
  isLoading, 
  page, 
  limit, 
  total, 
  onPageChange,
  onDelete 
}: KonflikTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 🔒 RBAC: Get user permissions
  const permissions = usePermission();

  const handleDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  // ✅ Loading State
  if (isLoading) {
    return <TableSkeleton rows={10} columns={7} />;
  }

  if (!data.length) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Belum ada pemeriksaan konflik"
        description="Mulai dengan menambahkan pemeriksaan konflik baru"
        action={{
          label: "Tambah Pemeriksaan Konflik",
          onClick: () => router.push("/dashboard/konflik/baru"),
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
              <TableHead>Nama Klien</TableHead>
              <TableHead>Pihak Lawan</TableHead>
              <TableHead>Perkara Terkait</TableHead>
              <TableHead>Status Konflik</TableHead>
              <TableHead>Diperiksa Oleh</TableHead>
              <TableHead>Tanggal Periksa</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((konflik) => {
              // 🎯 Check if user has ANY action permission
              const hasAnyAction = permissions.konflik.read || permissions.konflik.delete;

              return (
                <TableRow
                  key={konflik.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/dashboard/konflik/${konflik.id}`)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{konflik.nama_klien}</p>
                      {konflik.perkara && (
                        <p className="text-xs text-muted-foreground">
                          {konflik.perkara.nomor_perkara}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="text-sm">{konflik.pihak_lawan}</p>
                  </TableCell>

                  <TableCell>
                    {konflik.perkara ? (
                      <div>
                        <p className="font-medium text-sm">{konflik.perkara.nomor_perkara}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {konflik.perkara.judul}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Belum terkait perkara
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    {konflik.ada_konflik ? (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Ada Konflik
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1 bg-green-500">
                        <CheckCircle2 className="h-3 w-3" />
                        Tidak Ada Konflik
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    {konflik.pemeriksa ? (
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {konflik.pemeriksa.nama_lengkap?.[0] || konflik.pemeriksa.email[0]}
                          </span>
                        </div>
                        <span className="text-sm">
                          {konflik.pemeriksa.nama_lengkap || konflik.pemeriksa.email}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(konflik.tanggal_periksa)}
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

                          {/* 🔒 View - requires konflik:read permission */}
                          {permissions.konflik.read && (
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/konflik/${konflik.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Detail
                            </DropdownMenuItem>
                          )}

                          {/* 🔒 Delete - requires konflik:delete permission */}
                          {permissions.konflik.delete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteId(konflik.id)}
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
        title="Hapus Pemeriksaan Konflik"
        description="Apakah Anda yakin ingin menghapus data pemeriksaan konflik ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        confirmText="Hapus"
        variant="destructive"
      />
    </>
  );
}