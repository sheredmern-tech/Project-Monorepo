// ============================================================================
// FILE: app/(dashboard)/dokumen/[id]/edit/page.tsx
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { DokumenEditForm } from "@/components/forms/dokumen-edit-form";
import { useDokumen } from "@/lib/hooks/use-dokumen";
import { dokumenApi } from "@/lib/api/dokumen.api";
import { DokumenEntity, UpdateDokumenDto } from "@/types";

export default function DokumenEditPage() {
  const params = useParams();
  const router = useRouter();
  const { updateDokumen, isLoading } = useDokumen();
  const [dokumen, setDokumen] = useState<DokumenEntity | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadDokumen = async () => {
      if (params.id) {
        try {
          setLoadError(null);

          // ✅ FIX: Use same approach as detail page - fetch all and filter
          // This is more reliable than fetchDokumenById
          const response = await dokumenApi.getAll({});

          // Find dokumen by ID from response data
          const documentsData = Array.isArray(response?.data) ? response.data : [];
          const found = documentsData.find((doc) => doc.id === params.id);

          if (found) {
            setDokumen(found);
          } else {
            setLoadError('Dokumen tidak ditemukan atau sudah dihapus');
          }
        } catch (error) {
          console.error('Failed to load dokumen:', error);
          setLoadError(error instanceof Error ? error.message : 'Gagal memuat dokumen');
        }
      }
    };
    loadDokumen();
  }, [params.id]);

  const handleSubmit = async (data: UpdateDokumenDto) => {
    try {
      await updateDokumen(params.id as string, data);
      router.push(`/dashboard/dokumen/${params.id}`);
    } catch {
      // Error handled by hook
    }
  };

  // Show error if dokumen not found
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-6xl">📄</div>
          <h2 className="text-2xl font-semibold">Dokumen Tidak Ditemukan</h2>
          <p className="text-muted-foreground max-w-md">{loadError}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()} variant="outline">
              Coba Lagi
            </Button>
            <Button onClick={() => router.push("/dashboard/dokumen")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Dokumen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!dokumen) {
    return <FormSkeleton />;
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      <PageHeader
        title="Edit Metadata Dokumen"
        description={`Perbarui informasi dokumen - ${dokumen.nama_dokumen}`}
      />

      <div className="max-w-3xl">
        <DokumenEditForm
          initialData={dokumen}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => router.push(`/dashboard/dokumen/${params.id}`)}
        />
      </div>
    </div>
  );
}