// ============================================================================
// FILE 1: components/forms/perkara-form.tsx - REFACTORED
// ============================================================================
"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseISO } from "date-fns";
import { Loader2, Search, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectKlienModal } from "@/components/modals/select-klien-modal";
import { perkaraSchema, PerkaraFormData } from "@/lib/schemas/perkara.schema";
import { PerkaraEntity, JenisPerkara, StatusPerkara, PrioritasTugas } from "@/types";
import { handleApiError, formatValidationErrors } from "@/lib/utils/error-handler";
import { toast } from "sonner";

interface PerkaraFormProps {
  initialData?: PerkaraEntity;
  onSubmit: (data: PerkaraFormData) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
  mode?: "create" | "edit";
}

export function PerkaraForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
  mode = "create",
}: PerkaraFormProps) {
  const [openKlienModal, setOpenKlienModal] = useState(false);
  const [selectedKlienName, setSelectedKlienName] = useState<string>("");
  const [generalError, setGeneralError] = useState<string | null>(null);

  const getDefaultValues = (): Partial<PerkaraFormData> => {
    if (initialData) {
      return {
        nomor_perkara: initialData.nomor_perkara,
        nomor_perkara_pengadilan: initialData.nomor_perkara_pengadilan ?? "",
        judul: initialData.judul,
        deskripsi: initialData.deskripsi ?? "",
        klien_id: initialData.klien_id ?? "",
        jenis_perkara: initialData.jenis_perkara,
        status: initialData.status,
        prioritas: initialData.prioritas,
        tingkat_pengadilan: initialData.tingkat_pengadilan ?? "",
        nama_pengadilan: initialData.nama_pengadilan ?? "",
        nomor_ruang_sidang: initialData.nomor_ruang_sidang ?? "",
        nama_hakim_ketua: initialData.nama_hakim_ketua ?? "",
        posisi_klien: initialData.posisi_klien ?? "",
        pihak_lawan: initialData.pihak_lawan ?? "",
        kuasa_hukum_lawan: initialData.kuasa_hukum_lawan ?? "",
        nilai_perkara: initialData.nilai_perkara ?? 0,
        tanggal_register: initialData.tanggal_register ?? "",
        tanggal_sidang_pertama: initialData.tanggal_sidang_pertama ?? "",
        nilai_fee: initialData.nilai_fee ?? 0,
        status_pembayaran: initialData.status_pembayaran ?? "",
        catatan: initialData.catatan ?? "",
      };
    }
    return {
      jenis_perkara: JenisPerkara.PERDATA,
      status: StatusPerkara.AKTIF,
      prioritas: PrioritasTugas.SEDANG,
    };
  };

  const form = useForm<PerkaraFormData>({
    resolver: zodResolver(perkaraSchema),
    defaultValues: getDefaultValues(),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    setError,
  } = form;

  const klienId = useWatch({ control, name: "klien_id" });
  const jenisPerkara = useWatch({ control, name: "jenis_perkara" });
  const status = useWatch({ control, name: "status" });
  const prioritas = useWatch({ control, name: "prioritas" });
  const statusPembayaran = useWatch({ control, name: "status_pembayaran" });

  // ✅ Enhanced submit with validation error handling + ISO DateTime conversion
  const handleFormSubmit = async (data: PerkaraFormData) => {
    try {
      setGeneralError(null);

      // ✅ FIX: Konversi date fields ke ISO DateTime untuk Prisma
      const submitData: PerkaraFormData = {
        ...data,
        tanggal_register: data.tanggal_register
          ? new Date(data.tanggal_register).toISOString()
          : undefined,
        tanggal_sidang_pertama: data.tanggal_sidang_pertama
          ? new Date(data.tanggal_sidang_pertama).toISOString()
          : undefined,
      };

      await onSubmit(submitData);
      toast.success(
        mode === "create"
          ? "Perkara berhasil ditambahkan"
          : "Perkara berhasil diperbarui"
      );
    } catch (error) {
      // ✅ Handle validation errors from backend
      const validationErrors = formatValidationErrors(error);
      if (validationErrors) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setError(field as keyof PerkaraFormData, {
            type: "manual",
            message,
          });
        });
        setGeneralError("Terdapat kesalahan pada form. Silakan periksa kembali.");
      } else {
        const message = error instanceof Error ? error.message : "Terjadi kesalahan";
        setGeneralError(message);
        handleApiError(error, "Gagal menyimpan perkara");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* ✅ General Error Alert */}
      {generalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      {/* Informasi Dasar */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomor_perkara">
                Nomor Perkara <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomor_perkara"
                placeholder="001/PDT/2024/PN.XXX"
                disabled={isLoading}
                {...register("nomor_perkara")}
              />
              {errors.nomor_perkara && (
                <p className="text-sm text-red-500">{errors.nomor_perkara.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomor_perkara_pengadilan">Nomor Perkara Pengadilan</Label>
              <Input
                id="nomor_perkara_pengadilan"
                placeholder="Nomor dari pengadilan"
                disabled={isLoading}
                {...register("nomor_perkara_pengadilan")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="judul">
              Judul Perkara <span className="text-red-500">*</span>
            </Label>
            <Input
              id="judul"
              placeholder="Judul singkat perkara"
              disabled={isLoading}
              {...register("judul")}
            />
            {errors.judul && <p className="text-sm text-red-500">{errors.judul.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              placeholder="Deskripsi lengkap perkara..."
              rows={4}
              disabled={isLoading}
              {...register("deskripsi")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>
                Jenis Perkara <span className="text-red-500">*</span>
              </Label>
              <Select
                value={jenisPerkara}
                onValueChange={(value) => setValue("jenis_perkara", value as JenisPerkara)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(JenisPerkara).map((jenis) => (
                    <SelectItem key={jenis} value={jenis} className="capitalize">
                      {jenis.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.jenis_perkara && (
                <p className="text-sm text-red-500">{errors.jenis_perkara.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setValue("status", value as StatusPerkara)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(StatusPerkara).map((stat) => (
                    <SelectItem key={stat} value={stat} className="capitalize">
                      {stat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioritas</Label>
              <Select
                value={prioritas}
                onValueChange={(value) => setValue("prioritas", value as PrioritasTugas)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PrioritasTugas).map((prio) => (
                    <SelectItem key={prio} value={prio} className="capitalize">
                      {prio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ✅ Klien Selection with Searchable Modal */}
          <div className="space-y-2">
            <Label>Klien</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-3"
              disabled={isLoading}
              onClick={() => setOpenKlienModal(true)}
            >
              {selectedKlienName ? (
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-medium">{selectedKlienName}</span>
                  <span className="text-xs text-muted-foreground">
                    {klienId ? "Klik untuk ubah" : ""}
                  </span>
                </div>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Pilih klien...</span>
                </>
              )}
            </Button>
            {klienId && selectedKlienName && (
              <p className="text-xs text-muted-foreground">
                Klien dipilih: {selectedKlienName}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informasi Pengadilan */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pengadilan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tingkat_pengadilan">Tingkat Pengadilan</Label>
              <Input
                id="tingkat_pengadilan"
                placeholder="Tingkat Pertama, Banding, Kasasi"
                disabled={isLoading}
                {...register("tingkat_pengadilan")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama_pengadilan">Nama Pengadilan</Label>
              <Input
                id="nama_pengadilan"
                placeholder="PN Jakarta Pusat"
                disabled={isLoading}
                {...register("nama_pengadilan")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomor_ruang_sidang">Nomor Ruang Sidang</Label>
              <Input
                id="nomor_ruang_sidang"
                placeholder="Ruang 101"
                disabled={isLoading}
                {...register("nomor_ruang_sidang")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama_hakim_ketua">Nama Hakim Ketua</Label>
              <Input
                id="nama_hakim_ketua"
                placeholder="Nama hakim ketua"
                disabled={isLoading}
                {...register("nama_hakim_ketua")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pihak-pihak */}
      <Card>
        <CardHeader>
          <CardTitle>Pihak-pihak</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="posisi_klien">Posisi Klien</Label>
              <Input
                id="posisi_klien"
                placeholder="Penggugat, Tergugat, Pemohon"
                disabled={isLoading}
                {...register("posisi_klien")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pihak_lawan">Pihak Lawan</Label>
              <Input
                id="pihak_lawan"
                placeholder="Nama pihak lawan"
                disabled={isLoading}
                {...register("pihak_lawan")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kuasa_hukum_lawan">Kuasa Hukum Lawan</Label>
            <Input
              id="kuasa_hukum_lawan"
              placeholder="Nama kuasa hukum pihak lawan"
              disabled={isLoading}
              {...register("kuasa_hukum_lawan")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Nilai & Fee */}
      <Card>
        <CardHeader>
          <CardTitle>Nilai & Fee</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nilai_perkara">Nilai Perkara (Rp)</Label>
              <Input
                id="nilai_perkara"
                type="number"
                placeholder="0"
                disabled={isLoading}
                {...register("nilai_perkara", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nilai_fee">Nilai Fee (Rp)</Label>
              <Input
                id="nilai_fee"
                type="number"
                placeholder="0"
                disabled={isLoading}
                {...register("nilai_fee", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status_pembayaran">Status Pembayaran</Label>
              <Select
                value={statusPembayaran || ""}
                onValueChange={(value) => setValue("status_pembayaran", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                  <SelectItem value="dp">DP</SelectItem>
                  <SelectItem value="lunas">Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tanggal-tanggal */}
      <Card>
        <CardHeader>
          <CardTitle>Tanggal Penting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tanggal Register</Label>
              <DatePicker
                disabled={isLoading}
                date={
                  watch("tanggal_register") && watch("tanggal_register") !== ""
                    ? parseISO(watch("tanggal_register")!)
                    : undefined
                }
                onDateChange={(date) => {
                  if (date) {
                    setValue("tanggal_register", date.toISOString().split("T")[0]);
                  } else {
                    setValue("tanggal_register", "");
                  }
                }}
                placeholder="Pilih tanggal register"
              />
              {errors.tanggal_register && (
                <p className="text-sm text-red-500">{errors.tanggal_register.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tanggal Sidang Pertama</Label>
              <DatePicker
                disabled={isLoading}
                date={
                  watch("tanggal_sidang_pertama") && watch("tanggal_sidang_pertama") !== ""
                    ? parseISO(watch("tanggal_sidang_pertama")!)
                    : undefined
                }
                onDateChange={(date) => {
                  if (date) {
                    setValue("tanggal_sidang_pertama", date.toISOString().split("T")[0]);
                  } else {
                    setValue("tanggal_sidang_pertama", "");
                  }
                }}
                placeholder="Pilih tanggal sidang pertama"
              />
              {errors.tanggal_sidang_pertama && (
                <p className="text-sm text-red-500">{errors.tanggal_sidang_pertama.message}</p>
              )}
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

      {/* ✅ Actions with Loading State */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Tambah Perkara" : "Simpan Perubahan"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
      </div>

      {/* Klien Selection Modal */}
      <SelectKlienModal
        open={openKlienModal}
        onOpenChange={setOpenKlienModal}
        onSelect={(klien) => {
          setValue("klien_id", klien.id);
          setSelectedKlienName(klien.nama);
        }}
      />
    </form>
  );
}
