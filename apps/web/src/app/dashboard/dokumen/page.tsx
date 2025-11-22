// ============================================================================
// FILE: app/(dashboard)/dokumen/page.tsx - WITH INTEGRATED FOLDER SYSTEM + BULK OPS + KEYBOARD SHORTCUTS
// ============================================================================
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FolderOpen, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, CheckSquare, Square, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DokumenTable } from "@/components/tables/dokumen-table";
import { SearchInput } from "@/components/shared/search-input";
import { FolderTree } from "@/components/dokumen/FolderTree";
import { CreateFolderModal } from "@/components/dokumen/CreateFolderModal";
import { BulkActionBar } from "@/components/dokumen/BulkActionBar";
import { CommandPalette } from "@/components/dokumen/CommandPalette";
import { KeyboardShortcutsHelp } from "@/components/dokumen/KeyboardShortcutsHelp";
import { FilterPresetsBar } from "@/components/dokumen/FilterPresetsBar";
import { useDokumen } from "@/lib/hooks/use-dokumen";
import { useDokumenStore } from "@/lib/stores/dokumen.store";
import { usePermission } from "@/lib/hooks/use-permission";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";
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
    search,
    kategori,
    folderId,
    sortBy,
    sortOrder,
    setSearch,
    setKategori,
    setFolderId,
    setSortBy,
    setSortOrder,
    fetchDokumen,
  } = useDokumen();

  // Bulk selection from store
  const {
    selectedIds,
    isSelectionMode,
    toggleSelection,
    selectAll,
    clearSelection,
    setSelectionMode,
  } = useDokumenStore();

  // Folder states
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [selectedPerkara, setSelectedPerkara] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Uploader filter
  const [uploaderFilter, setUploaderFilter] = useState<string>("all");

  // Keyboard shortcuts modals
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Search input ref for Ctrl+F shortcut
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ✨ Keyboard Shortcuts Setup
  useKeyboardShortcuts([
    // Command Palette (Ctrl+K)
    {
      key: 'k',
      ctrlKey: true,
      handler: (e) => {
        e.preventDefault();
        setShowCommandPalette(true);
      },
      description: 'Open command palette',
    },
    // Search Focus (Ctrl+F)
    {
      key: 'f',
      ctrlKey: true,
      handler: (e) => {
        e.preventDefault();
        searchInputRef.current?.focus();
      },
      description: 'Focus search',
    },
    // Show Shortcuts Help (?)
    {
      key: '?',
      handler: () => {
        setShowShortcutsHelp(true);
      },
      description: 'Show keyboard shortcuts',
    },
    // Create New Folder (N)
    {
      key: 'n',
      handler: () => {
        if (selectedPerkara && permissions.dokumen.upload) {
          setShowCreateFolder(true);
        }
      },
      description: 'Create new folder',
    },
    // Upload Document (U)
    {
      key: 'u',
      handler: () => {
        if (permissions.dokumen.upload) {
          router.push('/dashboard/dokumen/upload');
        }
      },
      description: 'Upload document',
    },
    // Toggle Selection Mode (S)
    {
      key: 's',
      handler: () => {
        setSelectionMode(!isSelectionMode);
      },
      description: 'Toggle selection mode',
    },
  ]);

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

  // ✨ Apply Filter Preset
  const handleApplyPreset = (filters: {
    search?: string;
    kategori?: string;
    uploaderFilter?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    folderId?: string | null;
  }) => {
    if (filters.search !== undefined) setSearch(filters.search);
    if (filters.kategori) setKategori(filters.kategori);
    if (filters.uploaderFilter) setUploaderFilter(filters.uploaderFilter);
    if (filters.sortBy) setSortBy(filters.sortBy);
    if (filters.sortOrder) setSortOrder(filters.sortOrder);
    if (filters.folderId !== undefined) setFolderId(filters.folderId);
  };

  // ✅ Sort options
  const sortOptions = [
    { value: 'tanggal_upload', label: 'Tanggal Upload' },
    { value: 'nama_dokumen', label: 'Nama Dokumen' },
    { value: 'ukuran_file', label: 'Ukuran File' },
    { value: 'kategori', label: 'Kategori' },
  ];

  // ✅ Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div>
      <PageHeader
        title="Dokumen"
        description="Kelola semua dokumen hukum dengan folder organization"
        action={
          !user ? (
            <Skeleton className="h-10 w-40" />
          ) : (
            <div className="flex gap-2">
              {/* Selection Mode Toggle */}
              <Button
                variant={isSelectionMode ? "default" : "outline"}
                onClick={() => setSelectionMode(!isSelectionMode)}
                className="gap-2"
              >
                {isSelectionMode ? (
                  <><CheckSquare className="h-4 w-4" /> Mode Pilih</>
                ) : (
                  <><Square className="h-4 w-4" /> Pilih</>
                )}
              </Button>

              {/* Keyboard Shortcuts Help Button */}
              <Button
                variant="outline"
                onClick={() => setShowShortcutsHelp(true)}
                className="gap-2"
                title="Keyboard Shortcuts (Press ?)"
              >
                <Keyboard className="h-4 w-4" />
              </Button>

              {permissions.dokumen.upload && (
                <Button onClick={() => router.push("/dashboard/dokumen/upload")}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Dokumen
                </Button>
              )}
            </div>
          )
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
          {/* Filters & Sort */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Row 1: Search */}
            <div className="flex-1">
              <SearchInput
                ref={searchInputRef}
                placeholder="Cari nama dokumen, nomor bukti... (Ctrl+F)"
                onSearch={setSearch}
              />
            </div>

            {/* Row 2: Filters + Sort */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Select value={kategori} onValueChange={setKategori}>
                <SelectTrigger className="w-full sm:w-[180px]">
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
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Diunggah oleh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Upload</SelectItem>
                  <SelectItem value="staff">Upload Staff</SelectItem>
                  <SelectItem value="client">Upload Client</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Controls */}
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Urutkan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleSortOrder}
                  className="flex-shrink-0"
                  title={sortOrder === 'asc' ? 'Urutan Naik (A-Z, 0-9, Lama-Baru)' : 'Urutan Turun (Z-A, 9-0, Baru-Lama)'}
                >
                  {sortOrder === 'asc' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Row 3: Filter Presets */}
            <FilterPresetsBar
              currentFilters={{
                search,
                kategori,
                uploaderFilter,
                sortBy,
                sortOrder,
                folderId,
              }}
              onApplyPreset={handleApplyPreset}
            />
          </div>

          {/* Context Info - Show current folder & search status */}
          {(folderId || search) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {folderId && (
                <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950 rounded-md inline-flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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

              {search && (
                <div className="px-3 py-1.5 bg-green-50 dark:bg-green-950 rounded-md inline-flex items-center gap-2">
                  <span className="text-sm text-green-700 dark:text-green-400">
                    🔍 Mencari: <strong>"{search}"</strong>
                    {folderId && <span className="ml-1">(dalam folder ini)</span>}
                  </span>
                  <button
                    onClick={() => setSearch('')}
                    className="text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200"
                  >
                    ✕
                  </button>
                </div>
              )}
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
            selectionMode={isSelectionMode}
            selectedIds={selectedIds}
            onToggleSelection={toggleSelection}
            onSelectAll={selectAll}
          />
        </div>
      </div>

      {/* Bulk Action Bar */}
      {isSelectionMode && selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          selectedIds={Array.from(selectedIds)}
          onClearSelection={clearSelection}
          onRefresh={fetchDokumen}
        />
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && selectedPerkara && (
        <CreateFolderModal
          perkaraId={selectedPerkara}
          parentId={folderId}
          onClose={() => setShowCreateFolder(false)}
          onSuccess={handleFolderCreated}
        />
      )}

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        onCreateFolder={() => {
          if (selectedPerkara) {
            setShowCreateFolder(true);
          }
        }}
      />

      {/* Keyboard Shortcuts Help (?) */}
      <KeyboardShortcutsHelp
        open={showShortcutsHelp}
        onOpenChange={setShowShortcutsHelp}
      />
    </div>
  );
}
