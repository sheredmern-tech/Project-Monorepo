// ============================================================================
// FILE: app/(auth)/register/page.tsx - PHASE 1: TYPE-SAFE KLIEN REGISTRATION
// ============================================================================
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Mail, Phone, Briefcase, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/use-auth";
import { registerSchema, RegisterFormData } from "@/lib/schemas/auth.schema";
import { APP_NAME } from "@/lib/config/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { UserRole } from "@/types/enums"; // ✅ Import enum

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword: _confirmPassword, ...registerData } = data;
      
      // ✅ PHASE 1: Use UserRole enum for type safety
      await registerUser({
        ...registerData,
        role: UserRole.KLIEN // 🔒 Type-safe KLIEN enum
      });
    } catch {
      // Error handled by useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Buat Akun Baru</h1>
        <p className="text-muted-foreground mt-2">
          Daftar ke {APP_NAME} untuk memulai manajemen kasus hukum Anda
        </p>
      </div>

      {/* ✅ INFO ALERT: Explain this is client registration */}
      <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <InfoIcon className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Registrasi ini untuk <strong>Klien</strong>. Jika Anda adalah staff firma hukum, 
          silakan hubungi administrator untuk mendapatkan akses.
        </AlertDescription>
      </Alert>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="nama_lengkap"
              placeholder="John Doe"
              className="pl-10"
              disabled={isLoading}
              {...register("nama_lengkap")}
            />
          </div>
          {errors.nama_lengkap && (
            <p className="text-sm text-destructive">{errors.nama_lengkap.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="nama@firma.com"
              className="pl-10"
              disabled={isLoading}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="jabatan">
              Jabatan <span className="text-muted-foreground text-xs">(Opsional)</span>
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="jabatan"
                placeholder="CEO, Manager, dll"
                className="pl-10"
                disabled={isLoading}
                {...register("jabatan")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telepon">
              Telepon <span className="text-muted-foreground text-xs">(Opsional)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="telepon"
                placeholder="08123456789"
                className="pl-10"
                disabled={isLoading}
                {...register("telepon")}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 karakter dengan huruf besar, kecil, dan angka"
              className="pl-10"
              disabled={isLoading}
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Ulangi password Anda"
              className="pl-10"
              disabled={isLoading}
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sedang mendaftar...
            </>
          ) : (
            <>
              Daftar Sekarang
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Atau
          </span>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link 
            href="/login" 
            className="font-medium text-primary hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}