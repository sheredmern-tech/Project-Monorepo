// ============================================================================
// FILE: app/dashboard/profile/page.tsx - Self Profile Page
// ============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useAuthStore } from "@/lib/stores/auth.store";
import { timApi } from "@/lib/api/tim.api";
import { useToast } from "@/lib/hooks/use-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const initials = user?.nama_lengkap
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    try {
      setIsDeleting(true);
      await timApi.deleteUser(user.id);

      toast({
        title: "Akun Dihapus",
        description: "Akun Anda telah dihapus. Anda akan keluar dari sistem.",
      });

      // Logout and redirect to login
      setTimeout(() => {
        useAuthStore.getState().logout();
        router.push("/auth/login");
      }, 1500);
    } catch (err) {
      toast({
        title: "Gagal",
        description: err instanceof Error ? err.message : "Gagal menghapus akun",
        variant: "destructive",
      });
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Profil Saya"
        description="Kelola profil dan informasi akun Anda"
      />

      <div className="max-w-2xl space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Profil</CardTitle>
            <CardDescription>Detail akun dan informasi pribadi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!user ? (
              /* Show skeleton while user loading */
              <>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </>
            ) : (
              /* Show actual user data */
              <>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{user.nama_lengkap || "User"}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      Role: <span className="font-medium">{user.role}</span>
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Nama Lengkap</label>
                    <Input value={user.nama_lengkap || ""} disabled />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={user.email} disabled />
                  </div>

                  {user.jabatan && (
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Jabatan</label>
                      <Input value={user.jabatan} disabled />
                    </div>
                  )}

                  {user.telepon && (
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Telepon</label>
                      <Input value={user.telepon} disabled />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/pengaturan")}
                  >
                    Edit Profil
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone Card */}
        {user && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">🔴 Zona Bahaya</CardTitle>
              <CardDescription>
                Tindakan yang tidak dapat dibatalkan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Hapus Akun Permanen</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Setelah akun Anda dihapus, semua data akan hilang secara permanen.
                  Tindakan ini tidak dapat dibatalkan.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Akun Saya
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteConfirmText(""); // Reset text when closing
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Hapus Akun Saya?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Anda akan menghapus akun Anda sendiri secara permanen. Semua data
                terkait akun Anda akan dihapus dan Anda akan keluar dari sistem.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Ketik{" "}
                  <span className="px-2 py-0.5 bg-muted rounded font-mono text-destructive">
                    saya yakin hapus akun saya
                  </span>{" "}
                  untuk konfirmasi:
                </p>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="saya yakin hapus akun saya"
                  className="font-mono"
                  disabled={isDeleting}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirmText !== "saya yakin hapus akun saya"}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
