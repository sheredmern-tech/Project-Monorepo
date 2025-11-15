// ============================================================================
// FILE: app/(dashboard)/perkara/[id]/page.tsx - ✅ FULLY FIXED
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  ArrowLeft,
  FileText,
  CheckSquare,
  Calendar,
  Users,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { AddTeamMemberDialog } from "@/components/modals/add-team-member-dialog";
import { UserAvatar } from "@/components/shared/user-avatar";
import { perkaraApi } from "@/lib/api/perkara.api";
import { timApi } from "@/lib/api/tim.api";
import { klienApi } from "@/lib/api/klien.api";
import { useAuthStore } from "@/lib/stores/auth.store";
import { UserRole } from "@/types/enums";
import { PerkaraWithRelations, PerkaraStatistics, CreateTimPerkaraDto, UserBasic } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";

// ✅ Type guard for API errors
const isApiError = (err: unknown): err is { status: number; message?: string } => {
  return typeof err === 'object' && err !== null && 'status' in err;
};

export default function PerkaraDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [perkara, setPerkara] = useState<PerkaraWithRelations | null>(null);
  const [stats, setStats] = useState<PerkaraStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!params.id) return;
      
      try {
        setIsLoading(true);
        
        const perkaraData = await perkaraApi.getById(params.id as string);
        
        // ✅ CLIENT PERMISSION CHECK
        if (user?.role === UserRole.KLIEN) {
          // Get client's klien_id
          const profile = await klienApi.getMyProfile();
          
          // Check if this perkara belongs to the client
          if (perkaraData.klien_id !== profile.id) {
            console.log('🚫 Client trying to access unauthorized perkara');
            toast.error('Anda tidak memiliki akses ke perkara ini');
            router.push('/perkara');
            return;
          }
          
          console.log('✅ Client has permission to view this perkara');
          setHasPermission(true);
        } else {
          // Non-client users have permission
          setHasPermission(true);
        }
        
        console.log('✅ Perkara loaded:', {
          id: perkaraData.id,
          nomor: perkaraData.nomor_perkara,
          tim_count: perkaraData.tim_perkara.length,
        });
        setPerkara(perkaraData);

        // Load stats (optional, skip on error)
        try {
          const statsData = await perkaraApi.getStatistics(params.id as string);
          setStats(statsData);
        } catch (err) {
          console.log("Stats not available:", err);
        }
      } catch (err) {
        console.error("Failed to load perkara:", err);
        toast.error("Gagal memuat data perkara");
        router.push("/perkara");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params.id, router, user]);

  const handleDelete = async () => {
    try {
      await perkaraApi.delete(params.id as string);
      toast.success("Perkara berhasil dihapus");
      router.push("/perkara");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal menghapus perkara";
      toast.error(errorMessage);
    }
  };

  const handleAddMember = async (data: CreateTimPerkaraDto) => {
    try {
      console.log('📤 Adding member:', data);
      await timApi.addToTim(data);
      toast.success("Anggota tim berhasil ditambahkan");
      
      const updated = await perkaraApi.getById(params.id as string);
      setPerkara(updated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal menambahkan anggota tim";
      toast.error(errorMessage);
    }
  };

  const confirmRemoveMember = (timId: string, userName: string) => {
    console.log('🗑️ Preparing to remove:', { timId, userName });
    setMemberToDelete({ id: timId, name: userName });
  };

  const handleRemoveMember = async () => {
    if (!memberToDelete) return;

    const memberName = memberToDelete.name;
    const timId = memberToDelete.id;

    setMemberToDelete(null);

    try {
      console.log('🗑️ DELETE REQUEST:', { tim_id: timId, member_name: memberName });

      await timApi.removeFromTim(timId);
      
      const updated = await perkaraApi.getById(params.id as string);
      
      const stillExists = updated.tim_perkara.find(t => t.id === timId);
      
      if (stillExists) {
        console.error('❌ Member still exists after delete');
        toast.error("Backend Error", {
          description: "Data berhasil dihapus tapi masih ada di database.",
        });
        
        setPerkara(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            tim_perkara: prev.tim_perkara.filter(t => t.id !== timId)
          };
        });
      } else {
        console.log('✅ DELETE VERIFIED');
        setPerkara(updated);
        toast.success(`${memberName} berhasil dihapus dari tim`);
      }
      
    } catch (err) {
      // ✅ FIX #1: Removed `: any` - using type guard instead
      console.error('❌ DELETE ERROR:', err);
      
      if (isApiError(err) && err.status === 404) {
        toast.info(`${memberName} sudah tidak ada di tim`);
        try {
          const updated = await perkaraApi.getById(params.id as string);
          setPerkara(updated);
        } catch {
          setPerkara(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              tim_perkara: prev.tim_perkara.filter(t => t.id !== timId)
            };
          });
        }
      } else {
        const errorMessage = isApiError(err) && err.message 
          ? err.message 
          : "Gagal menghapus anggota dari tim";
        toast.error("Gagal Menghapus Anggota", { description: errorMessage });
      }
    }
  };

  if (isLoading || !perkara || !hasPermission) {
    return <LoadingSpinner />;
  }

  // ✅ CONDITIONAL PERMISSIONS: Clients have limited actions
  const isClient = user?.role === UserRole.KLIEN;
  const canEdit = !isClient;
  const canDelete = !isClient;
  const canManageTeam = !isClient;

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <PageHeader
          title={perkara.nomor_perkara}
          description={perkara.judul}
          action={
            !isClient && (
              <div className="flex gap-2">
                {canEdit && (
                  <Button variant="outline" onClick={() => router.push(`/perkara/${params.id}/edit`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </Button>
                )}
              </div>
            )
          }
        />

        <div className="flex flex-wrap gap-2 mt-4">
          <StatusBadge status={perkara.status} />
          <PriorityBadge priority={perkara.prioritas} />
          <Badge variant="outline" className="capitalize">
            {perkara.jenis_perkara.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tugas">
            Tugas <Badge variant="secondary" className="ml-2">{perkara._count.tugas}</Badge>
          </TabsTrigger>
          <TabsTrigger value="dokumen">
            Dokumen <Badge variant="secondary" className="ml-2">{perkara._count.dokumen}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sidang">
            Sidang <Badge variant="secondary" className="ml-2">{perkara._count.jadwal_sidang}</Badge>
          </TabsTrigger>
          {!isClient && (
            <TabsTrigger value="tim">
              Tim <Badge variant="secondary" className="ml-2">{perkara.tim_perkara.length}</Badge>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Informasi Perkara</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {perkara.klien && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Klien</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{perkara.klien.nama}</p>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {perkara.deskripsi && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Deskripsi</p>
                      <p className="text-sm whitespace-pre-wrap">{perkara.deskripsi}</p>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Pengadilan</p>
                    <p className="font-medium">{perkara.nama_pengadilan || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Posisi Klien</p>
                    <p className="font-medium">{perkara.posisi_klien || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pihak Lawan</p>
                    <p className="font-medium">{perkara.pihak_lawan || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nilai Perkara</p>
                    <p className="font-medium">{formatCurrency(perkara.nilai_perkara)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Tugas</span>
                        <Badge variant="secondary">{stats.statistik.total_tugas}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tugas Selesai</span>
                        <Badge variant="secondary">{stats.statistik.tugas_selesai}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <Badge>{stats.statistik.tugas_progress}</Badge>
                      </div>
                    </div>
                    <Separator />
                  </>
                ) : null}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Dokumen</span>
                    <Badge variant="outline">{perkara._count.dokumen}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sidang</span>
                    <Badge variant="outline">{perkara._count.jadwal_sidang}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Catatan</span>
                    <Badge variant="outline">{perkara._count.catatan_perkara}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tugas Tab */}
        <TabsContent value="tugas">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Tugas</CardTitle>
            </CardHeader>
            <CardContent>
              {perkara.tugas.length > 0 ? (
                <div className="space-y-4">
                  {perkara.tugas.map((tugas) => (
                    <div
                      key={tugas.id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent"
                      onClick={() => router.push(`/tugas/${tugas.id}`)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{tugas.judul}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={tugas.status} />
                          <PriorityBadge priority={tugas.prioritas} />
                          {tugas.petugas && (
                            <span className="text-sm text-muted-foreground">
                              {tugas.petugas.nama_lengkap}
                            </span>
                          )}
                        </div>
                      </div>
                      {tugas.tenggat_waktu && (
                        <span className="text-sm text-muted-foreground">
                          {formatDate(tugas.tenggat_waktu)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CheckSquare}
                  title="Belum ada tugas"
                  description="Tambahkan tugas untuk perkara ini"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dokumen Tab */}
        <TabsContent value="dokumen">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Dokumen</CardTitle>
            </CardHeader>
            <CardContent>
              {perkara.dokumen.length > 0 ? (
                <div className="space-y-3">
                  {perkara.dokumen.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent"
                      onClick={() => router.push(`/dokumen/${doc.id}`)}
                    >
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{doc.nama_dokumen}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="capitalize">
                            {doc.kategori}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(doc.tanggal_upload)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="Belum ada dokumen"
                  description="Upload dokumen untuk perkara ini"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sidang Tab */}
        <TabsContent value="sidang">
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Sidang</CardTitle>
            </CardHeader>
            <CardContent>
              {perkara.jadwal_sidang.length > 0 ? (
                <div className="space-y-4">
                  {perkara.jadwal_sidang.map((sidang) => (
                    <div
                      key={sidang.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-accent"
                      onClick={() => router.push(`/sidang/${sidang.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="capitalize mb-2">
                            {sidang.jenis_sidang.replace(/_/g, " ")}
                          </Badge>
                          <p className="font-medium">{sidang.nama_pengadilan}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(sidang.tanggal_sidang)}
                          </p>
                        </div>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="Belum ada jadwal sidang"
                  description="Tambahkan jadwal sidang untuk perkara ini"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tim Tab - Hidden for clients */}
        {!isClient && (
          <TabsContent value="tim">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tim Perkara</CardTitle>
                  {canManageTeam && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAddMemberDialog(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Anggota
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {perkara.tim_perkara.length > 0 ? (
                  <div className="space-y-3">
                    {perkara.tim_perkara.map((tim) => {
                      // ✅ FIX #2: Use actual role from user data instead of hardcoded ADVOKAT
                      const userBasic: UserBasic = {
                        id: tim.user.id,
                        email: tim.user.email,
                        nama_lengkap: tim.user.nama_lengkap,
                        avatar_url: tim.user.avatar_url,
                        role: tim.user.role, // ✅ Dynamic role from database
                      };
                      return (
                        <div key={tim.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={userBasic} className="h-10 w-10" />
                            <div>
                              <p className="font-medium">{tim.user.nama_lengkap}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {tim.peran && <Badge variant="secondary">{tim.peran}</Badge>}
                                <span className="text-sm text-muted-foreground">
                                  Bergabung {formatDate(tim.tanggal_ditugaskan)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {canManageTeam && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmRemoveMember(tim.id, tim.user.nama_lengkap || tim.user.email);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="Belum ada tim"
                    description="Tambahkan anggota tim untuk perkara ini"
                    action={canManageTeam ? {
                      label: "Tambah Anggota",
                      onClick: () => setShowAddMemberDialog(true),
                    } : undefined}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Delete Perkara Dialog - Only for non-clients */}
      {canDelete && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Hapus Perkara"
          description={`Apakah Anda yakin ingin menghapus perkara "${perkara.nomor_perkara}"? Semua data terkait (tugas, dokumen, sidang) akan ikut terhapus.`}
          onConfirm={handleDelete}
          confirmText="Hapus"
          variant="destructive"
        />
      )}

      {/* Delete Team Member Dialog - Only for non-clients */}
      {canManageTeam && (
        <ConfirmDialog
          open={!!memberToDelete}
          onOpenChange={(open) => !open && setMemberToDelete(null)}
          title="Hapus Anggota Tim"
          description={`Apakah Anda yakin ingin menghapus ${memberToDelete?.name} dari tim perkara ini?`}
          onConfirm={handleRemoveMember}
          confirmText="Hapus"
          variant="destructive"
        />
      )}

      {/* Add Team Member Dialog - Only for non-clients */}
      {canManageTeam && (
        <AddTeamMemberDialog
          open={showAddMemberDialog}
          onOpenChange={setShowAddMemberDialog}
          perkaraId={params.id as string}
          perkaraNomor={perkara.nomor_perkara}
          existingMemberIds={perkara.tim_perkara.map(t => t.user.id)}
          onAdd={handleAddMember}
        />
      )}
    </div>
  );
}