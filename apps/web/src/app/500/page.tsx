// ============================================================================
// FILE: app/500/page.tsx - Server Error Page
// ============================================================================
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServerCrash, Home, RefreshCw } from "lucide-react";

export default function ServerErrorPage() {
  const router = useRouter();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <ServerCrash className="h-8 w-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Error 500</p>
            <CardTitle className="text-2xl">Kesalahan Server</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            Terjadi kesalahan pada server. Tim kami telah diberitahu dan sedang
            memperbaiki masalah ini. Silakan coba beberapa saat lagi.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Yang bisa Anda lakukan:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Refresh halaman</li>
              <li>• Coba beberapa menit lagi</li>
              <li>• Hubungi support jika masalah berlanjut</li>
            </ul>
          </div>

          <div className="flex gap-2 justify-center pt-2">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
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