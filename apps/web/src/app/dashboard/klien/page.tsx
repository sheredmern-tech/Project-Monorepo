// ============================================================================
// FILE: app/(dashboard)/klien/page.tsx - ✅ PRODUCTION READY
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { KlienTable } from "@/components/tables/klien-table";
import { KlienCard } from "@/components/cards/klien-card";
import { SearchInput } from "@/components/shared/search-input";
import { ViewToggle } from "@/components/shared/view-toggle";
import { useKlien } from "@/lib/hooks/use-klien";
import { useAuthStore } from "@/lib/stores/auth.store";
import { usePermission } from "@/lib/hooks/use-permission";
import { UserRole } from "@/types/enums";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function KlienPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const permissions = usePermission();
  const {
    klien,
    isLoading,
    page,
    limit,
    total,
    jenisKlien,
    setSearch,
    setJenisKlien,
    fetchKlien
  } = useKlien();

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isMounted, setIsMounted] = useState(false);

  // ✅ Fix hydration: Only render user-dependent content after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ CLIENT REDIRECT - NO STATE UPDATE IN EFFECT
  useEffect(() => {
    if (user?.role === UserRole.KLIEN) {
      console.log('🔀 Client detected, redirecting to profile...');
      router.replace('/klien/profile');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role !== UserRole.KLIEN && fetchKlien) {
      fetchKlien();
    }
  }, [fetchKlien, user]);

  // ✅ Fix hydration: Show loading skeleton until mounted AND checked role
  if (!isMounted || user?.role === UserRole.KLIEN) {
    return <TableSkeleton rows={10} columns={7} />;
  }

  return (
    <div>
      <PageHeader
        title="Klien"
        description="Kelola data klien firma hukum"
        action={
          /* 🔒 Only show "Tambah Klien" button if user can create klien */
          permissions.klien.create ? (
            <Button onClick={() => router.push("/dashboard/klien/baru")}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Klien
            </Button>
          ) : undefined
        }
      />

      {/* Filters + View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
        <div className="flex-1">
          <SearchInput
            placeholder="Cari nama klien, email, telepon..."
            onSearch={setSearch}
          />
        </div>
        <Select value={jenisKlien} onValueChange={setJenisKlien}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Jenis Klien" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            <SelectItem value="perorangan">Perorangan</SelectItem>
            <SelectItem value="perusahaan">Perusahaan</SelectItem>
            <SelectItem value="instansi">Instansi</SelectItem>
          </SelectContent>
        </Select>
        
        <ViewToggle view={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Conditional Rendering: Table or Grid */}
      {viewMode === "table" ? (
        <KlienTable
          data={klien || []}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            // ✅ Grid skeleton loading
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))
          ) : klien && klien.length > 0 ? (
            klien.map((k) => (
              <KlienCard key={k.id} klien={k} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Tidak ada data klien</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}