// ============================================================================
// FILE: components/shared/dokumen-preview.tsx - ENTERPRISE MODAL
// ✨ FEATURE: Toggle View/Edit Mode for Google Workspace Files
// ============================================================================
"use client";

import { useState, useMemo } from "react";
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
  AlertCircle,
  Edit,
  Eye
} from "lucide-react";
import { DokumenWithRelations } from "@/types";
import { formatDate, formatFileSize } from "@/lib/utils/format";
import { getFileExtension } from "@/lib/utils/file";

interface DokumenPreviewProps {
  dokumen: DokumenWithRelations;
  open: boolean;
  onClose: () => void;
}

/**
 * Helper function to detect Google Workspace file type and build URLs
 */
function getGoogleWorkspaceUrls(googleDriveId: string, mimeType?: string): {
  isEditable: boolean;
  viewUrl: string;
  editUrl: string;
  fileType: 'docs' | 'sheets' | 'slides' | 'generic';
} {
  // Google Workspace MIME types
  const GOOGLE_DOCS = 'application/vnd.google-apps.document';
  const GOOGLE_SHEETS = 'application/vnd.google-apps.spreadsheet';
  const GOOGLE_SLIDES = 'application/vnd.google-apps.presentation';

  // Detect file type and build appropriate URLs
  switch (mimeType) {
    case GOOGLE_DOCS:
      return {
        isEditable: true,
        viewUrl: `https://docs.google.com/document/d/${googleDriveId}/preview`,
        editUrl: `https://docs.google.com/document/d/${googleDriveId}/edit`,
        fileType: 'docs',
      };
    case GOOGLE_SHEETS:
      return {
        isEditable: true,
        viewUrl: `https://docs.google.com/spreadsheets/d/${googleDriveId}/preview`,
        editUrl: `https://docs.google.com/spreadsheets/d/${googleDriveId}/edit`,
        fileType: 'sheets',
      };
    case GOOGLE_SLIDES:
      return {
        isEditable: true,
        viewUrl: `https://docs.google.com/presentation/d/${googleDriveId}/preview`,
        editUrl: `https://docs.google.com/presentation/d/${googleDriveId}/edit`,
        fileType: 'slides',
      };
    default:
      // Generic file (PDF, images, etc) - no edit mode
      return {
        isEditable: false,
        viewUrl: `https://drive.google.com/file/d/${googleDriveId}/preview`,
        editUrl: `https://drive.google.com/file/d/${googleDriveId}/view`, // fallback
        fileType: 'generic',
      };
  }
}

export function DokumenPreview({ dokumen, open, onClose }: DokumenPreviewProps) {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // ✨ NEW: Edit mode state

  // ✅ Use Google Drive links directly
  const downloadLink = dokumen.google_drive_link;
  const extension = getFileExtension(dokumen.nama_dokumen);

  // ✨ NEW: Detect file type and build dynamic URLs
  const fileUrls = useMemo(() => {
    if (!dokumen.google_drive_id) {
      return {
        isEditable: false,
        viewUrl: dokumen.embed_link || '',
        editUrl: '',
        fileType: 'generic' as const,
      };
    }

    return getGoogleWorkspaceUrls(dokumen.google_drive_id, dokumen.tipe_file);
  }, [dokumen.google_drive_id, dokumen.tipe_file, dokumen.embed_link]);

  // ✨ Dynamic iframe URL based on mode
  const embedLink = isEditMode ? fileUrls.editUrl : fileUrls.viewUrl;

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
      <DialogContent className="max-w-[90vw] md:max-w-[95vw] lg:max-w-[1600px] max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/50 flex-shrink-0">
          <div className="flex flex-col gap-3 pr-8">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
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
            <div className="hidden lg:flex gap-2">
              {/* ✨ NEW: Edit Mode Toggle (only for Google Workspace files) */}
              {fileUrls.isEditable && (
                <Button
                  variant={isEditMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setIsEditMode(!isEditMode);
                    setIframeLoading(true); // Reset loading state when switching
                  }}
                >
                  {isEditMode ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Editing
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      View Mode
                    </>
                  )}
                </Button>
              )}
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

        <div className="flex flex-col lg:flex-row overflow-hidden" style={{ height: 'calc(90vh - 120px)' }}>
          {/* Main Preview Area */}
          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            {embedLink ? (
              <div className="relative w-full h-full bg-muted/30 rounded-lg overflow-hidden border">
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
                      <div className="flex gap-2 justify-center flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleOpenInDrive}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Buka di Tab Baru
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
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
          <div className="w-full lg:w-[420px] lg:max-w-md border-t lg:border-t-0 lg:border-l bg-muted/30 overflow-y-auto flex-shrink-0">
            <div className="p-4 lg:p-6 space-y-4">
              <h3 className="font-semibold flex items-center sticky top-0 bg-muted/30 py-2 -mt-2 backdrop-blur-sm">
                <FileText className="h-4 w-4 mr-2" />
                Informasi Dokumen
              </h3>

              {/* Mobile Action Buttons */}
              <div className="lg:hidden space-y-2">
                {/* ✨ NEW: Edit Mode Toggle for Mobile */}
                {fileUrls.isEditable && (
                  <Button
                    variant={isEditMode ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setIsEditMode(!isEditMode);
                      setIframeLoading(true);
                    }}
                  >
                    {isEditMode ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Editing
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        View Mode
                      </>
                    )}
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleOpenInDrive}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Drive
                  </Button>
                  <Button variant="default" size="sm" className="flex-1" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Perkara */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Perkara
                </label>
                <div className="p-3 bg-background rounded-lg border">
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
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <HardDrive className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Ukuran:</span>
                  <span className="font-medium ml-auto text-right">
                    {formatFileSize(dokumen.ukuran_file)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Tipe:</span>
                  <span className="font-medium ml-auto text-right truncate max-w-[150px]">
                    {dokumen.tipe_file || '-'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Upload:</span>
                  <span className="font-medium ml-auto text-right">
                    {formatDate(dokumen.tanggal_upload)}
                  </span>
                </div>

                {dokumen.tanggal_dokumen && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground text-xs">Tgl Dokumen:</span>
                    <span className="font-medium ml-auto text-right">
                      {formatDate(dokumen.tanggal_dokumen)}
                    </span>
                  </div>
                )}

                {dokumen.pengunggah && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Diunggah:</span>
                    <span className="font-medium ml-auto text-right">
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
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
                      Catatan
                    </label>
                    <div className="p-3 bg-background rounded-lg border max-h-32 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap break-words">{dokumen.catatan}</p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Desktop Action Buttons */}
              <div className="hidden lg:block space-y-2">
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
