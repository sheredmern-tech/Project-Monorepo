// ============================================================================
// FILE: components/forms/tim-perkara-form.tsx
// ============================================================================
"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { timApi } from "@/lib/api/tim.api";
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
  const [userList, setUserList] = useState<Array<{
    id: string;
    nama_lengkap: string | null;
    email: string;
    jabatan: string | null;
  }>>([]);
  const [openUser, setOpenUser] = useState(false);
  const [searchUser, setSearchUser] = useState("");

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

  // Fetch user list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await timApi.getAllUsers({ limit: 100 });
        // Filter out existing members
        const availableUsers = response.data.filter(
          (user) => !existingMemberIds.includes(user.id)
        );
        setUserList(availableUsers);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchUsers();
  }, [existingMemberIds]);

  const selectedUser = userList.find((u) => u.id === userId);

  // Filter users based on search using useMemo for performance
  const filteredUsers = useMemo(() => {
    return userList.filter((user) =>
      (user.nama_lengkap || user.email)
        .toLowerCase()
        .includes(searchUser.toLowerCase())
    );
  }, [userList, searchUser]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Anggota Tim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Selection */}
          <div className="space-y-2">
            <Label>
              Pilih Anggota Tim <span className="text-red-500">*</span>
            </Label>
            <Popover open={openUser} onOpenChange={setOpenUser}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openUser}
                  className="w-full justify-between"
                  disabled={isLoading}
                >
                  {selectedUser ? (
                    <div className="flex flex-col items-start">
                      <span className="font-medium">
                        {selectedUser.nama_lengkap || selectedUser.email}
                      </span>
                      {selectedUser.jabatan && (
                        <span className="text-xs text-muted-foreground">
                          {selectedUser.jabatan}
                        </span>
                      )}
                    </div>
                  ) : (
                    "Pilih anggota tim..."
                  )}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Cari anggota tim..."
                    value={searchUser}
                    onValueChange={setSearchUser}
                  />
                  <CommandEmpty>
                    {userList.length === 0
                      ? "Semua anggota sudah ditambahkan"
                      : "Anggota tidak ditemukan"}
                  </CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {filteredUsers.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={user.nama_lengkap || user.email}
                        onSelect={() => {
                          setValue("user_id", user.id);
                          setOpenUser(false);
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {user.nama_lengkap || user.email}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {user.email}
                          </span>
                          {user.jabatan && (
                            <span className="text-xs text-muted-foreground">
                              {user.jabatan}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
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
    </form>
  );
}