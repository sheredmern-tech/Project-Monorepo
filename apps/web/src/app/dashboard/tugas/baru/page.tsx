// ============================================================================
// FILE: app/(dashboard)/tugas/baru/page.tsx
// ============================================================================
"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { TugasForm } from "@/components/forms/tugas-form";
import { useTugas } from "@/lib/hooks/use-tugas";
import { CreateTugasDto } from "@/types";

export default function TugasBaruPage() {
  const router = useRouter();
  const { createTugas, isLoading } = useTugas();

  const handleSubmit = async (data: CreateTugasDto) => {
    try {
      await createTugas(data);
      router.push("/dashboard/tugas");
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div>
      <PageHeader title="Tambah Tugas Baru" description="Lengkapi form untuk menambahkan tugas baru" />

      <div className="max-w-3xl">
        <TugasForm onSubmit={handleSubmit} isLoading={isLoading} onCancel={() => router.push("/dashboard/tugas")} />
      </div>
    </div>
  );
}