// ============================================================================
// FILE: app/(dashboard)/dokumen/upload/page.tsx
// ============================================================================
"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { DokumenUploadForm } from "@/components/forms/dokumen-upload-form";
import { useDokumen } from "@/lib/hooks/use-dokumen";

export default function DokumenUploadPage() {
  const router = useRouter();
  const { uploadDokumen, isUploading } = useDokumen();

  const handleUpload = async (formData: FormData) => {
    try {
      const newDokumen = await uploadDokumen(formData);

      // ✅ Invalidate Next.js cache to ensure fresh data
      router.refresh();

      // Redirect to list page
      router.push("/dashboard/dokumen");
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div>
      <PageHeader title="Upload Dokumen" description="Upload dokumen hukum baru" />

      <div className="max-w-3xl">
        <DokumenUploadForm
          onSubmit={handleUpload}
          isLoading={isUploading}
          onCancel={() => router.push("/dashboard/dokumen")}
        />
      </div>
    </div>
  );
}