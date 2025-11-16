// ============================================================================
// FILE: app/(dashboard)/sidang/[id]/edit/page.tsx - NEW
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { SidangForm } from "@/components/forms/sidang-form";
import { useSidang } from "@/lib/hooks/use-sidang";
import { JadwalSidangEntity, UpdateJadwalSidangDto } from "@/types";

export default function SidangEditPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchSidangById, updateSidang, isLoading } = useSidang();
  const [sidang, setSidang] = useState<JadwalSidangEntity | null>(null);

  useEffect(() => {
    const loadSidang = async () => {
      if (params.id) {
        const data = await fetchSidangById(params.id as string);
        setSidang(data);
      }
    };
    loadSidang();
  }, [params.id, fetchSidangById]);

  const handleSubmit = async (data: UpdateJadwalSidangDto) => {
    try {
      await updateSidang(params.id as string, data);
      router.push(`/dashboard/sidang/${params.id}`);
    } catch {
      // Error handled by hook
    }
  };

  if (!sidang) {
    return <FormSkeleton />;
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      <PageHeader
        title="Edit Jadwal Sidang"
        description={`Perbarui informasi jadwal sidang`}
      />

      <div className="max-w-3xl">
        <SidangForm
          initialData={sidang}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => router.push(`/dashboard/sidang/${params.id}`)}
          mode="edit"
        />
      </div>
    </div>
  );
}