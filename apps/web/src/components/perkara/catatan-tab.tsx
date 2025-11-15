// ============================================================================
// FILE: components/perkara/catatan-tab.tsx - CLEAN VERSION
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { Plus, Clock, DollarSign, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { AddCatatanDialog } from "@/components/modals/add-catatan-dialog";
import { useCatatan } from "@/lib/hooks/use-catatan";
import { CreateCatatanDto } from "@/types";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";

interface CatatanTabProps {
  perkaraId: string;
  perkaraNomor: string;
}

export function CatatanTab({ perkaraId, perkaraNomor }: CatatanTabProps) {
  const {
    isLoading,
    fetchCatatan,
    createCatatan,
    deleteCatatan,
    getCatatanByPerkaraId,
    getTotalBillableHours,
    getTotalNonBillableHours,
  } = useCatatan();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; text: string } | null>(null);

  useEffect(() => {
    fetchCatatan({ perkara_id: perkaraId });
  }, [perkaraId, fetchCatatan]);

  const perkaraCatatan = getCatatanByPerkaraId(perkaraId);
  const totalBillable = getTotalBillableHours(perkaraCatatan);
  const totalNonBillable = getTotalNonBillableHours(perkaraCatatan);

  const handleAdd = async (data: CreateCatatanDto) => {
    try {
      await createCatatan(data);
      setShowAddDialog(false);
    } catch {
      // Error handled by hook
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      await deleteCatatan(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading && perkaraCatatan.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Catatan</p>
                <p className="text-2xl font-bold">{perkaraCatatan.length}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jam Billable</p>
                <p className="text-2xl font-bold text-green-600">{totalBillable}h</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jam Non-Billable</p>
                <p className="text-2xl font-bold">{totalNonBillable}h</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Catatan Perkara</h3>
          <p className="text-sm text-muted-foreground">
            Catatan dan log aktivitas untuk perkara ini
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Catatan
        </Button>
      </div>

      {/* Catatan List */}
      {perkaraCatatan.length > 0 ? (
        <div className="space-y-4">
          {perkaraCatatan.map((cat) => (
            <Card key={cat.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* User & Time */}
                    <div className="flex items-center gap-3">
                      {cat.user && <UserAvatar user={cat.user} className="h-8 w-8" />}
                      <div>
                        <p className="font-medium">
                          {cat.user?.nama_lengkap || "System"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatDate(cat.created_at)}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(cat.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-sm whitespace-pre-wrap">{cat.catatan}</p>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {cat.dapat_ditagih ? (
                        <Badge variant="default" className="gap-1">
                          <DollarSign className="h-3 w-3" />
                          Billable
                        </Badge>
                      ) : (
                        <Badge variant="outline">Non-Billable</Badge>
                      )}
                      {cat.jam_kerja && (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {cat.jam_kerja}h
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement edit functionality
                        console.log('Edit catatan:', cat.id);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget({ 
                        id: cat.id, 
                        text: cat.catatan.substring(0, 50) 
                      })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Clock}
          title="Belum ada catatan"
          description="Tambahkan catatan pertama untuk perkara ini"
          action={{
            label: "Tambah Catatan",
            onClick: () => setShowAddDialog(true),
          }}
        />
      )}

      {/* Add Dialog */}
      <AddCatatanDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        perkaraId={perkaraId}
        perkaraNomor={perkaraNomor}
        onAdd={handleAdd}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Catatan"
        description={`Apakah Anda yakin ingin menghapus catatan "${deleteTarget?.text}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        confirmText="Hapus"
        variant="destructive"
      />
    </div>
  );
}