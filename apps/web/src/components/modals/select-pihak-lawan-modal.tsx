"use client"

import * as React from "react"
import { UserIcon, MailIcon, PhoneIcon, AlertTriangleIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react"
import { SearchableSelectModal } from "./searchable-select-modal"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useKlien } from "@/lib/hooks/use-klien"
import { KlienBasic } from "@/types/entities/klien"
import { cn } from "@/lib/utils/cn"

export interface SelectPihakLawanModalProps {
  /**
   * Control modal open state
   */
  open: boolean

  /**
   * Callback when modal open state changes
   */
  onOpenChange: (open: boolean) => void

  /**
   * Callback when potential conflict is detected (pihak lawan = existing client)
   */
  onConflictDetected: (klien: KlienBasic) => void

  /**
   * Callback when user confirms "bukan klien yang sama"
   */
  onNoConflict: () => void

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
 * Modal untuk cek pihak lawan vs database klien
 *
 * Features:
 * - Auto-fetch klien data from API
 * - Real-time search by nama, email, telepon
 * - CRITICAL: Auto-detect if pihak lawan = existing client (MAJOR CONFLICT!)
 * - Display warning alert for potential conflicts
 * - Allow user to confirm or reject match
 * - Fully accessible
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false)
 *
 * <SelectPihakLawanModal
 *   open={open}
 *   onOpenChange={setOpen}
 *   onConflictDetected={(klien) => {
 *     console.log("CONFLICT DETECTED:", klien)
 *     setAdaKonflik(true)
 *     setDetailKonflik(`Pihak lawan adalah klien kami: ${klien.nama}`)
 *   }}
 *   onNoConflict={() => {
 *     console.log("No conflict - different person")
 *   }}
 * />
 * ```
 */
export function SelectPihakLawanModal({
  open,
  onOpenChange,
  onConflictDetected,
  onNoConflict,
  title = "Cek Pihak Lawan di Database",
  description = "Periksa apakah pihak lawan adalah klien yang ada di database",
  klienList,
}: SelectPihakLawanModalProps) {
  const { klien, isLoading, fetchKlien } = useKlien()

  // Fetch klien when modal opens (if not provided)
  React.useEffect(() => {
    if (open && !klienList && klien.length === 0) {
      fetchKlien()
    }
  }, [open, klienList, klien.length, fetchKlien])

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

  // Handle selection with conflict detection
  const handleSelect = React.useCallback(
    (klien: KlienBasic) => {
      onConflictDetected(klien)
      onOpenChange(false)
    },
    [onConflictDetected, onOpenChange]
  )

  // Handle "bukan klien yang sama"
  const handleNoConflict = React.useCallback(() => {
    onNoConflict()
    onOpenChange(false)
  }, [onNoConflict, onOpenChange])

  return (
    <SearchableSelectModal<KlienBasic>
      items={items}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={handleSelect}
      title={title}
      description={description}
      searchPlaceholder="Cari berdasarkan nama, email, atau telepon pihak lawan..."
      emptyMessage="Tidak ada kecocokan ditemukan - pihak lawan bukan klien kami"
      loading={isLoading && items.length === 0}
      getItemId={(klien) => klien.id}
      getItemSearchText={(klien) =>
        `${klien.nama} ${klien.email || ""} ${klien.telepon || ""} ${klien.jenis_klien}`
      }
      renderItem={(klien) => (
        <div className="w-full">
          {/* Warning Alert */}
          <Alert variant="destructive" className="mb-3">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle className="text-sm font-semibold">
              PERINGATAN: Potensi Konflik Kepentingan!
            </AlertTitle>
            <AlertDescription className="text-xs">
              Klien ini ada di database. Jika ini adalah pihak lawan, maka ada konflik kepentingan.
            </AlertDescription>
          </Alert>

          {/* Klien Info */}
          <div className="flex items-center gap-3 py-1 w-full">
            {/* Avatar */}
            <Avatar className="size-10 shrink-0">
              <AvatarFallback className="bg-destructive/10 text-destructive font-medium">
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

          {/* Action hint */}
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            Klik untuk konfirmasi bahwa ini adalah pihak lawan yang sama
          </div>
        </div>
      )}
      footer={
        <div className="space-y-3">
          {/* Info */}
          <div className="text-xs text-muted-foreground">
            {items.length > 0 ? (
              <>
                Ditemukan {items.length} kecocokan potensial di database klien
              </>
            ) : (
              <>
                Tidak ada kecocokan - pihak lawan tidak ditemukan di database
              </>
            )}
          </div>

          {/* No Conflict Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleNoConflict}
          >
            <XCircleIcon className="mr-2 h-4 w-4" />
            Bukan Klien yang Sama / Tidak Ada Kecocokan
          </Button>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Petunjuk:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-1">
              <li>Klik item di atas jika BENAR pihak lawan = klien kami (KONFLIK!)</li>
              <li>Klik tombol di atas jika BEDA orang/entity (tidak ada konflik)</li>
            </ul>
          </div>
        </div>
      }
    />
  )
}

/**
 * Hook untuk manage SelectPihakLawanModal state
 *
 * @example
 * ```tsx
 * const { open, setOpen, handleConflict, handleNoConflict } = useSelectPihakLawanModal({
 *   onConflictDetected: (klien) => {
 *     console.log("CONFLICT:", klien)
 *     setValue("ada_konflik", true)
 *     setValue("detail_konflik", `Pihak lawan adalah klien: ${klien.nama}`)
 *   },
 *   onNoConflict: () => {
 *     console.log("No conflict")
 *   }
 * })
 *
 * return (
 *   <>
 *     <Button onClick={() => setOpen(true)}>Cek Pihak Lawan</Button>
 *     <SelectPihakLawanModal
 *       open={open}
 *       onOpenChange={setOpen}
 *       onConflictDetected={handleConflict}
 *       onNoConflict={handleNoConflict}
 *     />
 *   </>
 * )
 * ```
 */
export function useSelectPihakLawanModal({
  onConflictDetected,
  onNoConflict,
}: {
  onConflictDetected: (klien: KlienBasic) => void
  onNoConflict: () => void
}) {
  const [open, setOpen] = React.useState(false)

  const handleConflict = React.useCallback(
    (klien: KlienBasic) => {
      onConflictDetected(klien)
      setOpen(false)
    },
    [onConflictDetected]
  )

  const handleNoConflict = React.useCallback(() => {
    onNoConflict()
    setOpen(false)
  }, [onNoConflict])

  return {
    open,
    setOpen,
    handleConflict,
    handleNoConflict,
  }
}
