'use client';

import { useState, useEffect } from 'react';
import { folderApi, type Folder } from '@/lib/api/folder.api';
import { dokumenApi } from '@/lib/api/dokumen.api';
import { X, Folder as FolderIcon, FolderOpen, ChevronRight, ChevronDown, Move, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MoveFolderModalProps {
  dokumenId?: string;
  dokumentIds?: string[];
  isBulk?: boolean;
  dokumenName?: string;
  perkaraId?: string;
  currentFolderId?: string | null;
  mode?: 'move' | 'copy';
  onClose: () => void;
  onSuccess: () => void;
}

export function MoveFolderModal({
  dokumenId,
  dokumentIds,
  isBulk = false,
  dokumenName,
  perkaraId,
  currentFolderId,
  mode = 'move',
  onClose,
  onSuccess,
}: MoveFolderModalProps) {
  // Use bulk IDs if provided, otherwise single ID
  const targetIds = isBulk ? (dokumentIds || []) : (dokumenId ? [dokumenId] : []);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (perkaraId) {
      loadFolders();
    }
  }, [perkaraId]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      if (!perkaraId) {
        toast.error('Perkara ID tidak tersedia');
        setFolders([]);
        setLoading(false);
        return;
      }
      const data = await folderApi.getTree(perkaraId);
      setFolders(data);

      // Auto-expand folders to show current location
      if (currentFolderId) {
        const expandParents = (folderId: string, allFolders: Folder[]): Set<string> => {
          const expanded = new Set<string>();
          const findParent = (folders: Folder[]): boolean => {
            for (const folder of folders) {
              if (folder.id === folderId) {
                return true;
              }
              if (folder.children && findParent(folder.children)) {
                expanded.add(folder.id);
                return true;
              }
            }
            return false;
          };
          findParent(allFolders);
          return expanded;
        };
        setExpandedFolders(expandParents(currentFolderId, data));
      }
    } catch (error: any) {
      console.error('Failed to load folders:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat folder');
      setFolders([]);
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

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (isBulk) {
        // Bulk operation with better error handling
        if (mode === 'move') {
          const results = await Promise.allSettled(
            targetIds.map(id => dokumenApi.move(id, selectedFolder))
          );

          const successCount = results.filter(r => r.status === 'fulfilled').length;
          const failCount = results.filter(r => r.status === 'rejected').length;

          if (successCount > 0) {
            toast.success(`${successCount} dokumen berhasil dipindahkan`);
          }
          if (failCount > 0) {
            toast.error(`${failCount} dokumen gagal dipindahkan`);
          }

          // If all failed, throw error
          if (successCount === 0) {
            throw new Error('Semua dokumen gagal dipindahkan');
          }
        } else {
          const results = await Promise.allSettled(
            targetIds.map(id => dokumenApi.copy(id, { folder_id: selectedFolder }))
          );

          const successCount = results.filter(r => r.status === 'fulfilled').length;
          const failCount = results.filter(r => r.status === 'rejected').length;

          if (successCount > 0) {
            toast.success(`${successCount} dokumen berhasil disalin`);
          }
          if (failCount > 0) {
            toast.error(`${failCount} dokumen gagal disalin`);
          }

          // If all failed, throw error
          if (successCount === 0) {
            throw new Error('Semua dokumen gagal disalin');
          }
        }
      } else {
        // Single operation
        if (mode === 'move') {
          await dokumenApi.move(targetIds[0], selectedFolder);
          toast.success(`Dokumen berhasil dipindahkan ke ${selectedFolder ? 'folder' : 'root'}`);
        } else {
          await dokumenApi.copy(targetIds[0], { folder_id: selectedFolder });
          toast.success(`Dokumen berhasil disalin ke ${selectedFolder ? 'folder' : 'root'}`);
        }
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`Failed to ${mode} document:`, error);
      // Only show error if not already shown in bulk operations
      if (!isBulk || error.message === 'Semua dokumen gagal dipindahkan' || error.message === 'Semua dokumen gagal disalin') {
        toast.error(error.response?.data?.message || error.message || `Gagal ${mode === 'move' ? 'memindahkan' : 'menyalin'} dokumen`);
      }
      // Don't close modal on error - let user try again
    } finally {
      setSubmitting(false);
    }
  };

  const renderFolder = (folder: Folder, level: number = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolder === folder.id;
    const isCurrent = currentFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition select-none ${
            isSelected
              ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          } ${isCurrent ? 'opacity-50' : ''}`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => !isCurrent && setSelectedFolder(folder.id)}
        >
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

          {isExpanded || isSelected ? (
            <FolderOpen className="h-4 w-4 flex-shrink-0" style={{ color: folder.warna || undefined }} />
          ) : (
            <FolderIcon className="h-4 w-4 flex-shrink-0" style={{ color: folder.warna || undefined }} />
          )}

          <span className="text-sm truncate flex-1">{folder.nama_folder}</span>

          {isCurrent && (
            <span className="text-xs text-slate-500 dark:text-slate-400">(current)</span>
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

  const isValid = mode === 'move' ? selectedFolder !== currentFolderId : true;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            {mode === 'move' ? (
              <Move className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <Copy className="h-5 w-5 text-green-600 dark:text-green-400" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {mode === 'move' ? 'Move' : 'Copy'} {isBulk ? `${targetIds.length} Documents` : 'Document'}
              </h3>
              {!isBulk && dokumenName && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  {dokumenName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            disabled={submitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Folder tree */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-1">
              {/* Root option */}
              <div
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition ${
                  selectedFolder === null
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                } ${currentFolderId === null ? 'opacity-50' : ''}`}
                onClick={() => currentFolderId !== null && setSelectedFolder(null)}
              >
                <FolderIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Root (No Folder)</span>
                {currentFolderId === null && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">(current)</span>
                )}
              </div>

              {/* Folder tree */}
              {folders.length > 0 ? (
                folders.map(folder => renderFolder(folder))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  No folders available. Documents will be moved to root.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t dark:border-slate-700 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !isValid}
            className="flex-1"
          >
            {submitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                {mode === 'move' ? 'Moving...' : 'Copying...'}
              </>
            ) : (
              <>
                {mode === 'move' ? <Move className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {mode === 'move' ? 'Move Document' : 'Copy Document'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
