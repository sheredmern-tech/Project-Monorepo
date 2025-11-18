// ============================================================================
// FILE: components/forms/dokumen-upload-form.tsx - FIXED ✅
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X, FileText, AlertCircle, Search } from "lucide-react";
import { parseDateLocal } from "@/lib/utils/date";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { dokumenSchema, DokumenFormData } from "@/lib/schemas/dokumen.schema";
import { KategoriDokumen } from "@/types";
import { perkaraApi } from "@/lib/api/perkara.api";
import { useAuthStore } from "@/lib/stores/auth.store";
import { formatFileSize } from "@/lib/utils/format";
import { handleApiError, formatValidationErrors } from "@/lib/utils/error-handler";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

interface DokumenUploadFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
}

interface PerkaraOption {
  id: string;
  nomor_perkara: string;
  judul: string;
}

export function DokumenUploadForm({ onSubmit, isLoading, onCancel }: DokumenUploadFormProps) {
  useAuthStore();
  const [perkaraList, setPerkaraList] = useState<PerkaraOption[]>([]);
  const [openPerkara, setOpenPerkara] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingPerkara, setLoadingPerkara] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<DokumenFormData>({
    resolver: zodResolver(dokumenSchema),
    defaultValues: {
      kategori: KategoriDokumen.LAINNYA,
      nomor_bukti: "",
      tanggal_dokumen: "",
      catatan: "",
    },
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

  const perkaraId = useWatch({ control, name: "perkara_id" });
  const kategori = useWatch({ control, name: "kategori" });
  const namaDokumen = useWatch({ control, name: "nama_dokumen" });

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

  const selectedPerkara = perkaraList.find((p) => p.id === perkaraId);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setValue("file", file);

        if (!namaDokumen) {
          setValue("nama_dokumen", file.name);
        }
      }
    },
    onDropRejected: (rejections) => {
      const rejection = rejections[0];
      if (rejection.errors[0].code === 'file-too-large') {
        toast.error("File terlalu besar. Maksimal 10MB");
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        toast.error("Tipe file tidak didukung. Gunakan PDF, Word, atau gambar");
      }
    },
  });

  // ✅ FIXED: Konversi tanggal_dokumen ke ISO DateTime
  const handleFormSubmit = async (data: DokumenFormData) => {
    try {
      setGeneralError(null);
      setUploadProgress(0);

      const formData = new FormData();

      formData.append("perkara_id", data.perkara_id);
      formData.append("nama_dokumen", data.nama_dokumen);
      formData.append("kategori", data.kategori);

      if (data.nomor_bukti) formData.append("nomor_bukti", data.nomor_bukti);
      
      // ✅ FIX: Konversi date string ke ISO DateTime untuk Prisma
      if (data.tanggal_dokumen) {
        const isoDate = new Date(data.tanggal_dokumen).toISOString();
        formData.append("tanggal_dokumen", isoDate);
      }
      
      if (data.catatan) formData.append("catatan", data.catatan);
      if (selectedFile) formData.append("file", selectedFile);

      // ✅ TIDAK mengirim diunggah_oleh - backend yang handle dari JWT token

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onSubmit(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast.success("Dokumen berhasil diunggah");
    } catch (error) {
      const validationErrors = formatValidationErrors(error);
      if (validationErrors) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setError(field as keyof DokumenFormData, {
            type: "manual",
            message,
          });
        });
        setGeneralError("Terdapat kesalahan pada form. Silakan periksa kembali.");
      } else {
        const message = error instanceof Error ? error.message : "Terjadi kesalahan";
        setGeneralError(message);
        handleApiError(error, "Gagal mengunggah dokumen");
      }
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {generalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      {/* Upload File */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              selectedFile && "border-primary",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} disabled={isLoading} />
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-12 w-12 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                {!isLoading && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setValue("file", undefined);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Hapus File
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    Drag & drop file di sini, atau klik untuk pilih file
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, Word, atau gambar (maks. 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {fileRejections.length > 0 && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {fileRejections[0].errors[0].message}
              </AlertDescription>
            </Alert>
          )}
          
          {errors.file && (
            <p className="text-sm text-red-500 mt-2">{String(errors.file.message)}</p>
          )}

          {isLoading && uploadProgress > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informasi Dokumen */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dokumen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>
              Perkara <span className="text-red-500">*</span>
            </Label>
            <Popover open={openPerkara} onOpenChange={setOpenPerkara}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                  disabled={isLoading || loadingPerkara}
                >
                  {loadingPerkara ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
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
            {errors.perkara_id && (
              <p className="text-sm text-red-500">{errors.perkara_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama_dokumen">
              Nama Dokumen <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nama_dokumen"
              placeholder="Nama dokumen"
              disabled={isLoading}
              {...register("nama_dokumen")}
            />
            {errors.nama_dokumen && (
              <p className="text-sm text-red-500">{errors.nama_dokumen.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Kategori <span className="text-red-500">*</span>
              </Label>
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
              {errors.kategori && (
                <p className="text-sm text-red-500">{errors.kategori.message}</p>
              )}
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

            <div className="space-y-2">
              <Label htmlFor="tanggal_dokumen">Tanggal Dokumen</Label>
              <DatePicker
                disabled={isLoading}
                date={parseDateLocal(watch("tanggal_dokumen") || "")}
                onDateChange={(date) => {
                  if (date) {
                    setValue("tanggal_dokumen", date.toISOString().split("T")[0]);
                  } else {
                    setValue("tanggal_dokumen", "");
                  }
                }}
                placeholder="Pilih tanggal dokumen"
              />
            </div>
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

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || !selectedFile}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? "Uploading..." : "Upload Dokumen"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
      </div>
    </form>
  );
}