// ============================================================================
// FILE: app/(dashboard)/dokumen/page-with-folders.tsx
// DOKUMEN PAGE WITH FOLDER SUPPORT
// ============================================================================
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Upload, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DokumenTable } from "@/components/tables/dokumen-table";
import { SearchInput } from "@/components/shared/search-input";
import { FolderTree } from "@/components/dokumen/FolderTree";
import { CreateFolderModal } from "@/components/dokumen/CreateFolderModal";
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

export default function DokumenWithFoldersPage() {
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
    folderId,
    setSearch,
    setKategori,
    setFolderId,
    fetchDokumen,
  } = useDokumen();

  // Folder states
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [selectedPerkara, setSelectedPerkara] = useState<string | null>(null);

  // Existing filters
  const [uploaderFilter, setUploaderFilter] = useState<string>("all");

  // ✅ Filter documents by uploader role (folder filtering is now server-side via folderId)
  const filteredDokumen = useMemo(() => {
    let filtered = dokumen;

    // Filter by uploader
    if (uploaderFilter === "client") {
      filtered = filtered.filter(doc => doc.pengunggah?.role === 'klien');
    } else if (uploaderFilter === "staff") {
      filtered = filtered.filter(doc => doc.pengunggah?.role !== 'klien');
    }

    return filtered;
  }, [dokumen, uploaderFilter]);

  useEffect(() => {
    fetchDokumen();
  }, [fetchDokumen]);

  const handleFolderClick = (clickedFolderId: string | null) => {
    setFolderId(clickedFolderId);
  };

  const handleFolderCreated = () => {
    // Reload documents after folder created
    fetchDokumen();
  };

  return (
    <div>
      <PageHeader
        title="Dokumen"
        description="Kelola semua dokumen hukum dengan folder organization"
        action={
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Folder Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Folders</h3>
            </div>

            {selectedPerkara ? (
              <FolderTree
                perkaraId={selectedPerkara}
                currentFolderId={folderId}
                onFolderClick={handleFolderClick}
                onCreateFolder={() => setShowCreateFolder(true)}
              />
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select a perkara to view folders
              </p>
            )}
          </div>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-3">
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

          {/* Breadcrumb */}
          {folderId && (
            <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              <button
                onClick={() => setFolderId(null)}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                All Documents
              </button>
              {' > '}
              <span className="text-slate-900 dark:text-white">Current Folder</span>
            </div>
          )}

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
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && selectedPerkara && (
        <CreateFolderModal
          perkaraId={selectedPerkara}
          parentId={folderId}
          onClose={() => setShowCreateFolder(false)}
          onSuccess={handleFolderCreated}
        />
      )}
    </div>
  );
}
