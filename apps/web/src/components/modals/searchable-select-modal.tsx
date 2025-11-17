"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils/cn"

export interface SearchableSelectModalProps<T> {
  /**
   * Array of items to display
   */
  items: T[]

  /**
   * Control modal open state
   */
  open: boolean

  /**
   * Callback when modal open state changes
   */
  onOpenChange: (open: boolean) => void

  /**
   * Callback when item is selected
   */
  onSelect: (item: T) => void

  /**
   * Modal title
   */
  title: string

  /**
   * Optional modal description
   */
  description?: string

  /**
   * Search input placeholder
   */
  searchPlaceholder?: string

  /**
   * Message to show when no results found
   */
  emptyMessage?: string

  /**
   * Function to render each item
   */
  renderItem: (item: T) => React.ReactNode

  /**
   * Function to get unique ID from item
   */
  getItemId: (item: T) => string

  /**
   * Function to get searchable text from item
   */
  getItemSearchText: (item: T) => string

  /**
   * Optional loading state
   */
  loading?: boolean

  /**
   * Optional className for dialog content
   */
  className?: string

  /**
   * Optional footer content
   */
  footer?: React.ReactNode
}

/**
 * Reusable searchable modal for selecting items from a list
 *
 * Features:
 * - Real-time search/filter
 * - Smooth animations
 * - Keyboard navigation
 * - Generic/reusable with TypeScript
 * - Accessible via Radix UI
 *
 * @example
 * ```tsx
 * <SearchableSelectModal
 *   items={clients}
 *   open={open}
 *   onOpenChange={setOpen}
 *   onSelect={(client) => console.log(client)}
 *   title="Pilih Klien"
 *   searchPlaceholder="Cari klien..."
 *   emptyMessage="Tidak ada klien ditemukan"
 *   renderItem={(client) => <div>{client.nama}</div>}
 *   getItemId={(client) => client.id}
 *   getItemSearchText={(client) => `${client.nama} ${client.email}`}
 * />
 * ```
 */
export function SearchableSelectModal<T>({
  items,
  open,
  onOpenChange,
  onSelect,
  title,
  description,
  searchPlaceholder = "Cari...",
  emptyMessage = "Tidak ada data ditemukan",
  renderItem,
  getItemId,
  getItemSearchText,
  loading = false,
  className,
  footer,
}: SearchableSelectModalProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("")

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) return items

    const query = searchQuery.toLowerCase()
    return items.filter((item) =>
      getItemSearchText(item).toLowerCase().includes(query)
    )
  }, [items, searchQuery, getItemSearchText])

  // Reset search when modal closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("")
    }
  }, [open])

  const handleSelect = React.useCallback(
    (item: T) => {
      onSelect(item)
      onOpenChange(false)
    },
    [onSelect, onOpenChange]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-2xl gap-0 p-0 overflow-hidden",
          className
        )}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <Command className="border-t">
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-12"
          />
          <CommandList className="max-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Memuat data...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <CommandEmpty>
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      {emptyMessage}
                    </p>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {filteredItems.map((item) => (
                    <CommandItem
                      key={getItemId(item)}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer"
                    >
                      {renderItem(item)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>

        {footer && (
          <div className="border-t px-6 py-4 bg-muted/30">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
