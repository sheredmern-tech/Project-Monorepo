'use client';

import { useState, useEffect } from 'react';
import { folderApi } from '@/lib/api/folder.api';
import { X, Folder as FolderIcon, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface RenameFolderModalProps {
  folderId: string;
  currentName: string;
  currentColor?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const FOLDER_COLORS = [
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Green', value: '#10B981' },
  { label: 'Yellow', value: '#F59E0B' },
  { label: 'Red', value: '#EF4444' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Pink', value: '#EC4899' },
  { label: 'Gray', value: '#6B7280' },
];

export function RenameFolderModal({
  folderId,
  currentName,
  currentColor,
  onClose,
  onSuccess,
}: RenameFolderModalProps) {
  const [nama, setNama] = useState(currentName);
  const [warna, setWarna] = useState(currentColor || FOLDER_COLORS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setNama(currentName);
    setWarna(currentColor || FOLDER_COLORS[0].value);
  }, [currentName, currentColor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama.trim()) {
      setError('Nama folder harus diisi');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await folderApi.update(folderId, {
        nama_folder: nama.trim(),
        warna,
      });

      toast.success('Folder berhasil direname');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to rename folder:', err);
      setError(err.response?.data?.message || 'Gagal merename folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Rename Folder</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Folder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="e.g., Bukti Pendukung"
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Folder Color
            </label>
            <div className="flex flex-wrap gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setWarna(color.value)}
                  className={`w-10 h-10 rounded-lg border-2 transition ${
                    warna === color.value ? 'border-blue-600 dark:border-blue-400 scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !nama.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
