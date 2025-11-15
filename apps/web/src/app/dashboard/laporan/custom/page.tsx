// ============================================================================
// FILE: app/(dashboard)/laporan/custom/page.tsx - 🆕 NEW
// ============================================================================
"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LaporanCustomPage() {
  return (
    <div>
      <PageHeader
        title="Laporan Custom"
        description="Buat laporan sesuai kebutuhan"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Under Development</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fitur laporan custom sedang dalam pengembangan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}