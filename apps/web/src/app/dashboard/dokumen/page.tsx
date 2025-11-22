// ============================================================================
// FILE: app/(dashboard)/dokumen/page.tsx - WITH INTEGRATED FOLDER SYSTEM
// ============================================================================
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Upload, FolderOpen, ChevronLeft, ChevronRight } from "lucide-react";
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
    folderId,
    setSearch,
    setKategori,
    setFolderId,
    fetchDokumen,
  } = useDokumen();

  // Folder states
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [selectedPerkara, setSelectedPerkara] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Uploader filter
  const [uploaderFilter, setUploaderFilter] = useState<string>("all");

  // ✅ Filter documents by uploader role (folder filtering is server-side via folderId)
  const filteredDokumen = useMemo(() => {
    let filtered = dokumen;

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

  // Auto-select first perkara for folder tree
  useEffect(() => {
    if (dokumen.length > 0 && !selectedPerkara) {
      setSelectedPerkara(dokumen[0].perkara_id);
    }
  }, [dokumen, selectedPerkara]);

  const handleFolderClick = (clickedFolderId: string | null) => {
    setFolderId(clickedFolderId);
  };

  const handleFolderCreated = () => {
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

      <div className="flex gap-6 mb-6">
        {/* Folder Sidebar - Collapsible */}
        {!sidebarCollapsed && (
          <div className="w-72 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Folders</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(true)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>

              {selectedPerkara ? (
                <FolderTree
                  perkaraId={selectedPerkara}
                  currentFolderId={folderId}
                  onFolderClick={handleFolderClick}
                  onCreateFolder={() => setShowCreateFolder(true)}
                />
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                  Upload dokumen untuk mulai menggunakan folder
                </p>
              )}
            </div>
          </div>
        )}

        {/* Expand Sidebar Button */}
        {sidebarCollapsed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarCollapsed(false)}
            className="h-10 px-3"
          >
            <ChevronRight className="h-4 w-4 mr-2" />
            Show Folders
          </Button>
        )}

        {/* Documents List */}
        <div className="flex-1 min-w-0">
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

          {/* Breadcrumb - Show current folder */}
          {folderId && (
            <div className="mb-4 px-2 py-1 bg-blue-50 dark:bg-blue-950 rounded-md inline-block">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                <button
                  onClick={() => setFolderId(null)}
                  className="hover:text-blue-600 dark:hover:text-blue-400 underline"
                >
                  All Documents
                </button>
                {' > '}
                <span className="text-slate-900 dark:text-white font-medium">Current Folder</span>
              </span>
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
