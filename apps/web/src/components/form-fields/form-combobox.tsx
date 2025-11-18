// ============================================================================
// FILE: components/form-fields/form-combobox.tsx
// ============================================================================
// 🎯 REUSABLE Combobox form field wrapper (autocomplete/searchable select)
// ============================================================================
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";
import type { FieldError, UseFormSetValue, UseFormWatch } from "react-hook-form";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface FormComboboxProps<T extends Record<string, any>> {
  name: keyof T & string;
  label: string;
  options: ComboboxOption[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  error?: FieldError;
  className?: string;
}

export function FormCombobox<T extends Record<string, any>>({
  name,
  label,
  options,
  required = false,
  disabled = false,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Cari...",
  emptyText = "Tidak ada data.",
  watch,
  setValue,
  error,
  className,
}: FormComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const fieldValue = watch(name as any);
  const selectedValue = String(fieldValue || "");

  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={name}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              !selectedValue && "text-muted-foreground"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      setValue(
                        name as any,
                        (currentValue === selectedValue ? "" : currentValue) as any
                      );
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500 mt-2">{error.message}</p>}
    </div>
  );
}
