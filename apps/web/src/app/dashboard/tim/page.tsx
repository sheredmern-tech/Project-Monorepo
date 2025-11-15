// ============================================================================
// FILE 2: app/(dashboard)/tim/page.tsx - ✅ FIXED any & exhaustive-deps
// ============================================================================
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users as UsersIcon,
  Search,
  Filter,
  UserPlus,
  X,
  CheckSquare,
  Upload,
  Download,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCard } from "@/components/tim/user-card";
import { BulkActionsBar } from "@/components/tim/bulk-actions-bar";
import { BulkImportUsersDialog } from "@/components/modals/bulk-import-users-dialog";
import { timApi } from "@/lib/api/tim.api";
import { UserEntity, UserRole } from "@/types";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/lib/hooks/use-toast";

type TabValue = "all" | "internal" | "client";

export default function TimPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [jabatanFilter, setJabatanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  // Bulk selection states
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  
  // Dialog states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Statistics
  const [statistics, setStatistics] = useState<{
    total_users: number;
    by_role: Record<string, number>;
    active_users: number;
    inactive_users: number;
    recent_additions: number;
  } | null>(null);

  // ✅ FIXED: useCallback to avoid exhaustive-deps warning
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await timApi.getAllUsers({ limit: 100 });
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast({
        title: "Gagal",
        description: "Gagal memuat data tim",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await timApi.getTeamStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Failed to fetch statistics", error);
    }
  }, []);

  // ✅ FIXED: Now fetchUsers is stable
  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, [fetchUsers, fetchStatistics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchUsers(), fetchStatistics()]);
    setIsRefreshing(false);
    toast({
      title: "Berhasil",
      description: "Data berhasil diperbarui",
    });
  };

  // Filter logic
  const filteredUsers = users.filter((user) => {
    // Tab filter
    if (activeTab === "internal" && user.role === "klien") return false;
    if (activeTab === "client" && user.role !== "klien") return false;

    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      user.nama_lengkap?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.jabatan?.toLowerCase().includes(searchLower) ||
      user.telepon?.includes(searchQuery);

    // Role filter
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    // Jabatan filter
    const matchesJabatan =
      jabatanFilter === "all" ||
      user.jabatan?.toLowerCase().includes(jabatanFilter.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);

    return matchesSearch && matchesRole && matchesJabatan && matchesStatus;
  });

  // Get unique jabatan for filter
  const uniqueJabatan = Array.from(
    new Set(users.map((u) => u.jabatan).filter(Boolean))
  ) as string[];

  // Statistics calculation
  const stats = {
    total: users.length,
    internal: users.filter((u) => u.role !== "klien").length,
    clients: users.filter((u) => u.role === "klien").length,
    admin: users.filter((u) => u.role === "admin").length,
    advokat: users.filter((u) => u.role === "advokat").length,
    paralegal: users.filter((u) => u.role === "paralegal").length,
    active: statistics?.active_users || 0,
    inactive: statistics?.inactive_users || 0,
    recent: statistics?.recent_additions || 0,
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setJabatanFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters = 
    searchQuery || 
    roleFilter !== "all" || 
    jabatanFilter !== "all" ||
    statusFilter !== "all";

  // Bulk selection handlers
  const handleToggleUser = (userId: string, checked: boolean) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(new Set(filteredUsers.map((u) => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleClearSelection = () => {
    setSelectedUserIds(new Set());
    setBulkSelectMode(false);
  };

  const handleBulkDelete = async () => {
    try {
      const result = await timApi.bulkDeleteUsers(Array.from(selectedUserIds));
      
      if (result.success > 0) {
        toast({
          title: "Berhasil",
          description: `${result.success} user berhasil dihapus${result.failed > 0 ? `, ${result.failed} gagal` : ''}`,
        });
      }
      
      await fetchUsers();
      setSelectedUserIds(new Set());
      setBulkSelectMode(false);
      
      return result;
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Gagal menghapus user",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleBulkChangeRole = async (role: string) => {
    try {
      const result = await timApi.bulkChangeRole(Array.from(selectedUserIds), role);
      
      if (result.success > 0) {
        toast({
          title: "Berhasil",
          description: `Role ${result.success} user berhasil diubah${result.failed > 0 ? `, ${result.failed} gagal` : ''}`,
        });
      }
      
      await fetchUsers();
      setSelectedUserIds(new Set());
      setBulkSelectMode(false);
      
      return result;
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Gagal mengubah role user",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      const blob = await timApi.exportUsers({
        format,
        filters: {
          ...(selectedUserIds.size > 0 && {
            user_ids: Array.from(selectedUserIds)
          })
        }
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tim-export-${new Date().toISOString().split("T")[0]}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Berhasil",
        description: `${selectedUserIds.size > 0 ? selectedUserIds.size : 'Semua'} user berhasil diexport`,
      });
    } catch {
      toast({
        title: "Gagal",
        description: "Gagal export data",
        variant: "destructive",
      });
    }
  };

  const allFilteredSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => selectedUserIds.has(u.id));

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tim"
        description="Kelola anggota tim firma hukum"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Format Export</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  Export Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportDialogOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            
            <Button
              variant={bulkSelectMode ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setBulkSelectMode(!bulkSelectMode);
                if (bulkSelectMode) {
                  setSelectedUserIds(new Set());
                }
              }}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              {bulkSelectMode ? "Batal Pilih" : "Pilih Multiple"}
            </Button>
            
            <Button onClick={() => router.push("/tim/tambah")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Anggota
            </Button>
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tim</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
              <UsersIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tim Internal</p>
                <h3 className="text-2xl font-bold">{stats.internal}</h3>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif</p>
                <h3 className="text-2xl font-bold text-green-600">{stats.active}</h3>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Advokat</p>
                <h3 className="text-2xl font-bold">{stats.advokat}</h3>
              </div>
              <UsersIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Baru (30 hari)</p>
                <h3 className="text-2xl font-bold">{stats.recent}</h3>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama, email, jabatan, atau telepon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value as UserRole | "all")}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="advokat">Advokat</SelectItem>
                  <SelectItem value="paralegal">Paralegal</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="klien">Klien</SelectItem>
                </SelectContent>
              </Select>
              
              {uniqueJabatan.length > 0 && (
                <Select value={jabatanFilter} onValueChange={setJabatanFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter Jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jabatan</SelectItem>
                    {uniqueJabatan.map((jabatan) => (
                      <SelectItem key={jabatan} value={jabatan}>
                        {jabatan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {/* ✅ FIXED: Proper type instead of any */}
              <Select 
                value={statusFilter} 
                onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
              
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="w-full md:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList>
          <TabsTrigger value="all">Semua ({stats.total})</TabsTrigger>
          <TabsTrigger value="internal">
            Tim Internal ({stats.internal})
          </TabsTrigger>
          <TabsTrigger value="client">Klien ({stats.clients})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredUsers.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Menampilkan {filteredUsers.length} dari {users.length} anggota
                </div>
                {bulkSelectMode && filteredUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={allFilteredSelected}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm">
                      Pilih semua ({filteredUsers.length})
                    </span>
                  </div>
                )}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onClick={() => {
                      if (!bulkSelectMode) {
                        router.push(`/tim/${user.id}`);
                      }
                    }}
                    onSelect={(checked) => handleToggleUser(user.id, checked)}
                    isSelected={selectedUserIds.has(user.id)}
                    showCheckbox={bulkSelectMode}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={hasActiveFilters ? Filter : UsersIcon}
              title={
                hasActiveFilters ? "Tidak ada hasil" : "Belum ada anggota tim"
              }
              description={
                hasActiveFilters
                  ? "Coba ubah filter atau kata kunci pencarian"
                  : "Tidak ada data tim yang tersedia"
              }
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedUserIds.size}
        onClearSelection={handleClearSelection}
        onBulkDelete={handleBulkDelete}
        onBulkChangeRole={handleBulkChangeRole}
        onExport={() => handleExport('csv')}
      />

      {/* Import Dialog */}
      <BulkImportUsersDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={() => {
          fetchUsers();
          fetchStatistics();
        }}
      />
    </div>
  );
}