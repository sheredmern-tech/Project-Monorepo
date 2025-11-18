// ============================================================================
// FILE: components/form-fields/form-date-picker.tsx
// ============================================================================
// 🎯 REUSABLE DatePicker form field wrapper with:
// ✅ Automatic timezone-safe date parsing (parseDateLocal)
// ✅ Consistent error display
// ✅ Consistent styling & behavior
// ✅ Required field indicator
// ✅ DRY principle - single source of truth
// ============================================================================
"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { parseDateLocal, formatDateLocal } from "@/lib/utils/date";
import type { FieldError, UseFormSetValue, UseFormWatch } from "react-hook-form";

interface FormDatePickerProps<T extends Record<string, any>> {
  name: keyof T & string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  error?: FieldError;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function FormDatePicker<T extends Record<string, any>>({
  name,
  label,
  required = false,
  disabled = false,
  placeholder,
  watch,
  setValue,
  error,
  minDate,
  maxDate,
  className,
}: FormDatePickerProps<T>) {
  // ✅ FIX RACE CONDITION: Watch field value with defensive check
  const fieldValue = watch(name as any);

  // ✅ Handle undefined, null, and non-string values safely
  const dateValue = (fieldValue != null && typeof fieldValue === "string") ? fieldValue : "";

  // ✅ Parse date safely (returns undefined if invalid)
  const parsedDate = dateValue ? parseDateLocal(dateValue) : undefined;

  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <DatePicker
        id={name}
        disabled={disabled}
        date={parsedDate}
        onDateChange={(date) => {
          if (date) {
            // Convert to YYYY-MM-DD format in LOCAL timezone (not UTC)
            const formattedDate = formatDateLocal(date);
            setValue(name as any, formattedDate as any);
          } else {
            // Clear the field
            setValue(name as any, "" as any);
          }
        }}
        placeholder={placeholder || `Pilih ${label.toLowerCase()}`}
        minDate={minDate}
        maxDate={maxDate}
      />
      {error && <p className="text-sm text-red-500 mt-2">{error.message}</p>}
    </div>
  );
}
