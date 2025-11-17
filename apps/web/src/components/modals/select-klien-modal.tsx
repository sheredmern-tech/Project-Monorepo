"use client"

import * as React from "react"
import { UserIcon, MailIcon, PhoneIcon } from "lucide-react"
import { SearchableSelectModal } from "./searchable-select-modal"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useKlien } from "@/lib/hooks/use-klien"
import { KlienBasic } from "@/types/entities/klien"
import { cn } from "@/lib/utils/cn"

export interface SelectKlienModalProps {
  /**
   * Control modal open state
   */
  open: boolean

  /**
   * Callback when modal open state changes
   */
  onOpenChange: (open: boolean) => void

  /**
   * Callback when klien is selected
   */
  onSelect: (klien: KlienBasic) => void

  /**
   * Optional custom title
   */
  title?: string

  /**
   * Optional custom description
   */
  description?: string

  /**
   * Optional list of klien to display (if not provided, will fetch from API)
   */
  klienList?: KlienBasic[]
}

/**
 * Modal untuk memilih klien dengan search functionality
 *
 * Features:
 * - Auto-fetch klien data from API
 * - Real-time search by nama, email, telepon
 * - Display avatar, nama, email, telepon, jenis_klien
 * - Smooth animations and hover effects
 * - Fully accessible
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false)
 *
 * <SelectKlienModal
 *   open={open}
 *   onOpenChange={setOpen}
 *   onSelect={(klien) => {
 *     console.log("Selected:", klien)
 *   }}
 * />
 * ```
 */
export function SelectKlienModal({
  open,
  onOpenChange,
  onSelect,
  title = "Pilih Klien",
  description = "Pilih klien dari daftar di bawah ini",
  klienList,
}: SelectKlienModalProps) {
  const { klien, isLoading, fetchKlien } = useKlien()
  const [hasAttemptedFetch, setHasAttemptedFetch] = React.useState(false)

  // Fetch klien when modal opens (if not provided)
  React.useEffect(() => {
    if (open && !klienList && !hasAttemptedFetch) {
      setHasAttemptedFetch(true)
      fetchKlien()
    }

    // Reset flag when modal closes
    if (!open) {
      setHasAttemptedFetch(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, klienList])

  const items = klienList || klien

  // Get initials for avatar fallback
  const getInitials = (nama: string) => {
    return nama
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Get badge variant based on jenis_klien
  const getJenisKlienVariant = (jenisKlien: string) => {
    switch (jenisKlien.toLowerCase()) {
      case "individu":
        return "default"
      case "perusahaan":
        return "secondary"
      case "organisasi":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <SearchableSelectModal<KlienBasic>
      items={items}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      title={title}
      description={description}
      searchPlaceholder="Cari klien berdasarkan nama, email, atau telepon..."
      emptyMessage="Tidak ada klien ditemukan"
      loading={isLoading && items.length === 0}
      getItemId={(klien) => klien.id}
      getItemSearchText={(klien) =>
        `${klien.nama} ${klien.email || ""} ${klien.telepon || ""} ${klien.jenis_klien}`
      }
      renderItem={(klien) => (
        <div className="flex items-center gap-3 py-1 w-full">
          {/* Avatar */}
          <Avatar className="size-10 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(klien.nama)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Nama + Badge */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm truncate">
                {klien.nama}
              </span>
              <Badge
                variant={getJenisKlienVariant(klien.jenis_klien)}
                className="shrink-0 text-xs"
              >
                {klien.jenis_klien}
              </Badge>
            </div>

            {/* Email + Telepon */}
            <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
              {klien.email && (
                <div className="flex items-center gap-1.5">
                  <MailIcon className="size-3 shrink-0" />
                  <span className="truncate">{klien.email}</span>
                </div>
              )}
              {klien.telepon && (
                <div className="flex items-center gap-1.5">
                  <PhoneIcon className="size-3 shrink-0" />
                  <span>{klien.telepon}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      footer={
        <div className="text-xs text-muted-foreground">
          Menampilkan {items.length} klien
        </div>
      }
    />
  )
}

/**
 * Hook untuk manage SelectKlienModal state
 *
 * @example
 * ```tsx
 * const { open, setOpen, handleSelect } = useSelectKlienModal({
 *   onSelect: (klien) => console.log(klien)
 * })
 *
 * return (
 *   <>
 *     <Button onClick={() => setOpen(true)}>Pilih Klien</Button>
 *     <SelectKlienModal
 *       open={open}
 *       onOpenChange={setOpen}
 *       onSelect={handleSelect}
 *     />
 *   </>
 * )
 * ```
 */
export function useSelectKlienModal({
  onSelect,
}: {
  onSelect: (klien: KlienBasic) => void
}) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = React.useCallback(
    (klien: KlienBasic) => {
      onSelect(klien)
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
