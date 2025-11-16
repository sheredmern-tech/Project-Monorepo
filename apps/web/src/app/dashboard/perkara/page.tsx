// ============================================================================
// FILE: app/(dashboard)/perkara/page.tsx - ✅ FIXED WITH CLIENT FILTERING
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { PerkaraTable } from "@/components/tables/perkara-table";
import { SearchInput } from "@/components/shared/search-input";
import { usePerkara } from "@/lib/hooks/use-perkara";
import { useAuthStore } from "@/lib/stores/auth.store";
import { UserRole } from "@/types/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JenisPerkara, StatusPerkara } from "@/types";

export default function PerkaraPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    perkara,
    isLoading,
    error,
    page,
    limit,
    total,
    jenisPerkara,
    status,
    setSearch,
    setJenisPerkara,
    setStatus,
    setKlienId, // ✅ For client filtering
    fetchPerkara,
  } = usePerkara();

  // ✅ Track if client filter has been set
  const [clientFilterSet, setClientFilterSet] = useState(false);

  // ✅ CLIENT AUTO-FILTER: Set klienId filter for clients
  useEffect(() => {
    const setupClientFilter = async () => {
      if (user?.role === UserRole.KLIEN && !clientFilterSet) {
        try {
          // Get client's klien_id from their profile
          const { klienApi } = await import("@/lib/api/klien.api");
          const profile = await klienApi.getMyProfile();
          
          console.log('🔍 Client detected, filtering perkara by klien_id:', profile.id);
          
          // Set filter to only show this client's cases
          setKlienId(profile.id);
          setClientFilterSet(true);
        } catch (error) {
          console.error("Failed to get client profile:", error);
        }
      }
    };

    setupClientFilter();
  }, [user, setKlienId, clientFilterSet]);

  // ✅ Fetch perkara (will be filtered if klienId is set)
  useEffect(() => {
    // Wait for client filter to be set before fetching
    if (user?.role === UserRole.KLIEN && !clientFilterSet) {
      return;
    }
    
    fetchPerkara();
  }, [fetchPerkara, user, clientFilterSet]);

  // ✅ CONDITIONAL UI: Hide "Add" button for clients
  const canAddPerkara = user?.role !== UserRole.KLIEN;

  return (
    <div>
      <PageHeader
        title={user?.role === UserRole.KLIEN ? "Perkara Saya" : "Perkara"}
        description={
          user?.role === UserRole.KLIEN
            ? "Daftar perkara hukum Anda"
            : "Kelola semua perkara hukum"
        }
        action={
          canAddPerkara && (
            <Button onClick={() => router.push("/dashboard/perkara/baru")}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Perkara
            </Button>
          )
        }
      />

      {/* Filters - Hide some filters for clients */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
        <div className="flex-1">
          <SearchInput placeholder="Cari nomor perkara, judul..." onSearch={setSearch} />
        </div>
        <Select value={jenisPerkara} onValueChange={setJenisPerkara}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Jenis Perkara" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            {Object.values(JenisPerkara).map((jenis) => (
              <SelectItem key={jenis} value={jenis} className="capitalize">
                {jenis.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {Object.values(StatusPerkara).map((stat) => (
              <SelectItem key={stat} value={stat} className="capitalize">
                {stat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Info badge for clients */}
      {user?.role === UserRole.KLIEN && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📋 Menampilkan hanya perkara yang terkait dengan Anda
          </p>
        </div>
      )}

      {/* Table */}
      <PerkaraTable 
        data={perkara} 
        isLoading={isLoading} 
        error={error}
        page={page} 
        limit={limit} 
        total={total} 
      />
    </div>
  );
}