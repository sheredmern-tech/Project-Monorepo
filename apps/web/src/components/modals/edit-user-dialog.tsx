// ============================================================================
// FILE: components/modals/edit-user-dialog.tsx
// ============================================================================
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserEntity, UserRole } from "@/types";

// Validation Schema
const editUserSchema = z.object({
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Email tidak valid"),
  role: z.nativeEnum(UserRole),
  jabatan: z.string().optional(),
  nomor_kta: z.string().optional(),
  nomor_berita_acara: z.string().optional(),
  spesialisasi: z.string().optional(),
  telepon: z.string().optional(),
  alamat: z.string().optional(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserEntity;
  onUpdate: (id: string, data: Partial<UserEntity>) => Promise<void>;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  onUpdate,
}: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      nama_lengkap: user.nama_lengkap || "",
      email: user.email,
      role: user.role,
      jabatan: user.jabatan || "",
      nomor_kta: user.nomor_kta || "",
      nomor_berita_acara: user.nomor_berita_acara || "",
      spesialisasi: user.spesialisasi || "",
      telepon: user.telepon || "",
      alamat: user.alamat || "",
    },
  });

  // Reset form when user changes
  useEffect(() => {
    form.reset({
      nama_lengkap: user.nama_lengkap || "",
      email: user.email,
      role: user.role,
      jabatan: user.jabatan || "",
      nomor_kta: user.nomor_kta || "",
      nomor_berita_acara: user.nomor_berita_acara || "",
      spesialisasi: user.spesialisasi || "",
      telepon: user.telepon || "",
      alamat: user.alamat || "",
    });
  }, [user, form]);

  const handleSubmit = async (data: EditUserFormData) => {
    try {
      setIsLoading(true);
      await onUpdate(user.id, data);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profil User</DialogTitle>
          <DialogDescription>
            Update informasi profil {user.nama_lengkap || user.email}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informasi Dasar</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nama_lengkap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nama Lengkap <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Role <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="advokat">Advokat</SelectItem>
                          <SelectItem value="paralegal">Paralegal</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="klien">Klien</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jabatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jabatan</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Senior Partner"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Professional Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informasi Profesional</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nomor_kta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor KTA</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nomor_berita_acara"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Berita Acara</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="spesialisasi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spesialisasi</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="e.g., Hukum Perdata, Pidana"
                        disabled={isLoading}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informasi Kontak</h3>
              
              <FormField
                control={form.control}
                name="telepon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telepon</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="+62 812-3456-7890"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alamat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Alamat lengkap"
                        disabled={isLoading}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}