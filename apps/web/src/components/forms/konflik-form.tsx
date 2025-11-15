// ============================================================================
// FILE: components/forms/konflik-form.tsx - CLEANED
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { konflikSchema, KonflikFormData } from "@/lib/schemas/konflik.schema";
import { perkaraApi } from "@/lib/api/perkara.api";
import { PerkaraBasic } from "@/types";

interface KonflikFormProps {
  initialData?: KonflikFormData;
  onSubmit: (data: KonflikFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function KonflikForm({ initialData, onSubmit, isLoading, onCancel }: KonflikFormProps) {
  const [perkaraList, setPerkaraList] = useState<PerkaraBasic[]>([]);
  const [openPerkara, setOpenPerkara] = useState(false);

  const form = useForm<KonflikFormData>({
    resolver: zodResolver(konflikSchema),
    defaultValues: initialData || {
      perkara_id: undefined,
      nama_klien: "",
      pihak_lawan: "",
      ada_konflik: false,
      detail_konflik: undefined,
    },
  });

  const { register, handleSubmit, setValue, control, formState: { errors } } = form;
  const perkaraId = useWatch({ control, name: "perkara_id" });
  const adaKonflik = useWatch({ control, name: "ada_konflik" });

  useEffect(() => {
    const fetchPerkara = async () => {
      try {
        const response = await perkaraApi.getAll({ limit: 100 });
        setPerkaraList(response.data);
      } catch {
        // Error silently handled
      }
    };
    fetchPerkara();
  }, []);

  const selectedPerkara = perkaraList.find((p) => p.id === perkaraId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pemeriksaan Konflik Kepentingan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Perkara (Opsional)</Label>
            <Popover open={openPerkara} onOpenChange={setOpenPerkara}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between" disabled={isLoading}>
                  {selectedPerkara ? selectedPerkara.nomor_perkara : "Pilih perkara (opsional)..."}
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
                        {perkara.nomor_perkara}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama_klien">
              Nama Klien <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nama_klien"
              placeholder="Nama calon klien"
              disabled={isLoading}
              {...register("nama_klien")}
            />
            {errors.nama_klien && <p className="text-sm text-red-500">{errors.nama_klien.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pihak_lawan">
              Pihak Lawan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pihak_lawan"
              placeholder="Nama pihak lawan"
              disabled={isLoading}
              {...register("pihak_lawan")}
            />
            {errors.pihak_lawan && <p className="text-sm text-red-500">{errors.pihak_lawan.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ada_konflik"
              checked={adaKonflik}
              onCheckedChange={(checked) => setValue("ada_konflik", checked)}
              disabled={isLoading}
            />
            <Label htmlFor="ada_konflik">Ada konflik kepentingan</Label>
          </div>

          {adaKonflik && (
            <div className="space-y-2">
              <Label htmlFor="detail_konflik">Detail Konflik</Label>
              <Textarea
                id="detail_konflik"
                placeholder="Jelaskan detail konflik yang ditemukan..."
                rows={4}
                disabled={isLoading}
                {...register("detail_konflik")}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Pemeriksaan" : "Simpan Hasil Pemeriksaan"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
      </div>
    </form>
  );
}
