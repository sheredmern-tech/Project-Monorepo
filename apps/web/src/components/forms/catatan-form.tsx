// ============================================================================
// FILE: components/forms/catatan-form.tsx
// ============================================================================
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { catatanSchema, CatatanFormData } from "@/lib/schemas/catatan.schema";
import { CatatanPerkaraEntity } from "@/types";

interface CatatanFormProps {
  perkaraId: string;
  initialData?: CatatanPerkaraEntity;
  onSubmit: (data: CatatanFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function CatatanForm({
  perkaraId,
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: CatatanFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CatatanFormData>({
    resolver: zodResolver(catatanSchema),
    defaultValues: initialData ? {
      perkara_id: initialData.perkara_id,
      catatan: initialData.catatan,
      dapat_ditagih: initialData.dapat_ditagih,
      jam_kerja: initialData.jam_kerja ?? undefined,
    } : {
      perkara_id: perkaraId,
      catatan: "",
      dapat_ditagih: false,
      jam_kerja: undefined,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const dapatDitagih = watch("dapat_ditagih");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Catatan Perkara</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="catatan">
              Catatan <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="catatan"
              placeholder="Tulis catatan perkara..."
              rows={6}
              disabled={isLoading}
              {...register("catatan")}
            />
            {errors.catatan && <p className="text-sm text-red-500">{errors.catatan.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="dapat_ditagih"
              checked={dapatDitagih}
              onCheckedChange={(checked) => setValue("dapat_ditagih", checked)}
              disabled={isLoading}
            />
            <Label htmlFor="dapat_ditagih">Dapat ditagih ke klien</Label>
          </div>

          {dapatDitagih && (
            <div className="space-y-2">
              <Label htmlFor="jam_kerja">Jam Kerja</Label>
              <Input
                id="jam_kerja"
                type="number"
                step="0.5"
                placeholder="0"
                disabled={isLoading}
                {...register("jam_kerja", { valueAsNumber: true })}
              />
              {errors.jam_kerja && <p className="text-sm text-red-500">{errors.jam_kerja.message}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Catatan
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
      </div>
    </form>
  );
}