// ============================================================================
// FILE: components/modals/assign-task-dialog.tsx
// ============================================================================
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface AssignTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  currentAssignee?: string;
  users: Array<{ id: string; nama_lengkap: string }>;
  onAssign: (userId: string) => Promise<void>;
}

export function AssignTaskDialog({
  open,
  onOpenChange,
  currentAssignee,
  users,
  onAssign,
}: AssignTaskDialogProps) {
  const [selectedUser, setSelectedUser] = useState(currentAssignee || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      await onAssign(selectedUser);
      onOpenChange(false);
    } catch {
      // Error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tugaskan Kepada</DialogTitle>
          <DialogDescription>
            Pilih anggota tim yang akan mengerjakan tugas ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Petugas</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih petugas..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.nama_lengkap}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={handleAssign} disabled={isLoading || !selectedUser}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tugaskan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}