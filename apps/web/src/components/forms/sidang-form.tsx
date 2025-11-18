// ============================================================================
// FILE: components/forms/sidang-form.tsx
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search } from "lucide-react";
import { parseISO } from "date-fns";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { sidangSchema, SidangFormData } from "@/lib/schemas/sidang.schema";
import { JadwalSidangEntity, JenisSidang } from "@/types";
import { perkaraApi } from "@/lib/api/perkara.api";

interface SidangFormProps {
  initialData?: JadwalSidangEntity;
  onSubmit: (data: SidangFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
  mode?: "create" | "edit";
}

export function SidangForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
  mode = "create",
}: SidangFormProps) {
  const [perkaraList, setPerkaraList] = useState<Array<{
    id: string;
    nomor_perkara: string;
    judul: string;
  }>>([]);
  const [openPerkara, setOpenPerkara] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SidangFormData>({
    resolver: zodResolver(sidangSchema),
    defaultValues: initialData ? {
      perkara_id: initialData.perkara_id,
      jenis_sidang: initialData.jenis_sidang,
      tanggal_sidang: initialData.tanggal_sidang,
      waktu_mulai: initialData.waktu_mulai ?? undefined,
      waktu_selesai: initialData.waktu_selesai ?? undefined,
      nama_pengadilan: initialData.nama_pengadilan,
      nomor_ruang_sidang: initialData.nomor_ruang_sidang ?? undefined,
      nama_hakim: initialData.nama_hakim ?? undefined,
      lokasi_lengkap: initialData.lokasi_lengkap ?? undefined,
      agenda_sidang: initialData.agenda_sidang ?? undefined,
      hasil_sidang: initialData.hasil_sidang ?? undefined,
      putusan: initialData.putusan ?? undefined,
      catatan: initialData.catatan ?? undefined,
    } : {
      perkara_id: "",
      jenis_sidang: JenisSidang.SIDANG_PERTAMA,
      tanggal_sidang: "",
      waktu_mulai: undefined,
      waktu_selesai: undefined,
      nama_pengadilan: "",
      nomor_ruang_sidang: undefined,
      nama_hakim: undefined,
      lokasi_lengkap: undefined,
      agenda_sidang: undefined,
      hasil_sidang: undefined,
      putusan: undefined,
      catatan: undefined,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const perkaraId = watch("perkara_id");

  useEffect(() => {
    const fetchPerkara = async () => {
      try {
        const response = await perkaraApi.getAll({ limit: 100 });
        setPerkaraList(response.data);
      } catch (error) {
        console.error("Failed to fetch perkara", error);
      }
    };
    fetchPerkara();
  }, []);

  const selectedPerkara = perkaraList.find((p) => p.id === perkaraId);

  // ✅ FIX: Wrapper to convert tanggal_sidang to ISO DateTime
  const handleFormSubmit = (data: SidangFormData) => {
    const submitData: SidangFormData = {
      ...data,
      tanggal_sidang: data.tanggal_sidang
        ? new Date(data.tanggal_sidang).toISOString()
        : "",
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Informasi Dasar */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Sidang</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>
              Perkara <span className="text-red-500">*</span>
            </Label>
            <Popover open={openPerkara} onOpenChange={setOpenPerkara}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between" disabled={isLoading}>
                  {selectedPerkara ? (
                    <div className="flex flex-col items-start">
                      <span>{selectedPerkara.nomor_perkara}</span>
                      <span className="text-sm text-muted-foreground">{selectedPerkara.judul}</span>
                    </div>
                  ) : (
                    "Pilih perkara..."
                  )}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Cari perkara..." />
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
                          <span className="text-sm text-muted-foreground">{perkara.judul}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.perkara_id && <p className="text-sm text-red-500">{errors.perkara_id.message}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Jenis Sidang <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch("jenis_sidang")}
                onValueChange={(value) => setValue("jenis_sidang", value as JenisSidang)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(JenisSidang).map((jenis) => (
                    <SelectItem key={jenis} value={jenis} className="capitalize">
                      {jenis.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Tanggal Sidang <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                disabled={isLoading}
                date={watch("tanggal_sidang") ? parseISO(watch("tanggal_sidang")) : undefined}
                onDateChange={(date) => {
                  if (date) {
                    setValue("tanggal_sidang", date.toISOString().split("T")[0]);
                  } else {
                    setValue("tanggal_sidang", "");
                  }
                }}
                placeholder="Pilih tanggal sidang"
              />
              {errors.tanggal_sidang && <p className="text-sm text-red-500">{errors.tanggal_sidang.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Waktu Mulai</Label>
              <TimePicker
                disabled={isLoading}
                time={watch("waktu_mulai")}
                onTimeChange={(time) => setValue("waktu_mulai", time)}
                placeholder="Pilih waktu mulai"
                maxTime={watch("waktu_selesai")}
              />
            </div>

            <div className="space-y-2">
              <Label>Waktu Selesai</Label>
              <TimePicker
                disabled={isLoading}
                time={watch("waktu_selesai")}
                onTimeChange={(time) => setValue("waktu_selesai", time)}
                placeholder="Pilih waktu selesai"
                minTime={watch("waktu_mulai")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama_pengadilan">
              Nama Pengadilan <span className="text-red-500">*</span>
            </Label>
            <Input id="nama_pengadilan" placeholder="PN Jakarta Pusat" disabled={isLoading} {...register("nama_pengadilan")} />
            {errors.nama_pengadilan && <p className="text-sm text-red-500">{errors.nama_pengadilan.message}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomor_ruang_sidang">Nomor Ruang Sidang</Label>
              <Input id="nomor_ruang_sidang" placeholder="Ruang 101" disabled={isLoading} {...register("nomor_ruang_sidang")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama_hakim">Nama Hakim</Label>
              <Input id="nama_hakim" placeholder="Nama hakim" disabled={isLoading} {...register("nama_hakim")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lokasi_lengkap">Lokasi Lengkap</Label>
            <Textarea id="lokasi_lengkap" placeholder="Alamat lengkap pengadilan..." rows={2} disabled={isLoading} {...register("lokasi_lengkap")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agenda_sidang">Agenda Sidang</Label>
            <Textarea id="agenda_sidang" placeholder="Agenda sidang..." rows={3} disabled={isLoading} {...register("agenda_sidang")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hasil_sidang">Hasil Sidang</Label>
            <Textarea id="hasil_sidang" placeholder="Hasil sidang (diisi setelah sidang)..." rows={3} disabled={isLoading} {...register("hasil_sidang")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="putusan">Putusan</Label>
            <Textarea id="putusan" placeholder="Putusan (jika ada)..." rows={3} disabled={isLoading} {...register("putusan")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan</Label>
            <Textarea id="catatan" placeholder="Catatan tambahan..." rows={3} disabled={isLoading} {...register("catatan")} />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Tambah Jadwal" : "Simpan Perubahan"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
      </div>
    </form>
  );
}