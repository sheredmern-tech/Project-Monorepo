'use client';

import { useState } from 'react';
import { FolderInput, Trash2, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MoveFolderModal } from './MoveFolderModal';
import { ConfirmDialog } from '@/components/modals/confirm-dialog';
import { dokumenApi } from '@/lib/api/dokumen.api';
import { toast } from 'sonner';

interface BulkActionBarProps {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

export function BulkActionBar({
  selectedCount,
  selectedIds,
  onClearSelection,
  onRefresh,
}: BulkActionBarProps) {
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [perkaraId, setPerkaraId] = useState<string | null>(null);
  const [loadingPerkara, setLoadingPerkara] = useState(false);

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);

      // Delete all selected documents
      await Promise.all(selectedIds.map(id => dokumenApi.delete(id)));

      toast.success(`${selectedCount} dokumen berhasil dihapus`);
      onClearSelection();
      onRefresh();
    } catch (error: any) {
      console.error('Failed to delete documents:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus dokumen');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleBulkMove = async () => {
    try {
      setLoadingPerkara(true);

      // Fetch perkara_id from the first selected document
      const firstDoc = await dokumenApi.getById(selectedIds[0]);
      const fetchedPerkaraId = firstDoc?.perkara_id;

      if (!fetchedPerkaraId) {
        toast.error('Tidak dapat menemukan perkara untuk dokumen ini');
        return;
      }

      setPerkaraId(fetchedPerkaraId);
      setShowMoveModal(true);
    } catch (error: any) {
      console.error('Failed to fetch perkara:', error);
      toast.error('Gagal memuat informasi perkara');
    } finally {
      setLoadingPerkara(false);
    }
  };

  const handleMoveSuccess = () => {
    // Don't show toast here - MoveFolderModal already shows it
    setShowMoveModal(false);
    onClearSelection();
    onRefresh();
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-4 border border-blue-500">
          {/* Selection Count */}
          <div className="flex items-center gap-2 border-r border-blue-400 pr-4">
            <div className="bg-white/20 rounded-full h-8 w-8 flex items-center justify-center font-bold">
              {selectedCount}
            </div>
            <span className="font-medium">terpilih</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 gap-2"
              onClick={handleBulkMove}
              disabled={loadingPerkara}
            >
              {loadingPerkara ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <FolderInput className="h-4 w-4" />
              )}
              Pindahkan
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 gap-2"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Hapus
            </Button>

            <div className="h-6 w-px bg-blue-400 mx-1" />

            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={onClearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Move Modal */}
      {showMoveModal && selectedIds.length > 0 && perkaraId && (
        <MoveFolderModal
          dokumentIds={selectedIds}
          isBulk={true}
          perkaraId={perkaraId}
          mode="move"
          onClose={() => setShowMoveModal(false)}
          onSuccess={handleMoveSuccess}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Hapus Dokumen"
        description={`Apakah Anda yakin ingin menghapus ${selectedCount} dokumen yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleBulkDelete}
        confirmText={isDeleting ? 'Menghapus...' : 'Hapus'}
        variant="destructive"
      />
    </>
  );
}
