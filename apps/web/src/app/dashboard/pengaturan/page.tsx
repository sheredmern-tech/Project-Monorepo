// ============================================================================
// FILE: app/(dashboard)/pengaturan/page.tsx
// ============================================================================
"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PengaturanPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  const initials = user.nama_lengkap
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user.email[0].toUpperCase();

  return (
    <div>
      <PageHeader
        title="Pengaturan"
        description="Kelola profil dan preferensi akun"
      />

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Informasi profil pengguna</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">Ubah Foto</Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input id="nama" defaultValue={user.nama_lengkap || ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jabatan">Jabatan</Label>
                <Input id="jabatan" defaultValue={user.jabatan || ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telepon">Telepon</Label>
                <Input id="telepon" defaultValue={user.telepon || ""} />
              </div>

              <Button>Simpan Perubahan</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Keamanan</CardTitle>
            <CardDescription>Ubah password dan pengaturan keamanan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Password Saat Ini</Label>
              <Input id="current-password" type="password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input id="new-password" type="password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
              <Input id="confirm-password" type="password" />
            </div>

            <Button>Ubah Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
