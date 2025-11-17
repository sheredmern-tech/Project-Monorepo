"use client"

import * as React from "react"
import { FileTextIcon, ScaleIcon, AlertCircleIcon } from "lucide-react"
import { SearchableSelectModal } from "./searchable-select-modal"
import { Badge } from "@/components/ui/badge"
import { PerkaraBasic } from "@/types/entities/perkara"
import { JenisPerkara, StatusPerkara } from "@/types/enums"
import { cn } from "@/lib/utils/cn"

export interface SelectPerkaraModalProps {
  /**
   * Control modal open state
   */
  open: boolean

  /**
   * Callback when modal open state changes
   */
  onOpenChange: (open: boolean) => void

  /**
   * Callback when perkara is selected
   */
  onSelect: (perkara: PerkaraBasic) => void

  /**
   * Optional custom title
   */
  title?: string

  /**
   * Optional custom description
   */
  description?: string

  /**
   * List of perkara to display
   */
  perkaraList: PerkaraBasic[]

  /**
   * Optional loading state
   */
  loading?: boolean
}

/**
 * Modal untuk memilih perkara dengan search functionality
 *
 * Features:
 * - Real-time search by nomor_perkara, judul, jenis_perkara
 * - Display nomor, judul, jenis, status with icons
 * - Color-coded status badges
 * - Smooth animations and hover effects
 * - Fully accessible
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false)
 *
 * <SelectPerkaraModal
 *   open={open}
 *   onOpenChange={setOpen}
 *   perkaraList={perkara}
 *   onSelect={(perkara) => {
 *     console.log("Selected:", perkara)
 *   }}
 * />
 * ```
 */
export function SelectPerkaraModal({
  open,
  onOpenChange,
  onSelect,
  title = "Pilih Perkara",
  description = "Pilih perkara untuk pemeriksaan konflik kepentingan",
  perkaraList,
  loading = false,
}: SelectPerkaraModalProps) {
  // Get badge variant based on status
  const getStatusVariant = (status: StatusPerkara) => {
    switch (status) {
      case "aktif":
        return "default"
      case "selesai":
        return "secondary"
      case "pending":
        return "outline"
      case "arsip":
        return "destructive"
      default:
        return "default"
    }
  }

  // Get jenis perkara display text
  const getJenisPerkaraText = (jenis: JenisPerkara) => {
    const jenisMap: Record<JenisPerkara, string> = {
      pidana: "Pidana",
      perdata: "Perdata",
      keluarga: "Keluarga",
      perusahaan: "Perusahaan",
      pertanahan: "Pertanahan",
      hki: "HKI",
      ketenagakerjaan: "Ketenagakerjaan",
      pajak: "Pajak",
      tata_usaha_negara: "TUN",
      niaga: "Niaga",
      lainnya: "Lainnya",
    }
    return jenisMap[jenis] || jenis
  }

  // Get status display text with proper capitalization
  const getStatusText = (status: StatusPerkara) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date)
    } catch {
      return "-"
    }
  }

  return (
    <SearchableSelectModal<PerkaraBasic>
      items={perkaraList}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      title={title}
      description={description}
      searchPlaceholder="Cari perkara berdasarkan nomor, judul, atau jenis..."
      emptyMessage="Tidak ada perkara ditemukan"
      loading={loading}
      getItemId={(perkara) => perkara.id}
      getItemSearchText={(perkara) =>
        `${perkara.nomor_perkara} ${perkara.judul} ${perkara.jenis_perkara}`
      }
      renderItem={(perkara) => (
        <div className="flex items-start gap-3 py-2 w-full">
          {/* Icon */}
          <div className="shrink-0 mt-0.5">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ScaleIcon className="size-4 text-primary" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Nomor Perkara */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-semibold text-sm text-primary">
                {perkara.nomor_perkara}
              </span>
              <Badge
                variant={getStatusVariant(perkara.status)}
                className="shrink-0 text-xs"
              >
                {getStatusText(perkara.status)}
              </Badge>
            </div>

            {/* Judul */}
            <div className="mb-1.5">
              <span className="text-sm font-medium line-clamp-1">
                {perkara.judul}
              </span>
            </div>

            {/* Jenis + Created Date */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <FileTextIcon className="size-3 shrink-0" />
                <span>{getJenisPerkaraText(perkara.jenis_perkara)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertCircleIcon className="size-3 shrink-0" />
                <span>Dibuat {formatDate(perkara.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      footer={
        <div className="text-xs text-muted-foreground">
          Menampilkan {perkaraList.length} perkara
        </div>
      }
    />
  )
}

/**
 * Hook untuk manage SelectPerkaraModal state
 *
 * @example
 * ```tsx
 * const { open, setOpen, handleSelect } = useSelectPerkaraModal({
 *   onSelect: (perkara) => console.log(perkara)
 * })
 *
 * return (
 *   <>
 *     <Button onClick={() => setOpen(true)}>Pilih Perkara</Button>
 *     <SelectPerkaraModal
 *       open={open}
 *       onOpenChange={setOpen}
 *       perkaraList={perkaraList}
 *       onSelect={handleSelect}
 *     />
 *   </>
 * )
 * ```
 */
export function useSelectPerkaraModal({
  onSelect,
}: {
  onSelect: (perkara: PerkaraBasic) => void
}) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = React.useCallback(
    (perkara: PerkaraBasic) => {
      onSelect(perkara)
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
