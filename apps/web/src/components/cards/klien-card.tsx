// ============================================================================
// FILE: components/cards/klien-card.tsx
// ============================================================================
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KlienWithCount } from "@/types";
import { formatDate } from "@/lib/utils/format";
import { Eye, Mail, Phone, MapPin, Building2, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KlienCardProps {
  klien: KlienWithCount;
}

// Helper component for rendering jenis icon
interface JenisIconDisplayProps {
  jenisKlien: string;
  className?: string;
}

const JenisIconDisplay = ({ jenisKlien, className }: JenisIconDisplayProps) => {
  const getJenisIcon = (jenis: string): LucideIcon => {
    switch (jenis) {
      case "perusahaan":
        return Building2;
      case "instansi":
        return Building2;
      default:
        return User;
    }
  };

  const IconComponent = getJenisIcon(jenisKlien) as LucideIcon;
  return <IconComponent className={className} />;
};

export function KlienCard({ klien }: KlienCardProps) {
  const router = useRouter();

  const getInitials = (nama: string) => {
    return nama
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card 
      className="hover:shadow-md transition-all cursor-pointer group" 
      onClick={() => router.push(`/dashboard/klien/${klien.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Avatar/Initial */}
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-lg font-semibold text-primary">
                {getInitials(klien.nama)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{klien.nama}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="capitalize text-xs">
                  <JenisIconDisplay 
                    jenisKlien={klien.jenis_klien} 
                    className="mr-1 h-3 w-3" 
                  />
                  {klien.jenis_klien}
                </Badge>
                {klien._count.perkara > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {klien._count.perkara} Perkara
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/klien/${klien.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Contact Info */}
        <div className="space-y-2">
          {klien.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{klien.email}</span>
            </div>
          )}

          {klien.telepon && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{klien.telepon}</span>
            </div>
          )}

          {(klien.kota || klien.provinsi) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">
                {[klien.kota, klien.provinsi].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Company Info (if applicable) */}
        {klien.jenis_klien === "perusahaan" && klien.nama_perusahaan && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">Perusahaan</p>
            <p className="text-sm font-medium truncate">{klien.nama_perusahaan}</p>
            {klien.bentuk_badan_usaha && (
              <p className="text-xs text-muted-foreground">
                {klien.bentuk_badan_usaha}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Terdaftar {formatDate(klien.created_at)}
          </span>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/klien/${klien.id}/edit`);
              }}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/klien/${klien.id}`);
              }}
            >
              Detail
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}