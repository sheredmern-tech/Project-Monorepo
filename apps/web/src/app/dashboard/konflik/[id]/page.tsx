// ============================================================================
// FILE 1: app/(dashboard)/konflik/[id]/page.tsx
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, CheckCircle, Calendar, User, FileText, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { konflikApi } from "@/lib/api/konflik.api";
import { KonflikWithRelations } from "@/types";
import { formatDate } from "@/lib/utils/date";

export default function KonflikDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [konflik, setKonflik] = useState<KonflikWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadKonflik = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (params.id) {
          console.log("Fetching konflik with ID:", params.id);
          const response = await konflikApi.getById(params.id as string);
          console.log("API Response:", response);
          
          // Handle both response formats
          if (response && 'success' in response && response.success && 'data' in response) {
            console.log("Konflik data loaded (wrapped):", response.data);
            setKonflik(response.data);
          } else if (response && typeof response === 'object' && 'id' in response) {
            console.log("Konflik data loaded (direct):", response);
            setKonflik(response as unknown as KonflikWithRelations);
          } else {
            console.error("API returned unsuccessful response:", response);
            setError("Format response tidak valid");
          }
        }
      } catch (err) {
        const error = err as { 
          response?: { 
            data?: { message?: string }; 
            status?: number 
          }; 
          message?: string 
        };
        console.error("Failed to load konflik - Full error:", err);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        setError(error.response?.data?.message || error.message || "Gagal memuat data konflik");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadKonflik();
  }, [params.id]);

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error message
  if (error || !konflik) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {error || "Data konflik tidak ditemukan"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <PageHeader
          title="Detail Pemeriksaan Konflik"
          description={`Pemeriksaan untuk ${konflik.nama_klien}`}
        />

        <div className="flex items-center gap-2 mt-4">
          {konflik.ada_konflik ? (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Ada Konflik
            </Badge>
          ) : (
            <Badge variant="default" className="gap-1 bg-green-600">
              <CheckCircle className="h-3 w-3" />
              Tidak Ada Konflik
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Pemeriksaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama Klien</p>
                <p className="font-medium">{konflik.nama_klien}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pihak Lawan</p>
                <p className="font-medium">{konflik.pihak_lawan}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Pemeriksaan</p>
                  <p className="font-medium">{formatDate(konflik.tanggal_periksa)}</p>
                </div>
              </div>

              {konflik.pemeriksa && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Diperiksa Oleh</p>
                    <p className="font-medium">{konflik.pemeriksa.nama_lengkap || konflik.pemeriksa.email}</p>
                  </div>
                </div>
              )}

              {konflik.perkara && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Perkara Terkait</p>
                    <Button
                      variant="link"
                      className="h-auto p-0 font-medium"
                      onClick={() => router.push(`/perkara/${konflik.perkara_id}`)}
                    >
                      {konflik.perkara.nomor_perkara}
                    </Button>
                    <p className="text-xs text-muted-foreground">{konflik.perkara.judul}</p>
                  </div>
                </div>
              )}
            </div>

            {konflik.detail_konflik && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Detail Konflik</p>
                  </div>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <p className="text-sm whitespace-pre-wrap">{konflik.detail_konflik}</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Status Konflik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 rounded-lg border-2" style={{
              borderColor: konflik.ada_konflik ? 'rgb(239 68 68)' : 'rgb(22 163 74)',
              backgroundColor: konflik.ada_konflik ? 'rgb(254 242 242)' : 'rgb(240 253 244)'
            }}>
              {konflik.ada_konflik ? (
                <>
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-red-600" />
                  <p className="font-semibold text-red-600">Terdeteksi Konflik</p>
                  <p className="text-xs text-red-600 mt-1">
                    Konflik kepentingan ditemukan dalam pemeriksaan
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold text-green-600">Tidak Ada Konflik</p>
                  <p className="text-xs text-green-600 mt-1">
                    Tidak ada konflik kepentingan yang terdeteksi
                  </p>
                </>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID Konflik</span>
                <span className="font-mono text-xs">{konflik.id.slice(0, 8)}...</span>
              </div>
              {konflik.perkara_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID Perkara</span>
                  <span className="font-mono text-xs">{konflik.perkara_id.slice(0, 8)}...</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/konflik/${konflik.id}/edit`)}
              >
                Edit Pemeriksaan
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/konflik")}
              >
                Lihat Semua Konflik
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
