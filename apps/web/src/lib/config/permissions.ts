/**
 * RBAC Permission System
 * Defines granular permissions for each role across all resources
 */

import { UserRole } from "@/types/enums";

// ============================================================================
// Permission Types
// ============================================================================

export enum Resource {
  KLIEN = "klien",
  PERKARA = "perkara",
  TUGAS = "tugas",
  DOKUMEN = "dokumen",
  SIDANG = "sidang",
  KONFLIK = "konflik",
  TIM = "tim",
  LAPORAN = "laporan",
  PENGATURAN = "pengaturan",
  USERS = "users",
}

export enum Action {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  EXPORT = "export",
  IMPORT = "import",
  ASSIGN = "assign",
  DOWNLOAD = "download",
  UPLOAD = "upload",
  MANAGE = "manage", // Full CRUD + special actions
}

export type Permission = `${Resource}:${Action}`;

// ============================================================================
// Permission Matrix - Defines what each role can do
// ============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // ADMIN: Full access to everything
  [UserRole.ADMIN]: [
    // Klien
    "klien:create",
    "klien:read",
    "klien:update",
    "klien:delete",
    "klien:export",
    "klien:import",
    // Perkara
    "perkara:create",
    "perkara:read",
    "perkara:update",
    "perkara:delete",
    "perkara:export",
    "perkara:assign",
    // Tugas
    "tugas:create",
    "tugas:read",
    "tugas:update",
    "tugas:delete",
    "tugas:assign",
    // Dokumen
    "dokumen:create",
    "dokumen:read",
    "dokumen:update",
    "dokumen:delete",
    "dokumen:upload",
    "dokumen:download",
    "dokumen:export",
    // Sidang
    "sidang:create",
    "sidang:read",
    "sidang:update",
    "sidang:delete",
    "sidang:export",
    // Konflik
    "konflik:create",
    "konflik:read",
    "konflik:update",
    "konflik:delete",
    // Tim
    "tim:create",
    "tim:read",
    "tim:update",
    "tim:delete",
    "tim:manage",
    // Laporan
    "laporan:read",
    "laporan:export",
    "laporan:create",
    // Pengaturan
    "pengaturan:read",
    "pengaturan:update",
    "pengaturan:manage",
    // Users
    "users:create",
    "users:read",
    "users:update",
    "users:delete",
    "users:import",
  ],

  // ADVOKAT (Lawyer): Can manage cases, clients, and documents
  [UserRole.ADVOKAT]: [
    // Klien
    "klien:create",
    "klien:read",
    "klien:update",
    "klien:export",
    // No delete for clients
    // Perkara
    "perkara:create",
    "perkara:read",
    "perkara:update",
    "perkara:delete", // Can delete cases they own
    "perkara:export",
    "perkara:assign",
    // Tugas
    "tugas:create",
    "tugas:read",
    "tugas:update",
    "tugas:delete",
    "tugas:assign",
    // Dokumen
    "dokumen:create",
    "dokumen:read",
    "dokumen:update",
    "dokumen:delete",
    "dokumen:upload",
    "dokumen:download",
    "dokumen:export",
    // Sidang
    "sidang:create",
    "sidang:read",
    "sidang:update",
    "sidang:delete",
    "sidang:export",
    // Konflik
    "konflik:create",
    "konflik:read",
    "konflik:update",
    // Tim
    "tim:read",
    "tim:update", // Can update team assignments
    // Laporan
    "laporan:read",
    "laporan:export",
    // Pengaturan
    "pengaturan:read",
  ],

  // PARALEGAL: Limited to assigned cases and support tasks
  [UserRole.PARALEGAL]: [
    // Klien
    "klien:read",
    "klien:update", // Can update client info
    // No create/delete
    // Perkara
    "perkara:read",
    "perkara:update", // Can update assigned cases
    // No create/delete
    // Tugas
    "tugas:create", // Can create tasks
    "tugas:read",
    "tugas:update",
    // No delete
    // Dokumen
    "dokumen:create",
    "dokumen:read",
    "dokumen:update",
    "dokumen:upload",
    "dokumen:download",
    // No delete
    // Sidang
    "sidang:create",
    "sidang:read",
    "sidang:update",
    // No delete
    // Konflik
    "konflik:read",
    // Tim
    "tim:read",
    // Laporan
    "laporan:read",
    // Pengaturan
    "pengaturan:read",
  ],

  // STAFF: Data entry only, no deletion rights
  [UserRole.STAFF]: [
    // Klien
    "klien:create",
    "klien:read",
    "klien:update",
    // No delete
    // Perkara
    "perkara:read",
    "perkara:update", // Limited updates
    // No create/delete
    // Tugas
    "tugas:read",
    "tugas:update",
    // No create/delete
    // Dokumen
    "dokumen:read",
    "dokumen:upload",
    "dokumen:download",
    // No update/delete
    // Sidang
    "sidang:read",
    // Konflik
    "konflik:read",
    // Tim
    "tim:read",
    // Laporan
    "laporan:read",
    // Pengaturan
    "pengaturan:read",
  ],

  // KLIEN: No access to web admin (internal system only)
  // KLIEN users are blocked at middleware level
  [UserRole.KLIEN]: [],
};

// ============================================================================
// Permission Helper Functions
// ============================================================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: UserRole | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role can perform an action on a resource
 */
export function canPerformAction(
  role: UserRole | undefined,
  resource: Resource,
  action: Action
): boolean {
  if (!role) return false;
  const permission: Permission = `${resource}:${action}`;
  return hasPermission(role, permission);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if role can access a specific route/page
 */
export function canAccessResource(
  role: UserRole | undefined,
  resource: Resource
): boolean {
  if (!role) return false;

  // Check if role has ANY permission for this resource
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.some((perm) => perm.startsWith(`${resource}:`));
}

/**
 * Check if role can PERFORM ACTIONS on a resource (not just read)
 * Used for navigation filtering - only show menu if user can do something
 */
export function canPerformActionsOnResource(
  role: UserRole | undefined,
  resource: Resource
): boolean {
  if (!role) return false;

  // Get all permissions for this resource
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  const resourcePermissions = rolePermissions.filter((perm) =>
    perm.startsWith(`${resource}:`)
  );

  // Check if user has ANY action permission BESIDES read
  return resourcePermissions.some((perm) => {
    const action = perm.split(':')[1];
    return action !== 'read'; // Must have create, update, delete, upload, assign, etc
  });
}

/**
 * Check multiple permissions (AND logic - must have ALL)
 */
export function hasAllPermissions(
  role: UserRole | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false;
  return permissions.every((perm) => hasPermission(role, perm));
}

/**
 * Check multiple permissions (OR logic - must have ANY)
 */
export function hasAnyPermission(
  role: UserRole | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false;
  return permissions.some((perm) => hasPermission(role, perm));
}

// ============================================================================
// Resource-specific permission helpers
// ============================================================================

export const PermissionChecks = {
  // Klien permissions
  canCreateKlien: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.KLIEN, Action.CREATE),
  canReadKlien: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.KLIEN, Action.READ),
  canUpdateKlien: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.KLIEN, Action.UPDATE),
  canDeleteKlien: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.KLIEN, Action.DELETE),
  canExportKlien: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.KLIEN, Action.EXPORT),

  // Perkara permissions
  canCreatePerkara: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.PERKARA, Action.CREATE),
  canReadPerkara: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.PERKARA, Action.READ),
  canUpdatePerkara: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.PERKARA, Action.UPDATE),
  canDeletePerkara: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.PERKARA, Action.DELETE),
  canAssignPerkara: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.PERKARA, Action.ASSIGN),

  // Tugas permissions
  canCreateTugas: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.TUGAS, Action.CREATE),
  canReadTugas: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.TUGAS, Action.READ),
  canUpdateTugas: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.TUGAS, Action.UPDATE),
  canDeleteTugas: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.TUGAS, Action.DELETE),
  canAssignTugas: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.TUGAS, Action.ASSIGN),

  // Dokumen permissions
  canCreateDokumen: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.DOKUMEN, Action.CREATE),
  canReadDokumen: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.DOKUMEN, Action.READ),
  canUpdateDokumen: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.DOKUMEN, Action.UPDATE),
  canDeleteDokumen: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.DOKUMEN, Action.DELETE),
  canUploadDokumen: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.DOKUMEN, Action.UPLOAD),
  canDownloadDokumen: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.DOKUMEN, Action.DOWNLOAD),

  // Sidang permissions
  canCreateSidang: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.SIDANG, Action.CREATE),
  canReadSidang: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.SIDANG, Action.READ),
  canUpdateSidang: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.SIDANG, Action.UPDATE),
  canDeleteSidang: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.SIDANG, Action.DELETE),

  // Konflik permissions
  canCreateKonflik: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.KONFLIK, Action.CREATE),
  canReadKonflik: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.KONFLIK, Action.READ),
  canUpdateKonflik: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.KONFLIK, Action.UPDATE),
  canDeleteKonflik: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.KONFLIK, Action.DELETE),

  // Tim permissions
  canManageTim: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.TIM, Action.MANAGE),
  canReadTim: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.TIM, Action.READ),
  canUpdateTim: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.TIM, Action.UPDATE),

  // Laporan permissions
  canReadLaporan: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.LAPORAN, Action.READ),
  canExportLaporan: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.LAPORAN, Action.EXPORT),

  // Users permissions
  canCreateUsers: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.USERS, Action.CREATE),
  canDeleteUsers: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.USERS, Action.DELETE),
  canImportUsers: (role: UserRole | undefined) =>
    canPerformAction(role, Resource.USERS, Action.IMPORT),
};
