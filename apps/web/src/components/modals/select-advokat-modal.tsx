"use client"

import * as React from "react"
import { UserIcon, MailIcon, BriefcaseIcon } from "lucide-react"
import { SearchableSelectModal } from "./searchable-select-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { timApi } from "@/lib/api/tim.api"
import { tugasApi } from "@/lib/api/tugas.api"
import { UserBasic } from "@/types/entities/user"
import { UserRole } from "@/types/enums"
import { cn } from "@/lib/utils/cn"

export interface SelectAdvokatModalProps {
  /**
   * Control modal open state
   */
  open: boolean

  /**
   * Callback when modal open state changes
   */
  onOpenChange: (open: boolean) => void

  /**
   * Callback when user is selected
   */
  onSelect: (user: UserBasic) => void

  /**
   * Optional custom title
   */
  title?: string

  /**
   * Optional custom description
   */
  description?: string

  /**
   * Optional filter by role (default: only show ADVOKAT)
   */
  roleFilter?: UserRole | "all"

  /**
   * Optional list of users to display (if not provided, will fetch from API)
   */
  userList?: UserBasic[]

  /**
   * Use role-based assignable users from tugas API (recommended for task assignment)
   * This respects role hierarchy: ADVOKAT can only assign to STAFF, PARALEGAL, other ADVOKAT
   */
  useAssignableUsers?: boolean
}

/**
 * Modal untuk memilih advokat/user dengan search functionality
 *
 * Features:
 * - Auto-fetch users from API
 * - Real-time search by nama, email
 * - Display avatar, nama, email, role
 * - Filter by role (default: ADVOKAT only)
 * - Smooth animations and hover effects
 * - Fully accessible
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false)
 *
 * <SelectAdvokatModal
 *   open={open}
 *   onOpenChange={setOpen}
 *   onSelect={(user) => {
 *     console.log("Selected:", user)
 *   }}
 * />
 * ```
 */
export function SelectAdvokatModal({
  open,
  onOpenChange,
  onSelect,
  title = "Pilih Advokat",
  description = "Pilih advokat dari daftar di bawah ini",
  roleFilter = UserRole.ADVOKAT,
  userList,
  useAssignableUsers = false,
}: SelectAdvokatModalProps) {
  const [users, setUsers] = React.useState<UserBasic[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  // Fetch users when modal opens (if not provided)
  React.useEffect(() => {
    if (open && !userList) {
      fetchUsers()
    }
  }, [open, userList, useAssignableUsers])

  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true)

      // ✅ FIX: Use tugas API for role-based assignable users
      if (useAssignableUsers) {
        const response = await tugasApi.getAssignableUsers()
        // Response is already in UserBasic format
        const basicUsers: UserBasic[] = response.map((user) => ({
          id: user.id,
          email: user.email,
          nama_lengkap: user.nama_lengkap,
          role: user.role as UserRole,
          avatar_url: user.avatar_url,
        }))
        setUsers(basicUsers)
      } else {
        // Original behavior: use tim API
        const response = await timApi.getAllUsers({
          role: roleFilter === "all" ? undefined : roleFilter,
          limit: 1000, // Get all users
        })
        // Map to UserBasic
        const basicUsers: UserBasic[] = response.data.map((user) => ({
          id: user.id,
          email: user.email,
          nama_lengkap: user.nama_lengkap,
          role: user.role,
          avatar_url: user.avatar_url,
        }))
        setUsers(basicUsers)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [roleFilter, useAssignableUsers])

  const items = userList || users

  // Get initials for avatar fallback
  const getInitials = (nama: string | null) => {
    if (!nama) return "?"
    return nama
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Get badge variant based on role
  const getRoleVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADVOKAT:
        return "default"
      case UserRole.ADMIN:
        return "destructive"
      case UserRole.PARTNER:
        return "secondary"
      case UserRole.KLIEN:
        return "outline"
      default:
        return "default"
    }
  }

  // Get role display text
  const getRoleText = (role: UserRole) => {
    switch (role) {
      case UserRole.ADVOKAT:
        return "Advokat"
      case UserRole.ADMIN:
        return "Admin"
      case UserRole.PARTNER:
        return "Partner"
      case UserRole.KLIEN:
        return "Klien"
      default:
        return role
    }
  }

  return (
    <SearchableSelectModal<UserBasic>
      items={items}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      title={title}
      description={description}
      searchPlaceholder="Cari advokat berdasarkan nama atau email..."
      emptyMessage="Tidak ada advokat ditemukan"
      loading={isLoading && items.length === 0}
      getItemId={(user) => user.id}
      getItemSearchText={(user) =>
        `${user.nama_lengkap || ""} ${user.email} ${user.role}`
      }
      renderItem={(user) => (
        <div className="flex items-center gap-3 py-1 w-full">
          {/* Avatar */}
          <Avatar className="size-10 shrink-0">
            {user.avatar_url && (
              <AvatarImage src={user.avatar_url} alt={user.nama_lengkap || ""} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(user.nama_lengkap)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Nama + Badge */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm truncate">
                {user.nama_lengkap || "Nama tidak tersedia"}
              </span>
              <Badge
                variant={getRoleVariant(user.role)}
                className="shrink-0 text-xs"
              >
                {getRoleText(user.role)}
              </Badge>
            </div>

            {/* Email */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MailIcon className="size-3 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>
      )}
      footer={
        <div className="text-xs text-muted-foreground">
          Menampilkan {items.length} {roleFilter === "all" ? "user" : "advokat"}
        </div>
      }
    />
  )
}

/**
 * Hook untuk manage SelectAdvokatModal state
 *
 * @example
 * ```tsx
 * const { open, setOpen, handleSelect } = useSelectAdvokatModal({
 *   onSelect: (user) => console.log(user)
 * })
 *
 * return (
 *   <>
 *     <Button onClick={() => setOpen(true)}>Assign Advokat</Button>
 *     <SelectAdvokatModal
 *       open={open}
 *       onOpenChange={setOpen}
 *       onSelect={handleSelect}
 *     />
 *   </>
 * )
 * ```
 */
export function useSelectAdvokatModal({
  onSelect,
}: {
  onSelect: (user: UserBasic) => void
}) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = React.useCallback(
    (user: UserBasic) => {
      onSelect(user)
      setOpen(false)
    },
    [onSelect]
  )

  return {
    open,
    setOpen,
    handleSelect,
  }
}
