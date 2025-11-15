// ============================================================================
// FILE: components/shared/user-avatar.tsx
// ============================================================================
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserBasic } from "@/types";

interface UserAvatarProps {
  user: UserBasic;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const initials = user.nama_lengkap
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user.email[0].toUpperCase();

  return (
    <Avatar className={className}>
      <AvatarImage src={user.avatar_url || undefined} alt={user.nama_lengkap || user.email} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}