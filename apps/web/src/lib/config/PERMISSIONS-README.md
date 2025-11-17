# Permission System Documentation

## Overview

Firma App uses a comprehensive Role-Based Access Control (RBAC) system with granular permissions. The system ensures proper authorization across all features while maintaining security and usability.

## Key Principle: ADMIN BYPASS

**IMPORTANT:** ADMIN role has UNIVERSAL ACCESS to ALL features and resources. ADMIN bypasses all permission checks at the application level.

```typescript
// ✅ ADMIN ALWAYS RETURNS TRUE
if (role === UserRole.ADMIN) {
  return true; // Full access!
}
```

## Roles

### 1. ADMIN (Administrator)
- **Access Level:** FULL ACCESS TO EVERYTHING
- **Bypass:** YES - Bypasses all permission checks
- **Can Do:**
  - Manage all users, roles, and permissions
  - Full CRUD on all resources (Klien, Perkara, Tugas, Dokumen, Sidang, Konflik, Tim)
  - Access all reports and system settings
  - Import/export data
  - Delete any records
- **Cannot Do:** Nothing - ADMIN has NO restrictions

### 2. PARTNER
- **Access Level:** Same as ADMIN
- **Bypass:** NO (but has all explicit permissions)
- **Can Do:** Everything ADMIN can do (via explicit permissions)

### 3. ADVOKAT (Lawyer)
- **Access Level:** High
- **Can Do:**
  - Manage cases (Perkara), clients (Klien), tasks (Tugas)
  - Upload and manage documents
  - Schedule and manage court hearings (Sidang)
  - Check conflicts of interest (Konflik)
  - View team members
  - Generate reports
- **Cannot Do:**
  - Delete clients
  - Manage system users
  - Modify system settings

### 4. PARALEGAL
- **Access Level:** Medium
- **Can Do:**
  - Update assigned cases
  - Create and manage tasks
  - Upload and manage documents
  - Schedule court hearings
  - View conflicts
- **Cannot Do:**
  - Create new cases
  - Delete records
  - Manage clients (read-only)
  - Manage system users

### 5. STAFF
- **Access Level:** Low
- **Can Do:**
  - Data entry for clients
  - Update case information
  - Upload documents
  - View tasks, hearings, reports
- **Cannot Do:**
  - Create cases or tasks
  - Delete any records
  - Manage team

### 6. KLIEN (Client)
- **Access Level:** BLOCKED from web admin
- **Can Do:** NOTHING in web admin (uses mobile app instead)

## Permission Structure

### Resources
```typescript
enum Resource {
  KLIEN = "klien",       // Clients
  PERKARA = "perkara",   // Cases
  TUGAS = "tugas",       // Tasks
  DOKUMEN = "dokumen",   // Documents
  SIDANG = "sidang",     // Court Hearings
  KONFLIK = "konflik",   // Conflicts of Interest
  TIM = "tim",           // Team Management
  LAPORAN = "laporan",   // Reports
  PENGATURAN = "pengaturan", // Settings
  USERS = "users",       // User Management
}
```

### Actions
```typescript
enum Action {
  CREATE = "create",     // Create new records
  READ = "read",         // View records
  UPDATE = "update",     // Modify records
  DELETE = "delete",     // Remove records
  EXPORT = "export",     // Export data
  IMPORT = "import",     // Import data
  ASSIGN = "assign",     // Assign tasks/cases
  DOWNLOAD = "download", // Download files
  UPLOAD = "upload",     // Upload files
  MANAGE = "manage",     // Full management (CRUD + special actions)
}
```

### Permission Format
```typescript
type Permission = `${Resource}:${Action}`;

// Examples:
"klien:create"    // Can create clients
"perkara:update"  // Can update cases
"dokumen:delete"  // Can delete documents
"tim:manage"      // Can fully manage team
```

## Usage in Code

### 1. Using usePermission Hook
```typescript
import { usePermission } from "@/lib/hooks/use-permission";

function MyComponent() {
  const permissions = usePermission();

  // Check specific permission
  if (permissions.has("klien:create")) {
    // Show "Add Client" button
  }

  // Check resource access
  if (permissions.canAccess(Resource.PERKARA)) {
    // Show "Cases" menu
  }

  // Check specific action
  if (permissions.can(Resource.TUGAS, Action.DELETE)) {
    // Show "Delete Task" button
  }

  // Use convenience methods
  if (permissions.klien.create) {
    // Show "Add Client" button
  }

  // Check if user is admin
  if (permissions.isAdmin) {
    // Show admin-only features
  }

  return <div>...</div>;
}
```

### 2. Using Permission Check Functions
```typescript
import {
  hasPermission,
  canPerformAction,
  canAccessResource,
} from "@/lib/config/permissions";
import { UserRole, Resource, Action } from "@/types";

// Check permission
const canCreate = hasPermission(UserRole.ADVOKAT, "klien:create"); // true

// Check action on resource
const canUpdate = canPerformAction(UserRole.STAFF, Resource.PERKARA, Action.UPDATE); // true

// Check resource access
const canAccessKlien = canAccessResource(UserRole.PARALEGAL, Resource.KLIEN); // true
```

### 3. Using PermissionChecks Object
```typescript
import { PermissionChecks } from "@/lib/config/permissions";
import { UserRole } from "@/types";

const role = UserRole.ADVOKAT;

// Quick permission checks
if (PermissionChecks.canCreateKlien(role)) {
  // Show create client button
}

if (PermissionChecks.canDeletePerkara(role)) {
  // Show delete case button
}

if (PermissionChecks.canManageTim(role)) {
  // Show team management
}
```

### 4. Debug Permissions
```typescript
import { debugPermissions } from "@/lib/utils/permission-debug";
import { UserRole } from "@/types";

// Debug in console
debugPermissions(UserRole.ADMIN);
debugPermissions(UserRole.ADVOKAT);
```

## Navigation Filtering

Navigation menus are automatically filtered based on user permissions:

```typescript
import { getNavigationForRole } from "@/lib/config/rbac";

// Get navigation items for user's role
const navItems = getNavigationForRole(user.role);

// Only shows menus where user can PERFORM ACTIONS (not just read)
// ADMIN sees ALL menus automatically
```

## ADMIN Bypass Locations

ADMIN bypass is implemented in all permission check functions:

1. `hasPermission()` - Line 239-251
2. `canPerformAction()` - Line 257-271
3. `canAccessResource()` - Line 284-298
4. `canPerformActionsOnResource()` - Line 305-327
5. `hasAllPermissions()` - Line 333-345
6. `hasAnyPermission()` - Line 351-363
7. `canAccessRoute()` - Line 151-168 (in rbac.ts)

## Best Practices

### ✅ DO
- Always use permission hooks in components
- Check permissions before showing buttons/actions
- Use `usePermission()` hook for reactive permission checks
- Test with different roles during development
- Use debug utility to troubleshoot permission issues

### ❌ DON'T
- Don't hardcode role checks (use permissions instead)
- Don't assume frontend checks are enough (backend must validate too)
- Don't forget ADMIN bypass when adding new permission checks
- Don't show actions that users can't perform

## Adding New Permissions

1. Add new Resource or Action to enum (if needed)
2. Update `ROLE_PERMISSIONS` in `permissions.ts`
3. Add convenience check to `PermissionChecks` object
4. Update `usePermission()` hook with new convenience methods
5. Add navigation item to `rbac.ts` with `requiredResource`
6. Test with all roles

## Security Notes

- **Frontend permissions are for UX only** - Always validate on backend
- **ADMIN bypass is frontend only** - Backend must also validate ADMIN
- **Never trust client-side permission checks** for security decisions
- **Always validate user role and permissions on API endpoints**

## Troubleshooting

### User Can't Access Feature
1. Check if user role has the required permission in `ROLE_PERMISSIONS`
2. Use `debugPermissions(role)` to see all permissions
3. Check if navigation item has correct `requiredResource`
4. Verify `canPerformActionsOnResource()` returns true for the resource
5. Check browser console for permission-related errors

### ADMIN Can't Access Everything
1. Verify user role is exactly `UserRole.ADMIN`
2. Check auth store: `const { user } = useAuthStore()`
3. Verify ADMIN bypass is working: `console.log('Is Admin:', role === UserRole.ADMIN)`
4. Check if there are hardcoded role checks bypassing the permission system
5. Verify backend is also recognizing ADMIN role

### Navigation Menu Not Showing
1. Check if `requiredResource` is set on nav item
2. Verify user has actionable permissions (create, update, delete) not just read
3. For ADMIN, all menus should show automatically
4. Check `getNavigationForRole()` output in console

---

**Last Updated:** 2025-11-17
**Version:** 2.0 with ADMIN Bypass
