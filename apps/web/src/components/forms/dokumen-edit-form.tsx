// ============================================================================
// FILE: components/forms/dokumen-edit-form.tsx
// ============================================================================
"use client";

import { useForm, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormDatePicker } from "@/components/form-fields";
import { DokumenEntity, UpdateDokumenDto, KategoriDokumen } from "@/types";

interface DokumenEditFormProps {
  initialData: DokumenEntity;
  onSubmit: (data: UpdateDokumenDto) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function DokumenEditForm({ initialData, onSubmit, isLoading, onCancel }: DokumenEditFormProps) {
  const { register, handleSubmit, control, setValue, watch } = useForm<UpdateDokumenDto>({
    defaultValues: {
      nama_dokumen: initialData.nama_dokumen,
      kategori: initialData.kategori,
      nomor_bukti: initialData.nomor_bukti || "",
      tanggal_dokumen: initialData.tanggal_dokumen
        ? new Date(initialData.tanggal_dokumen).toISOString().split('T')[0]
        : "",
      catatan: initialData.catatan || "",
    },
  });

  // Use useWatch instead of watch for better React Compiler compatibility
  const kategori = useWatch({ control, name: "kategori" });

  // ✅ FIX: Wrapper to convert tanggal_dokumen to ISO DateTime
  const handleFormSubmit = (data: UpdateDokumenDto) => {
    const submitData: UpdateDokumenDto = {
      ...data,
      tanggal_dokumen: data.tanggal_dokumen
        ? new Date(data.tanggal_dokumen).toISOString()
        : "",
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Metadata Dokumen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama_dokumen">Nama Dokumen</Label>
            <Input
              id="nama_dokumen"
              disabled={isLoading}
              {...register("nama_dokumen")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={kategori}
                onValueChange={(value) => setValue("kategori", value as KategoriDokumen)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(KategoriDokumen).map((kat) => (
                    <SelectItem key={kat} value={kat} className="capitalize">
                      {kat.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomor_bukti">Nomor Bukti</Label>
              <Input
                id="nomor_bukti"
                placeholder="P-1, T-1, dll"
                disabled={isLoading}
                {...register("nomor_bukti")}
              />
            </div>

            <FormDatePicker
              name="tanggal_dokumen"
              label="Tanggal Dokumen"
              disabled={isLoading}
              placeholder="Pilih tanggal dokumen"
              watch={watch}
              setValue={setValue}
              className="space-y-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan</Label>
            <Textarea
              id="catatan"
              placeholder="Catatan tambahan..."
              rows={3}
              disabled={isLoading}
              {...register("catatan")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Perubahan
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
      </div>
    </form>
  );
}