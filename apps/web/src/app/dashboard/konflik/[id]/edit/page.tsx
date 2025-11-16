// ============================================================================
// FILE 2: app/(dashboard)/konflik/[id]/edit/page.tsx
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { KonflikForm } from "@/components/forms/konflik-form";
import { konflikApi } from "@/lib/api/konflik.api";
import { KonflikWithRelations, UpdateKonflikDto } from "@/types";
import { toast } from "sonner";

export default function KonflikEditPage() {
  const params = useParams();
  const router = useRouter();
  const [konflik, setKonflik] = useState<KonflikWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadKonflik = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (params.id) {
          const response = await konflikApi.getById(params.id as string);
          
          // Handle both response formats
          if (response && 'success' in response && response.success && 'data' in response) {
            setKonflik(response.data);
          } else if (response && typeof response === 'object' && 'id' in response) {
            setKonflik(response as unknown as KonflikWithRelations);
          } else {
            setError("Format response tidak valid");
          }
        }
      } catch (err) {
        console.error("Failed to load konflik", err);
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Gagal memuat data konflik");
        toast.error("Gagal memuat data konflik");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadKonflik();
  }, [params.id]);

  const handleSubmit = async (data: UpdateKonflikDto) => {
    try {
      setIsSubmitting(true);
      
      await konflikApi.update(params.id as string, data);
      
      toast.success("Pemeriksaan konflik berhasil diperbarui");
      
      router.push(`/dashboard/konflik/${params.id}`);
    } catch (err) {
      console.error("Failed to update konflik", err);
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Gagal memperbarui pemeriksaan konflik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FormSkeleton />
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
          title="Edit Pemeriksaan Konflik"
          description={`Perbarui data pemeriksaan untuk ${konflik.nama_klien}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Pemeriksaan Konflik</CardTitle>
        </CardHeader>
        <CardContent>
          <KonflikForm
            initialData={{
              perkara_id: konflik.perkara_id || undefined,
              nama_klien: konflik.nama_klien,
              pihak_lawan: konflik.pihak_lawan,
              ada_konflik: konflik.ada_konflik,
              detail_konflik: konflik.detail_konflik || undefined,
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}