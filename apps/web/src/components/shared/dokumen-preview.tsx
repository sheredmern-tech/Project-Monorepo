// ============================================================================
// FILE: components/shared/dokumen-preview.tsx - ENTERPRISE MODAL
// ============================================================================
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  ExternalLink,
  FileText,
  Calendar,
  HardDrive,
  Tag,
  User,
  Loader2,
  AlertCircle
} from "lucide-react";
import { DokumenWithRelations } from "@/types";
import { formatDate, formatFileSize } from "@/lib/utils/format";
import { getFileExtension } from "@/lib/utils/file";

interface DokumenPreviewProps {
  dokumen: DokumenWithRelations;
  open: boolean;
  onClose: () => void;
}

export function DokumenPreview({ dokumen, open, onClose }: DokumenPreviewProps) {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  // ✅ Use Google Drive links directly
  const embedLink = dokumen.embed_link;
  const downloadLink = dokumen.google_drive_link;
  const extension = getFileExtension(dokumen.nama_dokumen);

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
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <DialogTitle className="text-lg font-semibold truncate">
                  {dokumen.nama_dokumen}
                </DialogTitle>
              </div>

              {/* Metadata Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {extension.toUpperCase()}
                </Badge>
                <Badge variant="secondary" className="text-xs capitalize">
                  {dokumen.kategori.replace(/_/g, " ")}
                </Badge>
                {dokumen.nomor_bukti && (
                  <Badge variant="outline" className="text-xs">
                    Bukti: {dokumen.nomor_bukti}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={handleOpenInDrive}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Drive
              </Button>
              <Button variant="default" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row h-[calc(95vh-120px)]">
          {/* Main Preview Area */}
          <div className="flex-1 p-6 overflow-auto">
            {embedLink ? (
              <div className="relative w-full h-full min-h-[500px] bg-muted/30 rounded-lg overflow-hidden border">
                {/* Loading Overlay */}
                {iframeLoading && !iframeError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <div className="text-center space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="text-sm text-muted-foreground">Loading preview...</p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {iframeError ? (
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="text-center space-y-4 max-w-md">
                      <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Preview Tidak Dapat Dimuat</h3>
                        <p className="text-sm text-muted-foreground">
                          Google Drive mungkin memblokir embedding untuk file ini.
                          Silakan buka di tab baru atau download file.
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          onClick={handleOpenInDrive}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Buka di Tab Baru
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIframeError(false);
                            setIframeLoading(true);
                          }}
                        >
                          Coba Lagi
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Google Drive Iframe */
                  <iframe
                    src={embedLink}
                    className="w-full h-full"
                    title={dokumen.nama_dokumen}
                    allow="autoplay"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    referrerPolicy="no-referrer-when-downgrade"
                    loading="lazy"
                    onLoad={() => setIframeLoading(false)}
                    onError={() => {
                      setIframeLoading(false);
                      setIframeError(true);
                    }}
                  />
                )}
              </div>
            ) : (
              /* Fallback if no embed link */
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Preview Tidak Tersedia</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      File ini tidak memiliki link preview
                    </p>
                    <Button onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download untuk Melihat
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-muted/30 p-6 overflow-auto">
            <h3 className="font-semibold mb-4 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Informasi Dokumen
            </h3>

            <div className="space-y-4">
              {/* Perkara */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Perkara
                </label>
                <div className="mt-1.5 p-3 bg-background rounded-lg border">
                  <p className="font-medium text-sm">{dokumen.perkara.nomor_perkara}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {dokumen.perkara.judul}
                  </p>
                  {dokumen.perkara.klien && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Klien: {dokumen.perkara.klien.nama}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* File Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Ukuran:</span>
                  <span className="font-medium ml-auto">
                    {formatFileSize(dokumen.ukuran_file)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tipe:</span>
                  <span className="font-medium ml-auto">
                    {dokumen.tipe_file || '-'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Upload:</span>
                  <span className="font-medium ml-auto">
                    {formatDate(dokumen.tanggal_upload)}
                  </span>
                </div>

                {dokumen.tanggal_dokumen && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Tanggal Dokumen:</span>
                    <span className="font-medium ml-auto">
                      {formatDate(dokumen.tanggal_dokumen)}
                    </span>
                  </div>
                )}

                {dokumen.pengunggah && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Diunggah:</span>
                    <span className="font-medium ml-auto">
                      {dokumen.pengunggah.nama_lengkap}
                    </span>
                  </div>
                )}
              </div>

              {/* Catatan */}
              {dokumen.catatan && (
                <>
                  <Separator />
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Catatan
                    </label>
                    <div className="mt-1.5 p-3 bg-background rounded-lg border">
                      <p className="text-sm whitespace-pre-wrap">{dokumen.catatan}</p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleOpenInDrive}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Buka di Google Drive
                </Button>
                <Button
                  variant="default"
                  className="w-full justify-start"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
