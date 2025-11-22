'use client';

import { useState, useEffect } from 'react';
import { folderApi, type Folder } from '@/lib/api/folder.api';
import { Folder as FolderIcon, FolderOpen, ChevronRight, ChevronDown, Plus, MoreVertical, Edit, Trash2, Clock, HardDrive, History } from 'lucide-react';
import { RenameFolderModal } from './RenameFolderModal';
import { ConfirmDialog } from '@/components/modals/confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { formatFileSize } from '@/lib/utils/format';
import { formatDistanceToNow } from 'date-fns';
import { useRecentFolders } from '@/lib/hooks/use-recent-folders';

interface FolderTreeProps {
  perkaraId: string;
  currentFolderId?: string | null;
  onFolderClick: (folderId: string | null) => void;
  onCreateFolder?: () => void;
}

export function FolderTree({ perkaraId, currentFolderId, onFolderClick, onCreateFolder }: FolderTreeProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [renameFolder, setRenameFolder] = useState<{ id: string; name: string; color?: string | null } | null>(null);
  const [deleteFolder, setDeleteFolder] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Recent folders tracking
  const { recentFolders, addRecentFolder } = useRecentFolders(perkaraId);

  useEffect(() => {
    loadFolders();
  }, [perkaraId]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const data = await folderApi.getTree(perkaraId);
      setFolders(data);
    } catch (error) {
      console.error('Failed to load folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deleteFolder) return;

    try {
      setDeleting(true);
      await folderApi.delete(deleteFolder.id);
      toast.success('Folder berhasil dihapus');
      setDeleteFolder(null);
      loadFolders(); // Reload folder tree
    } catch (err: any) {
      console.error('Failed to delete folder:', err);
      toast.error(err.response?.data?.message || 'Gagal menghapus folder');
    } finally {
      setDeleting(false);
    }
  };

  // Handle folder click with recent tracking
  const handleFolderClick = (folder: Folder) => {
    addRecentFolder(folder);
    onFolderClick(folder.id);
  };

  // Find folder by ID for recent folders display
  const findFolderById = (id: string, folderList: Folder[] = folders): Folder | null => {
    for (const folder of folderList) {
      if (folder.id === id) return folder;
      if (folder.children) {
        const found = findFolderById(id, folder.children);
        if (found) return found;
      }
    }
    return null;
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isActive = currentFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    // Extract statistics
    const stats = folder.statistics;
    const hasStats = stats && folder._count && folder._count.dokumen > 0;

    // Get top 3 file types
    const topFileTypes = stats?.fileTypes
      ? Object.entries(stats.fileTypes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
      : [];

    return (
      <div key={folder.id} className="select-none">
        <div
          className={`flex flex-col gap-1 px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition group ${
            isActive ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900' : ''
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          {/* Main Row: Folder Name */}
          <div className="flex items-center gap-1">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
                className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}

            <button
              onClick={() => handleFolderClick(folder)}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              {isExpanded || isActive ? (
                <FolderOpen className="h-4 w-4 flex-shrink-0" style={{ color: folder.warna || undefined }} />
              ) : (
                <FolderIcon className="h-4 w-4 flex-shrink-0" style={{ color: folder.warna || undefined }} />
              )}
              <span className="text-sm truncate">{folder.nama_folder}</span>
              {folder._count && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ({folder._count.dokumen})
                </span>
              )}
            </button>

            {/* Dropdown Menu for Rename/Delete */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameFolder({ id: folder.id, name: folder.nama_folder, color: folder.warna });
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteFolder({ id: folder.id, name: folder.nama_folder });
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Statistics Row: Size, Last Upload, File Types */}
          {hasStats && (
            <div className="flex items-center gap-2 ml-5 text-xs text-slate-500 dark:text-slate-400">
              {/* Total Size */}
              {stats.totalSize > 0 && (
                <div className="flex items-center gap-1" title="Total size">
                  <HardDrive className="h-3 w-3" />
                  <span>{formatFileSize(stats.totalSize)}</span>
                </div>
              )}

              {/* Last Upload */}
              {stats.lastUpload && (
                <div className="flex items-center gap-1" title="Last upload">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(stats.lastUpload), { addSuffix: true })}</span>
                </div>
              )}

              {/* Top File Types */}
              {topFileTypes.length > 0 && (
                <div className="flex items-center gap-1">
                  {topFileTypes.map(([type, count]) => (
                    <span
                      key={type}
                      className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs"
                      title={`${type}: ${count} files`}
                    >
                      {type.toUpperCase()} {count > 1 && `×${count}`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {folder.children!.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Loading folders...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {/* Root / All Documents */}
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
            currentFolderId === null ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900' : ''
          }`}
          onClick={() => onFolderClick(null)}
        >
          <FolderIcon className="h-4 w-4" />
          <span className="text-sm font-medium">All Documents</span>
        </div>

        {/* Recent Folders */}
        {recentFolders.length > 0 && (
          <div className="mt-3 mb-2">
            <div className="flex items-center gap-1.5 px-2 py-1 mb-1">
              <History className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Recent
              </span>
            </div>
            <div className="space-y-0.5">
              {recentFolders.map(recent => {
                const folder = findFolderById(recent.id);
                if (!folder) return null;

                const isActive = currentFolderId === recent.id;

                return (
                  <button
                    key={recent.id}
                    onClick={() => handleFolderClick(folder)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      isActive ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    <FolderIcon
                      className="h-3.5 w-3.5 flex-shrink-0"
                      style={{ color: recent.warna || undefined }}
                    />
                    <span className="text-xs truncate">{recent.nama_folder}</span>
                    <span className="text-xs text-slate-400 ml-auto">
                      {formatDistanceToNow(new Date(recent.lastAccessed), { addSuffix: true })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* All Folders Divider */}
        {recentFolders.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 mt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              All Folders
            </span>
          </div>
        )}

        {/* Folder tree */}
        {folders.map(folder => renderFolder(folder))}

        {/* Create folder button */}
        {onCreateFolder && (
          <button
            onClick={onCreateFolder}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition mt-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Folder</span>
          </button>
        )}
      </div>

      {/* Rename Folder Modal */}
      {renameFolder && (
        <RenameFolderModal
          folderId={renameFolder.id}
          currentName={renameFolder.name}
          currentColor={renameFolder.color}
          onClose={() => setRenameFolder(null)}
          onSuccess={() => {
            setRenameFolder(null);
            loadFolders();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteFolder && (
        <ConfirmDialog
          open={!!deleteFolder}
          onOpenChange={(open) => !open && setDeleteFolder(null)}
          title="Hapus Folder"
          description={`Apakah Anda yakin ingin menghapus folder "${deleteFolder.name}"? Dokumen di dalam folder akan dipindahkan ke root.`}
          onConfirm={handleDelete}
          confirmText={deleting ? 'Menghapus...' : 'Hapus'}
          variant="destructive"
        />
      )}
    </>
  );
}
