// ============================================================================
// FILE 7: components/forms/klien-form.tsx - WITH IMPROVED ERROR HANDLING
// ============================================================================
"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { klienSchema } from "@/lib/schemas/klien.schema";
import { KlienEntity } from "@/types";
import type { z } from "zod";
import { toast } from "sonner";

interface KlienFormProps {
  initialData?: KlienEntity;
  onSubmit: (data: z.infer<typeof klienSchema>) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
  mode?: "create" | "edit";
}

export function KlienForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
  mode = "create",
}: KlienFormProps) {
  const defaultValues = initialData
    ? {
        nama: initialData.nama,
        jenis_klien: initialData.jenis_klien || "perorangan",
        nomor_identitas: initialData.nomor_identitas || undefined,
        npwp: initialData.npwp || undefined,
        email: initialData.email || undefined,
        telepon: initialData.telepon || undefined,
        telepon_alternatif: initialData.telepon_alternatif || undefined,
        alamat: initialData.alamat || undefined,
        kelurahan: initialData.kelurahan || undefined,
        kecamatan: initialData.kecamatan || undefined,
        kota: initialData.kota || undefined,
        provinsi: initialData.provinsi || undefined,
        kode_pos: initialData.kode_pos || undefined,
        nama_perusahaan: initialData.nama_perusahaan || undefined,
        bentuk_badan_usaha: initialData.bentuk_badan_usaha || undefined,
        nomor_akta: initialData.nomor_akta || undefined,
        nama_kontak_darurat: initialData.nama_kontak_darurat || undefined,
        telepon_kontak_darurat: initialData.telepon_kontak_darurat || undefined,
        catatan: initialData.catatan || undefined,
      }
    : {
        jenis_klien: "perorangan",
      };

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(klienSchema),
    defaultValues,
  });

  const jenisKlien = useWatch({ control, name: "jenis_klien" });

  // ✅ IMPROVED: Better error handling
  const handleSubmit = async (data: z.infer<typeof klienSchema>) => {
    try {
      await onSubmit(data);
      toast.success(
        mode === "create" 
          ? "Klien berhasil ditambahkan" 
          : "Klien berhasil diperbarui"
      );
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : `Gagal ${mode === "create" ? "menambahkan" : "memperbarui"} klien`;
      toast.error(message);
      throw error;
    }
  };

  return (
    <form onSubmit={rhfHandleSubmit(handleSubmit)} className="space-y-6">
      {/* Informasi Dasar */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nama"
              placeholder="Masukkan nama lengkap"
              disabled={isLoading}
              {...register("nama")}
            />
            {errors.nama && (
              <p className="text-sm text-red-500">{errors.nama.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jenis_klien">Jenis Klien</Label>
            <Select
              value={jenisKlien}
              onValueChange={(value) => setValue("jenis_klien", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perorangan">Perorangan</SelectItem>
                <SelectItem value="perusahaan">Perusahaan</SelectItem>
                <SelectItem value="instansi">Instansi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomor_identitas">Nomor Identitas (KTP/SIM)</Label>
              <Input
                id="nomor_identitas"
                placeholder="3273xxxxxxxxxxxxxx"
                disabled={isLoading}
                {...register("nomor_identitas")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="npwp">NPWP</Label>
              <Input
                id="npwp"
                placeholder="xx.xxx.xxx.x-xxx.xxx"
                disabled={isLoading}
                {...register("npwp")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kontak */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Kontak</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telepon">Telepon</Label>
              <Input
                id="telepon"
                placeholder="08xxxxxxxxxx"
                disabled={isLoading}
                {...register("telepon")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telepon_alternatif">Telepon Alternatif</Label>
              <Input
                id="telepon_alternatif"
                placeholder="08xxxxxxxxxx"
                disabled={isLoading}
                {...register("telepon_alternatif")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alamat */}
      <Card>
        <CardHeader>
          <CardTitle>Alamat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat Lengkap</Label>
            <Textarea
              id="alamat"
              placeholder="Jl. Contoh No. 123"
              rows={3}
              disabled={isLoading}
              {...register("alamat")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kelurahan">Kelurahan</Label>
              <Input
                id="kelurahan"
                placeholder="Kelurahan"
                disabled={isLoading}
                {...register("kelurahan")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kecamatan">Kecamatan</Label>
              <Input
                id="kecamatan"
                placeholder="Kecamatan"
                disabled={isLoading}
                {...register("kecamatan")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kota">Kota/Kabupaten</Label>
              <Input
                id="kota"
                placeholder="Kota"
                disabled={isLoading}
                {...register("kota")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provinsi">Provinsi</Label>
              <Input
                id="provinsi"
                placeholder="Provinsi"
                disabled={isLoading}
                {...register("provinsi")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kode_pos">Kode Pos</Label>
              <Input
                id="kode_pos"
                placeholder="40xxx"
                disabled={isLoading}
                {...register("kode_pos")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informasi Perusahaan (conditional) */}
      {jenisKlien === "perusahaan" && (
        <Card>
          <CardHeader>
            <CardTitle>Informasi Perusahaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama_perusahaan">Nama Perusahaan</Label>
              <Input
                id="nama_perusahaan"
                placeholder="PT. Contoh Indonesia"
                disabled={isLoading}
                {...register("nama_perusahaan")}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bentuk_badan_usaha">Bentuk Badan Usaha</Label>
                <Input
                  id="bentuk_badan_usaha"
                  placeholder="PT, CV, dll"
                  disabled={isLoading}
                  {...register("bentuk_badan_usaha")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomor_akta">Nomor Akta</Label>
                <Input
                  id="nomor_akta"
                  placeholder="Nomor akta pendirian"
                  disabled={isLoading}
                  {...register("nomor_akta")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kontak Darurat */}
      <Card>
        <CardHeader>
          <CardTitle>Kontak Darurat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nama_kontak_darurat">Nama Kontak Darurat</Label>
              <Input
                id="nama_kontak_darurat"
                placeholder="Nama"
                disabled={isLoading}
                {...register("nama_kontak_darurat")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telepon_kontak_darurat">Telepon Darurat</Label>
              <Input
                id="telepon_kontak_darurat"
                placeholder="08xxxxxxxxxx"
                disabled={isLoading}
                {...register("telepon_kontak_darurat")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catatan */}
      <Card>
        <CardHeader>
          <CardTitle>Catatan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan Tambahan</Label>
            <Textarea
              id="catatan"
              placeholder="Catatan atau informasi tambahan..."
              rows={4}
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
          {mode === "create" ? "Tambah Klien" : "Simpan Perubahan"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
      </div>
    </form>
  );
}
