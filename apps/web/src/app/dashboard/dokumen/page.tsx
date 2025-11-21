// ============================================================================
// FILE: app/(dashboard)/dokumen/page.tsx
// ============================================================================
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DokumenTable } from "@/components/tables/dokumen-table";
import { SearchInput } from "@/components/shared/search-input";
import { useDokumen } from "@/lib/hooks/use-dokumen";
import { usePermission } from "@/lib/hooks/use-permission";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KategoriDokumen } from "@/types";

export default function DokumenPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const permissions = usePermission();
  const {
    dokumen,
    isLoading,
    error,
    page,
    limit,
    total,
    kategori,
    setSearch,
    setKategori,
    fetchDokumen,
  } = useDokumen();

  // ✨ NEW: Uploader filter (client-side)
  const [uploaderFilter, setUploaderFilter] = useState<string>("all");

  // ✨ Filter documents by uploader role
  const filteredDokumen = useMemo(() => {
    if (uploaderFilter === "all") return dokumen;
    if (uploaderFilter === "client") {
      return dokumen.filter(doc => doc.pengunggah?.role === 'klien');
    }
    if (uploaderFilter === "staff") {
      return dokumen.filter(doc => doc.pengunggah?.role !== 'klien');
    }
    return dokumen;
  }, [dokumen, uploaderFilter]);

  useEffect(() => {
    fetchDokumen();
  }, [fetchDokumen]);

  return (
    <div>
      <PageHeader
        title="Dokumen"
        description="Kelola semua dokumen hukum"
        action={
          /* 🔒 Show skeleton while user loading, then check permission */
          !user ? (
            <Skeleton className="h-10 w-40" />
          ) : permissions.dokumen.upload ? (
            <Button onClick={() => router.push("/dashboard/dokumen/upload")}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Dokumen
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
        <div className="flex-1">
          <SearchInput placeholder="Cari nama dokumen, nomor bukti..." onSearch={setSearch} />
        </div>
        <Select value={kategori} onValueChange={setKategori}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {Object.values(KategoriDokumen).map((kat) => (
              <SelectItem key={kat} value={kat} className="capitalize">
                {kat.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* ✨ NEW: Uploader Filter */}
        <Select value={uploaderFilter} onValueChange={setUploaderFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Diunggah oleh" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Upload</SelectItem>
            <SelectItem value="staff">Upload Staff</SelectItem>
            <SelectItem value="client">Upload Client</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DokumenTable
        data={filteredDokumen}
        isLoading={isLoading}
        error={error}
        page={page}
        limit={limit}
        total={filteredDokumen.length}
      />
    </div>
  );
}