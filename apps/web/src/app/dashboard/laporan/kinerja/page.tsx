// ============================================================================
// FILE: app/(dashboard)/laporan/kinerja/page.tsx - 🆕 NEW
// ============================================================================
"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LaporanKinerjaPage() {
  return (
    <div>
      <PageHeader
        title="Laporan Kinerja"
        description="Analisis kinerja tim dan produktivitas"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Under Development</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fitur laporan kinerja sedang dalam pengembangan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}