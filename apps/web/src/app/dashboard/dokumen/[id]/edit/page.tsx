// ============================================================================
// FILE: app/(dashboard)/dokumen/[id]/edit/page.tsx
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { DokumenEditForm } from "@/components/forms/dokumen-edit-form";
import { useDokumen } from "@/lib/hooks/use-dokumen";
import { DokumenEntity, UpdateDokumenDto } from "@/types";

export default function DokumenEditPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchDokumenById, updateDokumen, isLoading } = useDokumen();
  const [dokumen, setDokumen] = useState<DokumenEntity | null>(null);

  useEffect(() => {
    const loadDokumen = async () => {
      if (params.id) {
        const data = await fetchDokumenById(params.id as string);
        setDokumen(data);
      }
    };
    loadDokumen();
  }, [params.id, fetchDokumenById]);

  const handleSubmit = async (data: UpdateDokumenDto) => {
    try {
      await updateDokumen(params.id as string, data);
      router.push(`/dokumen/${params.id}`);
    } catch {
      // Error handled by hook
    }
  };

  if (!dokumen) {
    return <LoadingSpinner />;
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
          onCancel={() => router.push(`/dokumen/${params.id}`)}
        />
      </div>
    </div>
  );
}