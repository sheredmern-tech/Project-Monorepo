// ============================================================================
// FILE: app/(dashboard)/klien/profile/edit/page.tsx - 🆕 NEW CLIENT EDIT PROFILE
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { KlienForm } from "@/components/forms/klien-form";
import { useKlien } from "@/lib/hooks/use-klien";
import { useAuthStore } from "@/lib/stores/auth.store";
import { UserRole } from "@/types/enums";
import { KlienEntity, UpdateKlienDto } from "@/types";
import { toast } from "sonner";

export default function ClientProfileEditPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchMyProfile, updateMyProfile, isLoading } = useKlien();
  const [profile, setProfile] = useState<KlienEntity | null>(null);

  // ✅ SECURITY: Only clients can access this page
  useEffect(() => {
    if (user && user.role !== UserRole.KLIEN) {
      console.log('🔀 Non-client detected, redirecting...');
      toast.error('Halaman ini hanya untuk klien');
      router.replace('/');
      return;
    }
  }, [user, router]);

  // ✅ Load client profile
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.role !== UserRole.KLIEN) return;

      try {
        const data = await fetchMyProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Gagal memuat profil");
        router.push("/dashboard/klien/profile");
      }
    };

    loadProfile();
  }, [user, fetchMyProfile, router]);

  const handleSubmit = async (data: UpdateKlienDto) => {
    try {
      await updateMyProfile(data);
      router.push("/dashboard/klien/profile");
    } catch (error) {
      // Error handled by hook
      console.error("Update failed:", error);
    }
  };

  // ✅ Redirect non-clients
  if (user && user.role !== UserRole.KLIEN) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      <PageHeader
        title="Edit Profil"
        description="Perbarui informasi profil Anda"
      />

      <div className="max-w-3xl">
        <KlienForm
          initialData={profile}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => router.push("/dashboard/klien/profile")}
          mode="edit"
        />
      </div>
    </div>
  );
}