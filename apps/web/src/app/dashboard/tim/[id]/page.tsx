// ============================================================================
// FILE: app/(dashboard)/tim/[id]/page.tsx - COMPLETE FIXED VERSION
// ✅ Added Delete Avatar functionality
// ✅ Better email invitation feedback with loading states
// ============================================================================
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Edit,
  Trash2,
  Shield,
  Key,
  Send,
  Power,
  Upload,
  MoreVertical,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EditUserDialog } from "@/components/modals/edit-user-dialog";
import { UserActivityLog } from "@/components/tim/user-activity-log";
import { timApi } from "@/lib/api/tim.api";
import { usePermission } from "@/lib/hooks/use-permission";
import { UserWithStats, UserEntity } from "@/types";
import { formatDate } from "@/lib/utils/date";
import { useToast } from "@/lib/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

export default function TimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const permissions = usePermission();

  const [user, setUser] = useState<UserWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [deleteAvatarDialogOpen, setDeleteAvatarDialogOpen] = useState(false);
  
  // Action states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (params.id) {
        const userData = await timApi.getUserById(params.id as string);
        setUser(userData);
      }
    } catch (err) {
      console.error("Failed to load user:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Gagal memuat data user"
      );
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleUpdate = async (id: string, data: Partial<UserEntity>) => {
    try {
      await timApi.updateUser(id, data);
      toast({
        title: "Berhasil",
        description: "Data user berhasil diupdate",
      });
      await loadUser();
    } catch (err) {
      toast({
        title: "Gagal",
        description: err instanceof Error ? err.message : "Gagal update user",
        variant: "destructive",
      });
      throw err;
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await timApi.deleteUser(params.id as string);
      toast({
        title: "Berhasil",
        description: "User berhasil dihapus",
      });
      router.push("/dashboard/tim");
    } catch (err) {
      toast({
        title: "Gagal",
        description: err instanceof Error ? err.message : "Gagal menghapus user",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setIsResettingPassword(true);
      const result = await timApi.resetUserPassword(params.id as string);
      
      sonnerToast.success(
        `Password direset. Password sementara: ${result.temporary_password}`,
        { duration: 10000 }
      );
      
      setResetPasswordDialogOpen(false);
    } catch (err) {
      console.error('Reset password error:', err);
      toast({
        title: "Gagal",
        description: "Gagal mereset password",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    
    try {
      setIsTogglingStatus(true);
      await timApi.toggleUserStatus(user.id, !user.is_active);
      toast({
        title: "Berhasil",
        description: `User ${!user.is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
      });
      await loadUser();
    } catch (err) {
      console.error('Toggle status error:', err);
      toast({
        title: "Gagal",
        description: "Gagal mengubah status user",
        variant: "destructive",
      });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleSendInvitation = async () => {
    try {
      setIsSendingInvitation(true);
      const result = await timApi.sendInvitationEmail(params.id as string);
      
      if (result.success) {
        toast({
          title: "Email Terkirim",
          description: `Undangan berhasil dikirim ke ${user?.email}`,
        });
      } else {
        toast({
          title: "Gagal Mengirim Email",
          description: result.message || "Gagal mengirim email undangan",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Send invitation error:', err);
      toast({
        title: "Gagal",
        description: "Gagal mengirim email undangan",
        variant: "destructive",
      });
    } finally {
      setIsSendingInvitation(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      await timApi.uploadAvatar(params.id as string, file);
      toast({
        title: "Berhasil",
        description: "Foto profil berhasil diupdate",
      });
      await loadUser();
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast({
        title: "Gagal",
        description: "Gagal mengupload foto profil",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setIsDeletingAvatar(true);
      await timApi.deleteAvatar(params.id as string);
      toast({
        title: "Berhasil",
        description: "Foto profil berhasil dihapus",
      });
      await loadUser();
      setDeleteAvatarDialogOpen(false);
    } catch (err) {
      console.error('Delete avatar error:', err);
      toast({
        title: "Gagal",
        description: err instanceof Error ? err.message : "Gagal menghapus foto profil",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {error || "Data user tidak ditemukan"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials =
    user.nama_lengkap
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || user.email[0].toUpperCase();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "advokat":
        return "bg-blue-500";
      case "paralegal":
        return "bg-purple-500";
      case "staff":
        return "bg-green-500";
      case "klien":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <div className="flex gap-2">
          {permissions.tim.update && (
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profil
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {permissions.tim.update && (
                <DropdownMenuItem
                  onClick={handleToggleStatus}
                  disabled={isTogglingStatus}
                >
                  <Power className="mr-2 h-4 w-4" />
                  {user.is_active ? 'Nonaktifkan' : 'Aktifkan'} User
                </DropdownMenuItem>
              )}

              {permissions.tim.update && (
                <DropdownMenuItem
                  onClick={() => setResetPasswordDialogOpen(true)}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Reset Password
                </DropdownMenuItem>
              )}

              {permissions.tim.update && (
                <DropdownMenuItem
                  onClick={handleSendInvitation}
                  disabled={isSendingInvitation}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSendingInvitation ? 'Mengirim...' : 'Kirim Undangan'}
                </DropdownMenuItem>
              )}

              {permissions.tim.update && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Ganti Foto
                  </DropdownMenuItem>

                  {user.avatar_url && (
                    <DropdownMenuItem
                      onClick={() => setDeleteAvatarDialogOpen(true)}
                      className="text-orange-600"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Hapus Foto
                    </DropdownMenuItem>
                  )}

                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                  />
                </>
              )}

              {permissions.users.delete && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus User
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Header */}
      <div>
        <PageHeader
          title={user.nama_lengkap || "User"}
          description={user.jabatan || user.email}
        />

        <div className="flex items-center gap-4 mt-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`capitalize ${getRoleBadgeColor(user.role)} text-white`}
              >
                {user.role}
              </Badge>
              {user.role === "admin" && (
                <Badge variant="outline">
                  <Shield className="mr-1 h-3 w-3" />
                  Administrator
                </Badge>
              )}
              {user.is_active ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20">
                  Aktif
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/20">
                  Tidak Aktif
                </Badge>
              )}
            </div>
            {user.email && (
              <p className="text-sm text-muted-foreground">{user.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="activity">Aktivitas</TabsTrigger>
          <TabsTrigger value="statistics">Statistik</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Main Info */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                    <p className="font-medium">{user.nama_lengkap || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <Badge
                      variant="secondary"
                      className={`capitalize ${getRoleBadgeColor(user.role)} text-white`}
                    >
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  {user.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                  )}

                  {user.telepon && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telepon</p>
                        <p className="font-medium">{user.telepon}</p>
                      </div>
                    </div>
                  )}

                  {user.jabatan && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Jabatan</p>
                        <p className="font-medium">{user.jabatan}</p>
                      </div>
                    </div>
                  )}

                  {user.alamat && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Alamat</p>
                        <p className="font-medium">{user.alamat}</p>
                      </div>
                    </div>
                  )}

                  {user.tanggal_bergabung && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Bergabung</p>
                        <p className="font-medium">
                          {formatDate(user.tanggal_bergabung)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {user.spesialisasi && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Spesialisasi</p>
                      <p className="text-sm">{user.spesialisasi}</p>
                    </div>
                  </>
                )}

                {(user.nomor_kta || user.nomor_berita_acara) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      {user.nomor_kta && (
                        <div>
                          <p className="text-sm text-muted-foreground">Nomor KTA</p>
                          <p className="font-medium">{user.nomor_kta}</p>
                        </div>
                      )}
                      {user.nomor_berita_acara && (
                        <div>
                          <p className="text-sm text-muted-foreground">Nomor Berita Acara</p>
                          <p className="font-medium">{user.nomor_berita_acara}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Stats Sidebar */}
            <Card>
              <CardHeader>
                <CardTitle>Statistik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Perkara Dibuat</span>
                  <Badge variant="secondary" className="text-lg">
                    {user._count?.perkara_dibuat || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Tugas Ditugaskan</span>
                  <Badge variant="secondary" className="text-lg">
                    {user._count?.tugas_ditugaskan || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Tim Perkara</span>
                  <Badge variant="secondary" className="text-lg">
                    {user._count?.tim_perkara || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Klien Dibuat</span>
                  <Badge variant="secondary" className="text-lg">
                    {user._count?.klien_dibuat || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Dokumen Diunggah</span>
                  <Badge variant="secondary" className="text-lg">
                    {user._count?.dokumen_diunggah || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <UserActivityLog
            userId={user.id}
            userName={user.nama_lengkap || user.email}
          />
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performa & Kontribusi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Perkara Aktif</span>
                      <span className="text-sm text-muted-foreground">
                        {user._count?.perkara_dibuat || 0} total
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${Math.min((user._count?.perkara_dibuat || 0) * 10, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Tugas Diselesaikan</span>
                      <span className="text-sm text-muted-foreground">
                        {user._count?.tugas_ditugaskan || 0} tugas
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${Math.min((user._count?.tugas_ditugaskan || 0) * 10, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Dokumen Diupload</span>
                      <span className="text-sm text-muted-foreground">
                        {user._count?.dokumen_diunggah || 0} dokumen
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${Math.min((user._count?.dokumen_diunggah || 0) * 5, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {user && (
        <EditUserDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={user}
          onUpdate={handleUpdate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus user{" "}
              <span className="font-semibold">
                {user.nama_lengkap || user.email}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password User?</AlertDialogTitle>
            <AlertDialogDescription>
              Password user akan direset dan password sementara akan ditampilkan.
              Pastikan untuk menyalin dan mengirimkannya ke user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResettingPassword}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPassword}
              disabled={isResettingPassword}
            >
              {isResettingPassword ? "Mereset..." : "Reset Password"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Avatar Dialog */}
      <AlertDialog open={deleteAvatarDialogOpen} onOpenChange={setDeleteAvatarDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Foto Profil?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus foto profil user ini?
              Foto profil akan kembali ke default avatar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAvatar}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAvatar}
              disabled={isDeletingAvatar}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeletingAvatar ? "Menghapus..." : "Hapus Foto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}