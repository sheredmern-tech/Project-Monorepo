/**
 * Permission Debug Utility
 * Use this to debug permission issues
 */

import { UserRole } from "@/types/enums";
import { ROLE_PERMISSIONS, Resource, Action } from "@/lib/config/permissions";
import { getNavigationForRole } from "@/lib/config/rbac";

export function debugPermissions(role: UserRole) {
  console.group(`🔐 Permission Debug for ${role}`);

  // Show all permissions
  console.log("📋 All Permissions:", ROLE_PERMISSIONS[role]);

  // Show navigation access
  console.log("🧭 Navigation Items:", getNavigationForRole(role));

  // Check specific resources
  const resources = Object.values(Resource);
  console.log("\n📊 Resource Access:");
  resources.forEach((resource) => {
    const permissions = ROLE_PERMISSIONS[role].filter((p) =>
      p.startsWith(`${resource}:`)
    );
    console.log(`  ${resource}:`, permissions.length > 0 ? permissions : "❌ NO ACCESS");
  });

  console.groupEnd();
}

export function isAdmin(role?: UserRole): boolean {
  return role === UserRole.ADMIN;
}

/**
 * ADMIN bypass - ADMIN should ALWAYS have access
 */
export function hasAdminAccess(role?: UserRole): boolean {
  if (role === UserRole.ADMIN) {
    console.log("✅ ADMIN BYPASS: Full access granted");
    return true;
  }
  return false;
}

/**
 * Check permission with ADMIN bypass
 */
export function checkPermissionWithAdminBypass(
  role: UserRole | undefined,
  checkFunction: () => boolean
): boolean {
  // ADMIN always has access
  if (hasAdminAccess(role)) {
    return true;
  }

  // Otherwise check permission normally
  return checkFunction();
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role?: UserRole): string {
  if (!role) return "Unknown";

  switch (role) {
    case UserRole.ADMIN:
      return "Administrator";
    case UserRole.ADVOKAT:
      return "Advokat";
    case UserRole.PARTNER:
      return "Partner";
    case UserRole.PARALEGAL:
      return "Paralegal";
    case UserRole.STAFF:
      return "Staff";
    case UserRole.KLIEN:
      return "Klien";
    default:
      return role;
  }
}

/**
 * Check if role has elevated privileges (ADMIN or PARTNER)
 */
export function hasElevatedPrivileges(role?: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.PARTNER;
}
