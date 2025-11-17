// ============================================================================
// FILE: components/shared/dokumen-preview.tsx - WITH GOOGLE DRIVE EMBED
// ============================================================================
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, ExternalLink } from "lucide-react";
import { DokumenWithRelations } from "@/types";

interface DokumenPreviewProps {
  dokumen: DokumenWithRelations;
  open: boolean;
  onClose: () => void;
}

export function DokumenPreview({ dokumen, open, onClose }: DokumenPreviewProps) {
  // ✅ Use Google Drive links directly
  const embedLink = dokumen.embed_link;
  const downloadLink = dokumen.google_drive_link;

  const handleDownload = () => {
    if (downloadLink) {
      window.open(downloadLink, '_blank');
    }
  };

  const handleOpenInDrive = () => {
    if (downloadLink) {
      window.open(downloadLink, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>{dokumen.nama_dokumen}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleOpenInDrive}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Drive
              </Button>
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
          {embedLink ? (
            // ✅ GOOGLE DRIVE EMBED PREVIEW - Works for PDF, DOC, DOCX, XLS, XLSX, images, etc.
            <iframe
              src={embedLink}
              className="w-full h-[70vh] border rounded"
              title={dokumen.nama_dokumen}
              allow="autoplay"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              referrerPolicy="no-referrer-when-downgrade"
              loading="lazy"
            />
          ) : (
            // Fallback if no embed link
            <div className="flex flex-col items-center justify-center h-[70vh] text-center">
              <p className="text-muted-foreground mb-4">
                Preview tidak tersedia
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