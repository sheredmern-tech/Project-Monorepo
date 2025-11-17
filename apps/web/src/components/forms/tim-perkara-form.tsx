// ============================================================================
// FILE: components/forms/tim-perkara-form.tsx
// ============================================================================
"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectAdvokatModal } from "@/components/modals/select-advokat-modal";
import { CreateTimPerkaraDto } from "@/types";

// ✅ Validation Schema
const timPerkaraSchema = z.object({
  perkara_id: z.string().min(1, "Perkara wajib dipilih"),
  user_id: z.string().min(1, "Anggota tim wajib dipilih"),
  peran: z.string().optional().or(z.literal("")),
});

type TimPerkaraFormData = z.infer<typeof timPerkaraSchema>;

interface TimPerkaraFormProps {
  perkaraId: string;
  onSubmit: (data: CreateTimPerkaraDto) => void;
  isLoading: boolean;
  onCancel: () => void;
  existingMemberIds?: string[]; // Untuk filter user yang sudah jadi anggota
}

export function TimPerkaraForm({
  perkaraId,
  onSubmit,
  isLoading,
  onCancel,
  existingMemberIds = [],
}: TimPerkaraFormProps) {
  const [openUserModal, setOpenUserModal] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  const form = useForm<TimPerkaraFormData>({
    resolver: zodResolver(timPerkaraSchema),
    defaultValues: {
      perkara_id: perkaraId,
      user_id: "",
      peran: "",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = form;

  // Use useWatch instead of watch for React Compiler compatibility
  const userId = useWatch({ control, name: "user_id" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Anggota Tim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Selection with Searchable Modal */}
          <div className="space-y-2">
            <Label>
              Pilih Anggota Tim <span className="text-red-500">*</span>
            </Label>
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
                  <span>Pilih anggota tim...</span>
                </>
              )}
            </Button>
            {errors.user_id && (
              <p className="text-sm text-red-500">{errors.user_id.message}</p>
            )}
          </div>

          {/* Role/Peran */}
          <div className="space-y-2">
            <Label htmlFor="peran">Peran (Opsional)</Label>
            <Input
              id="peran"
              placeholder="e.g., Advokat Utama, Co-Counsel, Paralegal"
              disabled={isLoading}
              {...register("peran")}
            />
            <p className="text-xs text-muted-foreground">
              Peran anggota dalam tim perkara ini
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || !userId}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Tambahkan ke Tim
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Batal
        </Button>
      </div>

      {/* User Selection Modal */}
      <SelectAdvokatModal
        open={openUserModal}
        onOpenChange={setOpenUserModal}
        onSelect={(user) => {
          setValue("user_id", user.id);
          setSelectedUserName(user.nama_lengkap || user.email);
        }}
        roleFilter="all"
        title="Pilih Anggota Tim"
        description="Pilih anggota tim untuk perkara ini"
      />
    </form>
  );
}