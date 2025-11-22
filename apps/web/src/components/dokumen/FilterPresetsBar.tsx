// ============================================================================
// FILE: components/dokumen/FilterPresetsBar.tsx
// Filter presets management UI
// ============================================================================
'use client';

import { useState } from 'react';
import { Save, Star, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFilterPresets, type FilterPreset } from '@/lib/hooks/use-filter-presets';
import { toast } from 'sonner';

interface FilterPresetsBarProps {
  currentFilters: FilterPreset['filters'];
  onApplyPreset: (filters: FilterPreset['filters']) => void;
}

export function FilterPresetsBar({ currentFilters, onApplyPreset }: FilterPresetsBarProps) {
  const { presets, addPreset, deletePreset } = useFilterPresets();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');

  // Check if current filters are non-empty
  const hasActiveFilters =
    currentFilters.search ||
    (currentFilters.kategori && currentFilters.kategori !== 'all') ||
    (currentFilters.uploaderFilter && currentFilters.uploaderFilter !== 'all') ||
    currentFilters.sortBy ||
    currentFilters.folderId;

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('Mohon masukkan nama preset');
      return;
    }

    if (!hasActiveFilters) {
      toast.error('Tidak ada filter aktif untuk disimpan');
      return;
    }

    addPreset(presetName.trim(), currentFilters);
    toast.success(`Preset "${presetName}" berhasil disimpan`);
    setPresetName('');
    setShowSaveDialog(false);
  };

  const handleDeletePreset = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deletePreset(id);
    toast.success(`Preset "${name}" berhasil dihapus`);
  };

  const getPresetLabel = (preset: FilterPreset) => {
    const parts: string[] = [];

    if (preset.filters.kategori && preset.filters.kategori !== 'all') {
      parts.push(preset.filters.kategori);
    }
    if (preset.filters.uploaderFilter && preset.filters.uploaderFilter !== 'all') {
      parts.push(preset.filters.uploaderFilter === 'client' ? 'Client' : 'Staff');
    }
    if (preset.filters.search) {
      parts.push(`"${preset.filters.search}"`);
    }
    if (preset.filters.sortBy) {
      parts.push(`Sort: ${preset.filters.sortBy}`);
    }

    return parts.length > 0 ? ` • ${parts.join(', ')}` : '';
  };

  if (presets.length === 0 && !hasActiveFilters) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Saved Presets */}
        {presets.map(preset => (
          <Badge
            key={preset.id}
            variant="outline"
            className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 dark:hover:border-blue-700 transition-colors pr-1 group"
            onClick={() => {
              onApplyPreset(preset.filters);
              toast.success(`Filter preset "${preset.name}" diterapkan`);
            }}
          >
            <Star className="h-3 w-3 mr-1.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-medium">{preset.name}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
              {getPresetLabel(preset)}
            </span>
            <button
              onClick={(e) => handleDeletePreset(preset.id, preset.name, e)}
              className="ml-2 p-0.5 hover:bg-red-100 dark:hover:bg-red-900 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Hapus preset"
            >
              <X className="h-3 w-3 text-red-600 dark:text-red-400" />
            </button>
          </Badge>
        ))}

        {/* Save Current Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            className="h-7 gap-1.5 text-xs"
          >
            <Save className="h-3 w-3" />
            Simpan Filter
          </Button>
        )}
      </div>

      {/* Save Preset Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Simpan Filter Preset</DialogTitle>
            <DialogDescription>
              Berikan nama untuk kombinasi filter saat ini agar bisa digunakan kembali nanti.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="preset-name">Nama Preset</Label>
              <Input
                id="preset-name"
                placeholder="Contoh: Client Upload - PDF Only"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSavePreset();
                  }
                }}
                autoFocus
                className="mt-1.5"
              />
            </div>

            {/* Preview current filters */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-md">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filter yang akan disimpan:
              </p>
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                {currentFilters.search && (
                  <div>• Pencarian: "{currentFilters.search}"</div>
                )}
                {currentFilters.kategori && currentFilters.kategori !== 'all' && (
                  <div>• Kategori: {currentFilters.kategori}</div>
                )}
                {currentFilters.uploaderFilter && currentFilters.uploaderFilter !== 'all' && (
                  <div>• Uploader: {currentFilters.uploaderFilter === 'client' ? 'Client' : 'Staff'}</div>
                )}
                {currentFilters.sortBy && (
                  <div>• Sort: {currentFilters.sortBy} ({currentFilters.sortOrder === 'asc' ? 'Naik' : 'Turun'})</div>
                )}
                {currentFilters.folderId && (
                  <div>• Folder terpilih</div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSavePreset}>
              <Save className="h-4 w-4 mr-2" />
              Simpan Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
