// ============================================================================
// FILE: app/(dashboard)/klien/profile/page.tsx - 🆕 NEW CLIENT PROFILE PAGE
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, User, Mail, Phone, MapPin, Building, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useKlien } from "@/lib/hooks/use-klien";
import { useAuthStore } from "@/lib/stores/auth.store";
import { UserRole } from "@/types/enums";
import { KlienWithPerkara } from "@/types";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";

export default function ClientProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchMyProfile, isLoading } = useKlien();
  const [profile, setProfile] = useState<KlienWithPerkara | null>(null);

  // ✅ SECURITY: Only clients can access this page
  useEffect(() => {
    if (user && user.role !== UserRole.KLIEN) {
      console.log('🔀 Non-client detected, redirecting...');
      toast.error('Halaman ini hanya untuk klien');
      router.replace('/');
      return;
    }
  }, [user, router]);

  // ✅ Load client profile
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.role !== UserRole.KLIEN) return;

      try {
        const data = await fetchMyProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Gagal memuat profil");
      }
    };

    loadProfile();
  }, [user, fetchMyProfile]);

  // ✅ Redirect non-clients
  if (user && user.role !== UserRole.KLIEN) {
    return <LoadingSpinner />;
  }

  if (isLoading || !profile) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Profil Saya"
        description="Informasi profil dan perkara Anda"
        action={
          <Button variant="outline" onClick={() => router.push("/klien/profile/edit")}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profil
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Profile Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.nama}</CardTitle>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {profile.jenis_klien}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contact Info */}
            <div className="space-y-3">
              {profile.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>
              )}

              {profile.telepon && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telepon</p>
                    <p className="font-medium">{profile.telepon}</p>
                  </div>
                </div>
              )}

              {profile.telepon_alternatif && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telepon Alternatif</p>
                    <p className="font-medium">{profile.telepon_alternatif}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Address */}
            {profile.alamat && (
              <>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Alamat</p>
                    <p className="font-medium">{profile.alamat}</p>
                    {(profile.kelurahan || profile.kecamatan || profile.kota || profile.provinsi) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {[profile.kelurahan, profile.kecamatan, profile.kota, profile.provinsi]
                          .filter(Boolean)
                          .join(", ")}
                        {profile.kode_pos && ` - ${profile.kode_pos}`}
                      </p>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Identity */}
            <div className="grid grid-cols-2 gap-4">
              {profile.nomor_identitas && (
                <div>
                  <p className="text-sm text-muted-foreground">Nomor Identitas</p>
                  <p className="font-medium">{profile.nomor_identitas}</p>
                </div>
              )}
              {profile.npwp && (
                <div>
                  <p className="text-sm text-muted-foreground">NPWP</p>
                  <p className="font-medium">{profile.npwp}</p>
                </div>
              )}
            </div>

            {/* Company Info (if applicable) */}
            {profile.jenis_klien === "perusahaan" && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Informasi Perusahaan</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 ml-7">
                    {profile.nama_perusahaan && (
                      <div>
                        <p className="text-sm text-muted-foreground">Nama Perusahaan</p>
                        <p className="font-medium">{profile.nama_perusahaan}</p>
                      </div>
                    )}
                    {profile.bentuk_badan_usaha && (
                      <div>
                        <p className="text-sm text-muted-foreground">Bentuk Badan Usaha</p>
                        <p className="font-medium">{profile.bentuk_badan_usaha}</p>
                      </div>
                    )}
                    {profile.nomor_akta && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Nomor Akta</p>
                        <p className="font-medium">{profile.nomor_akta}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Emergency Contact */}
            {(profile.nama_kontak_darurat || profile.telepon_kontak_darurat) && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Kontak Darurat</p>
                  <div className="grid grid-cols-2 gap-4">
                    {profile.nama_kontak_darurat && (
                      <div>
                        <p className="text-xs text-muted-foreground">Nama</p>
                        <p className="font-medium">{profile.nama_kontak_darurat}</p>
                      </div>
                    )}
                    {profile.telepon_kontak_darurat && (
                      <div>
                        <p className="text-xs text-muted-foreground">Telepon</p>
                        <p className="font-medium">{profile.telepon_kontak_darurat}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            {profile.catatan && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Catatan</p>
                  <p className="text-sm whitespace-pre-wrap">{profile.catatan}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Registration Date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Terdaftar sejak {formatDate(profile.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Stats & Cases */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Statistik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Perkara</span>
                  <Badge variant="secondary">{profile._count?.perkara || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cases Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Perkara Saya</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push("/perkara")}
                >
                  Lihat Semua
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile.perkara && profile.perkara.length > 0 ? (
                <div className="space-y-3">
                  {profile.perkara.slice(0, 5).map((perkara) => (
                    <div
                      key={perkara.id}
                      className="cursor-pointer rounded-lg border p-3 hover:bg-accent transition-colors"
                      onClick={() => router.push(`/perkara/${perkara.id}`)}
                    >
                      <p className="font-medium text-sm">{perkara.nomor_perkara}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {perkara.judul}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {perkara.jenis_perkara.replace(/_/g, " ")}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {perkara.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(perkara.created_at)}
                      </p>
                    </div>
                  ))}
                  {profile.perkara.length > 5 && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => router.push("/perkara")}
                    >
                      Lihat {profile.perkara.length - 5} Perkara Lainnya
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-3">
                    Belum ada perkara yang terdaftar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hubungi firma hukum kami untuk mendaftarkan perkara baru
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/perkara")}
              >
                Lihat Perkara Saya
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/dokumen")}
              >
                Dokumen Saya
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/sidang")}
              >
                Jadwal Sidang
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}