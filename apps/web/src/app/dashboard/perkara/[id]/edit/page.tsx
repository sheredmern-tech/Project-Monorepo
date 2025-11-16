// ============================================================================
// FILE: app/(dashboard)/perkara/[id]/edit/page.tsx - FIXED
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PerkaraForm } from "@/components/forms/perkara-form";
import { perkaraApi } from "@/lib/api/perkara.api";
import { usePerkara } from "@/lib/hooks/use-perkara";
import { PerkaraEntity, UpdatePerkaraDto } from "@/types";
import { toast } from "sonner";

export default function PerkaraEditPage() {
  const params = useParams();
  const router = useRouter();
  const { updatePerkara, isLoading: isUpdating } = usePerkara();
  const [perkara, setPerkara] = useState<PerkaraEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ FIX: Load perkara data without hook function
  useEffect(() => {
    const loadPerkara = async () => {
      if (!params.id) return;

      try {
        setIsLoading(true);
        const data = await perkaraApi.getById(params.id as string);
        setPerkara(data);
      } catch (err) {
        console.error("Failed to load perkara:", err);
        toast.error("Gagal memuat data perkara");
        router.push("/dashboard/perkara");
      } finally {
        setIsLoading(false);
      }
    };

    loadPerkara();
  }, [params.id, router]); // ✅ Only depend on params.id and router

  const handleSubmit = async (data: UpdatePerkaraDto) => {
    try {
      await updatePerkara(params.id as string, data);
      router.push(`/dashboard/perkara/${params.id}`);
    } catch (err) {
      // Error handled by hook
      console.error("Update failed:", err);
    }
  };

  if (isLoading || !perkara) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      <PageHeader
        title="Edit Perkara"
        description={`Perbarui data perkara ${perkara.nomor_perkara}`}
      />

      <div className="max-w-4xl">
        <PerkaraForm
          initialData={perkara}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
          onCancel={() => router.push(`/dashboard/perkara/${params.id}`)}
          mode="edit"
        />
      </div>
    </div>
  );
}