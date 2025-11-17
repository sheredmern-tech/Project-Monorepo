// ============================================================================
// FILE: components/forms/konflik-form.tsx - Enhanced with Searchable Modals
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search, Database, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { konflikSchema, KonflikFormData } from "@/lib/schemas/konflik.schema";
import { perkaraApi } from "@/lib/api/perkara.api";
import { PerkaraBasic, KlienBasic } from "@/types";
import {
  SelectPerkaraModal,
  SelectKlienModal,
  SelectPihakLawanModal,
} from "@/components/modals";

interface KonflikFormProps {
  initialData?: KonflikFormData;
  onSubmit: (data: KonflikFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function KonflikForm({ initialData, onSubmit, isLoading, onCancel }: KonflikFormProps) {
  const [perkaraList, setPerkaraList] = useState<PerkaraBasic[]>([]);
  const [loadingPerkara, setLoadingPerkara] = useState(false);

  // Modal states
  const [openPerkaraModal, setOpenPerkaraModal] = useState(false);
  const [openKlienModal, setOpenKlienModal] = useState(false);
  const [openPihakLawanModal, setOpenPihakLawanModal] = useState(false);

  // Conflict detection state
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

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
  const namaKlien = useWatch({ control, name: "nama_klien" });
  const pihakLawan = useWatch({ control, name: "pihak_lawan" });
  const adaKonflik = useWatch({ control, name: "ada_konflik" });

  useEffect(() => {
    const fetchPerkara = async () => {
      try {
        setLoadingPerkara(true);
        const response = await perkaraApi.getAll({ limit: 100 });
        setPerkaraList(response.data);
      } catch {
        // Error silently handled
      } finally {
        setLoadingPerkara(false);
      }
    };
    fetchPerkara();
  }, []);

  const selectedPerkara = perkaraList.find((p) => p.id === perkaraId);

  // Handler: Perkara selected
  const handlePerkaraSelect = (perkara: PerkaraBasic) => {
    setValue("perkara_id", perkara.id);
    setOpenPerkaraModal(false);
  };

  // Handler: Klien selected from database
  const handleKlienSelect = (klien: KlienBasic) => {
    setValue("nama_klien", klien.nama);
    setOpenKlienModal(false);

    // Info: Klien found in database - good to know for context
    setConflictWarning(
      `Info: "${klien.nama}" ditemukan di database sebagai klien ${klien.jenis_klien}. ` +
      `Pastikan tidak ada konflik dengan perkara lain.`
    );
  };

  // Handler: Pihak Lawan matches existing client - MAJOR CONFLICT!
  const handlePihakLawanConflict = (klien: KlienBasic) => {
    setValue("pihak_lawan", klien.nama);
    setValue("ada_konflik", true);
    setValue(
      "detail_konflik",
      `KONFLIK TERDETEKSI: Pihak lawan "${klien.nama}" adalah klien ${klien.jenis_klien} yang terdaftar di database kami. ` +
      `Firma tidak dapat mewakili klien baru yang berlawanan dengan klien existing tanpa waiver.`
    );

    setConflictWarning(
      `⚠️ KONFLIK KEPENTINGAN TERDETEKSI! Pihak lawan adalah klien kami.`
    );
    setOpenPihakLawanModal(false);
  };

  // Handler: Pihak Lawan is NOT an existing client
  const handlePihakLawanNoConflict = () => {
    setConflictWarning(null);
    setOpenPihakLawanModal(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pemeriksaan Konflik Kepentingan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Conflict Warning Alert */}
            {conflictWarning && (
              <Alert variant={adaKonflik ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  {adaKonflik ? "Konflik Kepentingan Terdeteksi" : "Informasi"}
                </AlertTitle>
                <AlertDescription className="text-sm">
                  {conflictWarning}
                </AlertDescription>
              </Alert>
            )}

            {/* Perkara Field - Enhanced with Modal */}
            <div className="space-y-2">
              <Label>Perkara (Opsional)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 justify-between"
                  disabled={loadingPerkara}
                  onClick={() => setOpenPerkaraModal(true)}
                >
                  {loadingPerkara ? (
                    <span className="text-muted-foreground">Memuat perkara...</span>
                  ) : selectedPerkara ? (
                    <span className="font-mono text-sm">{selectedPerkara.nomor_perkara}</span>
                  ) : (
                    <span className="text-muted-foreground">Pilih perkara (opsional)...</span>
                  )}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
                {selectedPerkara && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setValue("perkara_id", undefined)}
                  >
                    Hapus
                  </Button>
                )}
              </div>
              {selectedPerkara && (
                <p className="text-sm text-muted-foreground">
                  {selectedPerkara.judul}
                </p>
              )}
            </div>

            {/* Nama Klien Field - Enhanced with Database Check */}
            <div className="space-y-2">
              <Label htmlFor="nama_klien">
                Nama Klien <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="nama_klien"
                  placeholder="Nama calon klien"
                  {...register("nama_klien")}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setOpenKlienModal(true)}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Cek Database
                </Button>
              </div>
              {errors.nama_klien && (
                <p className="text-sm text-red-500">{errors.nama_klien.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Gunakan tombol "Cek Database" untuk mencari klien existing
              </p>
            </div>

            {/* Pihak Lawan Field - Enhanced with Conflict Detection */}
            <div className="space-y-2">
              <Label htmlFor="pihak_lawan">
                Pihak Lawan <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="pihak_lawan"
                  placeholder="Nama pihak lawan"
                  {...register("pihak_lawan")}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setOpenPihakLawanModal(true)}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Cek Database
                </Button>
              </div>
              {errors.pihak_lawan && (
                <p className="text-sm text-red-500">{errors.pihak_lawan.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                ⚠️ PENTING: Cek apakah pihak lawan adalah klien existing (konflik!)
              </p>
            </div>

            {/* Konflik Toggle */}
            <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/30">
              <Switch
                id="ada_konflik"
                checked={adaKonflik}
                onCheckedChange={(checked) => setValue("ada_konflik", checked)}
              />
              <Label htmlFor="ada_konflik" className="cursor-pointer">
                Ada konflik kepentingan
              </Label>
            </div>

            {/* Detail Konflik - Conditional */}
            {adaKonflik && (
              <div className="space-y-2">
                <Label htmlFor="detail_konflik">
                  Detail Konflik <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="detail_konflik"
                  placeholder="Jelaskan detail konflik yang ditemukan..."
                  rows={4}
                  {...register("detail_konflik")}
                />
                <p className="text-xs text-muted-foreground">
                  Jelaskan secara detail konflik yang terdeteksi dan langkah mitigasi yang akan diambil
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Pemeriksaan" : "Simpan Hasil Pemeriksaan"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        </div>
      </form>

      {/* Modals */}
      <SelectPerkaraModal
        open={openPerkaraModal}
        onOpenChange={setOpenPerkaraModal}
        onSelect={handlePerkaraSelect}
        perkaraList={perkaraList}
        loading={loadingPerkara}
      />

      <SelectKlienModal
        open={openKlienModal}
        onOpenChange={setOpenKlienModal}
        onSelect={handleKlienSelect}
        title="Cek Database Klien"
        description="Cari klien di database untuk pemeriksaan konflik"
      />

      <SelectPihakLawanModal
        open={openPihakLawanModal}
        onOpenChange={setOpenPihakLawanModal}
        onConflictDetected={handlePihakLawanConflict}
        onNoConflict={handlePihakLawanNoConflict}
      />
    </>
  );
}
