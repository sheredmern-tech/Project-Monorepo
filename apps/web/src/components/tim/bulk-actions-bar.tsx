// ============================================================================
// FILE: components/tim/bulk-actions-bar.tsx - CLEANED
// ============================================================================
"use client";

import { useState } from "react";
import { Download, Trash2, UserCog, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkActionError {
  user_id?: string;
  email: string;
  reason: string;
}

interface BulkActionResult {
  success: number;
  failed: number;
  errors: BulkActionError[];
}

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => Promise<BulkActionResult | void>;
  onBulkChangeRole: (role: string) => Promise<BulkActionResult | void>;
  onExport: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkChangeRole,
  onExport,
}: BulkActionsBarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<BulkActionResult | null>(null);
  const [lastAction, setLastAction] = useState<"delete" | "role">("delete");

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      const result = await onBulkDelete();
      setShowDeleteDialog(false);
      
      if (result && typeof result === 'object' && 'errors' in result) {
        setLastResult(result);
        setLastAction("delete");
        if (result.failed > 0) {
          setShowResultDialog(true);
        }
      }
    } catch {
      // Error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkChangeRole = async () => {
    if (!selectedRole) return;
    
    try {
      setIsLoading(true);
      const result = await onBulkChangeRole(selectedRole);
      setShowRoleDialog(false);
      setSelectedRole("");
      
      if (result && typeof result === 'object' && 'errors' in result) {
        setLastResult(result);
        setLastAction("role");
        if (result.failed > 0) {
          setShowResultDialog(true);
        }
      }
    } catch {
      // Error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadErrors = () => {
    if (!lastResult || lastResult.errors.length === 0) return;

    const csvHeader = 'Email,User ID,Reason\n';
    const csvRows = lastResult.errors
      .map(err => `"${err.email}","${err.user_id || 'N/A'}","${err.reason}"`)
      .join('\n');
    const csvContent = csvHeader + csvRows;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-${lastAction}-errors-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4 flex items-center gap-4 min-w-[500px]">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {selectedCount} dipilih
          </Badge>
          
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={onExport}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowRoleDialog(true)}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Ubah Role
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="hover:bg-primary-foreground/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {selectedCount} User?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {selectedCount} user yang dipilih?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? "Menghapus..." : "Hapus Semua"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Role Dialog */}
      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ubah Role {selectedCount} User</AlertDialogTitle>
            <AlertDialogDescription>
              Pilih role baru untuk {selectedCount} user yang dipilih.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih role baru" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="advokat">Advokat</SelectItem>
                <SelectItem value="paralegal">Paralegal</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="klien">Klien</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkChangeRole}
              disabled={isLoading || !selectedRole}
            >
              {isLoading ? "Mengubah..." : "Ubah Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Result Dialog with Error Details */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Hasil Bulk {lastAction === "delete" ? "Delete" : "Change Role"}
            </DialogTitle>
            <DialogDescription>
              Operasi selesai dengan beberapa kesalahan
            </DialogDescription>
          </DialogHeader>

          {lastResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="font-semibold text-green-900 dark:text-green-100">
                      {lastResult.success} Berhasil
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-200">
                      User berhasil di{lastAction === "delete" ? "hapus" : "update"}
                    </div>
                  </AlertDescription>
                </Alert>

                <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <div className="font-semibold text-red-900 dark:text-red-100">
                      {lastResult.failed} Gagal
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-200">
                      Lihat detail error di bawah
                    </div>
                  </AlertDescription>
                </Alert>
              </div>

              {/* Error Details */}
              {lastResult.errors.length > 0 && (
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

                  <ScrollArea className="h-[300px] rounded-lg border p-4">
                    <div className="space-y-2">
                      {lastResult.errors.map((error, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted"
                        >
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{error.email}</p>
                              {error.user_id && (
                                <Badge variant="outline" className="text-xs">
                                  ID: {error.user_id.substring(0, 8)}...
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
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

          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
