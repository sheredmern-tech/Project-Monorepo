// ============================================================================
// FILE: app/(dashboard)/klien/[id]/edit/page.tsx
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { KlienForm } from "@/components/forms/klien-form";
import { useKlien } from "@/lib/hooks/use-klien";
import { KlienEntity, UpdateKlienDto } from "@/types";

export default function KlienEditPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchKlienById, updateKlien, isLoading } = useKlien();
  const [klien, setKlien] = useState<KlienEntity | null>(null);
  const [isLoadingKlien, setIsLoadingKlien] = useState(true);

  useEffect(() => {
    const loadKlien = async () => {
      if (params.id && fetchKlienById) {
        try {
          setIsLoadingKlien(true);
          const data = await fetchKlienById(params.id as string);
          setKlien(data);
        } catch (error) {
          console.error("Failed to load klien:", error);
        } finally {
          setIsLoadingKlien(false);
        }
      }
    };
    loadKlien();
  }, [params.id, fetchKlienById]);

  const handleSubmit = async (data: UpdateKlienDto) => {
    if (!updateKlien) {
      console.error("updateKlien method is not available");
      return;
    }

    try {
      await updateKlien(params.id as string, data);
      router.push(`/dashboard/klien/${params.id}`);
    } catch (error) {
      // Error handled by hook
      console.error("Failed to update klien:", error);
    }
  };

  if (isLoadingKlien) {
    return <LoadingSpinner />;
  }

  if (!klien) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Data klien tidak ditemukan</p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/klien")}
          className="mt-4"
        >
          Kembali ke Daftar Klien
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      <PageHeader
        title="Edit Klien"
        description={`Perbarui informasi klien - ${klien.nama}`}
      />

      <div className="max-w-3xl">
        <KlienForm
          initialData={klien}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => router.push(`/dashboard/klien/${params.id}`)}
          mode="edit"
        />
      </div>
    </div>
  );
}