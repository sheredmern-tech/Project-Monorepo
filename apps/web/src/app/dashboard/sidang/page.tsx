// ============================================================================
// FILE: app/(dashboard)/sidang/page.tsx - UPDATED WITH SIDANGTABLE
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { SidangTable } from "@/components/tables/sidang-table";
import { useSidang } from "@/lib/hooks/use-sidang";

export default function SidangPage() {
  const router = useRouter();
  const { sidang, isLoading, error, fetchSidang } = useSidang();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    const loadSidang = async () => {
      const response = await fetchSidang({ 
        page,
        limit,
        sortBy: "tanggal_sidang", 
        sortOrder: "asc" 
      });
      if (response) {
        setTotal(response.meta.total);
      }
    };
    loadSidang();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div>
      <PageHeader
        title="Jadwal Sidang"
        description="Kelola jadwal sidang dan persidangan"
        action={
          <Button onClick={() => router.push("/dashboard/sidang/baru")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Jadwal
          </Button>
        }
      />

      <SidangTable
        data={sidang}
        isLoading={isLoading}
        error={error}
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}