// ============================================================================
// FILE: lib/config/rbac.ts - REFACTORED (NO ROLE-BASED RESTRICTIONS)
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

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

// ✅ SEMUA ROLE (KECUALI KLIEN) PUNYA NAVIGATION YANG SAMA
const DEFAULT_NAVIGATION: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Klien", href: "/dashboard/klien", icon: Users },
  { title: "Perkara", href: "/dashboard/perkara", icon: Briefcase },
  { title: "Tugas", href: "/dashboard/tugas", icon: CheckSquare },
  { title: "Dokumen", href: "/dashboard/dokumen", icon: FileText },
  { title: "Sidang", href: "/dashboard/sidang", icon: Calendar },
  { title: "Konflik", href: "/dashboard/konflik", icon: AlertTriangle },
  { title: "Tim", href: "/dashboard/tim", icon: UserCog },
  { title: "Laporan", href: "/dashboard/laporan", icon: BarChart3 },
  { title: "Pengaturan", href: "/dashboard/pengaturan", icon: Settings },
];

// ✅ KLIEN TIDAK PUNYA NAVIGATION (akan redirect ke 404)
export const ROLE_NAVIGATION: Record<UserRole, NavItem[]> = {
  [UserRole.ADMIN]: DEFAULT_NAVIGATION,
  [UserRole.ADVOKAT]: DEFAULT_NAVIGATION,
  [UserRole.PARALEGAL]: DEFAULT_NAVIGATION,
  [UserRole.STAFF]: DEFAULT_NAVIGATION,
  [UserRole.KLIEN]: [], // ❌ KLIEN tidak bisa akses dashboard
};

// ✅ GET NAVIGATION FOR ROLE
export function getNavigationForRole(userRole: UserRole): NavItem[] {
  return ROLE_NAVIGATION[userRole] || [];
}

// ✅ GET DEFAULT REDIRECT AFTER LOGIN
export function getDefaultRedirect(userRole: UserRole): string {
  // KLIEN → 404 (halaman belum ada)
  if (userRole === UserRole.KLIEN) {
    return '/404';
  }
  
  // OTHERS → DASHBOARD
  return '/dashboard';
}

// ✅ CHECK IF USER CAN ACCESS ROUTE (untuk backward compatibility)
export function canAccessRoute(userRole: UserRole, pathname: string): boolean {
  // KLIEN tidak bisa akses dashboard
  if (userRole === UserRole.KLIEN) {
    return false;
  }
  
  // Semua role lain bisa akses semua route
  return true;
}