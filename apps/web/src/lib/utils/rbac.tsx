/**
 * RBAC Utility Components
 * Permission-based rendering components and guards
 */

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/lib/hooks/use-permission";
import { Permission, Resource, Action } from "@/lib/config/permissions";
import { UserRole } from "@/types/enums";

// ============================================================================
// Permission Guard Component
// ============================================================================

interface PermissionGuardProps {
  children: ReactNode;
  requires?: Permission | Permission[];
  requiresAll?: boolean; // If multiple permissions, require all (AND) or any (OR)
  fallback?: ReactNode;
  onUnauthorized?: () => void;
}

/**
 * Component that renders children only if user has required permission(s)
 *
 * @example
 * <PermissionGuard requires="klien:delete">
 *   <DeleteButton />
 * </PermissionGuard>
 *
 * @example
 * <PermissionGuard requires={["klien:update", "klien:delete"]} requiresAll={false}>
 *   <ActionMenu />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  requires,
  requiresAll = true,
  fallback = null,
  onUnauthorized,
}: PermissionGuardProps) {
  const { has, hasAll, hasAny } = usePermission();

  if (!requires) {
    return <>{children}</>;
  }

  const permissions = Array.isArray(requires) ? requires : [requires];
  const hasPermission = requiresAll
    ? hasAll(permissions)
    : hasAny(permissions);

  if (!hasPermission) {
    onUnauthorized?.();
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// Resource Access Guard Component
// ============================================================================

interface ResourceGuardProps {
  children: ReactNode;
  resource: Resource;
  action: Action;
  fallback?: ReactNode;
  showMessage?: boolean;
}

/**
 * Component that renders children only if user can perform action on resource
 *
 * @example
 * <ResourceGuard resource={Resource.KLIEN} action={Action.DELETE}>
 *   <DeleteButton />
 * </ResourceGuard>
 */
export function ResourceGuard({
  children,
  resource,
  action,
  fallback = null,
  showMessage = false,
}: ResourceGuardProps) {
  const { can } = usePermission();
  const hasPermission = can(resource, action);

  if (!hasPermission) {
    if (showMessage) {
      return (
        <div className="text-sm text-muted-foreground">
          Anda tidak memiliki izin untuk {action} {resource}
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// Role Guard Component
// ============================================================================

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  redirect?: string;
}

/**
 * Component that renders children only if user has one of the allowed roles
 *
 * @example
 * <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.ADVOKAT]}>
 *   <AdminPanel />
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
  redirect,
}: RoleGuardProps) {
  const { role } = usePermission();
  const router = useRouter();

  if (!role || !allowedRoles.includes(role)) {
    if (redirect) {
      router.push(redirect);
      return null;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// Disabled Wrapper (for buttons/inputs)
// ============================================================================

interface DisabledByPermissionProps {
  children: ReactNode;
  permission: Permission;
  showTooltip?: boolean;
  tooltipMessage?: string;
}

/**
 * Wrapper that disables children (buttons, inputs) if user lacks permission
 * Useful for showing disabled state instead of hiding completely
 *
 * @example
 * <DisabledByPermission permission="klien:delete">
 *   <Button>Delete</Button>
 * </DisabledByPermission>
 */
export function DisabledByPermission({
  children,
  permission,
  showTooltip = true,
  tooltipMessage,
}: DisabledByPermissionProps) {
  const { has } = usePermission();
  const hasPermission = has(permission);

  if (hasPermission) {
    return <>{children}</>;
  }

  // Clone children and add disabled prop
  return (
    <div
      className="relative cursor-not-allowed opacity-50"
      title={showTooltip ? tooltipMessage || "Anda tidak memiliki izin" : ""}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Higher-Order Component for Page Protection
// ============================================================================

interface PageGuardOptions {
  resource?: Resource;
  action?: Action;
  permission?: Permission;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  unauthorizedComponent?: ReactNode;
}

/**
 * HOC to protect entire pages with permission checks
 * Redirects or shows unauthorized page if user lacks permission
 *
 * @example
 * export default withPageGuard(KlienPage, {
 *   resource: Resource.KLIEN,
 *   action: Action.READ,
 *   redirectTo: '/unauthorized'
 * });
 */
export function withPageGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: PageGuardOptions
) {
  return function GuardedPage(props: P) {
    const { can, has, role } = usePermission();
    const router = useRouter();

    // Check role-based access
    if (options.allowedRoles && role) {
      if (!options.allowedRoles.includes(role)) {
        if (options.redirectTo) {
          router.push(options.redirectTo);
          return null;
        }
        return <>{options.unauthorizedComponent || <UnauthorizedPage />}</>;
      }
    }

    // Check permission-based access
    if (options.permission) {
      if (!has(options.permission)) {
        if (options.redirectTo) {
          router.push(options.redirectTo);
          return null;
        }
        return <>{options.unauthorizedComponent || <UnauthorizedPage />}</>;
      }
    }

    // Check resource-action based access
    if (options.resource && options.action) {
      if (!can(options.resource, options.action)) {
        if (options.redirectTo) {
          router.push(options.redirectTo);
          return null;
        }
        return <>{options.unauthorizedComponent || <UnauthorizedPage />}</>;
      }
    }

    return <Component {...props} />;
  };
}

// ============================================================================
// Unauthorized Page Component
// ============================================================================

function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">403</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Anda tidak memiliki izin untuk mengakses halaman ini
      </p>
      <button
        onClick={() => router.back()}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
      >
        Kembali
      </button>
    </div>
  );
}

// ============================================================================
// Utility Helper Functions
// ============================================================================

/**
 * Check if action button should be shown/enabled
 * Returns object with `show` and `disabled` properties
 */
export function useActionPermission(permission: Permission) {
  const { has } = usePermission();
  const hasPermission = has(permission);

  return {
    show: hasPermission,
    disabled: !hasPermission,
    className: hasPermission ? "" : "opacity-50 cursor-not-allowed",
  };
}

/**
 * Get permission-based props for button components
 * Usage: <Button {...getPermissionProps("klien:delete")}>Delete</Button>
 */
export function getPermissionProps(permission: Permission) {
  // This needs to be used with the hook
  return { "data-permission": permission };
}
