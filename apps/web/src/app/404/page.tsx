// ============================================================================
// FILE: app/404/page.tsx - Not Found Page
// ============================================================================
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
            <FileQuestion className="h-8 w-8 text-amber-500" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Error 404</p>
            <CardTitle className="text-2xl">Halaman Tidak Ditemukan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            Maaf, halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
            Silakan periksa kembali URL atau kembali ke halaman utama.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Saran:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Periksa ejaan URL</li>
              <li>• Gunakan menu navigasi</li>
              <li>• Coba fitur pencarian</li>
            </ul>
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
