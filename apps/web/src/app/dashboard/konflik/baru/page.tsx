// ============================================================================
// FILE: app/(dashboard)/konflik/baru/page.tsx - UPDATE
// ============================================================================
"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { KonflikForm } from "@/components/forms/konflik-form";
import { useKonflik } from "@/lib/hooks/use-konflik"; // ✅ Gunakan hook
import { CreateKonflikDto } from "@/types";

export default function KonflikBaruPage() {
  const router = useRouter();
  const { createKonflik, isLoading } = useKonflik(); // ✅ Gunakan hook

  const handleSubmit = async (data: CreateKonflikDto) => {
    try {
      await createKonflik(data);
      router.push("/konflik");
    } catch (error) {
      // Error sudah di-handle di hook
      console.error('Submit error:', error);
    }
  };

  return (
    <div>
      <PageHeader
        title="Pemeriksaan Konflik Baru"
        description="Periksa konflik kepentingan untuk klien atau perkara baru"
      />

      <div className="max-w-3xl">
        <KonflikForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => router.push("/konflik")}
        />
      </div>
    </div>
  );
}