'use client';

import { useState } from 'react';
import { folderApi } from '@/lib/api/folder';
import { X, Folder as FolderIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CreateFolderModalProps {
  perkaraId: string;
  parentId?: string | null;
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

export function CreateFolderModal({ perkaraId, parentId, onClose, onSuccess }: CreateFolderModalProps) {
  const [nama, setNama] = useState('');
  const [warna, setWarna] = useState(FOLDER_COLORS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama.trim()) {
      setError('Nama folder harus diisi');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await folderApi.create({
        perkara_id: perkaraId,
        nama_folder: nama.trim(),
        parent_id: parentId,
        warna,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create folder:', err);
      setError(err.response?.data?.message || 'Gagal membuat folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderIcon className="h-5 w-5" />
            Create New Folder
          </CardTitle>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-lg transition"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Folder Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Bukti Pendukung"
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Folder Color
              </label>
              <div className="flex flex-wrap gap-2">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setWarna(color.value)}
                    className={`w-10 h-10 rounded-lg border-2 transition ${
                      warna === color.value ? 'border-primary scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-accent transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !nama.trim()}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Folder'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
