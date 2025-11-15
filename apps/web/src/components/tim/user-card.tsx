// ============================================================================
// FILE: components/tim/user-card.tsx - FIXED ✅
// ============================================================================
"use client";

import { Mail, Phone, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { UserEntity } from "@/types";

interface UserCardProps {
  user: UserEntity;
  onClick: () => void;
  onSelect?: (checked: boolean) => void;
  isSelected?: boolean;
  showCheckbox?: boolean;
  isLoading?: boolean;
}

export function UserCard({
  user,
  onClick,
  onSelect,
  isSelected = false,
  showCheckbox = false,
  isLoading = false,
}: UserCardProps) {
  const initials =
    user.nama_lengkap
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || user.email[0].toUpperCase();

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(!isSelected);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-500 text-white",
      advokat: "bg-blue-500 text-white",
      paralegal: "bg-purple-500 text-white",
      staff: "bg-green-500 text-white",
      klien: "bg-gray-500 text-white",
    };
    return colors[role] || "";
  };

  const isInactive = !user.is_active;

  // ✅ Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-all ${
        isSelected ? "ring-2 ring-primary" : ""
      } ${isInactive ? "opacity-60" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {showCheckbox && (
            <div onClick={handleCheckboxChange} className="pt-1">
              <Checkbox checked={isSelected} />
            </div>
          )}
          
          <Avatar className="h-16 w-16 flex-shrink-0">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg truncate">
                {user.nama_lengkap || "User"}
              </h3>
              {isInactive && (
                <span title="User tidak aktif">
                  <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge
                variant={user.role === "klien" ? "outline" : "secondary"}
                className={`capitalize ${getRoleBadgeColor(user.role)}`}
              >
                {user.role}
              </Badge>
              {isInactive && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Inactive
                </Badge>
              )}
            </div>
            
            {user.jabatan && (
              <p className="text-sm text-muted-foreground mt-2 truncate">
                {user.jabatan}
              </p>
            )}
            
            <div className="space-y-1 mt-3">
              {user.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              )}
              {user.telepon && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span>{user.telepon}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ✅ Loading Grid for multiple cards
export function UserCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <UserCard
          key={i}
          user={{} as UserEntity}
          onClick={() => {}}
          isLoading={true}
        />
      ))}
    </div>
  );
}