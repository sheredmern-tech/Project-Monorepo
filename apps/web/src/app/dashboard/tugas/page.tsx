// ============================================================================
// FILE: app/(dashboard)/tugas/page.tsx
// ============================================================================
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { TugasTable } from "@/components/tables/tugas-table";
import { SearchInput } from "@/components/shared/search-input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTugas } from "@/lib/hooks/use-tugas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusTugas, PrioritasTugas } from "@/types";

export default function TugasPage() {
  const router = useRouter();
  const {
    tugas,
    isLoading,
    error,
    page,
    limit,
    total,
    status,
    prioritas,
    myTugasOnly,
    setSearch,
    setStatus,
    setPrioritas,
    setMyTugasOnly,
    fetchTugas,
  } = useTugas();

  useEffect(() => {
    fetchTugas();
  }, [fetchTugas]);

  return (
    <div>
      <PageHeader
        title="Tugas"
        description="Kelola semua tugas perkara"
        action={
          <Button onClick={() => router.push("/tugas/baru")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Tugas
          </Button>
        }
      />

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="my-tugas"
            checked={myTugasOnly}
            onCheckedChange={setMyTugasOnly}
          />
          <Label htmlFor="my-tugas">Tampilkan hanya tugas saya</Label>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchInput placeholder="Cari judul tugas..." onSearch={setSearch} />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {Object.values(StatusTugas).map((stat) => (
                <SelectItem key={stat} value={stat} className="capitalize">
                  {stat.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={prioritas} onValueChange={setPrioritas}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Prioritas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Prioritas</SelectItem>
              {Object.values(PrioritasTugas).map((prio) => (
                <SelectItem key={prio} value={prio} className="capitalize">
                  {prio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <TugasTable data={tugas} isLoading={isLoading} error={error} page={page} limit={limit} total={total} />
    </div>
  );
}