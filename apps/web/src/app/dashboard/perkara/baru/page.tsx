// ============================================================================
// FILE: app/(dashboard)/perkara/baru/page.tsx
// ============================================================================
"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { PerkaraForm } from "@/components/forms/perkara-form";
import { usePerkara } from "@/lib/hooks/use-perkara";
import { CreatePerkaraDto } from "@/types";

export default function PerkaraBaruPage() {
  const router = useRouter();
  const { createPerkara, isLoading } = usePerkara();

  const handleSubmit = async (data: CreatePerkaraDto) => {
    try {
      await createPerkara(data);
      router.push("/dashboard/perkara");
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div>
      <PageHeader title="Tambah Perkara Baru" description="Lengkapi form untuk menambahkan perkara baru" />

      <div className="max-w-4xl">
        <PerkaraForm onSubmit={handleSubmit} isLoading={isLoading} onCancel={() => router.push("/dashboard/perkara")} />
      </div>
    </div>
  );
}