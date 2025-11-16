// ============================================================================
// FILE: lib/config/rbac.ts - GRANULAR PERMISSION-BASED NAVIGATION
// ============================================================================
import { UserRole } from "@/types/enums";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  FileText,
  Calendar,
  AlertTriangle,
  UserCog,
  BarChart3,
  Settings,
} from "lucide-react";
import { Resource, canAccessResource } from "./permissions";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  requiredResource?: Resource; // Permission required to see this nav item
}

// ============================================================================
// COMPLETE NAVIGATION ITEMS (with permission requirements)
// ============================================================================

const ALL_NAVIGATION: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Klien",
    href: "/dashboard/klien",
    icon: Users,
    requiredResource: Resource.KLIEN
  },
  {
    title: "Perkara",
    href: "/dashboard/perkara",
    icon: Briefcase,
    requiredResource: Resource.PERKARA
  },
  {
    title: "Tugas",
    href: "/dashboard/tugas",
    icon: CheckSquare,
    requiredResource: Resource.TUGAS
  },
  {
    title: "Dokumen",
    href: "/dashboard/dokumen",
    icon: FileText,
    requiredResource: Resource.DOKUMEN
  },
  {
    title: "Sidang",
    href: "/dashboard/sidang",
    icon: Calendar,
    requiredResource: Resource.SIDANG
  },
  {
    title: "Konflik",
    href: "/dashboard/konflik",
    icon: AlertTriangle,
    requiredResource: Resource.KONFLIK
  },
  {
    title: "Tim",
    href: "/dashboard/tim",
    icon: UserCog,
    requiredResource: Resource.TIM
  },
  {
    title: "Laporan",
    href: "/dashboard/laporan",
    icon: BarChart3,
    requiredResource: Resource.LAPORAN
  },
  {
    title: "Pengaturan",
    href: "/dashboard/pengaturan",
    icon: Settings,
    requiredResource: Resource.PENGATURAN
  },
];

// ============================================================================
// PERMISSION-BASED NAVIGATION FILTERING
// ============================================================================

/**
 * Get navigation items filtered by user's permissions
 * This replaces the static ROLE_NAVIGATION mapping
 */
export function getNavigationForRole(userRole: UserRole): NavItem[] {
  // NOTE: KLIEN role removed - this is an INTERNAL admin system only
  // KLIEN users cannot access the web admin dashboard

  // Filter navigation based on resource access permissions
  return ALL_NAVIGATION.filter((item) => {
    // Always show dashboard
    if (!item.requiredResource) {
      return true;
    }

    // Check if user has permission to access this resource
    return canAccessResource(userRole, item.requiredResource);
  });
}

// ============================================================================
// ROLE-BASED NAVIGATION (backwards compatibility - now permission-filtered)
// ============================================================================

export const ROLE_NAVIGATION: Record<UserRole, NavItem[]> = {
  [UserRole.ADMIN]: getNavigationForRole(UserRole.ADMIN),
  [UserRole.ADVOKAT]: getNavigationForRole(UserRole.ADVOKAT),
  [UserRole.PARALEGAL]: getNavigationForRole(UserRole.PARALEGAL),
  [UserRole.STAFF]: getNavigationForRole(UserRole.STAFF),
  [UserRole.KLIEN]: [], // KLIEN cannot access admin dashboard
};

// ============================================================================
// REDIRECT HELPERS
// ============================================================================

/**
 * Get default redirect after login based on role
 */
export function getDefaultRedirect(userRole: UserRole): string {
  // All roles → DASHBOARD (will show filtered view based on role)
  return '/dashboard';
}

// ============================================================================
// ROUTE ACCESS CHECKING
// ============================================================================

/**
 * Check if user can access a specific route
 * This is a simplified version - detailed checks should use permission system
 */
export function canAccessRoute(userRole: UserRole, pathname: string): boolean {
  // KLIEN cannot access any admin routes
  if (userRole === UserRole.KLIEN) {
    return false;
  }

  // For other roles, check navigation items
  const allowedPaths = getNavigationForRole(userRole).map(item => item.href);

  // Check if pathname matches any allowed navigation path
  return allowedPaths.some(path => pathname.startsWith(path)) ||
         pathname === '/dashboard'; // Always allow dashboard home
}

/**
 * Get route resource mapping for permission checking
 */
export function getRouteResource(pathname: string): Resource | null {
  if (pathname.includes('/klien')) return Resource.KLIEN;
  if (pathname.includes('/perkara')) return Resource.PERKARA;
  if (pathname.includes('/tugas')) return Resource.TUGAS;
  if (pathname.includes('/dokumen')) return Resource.DOKUMEN;
  if (pathname.includes('/sidang')) return Resource.SIDANG;
  if (pathname.includes('/konflik')) return Resource.KONFLIK;
  if (pathname.includes('/tim')) return Resource.TIM;
  if (pathname.includes('/laporan')) return Resource.LAPORAN;
  if (pathname.includes('/pengaturan')) return Resource.PENGATURAN;
  return null;
}