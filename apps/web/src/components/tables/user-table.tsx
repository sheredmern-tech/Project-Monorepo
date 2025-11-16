// ============================================================================
// FILE: components/tables/user-table.tsx - FIXED COMPLETE ✅
// ============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  UserCog,
  Power,
  PowerOff,
  Send,
  AlertCircle
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { TablePagination } from "@/components/tables/table-pagination";
import { UserEntity } from "@/types";
import { usePermission } from "@/lib/hooks/use-permission";
import { formatDate } from "@/lib/utils/format";
import { handleApiError } from "@/lib/utils/error-handler";
import { toast } from "sonner";

interface UserTableProps {
  data: UserEntity[];
  isLoading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  selectedIds?: string[];
  onSelectUser?: (userId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string, active: boolean) => Promise<void>;
  onSendInvitation: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  showCheckboxes?: boolean;
}

export function UserTable({ 
  data, 
  isLoading, 
  error,
  page, 
  limit, 
  total,
  selectedIds = [],
  onSelectUser,
  onSelectAll,
  onPageChange,
  onDelete,
  onToggleStatus,
  onSendInvitation,
  onRefresh,
  showCheckboxes = false
}: UserTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [sendingInviteId, setSendingInviteId] = useState<string | null>(null);

  // 🔒 RBAC: Get user permissions
  const permissions = usePermission();

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-500 text-white",
      advokat: "bg-blue-500 text-white",
      paralegal: "bg-purple-500 text-white",
      staff: "bg-green-500 text-white",
      klien: "bg-gray-500 text-white",
    };
    return colors[role] || "";
  };

  const getInitials = (user: UserEntity) => {
    return user.nama_lengkap
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || user.email[0].toUpperCase();
  };

  // ✅ Enhanced delete
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await onDelete(deleteId);
      toast.success("User berhasil dihapus");
      setDeleteId(null);
      await onRefresh();
    } catch (error) {
      handleApiError(error, "Gagal menghapus user");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Toggle user status
  const handleToggleStatus = async (id: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setTogglingId(id);
      await onToggleStatus(id, !currentStatus);
      toast.success(`User berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
      await onRefresh();
    } catch (error) {
      handleApiError(error, "Gagal mengubah status user");
    } finally {
      setTogglingId(null);
    }
  };

  // ✅ Send invitation
  const handleSendInvitation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setSendingInviteId(id);
      await onSendInvitation(id);
      toast.success("Email undangan berhasil dikirim");
    } catch (error) {
      handleApiError(error, "Gagal mengirim email undangan");
    } finally {
      setSendingInviteId(null);
    }
  };

  // ✅ Calculate selection states
  const allSelected = data.length > 0 && data.every(user => selectedIds.includes(user.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  // ✅ Loading State
  if (isLoading) {
    return <TableSkeleton rows={10} columns={showCheckboxes ? 7 : 6} />;
  }

  // ✅ Error State
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={onRefresh}>
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
        icon={UserCog}
        title="Belum ada user"
        description="Mulai dengan menambahkan user baru"
        action={{
          label: "Tambah User",
          onClick: () => router.push("/dashboard/tim/baru"),
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
              {showCheckboxes && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={someSelected ? "indeterminate" : allSelected}
                    onCheckedChange={(checked) => onSelectAll?.(!!checked)}
                  />
                </TableHead>
              )}
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user) => {
              const isSelected = selectedIds.includes(user.id);
              const isToggling = togglingId === user.id;
              const isSendingInvite = sendingInviteId === user.id;

              // 🎯 Check if user has ANY action permission
              const hasAnyAction = permissions.tim.read || permissions.tim.update || permissions.users.delete;

              return (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/dashboard/tim/${user.id}`)}
                >
                  {showCheckboxes && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelectUser?.(user.id, !!checked)}
                      />
                    </TableCell>
                  )}

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.nama_lengkap || user.email}</p>
                        {user.jabatan && (
                          <p className="text-sm text-muted-foreground">{user.jabatan}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={user.role === "klien" ? "outline" : "secondary"}
                      className={`capitalize ${getRoleBadgeColor(user.role)}`}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {user.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}
                      {user.telepon && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{user.telepon}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {user.is_active ? (
                      <Badge variant="default" className="bg-green-500">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Tidak Aktif
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.tanggal_bergabung)}
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {/* 🎯 Only show dropdown if user has any action permission */}
                    {hasAnyAction && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isToggling || isSendingInvite}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          {/* 🔒 View - requires tim:read permission */}
                          {permissions.tim.read && (
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/tim/${user.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Detail
                            </DropdownMenuItem>
                          )}

                          {/* 🔒 Edit - requires tim:update permission */}
                          {permissions.tim.update && (
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/tim/${user.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}

                          {/* 🔒 Toggle Status & Send Invitation - requires tim:update permission */}
                          {permissions.tim.update && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => handleToggleStatus(user.id, user.is_active, e)}
                                disabled={isToggling}
                              >
                                {user.is_active ? (
                                  <>
                                    <PowerOff className="mr-2 h-4 w-4" />
                                    {isToggling ? "Processing..." : "Nonaktifkan"}
                                  </>
                                ) : (
                                  <>
                                    <Power className="mr-2 h-4 w-4" />
                                    {isToggling ? "Processing..." : "Aktifkan"}
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => handleSendInvitation(user.id, e)}
                                disabled={isSendingInvite}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                {isSendingInvite ? "Mengirim..." : "Kirim Undangan"}
                              </DropdownMenuItem>
                            </>
                          )}

                          {/* 🔒 Delete - requires users:delete permission */}
                          {permissions.users.delete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteId(user.id)}
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
        title="Hapus User"
        description="Apakah Anda yakin ingin menghapus user ini? Semua data terkait akan ikut terhapus. Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Menghapus..." : "Hapus"}
        variant="destructive"
      />
    </>
  );
}