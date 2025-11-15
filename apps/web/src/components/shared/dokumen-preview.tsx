// ============================================================================
// FILE: components/shared/dokumen-preview.tsx
// ============================================================================
"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { DokumenWithRelations } from "@/types";
import { useDokumen } from "@/lib/hooks/use-dokumen";

interface DokumenPreviewProps {
  dokumen: DokumenWithRelations;
  open: boolean;
  onClose: () => void;
}

export function DokumenPreview({ dokumen, open, onClose }: DokumenPreviewProps) {
  const { downloadDokumen } = useDokumen();

  const handleDownload = async () => {
    await downloadDokumen(dokumen.id, dokumen.nama_dokumen);
  };

  const isPdf = dokumen.tipe_file?.includes("pdf");
  const isImage = dokumen.tipe_file?.startsWith("image/");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>{dokumen.nama_dokumen}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">
          {isPdf && (
            <iframe
              src={`/api/dokumen/${dokumen.id}/preview`}
              className="w-full h-[70vh] border rounded"
              title={dokumen.nama_dokumen}
            />
          )}

          {isImage && (
            <div className="flex items-center justify-center bg-muted rounded relative w-full h-[70vh]">
              <Image
                src={`/api/dokumen/${dokumen.id}/preview`}
                alt={dokumen.nama_dokumen}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          )}

          {!isPdf && !isImage && (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center">
              <p className="text-muted-foreground mb-4">
                Preview tidak tersedia untuk tipe file ini
              </p>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download untuk melihat
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}