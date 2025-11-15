// ============================================================================
// FILE: components/layouts/header.tsx - ✅ FIXED BREADCRUMB
// ============================================================================
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, Search, X, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Generate breadcrumb from pathname
  const segments = pathname.split("/").filter(Boolean);
  
  // ✅ FIXED: Show breadcrumb for all routes except auth pages
  const showBreadcrumb = segments.length > 0 && 
    segments[0] !== "login" && 
    segments[0] !== "register";

  // ✅ IMPROVED: Better breadcrumb generation
  const breadcrumbs = segments
    .map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      
      // ✅ Better label formatting
      let label = segment;
      
      // Handle special cases
      if (segment === "dashboard") {
        label = "Dashboard";
      } else if (segment === "klien") {
        label = "Klien";
      } else if (segment === "perkara") {
        label = "Perkara";
      } else if (segment === "tugas") {
        label = "Tugas";
      } else if (segment === "dokumen") {
        label = "Dokumen";
      } else if (segment === "sidang") {
        label = "Sidang";
      } else if (segment === "konflik") {
        label = "Konflik";
      } else if (segment === "tim") {
        label = "Tim";
      } else if (segment === "laporan") {
        label = "Laporan";
      } else if (segment === "pengaturan") {
        label = "Pengaturan";
      } else if (segment === "baru") {
        label = "Tambah Baru";
      } else if (segment === "edit") {
        label = "Edit";
      } else if (segment === "profile") {
        label = "Profil";
      } else if (segment === "upload") {
        label = "Upload";
      } else if (segment === "aktivitas") {
        label = "Aktivitas";
      } else {
        // Default: capitalize and replace hyphens
        label = segment
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
      }
      
      return { href, label, isLast: index === segments.length - 1 };
    });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <div className="flex flex-1 items-center gap-2 overflow-x-auto">
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Link 
            href="/dashboard" 
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          {showBreadcrumb && breadcrumbs.map((crumb) => (
            <div key={crumb.href} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1" />
              {crumb.isLast ? (
                <span className="font-medium text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link 
                  href={crumb.href} 
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {!searchOpen ? (
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2 h-9 px-3 text-sm text-muted-foreground"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span>Search...</span>
            <kbd className="pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              <Command className="h-3 w-3" />
              K
            </kbd>
          </Button>
        ) : (
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search everything..."
                className="w-[300px] pl-9 pr-4 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                onBlur={() => {
                  if (!searchQuery) setSearchOpen(false);
                }}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                setSearchQuery("");
                setSearchOpen(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search className="h-5 w-5" />
        </Button>

        <ThemeToggle />
      </div>

      {searchOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-b">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search everything..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchQuery("");
                setSearchOpen(false);
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </form>
        </div>
      )}
    </header>
  );
}