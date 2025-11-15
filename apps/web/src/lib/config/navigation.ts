// ============================================================================
// FILE: lib/config/navigation.ts - FINAL VERSION
// ============================================================================
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

export const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Klien",
    href: "/dashboard/klien",
    icon: Users,
  },
  {
    title: "Perkara",
    href: "/dashboard/perkara",
    icon: Briefcase,
  },
  {
    title: "Tugas",
    href: "/dashboard/tugas",
    icon: CheckSquare,
  },
  {
    title: "Dokumen",
    href: "/dashboard/dokumen",
    icon: FileText,
  },
  {
    title: "Sidang",
    href: "/dashboard/sidang",
    icon: Calendar,
  },
  {
    title: "Konflik",
    href: "/dashboard/konflik",
    icon: AlertTriangle,
  },
  {
    title: "Tim",
    href: "/dashboard/tim",
    icon: UserCog,
  },
  {
    title: "Laporan",
    href: "/dashboard/laporan",
    icon: BarChart3,
  },
  {
    title: "Pengaturan",
    href: "/dashboard/pengaturan",
    icon: Settings,
  },
] as const;