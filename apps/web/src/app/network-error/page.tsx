// ============================================================================
// FILE: app/network-error/page.tsx - Network Error Page
// ============================================================================
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { useState } from "react";

export default function NetworkErrorPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        router.push('/');
      } else {
        alert('Masih tidak dapat terhubung. Silakan coba lagi.');
      }
    } catch {
      alert('Koneksi masih bermasalah. Periksa koneksi internet Anda.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center">
            <WifiOff className="h-8 w-8 text-orange-500" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Koneksi Terputus</p>
            <CardTitle className="text-2xl">Tidak Ada Koneksi</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            Tidak dapat terhubung ke server. Pastikan koneksi internet Anda
            aktif dan stabil.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Langkah troubleshooting:</p>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Periksa koneksi WiFi atau data seluler</li>
              <li>• Restart router jika diperlukan</li>
              <li>• Coba matikan dan nyalakan mode pesawat</li>
              <li>• Hubungi IT support jika masalah berlanjut</li>
            </ul>
          </div>

          <div className="flex gap-2 justify-center pt-2">
            <Button 
              onClick={handleCheckConnection} 
              variant="outline"
              disabled={isChecking}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Memeriksa...' : 'Cek Koneksi'}
            </Button>
            <Button onClick={() => router.push("/")} disabled={isChecking}>
              <Home className="mr-2 h-4 w-4" />
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
