/**
 * usePermission Hook
 * Provides easy-to-use permission checking for components
 */

import { useMemo } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import {
  Permission,
  Resource,
  Action,
  hasPermission,
  canPerformAction,
  canAccessResource,
  hasAllPermissions,
  hasAnyPermission,
  PermissionChecks,
} from "@/lib/config/permissions";
import { UserRole } from "@/types/enums";

export function usePermission() {
  const { user } = useAuthStore();
  const userRole = user?.role;

  // Memoize permission checks to avoid recalculation on every render
  const permissions = useMemo(
    () => ({
      // Core permission checkers
      has: (permission: Permission) => hasPermission(userRole, permission),
      can: (resource: Resource, action: Action) =>
        canPerformAction(userRole, resource, action),
      canAccess: (resource: Resource) => canAccessResource(userRole, resource),
      hasAll: (permissions: Permission[]) =>
        hasAllPermissions(userRole, permissions),
      hasAny: (permissions: Permission[]) =>
        hasAnyPermission(userRole, permissions),

      // Resource-specific permission checks (convenience methods)
      klien: {
        create: PermissionChecks.canCreateKlien(userRole),
        read: PermissionChecks.canReadKlien(userRole),
        update: PermissionChecks.canUpdateKlien(userRole),
        delete: PermissionChecks.canDeleteKlien(userRole),
        export: PermissionChecks.canExportKlien(userRole),
      },

      perkara: {
        create: PermissionChecks.canCreatePerkara(userRole),
        read: PermissionChecks.canReadPerkara(userRole),
        update: PermissionChecks.canUpdatePerkara(userRole),
        delete: PermissionChecks.canDeletePerkara(userRole),
        assign: PermissionChecks.canAssignPerkara(userRole),
      },

      tugas: {
        create: PermissionChecks.canCreateTugas(userRole),
        read: PermissionChecks.canReadTugas(userRole),
        update: PermissionChecks.canUpdateTugas(userRole),
        delete: PermissionChecks.canDeleteTugas(userRole),
        assign: PermissionChecks.canAssignTugas(userRole),
      },

      dokumen: {
        create: PermissionChecks.canCreateDokumen(userRole),
        read: PermissionChecks.canReadDokumen(userRole),
        update: PermissionChecks.canUpdateDokumen(userRole),
        delete: PermissionChecks.canDeleteDokumen(userRole),
        upload: PermissionChecks.canUploadDokumen(userRole),
        download: PermissionChecks.canDownloadDokumen(userRole),
      },

      sidang: {
        create: PermissionChecks.canCreateSidang(userRole),
        read: PermissionChecks.canReadSidang(userRole),
        update: PermissionChecks.canUpdateSidang(userRole),
        delete: PermissionChecks.canDeleteSidang(userRole),
      },

      konflik: {
        create: PermissionChecks.canCreateKonflik(userRole),
        read: PermissionChecks.canReadKonflik(userRole),
        update: PermissionChecks.canUpdateKonflik(userRole),
        delete: PermissionChecks.canDeleteKonflik(userRole),
      },

      tim: {
        manage: PermissionChecks.canManageTim(userRole),
        read: PermissionChecks.canReadTim(userRole),
        update: PermissionChecks.canUpdateTim(userRole),
      },

      laporan: {
        read: PermissionChecks.canReadLaporan(userRole),
        export: PermissionChecks.canExportLaporan(userRole),
      },

      users: {
        create: PermissionChecks.canCreateUsers(userRole),
        delete: PermissionChecks.canDeleteUsers(userRole),
        import: PermissionChecks.canImportUsers(userRole),
      },

      // Role checks
      isAdmin: userRole === UserRole.ADMIN,
      isAdvokat: userRole === UserRole.ADVOKAT,
      isParalegal: userRole === UserRole.PARALEGAL,
      isStaff: userRole === UserRole.STAFF,
      isKlien: userRole === UserRole.KLIEN,

      // Current user info
      role: userRole,
      user,
    }),
    [userRole, user]
  );

  return permissions;
}

/**
 * Higher-order component for permission-based rendering
 * Usage: <PermissionGuard requires="klien:create">...</PermissionGuard>
 */
export function usePermissionGuard(permission: Permission): boolean {
  const { has } = usePermission();
  return has(permission);
}

/**
 * Hook to check if user can perform action on resource
 * Usage: const canEdit = useCanPerformAction(Resource.KLIEN, Action.UPDATE);
 */
export function useCanPerformAction(
  resource: Resource,
  action: Action
): boolean {
  const { can } = usePermission();
  return can(resource, action);
}

/**
 * Hook to check if user can access a resource at all
 * Usage: const canAccessKlien = useCanAccessResource(Resource.KLIEN);
 */
export function useCanAccessResource(resource: Resource): boolean {
  const { canAccess } = usePermission();
  return canAccess(resource);
}
