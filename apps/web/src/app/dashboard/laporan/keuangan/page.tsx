// ============================================================================
// FILE: app/(dashboard)/laporan/keuangan/page.tsx - 🆕 NEW
// ============================================================================
"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LaporanKeuanganPage() {
  return (
    <div>
      <PageHeader
        title="Laporan Keuangan"
        description="Ringkasan fee dan penagihan"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Under Development</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fitur laporan keuangan sedang dalam pengembangan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}