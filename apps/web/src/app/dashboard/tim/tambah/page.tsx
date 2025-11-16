// ============================================================================
// FILE: app/(dashboard)/tim/tambah/page.tsx - FIXED TYPE ERRORS
// ============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { timApi } from "@/lib/api/tim.api";
import { UserRole } from "@/types";

// ✅ FIXED: Validation Schema with proper boolean handling
const addUserSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string().min(8, "Password minimal 8 karakter"),
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  role: z.nativeEnum(UserRole),
  jabatan: z.string().default(""),
  nomor_kta: z.string().default(""),
  nomor_berita_acara: z.string().default(""),
  spesialisasi: z.string().default(""),
  telepon: z.string().default(""),
  alamat: z.string().default(""),
  sendInvitationEmail: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type AddUserFormData = z.infer<typeof addUserSchema>;

export default function TambahUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // ✅ FIXED: Use proper Resolver type from react-hook-form
  const form = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema) as Resolver<AddUserFormData>,
    defaultValues: {
      sendInvitationEmail: true,
      email: "",
      password: "",
      confirmPassword: "",
      nama_lengkap: "",
      role: UserRole.STAFF,
      jabatan: "",
      nomor_kta: "",
      nomor_berita_acara: "",
      spesialisasi: "",
      telepon: "",
      alamat: "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const selectedRole = watch("role");
  const sendInvitationEmail = watch("sendInvitationEmail");
  const namaLengkap = watch("nama_lengkap");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 2MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const onSubmit = async (data: AddUserFormData) => {
    try {
      setIsLoading(true);

      // Step 1: Create user
      const userData = {
        email: data.email,
        password: data.password,
        nama_lengkap: data.nama_lengkap,
        role: data.role,
        jabatan: data.jabatan || null,
        nomor_kta: data.nomor_kta || null,
        nomor_berita_acara: data.nomor_berita_acara || null,
        spesialisasi: data.spesialisasi || null,
        telepon: data.telepon || null,
        alamat: data.alamat || null,
      };

      const createdUser = await timApi.createUser(userData);

      // Step 2: Upload avatar if provided
      if (avatarFile && createdUser.id) {
        await timApi.uploadAvatar(createdUser.id, avatarFile);
      }

      // Step 3: Send invitation email if enabled
      if (data.sendInvitationEmail && createdUser.id) {
        await timApi.sendInvitationEmail(createdUser.id);
      }

      toast.success("User berhasil ditambahkan");
      router.push("/dashboard/tim");
    } catch (error) {
      console.error("Failed to add user:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menambahkan user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const roleDescriptions: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Akses penuh ke semua fitur sistem",
    [UserRole.ADVOKAT]: "Kelola perkara, klien, dokumen, dan sidang",
    [UserRole.PARALEGAL]: "Bantu advokat dalam persiapan perkara",
    [UserRole.STAFF]: "Akses terbatas untuk administrasi",
    [UserRole.KLIEN]: "Hanya dapat melihat perkara sendiri",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>

      <PageHeader
        title="Tambah Anggota Tim"
        description="Tambahkan anggota tim baru ke firma hukum"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Foto Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="text-2xl">
                  {namaLengkap
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                    disabled={isLoading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Foto
                  </Button>
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={isLoading}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Hapus
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Format: JPG, PNG. Maksimal 2MB
                </p>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama_lengkap">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama_lengkap"
                  {...register("nama_lengkap")}
                  disabled={isLoading}
                  placeholder="John Doe"
                />
                {errors.nama_lengkap && (
                  <p className="text-sm text-red-500">
                    {errors.nama_lengkap.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  disabled={isLoading}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  disabled={isLoading}
                  placeholder="Min. 8 karakter"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                  placeholder="Ulangi password"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role & Position */}
        <Card>
          <CardHeader>
            <CardTitle>Role & Jabatan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setValue("role", value as UserRole)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UserRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex flex-col">
                        <span className="font-medium capitalize">{role}</span>
                        <span className="text-xs text-muted-foreground">
                          {roleDescriptions[role]}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jabatan">Jabatan</Label>
              <Input
                id="jabatan"
                {...register("jabatan")}
                disabled={isLoading}
                placeholder="e.g., Senior Partner, Associate"
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Info (Conditional for Advokat/Paralegal) */}
        {(selectedRole === UserRole.ADVOKAT ||
          selectedRole === UserRole.PARALEGAL) && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profesional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomor_kta">Nomor KTA</Label>
                  <Input
                    id="nomor_kta"
                    {...register("nomor_kta")}
                    disabled={isLoading}
                    placeholder="Nomor Kartu Tanda Anggota"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomor_berita_acara">Nomor Berita Acara</Label>
                  <Input
                    id="nomor_berita_acara"
                    {...register("nomor_berita_acara")}
                    disabled={isLoading}
                    placeholder="Nomor BA Sumpah"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="spesialisasi">Spesialisasi</Label>
                <Textarea
                  id="spesialisasi"
                  {...register("spesialisasi")}
                  disabled={isLoading}
                  placeholder="e.g., Hukum Perdata, Pidana, Keluarga"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kontak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telepon">Telepon</Label>
              <Input
                id="telepon"
                {...register("telepon")}
                disabled={isLoading}
                placeholder="+62 812-3456-7890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea
                id="alamat"
                {...register("alamat")}
                disabled={isLoading}
                placeholder="Alamat lengkap"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Invitation */}
        <Card>
          <CardHeader>
            <CardTitle>Notifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sendInvitationEmail">
                  Kirim Email Undangan
                </Label>
                <p className="text-sm text-muted-foreground">
                  User akan menerima email dengan kredensial login
                </p>
              </div>
              <Switch
                id="sendInvitationEmail"
                checked={sendInvitationEmail}
                onCheckedChange={(checked) =>
                  setValue("sendInvitationEmail", checked)
                }
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tambah Anggota
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}