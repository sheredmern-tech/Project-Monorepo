// ============================================================================
// FILE: components/modals/add-team-member-dialog.tsx - CLEANED
// ============================================================================
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TimPerkaraForm } from "@/components/forms/tim-perkara-form";
import { CreateTimPerkaraDto } from "@/types";

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perkaraId: string;
  perkaraNomor: string;
  existingMemberIds?: string[];
  onAdd: (data: CreateTimPerkaraDto) => Promise<void>;
}

export function AddTeamMemberDialog({
  open,
  onOpenChange,
  perkaraId,
  perkaraNomor,
  existingMemberIds = [],
  onAdd,
}: AddTeamMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateTimPerkaraDto) => {
    try {
      setIsLoading(true);
      await onAdd(data);
      onOpenChange(false);
    } catch {
      // Error handling in parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Anggota Tim Perkara</DialogTitle>
          <DialogDescription>
            Tambahkan anggota tim untuk perkara{" "}
            <span className="font-medium text-foreground">{perkaraNomor}</span>
          </DialogDescription>
        </DialogHeader>

        <TimPerkaraForm
          perkaraId={perkaraId}
          existingMemberIds={existingMemberIds}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
