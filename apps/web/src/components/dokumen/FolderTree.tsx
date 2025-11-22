'use client';

import { useState, useEffect } from 'react';
import { folderApi, type Folder } from '@/lib/api/folder.api';
import { Folder as FolderIcon, FolderOpen, ChevronRight, ChevronDown, Plus } from 'lucide-react';

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

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isActive = currentFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id} className="select-none">
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition group ${
            isActive ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900' : ''
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
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

          <button
            onClick={() => onFolderClick(folder.id)}
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
  );
}
