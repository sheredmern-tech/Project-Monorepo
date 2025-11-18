// ============================================================================
// FILE: app/(dashboard)/sidang/baru/page.tsx - NEW
// ============================================================================
"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { SidangForm } from "@/components/forms/sidang-form";
import { useSidang } from "@/lib/hooks/use-sidang";
import { CreateJadwalSidangDto } from "@/types";

export default function SidangBaruPage() {
  const router = useRouter();
  const { createSidang, isLoading } = useSidang();

  const handleSubmit = async (data: CreateJadwalSidangDto) => {
    try {
      await createSidang(data);
      toast.success("Jadwal sidang berhasil ditambahkan");
      router.push("/dashboard/sidang");
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div>
      <PageHeader
        title="Tambah Jadwal Sidang"
        description="Lengkapi form untuk menambahkan jadwal sidang baru"
      />

      <div className="max-w-3xl">
        <SidangForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => router.push("/dashboard/sidang")}
        />
      </div>
    </div>
  );
}