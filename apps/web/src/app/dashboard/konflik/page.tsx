// ============================================================================
// FILE: app/(dashboard)/konflik/page.tsx
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { KonflikTable } from "@/components/tables/konflik-table";
import { konflikApi } from "@/lib/api/konflik.api";
import { KonflikWithRelations } from "@/types";
import { toast } from "sonner";
import { usePermission } from "@/lib/hooks/use-permission";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Skeleton } from "@/components/ui/skeleton";

export default function KonflikPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const permissions = usePermission();
  const [konflik, setKonflik] = useState<KonflikWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchKonflik = async () => {
    try {
      setIsLoading(true);
      const response = await konflikApi.getAll({
        page,
        limit,
        sortBy: "tanggal_periksa",
        sortOrder: "desc"
      });
      setKonflik(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error("Failed to fetch konflik", error);
      toast.error("Gagal memuat data konflik");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKonflik();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (id: string) => {
    try {
      await konflikApi.delete(id);
      toast.success("Pemeriksaan konflik berhasil dihapus");
      fetchKonflik();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus konflik";
      toast.error(errorMessage);
    }
  };

  return (
    <div>
      <PageHeader
        title="Pemeriksaan Konflik"
        description="Kelola pemeriksaan konflik kepentingan"
        action={
          /* 🔒 Show skeleton while user loading, then check permission */
          !user ? (
            <Skeleton className="h-10 w-40" />
          ) : permissions.konflik.create ? (
            <Button onClick={() => router.push("/dashboard/konflik/baru")}>
              <Plus className="mr-2 h-4 w-4" />
              Periksa Konflik
            </Button>
          ) : undefined
        }
      />

      <KonflikTable
        data={konflik}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onDelete={handleDelete}
      />
    </div>
  );
}