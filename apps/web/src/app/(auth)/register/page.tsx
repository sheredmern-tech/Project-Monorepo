// ============================================================================
// FILE: app/(auth)/register/page.tsx - DISABLED (INTERNAL ADMIN ONLY)
// ============================================================================
"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { APP_NAME } from "@/lib/config/constants";

export default function RegisterPage() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Pendaftaran Ditutup</h1>
        <p className="text-muted-foreground mt-2">
          {APP_NAME} adalah sistem internal untuk staff firma hukum
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <AlertCircle className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-900 dark:text-amber-200 mb-2">
          Sistem Internal - Akses Terbatas
        </AlertTitle>
        <AlertDescription className="text-amber-800 dark:text-amber-300 space-y-2">
          <p>
            Registrasi publik tidak tersedia. Sistem ini adalah <strong>platform administrasi internal</strong> yang
            hanya dapat diakses oleh staff firma hukum yang berwenang.
          </p>
          <p className="mt-3">
            Jika Anda adalah:
          </p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>Staff Firma Hukum</strong>: Hubungi administrator sistem untuk mendapatkan akun</li>
            <li><strong>Klien</strong>: Silakan hubungi firma hukum kami melalui kontak resmi</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Back to Login */}
      <div className="flex flex-col gap-3">
        <Link href="/login">
          <Button className="w-full h-11" variant="default">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Halaman Login
          </Button>
        </Link>

        <Link href="/">
          <Button className="w-full h-11" variant="outline">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}
