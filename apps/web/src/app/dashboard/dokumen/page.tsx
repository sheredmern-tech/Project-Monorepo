// ============================================================================
// FILE: app/(dashboard)/dokumen/page.tsx
// ============================================================================
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DokumenTable } from "@/components/tables/dokumen-table";
import { SearchInput } from "@/components/shared/search-input";
import { useDokumen } from "@/lib/hooks/use-dokumen";
import { usePermission } from "@/lib/hooks/use-permission";
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

  useEffect(() => {
    fetchDokumen();
  }, [fetchDokumen]);

  return (
    <div>
      <PageHeader
        title="Dokumen"
        description="Kelola semua dokumen hukum"
        action={
          /* 🔒 Only show button if user can upload */
          permissions.dokumen.upload ? (
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
      </div>

      {/* Table */}
      <DokumenTable 
        data={dokumen} 
        isLoading={isLoading} 
        error={error}
        page={page} 
        limit={limit} 
        total={total} 
      />
    </div>
  );
}