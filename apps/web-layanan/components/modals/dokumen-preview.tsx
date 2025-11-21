// ============================================================================
// FILE: components/modals/dokumen-preview.tsx - SIMPLIFIED FOR KLIEN
// ✨ FEATURE: Toggle View/Edit Mode for Google Workspace Files
// ============================================================================
'use client';

import { useState, useMemo } from 'react';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  Calendar,
  HardDrive,
  Tag,
  Loader2,
  AlertCircle,
  Edit,
  Eye,
} from 'lucide-react';
import { formatFileSize } from '@/lib/utils/fileValidation';

interface DokumenPreviewProps {
  dokumen: {
    id: string;
    nama_dokumen: string;
    tipe_dokumen?: string;
    deskripsi?: string;
    file_size?: number;
    mime_type?: string;
    uploaded_at: string;
    google_drive_link?: string;
    google_drive_id?: string;
    embed_link?: string;
  };
  open: boolean;
  onClose: () => void;
}

/**
 * Helper function to detect Google Workspace file type and build URLs
 * ✨ UPDATED: Now supports MS Office files (DOCX, XLSX, PPTX)
 */
function getGoogleWorkspaceUrls(googleDriveId: string, mimeType?: string): {
  isEditable: boolean;
  viewUrl: string;
  editUrl: string;
  fileType: 'docs' | 'sheets' | 'slides' | 'office' | 'generic';
} {
  // Google Workspace MIME types (Native)
  const GOOGLE_DOCS = 'application/vnd.google-apps.document';
  const GOOGLE_SHEETS = 'application/vnd.google-apps.spreadsheet';
  const GOOGLE_SLIDES = 'application/vnd.google-apps.presentation';

  // Microsoft Office MIME types
  const MS_WORD = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; // .docx
  const MS_EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // .xlsx
  const MS_POWERPOINT = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'; // .pptx
  const MS_WORD_OLD = 'application/msword'; // .doc
  const MS_EXCEL_OLD = 'application/vnd.ms-excel'; // .xls
  const MS_POWERPOINT_OLD = 'application/vnd.ms-powerpoint'; // .ppt

  // Detect file type and build appropriate URLs
  switch (mimeType) {
    // Google Workspace Native Files
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

    // ✨ NEW: Microsoft Office Files (Editable in Google Drive!)
    case MS_WORD:
    case MS_WORD_OLD:
    case MS_EXCEL:
    case MS_EXCEL_OLD:
    case MS_POWERPOINT:
    case MS_POWERPOINT_OLD:
      return {
        isEditable: true,
        viewUrl: `https://drive.google.com/file/d/${googleDriveId}/preview`,
        // ✅ MS Office files can be opened in Google Drive editor
        editUrl: `https://drive.google.com/file/d/${googleDriveId}/edit`,
        fileType: 'office',
      };

    default:
      // Generic file (PDF, images, etc) - no edit mode
      return {
        isEditable: false,
        viewUrl: `https://drive.google.com/file/d/${googleDriveId}/preview`,
        editUrl: `https://drive.google.com/file/d/${googleDriveId}/view`,
        fileType: 'generic',
      };
  }
}

export function DokumenPreview({ dokumen, open, onClose }: DokumenPreviewProps) {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // ✨ NEW: Edit mode state

  const downloadLink = dokumen.google_drive_link;
  const extension = dokumen.nama_dokumen.split('.').pop()?.toUpperCase() || 'FILE';

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

    return getGoogleWorkspaceUrls(dokumen.google_drive_id, dokumen.mime_type);
  }, [dokumen.google_drive_id, dokumen.mime_type, dokumen.embed_link]);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[95vw] lg:max-w-[1400px] max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0 flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-8">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {dokumen.nama_dokumen}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {extension}
              </span>
              {dokumen.tipe_dokumen && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded capitalize">
                  {dokumen.tipe_dokumen.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex gap-2">
            {/* ✨ NEW: Edit Mode Toggle (only for Google Workspace files) */}
            {fileUrls.isEditable && (
              <button
                onClick={() => {
                  setIsEditMode(!isEditMode);
                  setIframeLoading(true); // Reset loading state when switching
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition ${
                  isEditMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {isEditMode ? (
                  <>
                    <Edit className="h-4 w-4" />
                    Editing
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    View Mode
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleOpenInDrive}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Drive
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
          {/* Main Preview Area */}
          <div className="flex-1 p-4 lg:p-6 overflow-auto bg-gray-100">
            {embedLink ? (
              <div className="relative w-full h-full bg-white rounded-lg overflow-hidden border shadow-sm" style={{ minHeight: '500px' }}>
                {/* Loading Overlay */}
                {iframeLoading && !iframeError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-10">
                    <div className="text-center space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                      <p className="text-sm text-gray-600">Loading preview...</p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {iframeError ? (
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="text-center space-y-4 max-w-md">
                      <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Preview Tidak Dapat Dimuat</h3>
                        <p className="text-sm text-gray-600">
                          Google Drive mungkin memblokir embedding untuk file ini.
                          Silakan buka di tab baru atau download file.
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center flex-wrap">
                        <button
                          onClick={handleOpenInDrive}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <ExternalLink className="inline h-4 w-4 mr-2" />
                          Buka di Tab Baru
                        </button>
                        <button
                          onClick={() => {
                            setIframeError(false);
                            setIframeLoading(true);
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Coba Lagi
                        </button>
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
                  <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Preview Tidak Tersedia</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      File ini tidak memiliki link preview
                    </p>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Download className="inline h-4 w-4 mr-2" />
                      Download untuk Melihat
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l bg-gray-50 overflow-y-auto flex-shrink-0">
            <div className="p-4 lg:p-6 space-y-4">
              <h3 className="font-semibold flex items-center text-gray-900">
                <FileText className="h-4 w-4 mr-2" />
                Informasi Dokumen
              </h3>

              {/* Mobile Action Buttons */}
              <div className="lg:hidden space-y-2">
                {/* ✨ NEW: Edit Mode Toggle for Mobile */}
                {fileUrls.isEditable && (
                  <button
                    onClick={() => {
                      setIsEditMode(!isEditMode);
                      setIframeLoading(true);
                    }}
                    className={`w-full px-4 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition ${
                      isEditMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isEditMode ? (
                      <>
                        <Edit className="h-4 w-4" />
                        Editing
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        View Mode
                      </>
                    )}
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleOpenInDrive}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ExternalLink className="inline h-4 w-4 mr-2" />
                    Open in Drive
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Download className="inline h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>

              {/* File Details */}
              <div className="space-y-3 pt-2">
                {dokumen.file_size && (
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-600">Ukuran:</span>
                    <span className="font-medium text-gray-900 ml-auto">
                      {formatFileSize(dokumen.file_size)}
                    </span>
                  </div>
                )}

                {dokumen.mime_type && (
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-600">Tipe:</span>
                    <span className="font-medium text-gray-900 ml-auto truncate max-w-[150px]">
                      {dokumen.mime_type}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-600">Upload:</span>
                  <span className="font-medium text-gray-900 ml-auto">
                    {new Date(dokumen.uploaded_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Deskripsi */}
              {dokumen.deskripsi && (
                <>
                  <div className="border-t pt-4">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
                      Deskripsi
                    </label>
                    <div className="p-3 bg-white rounded-lg border max-h-32 overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                        {dokumen.deskripsi}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Desktop Action Buttons */}
              <div className="hidden lg:block space-y-2 pt-2">
                <button
                  onClick={handleOpenInDrive}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Buka di Google Drive
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
