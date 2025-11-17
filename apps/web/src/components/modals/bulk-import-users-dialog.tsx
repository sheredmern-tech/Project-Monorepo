// ============================================================================
// FILE: components/modals/bulk-import-users-dialog.tsx - FIXED VERSION
// ✅ Added Download Template functionality
// ✅ Better error display with details
// ============================================================================
"use client";

import { useState } from "react";
import { Upload, Download, X, AlertCircle, CheckCircle2, FileSpreadsheet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { timApi } from "@/lib/api/tim.api";
import { useToast } from "@/lib/hooks/use-toast";

interface BulkImportUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BulkImportUsersDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkImportUsersDialogProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    errors: Array<{ row: number; email: string; reason: string }>;
  } | null>(null);

  // ✅ Download CSV template handler
  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true);
      const blob = await timApi.downloadImportTemplate();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-import-template-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Template Downloaded",
        description: "CSV template berhasil didownload",
      });
    } catch (error) {
      console.error('Download template error:', error);
      toast({
        title: "Gagal",
        description: "Gagal mendownload template",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // ✅ Download Excel template handler
  const handleDownloadExcelTemplate = async () => {
    try {
      setIsDownloading(true);
      const blob = await timApi.downloadExcelTemplate();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-import-template-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Template Downloaded",
        description: "Excel template berhasil didownload",
      });
    } catch (error) {
      console.error('Download Excel template error:', error);
      toast({
        title: "Gagal",
        description: "Gagal mendownload Excel template",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const isValid = validExtensions.some(ext => selectedFile.name.endsWith(ext));

      if (!isValid) {
        toast({
          title: "File tidak valid",
          description: "Hanya file CSV atau Excel (.xlsx) yang diperbolehkan",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      const importResult = await timApi.bulkImportUsers(file);
      setResult(importResult);

      if (importResult.success > 0) {
        toast({
          title: "Import Selesai",
          description: `${importResult.success} user berhasil diimport, ${importResult.failed} gagal`,
        });
        
        if (importResult.failed === 0) {
          setTimeout(() => {
            onSuccess();
            onOpenChange(false);
          }, 2000);
        }
      } else {
        toast({
          title: "Import Gagal",
          description: "Semua user gagal diimport",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Bulk import error:', error);
      toast({
        title: "Gagal",
        description: error instanceof Error ? error.message : "Gagal import users",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ NEW: Download error CSV
  const handleDownloadErrors = () => {
    if (!result || result.errors.length === 0) return;

    const csvHeader = 'Row,Email,Reason\n';
    const csvRows = result.errors
      .map(err => `${err.row},"${err.email}","${err.reason}"`)
      .join('\n');
    const csvContent = csvHeader + csvRows;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-errors-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    if (!isUploading) {
      setFile(null);
      setResult(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Users</DialogTitle>
          <DialogDescription>
            Import multiple users sekaligus menggunakan file CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Template Section */}
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertDescription>
              <div className="flex flex-col gap-2">
                <span className="font-medium">Download template untuk format yang benar</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    disabled={isDownloading}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    CSV Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadExcelTemplate}
                    disabled={isDownloading}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Excel Template
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Format Info */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Format File (CSV atau Excel):</h4>
            <code className="text-sm">
              email,nama_lengkap,role,jabatan,telepon
            </code>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p>• <strong>email</strong>: Email user (wajib, unique)</p>
              <p>• <strong>nama_lengkap</strong>: Nama lengkap (wajib)</p>
              <p>• <strong>role</strong>: admin, advokat, paralegal, staff, klien (wajib)</p>
              <p>• <strong>jabatan</strong>: Jabatan user (opsional)</p>
              <p>• <strong>telepon</strong>: Nomor telepon (opsional)</p>
            </div>
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Download Excel template untuk format yang lebih rapi dengan sheet Instructions
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            {!file ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Pilih file CSV atau Excel (.xlsx) untuk diupload
                  </p>
                  <Button variant="outline" asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Browse Files
                      <input
                        id="file-upload"
                        type="file"
                        accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                    </label>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>Processing</span>
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="font-semibold text-green-900 dark:text-green-100">
                      {result.success} Berhasil
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-200">
                      User berhasil diimport
                    </div>
                  </AlertDescription>
                </Alert>

                <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <div className="font-semibold text-red-900 dark:text-red-100">
                      {result.failed} Gagal
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-200">
                      User gagal diimport
                    </div>
                  </AlertDescription>
                </Alert>
              </div>

              {/* Error Details */}
              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Error Details:</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadErrors}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Errors
                    </Button>
                  </div>
                  <ScrollArea className="h-[200px] rounded-lg border p-4">
                    <div className="space-y-2">
                      {result.errors.map((error, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm p-2 rounded bg-muted"
                        >
                          <Badge variant="destructive" className="shrink-0">
                            Row {error.row}
                          </Badge>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">{error.email}</p>
                            <p className="text-muted-foreground text-xs">
                              {error.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex-1"
            >
              {isUploading ? "Importing..." : "Import Users"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              {result ? "Close" : "Cancel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}