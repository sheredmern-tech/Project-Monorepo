// ============================================================================
// FILE: app/(dashboard)/tugas/[id]/edit/page.tsx
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { TugasForm } from "@/components/forms/tugas-form";
import { useTugas } from "@/lib/hooks/use-tugas";
import { TugasEntity, UpdateTugasDto } from "@/types";

export default function TugasEditPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchTugasById, updateTugas, isLoading } = useTugas();
  const [tugas, setTugas] = useState<TugasEntity | null>(null);

  useEffect(() => {
    const loadTugas = async () => {
      if (params.id) {
        const data = await fetchTugasById(params.id as string);
        setTugas(data);
      }
    };
    loadTugas();
  }, [params.id, fetchTugasById]);

  const handleSubmit = async (data: UpdateTugasDto) => {
    try {
      await updateTugas(params.id as string, data);
      router.push(`/dashboard/tugas/${params.id}`);
    } catch {
      // Error handled by hook
    }
  };

  if (!tugas) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      <PageHeader
        title="Edit Tugas"
        description={`Perbarui informasi tugas - ${tugas.judul}`}
      />

      <div className="max-w-3xl">
        <TugasForm
          initialData={tugas}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => router.push(`/dashboard/tugas/${params.id}`)}
          mode="edit"
        />
      </div>
    </div>
  );
}
