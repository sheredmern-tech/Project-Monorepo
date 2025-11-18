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
  // Cast name to any for watch() to avoid Path<T> type issues
  const fieldValue = watch(name as any);
  const dateValue = typeof fieldValue === "string" ? fieldValue : "";

  console.log("🔍 FormDatePicker RENDER - Field:", name);
  console.log("🔍 FormDatePicker RENDER - fieldValue:", fieldValue);
  console.log("🔍 FormDatePicker RENDER - dateValue:", dateValue);
  console.log("🔍 FormDatePicker RENDER - parseDateLocal result:", parseDateLocal(dateValue || ""));

  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <DatePicker
        disabled={disabled}
        date={parseDateLocal(dateValue || "")}
        onDateChange={(date) => {
          console.log("🔄 FormDatePicker: onDateChange called for field:", name);
          console.log("🔄 FormDatePicker: date received:", date);

          if (date) {
            const formattedDate = formatDateLocal(date);
            console.log("✅ FormDatePicker: Formatted date:", formattedDate);
            console.log("✅ FormDatePicker: Calling setValue for:", name);

            // Convert to YYYY-MM-DD format in LOCAL timezone (not UTC)
            setValue(name as any, formattedDate as any, { shouldValidate: true, shouldDirty: true });

            console.log("✅ FormDatePicker: setValue called successfully");

            // Check if value was set
            setTimeout(() => {
              const newValue = watch(name as any);
              console.log("🔍 FormDatePicker: Value after setValue:", newValue);
            }, 100);
          } else {
            console.log("⚠️ FormDatePicker: No date, clearing field");
            setValue(name as any, "" as any, { shouldValidate: true, shouldDirty: true });
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
