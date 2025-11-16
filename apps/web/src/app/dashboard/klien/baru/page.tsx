// ============================================================================
// FILE: app/(dashboard)/klien/baru/page.tsx
// ============================================================================
"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { KlienForm } from "@/components/forms/klien-form";
import { useKlien } from "@/lib/hooks/use-klien";
import { CreateKlienDto } from "@/types";

export default function KlienBaruPage() {
  const router = useRouter();
  const { createKlien, isLoading } = useKlien();

  const handleSubmit = async (data: CreateKlienDto) => {
    try {
      await createKlien(data);
      router.push("/dashboard/klien");
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div>
      <PageHeader
        title="Tambah Klien Baru"
        description="Lengkapi form untuk menambahkan klien baru"
      />

      <div className="max-w-3xl">
        <KlienForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => router.push("/dashboard/klien")}
        />
      </div>
    </div>
  );
}