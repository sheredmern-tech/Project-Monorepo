// ============================================================================
// FILE: app/401/page.tsx
// ============================================================================
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ArrowLeft, Home, Mail } from "lucide-react";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Error 401</p>
            <CardTitle className="text-2xl">Akses Ditolak</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            Anda tidak memiliki izin untuk mengakses halaman ini.
            Silakan hubungi administrator jika Anda memerlukan akses.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Butuh bantuan?</p>
            <Button variant="outline" size="sm" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Hubungi Administrator
            </Button>
          </div>

          <div className="flex gap-2 justify-center pt-2">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
            <Button onClick={() => router.push("/")}>
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}