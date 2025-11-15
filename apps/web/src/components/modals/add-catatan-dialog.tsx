// ============================================================================
// FILE: components/modals/add-catatan-dialog.tsx - NEW
// ============================================================================
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CreateCatatanDto } from "@/types";
import { catatanSchema, CatatanFormData } from "@/lib/schemas/catatan.schema";

interface AddCatatanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perkaraId: string;
  perkaraNomor: string;
  onAdd: (data: CreateCatatanDto) => Promise<void>;
}

export function AddCatatanDialog({
  open,
  onOpenChange,
  perkaraId,
  perkaraNomor,
  onAdd,
}: AddCatatanDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CatatanFormData>({
    resolver: zodResolver(catatanSchema),
    defaultValues: {
      perkara_id: perkaraId,
      catatan: "",
      dapat_ditagih: false,
      jam_kerja: undefined,
    },
  });

  const dapatDigih = watch("dapat_ditagih");

  const onSubmit = async (data: CatatanFormData) => {
    try {
      setIsLoading(true);
      await onAdd(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Add catatan error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Catatan Perkara</DialogTitle>
          <DialogDescription>
            Tambahkan catatan untuk perkara {perkaraNomor}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Catatan Text */}
          <div className="space-y-2">
            <Label htmlFor="catatan">
              Catatan <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="catatan"
              {...register("catatan")}
              placeholder="Tulis catatan untuk perkara ini..."
              rows={6}
              disabled={isLoading}
            />
            {errors.catatan && (
              <p className="text-sm text-destructive">{errors.catatan.message}</p>
            )}
          </div>

          {/* Dapat Ditagih Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="dapat_ditagih">Dapat Ditagih</Label>
              <p className="text-sm text-muted-foreground">
                Tandai jika waktu ini dapat ditagih ke klien
              </p>
            </div>
            <Switch
              id="dapat_ditagih"
              checked={dapatDigih}
              onCheckedChange={(checked) => setValue("dapat_ditagih", checked)}
              disabled={isLoading}
            />
          </div>

          {/* Jam Kerja (conditional) */}
          {dapatDigih && (
            <div className="space-y-2">
              <Label htmlFor="jam_kerja">
                Jam Kerja <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jam_kerja"
                type="number"
                step="0.25"
                min="0"
                {...register("jam_kerja", { valueAsNumber: true })}
                placeholder="2.5"
                disabled={isLoading}
              />
              {errors.jam_kerja && (
                <p className="text-sm text-destructive">{errors.jam_kerja.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Masukkan jumlah jam dalam desimal (contoh: 1.5 untuk 1 jam 30 menit)
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Catatan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}