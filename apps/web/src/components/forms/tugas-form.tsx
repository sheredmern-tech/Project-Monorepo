// ============================================================================
// FILE: components/forms/tugas-form.tsx - REFACTORED ✅
// ============================================================================
// ✅ Proper error handling with handleApiError
// ✅ Loading states for all async operations
// ✅ Validation error display from backend
// ✅ Better UX with disabled states
// ✅ Toast notifications for success/error
// ============================================================================
"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseISO } from "date-fns";
import { Loader2, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectAdvokatModal } from "@/components/modals/select-advokat-modal";
import { tugasSchema, TugasFormData } from "@/lib/schemas/tugas.schema";
import { TugasEntity, StatusTugas, PrioritasTugas } from "@/types";
import { perkaraApi } from "@/lib/api/perkara.api";
import { useAuthStore } from "@/lib/stores/auth.store";
import { handleApiError, formatValidationErrors } from "@/lib/utils/error-handler";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command";

interface PerkaraItem {
  id: string;
  nomor_perkara: string;
  judul: string;
}

interface TugasFormProps {
  initialData?: TugasEntity;
  onSubmit: (data: TugasFormData) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
  mode?: "create" | "edit";
}

export function TugasForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
  mode = "create",
}: TugasFormProps) {
  useAuthStore();
  const [perkaraList, setPerkaraList] = useState<PerkaraItem[]>([]);
  const [openPerkara, setOpenPerkara] = useState(false);
  const [searchPerkara, setSearchPerkara] = useState("");
  const [loadingPerkara, setLoadingPerkara] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [generalError, setGeneralError] = useState<string | null>(null);

  const getDefaultValues = (): Partial<TugasFormData> => {
    if (initialData) {
      return {
        perkara_id: initialData.perkara_id,
        judul: initialData.judul,
        deskripsi: initialData.deskripsi ?? "",
        ditugaskan_ke: initialData.ditugaskan_ke ?? "",
        status: initialData.status,
        prioritas: initialData.prioritas,
        tenggat_waktu: initialData.tenggat_waktu ?? "",
        dapat_ditagih: initialData.dapat_ditagih ?? false,
        jam_kerja: initialData.jam_kerja ?? 0,
        tarif_per_jam: initialData.tarif_per_jam ?? 0,
      };
    }
    return {
      status: StatusTugas.BELUM_MULAI,
      prioritas: PrioritasTugas.SEDANG,
      dapat_ditagih: false,
    };
  };

  const form = useForm<TugasFormData>({
    resolver: zodResolver(tugasSchema),
    defaultValues: getDefaultValues(),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    setError,
  } = form;

  const perkaraId = useWatch({ control, name: "perkara_id" });
  const ditugaskanKe = useWatch({ control, name: "ditugaskan_ke" });
  const dapatDitagih = useWatch({ control, name: "dapat_ditagih" });
  const statusValue = useWatch({ control, name: "status" });
  const prioritasValue = useWatch({ control, name: "prioritas" });

  // ✅ Fetch perkara with error handling
  useEffect(() => {
    const fetchPerkara = async () => {
      try {
        setLoadingPerkara(true);
        const response = await perkaraApi.getAll({ limit: 100 });
        setPerkaraList(response.data);
      } catch (error) {
        handleApiError(error, "Gagal memuat data perkara");
      } finally {
        setLoadingPerkara(false);
      }
    };
    fetchPerkara();
  }, []);

  const selectedPerkara = useMemo(
    () => perkaraList.find((p) => p.id === perkaraId),
    [perkaraList, perkaraId]
  );

  // ✅ Enhanced submit with validation error handling + ISO DateTime conversion
  const handleFormSubmit = async (data: TugasFormData) => {
    try {
      setGeneralError(null);

      // ✅ FIX: Konversi tenggat_waktu ke ISO DateTime untuk Prisma
      const submitData: TugasFormData = {
        ...data,
        tenggat_waktu: data.tenggat_waktu
          ? new Date(data.tenggat_waktu).toISOString()
          : undefined,
      };

      await onSubmit(submitData);
      toast.success(
        mode === "create"
          ? "Tugas berhasil ditambahkan"
          : "Tugas berhasil diperbarui"
      );
    } catch (error) {
      const validationErrors = formatValidationErrors(error);
      if (validationErrors) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setError(field as keyof TugasFormData, {
            type: "manual",
            message,
          });
        });
        setGeneralError("Terdapat kesalahan pada form. Silakan periksa kembali.");
      } else {
        const message = error instanceof Error ? error.message : "Terjadi kesalahan";
        setGeneralError(message);
        handleApiError(error, "Gagal menyimpan tugas");
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
          {/* ✅ Perkara Selection with Loading */}
          <div className="space-y-2">
            <Label>
              Perkara <span className="text-red-500">*</span>
            </Label>
            <Popover open={openPerkara} onOpenChange={setOpenPerkara}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPerkara}
                  className="w-full justify-between"
                  disabled={isLoading || loadingPerkara}
                >
                  {loadingPerkara ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading perkara...
                    </span>
                  ) : selectedPerkara ? (
                    <div className="flex flex-col items-start">
                      <span>{selectedPerkara.nomor_perkara}</span>
                      <span className="text-sm text-muted-foreground">
                        {selectedPerkara.judul}
                      </span>
                    </div>
                  ) : (
                    "Pilih perkara..."
                  )}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Cari perkara..."
                    value={searchPerkara}
                    onValueChange={setSearchPerkara}
                  />
                  <CommandEmpty>Perkara tidak ditemukan</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {perkaraList.map((perkara) => (
                      <CommandItem
                        key={perkara.id}
                        value={perkara.nomor_perkara}
                        onSelect={() => {
                          setValue("perkara_id", perkara.id);
                          setOpenPerkara(false);
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{perkara.nomor_perkara}</span>
                          <span className="text-sm text-muted-foreground">
                            {perkara.judul}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.perkara_id && (
              <p className="text-sm text-red-500">{errors.perkara_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="judul">
              Judul Tugas <span className="text-red-500">*</span>
            </Label>
            <Input
              id="judul"
              placeholder="Judul singkat tugas"
              disabled={isLoading}
              {...register("judul")}
            />
            {errors.judul && <p className="text-sm text-red-500">{errors.judul.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              placeholder="Deskripsi detail tugas..."
              rows={4}
              disabled={isLoading}
              {...register("deskripsi")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={statusValue}
                onValueChange={(value) => setValue("status", value as StatusTugas)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(StatusTugas).map((stat) => (
                    <SelectItem key={stat} value={stat} className="capitalize">
                      {stat.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioritas</Label>
              <Select
                value={prioritasValue}
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

            <div className="space-y-2">
              <Label>Tenggat Waktu</Label>
              <DatePicker
                disabled={isLoading}
                date={watch("tenggat_waktu") ? parseISO(watch("tenggat_waktu")) : undefined}
                onDateChange={(date) => {
                  if (date) {
                    setValue("tenggat_waktu", date.toISOString().split("T")[0]);
                  } else {
                    setValue("tenggat_waktu", "");
                  }
                }}
                placeholder="Pilih tenggat waktu"
              />
              {errors.tenggat_waktu && (
                <p className="text-sm text-red-500">{errors.tenggat_waktu.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Penugasan */}
      <Card>
        <CardHeader>
          <CardTitle>Penugasan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ✅ User Selection with Searchable Modal */}
          <div className="space-y-2">
            <Label>Ditugaskan Kepada</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-3"
              disabled={isLoading}
              onClick={() => setOpenUserModal(true)}
            >
              {selectedUserName ? (
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-medium">{selectedUserName}</span>
                  <span className="text-xs text-muted-foreground">
                    Klik untuk ubah
                  </span>
                </div>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Pilih petugas...</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informasi Penagihan */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Penagihan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div className="grid gap-4 md:grid-cols-2 pt-2">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="tarif_per_jam">Tarif per Jam (Rp)</Label>
                <Input
                  id="tarif_per_jam"
                  type="number"
                  placeholder="0"
                  disabled={isLoading}
                  {...register("tarif_per_jam", { valueAsNumber: true })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Actions with Loading State */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Tambah Tugas" : "Simpan Perubahan"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
      </div>

      {/* User Selection Modal */}
      <SelectAdvokatModal
        open={openUserModal}
        onOpenChange={setOpenUserModal}
        onSelect={(user) => {
          setValue("ditugaskan_ke", user.id);
          setSelectedUserName(user.nama_lengkap || user.email);
        }}
        roleFilter="all"
        title="Pilih Petugas"
        description="Pilih petugas yang akan ditugaskan"
      />
    </form>
  );
}