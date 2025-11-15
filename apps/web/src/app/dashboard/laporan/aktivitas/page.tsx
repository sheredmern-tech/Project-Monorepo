// ============================================================================
// FILE: app/(dashboard)/laporan/aktivitas/page.tsx - UPDATED WITH HOOK
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLog } from "@/lib/hooks/use-log";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatDateTime } from "@/lib/utils/date";
import { Search, Filter, Calendar } from "lucide-react";

export default function LaporanAktivitasPage() {
  const { 
    logs, 
    isLoading, 
    fetchLogs,
    filterByEntity,
    filterByAction,
    groupByDate 
  } = useLog();

  const [searchQuery, setSearchQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    fetchLogs({ 
      page, 
      limit, 
      sortBy: "created_at", 
      sortOrder: "desc",
      ...(entityFilter !== "all" && { jenis_entitas: entityFilter }),
      ...(actionFilter !== "all" && { aksi: actionFilter }),
      ...(searchQuery && { search: searchQuery })
    });
  }, [fetchLogs, page, entityFilter, actionFilter, searchQuery]);

  // Get unique entity types and actions for filters
  const entityTypes = Array.from(new Set(logs.map(log => log.jenis_entitas).filter(Boolean)));
  const actionTypes = Array.from(new Set(logs.map(log => log.aksi).filter(Boolean)));

  // Filter logs based on current filters
  let filteredLogs = logs;
  if (entityFilter !== "all") {
    filteredLogs = filterByEntity(filteredLogs, entityFilter);
  }
  if (actionFilter !== "all") {
    filteredLogs = filterByAction(filteredLogs, actionFilter);
  }
  if (searchQuery) {
    filteredLogs = filteredLogs.filter(log => 
      log.aksi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user?.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Group logs by date
  const groupedLogs = groupByDate(filteredLogs);

  const handleClearFilters = () => {
    setSearchQuery("");
    setEntityFilter("all");
    setActionFilter("all");
  };

  const hasActiveFilters = searchQuery || entityFilter !== "all" || actionFilter !== "all";

  if (isLoading && logs.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Laporan Aktivitas"
        description="Log aktivitas pengguna dan sistem"
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari aktivitas atau user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter Entitas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Entitas</SelectItem>
                  {entityTypes.map((entity) => (
                    <SelectItem key={entity} value={entity!} className="capitalize">
                      {entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter Aksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Aksi</SelectItem>
                  {actionTypes.map((action) => (
                    <SelectItem key={action} value={action!}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClearFilters}>
                  <Filter className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredLogs.length}</div>
            <p className="text-sm text-muted-foreground">Total Aktivitas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{Object.keys(groupedLogs).length}</div>
            <p className="text-sm text-muted-foreground">Hari Terekam</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {Array.from(new Set(filteredLogs.map(l => l.user_id).filter(Boolean))).length}
            </div>
            <p className="text-sm text-muted-foreground">User Aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Grouped Logs */}
      <div className="space-y-6">
        {Object.entries(groupedLogs).map(([date, dateLogs]) => (
          <Card key={date}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-lg">{date}</CardTitle>
                <Badge variant="secondary">{dateLogs.length} aktivitas</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dateLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{log.aksi}</p>
                        {log.jenis_entitas && (
                          <Badge variant="secondary" className="capitalize">
                            {log.jenis_entitas}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                        <span>{log.user?.nama_lengkap || "System"}</span>
                        <span>•</span>
                        <span>{formatDateTime(log.created_at)}</span>
                        {log.id_entitas && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-xs">
                              ID: {log.id_entitas.slice(0, 8)}...
                            </span>
                          </>
                        )}
                      </div>
                      {log.detail && Object.keys(log.detail).length > 0 && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(log.detail, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {filteredLogs.length === 0 && !isLoading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              {hasActiveFilters 
                ? "Tidak ada aktivitas yang sesuai dengan filter" 
                : "Belum ada aktivitas"}
            </p>
          </CardContent>
        </Card>
      )}

      {filteredLogs.length > 0 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled
          >
            Page {page}
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={filteredLogs.length < limit || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}